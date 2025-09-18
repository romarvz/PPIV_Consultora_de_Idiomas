import React, { useState } from 'react'
import { Plus, BookOpen, Clock, DollarSign } from 'lucide-react'

const CourseManagement = () => {
  const [courses, setCourses] = useState([
    { id: 1, code: 'ENG001', name: 'Inglés Básico A1', modality: 'P', duration: 40, cost: 15000.00 },
    { id: 2, code: 'ENG002', name: 'Inglés Intermedio B1', modality: 'D', duration: 60, cost: 18000.00 },
    { id: 3, code: 'ENG003', name: 'Business English', modality: 'H', duration: 80, cost: 25000.00 }
  ])

  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    code: '', name: '', modality: 'P', duration: '', cost: ''
  })

  const modalityLabels = {
    'P': 'Presencial',
    'D': 'A Distancia',
    'H': 'Híbrida'
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      alert('El nombre del curso es obligatorio')
      return
    }

    const newCourse = {
      id: Date.now(),
      ...formData,
      duration: parseInt(formData.duration),
      cost: parseFloat(formData.cost)
    }
    
    setCourses([...courses, newCourse])
    setFormData({ code: '', name: '', modality: 'P', duration: '', cost: '' })
    setShowForm(false)
    alert('Curso creado exitosamente')
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-lg font-semibold">Gestión de Cursos</h1>
        <button 
          onClick={() => setShowForm(true)}
          className="btn btn-primary"
        >
          <Plus size={16} />
          Crear Curso
        </button>
      </div>

      {showForm && (
        <div className="card mb-4">
          <div className="card-header">
            <h3 className="card-title">Crear Nuevo Curso</h3>
          </div>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Código *</label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({...formData, code: e.target.value})}
                  className="form-input"
                  maxLength="6"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Nombre *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="form-input"
                  maxLength="20"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Modalidad *</label>
                <select
                  value={formData.modality}
                  onChange={(e) => setFormData({...formData, modality: e.target.value})}
                  className="form-select"
                  required
                >
                  <option value="P">Presencial</option>
                  <option value="D">A Distancia</option>
                  <option value="H">Híbrida</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Duración (horas) *</label>
                <input
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData({...formData, duration: e.target.value})}
                  className="form-input"
                  min="1"
                  required
                />
              </div>
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label className="form-label">Costo *</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.cost}
                  onChange={(e) => setFormData({...formData, cost: e.target.value})}
                  className="form-input"
                  min="0"
                  required
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button type="submit" className="btn btn-primary">Crear Curso</button>
              <button 
                type="button" 
                onClick={() => setShowForm(false)}
                className="btn btn-secondary"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            <BookOpen size={20} />
            Catálogo de Cursos
          </h3>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
          {courses.map(course => (
            <div key={course.id} className="card" style={{ margin: 0 }}>
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 style={{ fontWeight: '600', color: 'var(--gray-900)', marginBottom: '0.25rem' }}>
                    {course.name}
                  </h4>
                  <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>
                    Código: {course.code}
                  </p>
                </div>
                <span className={`status-badge ${
                  course.modality === 'P' ? 'status-active' : 
                  course.modality === 'D' ? 'status-pending' : 'status-inactive'
                }`}>
                  {modalityLabels[course.modality]}
                </span>
              </div>
              
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Clock size={14} />
                  <span>{course.duration}h</span>
                </div>
                <div className="flex items-center gap-1">
                  <DollarSign size={14} />
                  <span>${course.cost.toLocaleString()}</span>
                </div>
              </div>
              
              <div className="flex gap-2 mt-3">
                <button className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}>
                  Editar
                </button>
                <button className="btn btn-primary" style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}>
                  Ver Detalles
                </button>
              </div>
            </div>
          ))}
        </div>
        
        {courses.length === 0 && (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--gray-600)' }}>
            No hay cursos disponibles. Crea el primer curso.
          </div>
        )}
      </div>
    </div>
  )
}

export default CourseManagement