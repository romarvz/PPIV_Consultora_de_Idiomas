import React, { useState } from 'react'
import apiService from '../services/api.js'

const RegisterTeacher = ({ onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    dni: '',
    especialidades: [],
    tarifaPorHora: '',
    phone: '',
    disponibilidad: {
      lunes: [],
      martes: [],
      miercoles: [],
      jueves: [],
      viernes: [],
      sabado: [],
      domingo: []
    }
  })
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)
  
  const especialidadesDisponibles = [
    { value: 'ingles', label: 'Inglés' },
    { value: 'frances', label: 'Francés' },
    { value: 'aleman', label: 'Alemán' },
    { value: 'italiano', label: 'Italiano' },
    { value: 'portugues', label: 'Portugués' },
    { value: 'espanol', label: 'Español' }
  ]

  const diasSemana = [
    { key: 'lunes', label: 'Lunes' },
    { key: 'martes', label: 'Martes' },
    { key: 'miercoles', label: 'Miércoles' },
    { key: 'jueves', label: 'Jueves' },
    { key: 'viernes', label: 'Viernes' },
    { key: 'sabado', label: 'Sábado' },
    { key: 'domingo', label: 'Domingo' }
  ]

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Limpiar error cuando el usuario empiece a escribir
    if (error) setError('')
  }

  const handleEspecialidadChange = (especialidad) => {
    setFormData(prev => ({
      ...prev,
      especialidades: prev.especialidades.includes(especialidad)
        ? prev.especialidades.filter(e => e !== especialidad)
        : [...prev.especialidades, especialidad]
    }))
  }

  const addHorario = (dia) => {
    setFormData(prev => ({
      ...prev,
      disponibilidad: {
        ...prev.disponibilidad,
        [dia]: [
          ...prev.disponibilidad[dia],
          { inicio: '09:00', fin: '12:00' }
        ]
      }
    }))
  }

  const removeHorario = (dia, index) => {
    setFormData(prev => ({
      ...prev,
      disponibilidad: {
        ...prev.disponibilidad,
        [dia]: prev.disponibilidad[dia].filter((_, i) => i !== index)
      }
    }))
  }

  const updateHorario = (dia, index, field, value) => {
    setFormData(prev => ({
      ...prev,
      disponibilidad: {
        ...prev.disponibilidad,
        [dia]: prev.disponibilidad[dia].map((horario, i) => 
          i === index ? { ...horario, [field]: value } : horario
        )
      }
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    // Validaciones básicas
    if (formData.especialidades.length === 0) {
      setError('Debe seleccionar al menos una especialidad')
      setIsSubmitting(false)
      return
    }

    if (!formData.tarifaPorHora || parseFloat(formData.tarifaPorHora) <= 0) {
      setError('Debe especificar una tarifa por hora válida')
      setIsSubmitting(false)
      return
    }

    try {
      // Preparar datos para envío
      const teacherData = {
        ...formData,
        role: 'profesor',
        tarifaPorHora: parseFloat(formData.tarifaPorHora),
        // Filtrar días sin horarios
        disponibilidad: Object.fromEntries(
          Object.entries(formData.disponibilidad).filter(([_, horarios]) => horarios.length > 0)
        )
      }

      const response = await apiService.post('/auth/register/profesor', teacherData)
      
      if (response.data.success) {
        // Mostrar información del usuario creado y contraseña temporal
        const userData = response.data.data.user
        const tempPassword = formData.dni // La contraseña temporal es el DNI
        
        // Crear mensaje de éxito
        const message = ` ¡PROFESOR REGISTRADO CORRECTAMENTE! 

 Email: ${formData.email}
 Nombre: ${formData.firstName} ${formData.lastName}
 DNI: ${formData.dni}
 Especialidades: ${formData.especialidades.join(', ')}
 Tarifa: $${formData.tarifaPorHora}/hora
🔑 Contraseña temporal: ${tempPassword}

⚠️ IMPORTANTE:
• El profesor debe usar su DNI como contraseña inicial
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
        setError('Error: El servidor respondió pero no confirmó el registro exitoso del profesor')
      }
    } catch (error) {
      console.error('Error registrando profesor:', error)
      
      if (error.response?.data?.errors) {
        // Mostrar errores de validación específicos
        const errorMessages = error.response.data.errors.map(err => err.message).join(', ')
        setError(`Error de validación: ${errorMessages}`)
      } else if (error.response?.data?.message) {
        setError(error.response.data.message)
      } else {
        setError('Error al registrar profesor. Por favor, inténtalo de nuevo.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="register-teacher-form">
      <div style={{ 
        background: 'white', // Fondo blanco sólido
        padding: '30px', 
        borderRadius: '10px',
        boxShadow: '0 8px 25px rgba(0,0,0,0.3)', // Sombra más fuerte
        maxWidth: '800px',
        margin: '0 auto',
        position: 'relative',
        zIndex: 10001 // Z-index muy alto para estar al frente
      }}>
        <h3 style={{ 
          color: 'var(--primary)', 
          marginBottom: '20px',
          textAlign: 'center'
        }}>
          Registrar Nuevo Profesor
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
                    especialidades: [],
                    tarifaPorHora: '',
                    phone: '',
                    disponibilidad: {
                      lunes: [],
                      martes: [],
                      miercoles: [],
                      jueves: [],
                      viernes: [],
                      sabado: [],
                      domingo: []
                    }
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
          {/* Información Personal */}
          <div style={{ marginBottom: '25px' }}>
            <h5 style={{ color: 'var(--secondary)', marginBottom: '15px' }}>Información Personal</h5>
            
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
                  placeholder="Nombre del profesor"
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
                  placeholder="Apellido del profesor"
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
                placeholder="profesor@email.com"
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
          </div>

          {/* Información Profesional */}
          <div style={{ marginBottom: '25px' }}>
            <h5 style={{ color: 'var(--secondary)', marginBottom: '15px' }}>Información Profesional</h5>
            
            <div className="form-group" style={{ marginBottom: '15px' }}>
              <label>Especialidades *</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '8px' }}>
                {especialidadesDisponibles.map(esp => (
                  <label key={esp.value} style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={formData.especialidades.includes(esp.value)}
                      onChange={() => handleEspecialidadChange(esp.value)}
                      disabled={isSubmitting}
                    />
                    <span style={{ fontSize: '14px' }}>{esp.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '15px' }}>
              <label htmlFor="tarifaPorHora">Tarifa por Hora ($) *</label>
              <input
                type="number"
                id="tarifaPorHora"
                name="tarifaPorHora"
                value={formData.tarifaPorHora}
                onChange={handleChange}
                required
                disabled={isSubmitting}
                placeholder="2500"
                min="0"
                step="0.01"
                style={{ width: '200px', padding: '10px', borderRadius: '5px', border: '1px solid var(--input-border)' }}
              />
            </div>
          </div>

          {/* Disponibilidad */}
          <div style={{ marginBottom: '25px' }}>
            <h5 style={{ color: 'var(--secondary)', marginBottom: '15px' }}>Disponibilidad (Opcional)</h5>
            
            {diasSemana.map(dia => (
              <div key={dia.key} style={{ marginBottom: '15px', padding: '15px', border: '1px solid var(--input-border)', borderRadius: '5px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <strong>{dia.label}</strong>
                  <button
                    type="button"
                    onClick={() => addHorario(dia.key)}
                    disabled={isSubmitting}
                    style={{
                      padding: '5px 10px',
                      background: 'var(--accent)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '3px',
                      fontSize: '12px',
                      cursor: 'pointer'
                    }}
                  >
                    + Agregar horario
                  </button>
                </div>
                
                {formData.disponibilidad[dia.key].map((horario, index) => (
                  <div key={index} style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '8px' }}>
                    <input
                      type="time"
                      value={horario.inicio}
                      onChange={(e) => updateHorario(dia.key, index, 'inicio', e.target.value)}
                      disabled={isSubmitting}
                      style={{ padding: '5px', borderRadius: '3px', border: '1px solid var(--input-border)' }}
                    />
                    <span>a</span>
                    <input
                      type="time"
                      value={horario.fin}
                      onChange={(e) => updateHorario(dia.key, index, 'fin', e.target.value)}
                      disabled={isSubmitting}
                      style={{ padding: '5px', borderRadius: '3px', border: '1px solid var(--input-border)' }}
                    />
                    <button
                      type="button"
                      onClick={() => removeHorario(dia.key, index)}
                      disabled={isSubmitting}
                      style={{
                        padding: '5px 8px',
                        background: '#e57373',
                        color: 'white',
                        border: 'none',
                        borderRadius: '3px',
                        fontSize: '12px',
                        cursor: 'pointer'
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
                
                {formData.disponibilidad[dia.key].length === 0 && (
                  <p style={{ color: 'var(--text-secondary)', fontSize: '12px', fontStyle: 'italic' }}>
                    Sin horarios asignados
                  </p>
                )}
              </div>
            ))}
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
              {isSubmitting ? 'Registrando...' : 'Registrar Profesor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default RegisterTeacher