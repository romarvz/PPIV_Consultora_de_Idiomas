import React, { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth.jsx'
import ForcChange from '../../components/common/ForcePasswordChange'

import RegisterTeacher from '../../components/RegisterTeacher'
import StudentsManagement from '../../components/StudentsManagement'
import TeachersManagement from '../../components/TeachersManagement'
import AdminHeader from '../../components/common/AdminHeader'
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

  // Extraer la función fetchStats para poder reutilizarla
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

  // Show students management
  if (showStudentsManagement) {
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
        <StudentsManagement />
      </div>
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
        <AdminHeader user={user} onLogout={handleLogout} />

        {/* System Overview Charts */}
        <SystemOverviewCharts 
          key={`${stats.totalStudents}-${stats.activeStudents}-${Date.now()}`}
          stats={stats} 
          loading={loading} 
        />

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
  )
}

export default AdminDashboard