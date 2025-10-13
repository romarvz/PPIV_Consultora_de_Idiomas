import React, { useState } from 'react'
import { useAuth } from '../../hooks/useAuth.jsx'
import ForcePasswordChange from '../../components/common/ForcePasswordChange'
import { 
  FaCalendarAlt, 
  FaChartLine, 
  FaBookOpen,
  FaClock,
  FaCheckCircle,
  FaDollarSign,
  FaSignOutAlt,
  FaUser
} from 'react-icons/fa'
import '../../styles/adminDashboard.css'

// Mock data for student dashboard cards
const mockClasses = [
  { 
    id: 1, 
    subject: 'Inglés B2', 
    date: '2025-10-13', 
    time: '10:00 AM', 
    teacher: 'Prof. Smith',
    duration: '60 min'
  },
  { 
    id: 2, 
    subject: 'Francés A1', 
    date: '2025-10-14', 
    time: '2:00 PM', 
    teacher: 'Prof. Dubois',
    duration: '45 min'
  },
  { 
    id: 3, 
    subject: 'Alemán A2', 
    date: '2025-10-15', 
    time: '4:00 PM', 
    teacher: 'Prof. Schmidt',
    duration: '60 min'
  }
]

const mockPayments = [
  { 
    id: 1, 
    amount: 15000, 
    date: '2025-10-01', 
    status: 'paid', 
    concept: 'Mensualidad Octubre - Inglés B2'
  },
  { 
    id: 2, 
    amount: 12000, 
    date: '2025-10-01', 
    status: 'paid', 
    concept: 'Mensualidad Octubre - Francés A1'
  },
  { 
    id: 3, 
    amount: 14000, 
    date: '2025-11-01', 
    status: 'pending', 
    concept: 'Mensualidad Noviembre - Alemán A2'
  }
]

const StudentDashboard = () => {
  console.log('StudentDashboard component rendering...')
  
  const { user, logout, mustChangePassword } = useAuth()
  const [showPasswordChange, setShowPasswordChange] = useState(false) // Disabled for testing
  
  console.log('StudentDashboard - user:', user)
  console.log('StudentDashboard - mustChangePassword:', mustChangePassword)
  console.log('showPasswordChange (overridden):', showPasswordChange)

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

  // Show forced password change if required
  // Temporarily disabled for testing
  if (false && showPasswordChange) {
    return <ForcePasswordChange onPasswordChanged={handlePasswordChanged} />
  }

  console.log('Rendering main StudentDashboard content!')
  
  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <div className="dashboard-header__left">
          <FaUser className="dashboard-header__icon" />
          <h1 className="dashboard-header__title">Dashboard del Estudiante</h1>
        </div>
        <button onClick={handleLogout} className="dashboard-header__logout">
          <FaSignOutAlt style={{ marginRight: '8px' }} />
          Cerrar Sesión
        </button>
      </div>

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
        {/* Upcoming Classes */}
        <div className="dashboard-card">
          <div className="dashboard-card__header">
            <FaCalendarAlt className="dashboard-card__icon" />
            <h4 className="dashboard-card__title">Mis Próximas Clases</h4>
          </div>
          {mockClasses.map((clase) => (
            <div key={clase.id} className="dashboard-card__item">
              <div className="dashboard-card__item-title">
                <FaBookOpen style={{ marginRight: '8px', color: 'var(--primary-color)' }} />
                {clase.subject}
              </div>
              <div className="dashboard-card__item-subtitle" style={{ marginTop: '5px' }}>
                <FaClock style={{ marginRight: '5px' }} />
                {clase.date} • {clase.time} • {clase.duration}
              </div>
              <div className="dashboard-card__item-meta">{clase.teacher}</div>
            </div>
          ))}
        </div>

        {/* Payments */}
        <div className="dashboard-card">
          <div className="dashboard-card__header">
            <FaDollarSign className="dashboard-card__icon" />
            <h4 className="dashboard-card__title">Mis Pagos</h4>
          </div>
          {mockPayments.map((pago) => (
            <div key={pago.id} className="dashboard-card__item">
              <div className="dashboard-card__item-header">
                <span className="dashboard-card__item-title">
                  ${pago.amount.toLocaleString()}
                </span>
                <span className={`status-badge ${pago.status === 'paid' ? 'status-badge--paid' : 'status-badge--pending'}`}>
                  {pago.status === 'paid' ? 'Pagado' : 'Pendiente'}
                </span>
              </div>
              <div className="dashboard-card__item-subtitle">{pago.concept}</div>
              <div className="dashboard-card__item-meta">{pago.date}</div>
            </div>
          ))}
        </div>

        {/* Progress */}
        <div className="dashboard-card">
          <div className="dashboard-card__header">
            <FaChartLine className="dashboard-card__icon" />
            <h4 className="dashboard-card__title">Mi Progreso Académico</h4>
          </div>
          <div style={{ marginBottom: '15px' }}>
            <div className="dashboard-card__item-header">
              <span className="dashboard-card__item-title">
                <FaCheckCircle style={{ color: 'var(--progress-success)', marginRight: '8px' }} />
                Inglés B2
              </span>
              <span className="dashboard-card__item-subtitle">85%</span>
            </div>
            <div className="progress-bar">
              <div className="progress-bar__fill progress-bar__fill--success" style={{ width: '85%' }}></div>
            </div>
            <div className="progress-text">
              12 de 14 lecciones completadas
            </div>
          </div>
          <div style={{ marginBottom: '15px' }}>
            <div className="dashboard-card__item-header">
              <span className="dashboard-card__item-title">
                <FaClock style={{ color: 'var(--progress-warning)', marginRight: '8px' }} />
                Francés A1
              </span>
              <span className="dashboard-card__item-subtitle">60%</span>
            </div>
            <div className="progress-bar">
              <div className="progress-bar__fill progress-bar__fill--warning" style={{ width: '60%' }}></div>
            </div>
            <div className="progress-text">
              6 de 10 lecciones completadas
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StudentDashboard