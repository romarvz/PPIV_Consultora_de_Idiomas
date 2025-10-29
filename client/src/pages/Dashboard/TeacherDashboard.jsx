import React, { useState } from 'react'
import { useAuth } from '../../hooks/useAuth.jsx'
import ForcePasswordChange from '../../components/common/ForcePasswordChange'

const TeacherDashboard = () => {
  const { user, logout, mustChangePassword } = useAuth()
  const [showPasswordChange, setShowPasswordChange] = useState(mustChangePassword)

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
    <section className="section">
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h2 className="section-title">Panel del Profesor</h2>
          <button 
            onClick={handleLogout}
            style={{
              background: '#dc3545',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Cerrar Sesión
          </button>
        </div>
        
        <div style={{ marginBottom: '2rem', textAlign: 'left' }}>
          <h3>Información Personal</h3>
          <div style={{ 
            background: '#f8f9fa', 
            padding: '20px', 
            borderRadius: '8px',
            marginBottom: '20px'
          }}>
            <p><strong>Nombre:</strong> {user?.firstName} {user?.lastName}</p>
            <p><strong>Email:</strong> {user?.email}</p>
            <p><strong>DNI:</strong> {user?.dni}</p>
            {user?.especialidades && user.especialidades.length > 0 && (
              <p><strong>Especialidades:</strong> {user.especialidades.join(', ')}</p>
            )}
            {user?.tarifa && <p><strong>Tarifa por hora:</strong> ${user.tarifa}</p>}
            {user?.phone && <p><strong>Teléfono:</strong> {user.phone}</p>}
          </div>
        </div>

        <div style={{ textAlign: 'center' }}>
          <p>¡Bienvenido/a Profesor/a {user?.firstName}!</p>
          <p>Aquí podrás gestionar tus clases, estudiantes y horarios.</p>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '20px',
            marginTop: '2rem'
          }}>
            <div style={{ 
              background: 'white', 
              padding: '20px', 
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <h4>Mis Clases</h4>
              <p>Próximamente: Gestión de clases programadas</p>
            </div>
            
            <div style={{ 
              background: 'white', 
              padding: '20px', 
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <h4>Mis Estudiantes</h4>
              <p>Próximamente: Lista de estudiantes asignados</p>
            </div>
            
            <div style={{ 
              background: 'white', 
              padding: '20px', 
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <h4>Horarios</h4>
              <p>Próximamente: Gestión de disponibilidad</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default TeacherDashboard