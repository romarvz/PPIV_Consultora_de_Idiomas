import React, { useState, useEffect } from 'react'
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
  const [languages, setLanguages] = useState([])
  const [loadingLanguages, setLoadingLanguages] = useState(true)
  
  // Cargar idiomas disponibles desde la API
  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        const response = await apiService.get('/languages')
        if (response.data.success && response.data.data.languages) {
          // Solo usar idiomas activos
          const activeLanguages = response.data.data.languages.filter(lang => lang.isActive)
          setLanguages(activeLanguages)
        }
      } catch (error) {
        console.error('Error cargando idiomas:', error)
        setError('Error cargando idiomas disponibles')
      } finally {
        setLoadingLanguages(false)
      }
    }
    
    fetchLanguages()
  }, [])

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

      console.log('DEBUG Frontend - Especialidades before sending:', formData.especialidades)
      console.log('DEBUG Frontend - TeacherData:', JSON.stringify(teacherData, null, 2))

      const response = await apiService.post('/auth/register/profesor', teacherData)
      
      if (response.data.success) {
        // Mostrar información del usuario creado y contraseña temporal
        const userData = response.data.data.user
        const tempPassword = formData.dni // La contraseña temporal es el DNI
        
        // Obtener nombres de especialidades
        const especialidadesNombres = formData.especialidades.map(id => {
          const lang = languages.find(l => l._id === id)
          return lang ? lang.name : id
        }).join(', ')
        
        // Crear mensaje de éxito
        const message = ` ¡PROFESOR REGISTRADO CORRECTAMENTE! 

 Email: ${formData.email}
 Nombre: ${formData.firstName} ${formData.lastName}
 DNI: ${formData.dni}
 Especialidades: ${especialidadesNombres}
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
    <div className="register-teacher-form" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10001,
      padding: '20px'
    }}>
      <div style={{ 
        background: 'var(--card-bg, white)',
        borderRadius: '10px',
        boxShadow: '0 8px 25px rgba(0,0,0,0.3)',
        maxWidth: '800px',
        width: '100%',
        maxHeight: '90vh',
        position: 'relative',
        color: 'var(--text-primary, #333)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{
          padding: '20px 30px',
          borderBottom: '1px solid var(--border-color, #ddd)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h3 style={{ 
            color: 'var(--primary)', 
            margin: 0
          }}>
            Registrar Nuevo Profesor
          </h3>
          <button
            onClick={onCancel}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              color: 'var(--text-secondary, #666)',
              cursor: 'pointer',
              padding: '5px',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ×
          </button>
        </div>
        
        <div style={{
          padding: '30px',
          overflowY: 'auto',
          flex: 1
        }}>

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
            <h4 style={{ color: 'var(--primary)', marginBottom: '15px', fontWeight: '600', fontSize: '1.1rem' }}>Información Personal</h4>
            
            <div className="form-row" style={{ display: 'flex', gap: '15px', marginBottom: '15px', flexWrap: 'wrap' }}>
              <div className="form-group" style={{ flex: 1, minWidth: '200px' }}>
                <label htmlFor="firstName" style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#333' }}>Nombre *</label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
                  placeholder="Nombre del profesor"
                  style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid var(--border-color, #ddd)', background: 'var(--input-bg, white)', color: 'var(--text-primary, #333)' }}
                />
              </div>
              
              <div className="form-group" style={{ flex: 1, minWidth: '200px' }}>
                <label htmlFor="lastName" style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#333' }}>Apellido *</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
                  placeholder="Apellido del profesor"
                  style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid var(--border-color, #ddd)', background: 'var(--input-bg, white)', color: 'var(--text-primary, #333)' }}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '15px' }}>
              <label htmlFor="email" style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#333' }}>Correo Electrónico *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={isSubmitting}
                placeholder="profesor@email.com"
                style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid var(--border-color, #ddd)', background: 'var(--input-bg, white)', color: 'var(--text-primary, #333)' }}
              />
            </div>

            <div className="form-row" style={{ display: 'flex', gap: '15px', marginBottom: '15px', flexWrap: 'wrap' }}>
              <div className="form-group" style={{ flex: 1, minWidth: '200px' }}>
                <label htmlFor="dni" style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#333' }}>DNI *</label>
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
                  style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid var(--border-color, #ddd)', background: 'var(--input-bg, white)', color: 'var(--text-primary, #333)' }}
                />
                <small style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
                  7-8 dígitos. Será la contraseña temporal.
                </small>
              </div>
              
              <div className="form-group" style={{ flex: 1, minWidth: '200px' }}>
                <label htmlFor="phone" style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#333' }}>Teléfono</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  placeholder="+54911234567"
                  style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid var(--border-color, #ddd)', background: 'var(--input-bg, white)', color: 'var(--text-primary, #333)' }}
                />
              </div>
            </div>
          </div>

          {/* Información Profesional */}
          <div style={{ marginBottom: '25px' }}>
            <h4 style={{ color: 'var(--primary)', marginBottom: '15px', fontWeight: '600', fontSize: '1.1rem' }}>Información Profesional</h4>
            
            <div className="form-group" style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#333' }}>Especialidades *</label>
              {loadingLanguages ? (
                <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  Cargando idiomas disponibles...
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '12px', marginTop: '8px' }}>
                  {languages.map(lang => (
                    <div 
                      key={lang._id} 
                      onClick={() => handleEspecialidadChange(lang._id)}
                      style={{ 
                        cursor: 'pointer',
                        padding: '12px',
                        border: formData.especialidades.includes(lang._id) ? '2px solid var(--primary, #3498db)' : '1px solid var(--border-color, #ddd)',
                        borderRadius: '6px',
                        backgroundColor: formData.especialidades.includes(lang._id) ? 'var(--primary-light, #e3f2fd)' : 'var(--card-bg, white)',
                        fontSize: '14px',
                        color: formData.especialidades.includes(lang._id) ? 'var(--primary, #3498db)' : 'var(--text-primary, #333)',
                        fontWeight: formData.especialidades.includes(lang._id) ? '600' : '400',
                        textAlign: 'center',
                        transition: 'all 0.2s ease',
                        userSelect: 'none'
                      }}
                    >
                      {lang.name}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="form-group" style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
              <label htmlFor="tarifaPorHora" style={{ fontWeight: '500', color: '#333', minWidth: 'fit-content' }}>Tarifa por Hora ($) *</label>
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
                style={{ width: '100%', maxWidth: '200px', padding: '10px', borderRadius: '5px', border: '1px solid var(--border-color, #ddd)', background: 'var(--input-bg, white)', color: 'var(--text-primary, #333)' }}
              />
            </div>
          </div>

          {/* Disponibilidad */}
          <div style={{ marginBottom: '25px' }}>
            <h4 style={{ color: 'var(--primary)', marginBottom: '15px', fontWeight: '600', fontSize: '1.1rem' }}>Disponibilidad (Opcional)</h4>
            
            {diasSemana.map(dia => (
              <div key={dia.key} style={{ marginBottom: '15px', padding: '15px', border: '1px solid var(--input-border)', borderRadius: '5px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <strong style={{ fontSize: '14px' }}>{dia.label}</strong>
                  <button
                    type="button"
                    onClick={() => addHorario(dia.key)}
                    disabled={isSubmitting}
                    style={{
                      padding: '6px 12px',
                      background: 'var(--accent)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '12px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      height: '32px'
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
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                fontSize: '14px'
              }}
            >
              {isSubmitting ? 'Registrando...' : 'Registrar Profesor'}
            </button>
          </div>
        </form>
        </div>
      </div>
    </div>
  )
}

export default RegisterTeacher