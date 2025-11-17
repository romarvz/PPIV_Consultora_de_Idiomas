import React, { useState, useEffect } from 'react'
import apiAdapter from '../../services/apiAdapter'
import { FaSpinner, FaTimes } from 'react-icons/fa'

const GenerateReportModal = ({ type, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false)
  const [loadingCourses, setLoadingCourses] = useState(false)
  const [formData, setFormData] = useState({
    cursoId: ''
  })
  const [courses, setCourses] = useState([])

  useEffect(() => {
    if (type === 'academic') {
      loadCourses()
    } else {
      // Limpiar cursos si no es académico
      setCourses([])
    }
  }, [type])

  const loadCourses = async () => {
    setLoadingCourses(true)
    try {
      console.log('GenerateReportModal - Cargando cursos...')
      // Solicitar todos los cursos (el backend limita a 100 máximo)
      const response = await apiAdapter.cursos.getAll({
        page: 1,
        limit: 100 // Máximo permitido por el backend
      })
      console.log('GenerateReportModal - Respuesta completa:', response)
      console.log('GenerateReportModal - response.data:', response.data)
      console.log('GenerateReportModal - response.data.data:', response.data?.data)
      
      if (response.data.success) {
        // El endpoint devuelve data como array directo de cursos
        const cursos = response.data.data || []
        console.log('GenerateReportModal - Cursos cargados para reporte:', cursos.length)
        if (cursos.length > 0) {
          console.log('GenerateReportModal - Primeros cursos:', cursos.slice(0, 3).map(c => ({ id: c._id, nombre: c.nombre })))
        }
        setCourses(cursos)
      } else {
        console.warn('GenerateReportModal - La respuesta de cursos no fue exitosa:', response.data)
        setCourses([])
      }
    } catch (error) {
      console.error('GenerateReportModal - Error loading courses:', error)
      console.error('GenerateReportModal - Error completo:', error.response?.data || error.message)
      setCourses([])
    } finally {
      setLoadingCourses(false)
    }
  }

  const handleGenerateAutomatic = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')

      if (type === 'academic') {
        if (!formData.cursoId) {
          alert('Por favor seleccione un curso')
          return
        }

        const response = await fetch(
          `http://localhost:5000/api/reportes-academicos/generar-automatico/${formData.cursoId}`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        )

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Error al generar reportes')
        }

        alert(`✅ Se generaron ${data.data?.length || 0} reportes académicos exitosamente`)
        onSuccess()
        onClose()
      } else {
        const response = await fetch(
          'http://localhost:5000/api/reportes-financieros/generar-automatico',
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        )

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Error al generar reporte')
        }

        alert('✅ Reporte financiero generado exitosamente')
        onSuccess()
        onClose()
      }
    } catch (error) {
      console.error('Error generating report:', error)
      alert('Error al generar reporte:\n' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: 'var(--card-bg)',
        borderRadius: '12px',
        padding: '2rem',
        maxWidth: '500px',
        width: '90%',
        boxShadow: 'var(--shadow-lg)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem'
        }}>
          <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>
            Generar Reporte {type === 'academic' ? 'Académico' : 'Financiero'}
          </h3>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              color: 'var(--text-secondary)'
            }}
          >
            <FaTimes />
          </button>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          {type === 'academic' ? (
            <>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                color: 'var(--text-primary)',
                fontWeight: '500'
              }}>
                Seleccionar Curso
              </label>
              {loadingCourses ? (
                <div style={{
                  width: '100%',
                  padding: '0.75rem',
                  textAlign: 'center',
                  color: 'var(--text-secondary)'
                }}>
                  <FaSpinner style={{ 
                    animation: 'spin 1s linear infinite',
                    marginRight: '0.5rem'
                  }} />
                  Cargando cursos...
                </div>
              ) : (
                <select
                  value={formData.cursoId}
                  onChange={(e) => setFormData({ ...formData, cursoId: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid var(--input-border)',
                    borderRadius: '6px',
                    fontSize: '1rem',
                    background: 'var(--input-bg)',
                    color: 'var(--text-primary)'
                  }}
                >
                  <option value="">Seleccione un curso...</option>
                  {courses.length === 0 ? (
                    <option value="" disabled>No hay cursos disponibles</option>
                  ) : (
                    courses.map(course => (
                      <option key={course._id} value={course._id}>
                        {course.nombre} - {course.idioma || 'N/A'}
                      </option>
                    ))
                  )}
                </select>
              )}
              <p style={{
                fontSize: '0.875rem',
                color: 'var(--text-secondary)',
                marginTop: '0.5rem'
              }}>
                Se generarán reportes automáticos para todos los estudiantes del curso
              </p>
            </>
          ) : (
            <p style={{
              fontSize: '0.875rem',
              color: 'var(--text-secondary)',
              marginBottom: '1rem'
            }}>
              Se generará un reporte financiero automático para el período actual usando datos reales de cobros y facturas.
            </p>
          )}
        </div>

        <div style={{
          display: 'flex',
          gap: '1rem',
          justifyContent: 'flex-end'
        }}>
          <button
            onClick={onClose}
            disabled={loading}
            style={{
              padding: '0.75rem 1.5rem',
              border: '1px solid var(--border-color)',
              borderRadius: '6px',
              background: 'transparent',
              color: 'var(--text-primary)',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: '500'
            }}
          >
            Cancelar
          </button>
          <button
            onClick={handleGenerateAutomatic}
            disabled={loading || (type === 'academic' && !formData.cursoId)}
            style={{
              padding: '0.75rem 1.5rem',
              border: 'none',
              borderRadius: '6px',
              background: 'var(--primary)',
              color: 'white',
              cursor: (loading || (type === 'academic' && !formData.cursoId)) ? 'not-allowed' : 'pointer',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              opacity: (loading || (type === 'academic' && !formData.cursoId)) ? 0.6 : 1
            }}
          >
            {loading ? (
              <>
                <FaSpinner style={{ animation: 'spin 1s linear infinite' }} />
                Generando...
              </>
            ) : (
              'Generar Reporte'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default GenerateReportModal
