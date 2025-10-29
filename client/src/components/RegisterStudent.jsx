import React, { useState } from 'react'
import apiService from '../services/api.js'

const RegisterStudent = ({ onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    dni: '',
    nivel: 'A1',
    estadoAcademico: 'inscrito',
    phone: ''
  })
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)
  
  const niveles = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
  const estadosAcademicos = ['inscrito', 'en_curso', 'graduado', 'suspendido']

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Limpiar error cuando el usuario empiece a escribir
    if (error) setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      // Agregar el rol requerido
      const studentData = {
        ...formData,
        role: 'estudiante'
      }

      const response = await apiService.post('/auth/register/estudiante-admin', studentData)
      
      if (response.data.success) {
        // Mostrar información del usuario creado y contraseña temporal
        const userData = response.data.data.user
        const tempPassword = formData.dni // La contraseña temporal es el DNI
        
        // Crear mensaje de éxito
        const message = ` ¡ESTUDIANTE REGISTRADO CORRECTAMENTE! 

 Email: ${formData.email}
 Nombre: ${formData.firstName} ${formData.lastName}
 DNI: ${formData.dni}
 Nivel: ${formData.nivel}
🔑 Contraseña temporal: ${tempPassword}

⚠️ IMPORTANTE:
• El estudiante debe usar su DNI como contraseña inicial
• Deberá cambiar la contraseña en su primer login
• Guarda esta información de forma segura

 El registro se completó exitosamente`

        // Mostrar mensaje de éxito
        setSuccessMessage(message)
        setShowSuccess(true)
        setError('') // Limpiar cualquier error anterior
        
        // NO llamamos onSuccess automáticamente para que no se cierre el modal
        // Se llamará cuando el usuario haga clic en "Cerrar y Continuar"
      } else {
        setError('Error: El servidor respondió pero no confirmó el registro exitoso')
      }
    } catch (error) {
      console.error('Error registrando estudiante:', error)
      
      if (error.response?.data?.errors) {
        // Mostrar errores de validación específicos
        const errorMessages = error.response.data.errors.map(err => err.message).join(', ')
        setError(`Error de validación: ${errorMessages}`)
      } else if (error.response?.data?.message) {
        setError(error.response.data.message)
      } else {
        setError('Error al registrar estudiante. Por favor, inténtalo de nuevo.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="register-student-form">
      <div style={{ 
        background: 'white', // Fondo blanco sólido
        padding: '30px', 
        borderRadius: '10px',
        boxShadow: '0 8px 25px rgba(0,0,0,0.3)', // Sombra más fuerte
        maxWidth: '600px',
        margin: '0 auto',
        position: 'relative',
        zIndex: 10001 // Z-index muy alto para estar al frente
      }}>
        <h3 style={{ 
          color: 'var(--primary)', 
          marginBottom: '20px',
          textAlign: 'center'
        }}>
          Registrar Nuevo Estudiante
        </h3>

        {error && (
          <div style={{
            background: '#ffebee',
            border: '1px solid #e57373',
            color: '#c62828',
            padding: '10px',
            borderRadius: '5px',
            marginBottom: '20px',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}

        {showSuccess && (
          <div style={{
            background: '#e8f5e8',
            border: '2px solid #4caf50',
            color: '#2e7d32',
            padding: '20px',
            borderRadius: '10px',
            marginBottom: '20px',
            fontSize: '14px',
            whiteSpace: 'pre-line',
            textAlign: 'center',
            boxShadow: '0 4px 8px rgba(76, 175, 80, 0.2)'
          }}>
            {successMessage}
            <div style={{ marginTop: '15px' }}>
              <button
                onClick={() => {
                  setShowSuccess(false)
                  setSuccessMessage('')
                  // Limpiar formulario
                  setFormData({
                    email: '',
                    firstName: '',
                    lastName: '',
                    dni: '',
                    nivel: 'A1',
                    estadoAcademico: 'inscrito',
                    phone: ''
                  })
                  // Cerrar modal
                  if (onSuccess) onSuccess()
                }}
                style={{
                  background: '#4caf50',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}
              >
                 Cerrar y Continuar
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-row" style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label htmlFor="firstName">Nombre *</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                disabled={isSubmitting}
                placeholder="Nombre del estudiante"
                style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid var(--input-border)' }}
              />
            </div>
            
            <div className="form-group" style={{ flex: 1 }}>
              <label htmlFor="lastName">Apellido *</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                disabled={isSubmitting}
                placeholder="Apellido del estudiante"
                style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid var(--input-border)' }}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '15px' }}>
            <label htmlFor="email">Correo Electrónico *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={isSubmitting}
              placeholder="estudiante@email.com"
              style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid var(--input-border)' }}
            />
          </div>

          <div className="form-row" style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label htmlFor="dni">DNI *</label>
              <input
                type="text"
                id="dni"
                name="dni"
                value={formData.dni}
                onChange={handleChange}
                required
                disabled={isSubmitting}
                placeholder="12345678"
                minLength="7"
                maxLength="8"
                pattern="[0-9]{7,8}"
                style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid var(--input-border)' }}
              />
              <small style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
                7-8 dígitos. Será la contraseña temporal.
              </small>
            </div>
            
            <div className="form-group" style={{ flex: 1 }}>
              <label htmlFor="phone">Teléfono</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                disabled={isSubmitting}
                placeholder="+54911234567"
                style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid var(--input-border)' }}
              />
            </div>
          </div>

          <div className="form-row" style={{ display: 'flex', gap: '15px', marginBottom: '25px' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label htmlFor="nivel">Nivel Académico *</label>
              <select
                id="nivel"
                name="nivel"
                value={formData.nivel}
                onChange={handleChange}
                required
                disabled={isSubmitting}
                style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid var(--input-border)' }}
              >
                {niveles.map(nivel => (
                  <option key={nivel} value={nivel}>{nivel}</option>
                ))}
              </select>
            </div>
            
            <div className="form-group" style={{ flex: 1 }}>
              <label htmlFor="estadoAcademico">Estado Académico</label>
              <select
                id="estadoAcademico"
                name="estadoAcademico"
                value={formData.estadoAcademico}
                onChange={handleChange}
                disabled={isSubmitting}
                style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid var(--input-border)' }}
              >
                {estadosAcademicos.map(estado => (
                  <option key={estado} value={estado}>
                    {estado.replace('_', ' ').charAt(0).toUpperCase() + estado.replace('_', ' ').slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-actions" style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                disabled={isSubmitting}
                style={{
                  padding: '12px 24px',
                  border: '1px solid var(--input-border)',
                  background: 'transparent',
                  color: 'var(--text-primary)',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Cancelar
              </button>
            )}
            
            <button
              type="submit"
              disabled={isSubmitting}
              className="cta-btn"
              style={{
                padding: '12px 24px',
                opacity: isSubmitting ? 0.7 : 1,
                cursor: isSubmitting ? 'not-allowed' : 'pointer'
              }}
            >
              {isSubmitting ? 'Registrando...' : 'Registrar Estudiante'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default RegisterStudent