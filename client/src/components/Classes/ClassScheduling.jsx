import React, { useState } from 'react'
import { Plus, Calendar, Clock, User, AlertTriangle } from 'lucide-react'

const ClassScheduling = () => {
  const [classes, setClasses] = useState([
    { id: 1, course: 'Inglés Básico A1', teacher: 'Prof. García', date: '2024-01-15', time: '10:00', duration: 2 },
    { id: 2, course: 'Business English', teacher: 'Prof. Smith', date: '2024-01-15', time: '14:00', duration: 1.5 },
    { id: 3, course: 'Inglés Intermedio B1', teacher: 'Prof. López', date: '2024-01-16', time: '09:00', duration: 2 }
  ])

  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    course: '', teacher: '', date: '', time: '', duration: ''
  })

  const courses = ['Inglés Básico A1', 'Inglés Intermedio B1', 'Business English']
  const teachers = ['Prof. García', 'Prof. Smith', 'Prof. López', 'Prof. Martínez']

  const checkConflicts = (newClass) => {
    return classes.some(existingClass => 
      existingClass.teacher === newClass.teacher &&
      existingClass.date === newClass.date &&
      existingClass.time === newClass.time
    )
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    const newClass = {
      id: Date.now(),
      ...formData,
      duration: parseFloat(formData.duration)
    }

    if (checkConflicts(newClass)) {
      alert('Conflicto de horario: El profesor ya tiene una clase programada en ese horario')
      return
    }
    
    setClasses([...classes, newClass])
    setFormData({ course: '', teacher: '', date: '', time: '', duration: '' })
    setShowForm(false)
    alert('Clase programada exitosamente')
  }

  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('es-ES', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-lg font-semibold">Programación de Clases</h1>
        <button 
          onClick={() => setShowForm(true)}
          className="btn btn-primary"
        >
          <Plus size={16} />
          Programar Clase
        </button>
      </div>

      {showForm && (
        <div className="card mb-4">
          <div className="card-header">
            <h3 className="card-title">Programar Nueva Clase</h3>
          </div>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Curso *</label>
                <select
                  value={formData.course}
                  onChange={(e) => setFormData({...formData, course: e.target.value})}
                  className="form-select"
                  required
                >
                  <option value="">Seleccionar curso</option>
                  {courses.map(course => (
                    <option key={course} value={course}>{course}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Profesor *</label>
                <select
                  value={formData.teacher}
                  onChange={(e) => setFormData({...formData, teacher: e.target.value})}
                  className="form-select"
                  required
                >
                  <option value="">Seleccionar profesor</option>
                  {teachers.map(teacher => (
                    <option key={teacher} value={teacher}>{teacher}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Fecha *</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Hora *</label>
                <input
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({...formData, time: e.target.value})}
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label className="form-label">Duración (horas) *</label>
                <input
                  type="number"
                  step="0.5"
                  value={formData.duration}
                  onChange={(e) => setFormData({...formData, duration: e.target.value})}
                  className="form-input"
                  min="0.5"
                  max="8"
                  required
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button type="submit" className="btn btn-primary">Programar Clase</button>
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
            <Calendar size={20} />
            Clases Programadas
          </h3>
        </div>
        
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Curso</th>
                <th>Profesor</th>
                <th>Fecha</th>
                <th>Hora</th>
                <th>Duración</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {classes.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>
                    No hay clases programadas
                  </td>
                </tr>
              ) : (
                classes.map(classItem => (
                  <tr key={classItem.id}>
                    <td>{classItem.course}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <User size={14} />
                        {classItem.teacher}
                      </div>
                    </td>
                    <td>{formatDate(classItem.date)}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <Clock size={14} />
                        {classItem.time}
                      </div>
                    </td>
                    <td>{classItem.duration}h</td>
                    <td>
                      <span className="status-badge status-pending">
                        Programada
                      </span>
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <button className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>
                          Editar
                        </button>
                        <button className="btn btn-error" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>
                          Cancelar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            <AlertTriangle size={20} />
            Recordatorios Automáticos
          </h3>
        </div>
        <div style={{ padding: '1rem', backgroundColor: 'var(--light-blue)', borderRadius: '0.375rem' }}>
          <p style={{ margin: 0, color: 'var(--primary-blue)' }}>
            Los estudiantes recibirán recordatorios automáticos por email 24 horas antes de cada clase programada.
          </p>
        </div>
      </div>
    </div>
  )
}

export default ClassScheduling