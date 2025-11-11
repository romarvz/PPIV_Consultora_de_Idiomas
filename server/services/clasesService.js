// services/clasesService.js
const { Clase, Curso, Inscripcion, EventoCalendario, BaseUser, Horario } = require('../models');

const DAY_NAME_TO_INDEX = {
  domingo: 0,
  lunes: 1,
  martes: 2,
  miercoles: 3,
  jueves: 4,
  viernes: 5,
  sabado: 6
};

const DEFAULT_VIRTUAL_URL = 'https://pendiente.consultoraidiomas.com/sala';

const timeStringToMinutes = (timeString = '') => {
  const [hours = 0, minutes = 0] = timeString.split(':').map(Number);
  return hours * 60 + minutes;
};

const calculateDurationFromSchedule = (horario) => {
  if (!horario || !horario.horaInicio || !horario.horaFin) {
    return 0;
  }
  return timeStringToMinutes(horario.horaFin) - timeStringToMinutes(horario.horaInicio);
};

const combineDateAndTime = (date, timeString) => {
  const combined = new Date(date);
  const [hours = 0, minutes = 0] = timeString.split(':').map(Number);
  combined.setHours(hours, minutes, 0, 0);
  return combined;
};

const addDays = (date, days) => {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
};

const getFirstDateForDay = (startDate, targetDayIndex) => {
  const first = new Date(startDate);
  const startDay = first.getDay();
  const diff = (targetDayIndex - startDay + 7) % 7;
  if (diff !== 0) {
    first.setDate(first.getDate() + diff);
  }
  return first;
};

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
    claseData.duracionMinutos,
    null,
    claseData.curso
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
      claseId,
      clase.curso
    );
    if (!disponible) {
      throw new Error('El profesor no está disponible en ese horario');
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

const ensureUpcomingClassesForCurso = async (curso) => {
  if (!curso || !curso.fechaInicio || !curso.fechaFin) {
    return;
  }

  const horarioIds = [];

  if (Array.isArray(curso.horarios) && curso.horarios.length > 0) {
    curso.horarios.forEach((horario) => {
      if (!horario) {
        return;
      }
      if (horario._id) {
        horarioIds.push(horario._id);
      } else {
        horarioIds.push(horario);
      }
    });
  } else if (curso.horario) {
    horarioIds.push(curso.horario._id ? curso.horario._id : curso.horario);
  }

  if (horarioIds.length === 0) {
    return;
  }

  const horarios = await Horario.find({ _id: { $in: horarioIds } });
  if (!horarios.length) {
    return;
  }

  const durationOverrides = new Map();
  if (Array.isArray(curso.horariosDuraciones)) {
    curso.horariosDuraciones.forEach((item) => {
      if (!item) {
        return;
      }
      const rawId = item.horario || item.horarioId || (item._id && item._id.horario) || item.id;
      if (!rawId) {
        return;
      }
      const idStr = rawId._id ? rawId._id.toString() : rawId.toString();
      const duration = Number(item.duracionMinutos);
      if (Number.isFinite(duration) && duration >= 30 && duration <= 180) {
        durationOverrides.set(idStr, duration);
      }
    });
  }

  const defaultCourseDuration = Number(curso.duracionClaseMinutos);
  const normalizedDefaultDuration = Number.isFinite(defaultCourseDuration) && defaultCourseDuration >= 30 && defaultCourseDuration <= 180
    ? defaultCourseDuration
    : null;

  const now = new Date();
  const startDate = new Date(curso.fechaInicio);
  startDate.setHours(0, 0, 0, 0);

  const endDate = new Date(curso.fechaFin);
  endDate.setHours(23, 59, 59, 999);

  let futureClasses = await Clase.find({
    curso: curso._id,
    profesor: curso.profesor,
    fechaHora: { $gte: startDate, $lte: endDate }
  }).select('_id fechaHora estado asistencia updatedAt');

  const duplicatesToRemove = [];
  const groupedByIso = new Map();

  futureClasses.forEach((clase) => {
    if (!clase.fechaHora) {
      return;
    }
    const iso = clase.fechaHora.toISOString();
    if (!groupedByIso.has(iso)) {
      groupedByIso.set(iso, []);
    }
    groupedByIso.get(iso).push(clase);
  });

  for (const group of groupedByIso.values()) {
    if (group.length <= 1) {
      continue;
    }

    const sorted = group
      .slice()
      .sort((a, b) => {
        const timeA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
        const timeB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
        return timeB - timeA;
      });

    const keeper =
      sorted.find((cl) => cl.estado !== 'programada') ||
      sorted.find((cl) => cl.asistencia && cl.asistencia.length > 0) ||
      sorted[0];

    const keeperId = keeper._id.toString();
    const candidates = sorted.filter((cl) => cl._id.toString() !== keeperId);
    const removable = candidates.filter(
      (cl) => cl.estado === 'programada' && (!cl.asistencia || cl.asistencia.length === 0)
    );

    duplicatesToRemove.push(...removable.map((cl) => cl._id.toString()));
  }

  if (duplicatesToRemove.length > 0) {
    await Clase.deleteMany({ _id: { $in: duplicatesToRemove } });
    await EventoCalendario.deleteMany({
      referencia: { $in: duplicatesToRemove },
      tipo: 'clase'
    });
    futureClasses = futureClasses.filter(
      (clase) => !duplicatesToRemove.includes(clase._id.toString())
    );
  }

  const existingByIso = new Set(
    futureClasses
      .filter((clase) => clase.fechaHora)
      .map((clase) => clase.fechaHora.toISOString())
  );

  const profesorId = curso.profesor && curso.profesor._id ? curso.profesor._id : curso.profesor;

  for (const horario of horarios) {
    const targetDayIndex = DAY_NAME_TO_INDEX[horario.dia];
    if (typeof targetDayIndex === 'undefined') {
      continue;
    }

    const horarioIdStr = horario._id ? horario._id.toString() : horario.toString();
    const slotDuration = calculateDurationFromSchedule(horario);
    if (slotDuration <= 0) {
      continue;
    }

    let durationMinutes = durationOverrides.get(horarioIdStr) ?? normalizedDefaultDuration ?? slotDuration;
    durationMinutes = Math.max(30, Math.min(180, durationMinutes));
    durationMinutes = Math.min(durationMinutes, slotDuration);

    let currentDate = getFirstDateForDay(startDate, targetDayIndex);

    while (currentDate <= endDate) {
      const classStart = combineDateAndTime(currentDate, horario.horaInicio);

      if (classStart >= now && classStart <= endDate) {
        const isoKey = classStart.toISOString();
        if (!existingByIso.has(isoKey)) {
          const existing = await Clase.findOne({
            curso: curso._id,
            profesor: profesorId,
            fechaHora: classStart
          }).select('_id');

          if (existing) {
            existingByIso.add(isoKey);
          } else {
            const payload = {
              curso: curso._id,
              profesor: profesorId,
              titulo: `${curso.nombre} - ${isoKey.substring(0, 10)}`,
              descripcion: 'Clase generada automaticamente desde el horario del curso.',
              fechaHora: classStart,
              duracionMinutos: durationMinutes,
              modalidad: curso.modalidad === 'online' ? 'virtual' : 'presencial',
              estado: 'programada'
            };

            if (payload.modalidad === 'presencial') {
              payload.aula = 'A confirmar';
            } else {
              payload.enlaceVirtual = `${DEFAULT_VIRTUAL_URL}/${curso._id.toString()}`;
            }

            try {
              await exports.createClase(payload);
              existingByIso.add(isoKey);
            } catch (error) {
              console.error(
                'Error generando clase automatica para curso',
                curso._id.toString(),
                error.message
              );
            }
          }
        }
      }

      currentDate = addDays(currentDate, 7);
    }
  }
};

const ensureUpcomingClassesForProfesor = async (profesorId) => {
  if (!profesorId) {
    return;
  }

  const cursos = await Curso.find({
    profesor: profesorId,
    estado: { $in: ['planificado', 'activo'] },
    fechaInicio: { $ne: null },
    fechaFin: { $ne: null }
  })
    .populate('horarios')
    .populate('horario');

  for (const curso of cursos) {
    try {
      await ensureUpcomingClassesForCurso(curso);
    } catch (error) {
      console.error(
        'Error generando clases automaticas para el profesor',
        profesorId.toString(),
        'curso',
        curso._id.toString(),
        error.message
      );
    }
  }
};

/**
 * Obtener clases por profesor
 */
exports.getClasesByProfesor = async (profesorId, filtros = {}) => {
  console.log('clasesService.getClasesByProfesor - profesorId:', profesorId, 'filtros:', filtros);

  await ensureUpcomingClassesForProfesor(profesorId);

  const query = { profesor: profesorId };

  if (filtros.estado) {
    query.estado = filtros.estado;
  }

  if (filtros.modalidad) {
    query.modalidad = filtros.modalidad;
  }

  if (filtros.curso) {
    query.curso = filtros.curso;
  }

  if (filtros.fechaInicio || filtros.fechaFin) {
    query.fechaHora = {};
    if (filtros.fechaInicio) {
      query.fechaHora.$gte = new Date(filtros.fechaInicio);
    }
    if (filtros.fechaFin) {
      query.fechaHora.$lte = new Date(filtros.fechaFin);
    }
  }

  const limit = filtros.limit ? parseInt(filtros.limit, 10) : 0;

  const clasesQuery = Clase.find(query)
    .populate('curso', 'nombre idioma nivel')
    .populate('profesor', 'firstName lastName email')
    .sort({ fechaHora: 1 });

  if (limit > 0) {
    clasesQuery.limit(limit);
  }

  const clases = await clasesQuery.exec();
  console.log(
    'clasesService.getClasesByProfesor - encontradas:',
    Array.isArray(clases) ? clases.length : 'no-array'
  );
  return clases;
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
exports.verificarDisponibilidadProfesor = async (profesorId, fechaHora, duracionMinutos, claseId = null, cursoId = null) => {
  return await Clase.verificarDisponibilidadProfesor(
    profesorId,
    fechaHora,
    duracionMinutos,
    claseId,
    cursoId
  );
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
