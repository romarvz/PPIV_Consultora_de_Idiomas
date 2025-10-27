// Component for forced password change on first login
import React, { useState } from 'react'
import { useAuth } from '../../hooks/useAuth.jsx'
import { authAPI } from '../../services/api'

const ForcePasswordChange = ({ onPasswordChanged }) => {
  console.log(' ForcePasswordChange component rendering...')
  
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const { user } = useAuth()
  
  console.log('ForcePasswordChange - user:', user)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    // Clear error when user starts typing
    if (error) setError('')
  }

  const validatePassword = (password) => {
    const minLength = password.length >= 6
    const hasUpperCase = /[A-Z]/.test(password)
    const hasLowerCase = /[a-z]/.test(password)
    const hasNumber = /\d/.test(password)
    
    return {
      isValid: minLength && hasUpperCase && hasLowerCase && hasNumber,
      errors: {
        minLength: !minLength ? 'La contraseña debe tener al menos 6 caracteres' : '',
        hasUpperCase: !hasUpperCase ? 'Debe contener al menos una letra mayúscula' : '',
        hasLowerCase: !hasLowerCase ? 'Debe contener al menos una letra minúscula' : '',
        hasNumber: !hasNumber ? 'Debe contener al menos un número' : ''
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (isSubmitting) return
    
    // Validate passwords match
    if (formData.newPassword !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }
    
    // Validate password requirements
    const validation = validatePassword(formData.newPassword)
    if (!validation.isValid) {
      const errorMessages = Object.values(validation.errors).filter(Boolean)
      setError(errorMessages.join('. '))
      return
    }
    
    try {
      setIsSubmitting(true)
      setError('')
      
      await authAPI.changePasswordForced(formData.newPassword)
      
      // Notify parent component that password was changed
      onPasswordChanged()
      
    } catch (error) {
      setError(error.message || 'Error al cambiar la contraseña')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="section">
      <div className="container">
        <div style={{ maxWidth: '500px', margin: '0 auto' }}>
          <h2 className="section-title">Cambio de Contraseña Obligatorio</h2>
          
          <div style={{ 
            background: '#fff3cd', 
            border: '1px solid #ffecb5',
            borderRadius: '5px',
            padding: '15px',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            <p><strong>¡Bienvenido/a {user?.firstName}!</strong></p>
            <p>Para usar el sistema por primera vez, debes cambiar tu contraseña.</p>
            <p>Tu contraseña actual es tu DNI: <strong>{user?.dni}</strong></p>
          </div>

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

          <div className="contact-form">
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="newPassword">Nueva Contraseña *</label>
                <input 
                  type="password" 
                  id="newPassword" 
                  name="newPassword" 
                  value={formData.newPassword}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  required 
                  placeholder="Mínimo 6 caracteres, 1 mayúscula, 1 minúscula, 1 número"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirmar Contraseña *</label>
                <input 
                  type="password" 
                  id="confirmPassword" 
                  name="confirmPassword" 
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  required 
                  placeholder="Repite la nueva contraseña"
                />
              </div>

              <div style={{ 
                background: '#e7f3ff', 
                border: '1px solid #b3d9ff',
                borderRadius: '5px',
                padding: '15px',
                marginBottom: '20px',
                fontSize: '14px'
              }}>
                <strong>Requisitos de la contraseña:</strong>
                <ul style={{ marginTop: '10px', paddingLeft: '20px' }}>
                  <li>Mínimo 6 caracteres</li>
                  <li>Al menos una letra mayúscula (A-Z)</li>
                  <li>Al menos una letra minúscula (a-z)</li>
                  <li>Al menos un número (0-9)</li>
                </ul>
              </div>
              
              <button 
                type="submit" 
                className="cta-btn"
                disabled={isSubmitting}
                style={{
                  opacity: isSubmitting ? 0.7 : 1,
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  width: '100%'
                }}
              >
                {isSubmitting ? 'Cambiando Contraseña...' : 'Cambiar Contraseña'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ForcePasswordChange