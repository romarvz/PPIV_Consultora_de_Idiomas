import React, { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth.jsx'
import { useNavigate, useLocation } from 'react-router-dom'
import ForcePasswordChange from '../../components/common/ForcePasswordChange'
import '../../styles/variables.css'
import '../../styles/auth.css'
import '../../styles/charts.css'

import RegisterTeacher from '../../components/RegisterTeacher'
import StudentsManagement from '../../components/StudentsManagement'
import TeachersManagement from '../../components/TeachersManagement'
import ReportsDashboard from './ReportsDashboard'
import AuthNavbar from '../../components/common/AuthNavbar'

import CourseManagementPage from './CourseManagementPage';
import SystemOverviewCharts from '../../components/charts/SystemOverviewCharts';
import api from '../../services/api'
import { routes } from '../../utils/routes'
// React Icons - Updated for better UI
import { 
  FaUserGraduate,
  FaChalkboardTeacher,
  FaCalendarAlt,
  FaCreditCard,
  FaChartLine,
  FaCog,
  FaBuilding
} from 'react-icons/fa'

const AdminDashboard = () => {
  const { user, logout, mustChangePassword } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
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

  // Reset management views when URL changes to main dashboard
  useEffect(() => {
    console.log('Current pathname:', location.pathname);
    if (location.pathname === '/dashboard/admin' || location.pathname === '/dashboard/admin/') {
      console.log('Resetting management views');
      setShowStudentsManagement(false)
      setShowTeachersManagement(false)
      setShowCourseManagement(false)
      setShowReports(false)
    }
  }, [location.pathname])

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
    return (<div className="modal-overlay dashboard-modal">
        <div className="dashboard-modal__content">
          <RegisterTeacher
            onSuccess={handleTeacherRegistered}
            onCancel={() => setShowRegisterTeacher(false)}
          />
        </div>
      </div>
    )
  }

  // Scroll to top when switching views
  useEffect(() => {
    if (showStudentsManagement || showTeachersManagement || showCourseManagement || showReports) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [showStudentsManagement, showTeachersManagement, showCourseManagement, showReports]);

  // Show students management
  if (showStudentsManagement) {
    console.log('Rendering StudentsManagement component');
    return (
      <section className="section visible">
        <div className="container dashboard-container">
          <AuthNavbar user={user} onLogout={handleLogout} showBackButton={true} onBack={() => setShowStudentsManagement(false)} />
          <StudentsManagement onBack={() => setShowStudentsManagement(false)} />
        </div>
      </section>
    )
  }

  // Show teachers management
  if (showTeachersManagement) {
    return (
      <section className="section visible">
        <div className="container dashboard-container">
          <AuthNavbar user={user} onLogout={handleLogout} showBackButton={true} onBack={() => setShowTeachersManagement(false)} />
          <TeachersManagement />
        </div>
      </section>
    )
  }

  // Show course management
  if (showCourseManagement) {
    return (
      <section className="section visible">
        <div className="container dashboard-container">
          <AuthNavbar user={user} onLogout={handleLogout} showBackButton={true} onBack={() => setShowCourseManagement(false)} />
          <CourseManagementPage />
        </div>
      </section>
    )
  }

  // Show reports
  if (showReports) {
    return (
      <section className="section visible">
        <div className="container dashboard-container">
          <AuthNavbar user={user} onLogout={handleLogout} showBackButton={true} onBack={() => setShowReports(false)} />
          <ReportsDashboard onClose={() => setShowReports(false)} />
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
            {/* Student Management Card */}
            <div className="service-card action-card">
              <div className="action-card__icon"><FaUserGraduate /></div>
              <h4 className="action-card__title">Gestión de Estudiantes</h4>
              <p className="action-card__description">
                Ver, editar y gestionar información de estudiantes, estados académicos y progreso.
              </p>
              <button 
                type="button"
                className="cta-btn action-card__button" 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('Setting showStudentsManagement to true');
                  setShowStudentsManagement(true);
                }}
              >
                Gestionar Estudiantes
              </button>
            </div>
            
            {/* Teacher Management Card */}
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
            
            {/* Course Management Card */}
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
            
            {/* Reports Card */}
            <div className="service-card action-card">
              <div className="action-card__icon"><FaChartLine /></div>
              <h4 className="action-card__title">Reportes</h4>
              <p className="action-card__description">
                Estadísticas académicas, reportes financieros y exportación de datos importantes.
              </p>
              <button 
                className="cta-btn action-card__button"
                onClick={() => setShowReports(true)}
              >
                Ver Reportes
              </button>
            </div>
            
            {/* Payments and Finance Card */}
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
            
            {/* Corporate Panel Card */}
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
            
            {/* Configuration Card */}
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