import React, { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth.jsx'
import { useNavigate } from 'react-router-dom'
import ForcePasswordChange from '../../components/common/ForcePasswordChange'
import '../../styles/variables.css'
import '../../styles/auth.css'
import '../../styles/charts.css'

import RegisterTeacher from '../../components/RegisterTeacher'
import StudentsManagement from '../../components/StudentsManagement'
import TeachersManagement from '../../components/TeachersManagement'
import ReportsView from '../../components/ReportsView'
import AuthNavbar from '../../components/common/AuthNavbar'

import CourseManagementPage from './CourseManagementPage';
import SystemOverviewCharts from '../../components/charts/SystemOverviewCharts';
import api from '../../services/api'
import { routes } from '../../utils/routes'
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
  FaTasks,
  FaBuilding
} from 'react-icons/fa'

const AdminDashboard = () => {
  const { user, logout, mustChangePassword } = useAuth()
  const navigate = useNavigate()
  const [showPasswordChange, setShowPasswordChange] = useState(mustChangePassword)

  const [showRegisterTeacher, setShowRegisterTeacher] = useState(false)
  const [showStudentsManagement, setShowStudentsManagement] = useState(false)
  const [showTeachersManagement, setShowTeachersManagement] = useState(false)
  const [showCourseManagement, setShowCourseManagement] = useState(false)
  const [showReports, setShowReports] = useState(false)
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
    // Refresh statistics after registration
    fetchStats()
  }

  // Extract fetchStats function for reusability
  const fetchStats = async () => {
    try {
      setLoading(true)
      // Get students, teachers and teacher statistics
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

        // Debug: Check what student states we have
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
    return (<div className="modal-overlay dashboard-modal"> {/* Usamos dashboard-modal para el estilo específico */}
        <div className="dashboard-modal__content">
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
    React.useEffect(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);
    return (
      <section className="section visible">
        <div className="container dashboard-container">
          <AuthNavbar user={user} onLogout={handleLogout} />
          <StudentsManagement onBack={() => setShowStudentsManagement(false)} />
        </div>
      </section>
    )
  }

  // Show teachers management
  if (showTeachersManagement) {
    React.useEffect(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);
    return (
      <section className="section visible">
        <div className="container dashboard-container">
          <AuthNavbar user={user} onLogout={handleLogout} />
          <TeachersManagement />
        </div>
      </section>
    )
  }

  // Show course management
  if (showCourseManagement) {
    React.useEffect(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);
    return (
      <section className="section visible">
        <div className="container dashboard-container">
          <AuthNavbar user={user} onLogout={handleLogout} />
          <CourseManagementPage />
        </div>
      </section>
    )
  }

  // Show reports
  if (showReports) {
    React.useEffect(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);
    return (
      <section className="section visible">
        <div className="container dashboard-container">
          <AuthNavbar user={user} onLogout={handleLogout} />
          <ReportsView onClose={() => setShowReports(false)} />
        </div>
      </section>
    )
  }

  return (
    <section className="section visible">
      <div className="container dashboard-container">
        {/* Header */}
        <AuthNavbar user={user} onLogout={handleLogout} showBackButton={false} />
        


        {/* System Overview Charts */}
        <SystemOverviewCharts stats={stats} loading={loading} />

        {/* Quick Actions */}
        <div className="dashboard-section">
          <h3 className="dashboard-section__title">Acciones Rápidas</h3>
          
          <div className="quick-actions-grid">
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
            
            {/* --- Tarjeta 3: Gestión de Cursos  --- */}
            <div className="service-card action-card">
              <div className="action-card__icon"><FaCalendarAlt /></div>
              <h4 className="action-card__title">Gestión de Cursos</h4>
              <p className="action-card__description">
                Crear y editar la oferta académica de la institución (cursos grupales, individuales, etc.).
              </p>
              <button className="cta-btn action-card__button" onClick={() => setShowCourseManagement(true)}>
                Gestionar Cursos
              </button>
            </div>
            
            {/* --- Tarjeta 4: Reportes --- */}
            <div className="service-card action-card">
              <div className="action-card__icon"><FaChartLine /></div>
              <h4 className="action-card__title">Reportes</h4>
              <p className="action-card__description">
                Estadísticas académicas, reportes financieros y exportación de datos importantes.
              </p>
              <button 
                className="cta-btn action-card__button"
                onClick={() => {
                  console.log('Click en Ver Reportes')
                  setShowReports(true)
                }}
              >
                Ver Reportes
              </button>
            </div>
            
            {/* --- Tarjeta 5: Pagos y Finanzas --- */}
            <div className="service-card action-card">
              <div className="action-card__icon"><FaCreditCard /></div>
              <h4 className="action-card__title">Pagos y Finanzas</h4>
              <p className="action-card__description">
                Gestionar pagos, generar facturas, revisar los ingresos y controlar las deudas.
              </p>
              <button className="cta-btn action-card__button" onClick={() => navigate(routes.DASHBOARD.FINANCIAL)}>
                Ver Finanzas
              </button>
            </div>
            
            {/* --- Tarjeta 6: Panel Corporativo --- */}
            <div className="service-card action-card">
              <div className="action-card__icon"><FaBuilding /></div>
              <h4 className="action-card__title">Panel Corporativo</h4>
              <p className="action-card__description">
                Vista empresarial, gestión de empleados, pagos corporativos
              </p>
              <button className="cta-btn action-card__button" onClick={() => navigate('/dashboard/company')}>
                Ver Panel Corporativo
              </button>
            </div>
            
            {/* --- Tarjeta 7: Configuración --- */}
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
        <div className="service-card profile-info-card" style={{ marginBottom: '2rem' }}>
          <h3 className="profile-info-card__title" style={{ color: 'var(--primary)', marginBottom: '1.5rem' }}>
            Información Personal
          </h3>
          <div className="profile-info-grid">
            <div className="profile-info-item">
              <span className="profile-label">Nombre:</span>
              <span className="profile-value">{user?.firstName} {user?.lastName}</span>
            </div>
            <div className="profile-info-item">
              <span className="profile-label">Email:</span>
              <span className="profile-value">{user?.email}</span>
            </div>
            <div className="profile-info-item">
              <span className="profile-label">DNI:</span>
              <span className="profile-value">{user?.dni}</span>
            </div>
            <div className="profile-info-item">
              <span className="profile-label">Rol:</span>
              <span className="profile-value">Administrador</span>
            </div>
            {user?.phone && (
              <div className="profile-info-item">
                <span className="profile-label">Teléfono:</span>
                <span className="profile-value">{user.phone}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

export default AdminDashboard