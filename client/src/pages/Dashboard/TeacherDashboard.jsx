import React, { useState } from 'react'
import { useAuth } from '../../hooks/useAuth.jsx'
import ForcePasswordChange from '../../components/common/ForcePasswordChange'
import AuthNavbar from '../../components/common/AuthNavbar'
import '../../styles/variables.css'
import '../../styles/auth.css'
import '../../styles/charts.css'
import { 
  FaChalkboardTeacher, 
  FaUsers, 
  FaCalendarCheck,
  FaClock,
  FaBookOpen,
  FaDollarSign,
  FaSignOutAlt,
  FaUser,
  FaGraduationCap,
  FaStar
} from 'react-icons/fa'


// Mock data for teacher dashboard
const mockTodayClasses = [
  { 
    id: 1, 
    student: 'Ana García', 
    subject: 'Inglés B2', 
    time: '10:00 AM', 
    duration: '60 min',
    status: 'scheduled',
    type: 'individual'
  },
  { 
    id: 2, 
    student: 'Carlos Rodríguez', 
    subject: 'Francés A1', 
    time: '2:00 PM', 
    duration: '45 min',
    status: 'completed',
    type: 'individual'
  },
  { 
    id: 3, 
    student: 'Grupo A - Inglés', 
    subject: 'Inglés B1', 
    time: '4:00 PM', 
    duration: '90 min',
    status: 'scheduled',
    type: 'group'
  },
  { 
    id: 4, 
    student: 'María López', 
    subject: 'Alemán A2', 
    time: '6:00 PM', 
    duration: '60 min',
    status: 'pending',
    type: 'individual'
  }
]

const mockStudents = [
  { 
    id: 1, 
    name: 'Ana García', 
    level: 'B2 Inglés', 
    progress: 85,
    lastClass: '2025-10-10',
    totalClasses: 24,
    status: 'active'
  },
  { 
    id: 2, 
    name: 'Carlos Rodríguez', 
    level: 'A1 Francés', 
    progress: 60,
    lastClass: '2025-10-12',
    totalClasses: 12,
    status: 'active'
  },
  { 
    id: 3, 
    name: 'María López', 
    level: 'A2 Alemán', 
    progress: 45,
    lastClass: '2025-10-08',
    totalClasses: 8,
    status: 'active'
  },
  { 
    id: 4, 
    name: 'Roberto Silva', 
    level: 'B1 Inglés', 
    progress: 75,
    lastClass: '2025-10-11',
    totalClasses: 18,
    status: 'active'
  },
  { 
    id: 5, 
    name: 'Laura Fernández', 
    level: 'A2 Francés', 
    progress: 30,
    lastClass: '2025-10-05',
    totalClasses: 6,
    status: 'inactive'
  }
]

const mockTeacherStats = {
  todayClasses: 4,
  totalStudents: 15,
  activeStudents: 12,
  completedClasses: 48,
  averageRating: 4.8,
  monthlyEarnings: 28000
}

const TeacherDashboard = () => {
  const { user, logout, mustChangePassword } = useAuth()
  const [showPasswordChange, setShowPasswordChange] = useState(false) // Disabled for testing

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

  // Show forced password change if required
  if (showPasswordChange) {
    return <ForcePasswordChange onPasswordChanged={handlePasswordChanged} />
  }

  return (
    <div className="dashboard-container">
      {/* Header */}
        <AuthNavbar user={user} onLogout={handleLogout} showBackButton={false} />

      {/* Teacher Info */}
      <div className="dashboard-info-card">
        <h3 className="dashboard-info-card__title">Información Personal</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
          <div>
            <p className="dashboard-info-card__text"><strong>Email:</strong> {user?.email}</p>
            <p className="dashboard-info-card__text"><strong>DNI:</strong> {user?.dni}</p>
          </div>
          <div>
            <p className="dashboard-info-card__text"><strong>Estudiantes Activos:</strong> {mockTeacherStats.activeStudents}</p>
            <p className="dashboard-info-card__text"><strong>Clases Completadas:</strong> {mockTeacherStats.completedClasses}</p>
          </div>
          <div>
            <p className="dashboard-info-card__text"><strong>Calificación:</strong> ⭐ {mockTeacherStats.averageRating}/5.0</p>
            <p className="dashboard-info-card__text"><strong>Ganancias del Mes:</strong> ${mockTeacherStats.monthlyEarnings.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Dashboard Cards */}
      <div className="dashboard-cards-grid dashboard-cards-grid--large">
        {/* Today's Classes */}
        <div className="dashboard-card">
          <div className="dashboard-card__header">
            <FaCalendarCheck className="dashboard-card__icon" />
            <h4 className="dashboard-card__title">Mis Clases de Hoy</h4>
          </div>
          {mockTodayClasses.map((clase) => (
            <div key={clase.id} className={`dashboard-card__item dashboard-card__item--with-status ${
              clase.status === 'completed' ? 'dashboard-card__item--completed' : 
              clase.status === 'scheduled' ? 'dashboard-card__item--scheduled' : 'dashboard-card__item--pending'
            }`}>
              <div className="dashboard-card__item-header">
                <div className="dashboard-card__item-title">
                  <FaUser style={{ marginRight: '8px', color: 'var(--primary-color)' }} />
                  {clase.student}
                </div>
                <span className={`status-badge ${
                  clase.status === 'completed' ? 'status-badge--completed' : 
                  clase.status === 'scheduled' ? 'status-badge--scheduled' : 'status-badge--pending'
                }`}>
                  {clase.status === 'completed' ? 'Completada' : 
                   clase.status === 'scheduled' ? 'Programada' : 'Pendiente'}
                </span>
              </div>
              <div className="dashboard-card__item-subtitle" style={{ marginBottom: '5px' }}>
                <FaBookOpen style={{ marginRight: '5px' }} />
                {clase.subject} • {clase.type === 'group' ? 'Grupal' : 'Individual'}
              </div>
              <div className="dashboard-card__item-meta">
                <FaClock style={{ marginRight: '5px' }} />
                {clase.time} • {clase.duration}
              </div>
            </div>
          ))}
        </div>

        {/* My Students */}
        <div className="dashboard-card">
          <div className="dashboard-card__header">
            <FaUsers className="dashboard-card__icon" />
            <h4 className="dashboard-card__title">Mis Estudiantes</h4>
          </div>
          {mockStudents.slice(0, 4).map((student) => (
            <div key={student.id} className="dashboard-card__item">
              <div className="dashboard-card__item-header">
                <div className="dashboard-card__item-title">
                  <FaGraduationCap />
                  {student.name}
                </div>
                <span className="dashboard-card__item-subtitle">{student.progress}%</span>
              </div>
              <div className="dashboard-card__item-subtitle">{student.level}</div>
              <div className="progress-bar">
                <div 
                  className={`progress-bar__fill ${
                    student.progress > 70 ? 'progress-bar__fill--success' : 
                    student.progress > 40 ? 'progress-bar__fill--warning' : 'progress-bar__fill--error'
                  }`}
                  style={{ width: `${student.progress}%` }}
                ></div>
              </div>
              <div className="progress-text">
                {student.totalClasses} clases • Última: {student.lastClass}
              </div>
            </div>
          ))}
          <div style={{ textAlign: 'center', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-light)' }}>
            <button className="cta-btn" style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }}>
              Ver todos los estudiantes ({mockStudents.length})
            </button>
          </div>
        </div>

        {/* Teacher Performance */}
        <div className="dashboard-card">
          <div className="dashboard-card__header">
            <FaStar className="dashboard-card__icon" />
            <h4 className="dashboard-card__title">Mi Rendimiento</h4>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
            <div className="dashboard-card__item" style={{ textAlign: 'center', borderLeft: 'none', background: 'var(--bg-tertiary)' }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary)', marginBottom: '0.25rem' }}>
                {mockTeacherStats.todayClasses}
              </div>
              <div className="dashboard-card__item-meta">Clases Hoy</div>
            </div>
            <div className="dashboard-card__item" style={{ textAlign: 'center', borderLeft: 'none', background: 'var(--bg-tertiary)' }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary)', marginBottom: '0.25rem' }}>
                {mockTeacherStats.averageRating}
              </div>
              <div className="dashboard-card__item-meta">Calificación</div>
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <div className="dashboard-card__item-header">
              <span className="dashboard-card__item-title">Estudiantes Activos</span>
              <span className="dashboard-card__item-subtitle">
                {mockTeacherStats.activeStudents}/{mockTeacherStats.totalStudents}
              </span>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-bar__fill progress-bar__fill--success"
                style={{ width: `${(mockTeacherStats.activeStudents / mockTeacherStats.totalStudents) * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="dashboard-card__item" style={{ textAlign: 'center', borderLeft: 'none', background: 'var(--primary)', color: 'white' }}>
            <div style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>
              <FaDollarSign style={{ marginRight: '0.5rem' }} />
              ${mockTeacherStats.monthlyEarnings.toLocaleString()}
            </div>
            <div style={{ fontSize: '0.8rem', opacity: '0.9' }}>Ganancias este mes</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TeacherDashboard