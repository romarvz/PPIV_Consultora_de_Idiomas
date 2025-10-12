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

// Mock data para las cards del estudiante
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
  console.log('🎓 StudentDashboard component rendering...')
  
  const { user, logout, mustChangePassword } = useAuth()
  const [showPasswordChange, setShowPasswordChange] = useState(false) // Disabled for testing
  
  console.log('📊 StudentDashboard - user:', user)
  console.log('🔐 StudentDashboard - mustChangePassword:', mustChangePassword)
  console.log('🔄 showPasswordChange (overridden):', showPasswordChange)

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

  console.log('✅ Rendering main StudentDashboard content!')
  
  return (
    <div style={{ padding: '20px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <FaUser style={{ color: '#2c5aa0', marginRight: '15px', fontSize: '32px' }} />
          <h1 style={{ color: '#333', fontSize: '28px', margin: 0 }}>Dashboard del Estudiante</h1>
        </div>
        <button 
          onClick={handleLogout}
          style={{
            background: '#dc3545',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '5px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <FaSignOutAlt style={{ marginRight: '8px' }} />
          Cerrar Sesión
        </button>
      </div>

      {/* User Info */}
      <div style={{ 
        background: 'white', 
        padding: '20px', 
        borderRadius: '8px',
        marginBottom: '20px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ color: '#333', marginTop: 0 }}>Información Personal</h3>
        <p style={{ color: '#666', margin: '5px 0' }}><strong>Email:</strong> {user?.email}</p>
        <p style={{ color: '#666', margin: '5px 0' }}><strong>DNI:</strong> {user?.dni}</p>
        {user?.nivel && <p style={{ color: '#666', margin: '5px 0' }}><strong>Nivel:</strong> {user.nivel.toUpperCase()}</p>}
        {user?.estadoAcademico && <p style={{ color: '#666', margin: '5px 0' }}><strong>Estado:</strong> {user.estadoAcademico}</p>}
      </div>

      {/* Dashboard Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '20px'
      }}>
        {/* Próximas Clases */}
        <div style={{ 
          background: 'white', 
          padding: '20px', 
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
            <FaCalendarAlt style={{ color: '#2c5aa0', marginRight: '10px', fontSize: '18px' }} />
            <h4 style={{ color: '#2c5aa0', margin: 0 }}>Mis Próximas Clases</h4>
          </div>
          {mockClasses.map((clase) => (
            <div key={clase.id} style={{ 
              marginBottom: '15px', 
              padding: '10px', 
              border: '1px solid #eee',
              borderRadius: '5px'
            }}>
              <div style={{ fontWeight: 'bold', color: '#333' }}>
                <FaBookOpen style={{ marginRight: '8px', color: '#2c5aa0' }} />
                {clase.subject}
              </div>
              <div style={{ fontSize: '14px', color: '#666', marginTop: '5px' }}>
                <FaClock style={{ marginRight: '5px' }} />
                {clase.date} • {clase.time} • {clase.duration}
              </div>
              <div style={{ fontSize: '14px', color: '#888' }}>{clase.teacher}</div>
            </div>
          ))}
        </div>

        {/* Pagos */}
        <div style={{ 
          background: 'white', 
          padding: '20px', 
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
            <FaDollarSign style={{ color: '#2c5aa0', marginRight: '10px', fontSize: '18px' }} />
            <h4 style={{ color: '#2c5aa0', margin: 0 }}>Mis Pagos</h4>
          </div>
          {mockPayments.map((pago) => (
            <div key={pago.id} style={{ 
              marginBottom: '15px', 
              padding: '10px', 
              border: '1px solid #eee',
              borderRadius: '5px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                <span style={{ fontWeight: 'bold', color: '#333' }}>
                  ${pago.amount.toLocaleString()}
                </span>
                <span style={{ 
                  fontSize: '12px', 
                  padding: '2px 8px', 
                  borderRadius: '12px',
                  backgroundColor: pago.status === 'paid' ? '#d4edda' : '#fff3cd',
                  color: pago.status === 'paid' ? '#155724' : '#856404'
                }}>
                  {pago.status === 'paid' ? '✓ Pagado' : '⏰ Pendiente'}
                </span>
              </div>
              <div style={{ fontSize: '13px', color: '#666' }}>{pago.concept}</div>
              <div style={{ fontSize: '12px', color: '#888' }}>{pago.date}</div>
            </div>
          ))}
        </div>

        {/* Progreso */}
        <div style={{ 
          background: 'white', 
          padding: '20px', 
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
            <FaChartLine style={{ color: '#2c5aa0', marginRight: '10px', fontSize: '18px' }} />
            <h4 style={{ color: '#2c5aa0', margin: 0 }}>Mi Progreso Académico</h4>
          </div>
          <div style={{ marginBottom: '15px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
              <span style={{ fontWeight: 'bold', color: '#333' }}>
                <FaCheckCircle style={{ color: '#28a745', marginRight: '8px' }} />
                Inglés B2
              </span>
              <span style={{ fontSize: '14px', color: '#666' }}>85%</span>
            </div>
            <div style={{ 
              width: '100%', 
              height: '8px', 
              backgroundColor: '#e0e0e0', 
              borderRadius: '4px'
            }}>
              <div style={{ 
                width: '85%', 
                height: '100%', 
                backgroundColor: '#28a745',
                borderRadius: '4px'
              }}></div>
            </div>
            <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
              12 de 14 lecciones completadas
            </div>
          </div>
          <div style={{ marginBottom: '15px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
              <span style={{ fontWeight: 'bold', color: '#333' }}>
                <FaClock style={{ color: '#ffc107', marginRight: '8px' }} />
                Francés A1
              </span>
              <span style={{ fontSize: '14px', color: '#666' }}>60%</span>
            </div>
            <div style={{ 
              width: '100%', 
              height: '8px', 
              backgroundColor: '#e0e0e0', 
              borderRadius: '4px'
            }}>
              <div style={{ 
                width: '60%', 
                height: '100%', 
                backgroundColor: '#ffc107',
                borderRadius: '4px'
              }}></div>
            </div>
            <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
              6 de 10 lecciones completadas
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StudentDashboard