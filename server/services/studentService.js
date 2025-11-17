/**
 * Student Service
 * Contiene la lógica de negocio para estudiantes
 * Separado del controller para seguir buenas prácticas de arquitectura
 */

const userService = require('./userService');

/**
 * Construye los filtros de búsqueda para estudiantes
 * @param {Object} filtros - Filtros de búsqueda (search, status, nivel, condicion)
 * @returns {Object} Query de MongoDB
 */
const construirFiltrosEstudiantes = (filtros = {}) => {
  const query = { role: 'estudiante' };
  const condicionesAnd = [];
  
  // Filtro por texto (nombre, apellido, email, DNI)
  if (filtros.search) {
    query.$or = [
      { firstName: { $regex: filtros.search, $options: 'i' } },
      { lastName: { $regex: filtros.search, $options: 'i' } },
      { email: { $regex: filtros.search, $options: 'i' } },
      { dni: { $regex: filtros.search, $options: 'i' } }
    ];
  }

  // Filtro por estado de cuenta
  if (filtros.status) {
    if (filtros.status === 'active') {
      query.isActive = true;
    } else if (filtros.status === 'inactive') {
      query.isActive = false;
    }
  }

  // Filtro por nivel
  if (filtros.nivel) {
    query.nivel = filtros.nivel;
  }

  // Filtro por condición académica
  // Nota: condicion solo tiene ['activo', 'inactivo', 'graduado']
  //       estadoAcademico tiene ['inscrito', 'en_curso', 'graduado', 'suspendido']
  if (filtros.condicion) {
    const condicionValue = filtros.condicion;
    
    let condicionFilter;
    
    switch (condicionValue) {
      case 'activo':
      case 'inscripto':
        // Activos e Inscriptos: condicion='activo' O estadoAcademico='en_curso' O estadoAcademico='inscrito'
        // Incluir ambos grupos juntos
        condicionFilter = {
          $or: [
            { condicion: 'activo' },
            { estadoAcademico: 'en_curso' },
            { estadoAcademico: 'inscrito' }
          ]
        };
        break;
        
      case 'inactivo':
        // Inactivo: condicion='inactivo' O estadoAcademico='suspendido' O isActive=false
        // Simplificado: mostrar todos los inactivos, sin excluir graduados
        // (si un estudiante es inactivo Y graduado, aparecerá en ambos filtros)
        condicionFilter = {
          $or: [
            { condicion: 'inactivo' },
            { estadoAcademico: 'suspendido' },
            { isActive: false }
          ]
        };
        break;
        
      case 'graduado':
        // Graduado: (condicion='graduado' O estadoAcademico='graduado')
        // Y NO es inactivo
        condicionFilter = {
          $and: [
            {
              $or: [
                { condicion: 'graduado' },
                { estadoAcademico: 'graduado' }
              ]
            },
            { condicion: { $ne: 'inactivo' } },
            { estadoAcademico: { $ne: 'suspendido' } },
            { isActive: { $ne: false } }
          ]
        };
        break;
        
      default:
        // Si no hay mapeo, buscar directamente en condicion
        query.condicion = condicionValue;
        condicionFilter = null; // No aplicar lógica especial
        break;
    }
    
    // Aplicar el filtro solo si se creó uno
    if (condicionFilter) {
      // Si ya hay un $or (por búsqueda de texto), usar $and para combinar
      if (query.$or) {
        condicionesAnd.push({ $or: query.$or });
        condicionesAnd.push(condicionFilter);
        delete query.$or;
        query.$and = condicionesAnd;
      } else {
        // Si no hay búsqueda de texto, poner el filtro de condición directamente
        if (condicionFilter.$or) {
          query.$or = condicionFilter.$or;
        } else {
          Object.assign(query, condicionFilter);
        }
      }
    }
  }

  return query;
};

/**
 * Lista estudiantes con filtros y paginación
 * @param {Object} filtros - Filtros de búsqueda
 * @param {Object} opciones - Opciones de paginación y ordenamiento
 * @returns {Object} Resultado con estudiantes y paginación
 */
exports.listarEstudiantes = async (filtros = {}, opciones = {}) => {
  const query = construirFiltrosEstudiantes(filtros);
  
  const defaultOptions = {
    page: 1,
    limit: 10,
    sort: { lastName: 1, firstName: 1 },
    select: '-password'
  };
  
  const finalOptions = { ...defaultOptions, ...opciones };
  
  return await userService.findUsers(query, finalOptions);
};

/**
 * Obtiene estadísticas de estudiantes
 * @returns {Object} Estadísticas agregadas
 */
exports.obtenerEstadisticasEstudiantes = async () => {
  const totalStudents = await userService.countUsers({ role: 'estudiante' });
  
  // Activos e Inscriptos: condicion='activo' O estadoAcademico='en_curso' O estadoAcademico='inscrito'
  const activeStudents = await userService.countUsers({
    role: 'estudiante',
    $or: [
      { condicion: 'activo' },
      { estadoAcademico: 'en_curso' },
      { estadoAcademico: 'inscrito' }
    ]
  });
  
  const inactiveStudents = await userService.countUsers({ 
    role: 'estudiante', 
    isActive: false 
  });
  
  // Graduados: condicion='graduado' O estadoAcademico='graduado' (excluyendo inactivos)
  const graduatedStudents = await userService.countUsers({
    role: 'estudiante',
    $and: [
      {
        $or: [
          { condicion: 'graduado' },
          { estadoAcademico: 'graduado' }
        ]
      },
      { condicion: { $ne: 'inactivo' } },
      { estadoAcademico: { $ne: 'suspendido' } },
      { isActive: { $ne: false } }
    ]
  });
  
  // Estadísticas por nivel (activos e inscriptos)
  const levelStats = await userService.getAggregateStats([
    { 
      $match: { 
        role: 'estudiante',
        $or: [
          { condicion: 'activo' },
          { estadoAcademico: 'en_curso' },
          { estadoAcademico: 'inscrito' }
        ]
      } 
    },
    { $group: { _id: '$nivel', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);

  // Estadísticas por condición académica (activos e inscriptos)
  const conditionStats = await userService.getAggregateStats([
    { 
      $match: { 
        role: 'estudiante',
        $or: [
          { condicion: 'activo' },
          { estadoAcademico: 'en_curso' },
          { estadoAcademico: 'inscrito' }
        ]
      } 
    },
    { $group: { _id: '$condicion', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);

  return {
    overview: {
      total: totalStudents,
      active: activeStudents,
      inactive: inactiveStudents,
      graduated: graduatedStudents
    },
    byLevel: levelStats,
    byCondition: conditionStats
  };
};

/**
 * Obtiene un estudiante por ID
 * @param {String} estudianteId - ID del estudiante
 * @returns {Object} Estudiante encontrado
 * @throws {Error} Si el estudiante no existe o no es un estudiante
 */
exports.obtenerEstudiantePorId = async (estudianteId) => {
  const student = await userService.findUserById(estudianteId);
  
  if (!student || student.role !== 'estudiante') {
    throw new Error('Estudiante no encontrado');
  }
  
  return student;
};

/**
 * Actualiza un estudiante
 * @param {String} estudianteId - ID del estudiante
 * @param {Object} datosActualizacion - Datos a actualizar
 * @returns {Object} Estudiante actualizado
 */
exports.actualizarEstudiante = async (estudianteId, datosActualizacion) => {
  // Verificar que existe y es estudiante
  await exports.obtenerEstudiantePorId(estudianteId);
  
  // Capitalizar nombres si se proporcionan
  const { capitalizeUserNames } = require('../utils/stringHelpers');
  const updateData = { ...datosActualizacion };
  
  if (updateData.firstName) {
    updateData.firstName = capitalizeUserNames({ firstName: updateData.firstName }).firstName;
  }
  if (updateData.lastName) {
    updateData.lastName = capitalizeUserNames({ lastName: updateData.lastName }).lastName;
  }
  
  // Mapear condicion a estadoAcademico si se proporciona
  if (updateData.condicion) {
    const estadoMap = {
      'activo': 'en_curso',
      'inactivo': 'suspendido', 
      'graduado': 'graduado'
    };
    updateData.estadoAcademico = estadoMap[updateData.condicion] || 'inscrito';
  }
  
  return await userService.updateUser(estudianteId, updateData);
};

/**
 * Desactiva un estudiante
 * @param {String} estudianteId - ID del estudiante
 * @returns {Object} Estudiante desactivado
 */
exports.desactivarEstudiante = async (estudianteId) => {
  await exports.obtenerEstudiantePorId(estudianteId);
  return await userService.updateUser(estudianteId, { isActive: false });
};

/**
 * Reactiva un estudiante
 * @param {String} estudianteId - ID del estudiante
 * @returns {Object} Estudiante reactivado
 */
exports.reactivarEstudiante = async (estudianteId) => {
  await exports.obtenerEstudiantePorId(estudianteId);
  return await userService.updateUser(estudianteId, { isActive: true });
};

