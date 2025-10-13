import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth, useLoginForm } from '../hooks/useAuth.jsx'

// Login page for user authentication
const Login = () => {
  const navigate = useNavigate()
  const { user, error, loading, isAuthenticated, getRedirectPath } = useAuth()
  const { formData, isSubmitting, handleChange, handleSubmit } = useLoginForm()

  // Redirect if already authenticated
  useEffect(() => {
    console.log('Login useEffect - isAuthenticated:', isAuthenticated)
    console.log('User:', user)
    console.log('Redirect path:', getRedirectPath())
    
    if (isAuthenticated) {
      const redirectPath = getRedirectPath()
      console.log('Navigating to:', redirectPath)
      navigate(redirectPath, { replace: true })
    }
  }, [isAuthenticated, navigate, getRedirectPath, user])

  // Make section visible when component mounts
  useEffect(() => {
    const section = document.querySelector('.section')
    if (section) {
      section.classList.add('visible')
    }
  }, [])

  // Handle successful login
  const onSubmit = async (e) => {
    try {
      await handleSubmit(e)
      // If login is successful, useEffect will handle redirect
    } catch (error) {
      // Error is already handled in the auth context
      console.error('Login error:', error)
    }
  }

  return (
    <section className="section visible">
      <div className="container">
        <div style={{ maxWidth: '500px', margin: '0 auto' }}>
          <h2 className="section-title">Iniciar Sesión</h2>
          
          {/* Information for first-time users */}
          <div style={{ 
            background: 'var(--card-bg, #e7f3ff)', 
            border: '1px solid var(--input-border, #b3d9ff)',
            borderRadius: '5px',
            padding: '15px',
            marginBottom: '20px',
            fontSize: '14px',
            color: 'var(--text-primary)',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <strong> Información importante:</strong>
            <ul style={{ marginTop: '10px', paddingLeft: '20px' }}>
              <li><strong>Estudiantes y Profesores:</strong> En tu primer login, usa tu DNI como contraseña</li>
              <li><strong>Administradores:</strong> Usa la contraseña que te fue asignada</li>
              <li>Después del primer login, deberás cambiar tu contraseña</li>
            </ul>
          </div>
          
          {/* Show error message if login fails */}
          {error && (
            <div style={{ 
              color: 'red', 
              textAlign: 'center', 
              marginBottom: '20px',
              padding: '10px',
              background: '#ffe6e6',
              borderRadius: '5px',
              border: '1px solid #ffcccc'
            }}>
              {error}
            </div>
          )}

          {/* Show loading state */}
          {loading && (
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              Verificando credenciales...
            </div>
          )}

          {/* Login form */}
          <div className="contact-form">
            <form onSubmit={onSubmit}>
              {/* Email input field */}
              <div className="form-group">
                <label htmlFor="email">Correo Electrónico</label>
                <input 
                  type="email" 
                  id="email" 
                  name="email" 
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  required 
                  placeholder="ejemplo@email.com"
                />
              </div>
              
              {/* Password input field */}
              <div className="form-group">
                <label htmlFor="password">Contraseña</label>
                <input 
                  type="password" 
                  id="password" 
                  name="password" 
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  required 
                  placeholder="Tu contraseña"
                />
              </div>
              
              {/* Submit button */}
              <button 
                type="submit" 
                className="cta-btn"
                disabled={isSubmitting}
                style={{
                  opacity: isSubmitting ? 0.7 : 1,
                  cursor: isSubmitting ? 'not-allowed' : 'pointer'
                }}
              >
                {isSubmitting ? 'Ingresando...' : 'Ingresar'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Login