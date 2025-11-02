// services/cursosService.js
const { Curso, Inscripcion, BaseUser } = require('../models');

/**
 * Obtener curso por ID con información completa
 */
exports.getCursoById = async (cursoId) => {
  const curso = await Curso.findById(cursoId)
    .populate('profesor', 'firstName lastName email phone')
    .populate('estudiantes', 'firstName lastName email');
  
  if (!curso) {
    throw new Error('Curso no encontrado');
  }
  
  return curso;
};

/**
 * Crear nuevo curso
 */
exports.createCurso = async (cursoData) => {
  // Verificar que el profesor existe y es profesor
  const profesor = await BaseUser.findById(cursoData.profesor);
  if (!profesor) {
    throw new Error('Profesor no encontrado');
  }
  
  if (profesor.role !== 'profesor') {
    throw new Error('El usuario especificado no es un profesor');
  }
  
  // Crear el curso
  const curso = await Curso.create(cursoData);
  
  // Retornar con populate
  return await this.getCursoById(curso._id);
};

/**
 * Actualizar curso
 */
exports.updateCurso = async (cursoId, updateData) => {
  const curso = await Curso.findById(cursoId);
  
  if (!curso) {
    throw new Error('Curso no encontrado');
  }
  
  // No permitir cambiar el profesor si ya tiene estudiantes inscritos
  if (updateData.profesor && curso.estudiantes.length > 0) {
    throw new Error('No se puede cambiar el profesor de un curso con estudiantes inscritos');
  }
  
  // Actualizar campos
  Object.assign(curso, updateData);
  await curso.save();
  
  return await this.getCursoById(curso._id);
};

/**
 * Eliminar curso (soft delete)
 */
exports.deleteCurso = async (cursoId) => {
  const curso = await Curso.findById(cursoId);
  
  if (!curso) {
    throw new Error('Curso no encontrado');
  }
  
  // Verificar que no tenga inscripciones activas
  const inscripcionesActivas = await Inscripcion.countDocuments({
    curso: cursoId,
    estado: { $in: ['pendiente', 'confirmada'] }
  });
  
  if (inscripcionesActivas > 0) {
    throw new Error('No se puede eliminar un curso con inscripciones activas');
  }
  
  // Cambiar estado a cancelado
  curso.estado = 'cancelado';
  await curso.save();
  
  return curso;
};

/**
 * Listar cursos con filtros y paginación
 */
exports.listarCursos = async (filtros = {}, paginacion = {}) => {
  const { page = 1, limit = 10 } = paginacion;
  const skip = (page - 1) * limit;
  
  // Construir query
  const query = {};
  
  if (filtros.idioma) query.idioma = filtros.idioma;
  if (filtros.nivel) query.nivel = filtros.nivel;
  if (filtros.estado) query.estado = filtros.estado;
  if (filtros.profesor) query.profesor = filtros.profesor;
  
  // Búsqueda por texto en nombre
  if (filtros.search) {
    query.nombre = { $regex: filtros.search, $options: 'i' };
  }
  
  // Ejecutar query
  const cursos = await Curso.find(query)
    .populate('profesor', 'firstName lastName email')
    .skip(skip)
    .limit(limit)
    .sort({ fechaInicio: -1 });
  
  const total = await Curso.countDocuments(query);
  
  return {
    cursos,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
};

/**
 * Obtener cursos de un profesor
 */
exports.getCursosByProfesor = async (profesorId, filtros = {}) => {
  const query = { profesor: profesorId, ...filtros };
  
  return await Curso.find(query)
    .populate('estudiantes', 'firstName lastName email')
    .sort({ fechaInicio: -1 });
};

/**
 * Obtener cursos activos
 */
exports.getCursosActivos = async () => {
  return await Curso.findActivos();
};

/**
 * Inscribir estudiante a curso
 */
exports.inscribirEstudiante = async (cursoId, estudianteId) => {
  const curso = await Curso.findById(cursoId);
  
  if (!curso) {
    throw new Error('Curso no encontrado');
  }
  
  if (curso.estado === 'cancelado' || curso.estado === 'completado') {
    throw new Error('No se puede inscribir a un curso cancelado o completado');
  }
  
  // Verificar que el estudiante existe
  const estudiante = await BaseUser.findById(estudianteId);
  if (!estudiante) {
    throw new Error('Estudiante no encontrado');
  }
  
  if (estudiante.role !== 'student') {
    throw new Error('El usuario especificado no es un estudiante');
  }
  
  // Verificar que no esté ya inscrito
  const inscripcionExistente = await Inscripcion.verificarInscripcion(estudianteId, cursoId);
  if (inscripcionExistente) {
    throw new Error('El estudiante ya está inscrito en este curso');
  }
  
  // Verificar que no tenga deuda (esto lo hará Ayelen, por ahora solo estructura)
  // const tieneDeuda = await pagosService.verificarDeuda(estudianteId);
  // if (tieneDeuda) {
  //   throw new Error('El estudiante tiene pagos pendientes');
  // }
  
  // Crear inscripción
  const inscripcion = await Inscripcion.create({
    estudiante: estudianteId,
    curso: cursoId,
    estado: 'confirmada' // O 'pendiente' si espera pago
  });
  
  // La inscripción automáticamente agregará al estudiante al curso (hook post-save)
  
  return inscripcion;
};

/**
 * Desinscribir estudiante de curso
 */
exports.desinscribirEstudiante = async (cursoId, estudianteId) => {
  const inscripcion = await Inscripcion.findOne({
    curso: cursoId,
    estudiante: estudianteId,
    estado: { $in: ['pendiente', 'confirmada'] }
  });
  
  if (!inscripcion) {
    throw new Error('Inscripción no encontrada');
  }
  
  // Cancelar inscripción
  await inscripcion.cancelar('Desinscripción solicitada por administrador');
  
  return inscripcion;
};

/**
 * Obtener estudiantes de un curso
 */
exports.getEstudiantesCurso = async (cursoId) => {
  const inscripciones = await Inscripcion.findByCurso(cursoId, { estado: 'confirmada' });
  
  return inscripciones.map(ins => ({
    estudiante: ins.estudiante,
    fechaInscripcion: ins.fechaInscripcion,
    progreso: ins.progreso
  }));
};

/**
 * Calcular progreso de un estudiante en un curso
 */
exports.calcularProgresoCurso = async (cursoId, estudianteId) => {
  const inscripcion = await Inscripcion.findOne({
    curso: cursoId,
    estudiante: estudianteId,
    estado: 'confirmada'
  });
  
  if (!inscripcion) {
    return {
      horasCompletadas: 0,
      porcentaje: 0
    };
  }
  
  return inscripcion.progreso;
};

/**
 * Obtener cursos disponibles para inscripción
 */
exports.getCursosDisponibles = async (estudianteId) => {
  // Obtener cursos en los que ya está inscrito
  const inscripciones = await Inscripcion.find({
    estudiante: estudianteId,
    estado: { $in: ['pendiente', 'confirmada'] }
  }).select('curso');
  
  const cursosInscritos = inscripciones.map(ins => ins.curso);
  
  // Obtener cursos activos o planificados que no esté inscrito
  const cursosDisponibles = await Curso.find({
    _id: { $nin: cursosInscritos },
    estado: { $in: ['planificado', 'activo'] },
    fechaInicio: { $gte: new Date() } // Solo cursos que no hayan empezado
  })
    .populate('profesor', 'firstName lastName')
    .sort({ fechaInicio: 1 });
  
  return cursosDisponibles;
};

/**
 * Obtener cursos de un estudiante
 */
exports.getCursosByEstudiante = async (estudianteId) => {
  const inscripciones = await Inscripcion.findActivasByEstudiante(estudianteId);
  
  return inscripciones.map(ins => ({
    ...ins.curso.toObject(),
    inscripcion: {
      fechaInscripcion: ins.fechaInscripcion,
      progreso: ins.progreso,
      estado: ins.estado
    }
  }));
};

/**
 * Verificar si un estudiante está inscrito en un curso
 */
exports.verificarInscripcion = async (cursoId, estudianteId) => {
  return await Inscripcion.verificarInscripcion(estudianteId, cursoId);
};

/**
 * Cambiar estado del curso
 */
exports.cambiarEstadoCurso = async (cursoId, nuevoEstado) => {
  const estadosValidos = ['planificado', 'activo', 'completado', 'cancelado'];
  
  if (!estadosValidos.includes(nuevoEstado)) {
    throw new Error('Estado no válido');
  }
  
  const curso = await Curso.findById(cursoId);
  
  if (!curso) {
    throw new Error('Curso no encontrado');
  }
  
  // Validaciones según el cambio de estado
  if (nuevoEstado === 'cancelado' && curso.estudiantes.length > 0) {
    throw new Error('No se puede cancelar un curso con estudiantes inscritos');
  }
  
  curso.estado = nuevoEstado;
  await curso.save();
  
  return curso;
};

/**
 * Obtener estadísticas de un curso
 */
exports.getEstadisticasCurso = async (cursoId) => {
  const curso = await this.getCursoById(cursoId);
  const inscripciones = await Inscripcion.getEstadisticasCurso(cursoId);
  
  return {
    curso: {
      id: curso._id,
      nombre: curso.nombre,
      idioma: curso.idioma,
      nivel: curso.nivel,
      estado: curso.estado
    },
    inscripciones,
    capacidad: {
      inscritos: curso.numeroEstudiantes,
      // capacidadMaxima: curso.capacidadMaxima || 'Sin límite'
    },
    finanzas: {
      costoTotal: curso.costoTotal,
      ingresosPotenciales: curso.tarifa * curso.duracionTotal * curso.numeroEstudiantes
    }
  };
};

/**
 * Obtener estadísticas generales de cursos
 */
exports.getEstadisticasGenerales = async () => {
  const totalCursos = await Curso.countDocuments();
  const cursosActivos = await Curso.countDocuments({ estado: 'activo' });
  const cursosPlanificados = await Curso.countDocuments({ estado: 'planificado' });
  const cursosCompletados = await Curso.countDocuments({ estado: 'completado' });
  
  // Cursos por idioma
  const cursosPorIdioma = await Curso.aggregate([
    { $group: { _id: '$idioma', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);
  
  // Cursos por nivel
  const cursosPorNivel = await Curso.aggregate([
    { $group: { _id: '$nivel', count: { $sum: 1 } } },
    { $sort: { _id: 1 } }
  ]);
  
  return {
    total: totalCursos,
    porEstado: {
      activos: cursosActivos,
      planificados: cursosPlanificados,
      completados: cursosCompletados
    },
    porIdioma: cursosPorIdioma,
    porNivel: cursosPorNivel
  };
};

// ==================== FUNCIONES DE HORARIOS DISPONIBLES ====================

/**
 * Obtiene los horarios disponibles de un profesor
 * (horarios que tiene asignados pero que no están ocupados por cursos activos)
 * 
 * @param {string} profesorId - ID del profesor
 * @returns {Array} Array de horarios disponibles (objetos completos)
 * @throws {Error} Si el profesor no existe o hay errores de BD
 */
exports.getHorariosDisponiblesProfesor = async (profesorId) => {
  try {
    // PASO 1: Obtener la disponibilidad TOTAL del profesor
    const profesor = await BaseUser.findById(profesorId)
      .populate('horariosPermitidos');

    if (!profesor) {
      throw new Error('Profesor no encontrado');
    }

    if (profesor.role !== 'profesor') {
      throw new Error('El usuario no es un profesor');
    }

    // Si no tiene horarios asignados, retornar array vacío
    if (!profesor.horariosPermitidos || profesor.horariosPermitidos.length === 0) {
      return [];
    }

    const todosSusHorarios = profesor.horariosPermitidos;

    // PASO 2: Obtener los IDs de horarios que YA tiene OCUPADOS
    const cursosActivos = await Curso.find({
      profesor: profesorId,
      estado: { $in: ['planificado', 'activo'] } // Excluir 'completado' y 'cancelado'
    }).select('horario');

    // Extraer los IDs de horarios ocupados y convertir a Set de strings
    const horariosOcupadosIds = new Set(
      cursosActivos
        .map(curso => curso.horario)
        .filter(horarioId => horarioId) // Filtrar nulls/undefined
        .map(horarioId => horarioId.toString())
    );

    // PASO 3: Filtrar la lista total - solo horarios NO ocupados
    const horariosDisponibles = todosSusHorarios.filter(horario => {
      return !horariosOcupadosIds.has(horario._id.toString());
    });

    return horariosDisponibles;

  } catch (error) {
    console.error('Error en getHorariosDisponiblesProfesor:', error);
    throw new Error(`Error al obtener horarios disponibles: ${error.message}`);
  }
};

/**
 * Verifica si un profesor tiene disponible un horario específico
 * 
 * @param {string} profesorId - ID del profesor
 * @param {string} horarioId - ID del horario a verificar
 * @returns {boolean} true si está disponible, false si está ocupado
 * @throws {Error} Si el profesor no existe o hay errores de BD
 */
exports.isHorarioDisponibleProfesor = async (profesorId, horarioId) => {
  try {
    const horariosDisponibles = await exports.getHorariosDisponiblesProfesor(profesorId);
    
    return horariosDisponibles.some(horario => 
      horario._id.toString() === horarioId.toString()
    );

  } catch (error) {
    console.error('Error en isHorarioDisponibleProfesor:', error);
    throw new Error(`Error al verificar disponibilidad: ${error.message}`);
  }
};

/**
 * Obtiene resumen de disponibilidad de un profesor
 * 
 * @param {string} profesorId - ID del profesor
 * @returns {Object} Resumen con estadísticas de horarios
 * @throws {Error} Si el profesor no existe o hay errores de BD
 */
exports.getResumenDisponibilidadProfesor = async (profesorId) => {
  try {
    const profesor = await BaseUser.findById(profesorId)
      .populate('horariosPermitidos');

    if (!profesor) {
      throw new Error('Profesor no encontrado');
    }

    if (profesor.role !== 'profesor') {
      throw new Error('El usuario no es un profesor');
    }

    const totalHorarios = profesor.horariosPermitidos?.length || 0;
    const horariosDisponibles = await exports.getHorariosDisponiblesProfesor(profesorId);
    const horariosOcupados = totalHorarios - horariosDisponibles.length;

    // Agrupar horarios disponibles por día
    const disponiblesPorDia = {};
    horariosDisponibles.forEach(horario => {
      if (!disponiblesPorDia[horario.dia]) {
        disponiblesPorDia[horario.dia] = [];
      }
      disponiblesPorDia[horario.dia].push({
        _id: horario._id,
        horaInicio: horario.horaInicio,
        horaFin: horario.horaFin,
        display: horario.display || `${horario.dia} ${horario.horaInicio} - ${horario.horaFin}`
      });
    });

    return {
      profesorId: profesor._id,
      nombreProfesor: `${profesor.firstName} ${profesor.lastName}`,
      totalHorarios,
      horariosDisponibles: horariosDisponibles.length,
      horariosOcupados,
      porcentajeDisponibilidad: totalHorarios > 0 ? Math.round((horariosDisponibles.length / totalHorarios) * 100) : 0,
      disponiblesPorDia,
      ultimaActualizacion: new Date().toISOString()
    };

  } catch (error) {
    console.error('Error en getResumenDisponibilidadProfesor:', error);
    throw new Error(`Error al obtener resumen de disponibilidad: ${error.message}`);
  }
};