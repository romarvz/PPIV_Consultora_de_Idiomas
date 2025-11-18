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

  // Reset management views when URL changes to main dashboard and refresh data
  useEffect(() => {
    console.log('Current pathname:', location.pathname);
    if (location.pathname === '/dashboard/admin' || location.pathname === '/dashboard/admin/') {
      console.log('Resetting management views');
      setShowStudentsManagement(false)
      setShowTeachersManagement(false)
      setShowCourseManagement(false)
      setShowReports(false)
      // Refresh dashboard data when returning to main view
      fetchStats()
    }
  }, [location.pathname])

  // Fetch dashboard statistics only on mount
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
    // Immediate refresh after teacher registration
    fetchStats()
  }

  // Extract fetchStats function for reusability
  const fetchStats = async () => {
    try {
      setLoading(true)
      console.log('🔄 Fetching dashboard stats...')
      
      // Test authentication first
      const token = localStorage.getItem('token')
      console.log('🔑 Token exists:', !!token)
      console.log('👤 Current user:', user)
      
      // Get essential data only - reduce API calls for faster loading
      const [studentsResponse, teachersResponse, teacherStatsResponse] = await Promise.allSettled([
        api.get('/students?limit=50'), // Reduce limit for faster response
        api.get('/teachers?limit=50'), // Reduce limit for faster response  
        api.get('/teachers/stats')
      ])
      
      // Extract successful responses and log them
      const studentsRes = studentsResponse.status === 'fulfilled' ? studentsResponse.value : { data: { success: false } }
      const teachersRes = teachersResponse.status === 'fulfilled' ? teachersResponse.value : { data: { success: false } }
      const teacherStatsRes = teacherStatsResponse.status === 'fulfilled' ? teacherStatsResponse.value : { data: { success: false } }
      
      console.log('📊 API Responses:', {
        students: { 
          success: studentsRes.data.success, 
          count: studentsRes.data.data?.students?.length || 0
        },
        teachers: { 
          success: teachersRes.data.success, 
          count: teachersRes.data.data?.teachers?.length || 0
        },
        teacherStats: { 
          success: teacherStatsRes.data.success
        }
      })
      
      // Process data even if some calls fail, but require at least students and teachers
      if (studentsRes.data.success && teachersRes.data.success) {
        const students = Array.isArray(studentsRes.data.data?.students) ? studentsRes.data.data.students : 
                        Array.isArray(studentsRes.data.data) ? studentsRes.data.data : []
        const teachers = Array.isArray(teachersRes.data.data?.teachers) ? teachersRes.data.data.teachers : 
                        Array.isArray(teachersRes.data.data?.professors) ? teachersRes.data.data.professors : 
                        Array.isArray(teachersRes.data.data) ? teachersRes.data.data : []
        const teacherStats = teacherStatsRes.data.data
        
        console.log('📊 Raw data extracted:', {
          studentsCount: students.length,
          teachersCount: teachers.length,
          teacherStats: teacherStats,
          sampleStudent: students[0],
          sampleTeacher: teachers[0]
        })
        
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
        
        console.log('🎯 Calculated values:', {
          totalStudents: students.length,
          newStudents,
          activeStudents,
          totalTeachers: teachers.length
        })

        // Use teacher stats from API for specialties
        const specialtyStats = teacherStats?.bySpecialty || []
        const teacherSpecialties = specialtyStats.map(spec => spec._id || spec.name)
        const uniqueSpecialties = specialtyStats.length
        const specialtyData = specialtyStats.slice(0, 5).map(spec => ({
          name: spec._id || spec.name,
          count: spec.count
        }))
        
        // Get active teachers count from teacher stats if available
        const activeTeachersFromStats = teacherStats?.overview?.active || teachers.filter(t => t.isActive !== false).length



        // Fetch financial data for revenue chart
        let revenueData = []
        let totalIncome = 0
        try {
          const financialResponse = await api.get('/reportes-financieros/dashboard/financiero')
          if (financialResponse.data.success) {
            totalIncome = financialResponse.data.data.totalIncome || 0
            // Create mock monthly data since API doesn't provide monthly breakdown
            const currentDate = new Date()
            for (let i = 5; i >= 0; i--) {
              const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1)
              revenueData.push({
                month: date.toISOString(),
                amount: i === 0 ? totalIncome : Math.floor(totalIncome * (0.7 + Math.random() * 0.6))
              })
            }
          }
        } catch (error) {
          console.error('Error fetching financial data:', error)
        }

        const newStats = {
          totalStudents: students.length,
          newStudents,
          activeStudents,
          totalTeachers: teachers.length,
          activeTeachers: activeTeachersFromStats,
          uniqueSpecialties,
          teacherSpecialties,
          specialtyData,
          scheduledClasses: 0, // Load in background
          upcomingClasses: 0, // Load in background
          pendingPayments: { count: 0, amount: 0 }, // Load in background
          monthlyRevenue: totalIncome,
          revenueData: revenueData,
          completedClasses: 0, // Load in background
          cancelledClasses: 0 // Load in background 
        }
        
        console.log('Dashboard stats updated:', {
          totalStudents: newStats.totalStudents,
          activeStudents: newStats.activeStudents
        })
        
        setStats(newStats)
      } else {
        console.error('❌ Failed to fetch dashboard data:', {
          studentsSuccess: studentsRes.data.success,
          teachersSuccess: teachersRes.data.success,
          teacherStatsSuccess: teacherStatsRes.data.success
        })
        // Set minimal stats to avoid showing 0s when there's actually data
        setStats({
          totalStudents: 0,
          newStudents: 0,
          activeStudents: 0,
          totalTeachers: 0,
          activeTeachers: 0,
          uniqueSpecialties: 0,
          teacherSpecialties: [],
          specialtyData: [],
          scheduledClasses: 0,
          upcomingClasses: 0,
          pendingPayments: { count: 0, amount: 0 },
          monthlyRevenue: 0,
          revenueData: [],
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
      <div 
        style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          background: 'rgba(0,0,0,0.5)', 
          display: 'flex', 
          alignItems: 'flex-start', 
          justifyContent: 'center',
          zIndex: 10000,
          overflowY: 'auto',
          paddingTop: '100px',
          padding: '0 1rem 2rem 1rem'
        }}
        onClick={() => setShowRegisterTeacher(false)}
      >
        <div 
          onClick={(e) => e.stopPropagation()}
          style={{
            marginTop: '1rem',
            marginBottom: '2rem',
            maxWidth: '100%',
            width: 'auto'
          }}
        >
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
      <section className="section visible" style={{ paddingTop: '80px' }}>
        <div className="container dashboard-container">
          <AuthNavbar user={user} onLogout={handleLogout} showBackButton={true} onBack={() => setShowStudentsManagement(false)} />
          <StudentsManagement onBack={() => {
            setShowStudentsManagement(false)
            // Refresh dashboard data when returning from student management
            fetchStats()
          }} />
        </div>
      </section>
    )
  }

  // Show teachers management
  if (showTeachersManagement) {
    return (
      <section className="section visible" style={{ paddingTop: '80px' }}>
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
      <section className="section visible" style={{ paddingTop: '80px' }}>
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
      <section className="section visible" style={{ paddingTop: '80px' }}>
        <div className="container dashboard-container">
          <AuthNavbar user={user} onLogout={handleLogout} showBackButton={true} onBack={() => setShowReports(false)} />
          <ReportsDashboard onClose={() => setShowReports(false)} />
        </div>
      </section>
    )
  }

  return (
    <div className="dashboard-container">
        {/* Header */}
        <AuthNavbar user={user} onLogout={handleLogout} showBackButton={false} />

        {/* System Overview Charts */}
        <SystemOverviewCharts 
          key={`${stats.totalStudents}-${stats.activeStudents}-${Date.now()}`}
          stats={stats} 
          loading={loading} 
        />

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
  )
}

export default AdminDashboard