import React, { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth.jsx'
import ForcChange from '../../components/common/ForcePasswordChange'

import RegisterTeacher from '../../components/RegisterTeacher'
import StudentsManagement from '../../components/StudentsManagement'
import TeachersManagement from '../../components/TeachersManagement'
import AdminHeader from '../../components/common/AdminHeader'
import CalendarView from '../../components/admin/CalendarView.jsx'
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
    return (<div className="modal-overlay"> {/* Reutilizamos la clase del modal para el fondo */}
        <div style={{ maxHeight: '90vh', overflowY: 'auto', width: '100%', maxWidth: '800px' }}>
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
    return (<div className="full-page-view">
        <div className="full-page-view__close-wrapper">
          <button onClick={() => setShowStudentsManagement(false)} className="full-page-view__close-btn">
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
      <div className="full-page-view">
        <div className="full-page-view__close-wrapper">
          <button onClick={() => setShowTeachersManagement(false)} className="full-page-view__close-btn">
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
 <div className="dashboard-section">
          <h3 className="dashboard-section__title">
            <FaCalendarAlt /> Calendario de Clases
          </h3>
          <CalendarView />
        </div>
        

        {/* KPI Cards */}{/* KPI Cards */}
        <div className="dashboard-section">
          <h3 className="dashboard-section__title">Overview del Sistema</h3>
          
          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <p>Cargando estadísticas...</p>
            </div>
          ) : (
            <div className="dashboard-grid">
              {/* --- Tarjeta 1: Total Estudiantes  */}
              <div className="service-card kpi-card" style={{ background: 'linear-gradient(135deg, #0b3765, #035888)' }}>
                <div className="kpi-card__icon"><FaUsers /></div>
                <h3 className="kpi-card__value">{stats.totalStudents}</h3>
                <p className="kpi-card__label">Total Estudiantes</p>
                <div className="kpi-card__details">
                  <div>Activos: {stats.activeStudents}</div>
                  <div>Inactivos: {stats.totalStudents - stats.activeStudents}</div>
                </div>
              </div>

              {/* --- Tarjeta 2: Total Profesores (Estructura correcta) --- */}
              <div className="service-card kpi-card" style={{ background: 'linear-gradient(135deg, #e67e22, #d68910)' }}>
                <div className="kpi-card__icon"><FaChalkboardTeacher /></div>
                <h3 className="kpi-card__value">{stats.totalTeachers}</h3>
                <p className="kpi-card__label">Total Profesores</p>
                <div className="kpi-card__details">
                  <div>Activos: {stats.activeTeachers}</div>
                  <div>Especialidades: {stats.uniqueSpecialties}</div>
                </div>
              </div>

              {/* --- Tarjeta 3: Especialidades (Estructura correcta) --- */}
              <div className="service-card kpi-card" style={{ background: 'linear-gradient(135deg, #8e44ad, #9b59b6)' }}>
                <div className="kpi-card__icon"><FaBookOpen /></div>
                <h3 className="kpi-card__value">{stats.uniqueSpecialties}</h3>
                <p className="kpi-card__label">Especialidades</p>
                <div className="kpi-card__details">
                  {stats.teacherSpecialties.length > 0 ? (
                    <>
                      {stats.teacherSpecialties.slice(0, 3).join(', ')}
                      {stats.teacherSpecialties.length > 3 && ` +${stats.teacherSpecialties.length - 3} más`}
                    </>
                  ) : (
                    'Especialidades variadas'
                  )}
                </div>
              </div>

              {/* --- Tarjeta 4: Ingresos del Mes (ESTRUCTURA CORREGIDA) --- */}
              <div className="service-card kpi-card" style={{ background: 'linear-gradient(135deg, #F5b401, #fc7f13)' }}>
                <div className="kpi-card__icon"><FaDollarSign /></div>
                <h3 className="kpi-card__value">${stats.monthlyRevenue.toLocaleString()}</h3>
                <p className="kpi-card__label">Ingresos del Mes</p>
                <div className="kpi-card__details">
                  <div>Pagos pendientes: {stats.pendingPayments.count}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        {/* Quick Actions */}
        <div className="dashboard-section">
          <h3 className="dashboard-section__title"><FaTasks /> Acciones Rápidas</h3>
          
          <div className="dashboard-grid">
            {/* --- Tarjeta 1: Gestión de Estudiantes --- */}
            <div className="service-card action-card">
              <div className="action-card__icon"><FaUserGraduate /></div>
              <h4 className="action-card__title">Gestión de Estudiantes</h4>
              <p className="action-card__description">
                Ver, editar y gestionar información de estudiantes, estados académicos y progreso.
              </p>
              <button className="cta-btn action-card__button" onClick={() => setShowStudentsManagement(true)}>
                Gestionar Estudiantes
              </button>
            </div>
            
            {/* --- Tarjeta 2: Gestión de Profesores --- */}
            <div className="service-card action-card">
              <div className="action-card__icon"><FaChalkboardTeacher /></div>
              <h4 className="action-card__title">Gestión de Profesores</h4>
              <p className="action-card__description">
                Registrar profesores, gestionar especialidades y configurar sus horarios disponibles.
              </p>
              <button className="cta-btn action-card__button" onClick={() => setShowTeachersManagement(true)}>
                Gestionar Profesores
              </button>
            </div>
            
            {/* --- Tarjeta 3: Gestión de Cursos (antes Clases) --- */}
            <div className="service-card action-card">
              <div className="action-card__icon"><FaCalendarAlt /></div>
              <h4 className="action-card__title">Gestión de Cursos</h4>
              <p className="action-card__description">
                Crear y editar la oferta académica de la institución (cursos grupales, individuales, etc.).
              </p>
              <button className="cta-btn action-card__button" onClick={() => alert('FUNCIONALIDAD PENDIENTE: Navegar al CRUD de Cursos')}>
                Gestionar Cursos
              </button>
            </div>
            
            {/* --- Tarjeta 4: Pagos y Finanzas --- */}
            <div className="service-card action-card">
              <div className="action-card__icon"><FaCreditCard /></div>
              <h4 className="action-card__title">Pagos y Finanzas</h4>
              <p className="action-card__description">
                Gestionar pagos, generar facturas, revisar los ingresos y controlar las deudas.
              </p>
              <button className="cta-btn action-card__button" onClick={() => alert('FUNCIONALIDAD PENDIENTE')}>
                Ver Finanzas
              </button>
            </div>
            
            {/* --- Tarjeta 5: Reportes --- */}
            <div className="service-card action-card">
              <div className="action-card__icon"><FaChartLine /></div>
              <h4 className="action-card__title">Reportes</h4>
              <p className="action-card__description">
                Estadísticas académicas, reportes financieros y exportación de datos importantes.
              </p>
              <button className="cta-btn action-card__button" onClick={() => alert('FUNCIONALIDAD PENDIENTE')}>
                Ver Reportes
              </button>
            </div>
            
            {/* --- Tarjeta 6: Configuración --- */}
            <div className="service-card action-card">
              <div className="action-card__icon"><FaCog /></div>
              <h4 className="action-card__title">Configuración</h4>
              <p className="action-card__description">
                Configurar sistema, gestionar roles de usuario y ajustar parámetros generales.
              </p>
              <button className="cta-btn action-card__button" onClick={() => alert('FUNCIONALIDAD PENDIENTE')}>
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