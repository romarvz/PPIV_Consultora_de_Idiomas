import React, { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth.jsx'
import ForcChange from '../../components/common/ForcePasswordChange'

import RegisterTeacher from '../../components/RegisterTeacher'
import StudentsManagement from '../../components/StudentsManagement'
import TeachersManagement from '../../components/TeachersManagement'
import AdminHeader from '../../components/common/AdminHeader'
import ClassScheduler from '../../components/ClassScheduler';
import api from '../../services/api'
// React Icons - Updated for better UI
import { 
  FaUsers, 
  FaGraduationCap, 
  FaBookOpen, 
  FaDollarSign,
  FaUserGraduate,
  FaChalkboardTeacher,
  FaCalendarAlt,
  FaCreditCard,
  FaChartLine,
  FaCog,
  FaSignOutAlt,
  FaTasks
} from 'react-icons/fa'

const AdminDashboard = () => {
  const { user, logout, mustChangePassword } = useAuth()
  const [showPasswordChange, setShowPasswordChange] = useState(mustChangePassword)

  const [showRegisterTeacher, setShowRegisterTeacher] = useState(false)
  const [showStudentsManagement, setShowStudentsManagement] = useState(false)
  const [showTeachersManagement, setShowTeachersManagement] = useState(false)
  const [stats, setStats] = useState({
    totalStudents: 0,
    newStudents: 0,
    activeStudents: 0,
    totalTeachers: 0,
    activeTeachers: 0,
    uniqueSpecialties: 0,
    teacherSpecialties: [],
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



  const handleTeacherRegistered = () => {
    setShowRegisterTeacher(false)
    // Refrescar estadísticas después del registro
    fetchStats()
  }

  // Extraer la función fetchStats para poder reutilizarla
  const fetchStats = async () => {
    try {
      setLoading(true)
      // Obtener estudiantes, profesores y estadísticas de profesores
      const [studentsResponse, teachersResponse, teacherStatsResponse] = await Promise.all([
        api.get('/auth/students?limit=1000'),
        api.get('/auth/professors?limit=1000'),
        api.get('/teachers/stats')
      ])
      
      if (studentsResponse.data.success && teachersResponse.data.success && teacherStatsResponse.data.success) {
        const students = Array.isArray(studentsResponse.data.data?.students) ? studentsResponse.data.data.students : []
        const teachers = Array.isArray(teachersResponse.data.data?.professors) ? teachersResponse.data.data.professors : []
        const teacherStats = teacherStatsResponse.data.data
        
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

        // Use teacher stats from API for specialties
        const specialtyStats = teacherStats.bySpecialty || []
        const teacherSpecialties = specialtyStats.map(spec => spec._id)
        const uniqueSpecialties = specialtyStats.length

        console.log('Calculated stats:', {
          totalStudents: students.length,
          newStudents,
          activeStudents,
          totalTeachers: teachers.length,
          activeTeachers: teacherStats.overview.active,
          uniqueSpecialties,
          teacherSpecialties,
          specialtyStats
        })

        // Debug: Let's see what student states we have
        const studentStates = students.reduce((acc, student) => {
          const state = student.estadoAcademico || 'sin_estado'
          acc[state] = (acc[state] || 0) + 1
          return acc
        }, {})
        
        console.log('Student states breakdown:', studentStates)
        console.log('Students created in last 30 days:', students.filter(s => new Date(s.createdAt) > thirtyDaysAgo).map(s => ({
          name: s.firstName + ' ' + s.lastName,
          createdAt: s.createdAt,
          estado: s.estadoAcademico
        })))

        setStats({
          totalStudents: students.length,
          newStudents,
          activeStudents,
          totalTeachers: teachers.length,
          activeTeachers: teacherStats.overview.active,
          uniqueSpecialties,
          teacherSpecialties,
          scheduledClasses: 0, 
          upcomingClasses: 0, 
          pendingPayments: { count: 0, amount: 0 }, 
          monthlyRevenue: 0, 
          completedClasses: 0, 
          cancelledClasses: 0 
        })
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
      if (error.response?.status === 401) {
        // Optionally redirect to login or refresh token
      }
    } finally {
      setLoading(false)
    }
  }

  // Show forced password change if required
  if (showPasswordChange) {
    return <ForcePasswordChange onPasswordChanged={handlePasswordChanged} />
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

  // Show students management
  if (showStudentsManagement) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'white',
        zIndex: 9999,
        overflow: 'auto'
      }}>
        <div style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          zIndex: 10000
        }}>
          <button
            onClick={() => setShowStudentsManagement(false)}
            style={{
              background: 'var(--primary)',
              color: 'white',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '500'
            }}
          >
            ← Volver al Dashboard
          </button>
        </div>
        <StudentsManagement />
      </div>
    )
  }

  // Show teachers management
  if (showTeachersManagement) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'white',
        zIndex: 9999,
        overflow: 'auto'
      }}>
        <div style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          zIndex: 10000
        }}>
          <button
            onClick={() => setShowTeachersManagement(false)}
            style={{
              background: 'var(--primary)',
              color: 'white',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '500'
            }}
          >
            ← Volver al Dashboard
          </button>
        </div>
        <TeachersManagement />
      </div>
    )
  }

  return (
    <section className="section visible">
      <div className="container">
        {/* Header */}
        <AdminHeader user={user} onLogout={handleLogout} />

        <ClassScheduler />

        {/* KPI Cards */}
        <div style={{ marginBottom: '3rem' }}>
          <h3 style={{ 
            color: 'var(--primary)', 
            marginBottom: '1.5rem',
            fontSize: '1.5rem',
            fontWeight: '600'
          }}>
             Overview del Sistema
          </h3>
          
          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <p>Cargando estadísticas...</p>
            </div>
          ) : (
            <div className="services-grid" style={{ 
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '1.5rem'
            }}>
              <div className="service-card" style={{ 
                background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                color: 'white',
                border: 'none'
              }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
                  <FaUsers />
                </div>
                <h3 style={{ color: 'white', fontSize: '2.5rem', margin: '0.5rem 0', fontWeight: '700' }}>
                  {stats.totalStudents}
                </h3>
                <p style={{ margin: '0.5rem 0', opacity: 0.9, fontSize: '1.1rem', fontWeight: '600' }}>
                  Total Estudiantes
                </p>
                <div style={{ opacity: 0.85, fontSize: '0.9rem', lineHeight: '1.4' }}>
                  <div>Activos: {stats.activeStudents}</div>
                  <div>Inactivos: {stats.totalStudents - stats.activeStudents}</div>
                </div>
              </div>

              <div className="service-card" style={{ 
                background: 'linear-gradient(135deg, #e67e22, #d68910)',
                color: 'white',
                border: 'none'
              }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
                  <FaChalkboardTeacher />
                </div>
                <h3 style={{ color: 'white', fontSize: '2.5rem', margin: '0.5rem 0', fontWeight: '700' }}>
                  {stats.totalTeachers}
                </h3>
                <p style={{ margin: '0.5rem 0', opacity: 0.9, fontSize: '1.1rem', fontWeight: '600' }}>
                  Total Profesores
                </p>
                <div style={{ opacity: 0.85, fontSize: '0.9rem', lineHeight: '1.4' }}>
                  <div>Activos: {stats.activeTeachers}</div>
                  <div>Especialidades: {stats.uniqueSpecialties}</div>
                </div>
              </div>

              <div className="service-card" style={{ 
                background: 'linear-gradient(135deg, #8e44ad, #9b59b6)',
                color: 'white',
                border: 'none'
              }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
                  <FaBookOpen />
                </div>
                <h3 style={{ color: 'white', fontSize: '2.5rem', margin: '0.5rem 0', fontWeight: '700' }}>
                  {stats.uniqueSpecialties}
                </h3>
                <p style={{ margin: '0.5rem 0', opacity: 0.9, fontSize: '1.1rem', fontWeight: '600' }}>
                  Especialidades
                </p>
                <div style={{ opacity: 0.85, fontSize: '0.85rem', lineHeight: '1.4' }}>
                  {stats.teacherSpecialties.length > 0 ? (
                    <div>
                      {stats.teacherSpecialties.slice(0, 3).join(', ')}
                      {stats.teacherSpecialties.length > 3 && ` +${stats.teacherSpecialties.length - 3} más`}
                    </div>
                  ) : (
                    'Especialidades variadas'
                  )}
                </div>
              </div>

              <div className="service-card" style={{ 
                background: 'linear-gradient(135deg, #F5B800, #fd7e14)',
                color: 'white',
                border: 'none'
              }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
                  <FaDollarSign />
                </div>
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
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <FaTasks /> Acciones Rápidas
          </h3>
          
          <div className="services-grid" style={{ 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1.5rem'
          }}>
            <div className="service-card">
              <div style={{ fontSize: '3rem', marginBottom: '1rem', color: 'var(--primary)' }}>
                <FaUserGraduate />
              </div>
              <h4 style={{ color: 'var(--primary)', marginBottom: '1rem' }}>
                Gestión de Estudiantes
              </h4>
              <p style={{ marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>
                Ver, editar y gestionar información de estudiantes, estados académicos y progreso
              </p>
              <button 
                className="cta-btn" 
                style={{ 
                  width: '100%',
                  transform: 'none !important',
                  transition: 'none !important'
                }}
                onClick={() => {
                  console.log('Click en Gestionar Estudiantes')
                  setShowStudentsManagement(true)
                }}
              >
                Gestión de Estudiantes
              </button>
            </div>
            
            <div className="service-card">
              <div style={{ fontSize: '3rem', marginBottom: '1rem', color: 'var(--primary)' }}>
                <FaChalkboardTeacher />
              </div>
              <h4 style={{ color: 'var(--primary)', marginBottom: '1rem' }}>
                Gestión de Profesores
              </h4>
              <p style={{ marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>
                Registrar profesores, gestionar especialidades, configurar horarios
              </p>
              <button 
                className="cta-btn" 
                style={{ 
                  width: '100%',
                  transform: 'none !important',
                  transition: 'none !important'
                }}
                onClick={() => {
                  console.log('Click en Gestión de Profesores')
                  setShowTeachersManagement(true)
                }}
              >
                Gestión de Profesores
              </button>
            </div>
            
            <div className="service-card">
              <div style={{ fontSize: '3rem', marginBottom: '1rem', color: 'var(--primary)' }}>
                <FaCalendarAlt />
              </div>
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
              <div style={{ fontSize: '3rem', marginBottom: '1rem', color: 'var(--primary)' }}>
                <FaCreditCard />
              </div>
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
              <div style={{ fontSize: '3rem', marginBottom: '1rem', color: 'var(--primary)' }}>
                <FaChartLine />
              </div>
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
              <div style={{ fontSize: '3rem', marginBottom: '1rem', color: 'var(--primary)' }}>
                <FaCog />
              </div>
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