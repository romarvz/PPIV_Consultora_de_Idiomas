import React, { useState } from 'react'
import { useAuth } from '../../hooks/useAuth.jsx'
import ForcePasswordChange from '../../components/common/ForcePasswordChange'
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

// Mock data para el dashboard del profesor
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
    <div style={{ padding: '20px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <FaChalkboardTeacher style={{ color: '#2c5aa0', marginRight: '15px', fontSize: '32px' }} />
          <h1 style={{ color: '#333', fontSize: '28px', margin: 0 }}>Dashboard del Profesor</h1>
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

      {/* Teacher Info */}
      <div style={{ 
        background: 'white', 
        padding: '20px', 
        borderRadius: '8px',
        marginBottom: '20px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ color: '#333', marginTop: 0 }}>Información Personal</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
          <div>
            <p style={{ color: '#666', margin: '5px 0' }}><strong>Email:</strong> {user?.email}</p>
            <p style={{ color: '#666', margin: '5px 0' }}><strong>DNI:</strong> {user?.dni}</p>
          </div>
          <div>
            <p style={{ color: '#666', margin: '5px 0' }}><strong>Estudiantes Activos:</strong> {mockTeacherStats.activeStudents}</p>
            <p style={{ color: '#666', margin: '5px 0' }}><strong>Clases Completadas:</strong> {mockTeacherStats.completedClasses}</p>
          </div>
          <div>
            <p style={{ color: '#666', margin: '5px 0' }}><strong>Calificación:</strong> ⭐ {mockTeacherStats.averageRating}/5.0</p>
            <p style={{ color: '#666', margin: '5px 0' }}><strong>Ganancias del Mes:</strong> ${mockTeacherStats.monthlyEarnings.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Dashboard Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
        gap: '20px'
      }}>
        {/* Clases de Hoy */}
        <div style={{ 
          background: 'white', 
          padding: '20px', 
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
            <FaCalendarCheck style={{ color: '#2c5aa0', marginRight: '10px', fontSize: '18px' }} />
            <h4 style={{ color: '#2c5aa0', margin: 0 }}>Mis Clases de Hoy</h4>
          </div>
          {mockTodayClasses.map((clase) => (
            <div key={clase.id} style={{ 
              marginBottom: '15px', 
              padding: '10px', 
              border: '1px solid #eee',
              borderRadius: '5px',
              borderLeft: `4px solid ${
                clase.status === 'completed' ? '#28a745' : 
                clase.status === 'scheduled' ? '#2c5aa0' : '#ffc107'
              }`
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                <div style={{ fontWeight: 'bold', color: '#333' }}>
                  <FaUser style={{ marginRight: '8px', color: '#2c5aa0' }} />
                  {clase.student}
                </div>
                <span style={{ 
                  fontSize: '12px', 
                  padding: '2px 8px', 
                  borderRadius: '12px',
                  backgroundColor: clase.status === 'completed' ? '#d4edda' : 
                                  clase.status === 'scheduled' ? '#cce5ff' : '#fff3cd',
                  color: clase.status === 'completed' ? '#155724' : 
                         clase.status === 'scheduled' ? '#004085' : '#856404'
                }}>
                  {clase.status === 'completed' ? '✓ Completada' : 
                   clase.status === 'scheduled' ? '📅 Programada' : '⏰ Pendiente'}
                </span>
              </div>
              <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>
                <FaBookOpen style={{ marginRight: '5px' }} />
                {clase.subject} • {clase.type === 'group' ? 'Grupal' : 'Individual'}
              </div>
              <div style={{ fontSize: '13px', color: '#888' }}>
                <FaClock style={{ marginRight: '5px' }} />
                {clase.time} • {clase.duration}
              </div>
            </div>
          ))}
        </div>

        {/* Mis Estudiantes */}
        <div style={{ 
          background: 'white', 
          padding: '20px', 
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
            <FaUsers style={{ color: '#2c5aa0', marginRight: '10px', fontSize: '18px' }} />
            <h4 style={{ color: '#2c5aa0', margin: 0 }}>Mis Estudiantes</h4>
          </div>
          {mockStudents.slice(0, 4).map((student) => (
            <div key={student.id} style={{ 
              marginBottom: '15px', 
              padding: '10px', 
              border: '1px solid #eee',
              borderRadius: '5px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                <div>
                  <div style={{ fontWeight: 'bold', color: '#333' }}>
                    <FaGraduationCap style={{ marginRight: '8px', color: '#2c5aa0' }} />
                    {student.name}
                  </div>
                  <div style={{ fontSize: '13px', color: '#666' }}>{student.level}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '12px', color: '#888' }}>{student.progress}% progreso</div>
                  <div style={{ fontSize: '12px', color: '#888' }}>{student.totalClasses} clases</div>
                </div>
              </div>
              <div style={{ 
                width: '100%', 
                height: '4px', 
                backgroundColor: '#e0e0e0', 
                borderRadius: '2px'
              }}>
                <div style={{ 
                  width: `${student.progress}%`, 
                  height: '100%', 
                  backgroundColor: student.progress > 70 ? '#28a745' : student.progress > 40 ? '#ffc107' : '#dc3545',
                  borderRadius: '2px'
                }}></div>
              </div>
              <div style={{ fontSize: '11px', color: '#888', marginTop: '5px' }}>
                Última clase: {student.lastClass}
              </div>
            </div>
          ))}
          <div style={{ textAlign: 'center', marginTop: '10px' }}>
            <button style={{
              background: 'transparent',
              color: '#2c5aa0',
              border: '1px solid #2c5aa0',
              padding: '5px 15px',
              borderRadius: '3px',
              fontSize: '12px',
              cursor: 'pointer'
            }}>
              Ver todos los estudiantes ({mockStudents.length})
            </button>
          </div>
        </div>

        {/* Estadísticas del Profesor */}
        <div style={{ 
          background: 'white', 
          padding: '20px', 
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
            <FaStar style={{ color: '#2c5aa0', marginRight: '10px', fontSize: '18px' }} />
            <h4 style={{ color: '#2c5aa0', margin: 0 }}>Mi Rendimiento</h4>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
            <div style={{ textAlign: 'center', padding: '15px', background: '#f8f9fa', borderRadius: '5px' }}>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#2c5aa0' }}>
                {mockTeacherStats.todayClasses}
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>Clases Hoy</div>
            </div>
            <div style={{ textAlign: 'center', padding: '15px', background: '#f8f9fa', borderRadius: '5px' }}>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#28a745' }}>
                {mockTeacherStats.averageRating}
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>Calificación</div>
            </div>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
              <span style={{ fontWeight: 'bold', color: '#333' }}>Estudiantes Activos</span>
              <span style={{ fontSize: '14px', color: '#666' }}>
                {mockTeacherStats.activeStudents}/{mockTeacherStats.totalStudents}
              </span>
            </div>
            <div style={{ 
              width: '100%', 
              height: '8px', 
              backgroundColor: '#e0e0e0', 
              borderRadius: '4px'
            }}>
              <div style={{ 
                width: `${(mockTeacherStats.activeStudents / mockTeacherStats.totalStudents) * 100}%`, 
                height: '100%', 
                backgroundColor: '#2c5aa0',
                borderRadius: '4px'
              }}></div>
            </div>
          </div>

          <div style={{ textAlign: 'center', padding: '10px', background: '#e8f5e8', borderRadius: '5px' }}>
            <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#28a745' }}>
              <FaDollarSign style={{ marginRight: '5px' }} />
              ${mockTeacherStats.monthlyEarnings.toLocaleString()}
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>Ganancias este mes</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TeacherDashboard