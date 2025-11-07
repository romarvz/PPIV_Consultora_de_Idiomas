// services/clasesService.js
const { Clase, Curso, Inscripcion, EventoCalendario, BaseUser } = require('../models');

/**
 * Obtener clase por ID con informaci├│n completa
 */
exports.getClaseById = async (claseId) => {
  const clase = await Clase.findById(claseId)
    .populate('curso', 'nombre idioma nivel')
    .populate('profesor', 'firstName lastName email phone')
    .populate('estudiantes', 'firstName lastName email')
    .populate('asistencia.estudiante', 'firstName lastName email');
  
  if (!clase) {
    throw new Error('Clase no encontrada');
  }
  
  return clase;
};

/**
 * Crear nueva clase
 */
exports.createClase = async (claseData) => {
  // Verificar que el curso existe
  const curso = await Curso.findById(claseData.curso);
  if (!curso) {
    throw new Error('Curso no encontrado');
  }
  
  // Verificar que el profesor es el mismo del curso
  if (curso.profesor.toString() !== claseData.profesor.toString()) {
    throw new Error('El profesor de la clase debe ser el mismo del curso');
  }
  
  // Verificar disponibilidad del profesor
  const disponible = await Clase.verificarDisponibilidadProfesor(
    claseData.profesor,
    new Date(claseData.fechaHora),
    claseData.duracionMinutos
  );
  
  if (!disponible) {
    throw new Error('El profesor no est├í disponible en ese horario');
  }
  
  // Si no se especifican estudiantes, tomar todos los inscritos al curso
  if (!claseData.estudiantes || claseData.estudiantes.length === 0) {
    claseData.estudiantes = curso.estudiantes;
  }
  
  // Crear la clase
  const clase = await Clase.create(claseData);
  
  // Crear eventos de calendario para todos los estudiantes y el profesor
  await this.crearEventosCalendario(clase);
  
  return await this.getClaseById(clase._id);
};

/**
 * Actualizar clase
 */
exports.updateClase = async (claseId, updateData) => {
  const clase = await Clase.findById(claseId);
  
  if (!clase) {
    throw new Error('Clase no encontrada');
  }
  
  // No permitir editar clases ya completadas
  if (clase.estado === 'completada') {
    throw new Error('No se puede editar una clase completada');
  }
  
  // Si se cambia fecha/hora, verificar disponibilidad
  if (updateData.fechaHora || updateData.duracionMinutos) {
    const fechaHora = updateData.fechaHora ? new Date(updateData.fechaHora) : clase.fechaHora;
    const duracion = updateData.duracionMinutos || clase.duracionMinutos;
    
    const disponible = await Clase.verificarDisponibilidadProfesor(
      clase.profesor,
      fechaHora,
      duracion,
      claseId // Excluir esta clase de la verificaci├│n
    );
    
    if (!disponible) {
      throw new Error('El profesor no est├í disponible en ese horario');
    }
  }
  
  // Actualizar campos
  Object.assign(clase, updateData);
  await clase.save();
  
  // Actualizar eventos de calendario si cambi├│ la fecha
  if (updateData.fechaHora) {
    await this.actualizarEventosCalendario(clase);
  }
  
  return await this.getClaseById(clase._id);
};

/**
 * Cancelar clase
 */
exports.cancelarClase = async (claseId, motivo) => {
  const clase = await Clase.findById(claseId);
  
  if (!clase) {
    throw new Error('Clase no encontrada');
  }
  
  if (clase.estado === 'completada') {
    throw new Error('No se puede cancelar una clase completada');
  }
  
  await clase.cancelar(motivo);
  
  // Actualizar eventos de calendario
  await EventoCalendario.updateMany(
    { referencia: claseId, tipo: 'clase' },
    { estado: 'cancelado' }
  );
  
  return clase;
};

/**
 * Listar clases con filtros y paginaci├│n
 */
exports.listarClases = async (filtros = {}, paginacion = {}) => {
  const { page = 1, limit = 10 } = paginacion;
  const skip = (page - 1) * limit;
  
  // Construir query
  const query = {};
  
  if (filtros.curso) query.curso = filtros.curso;
  if (filtros.profesor) query.profesor = filtros.profesor;
  if (filtros.estudiante) query.estudiantes = filtros.estudiante;
  if (filtros.estado) query.estado = filtros.estado;
  if (filtros.modalidad) query.modalidad = filtros.modalidad;
  
  // Filtros de fecha
  if (filtros.fechaInicio && filtros.fechaFin) {
    query.fechaHora = {
      $gte: new Date(filtros.fechaInicio),
      $lte: new Date(filtros.fechaFin)
    };
  } else if (filtros.fechaInicio) {
    query.fechaHora = { $gte: new Date(filtros.fechaInicio) };
  } else if (filtros.fechaFin) {
    query.fechaHora = { $lte: new Date(filtros.fechaFin) };
  }
  
  // Ejecutar query
  const clases = await Clase.find(query)
    .populate('curso', 'nombre idioma nivel')
    .populate('profesor', 'firstName lastName email')
    .skip(skip)
    .limit(limit)
    .sort({ fechaHora: -1 });
  
  const total = await Clase.countDocuments(query);
  
  return {
    clases,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
};

/**
 * Obtener clases por profesor
 */
exports.getClasesByProfesor = async (profesorId, filtros = {}) => {
  return await Clase.findByProfesor(profesorId, filtros);
};

/**
 * Obtener clases por estudiante
 */
exports.getClasesByEstudiante = async (estudianteId, filtros = {}) => {
  return await Clase.findByEstudiante(estudianteId, filtros);
};

/**
 * Obtener pr├│ximas clases de un usuario
 */
exports.getProximasClases = async (usuarioId, limite = 10) => {
  return await Clase.findProximas(usuarioId, limite);
};

/**
 * Registrar asistencia de un estudiante
 */
exports.registrarAsistencia = async (claseId, estudianteId, presente, minutosTarde = 0, comentarios = '', registradoPor) => {
  const clase = await Clase.findById(claseId);
  
  if (!clase) {
    throw new Error('Clase no encontrada');
  }
  
  // Verificar que el estudiante pertenece a la clase
  const estudianteEnClase = clase.estudiantes.some(
    est => est.toString() === estudianteId.toString()
  );
  
  if (!estudianteEnClase) {
    throw new Error('El estudiante no pertenece a esta clase');
  }
  
  await clase.registrarAsistencia(estudianteId, presente, minutosTarde, comentarios, registradoPor);
  
  return await this.getClaseById(claseId);
};

/**
 * Registrar asistencia m├║ltiple (toda la clase)
 */
exports.registrarAsistenciaMultiple = async (claseId, asistencias, registradoPor) => {
  const clase = await Clase.findById(claseId);
  
  if (!clase) {
    throw new Error('Clase no encontrada');
  }
  
  // Registrar cada asistencia
  for (const asist of asistencias) {
    await clase.registrarAsistencia(
      asist.estudiante,
      asist.presente,
      asist.minutosTarde || 0,
      asist.comentarios || '',
      registradoPor
    );
  }
  
  return await this.getClaseById(claseId);
};

/**
 * Completar clase (actualiza progreso de estudiantes)
 */
exports.completarClase = async (claseId) => {
  const clase = await Clase.findById(claseId);
  
  if (!clase) {
    throw new Error('Clase no encontrada');
  }
  
  if (clase.estado === 'completada') {
    throw new Error('La clase ya est├í completada');
  }
  
  // Verificar que se haya registrado asistencia
  if (clase.asistencia.length === 0) {
    throw new Error('Debe registrar la asistencia antes de completar la clase');
  }
  
  // Completar clase (esto actualiza autom├íticamente el progreso)
  await clase.completar();
  
  // Actualizar eventos de calendario
  await EventoCalendario.updateMany(
    { referencia: claseId, tipo: 'clase' },
    { estado: 'completado' }
  );
  
  return await this.getClaseById(claseId);
};

/**
 * Verificar disponibilidad del profesor
 */
exports.verificarDisponibilidadProfesor = async (profesorId, fechaHora, duracionMinutos) => {
  return await Clase.verificarDisponibilidadProfesor(profesorId, fechaHora, duracionMinutos);
};

/**
 * Obtener horas completadas de un estudiante en un curso
 */
exports.getHorasCompletadasCurso = async (cursoId, estudianteId) => {
  const clases = await Clase.find({
    curso: cursoId,
    estado: 'completada',
    'asistencia.estudiante': estudianteId,
    'asistencia.presente': true
  });
  
  let horasTotales = 0;
  
  for (const clase of clases) {
    const asistencia = clase.asistencia.find(
      a => a.estudiante.toString() === estudianteId.toString() && a.presente
    );
    
    if (asistencia) {
      horasTotales += clase.duracionHoras;
    }
  }
  
  return horasTotales;
};

/**
 * Obtener asistencia de un estudiante
 */
exports.getAsistenciaEstudiante = async (estudianteId, cursoId = null) => {
  return await Clase.getEstadisticasAsistencia(estudianteId, cursoId);
};

/**
 * Crear eventos de calendario para una clase
 */
exports.crearEventosCalendario = async (clase) => {
  const usuarios = [clase.profesor, ...clase.estudiantes];
  
  for (const usuarioId of usuarios) {
    await EventoCalendario.crearDesdeClase(clase, usuarioId);
  }
};

/**
 * Actualizar eventos de calendario cuando cambia una clase
 */
exports.actualizarEventosCalendario = async (clase) => {
  await EventoCalendario.updateMany(
    { referencia: clase._id, tipo: 'clase' },
    {
      titulo: clase.titulo,
      descripcion: clase.descripcion,
      fechaHora: clase.fechaHora,
      duracion: clase.duracionMinutos,
      ubicacion: clase.modalidad === 'presencial' ? clase.aula : 'Virtual',
      enlace: clase.enlaceVirtual
    }
  );
};

/**
 * Obtener estad├¡sticas de un curso (clases)
 */
exports.getEstadisticasCurso = async (cursoId) => {
  const totalClases = await Clase.countDocuments({ curso: cursoId });
  const clasesProgramadas = await Clase.countDocuments({ curso: cursoId, estado: 'programada' });
  const clasesCompletadas = await Clase.countDocuments({ curso: cursoId, estado: 'completada' });
  const clasesCanceladas = await Clase.countDocuments({ curso: cursoId, estado: 'cancelada' });
  
  // Promedio de asistencia
  const clasesConAsistencia = await Clase.find({
    curso: cursoId,
    estado: 'completada'
  });
  
  let promedioAsistencia = 0;
  if (clasesConAsistencia.length > 0) {
    const sumaPorcentajes = clasesConAsistencia.reduce(
      (sum, clase) => sum + clase.porcentajeAsistencia,
      0
    );
    promedioAsistencia = sumaPorcentajes / clasesConAsistencia.length;
  }
  
  return {
    total: totalClases,
    programadas: clasesProgramadas,
    completadas: clasesCompletadas,
    canceladas: clasesCanceladas,
    promedioAsistencia: Math.round(promedioAsistencia)
  };
};

/**
 * Obtener estad├¡sticas generales de clases
 */
exports.getEstadisticasGenerales = async () => {
  const totalClases = await Clase.countDocuments();
  const clasesProgramadas = await Clase.countDocuments({ estado: 'programada' });
  const clasesCompletadas = await Clase.countDocuments({ estado: 'completada' });
  
  // Clases por modalidad
  const clasesPorModalidad = await Clase.aggregate([
    { $group: { _id: '$modalidad', count: { $sum: 1 } } }
  ]);
  
  return {
    total: totalClases,
    programadas: clasesProgramadas,
    completadas: clasesCompletadas,
    porModalidad: clasesPorModalidad
  };
};
