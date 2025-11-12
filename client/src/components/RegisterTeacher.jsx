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
    horariosPermitidos: []
  })
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)
  const [languages, setLanguages] = useState([])
  const [loadingLanguages, setLoadingLanguages] = useState(true)
  const [allHorarios, setAllHorarios] = useState([])
  const [loadingHorarios, setLoadingHorarios] = useState(true)
  
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

  const isHorarioValido = (horario) => {
    if (!horario || !horario.horaInicio || !horario.horaFin) return false
    const [startH, startM] = horario.horaInicio.split(':').map(Number)
    const [endH, endM] = horario.horaFin.split(':').map(Number)
    if (Number.isNaN(startH) || Number.isNaN(startM) || Number.isNaN(endH) || Number.isNaN(endM)) return false
    const startMinutes = startH * 60 + startM
    const endMinutes = endH * 60 + endM
    const diff = endMinutes - startMinutes
    return diff >= 120 && diff % 60 === 0
  }

  const ordenarHorarios = (horarios = []) => {
    const diasOrden = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo']
    return [...horarios].sort((a, b) => {
      const ordenA = diasOrden.indexOf(a.dia)
      const ordenB = diasOrden.indexOf(b.dia)
      if (ordenA !== ordenB) return ordenA - ordenB
      return a.horaInicio.localeCompare(b.horaInicio)
    })
  }

  const filtrarHorariosValidos = (horarios = []) => ordenarHorarios(horarios.filter(isHorarioValido))

  useEffect(() => {
    const fetchHorarios = async () => {
      try {
        setLoadingHorarios(true)
        const response = await apiService.get('/cursos/horarios/todos')
        if (response.data.success) {
          setAllHorarios(filtrarHorariosValidos(response.data.data || []))
        }
      } catch (err) {
        console.error('Error cargando horarios:', err)
        setAllHorarios([])
      } finally {
        setLoadingHorarios(false)
      }
    }

    fetchHorarios()
  }, [])

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

  const handleHorarioToggle = (horarioId) => {
    setFormData(prev => {
      const current = prev.horariosPermitidos || []
      const isSelected = current.includes(horarioId)
      return {
        ...prev,
        horariosPermitidos: isSelected
          ? current.filter(id => id !== horarioId)
          : [...current, horarioId]
      }
    })
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

    if (!formData.horariosPermitidos || formData.horariosPermitidos.length === 0) {
      setError('Debe seleccionar al menos un horario disponible')
      setIsSubmitting(false)
      return
    }

    try {
      const horariosSeleccionados = formData.horariosPermitidos || []

      let disponibilidad = {}
      if (horariosSeleccionados.length > 0) {
        disponibilidad = horariosSeleccionados.reduce((acc, horarioId) => {
          const horarioObj = allHorarios.find(h => h._id === horarioId || h._id?.toString() === horarioId)
          if (!horarioObj) return acc
          const dia = horarioObj.dia
          if (!acc[dia]) acc[dia] = []
          acc[dia].push({ inicio: horarioObj.horaInicio, fin: horarioObj.horaFin })
          return acc
        }, {})
      }

      const teacherData = {
        ...formData,
        role: 'profesor',
        tarifaPorHora: parseFloat(formData.tarifaPorHora),
        horariosPermitidos: horariosSeleccionados,
        disponibilidad
      }

      console.log('DEBUG Frontend - Especialidades before sending:', formData.especialidades)
      console.log('DEBUG Frontend - TeacherData:', JSON.stringify(teacherData, null, 2))

      const response = await apiService.post('/auth/register/profesor', teacherData)
      
      if (response.data.success) {
        // Mostrar información del usuario creado y contraseña temporal
        const userData = response.data.data.user
        const tempPassword = formData.dni // La contraseña temporal es el DNI

        const horariosSeleccionadosNombres = horariosSeleccionados.map(id => {
          const horario = allHorarios.find(h => h._id === id || h._id?.toString() === id)
          return horario ? (horario.display || `${horario.dia} ${horario.horaInicio}-${horario.horaFin}`) : id
        }).join(', ')
        
        // Obtener nombres de especialidades
        const especialidadesNombres = formData.especialidades.map(id => {
          const lang = languages.find(l => l._id === id)
          return lang ? lang.name : id
        }).join(', ')
        
        // Crear mensaje de éxito
        const message = `PROFESOR REGISTRADO CORRECTAMENTE

Email: ${formData.email}
Nombre: ${formData.firstName} ${formData.lastName}
DNI: ${formData.dni}
Especialidades: ${especialidadesNombres}
Tarifa: $${formData.tarifaPorHora}/hora
Horarios: ${horariosSeleccionadosNombres || 'Sin horarios seleccionados'}

Usuario: ${formData.email}
Contraseña: ${tempPassword}

IMPORTANTE:
• El profesor debe usar su correo electrónico como usuario
• Su contraseña es su DNI

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
                    horariosPermitidos: []
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

          {/* Horarios permitidos */}
          <div style={{ marginBottom: '25px' }}>
            <h4 style={{ color: 'var(--primary)', marginBottom: '15px', fontWeight: '600', fontSize: '1.1rem' }}>Horarios disponibles *</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '15px' }}>
              Seleccioná los bloques horarios que este profesor puede dictar. Podés elegir múltiples opciones.
            </p>
            {loadingHorarios ? (
              <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                Cargando horarios disponibles...
              </div>
            ) : allHorarios.length === 0 ? (
              <div style={{ padding: '16px', background: '#fff4e5', borderRadius: '6px', border: '1px solid #ffcc80', color: '#e65100' }}>
                No hay horarios configurados en el sistema. Agregalos desde Gestión de Cursos.
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
                gap: '12px'
              }}>
                {allHorarios.map(horario => {
                  const horarioId = horario._id ? horario._id.toString() : horario.id
                  const isSelected = formData.horariosPermitidos.includes(horarioId)
                  const diaCapitalizado = horario.dia ? horario.dia.charAt(0).toUpperCase() + horario.dia.slice(1) : ''
                  return (
                    <button
                      key={horarioId}
                      type="button"
                      onClick={() => handleHorarioToggle(horarioId)}
                      disabled={isSubmitting}
                      style={{
                        padding: '12px',
                        borderRadius: '8px',
                        border: isSelected ? '2px solid var(--primary)' : '1px solid var(--input-border)',
                        backgroundColor: isSelected ? 'var(--primary-light, #e3f2fd)' : 'var(--card-bg, #fff)',
                        color: isSelected ? 'var(--primary)' : 'var(--text-primary)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        gap: '4px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>{diaCapitalizado}</span>
                      <span style={{ fontSize: '0.85rem' }}>{horario.horaInicio} - {horario.horaFin}</span>
                    </button>
                  )
                })}
              </div>
            )}
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