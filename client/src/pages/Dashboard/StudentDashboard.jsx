import React, { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth.jsx'
import ForcePasswordChange from '../../components/common/ForcePasswordChange'
import AuthNavbar from '../../components/common/AuthNavbar'
import StudentAttendanceForm from '../../components/attendance/StudentAttendanceForm'
import apiAdapter from '../../services/apiAdapter'
import cobroAPI from '../../services/cobroApi'
import '../../styles/variables.css'
import '../../styles/auth.css'
import '../../styles/charts.css'
import { 
  FaCalendarAlt, 
  FaChartLine, 
  FaBookOpen,
  FaClock,
  FaCheckCircle,
  FaDollarSign,
  FaSignOutAlt,
  FaUser,
  FaUserCheck,
  FaExclamationTriangle
} from 'react-icons/fa'


const StudentDashboard = () => {
  console.log('StudentDashboard component rendering...')
  
  const { user, logout, mustChangePassword } = useAuth()
  const [showPasswordChange, setShowPasswordChange] = useState(false) // Disabled for testing
  const [misClases, setMisClases] = useState([])
  const [misCursos, setMisCursos] = useState([])
  const [misPagos, setMisPagos] = useState([])
  const [asistenciaStats, setAsistenciaStats] = useState({})
  const [loading, setLoading] = useState(true)
  const [selectedClase, setSelectedClase] = useState(null)
  const [showAttendanceForm, setShowAttendanceForm] = useState(false)
  const [cursoCalificacionesAbierto, setCursoCalificacionesAbierto] = useState(null)
  
  console.log('StudentDashboard - user:', user)
  console.log('StudentDashboard - mustChangePassword:', mustChangePassword)
  console.log('showPasswordChange (overridden):', showPasswordChange)

  useEffect(() => {
    if (user?._id || user?.id) {
      cargarDatos()
    }
  }, [user])

  const cargarDatos = async () => {
    try {
      setLoading(true)
      const estudianteId = user._id || user.id
      
      // Cargar cursos del estudiante
      const cursosResponse = await apiAdapter.courses.getMyCourses()
      console.log('Respuesta de getMyCourses:', cursosResponse)
      if (cursosResponse?.data?.success) {
        const cursos = cursosResponse.data.data || []
        console.log('Cursos cargados:', cursos.length, cursos)
        setMisCursos(cursos)
        
        // Cargar estadísticas de asistencia para TODOS los cursos (no solo los que tienen clases)
        const cursosIds = cursos.map(c => c._id || c.id).filter(Boolean)
        console.log('Cargando estadísticas para cursos:', cursosIds)
        
        const statsPromises = cursosIds.map(cursoId => 
          apiAdapter.classes.obtenerEstadisticasAsistencia(estudianteId, cursoId)
            .catch(err => {
              console.error(`Error cargando estadísticas para curso ${cursoId}:`, err)
              return null
            })
        )
        const statsResults = await Promise.all(statsPromises)
        
        const statsMap = {}
        statsResults.forEach((result, index) => {
          if (result?.data?.success && result.data.data) {
            const cursoId = cursosIds[index]
            const curso = cursos.find(c => (c._id || c.id) === cursoId)
            statsMap[cursoId] = {
              ...result.data.data,
              cursoNombre: curso?.nombre || curso?.name || 'Curso'
            }
          }
        })
        console.log('Estadísticas cargadas:', statsMap)
        setAsistenciaStats(statsMap)
      } else {
        console.error('Error obteniendo cursos:', cursosResponse?.data)
        setMisCursos([])
      }
      
      // Cargar clases del estudiante (sin filtro de estado para ver todas)
      const clasesResponse = await apiAdapter.classes.getMisClases({
        page: 1,
        limit: 50
      })

      if (clasesResponse?.data?.success) {
        // El endpoint puede devolver clases directamente o dentro de un objeto
        const clases = clasesResponse.data.data?.clases ||
                       (Array.isArray(clasesResponse.data.data) ? clasesResponse.data.data : []) || []
        console.log('Clases cargadas:', clases.length, clases)
        console.log('Clases con fechaHora:', clases.filter(c => c.fechaHora).map(c => ({
          titulo: c.titulo,
          fechaHora: c.fechaHora,
          estado: c.estado
        })))
        setMisClases(clases)
      }

      // Cargar cobros del estudiante
      try {
        const cobrosResponse = await cobroAPI.getMisCobros()
        console.log('Respuesta de cobros:', cobrosResponse)

        if (cobrosResponse?.success && cobrosResponse?.data) {
          // Transformar cobros al formato que espera el UI
          const cobrosFormateados = cobrosResponse.data.map(cobro => {
            // Crear descripción del concepto basado en las facturas
            const conceptos = cobro.facturas?.map(f =>
              `${f.facturaId?.numeroFactura || 'Factura'}`
            ).join(', ') || 'Pago'

            return {
              id: cobro._id,
              amount: cobro.montoTotal,
              date: new Date(cobro.fechaCobro).toLocaleDateString('es-AR'),
              status: 'paid', // Los cobros siempre están pagados
              concept: `${conceptos} - ${cobro.metodoCobro}`,
              numeroRecibo: cobro.numeroRecibo
            }
          })
          console.log('Cobros formateados:', cobrosFormateados)
          setMisPagos(cobrosFormateados)
        }
      } catch (error) {
        console.log('No se pudieron cargar los cobros:', error)
        // No es un error crítico, simplemente no mostramos pagos
        setMisPagos([])
      }
    } catch (error) {
      console.error('Error cargando datos:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
      // Navigation to login will be handled by useAuth effect
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const handlePasswordChanged = () => {
    setShowPasswordChange(false)
  }

  const handleRegistrarAsistencia = (clase) => {
    setSelectedClase(clase)
    setShowAttendanceForm(true)
  }

  const handleAsistenciaRegistrada = () => {
    setShowAttendanceForm(false)
    setSelectedClase(null)
    cargarDatos() // Recargar datos
  }

  const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('es-AR', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const puedeRegistrarAsistencia = (clase) => {
    if (!clase.fechaHora) {
      console.log('puedeRegistrarAsistencia - clase sin fechaHora:', clase)
      return false
    }
    const fechaClase = new Date(clase.fechaHora)
    const ahora = new Date()
    const horasDesdeClase = (ahora - fechaClase) / (1000 * 60 * 60)
    console.log('puedeRegistrarAsistencia - clase:', clase.titulo, 'fechaClase:', fechaClase, 'horasDesdeClase:', horasDesdeClase.toFixed(2))
    // Puede registrar hasta 24 horas después de la clase
    const puede = horasDesdeClase >= 0 && horasDesdeClase <= 24
    console.log('puedeRegistrarAsistencia - puede:', puede)
    return puede
  }

  // Show forced password change if required
  // Temporarily disabled for testing
  if (false && showPasswordChange) {
    return <ForcePasswordChange onPasswordChanged={handlePasswordChanged} />
  }

  console.log('Rendering main StudentDashboard content!')
  
  return (
    <div className="dashboard-container">
      {/* Header */}
        <AuthNavbar user={user} onLogout={handleLogout} showBackButton={false} />

      {/* Alerta de Asistencia - Si está cerca del límite */}
      {(() => {
        const cursosEnRiesgo = Object.entries(asistenciaStats).filter(([cursoId, stats]) => 
          stats.estaCercaDelLimite
        );
        
        if (cursosEnRiesgo.length > 0) {
          return (
            <div
              style={{
                marginBottom: '1rem',
                padding: '1rem 1.5rem',
                borderRadius: '8px',
                background: '#fff3cd',
                border: '2px solid #ffc107',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <FaExclamationTriangle style={{ fontSize: '1.5rem', color: '#856404' }} />
                <strong style={{ color: '#856404', fontSize: '1rem' }}>
                  ⚠️ Alerta de Asistencia
                </strong>
              </div>
              <div style={{ fontSize: '0.9rem', color: '#856404', lineHeight: '1.6' }}>
                {cursosEnRiesgo.length === 1 ? (
                  <div>
                    Te estás acercando al límite de inasistencias en el curso{' '}
                    <strong>{cursosEnRiesgo[0][1].cursoNombre || 'tu curso'}</strong>.
                    {cursosEnRiesgo[0][1].inasistenciasRestantes !== undefined && (
                      <div style={{ marginTop: '0.5rem' }}>
                        {cursosEnRiesgo[0][1].inasistenciasRestantes === 0 ? (
                          <span style={{ fontWeight: 600, color: '#721c24' }}>
                            ⚠️ Has alcanzado el límite de inasistencias permitidas.
                          </span>
                        ) : cursosEnRiesgo[0][1].inasistenciasRestantes === 1 ? (
                          <span>
                            Te queda <strong>1 falta</strong> antes de alcanzar el límite.
                          </span>
                        ) : (
                          <span>
                            Te quedan <strong>{cursosEnRiesgo[0][1].inasistenciasRestantes} faltas</strong> antes de alcanzar el límite.
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    Te estás acercando al límite de inasistencias en {cursosEnRiesgo.length} cursos:
                    <ul style={{ marginTop: '0.5rem', marginLeft: '1.5rem', padding: 0 }}>
                      {cursosEnRiesgo.map(([cursoId, stats]) => (
                        <li key={cursoId} style={{ marginBottom: '0.5rem' }}>
                          <strong>{stats.cursoNombre || 'Curso'}</strong>
                          {stats.inasistenciasRestantes !== undefined && (
                            <span>
                              {' '}
                              {stats.inasistenciasRestantes === 0
                                ? '(límite alcanzado)'
                                : stats.inasistenciasRestantes === 1
                                ? '(1 falta antes del límite)'
                                : `(${stats.inasistenciasRestantes} faltas antes del límite)`}
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          );
        }
        return null;
      })()}

      {/* User Info */}
      <div className="dashboard-info-card">
        <h3 className="dashboard-info-card__title">Información Personal</h3>
        <p className="dashboard-info-card__text"><strong>Email:</strong> {user?.email}</p>
        <p className="dashboard-info-card__text"><strong>DNI:</strong> {user?.dni}</p>
        {user?.nivel && <p className="dashboard-info-card__text"><strong>Nivel:</strong> {user.nivel.toUpperCase()}</p>}
        {user?.estadoAcademico && <p className="dashboard-info-card__text"><strong>Estado:</strong> {user.estadoAcademico}</p>}
      </div>

      {/* Dashboard Cards */}
      <div className="dashboard-cards-grid">
        {/* Mis Cursos */}
        <div className="dashboard-card" style={{ gridColumn: '1 / -1' }}>
          <div className="dashboard-card__header">
            <FaBookOpen className="dashboard-card__icon" />
            <h4 className="dashboard-card__title">Mis Cursos</h4>
          </div>
          {loading ? (
            <div style={{ padding: '1rem', textAlign: 'center' }}>Cargando cursos...</div>
          ) : misCursos.length === 0 ? (
            <div style={{ padding: '1rem', textAlign: 'center', color: '#6c757d' }}>
              No estás inscrito en ningún curso
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
              {misCursos.map((curso) => {
                const profesor = curso.profesor
                const horarios = curso.horarios && curso.horarios.length > 0 
                  ? curso.horarios 
                  : (curso.horario ? [curso.horario] : [])
                
                const inscripcion = curso.inscripcion || {}

                const tieneCalificaciones =
                  inscripcion.tp1 != null ||
                  inscripcion.tp2 != null ||
                  inscripcion.parcial1 != null ||
                  inscripcion.parcial2 != null ||
                  inscripcion.examenFinal != null ||
                  (inscripcion.notasAdicionales && inscripcion.notasAdicionales.trim() !== '')

                const esCursoSeleccionado = cursoCalificacionesAbierto === (curso._id || curso.id)

                return (
                  <div 
                    key={curso._id || curso.id} 
                    style={{
                      border: '1px solid #e1e5e9',
                      borderRadius: '8px',
                      padding: '1rem',
                      background: 'white'
                    }}
                  >
                    <div style={{ marginBottom: '0.75rem' }}>
                      <h5 style={{ margin: '0 0 0.5rem 0', color: '#2c3e50', fontSize: '1rem', fontWeight: 600 }}>
                        {curso.nombre}
                      </h5>
                      <div style={{ fontSize: '0.85rem', color: '#6c757d' }}>
                        {curso.idioma && curso.nivel && (
                          <span>{curso.idioma.charAt(0).toUpperCase() + curso.idioma.slice(1)} - {curso.nivel}</span>
                        )}
                      </div>
                    </div>
                    
                    {profesor && (
                      <div style={{ marginBottom: '0.75rem', fontSize: '0.9rem' }}>
                        <strong style={{ color: '#495057' }}>Profesor:</strong>{' '}
                        <span style={{ color: '#6c757d' }}>
                          {profesor.firstName} {profesor.lastName}
                        </span>
                      </div>
                    )}
                    
                    {horarios.length > 0 && (
                      <div style={{ marginBottom: '0.75rem' }}>
                        <strong style={{ color: '#495057', fontSize: '0.9rem', display: 'block', marginBottom: '0.25rem' }}>
                          Horarios:
                        </strong>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                          {horarios.map((horario, idx) => {
                            if (!horario) return null
                            const dia = horario.dia || ''
                            const horaInicio = horario.horaInicio || ''
                            const horaFin = horario.horaFin || ''
                            // Construir display si no viene
                            let display = horario.display || horario.descripcion
                            if (!display && dia && horaInicio && horaFin) {
                              const diaCapitalizado = dia.charAt(0).toUpperCase() + dia.slice(1)
                              display = `${diaCapitalizado} ${horaInicio} - ${horaFin}`
                            }
                            
                            return (
                              <div key={idx} style={{ fontSize: '0.85rem', color: '#6c757d', paddingLeft: '0.5rem' }}>
                                {display || 'Horario no disponible'}
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}
                    
                    {curso.fechaInicio && (
                      <div style={{ fontSize: '0.85rem', color: '#6c757d', marginTop: '0.5rem' }}>
                        <strong>Inicio:</strong>{' '}
                        {new Date(curso.fechaInicio).toLocaleDateString('es-AR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                    )}
                    
                    {curso.estado && (
                      <div style={{ marginTop: '0.75rem' }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '12px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          background: curso.estado === 'activo' ? '#d4edda' :
                                     curso.estado === 'planificado' ? '#fff3cd' :
                                     curso.estado === 'completado' ? '#d1ecf1' : '#f8d7da',
                          color: curso.estado === 'activo' ? '#155724' :
                                 curso.estado === 'planificado' ? '#856404' :
                                 curso.estado === 'completado' ? '#0c5460' : '#721c24'
                        }}>
                          {curso.estado}
                        </span>
                      </div>
                    )}

                    {tieneCalificaciones && (
                      <div style={{ marginTop: '0.75rem' }}>
                        <button
                          onClick={() =>
                            setCursoCalificacionesAbierto((prev) =>
                              prev === (curso._id || curso.id) ? null : (curso._id || curso.id)
                            )
                          }
                          style={{
                            padding: '0.5rem 0.75rem',
                            borderRadius: '6px',
                            border: '1px solid #0F5C8C',
                            background: esCursoSeleccionado ? '#0F5C8C' : 'white',
                            color: esCursoSeleccionado ? 'white' : '#0F5C8C',
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                        >
                          Mis calificaciones
                        </button>

                        {esCursoSeleccionado && (
                          <div
                            style={{
                              marginTop: '0.75rem',
                              padding: '0.75rem',
                              borderRadius: '8px',
                              border: '1px solid #e1e5e9',
                              background: '#f9fafb',
                              fontSize: '0.85rem',
                              color: '#374151'
                            }}
                          >
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(120px,1fr))', gap: '0.5rem' }}>
                              <div>
                                <strong>TP1:</strong>{' '}
                                {inscripcion.tp1 != null ? inscripcion.tp1 : '—'}
                              </div>
                              <div>
                                <strong>TP2:</strong>{' '}
                                {inscripcion.tp2 != null ? inscripcion.tp2 : '—'}
                              </div>
                              <div>
                                <strong>Parcial 1:</strong>{' '}
                                {inscripcion.parcial1 != null ? inscripcion.parcial1 : '—'}
                              </div>
                              <div>
                                <strong>Parcial 2:</strong>{' '}
                                {inscripcion.parcial2 != null ? inscripcion.parcial2 : '—'}
                              </div>
                              <div>
                                <strong>Examen final:</strong>{' '}
                                {inscripcion.examenFinal != null ? inscripcion.examenFinal : '—'}
                              </div>
                              <div>
                                <strong>Promedio:</strong>{' '}
                                {typeof inscripcion.promedioFinal === 'number'
                                  ? inscripcion.promedioFinal.toFixed(1)
                                  : '—'}
                              </div>
                            </div>
                            {inscripcion.notasAdicionales && inscripcion.notasAdicionales.trim() !== '' && (
                              <div style={{ marginTop: '0.75rem' }}>
                                <strong>Notas del profesor:</strong>
                                <div style={{ marginTop: '0.25rem', whiteSpace: 'pre-wrap' }}>
                                  {inscripcion.notasAdicionales}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Clases pendientes de registrar asistencia */}
        {(() => {
          const clasesPendientes = misClases.filter(clase => {
            const fechaClase = clase.fechaHora ? new Date(clase.fechaHora) : null
            const esPasada = fechaClase && fechaClase < new Date()
            return esPasada && puedeRegistrarAsistencia(clase)
          })
          
          if (clasesPendientes.length > 0) {
            return (
              <div className="dashboard-card" style={{ gridColumn: '1 / -1', background: '#fff3cd', border: '2px solid #ffc107' }}>
                <div className="dashboard-card__header">
                  <FaUserCheck className="dashboard-card__icon" style={{ color: '#856404' }} />
                  <h4 className="dashboard-card__title" style={{ color: '#856404' }}>
                    Clases pendientes de registrar asistencia ({clasesPendientes.length})
                  </h4>
                </div>
                {clasesPendientes.map((clase) => {
                  const cursoId = clase.curso?._id || clase.curso
                  const fechaClase = clase.fechaHora ? new Date(clase.fechaHora) : null
                  
                  return (
                    <div key={clase._id || clase.id} className="dashboard-card__item" style={{ background: 'white', marginBottom: '0.5rem' }}>
                      <div className="dashboard-card__item-title">
                        <FaBookOpen />
                        {clase.titulo || clase.title || 'Clase'}
                      </div>
                      {clase.curso && (
                        <div className="dashboard-card__item-subtitle" style={{ fontWeight: 600 }}>
                          {clase.curso.nombre || clase.curso.name || 'Curso'}
                        </div>
                      )}
                      {fechaClase && (
                        <div className="dashboard-card__item-subtitle">
                          <FaClock />
                          {formatDate(clase.fechaHora)}
                        </div>
                      )}
                      <button
                        onClick={() => handleRegistrarAsistencia(clase)}
                        style={{
                          marginTop: '0.5rem',
                          padding: '0.75rem 1.5rem',
                          background: '#0F5C8C',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '1rem',
                          fontWeight: 600,
                          width: '100%'
                        }}
                      >
                        <FaUserCheck style={{ marginRight: '0.5rem' }} />
                        Registrar mi asistencia
                      </button>
                    </div>
                  )
                })}
              </div>
            )
          }
          return null
        })()}

        {/* Upcoming Classes */}
        <div className="dashboard-card">
          <div className="dashboard-card__header">
            <FaCalendarAlt className="dashboard-card__icon" />
            <h4 className="dashboard-card__title">Mis Clases</h4>
          </div>
          {loading ? (
            <div style={{ padding: '1rem', textAlign: 'center' }}>Cargando clases...</div>
          ) : misClases.length === 0 ? (
            <div style={{ padding: '1rem', textAlign: 'center', color: '#6c757d' }}>
              <p>No tienes clases asignadas</p>
              <p style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>
                Si te inscribiste a un curso, asegúrate de que el profesor haya creado las clases para ese curso.
              </p>
            </div>
          ) : (
            misClases.map((clase) => {
              const cursoId = clase.curso?._id || clase.curso
              const stats = asistenciaStats[cursoId]
              const puedeRegistrar = puedeRegistrarAsistencia(clase)
              const fechaClase = clase.fechaHora ? new Date(clase.fechaHora) : null
              const esPasada = fechaClase && fechaClase < new Date()
              
              return (
                <div key={clase._id || clase.id} className={`dashboard-card__item ${esPasada ? 'dashboard-card__item--completed' : 'dashboard-card__item--scheduled'}`}>
                  <div className="dashboard-card__item-title">
                    <FaBookOpen />
                    {clase.titulo || clase.title || 'Clase'}
                  </div>
                  {clase.curso && (
                    <div className="dashboard-card__item-subtitle" style={{ fontWeight: 600 }}>
                      {clase.curso.nombre || clase.curso.name || 'Curso'}
                    </div>
                  )}
                  {fechaClase && (
                    <div className="dashboard-card__item-subtitle">
                      <FaClock />
                      {formatDate(clase.fechaHora)}
                    </div>
                  )}
                  {esPasada && puedeRegistrar && (
                    <button
                      onClick={() => handleRegistrarAsistencia(clase)}
                      style={{
                        marginTop: '0.5rem',
                        padding: '0.5rem 1rem',
                        background: '#0F5C8C',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        fontWeight: 600
                      }}
                    >
                      <FaUserCheck style={{ marginRight: '0.25rem' }} />
                      Registrar asistencia
                    </button>
                  )}
                </div>
              )
            })
          )}
        </div>

        {/* Payments */}
        <div className="dashboard-card">
          <div className="dashboard-card__header">
            <FaDollarSign className="dashboard-card__icon" />
            <h4 className="dashboard-card__title">Mis Pagos</h4>
          </div>
          {loading ? (
            <div style={{ padding: '1rem', textAlign: 'center' }}>Cargando pagos...</div>
          ) : misPagos.length === 0 ? (
            <div style={{ padding: '1rem', textAlign: 'center', color: '#6c757d' }}>
              No hay pagos registrados
            </div>
          ) : (
            misPagos.map((pago) => (
              <div key={pago.id} className={`dashboard-card__item ${pago.status === 'paid' ? 'dashboard-card__item--completed' : 'dashboard-card__item--pending'}`}>
                <div className="dashboard-card__item-header">
                  <span className="dashboard-card__item-title">
                    <FaDollarSign />
                    ${pago.amount.toLocaleString()}
                  </span>
                  <span className={`status-badge ${pago.status === 'paid' ? 'status-badge--paid' : 'status-badge--pending'}`}>
                    {pago.status === 'paid' ? 'Pagado' : 'Pendiente'}
                  </span>
                </div>
                <div className="dashboard-card__item-subtitle">{pago.concept}</div>
                <div className="dashboard-card__item-meta">
                  {pago.date}
                  {pago.numeroRecibo && (
                    <span style={{ marginLeft: '0.5rem', color: '#6c757d' }}>
                      · Recibo #{pago.numeroRecibo}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Attendance Progress */}
        <div className="dashboard-card">
          <div className="dashboard-card__header">
            <FaChartLine className="dashboard-card__icon" />
            <h4 className="dashboard-card__title">Mi Asistencia</h4>
          </div>
          {loading ? (
            <div style={{ padding: '1rem', textAlign: 'center' }}>Cargando estadísticas...</div>
          ) : Object.keys(asistenciaStats).length === 0 ? (
            <div style={{ padding: '1rem', textAlign: 'center', color: '#6c757d' }}>
              No hay estadísticas de asistencia disponibles
            </div>
          ) : (
            Object.entries(asistenciaStats).map(([cursoId, stats]) => {
              const porcentaje = stats.porcentajeAsistencia || 0
              const esRegular = stats.esAlumnoRegular || false
              const estaCercaDelLimite = stats.estaCercaDelLimite || false
              const color = esRegular ? 'var(--success)' : porcentaje >= 70 ? 'var(--warning)' : 'var(--danger)'
              const fillClass = esRegular ? 'progress-bar__fill--success' : porcentaje >= 70 ? 'progress-bar__fill--warning' : 'progress-bar__fill--danger'
              
              return (
                <div key={cursoId} className={`dashboard-card__item ${esRegular ? 'dashboard-card__item--completed' : 'dashboard-card__item--pending'}`}>
                  <div className="dashboard-card__item-header">
                    <span className="dashboard-card__item-title">
                      {esRegular ? (
                        <FaCheckCircle style={{ color: 'var(--success)' }} />
                      ) : (
                        <FaExclamationTriangle style={{ color: estaCercaDelLimite ? '#ffc107' : 'var(--warning)' }} />
                      )}
                      {stats.cursoNombre || 'Curso'}
                    </span>
                    <span className="dashboard-card__item-subtitle" style={{ color }}>
                      {porcentaje.toFixed(1)}%
                    </span>
                  </div>
                  <div className="progress-bar">
                    <div className={`progress-bar__fill ${fillClass}`} style={{ width: `${Math.min(100, porcentaje)}%` }}></div>
                  </div>
                  <div className="progress-text">
                    {stats.clasesAsistidas || 0} de {stats.totalClases || 0} clases asistidas
                    {stats.clasesFaltadas !== undefined && (
                      <span style={{ marginLeft: '0.5rem', color: '#6c757d' }}>
                        ({stats.clasesFaltadas} faltas)
                      </span>
                    )}
                  </div>
                  {estaCercaDelLimite && stats.inasistenciasRestantes !== undefined && (
                    <div style={{ 
                      marginTop: '0.5rem', 
                      padding: '0.75rem', 
                      background: '#fff3cd',
                      border: '1px solid #ffc107',
                      borderRadius: '4px',
                      fontSize: '0.85rem',
                      color: '#856404',
                      fontWeight: 500
                    }}>
                      ⚠️ {stats.inasistenciasRestantes === 0 
                        ? 'Has alcanzado el límite de inasistencias permitidas (15% del total de clases)'
                        : stats.inasistenciasRestantes === 1
                        ? 'Te queda 1 falta antes de alcanzar el límite de inasistencias (15% del total)'
                        : `Te quedan ${stats.inasistenciasRestantes} faltas antes de alcanzar el límite de inasistencias (15% del total)`}
                    </div>
                  )}
                  {stats.mensaje && !estaCercaDelLimite && (
                    <div style={{ 
                      marginTop: '0.5rem', 
                      padding: '0.5rem', 
                      background: esRegular ? '#e8f5e9' : '#fff3e0',
                      borderRadius: '4px',
                      fontSize: '0.85rem',
                      color: esRegular ? '#2e7d32' : '#e65100'
                    }}>
                      {stats.mensaje}
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Modal de registro de asistencia */}
      {showAttendanceForm && selectedClase && (
        <StudentAttendanceForm
          clase={selectedClase}
          onSuccess={handleAsistenciaRegistrada}
          onClose={() => {
            setShowAttendanceForm(false)
            setSelectedClase(null)
          }}
        />
      )}
    </div>
  )
}

export default StudentDashboard