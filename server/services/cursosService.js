// services/cursosService.js
const { Curso, Inscripcion, BaseUser, Horario } = require('../models');

/**
 * Get course by ID with complete information
 */
exports.getCursoById = async (cursoId) => {
  const curso = await Curso.findById(cursoId)
    .populate('profesor', 'firstName lastName email phone')
    .populate('estudiantes', 'firstName lastName email')
    .populate({
      path: 'horario',
      select: 'dia horaInicio horaFin display',
      options: { strictPopulate: false } // Allows populate even if field is null
    })
    .populate({
      path: 'horarios',
      select: 'dia horaInicio horaFin display',
      options: { strictPopulate: false }
    });
  
  if (!curso) {
    throw new Error('Curso no encontrado');
  }
  
  return curso;
};

/**
 * Crear nuevo curso
 */
exports.createCurso = async (cursoData) => {
  // Verify that teacher exists and is a teacher
  const profesor = await BaseUser.findById(cursoData.profesor)
    .select('horariosPermitidos role')
    .populate('horariosPermitidos'); // IMPORTANT: Populate to get complete objects
  if (!profesor) {
    throw new Error('Profesor no encontrado');
  }
  
  if (profesor.role !== 'profesor') {
    throw new Error('El usuario especificado no es un profesor');
  }

  // Schedule vs teacher validation - VERIFY THAT SCHEDULE IS IN ALLOWED ONES
  if (cursoData.horario || (cursoData.horarios && cursoData.horarios.length > 0)) {
    const horariosAValidar = cursoData.horarios && cursoData.horarios.length > 0 
      ? cursoData.horarios 
      : [cursoData.horario];
    
    const horariosPermitidosIds = (profesor.horariosPermitidos || []).map(h => 
      h._id ? h._id.toString() : h.toString()
    );
    
    // Validate that all selected schedules are in allowed ones
    for (const horarioId of horariosAValidar) {
      if (horarioId) {
        const horarioIdStr = horarioId.toString();
        if (!horariosPermitidosIds.includes(horarioIdStr)) {
          throw new Error(`El profesor no tiene el horario ${horarioIdStr} permitido. Por favor seleccione solo horarios de la lista disponible.`);
        }
      }
    }
  }
  
  // Create course
  const curso = await Curso.create(cursoData);
  
  // Return with populate
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
  
  // Do not allow changing teacher if course already has enrolled students
  if (updateData.profesor && curso.estudiantes.length > 0) {
    throw new Error('No se puede cambiar el profesor de un curso con estudiantes inscritos');
  }

  // If teacher or schedule is being changed, validate that schedule is allowed
  if (updateData.profesor || updateData.horario) {
    const profesorId = updateData.profesor || curso.profesor;
    const horarioId = updateData.horario || curso.horario;
    
    const profesor = await BaseUser.findById(profesorId)
      .select('horariosPermitidos role')
      .populate('horariosPermitidos'); // IMPORTANT: Populate to get complete objects
    
    if (!profesor || profesor.role !== 'profesor') {
      throw new Error('Profesor no válido');
    }
    
    if (horarioId) {
      const horariosPermitidosIds = (profesor.horariosPermitidos || []).map(h => 
        h._id ? h._id.toString() : h.toString()
      );
      const horarioIdStr = horarioId.toString();
      
      if (!horariosPermitidosIds.includes(horarioIdStr)) {
        throw new Error('El profesor no tiene ese horario permitido. Por favor seleccione un horario de la lista disponible.');
      }
    }
    
    // Also validate multiple schedules if they exist
    if (updateData.horarios && Array.isArray(updateData.horarios) && updateData.horarios.length > 0) {
      const horariosPermitidosIds = (profesor.horariosPermitidos || []).map(h => 
        h._id ? h._id.toString() : h.toString()
      );
      
      for (const horarioId of updateData.horarios) {
        if (horarioId) {
          const horarioIdStr = horarioId.toString();
          if (!horariosPermitidosIds.includes(horarioIdStr)) {
            throw new Error(`El profesor no tiene el horario ${horarioIdStr} permitido. Por favor seleccione solo horarios de la lista disponible.`);
          }
        }
      }
    }
  }
  
  // Update fields
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
  
  // Verify that it has no active enrollments
  const inscripcionesActivas = await Inscripcion.countDocuments({
    curso: cursoId,
    estado: { $in: ['pendiente', 'confirmada'] }
  });
  
  if (inscripcionesActivas > 0) {
    throw new Error('No se puede eliminar un curso con inscripciones activas');
  }
  
  // Change status to cancelled
  curso.estado = 'cancelado';
  await curso.save();
  
  return curso;
};

/**
 * Listar cursos con filtros y paginación
 */
exports.listarCursos = async (filtros = {}, paginacion = {}) => {
  try {
    const { page = 1, limit = 10 } = paginacion;
    const skip = (page - 1) * limit;
    
    // Build query
    const query = {};
    
    if (filtros.idioma) query.idioma = filtros.idioma;
    if (filtros.nivel) query.nivel = filtros.nivel;
    if (filtros.estado) query.estado = filtros.estado;
    if (filtros.profesor) query.profesor = filtros.profesor;
    
    // Text search in name
    if (filtros.search) {
      query.nombre = { $regex: filtros.search, $options: 'i' };
    }
    
    // Execute query
    const cursos = await Curso.find(query)
      .populate('profesor', 'firstName lastName email')
      .populate({
        path: 'horario',
        select: 'dia horaInicio horaFin display',
        options: { strictPopulate: false } // Allows populate even if field is null
      })
      .populate({
        path: 'horarios',
        select: 'dia horaInicio horaFin display',
        options: { strictPopulate: false }
      })
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
  } catch (error) {
    console.error('Error en cursosService.listarCursos:', error);
    console.error('Stack:', error.stack);
    throw error;
  }
};

/**
 * Obtener cursos de un profesor
 */
exports.getCursosByProfesor = async (profesorId, filtros = {}) => {
  const query = { profesor: profesorId, ...filtros };
  
  return await Curso.find(query)
    .populate('estudiantes', 'firstName lastName email')
    .populate({
      path: 'horario',
      select: 'dia horaInicio horaFin display',
      options: { strictPopulate: false }
    })
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
  
  // Verify that student exists
  const estudiante = await BaseUser.findById(estudianteId);
  if (!estudiante) {
    throw new Error('Estudiante no encontrado');
  }
  
  if (estudiante.role !== 'student') {
    throw new Error('El usuario especificado no es un estudiante');
  }
  
  // Verify that student is not already enrolled
  const inscripcionExistente = await Inscripcion.verificarInscripcion(estudianteId, cursoId);
  if (inscripcionExistente) {
    throw new Error('El estudiante ya está inscrito en este curso');
  }
  
  // Create enrollment
  const inscripcion = await Inscripcion.create({
    estudiante: estudianteId,
    curso: cursoId,
    estado: 'confirmada' // Or 'pendiente' if waiting for payment
  });
  
  // Enrollment will automatically add student to course (post-save hook)
  
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
  
  // Cancel enrollment
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
  // Get courses student is already enrolled in
  const inscripciones = await Inscripcion.find({
    estudiante: estudianteId,
    estado: { $in: ['pendiente', 'confirmada'] }
  }).select('curso');
  
  const cursosInscritos = inscripciones.map(ins => ins.curso);
  
  // Get active or planned courses that student is not enrolled in
  const cursosDisponibles = await Curso.find({
    _id: { $nin: cursosInscritos },
    estado: { $in: ['planificado', 'activo'] },
    fechaInicio: { $gte: new Date() } // Only courses that haven't started
  })
    .populate('profesor', 'firstName lastName')
    .populate({
      path: 'horario',
      select: 'dia horaInicio horaFin display',
      options: { strictPopulate: false }
    })
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
  
  // Validations according to status change
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
      estado: curso.estado,
      horario: curso.horario ? curso.horario.display : 'N/A' // <- New field
    },
    inscripciones,
    capacidad: {
      inscritos: curso.numeroEstudiantes,
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
  
  // Courses by language
  const cursosPorIdioma = await Curso.aggregate([
    { $group: { _id: '$idioma', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);
  
  // Courses by level
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


// --- NEW FUNCTION ---
/**
 * Gets available schedules for a teacher, excluding those already assigned
 * to active or planned courses.
 * @param {String} profesorId - Teacher ID
 * @param {String} excludeCursoId - Course ID to exclude (optional, useful when editing)
 */
exports.getHorariosDisponiblesProfesor = async (profesorId, excludeCursoId = null) => {
  try {
    console.log(' getHorariosDisponiblesProfesor - Profesor ID:', profesorId);
    if (excludeCursoId) {
      console.log(' getHorariosDisponiblesProfesor - Excluyendo curso:', excludeCursoId);
    }
    
    // 1. Get teacher's TOTAL availability from BaseUser
    const profesor = await BaseUser.findById(profesorId)
                                  .select('horariosPermitidos')
                                  .populate('horariosPermitidos'); // Returns Horario objects
    
    if (!profesor) {
      throw new Error('Profesor no encontrado');
    }

    const todosSusHorarios = profesor.horariosPermitidos || []; // Array of Horario objects
    
    console.log('Teacher allowed schedules (without populate):', profesor.horariosPermitidos?.map(h => typeof h === 'object' ? h._id : h));
    console.log('Teacher allowed schedules (with populate):', todosSusHorarios.map(h => ({ id: h._id, dia: h.dia, hora: h.horaInicio })));
    
    // If teacher has no allowed schedules, return empty array
    if (todosSusHorarios.length === 0) {
      console.log('⚠️ Teacher has no allowed schedules configured');
      return [];
    }

    // 2. Get IDs of schedules that are ALREADY OCCUPIED
    // Search in both fields: horario (singular) and horarios (array)
    // Exclude current course if editing
    const queryCursos = {
      profesor: profesorId,
      estado: { $in: ['planificado', 'activo'] }, // Only count future or current courses
      $or: [
        { horario: { $exists: true, $ne: null } }, // Courses with singular schedule
        { horarios: { $exists: true, $ne: [] } }   // Courses with schedules array
      ]
    };
    
    // Exclude current course if editing
    if (excludeCursoId) {
      queryCursos._id = { $ne: excludeCursoId };
    }
    
    const cursosDelProfesor = await Curso.find(queryCursos).select('horario horarios');
    
    console.log(' Cursos del profesor con horarios ocupados:', cursosDelProfesor.map(c => ({
      horario: c.horario,
      horarios: c.horarios
    })));
    
    // Map to Set of strings for fast lookup
    // Include both singular schedule and schedules array
    const horariosOcupadosIds = new Set();
    
    cursosDelProfesor.forEach(curso => {
      // Add singular schedule if exists
      if (curso.horario) {
        horariosOcupadosIds.add(curso.horario.toString());
      }
      // Add all schedules from array if they exist
      if (curso.horarios && Array.isArray(curso.horarios)) {
        curso.horarios.forEach(h => {
          if (h) {
            horariosOcupadosIds.add(h.toString());
          }
        });
      }
    });

    console.log(' Horarios ocupados (Set):', Array.from(horariosOcupadosIds));
    if (excludeCursoId) {
      console.log(' Curso excluido de la búsqueda:', excludeCursoId);
    }

    // 3. Filter the total list - only return allowed schedules that are NOT occupied
    // Sort by day of week (Monday to Sunday) and then by time
    const ordenDias = {
      'lunes': 1,
      'martes': 2,
      'miercoles': 3,
      'jueves': 4,
      'viernes': 5,
      'sabado': 6,
      'domingo': 7
    };
    
    const horariosDisponibles = todosSusHorarios
      .filter(horario => {
        if (!horario || !horario._id) {
          console.log(' Horario inválido encontrado:', horario);
          return false;
        }
        const horarioIdStr = horario._id.toString();
        const estaOcupado = horariosOcupadosIds.has(horarioIdStr);
        console.log(`  - Horario ${horarioIdStr} (${horario.dia} ${horario.horaInicio}): ${estaOcupado ? 'OCUPADO' : 'DISPONIBLE'}`);
        // Return only schedules that are NOT in the occupied Set
        return !estaOcupado;
      })
      .sort((a, b) => {
        // First sort by day of week
        const diaA = ordenDias[a.dia] || 99;
        const diaB = ordenDias[b.dia] || 99;
        if (diaA !== diaB) return diaA - diaB;
        // If same day, sort by start time
        return a.horaInicio.localeCompare(b.horaInicio);
      });

    console.log('Final available schedules:', horariosDisponibles.map(h => ({ id: h._id, dia: h.dia, hora: h.horaInicio })));
    console.log(`Total: ${horariosDisponibles.length} available schedules out of ${todosSusHorarios.length} allowed`);

    return horariosDisponibles; // Returns array of available Horario objects

  } catch (error) {
    console.error('❌ Error en getHorariosDisponiblesProfesor:', error);
    throw new Error(`Error al obtener horarios: ${error.message}`);
  }
};