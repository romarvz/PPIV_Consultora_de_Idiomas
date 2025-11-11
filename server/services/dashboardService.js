/**
 * Servicio de Dashboard
 * Consolida datos de todos los módulos del sistema
 * 
 * IMPORTANTE: Este servicio CONSUME datos de otros módulos
 * No crea datos, solo los consulta y agrupa
 * 
 */

const Empresa = require('../models/Empresa')
const BaseUser = require('../models/BaseUser')

// ===== IMPORTS DE  CURSOS y CLASES =====
const Curso = require('../models/Curso')
const Clase = require('../models/Clase')

// ===== IMPORTS DE COBROS Y FACTURAS =====
const Cobro = require('../models/cobros.model')
const Factura = require('../models/factura.model')

// ===== CACHÉ PARA OPTIMIZACIÓN =====
let cacheKPIs = null
let ultimaActualizacionCache = null
const CACHE_DURACION = 5 * 60 * 1000 // 5 minutos


/**
 * Obtener estadísticas generales de la empresa
 */
const obtenerEstadisticasEmpresa = async () => {
  try {
    // Contar usuarios por rol
    const totalEstudiantes = await BaseUser.countDocuments({ __t: 'estudiante', isActive: true })
    const totalProfesores = await BaseUser.countDocuments({ __t: 'profesor', isActive: true })
    const totalAdmins = await BaseUser.countDocuments({ __t: 'admin', isActive: true })
    
    // Contar cursos activos
    const cursosActivos = await Curso.countDocuments({ estado: 'activo' })
    
    // Contar clases totales
    const totalClases = await Clase.countDocuments()
    
    // Calcular ingresos del mes
    const ingresosDelMes = await calcularIngresosMes()
    
    // Contar facturas pendientes
    const facturasPendientes = await Factura.countDocuments({ estado: 'Pendiente' })
    
    return {
      usuarios: {
        estudiantes: totalEstudiantes,
        profesores: totalProfesores,
        admins: totalAdmins,
        total: totalEstudiantes + totalProfesores + totalAdmins
      },
      cursos: cursosActivos,
      clases: totalClases,
      ingresos: {
        delMes: ingresosDelMes,
        facturasPendientes
      }
    }
  } catch (error) {
    console.error('❌ Error al obtener estadísticas:', error.message)
    throw error
  }
}

/**
 * Calcular ingresos del mes actual
 * USA MODELO COBRO
 */
const calcularIngresosMes = async () => {
  try {
    const inicioMes = new Date()
    inicioMes.setDate(1)
    inicioMes.setHours(0, 0, 0, 0)
    
    const finMes = new Date()
    finMes.setMonth(finMes.getMonth() + 1)
    finMes.setDate(0)
    finMes.setHours(23, 59, 59, 999)
    
    // Sumar todos los cobros del mes
    const resultado = await Cobro.aggregate([
      {
        $match: {
          fechaCobro: {
            $gte: inicioMes,
            $lte: finMes
          }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$monto' }
        }
      }
    ])
    
    return resultado[0]?.total || 0
  } catch (error) {
    console.error('❌ Error al calcular ingresos del mes:', error.message)
    return 0
  }
}

/**
 * Calcular ingresos por mes (últimos N meses)
 * Para gráficos
 */
const calcularIngresosPorMes = async (meses = 6) => {
  try {
    const resultado = []
    
    for (let i = meses - 1; i >= 0; i--) {
      const fecha = new Date()
      fecha.setMonth(fecha.getMonth() - i)
      
      const inicioMes = new Date(fecha.getFullYear(), fecha.getMonth(), 1)
      const finMes = new Date(fecha.getFullYear(), fecha.getMonth() + 1, 0, 23, 59, 59)
      
      const ingresos = await Cobro.aggregate([
        {
          $match: {
            fechaCobro: {
              $gte: inicioMes,
              $lte: finMes
            }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$monto' }
          }
        }
      ])
      
      resultado.push({
        mes: inicioMes.toLocaleString('es-AR', { month: 'short', year: 'numeric' }),
        ingresos: ingresos[0]?.total || 0
      })
    }
    
    return resultado
  } catch (error) {
    console.error('❌ Error al calcular ingresos por mes:', error.message)
    return []
  }
}

/**
 * Obtener actividad reciente (últimos 7 días)
 */
const obtenerActividadReciente = async () => {
  try {
    const hace7Dias = new Date()
    hace7Dias.setDate(hace7Dias.getDate() - 7)
    
    // Últimas inscripciones (cursos creados recientemente)
    const inscripciones = await Curso.find({
      createdAt: { $gte: hace7Dias }
    })
    .select('nombre estudiantes createdAt idioma nivel')
    .populate('estudiantes', 'firstName lastName')
    .populate('profesor', 'firstName lastName')
    .limit(5)
    .sort({ createdAt: -1 })
    .lean()
    
    // Últimos cobros 
    const cobros = await Cobro.find({
      fechaCobro: { $gte: hace7Dias }
    })
    .select('numeroRecibo monto metodoCobro fechaCobro estudiante')
    .populate('estudiante', 'firstName lastName')
    .limit(5)
    .sort({ fechaCobro: -1 })
    .lean()
    
    // Próximas clases (siguientes 7 días)
    const dentro7Dias = new Date()
    dentro7Dias.setDate(dentro7Dias.getDate() + 7)
    
    const proximasClases = await Clase.find({
      fechaHora: {
        $gte: new Date(),
        $lte: dentro7Dias
      },
      estado: 'programada'
    })
    .select('titulo curso profesor fechaHora duracionMinutos modalidad')
    .populate('curso', 'nombre idioma nivel')
    .populate('profesor', 'firstName lastName')
    .limit(5)
    .sort({ fechaHora: 1 })
    .lean()
    
    return {
      inscripciones,
      cobros,
      proximasClases
    }
  } catch (error) {
    console.error('❌ Error al obtener actividad reciente:', error.message)
    return {
      inscripciones: [],
      cobros: [],
      proximasClases: []
    }
  }
}

/**
 * Obtener datos para gráficos del dashboard
 */
const obtenerDatosGraficos = async () => {
  try {
    // Gráfico 1: Ingresos por mes
    const ingresosPorMes = await calcularIngresosPorMes(6)
    
    // Gráfico 2: Estudiantes por idioma (Lorena)
    const estudiantesPorIdioma = await Curso.aggregate([
      {
        $match: { estado: 'activo' }
      },
      {
        $group: {
          _id: '$idioma',
          cantidad: { $sum: { $size: '$estudiantes' } }
        }
      },
      {
        $sort: { cantidad: -1 }
      }
    ])
    
    // Gráfico 3: Clases por estado
    const clasesPorEstado = await Clase.aggregate([
      {
        $group: {
          _id: '$estado',
          cantidad: { $sum: 1 }
        }
      }
    ])
    
    // Gráfico 4: Cobros por método
    const cobrosPorMetodo = await Cobro.aggregate([
      {
        $group: {
          _id: '$metodoCobro',
          cantidad: { $sum: 1 },
          totalMonto: { $sum: '$monto' }
        }
      },
      {
        $sort: { totalMonto: -1 }
      }
    ])
    
    return {
      ingresosPorMes,
      estudiantesPorIdioma,
      clasesPorEstado,
      cobrosPorMetodo
    }
  } catch (error) {
    console.error('❌ Error al obtener datos de gráficos:', error.message)
    throw error
  }
}

/**
 * Obtener información general de la empresa
 */
const obtenerInfoEmpresa = async () => {
  try {
    let empresa = await Empresa.findOne({ activa: true })
    
    // Si no existe, crear una empresa por defecto
    if (!empresa) {
      empresa = await Empresa.create({
        nombre: 'Consultora de Idiomas',
        contacto: {
          email: 'info@consultora.com',
          telefono: '+54 11 1234-5678'
        },
        direccion: {
          ciudad: 'Buenos Aires',
          provincia: 'Buenos Aires',
          pais: 'Argentina'
        }
      })
    }
    
    return empresa
  } catch (error) {
    console.error('❌ Error al obtener info empresa:', error.message)
    throw error
  }
}

/**
 * Obtener KPIs principales del dashboard
 */
const obtenerKPIs = async () => {
  try {
    const estadisticas = await obtenerEstadisticasEmpresa()
    
    // Contar clases del mes actual
    const inicioMes = new Date()
    inicioMes.setDate(1)
    inicioMes.setHours(0, 0, 0, 0)
    
    const clasesDelMes = await Clase.countDocuments({
      fechaHora: { $gte: inicioMes },
      estado: { $in: ['programada', 'completada'] }
    })
    
    return {
      totalUsuarios: estadisticas.usuarios.total,
      estudiantesActivos: estadisticas.usuarios.estudiantes,
      profesoresActivos: estadisticas.usuarios.profesores,
      cursosActivos: estadisticas.cursos,
      clasesDelMes,
      ingresosMes: estadisticas.ingresos.delMes,
      facturasPendientes: estadisticas.ingresos.facturasPendientes
    }
  } catch (error) {
    console.error('❌ Error al obtener KPIs:', error.message)
    throw error
  }
}

/**
 * Obtener KPIs con caché
 */
const obtenerKPIsConCache = async () => {
  const ahora = Date.now()
  
  // Si hay caché válido, retornarlo
  if (cacheKPIs && ultimaActualizacionCache && 
      (ahora - ultimaActualizacionCache) < CACHE_DURACION) {
    console.log('Retornando KPIs desde caché')
    return cacheKPIs
  }
  
  // Sino, calcular y cachear
  console.log('Calculando KPIs frescos...')
  const kpis = await obtenerKPIs()
  
  cacheKPIs = kpis
  ultimaActualizacionCache = ahora
  
  return kpis
}

/**
 * Invalidar caché manualmente
 */
const invalidarCache = () => {
  cacheKPIs = null
  ultimaActualizacionCache = null
  console.log('Caché de KPIs invalidado')
}

/**
 * Actualizar estadísticas de la empresa
 * Se llamará cuando otros módulos creen/actualicen datos
 */
const actualizarEstadisticas = async () => {
  try {
    const estadisticas = await obtenerEstadisticasEmpresa()
    
    await Empresa.findOneAndUpdate(
      { activa: true },
      {
        $set: {
          'estadisticas.totalEstudiantes': estadisticas.usuarios.estudiantes,
          'estadisticas.totalProfesores': estadisticas.usuarios.profesores,
          'estadisticas.totalCursos': estadisticas.cursos,
          'estadisticas.totalClases': estadisticas.clases,
          'estadisticas.ingresosTotal': estadisticas.ingresos.delMes
        }
      }
    )
    
    // Invalidar caché al actualizar
    invalidarCache()
    
    return true
  } catch (error) {
    console.error('❌ Error al actualizar estadísticas:', error.message)
    return false
  }
}

module.exports = {
  obtenerEstadisticasEmpresa,
  obtenerInfoEmpresa,
  obtenerKPIs,
  obtenerKPIsConCache,
  invalidarCache,
  actualizarEstadisticas,
  calcularIngresosMes,
  calcularIngresosPorMes,
  obtenerActividadReciente,
  obtenerDatosGraficos
}
