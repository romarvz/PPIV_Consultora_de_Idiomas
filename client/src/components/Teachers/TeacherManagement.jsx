import React, { useState } from 'react'
import { Plus, GraduationCap, Clock, AlertTriangle, Calendar } from 'lucide-react'

const TeacherManagement = () => {
  const [teachers, setTeachers] = useState([
    { 
      id: 1, 
      name: 'Prof. García', 
      email: 'garcia@linguaacademy.com', 
      specialty: 'Inglés General', 
      availability: 'Lun-Vie 9:00-17:00',
      assignedCourses: ['Inglés Básico A1', 'Inglés Intermedio B1']
    },
    { 
      id: 2, 
      name: 'Prof. Smith', 
      email: 'smith@linguaacademy.com', 
      specialty: 'Business English', 
      availability: 'Mar-Sáb 10:00-18:00',
      assignedCourses: ['Business English']
    }
  ])

  const [showForm, setShowForm] = useState(false)
  const [showAvailabilityForm, setShowAvailabilityForm] = useState(false)
  const [selectedTeacher, setSelectedTeacher] = useState(null)
  const [formData, setFormData] = useState({
    name: '', email: '', specialty: '', availability: ''
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (teachers.some(t => t.email === formData.email)) {
      alert('El email ya existe en el sistema')
      return
    }

    const newTeacher = {
      id: Date.now(),
      ...formData,
      assignedCourses: []
    }
    
    setTeachers([...teachers, newTeacher])
    setFormData({ name: '', email: '', specialty: '', availability: '' })
    setShowForm(false)
    alert('Profesor registrado exitosamente')
  }

  const updateAvailability = (teacherId, newAvailability) => {
    const updatedTeachers = teachers.map(teacher => {
      if (teacher.id === teacherId) {
        return { ...teacher, availability: newAvailability }
      }
      return teacher
    })
    setTeachers(updatedTeachers)
    alert('Disponibilidad actualizada exitosamente')
  }

  const registerAbsence = (teacherId, reason) => {
    // Mock absence registration
    alert(`Ausencia registrada para el profesor. Motivo: ${reason}. Se ha enviado notificación por email.`)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-lg font-semibold">Gestión de Profesores</h1>
        <button 
          onClick={() => setShowForm(true)}
          className="btn btn-primary"
        >
          <Plus size={16} />
          Registrar Profesor
        </button>
      </div>

      {showForm && (
        <div className="card mb-4">
          <div className="card-header">
            <h3 className="card-title">Registrar Nuevo Profesor</h3>
          </div>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Nombre Completo *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Especialidad *</label>
                <input
                  type="text"
                  value={formData.specialty}
                  onChange={(e) => setFormData({...formData, specialty: e.target.value})}
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Disponibilidad Horaria *</label>
                <input
                  type="text"
                  value={formData.availability}
                  onChange={(e) => setFormData({...formData, availability: e.target.value})}
                  className="form-input"
                  placeholder="Ej: Lun-Vie 9:00-17:00"
                  required
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button type="submit" className="btn btn-primary">Registrar Profesor</button>
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

      {showAvailabilityForm && selectedTeacher && (
        <div className="card mb-4">
          <div className="card-header">
            <h3 className="card-title">Actualizar Disponibilidad - {selectedTeacher.name}</h3>
          </div>
          <form onSubmit={(e) => {
            e.preventDefault()
            const newAvailability = e.target.availability.value
            updateAvailability(selectedTeacher.id, newAvailability)
            setShowAvailabilityForm(false)
            setSelectedTeacher(null)
          }}>
            <div className="form-group">
              <label className="form-label">Nueva Disponibilidad *</label>
              <input
                name="availability"
                type="text"
                defaultValue={selectedTeacher.availability}
                className="form-input"
                placeholder="Ej: Lun-Vie 9:00-17:00"
                required
              />
            </div>
            <div className="flex gap-2 mt-4">
              <button type="submit" className="btn btn-primary">Actualizar</button>
              <button 
                type="button" 
                onClick={() => {
                  setShowAvailabilityForm(false)
                  setSelectedTeacher(null)
                }}
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
            <GraduationCap size={20} />
            Profesores Registrados
          </h3>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '1rem' }}>
          {teachers.map(teacher => (
            <div key={teacher.id} className="card" style={{ margin: 0 }}>
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 style={{ fontWeight: '600', color: 'var(--gray-900)', marginBottom: '0.25rem' }}>
                    {teacher.name}
                  </h4>
                  <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)', marginBottom: '0.5rem' }}>
                    {teacher.email}
                  </p>
                  <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>
                    Especialidad: {teacher.specialty}
                  </p>
                </div>
              </div>
              
              <div className="mb-3">
                <div className="flex items-center gap-2 mb-2">
                  <Clock size={14} />
                  <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>Disponibilidad:</span>
                </div>
                <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)', marginLeft: '1.25rem' }}>
                  {teacher.availability}
                </p>
              </div>

              <div className="mb-3">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar size={14} />
                  <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>Cursos Asignados:</span>
                </div>
                {teacher.assignedCourses.length > 0 ? (
                  <div style={{ marginLeft: '1.25rem' }}>
                    {teacher.assignedCourses.map((course, index) => (
                      <span key={index} className="status-badge status-active" style={{ marginRight: '0.5rem', marginBottom: '0.25rem', display: 'inline-block' }}>
                        {course}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p style={{ fontSize: '0.875rem', color: 'var(--gray-500)', marginLeft: '1.25rem' }}>
                    Sin cursos asignados
                  </p>
                )}
              </div>
              
              <div className="flex gap-2 flex-wrap">
                <button 
                  onClick={() => {
                    setSelectedTeacher(teacher)
                    setShowAvailabilityForm(true)
                  }}
                  className="btn btn-secondary" 
                  style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                >
                  <Clock size={12} />
                  Actualizar Disponibilidad
                </button>
                <button 
                  onClick={() => {
                    const reason = prompt('Motivo de la ausencia:', 'Enfermedad')
                    if (reason) registerAbsence(teacher.id, reason)
                  }}
                  className="btn btn-warning" 
                  style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                >
                  <AlertTriangle size={12} />
                  Registrar Ausencia
                </button>
              </div>
            </div>
          ))}
        </div>
        
        {teachers.length === 0 && (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--gray-600)' }}>
            No hay profesores registrados
          </div>
        )}
      </div>
    </div>
  )
}

export default TeacherManagement