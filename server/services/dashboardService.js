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

// NOTA: Se agregan en semana 2 cuando Lorena y Ayelen los creen
// const Curso = require('../models/Curso')
// const Clase = require('../models/Clase')
// const Pago = require('../models/Pago')

/**
 * Obtener estadísticas generales de la empresa
 */
const obtenerEstadisticasEmpresa = async () => {
  try {
    // Contar usuarios por rol
    const totalEstudiantes = await BaseUser.countDocuments({ __t: 'estudiante', isActive: true })
    const totalProfesores = await BaseUser.countDocuments({ __t: 'profesor', isActive: true })
    const totalAdmins = await BaseUser.countDocuments({ __t: 'admin', isActive: true })
    
    // NOTA: Descomentar en Semana 2 cuando Lorena tenga sus modelos
    // const totalCursos = await Curso.countDocuments({ estado: 'activo' })
    // const totalClases = await Clase.countDocuments()
    
    // NOTA: Descomentar en Semana 2 cuando Ayelen tenga sus modelos
    // const ingresosDelMes = await calcularIngresosMes()
    // const pagosPendientes = await Pago.countDocuments({ estado: 'pendiente' })
    
    return {
      usuarios: {
        estudiantes: totalEstudiantes,
        profesores: totalProfesores,
        admins: totalAdmins,
        total: totalEstudiantes + totalProfesores + totalAdmins
      }
      // Descomentar en Semana 2:
      // cursos: totalCursos,
      // clases: totalClases,
      // ingresos: {
      //   delMes: ingresosDelMes,
      //   pendientes: pagosPendientes
      // }
    }
  } catch (error) {
    console.error('❌ Error al obtener estadísticas:', error.message)
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
    
    // NOTA: Estos cálculos se completan en Semana 2
    // cuando Lorena y Ayelen tengan sus módulos listos
    
    return {
      totalUsuarios: estadisticas.usuarios.total,
      estudiantesActivos: estadisticas.usuarios.estudiantes,
      profesoresActivos: estadisticas.usuarios.profesores
      // Descomentar en Semana 2:
      // cursosActivos: estadisticas.cursos,
      // clasesDelMes: 0,
      // ingresosMes: 0,
      // tasaCrecimiento: 0
    }
  } catch (error) {
    console.error('❌ Error al obtener KPIs:', error.message)
    throw error
  }
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
          'estadisticas.totalProfesores': estadisticas.usuarios.profesores
          // Agregar más campos en Semana 2
        }
      }
    )
    
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
  actualizarEstadisticas
}