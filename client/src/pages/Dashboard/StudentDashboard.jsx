import React, { useState } from 'react'
import { useAuth } from '../../hooks/useAuth.jsx'
import ForcePasswordChange from '../../components/common/ForcePasswordChange'

const StudentDashboard = () => {
  const { user, logout, mustChangePassword } = useAuth()
  const [showPasswordChange, setShowPasswordChange] = useState(mustChangePassword)

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
  if (showPasswordChange) {
    return <ForcePasswordChange onPasswordChanged={handlePasswordChanged} />
  }

  return (
    <section className="section">
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h2 className="section-title">Panel del Estudiante</h2>
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
            {user?.nivel && <p><strong>Nivel:</strong> {user.nivel.toUpperCase()}</p>}
            {user?.estado && <p><strong>Estado:</strong> {user.estado}</p>}
            {user?.phone && <p><strong>Teléfono:</strong> {user.phone}</p>}
          </div>
        </div>

        <div style={{ textAlign: 'center' }}>
          <p>¡Bienvenido/a {user?.firstName}!</p>
          <p>Aquí podrás ver tus clases, progreso y materiales de estudio.</p>
          
          {/* Placeholder for future features */}
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
              <p>Próximamente: Horarios y clases programadas</p>
            </div>
            
            <div style={{ 
              background: 'white', 
              padding: '20px', 
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <h4>Mi Progreso</h4>
              <p>Próximamente: Seguimiento de avance</p>
            </div>
            
            <div style={{ 
              background: 'white', 
              padding: '20px', 
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <h4>Materiales</h4>
              <p>Próximamente: Recursos de estudio</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default StudentDashboard