import React, { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth.jsx'
import ForcePasswordChange from '../../components/common/ForcePasswordChange'
import RegisterStudent from '../../components/RegisterStudent'
import RegisterTeacher from '../../components/RegisterTeacher'
import api from '../../services/api'

const AdminDashboard = () => {
  const { user, logout, mustChangePassword } = useAuth()
  const [showPasswordChange, setShowPasswordChange] = useState(mustChangePassword)
  const [showRegisterStudent, setShowRegisterStudent] = useState(false)
  const [showRegisterTeacher, setShowRegisterTeacher] = useState(false)
  const [stats, setStats] = useState({
    totalStudents: 0,
    newStudents: 0,
    totalTeachers: 0,
    activeStudents: 0,
    scheduledClasses: 0,
    upcomingClasses: 0,
    pendingPayments: { count: 0, amount: 0 },
    monthlyRevenue: 0,
    completedClasses: 0,
    cancelledClasses: 0
  })
  const [loading, setLoading] = useState(true)

  // Fetch dashboard statistics
  useEffect(() => {
    fetchStats()
  }, [])

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const handlePasswordChanged = () => {
    setShowPasswordChange(false)
  }

  const handleStudentRegistered = () => {
    setShowRegisterStudent(false)
    // Refrescar estadísticas después del registro
    fetchStats()
  }

  const handleTeacherRegistered = () => {
    setShowRegisterTeacher(false)
    // Refrescar estadísticas después del registro
    fetchStats()
  }

  // Extraer la función fetchStats para poder reutilizarla
  const fetchStats = async () => {
    try {
      setLoading(true)
      // Obtener estudiantes y profesores por separado
      const studentsResponse = await api.get('/auth/students')
      const teachersResponse = await api.get('/auth/professors')
      
      if (studentsResponse.data.success && teachersResponse.data.success) {
        const students = Array.isArray(studentsResponse.data.data) ? studentsResponse.data.data : []
        const teachers = Array.isArray(teachersResponse.data.data) ? teachersResponse.data.data : []
        
        // Calculate new students (last 30 days)
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
        const newStudents = students.filter(s => 
          new Date(s.createdAt) > thirtyDaysAgo
        ).length

        // Calculate active students
        const activeStudents = students.filter(s => 
          s.estadoAcademico === 'en_curso' || s.estadoAcademico === 'inscrito'
        ).length

        setStats({
          totalStudents: students.length,
          newStudents,
          totalTeachers: teachers.length,
          activeStudents,
          scheduledClasses: 0, // TODO: Implement when classes model is ready
          upcomingClasses: 0, // TODO: Implement when classes model is ready
          pendingPayments: { count: 0, amount: 0 }, // TODO: Implement when payments model is ready
          monthlyRevenue: 0, // TODO: Implement when payments model is ready
          completedClasses: 0, // TODO: Implement when classes model is ready
          cancelledClasses: 0 // TODO: Implement when classes model is ready
        })
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  // Show forced password change if required
  if (showPasswordChange) {
    return <ForcePasswordChange onPasswordChanged={handlePasswordChanged} />
  }

  // Show register student modal
  if (showRegisterStudent) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.7)', // Fondo semitransparente normal
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 99999,
        padding: '20px'
      }}>
        <div style={{
          maxHeight: '90vh',
          overflowY: 'auto',
          width: '100%',
          maxWidth: '600px',
          position: 'relative',
          zIndex: 10000 // Un z-index aún más alto que el overlay
        }}>
          <RegisterStudent
            onSuccess={handleStudentRegistered}
            onCancel={() => setShowRegisterStudent(false)}
          />
        </div>
      </div>
    )
  }

  // Show register teacher modal
  if (showRegisterTeacher) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.7)', // Fondo semitransparente normal
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999, // Z-index muy alto
        padding: '20px'
      }}>
        <div style={{
          maxHeight: '90vh',
          overflowY: 'auto',
          width: '100%',
          maxWidth: '800px',
          position: 'relative',
          zIndex: 10000 // Un z-index aún más alto que el overlay
        }}>
          <RegisterTeacher
            onSuccess={handleTeacherRegistered}
            onCancel={() => setShowRegisterTeacher(false)}
          />
        </div>
      </div>
    )
  }

  return (
    <section className="section visible">
      <div className="container">
        {/* Header */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '2rem',
          background: 'var(--card-bg)',
          padding: '1.5rem',
          borderRadius: '10px',
          boxShadow: '0 5px 15px rgba(0,0,0,0.1)'
        }}>
          <div>
            <h2 className="section-title" style={{ marginBottom: '0.5rem', textAlign: 'left' }}>
              Panel de Administración
            </h2>
            <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
              ¡Bienvenido/a {user?.firstName}! Gestiona tu consultoría desde aquí.
            </p>
          </div>
          <button 
            onClick={handleLogout}
            className="login-btn"
            style={{
              background: '#dc3545',
              padding: '0.75rem 1.5rem',
              fontSize: '0.9rem'
            }}
          >
            Cerrar Sesión
          </button>
        </div>

        {/* KPI Cards */}
        <div style={{ marginBottom: '3rem' }}>
          <h3 style={{ 
            color: 'var(--primary)', 
            marginBottom: '1.5rem',
            fontSize: '1.5rem',
            fontWeight: '600'
          }}>
            📊 Overview del Sistema
          </h3>
          
          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <p>Cargando estadísticas...</p>
            </div>
          ) : (
            <div className="services-grid" style={{ 
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1.5rem'
            }}>
              <div className="service-card" style={{ 
                background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                color: 'white',
                border: 'none'
              }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>👥</div>
                <h3 style={{ color: 'white', fontSize: '2rem', margin: '0.5rem 0' }}>
                  {stats.totalStudents}
                </h3>
                <p style={{ margin: '0.5rem 0', opacity: 0.9 }}>Total Estudiantes</p>
                <small style={{ opacity: 0.8 }}>
                  {stats.activeStudents} activos • {stats.newStudents} nuevos (30d)
                </small>
              </div>

              <div className="service-card" style={{ 
                background: 'linear-gradient(135deg, var(--accent), #4A9FD9)',
                color: 'white',
                border: 'none'
              }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🎓</div>
                <h3 style={{ color: 'white', fontSize: '2rem', margin: '0.5rem 0' }}>
                  {stats.totalTeachers}
                </h3>
                <p style={{ margin: '0.5rem 0', opacity: 0.9 }}>Total Profesores</p>
                <small style={{ opacity: 0.8 }}>Especialidades variadas</small>
              </div>

              <div className="service-card" style={{ 
                background: 'linear-gradient(135deg, #28a745, #20c997)',
                color: 'white',
                border: 'none'
              }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📚</div>
                <h3 style={{ color: 'white', fontSize: '2rem', margin: '0.5rem 0' }}>
                  {stats.scheduledClasses}
                </h3>
                <p style={{ margin: '0.5rem 0', opacity: 0.9 }}>Clases Programadas</p>
                <small style={{ opacity: 0.8 }}>Próximas 24h: {stats.upcomingClasses}</small>
              </div>

              <div className="service-card" style={{ 
                background: 'linear-gradient(135deg, #ffc107, #fd7e14)',
                color: 'white',
                border: 'none'
              }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>💰</div>
                <h3 style={{ color: 'white', fontSize: '1.5rem', margin: '0.5rem 0' }}>
                  ${stats.monthlyRevenue.toLocaleString()}
                </h3>
                <p style={{ margin: '0.5rem 0', opacity: 0.9 }}>Ingresos del Mes</p>
                <small style={{ opacity: 0.8 }}>
                  Pagos pendientes: {stats.pendingPayments.count}
                </small>
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div style={{ marginBottom: '3rem' }}>
          <h3 style={{ 
            color: 'var(--primary)', 
            marginBottom: '1.5rem',
            fontSize: '1.5rem',
            fontWeight: '600'
          }}>
            ⚡ Acciones Rápidas
          </h3>
          
          <div className="services-grid" style={{ 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '1.5rem'
          }}>
            <div className="service-card">
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👨‍🎓</div>
              <h4 style={{ color: 'var(--primary)', marginBottom: '1rem' }}>
                Gestión de Estudiantes
              </h4>
              <p style={{ marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>
                Registrar nuevos estudiantes, actualizar niveles, gestionar estados académicos
              </p>
              <button 
                className="cta-btn" 
                style={{ width: '100%' }}
                onClick={() => {
                  console.log('Click en Registrar Estudiante')
                  setShowRegisterStudent(true)
                }}
              >
                Registrar Estudiante
              </button>
            </div>
            
            <div className="service-card">
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👨‍🏫</div>
              <h4 style={{ color: 'var(--primary)', marginBottom: '1rem' }}>
                Gestión de Profesores
              </h4>
              <p style={{ marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>
                Registrar profesores, gestionar especialidades, configurar horarios
              </p>
              <button 
                className="cta-btn" 
                style={{ width: '100%' }}
                onClick={() => {
                  console.log('Click en Registrar Profesor')
                  setShowRegisterTeacher(true)
                }}
              >
                Registrar Profesor
              </button>
            </div>
            
            <div className="service-card">
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📅</div>
              <h4 style={{ color: 'var(--primary)', marginBottom: '1rem' }}>
                Gestión de Clases
              </h4>
              <p style={{ marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>
                Programar clases, asignar profesores, gestionar horarios
              </p>
              <button className="cta-btn" style={{ width: '100%' }}>
                Gestionar Clases
              </button>
            </div>
            
            <div className="service-card">
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💳</div>
              <h4 style={{ color: 'var(--primary)', marginBottom: '1rem' }}>
                Pagos y Finanzas
              </h4>
              <p style={{ marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>
                Gestionar pagos, generar facturas, revisar ingresos
              </p>
              <button className="cta-btn" style={{ width: '100%' }}>
                Ver Finanzas
              </button>
            </div>
            
            <div className="service-card">
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📊</div>
              <h4 style={{ color: 'var(--primary)', marginBottom: '1rem' }}>
                Reportes
              </h4>
              <p style={{ marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>
                Estadísticas académicas, reportes financieros, exportaciones
              </p>
              <button className="cta-btn" style={{ width: '100%' }}>
                Ver Reportes
              </button>
            </div>
            
            <div className="service-card">
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚙️</div>
              <h4 style={{ color: 'var(--primary)', marginBottom: '1rem' }}>
                Configuración
              </h4>
              <p style={{ marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>
                Configurar sistema, gestionar roles, ajustar parámetros
              </p>
              <button className="cta-btn" style={{ width: '100%' }}>
                Configurar Sistema
              </button>
            </div>
          </div>
        </div>

        {/* Admin Profile Info */}
        <div className="service-card" style={{ marginBottom: '2rem' }}>
          <h3 style={{ color: 'var(--primary)', marginBottom: '1.5rem' }}>
            👤 Información Personal
          </h3>
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1rem',
            textAlign: 'left'
          }}>
            <div>
              <p><strong>Nombre:</strong> {user?.firstName} {user?.lastName}</p>
              <p><strong>Email:</strong> {user?.email}</p>
            </div>
            <div>
              <p><strong>DNI:</strong> {user?.dni}</p>
              <p><strong>Rol:</strong> Administrador</p>
            </div>
            {user?.phone && (
              <div>
                <p><strong>Teléfono:</strong> {user.phone}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

export default AdminDashboard