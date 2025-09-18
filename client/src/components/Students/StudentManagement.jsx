import React, { useState } from 'react'
import { Plus, Search, Filter, Edit, Eye } from 'lucide-react'

const StudentManagement = () => {
  const [students, setStudents] = useState([
    { id: 1, name: 'Ana', lastName: 'Martínez', email: 'ana@email.com', phone: '1234567890', dni: '12345678', level: 'A2', status: 'C' },
    { id: 2, name: 'Carlos', lastName: 'López', email: 'carlos@email.com', phone: '0987654321', dni: '87654321', level: 'B1', status: 'I' },
    { id: 3, name: 'María', lastName: 'García', email: 'maria@email.com', phone: '5555555555', dni: '11111111', level: 'C1', status: 'G' }
  ])

  const [showForm, setShowForm] = useState(false)
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [formData, setFormData] = useState({
    name: '', lastName: '', email: '', phone: '', dni: '', level: 'A1', status: 'I'
  })

  const statusLabels = {
    'I': 'Inscripto',
    'C': 'Cursando', 
    'A': 'Abandonado',
    'G': 'Graduado'
  }

  const levelOptions = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Validate email uniqueness
    if (students.some(s => s.email === formData.email)) {
      alert('El email ya existe en el sistema')
      return
    }

    const newStudent = {
      id: Date.now(),
      ...formData
    }
    
    setStudents([...students, newStudent])
    setFormData({ name: '', lastName: '', email: '', phone: '', dni: '', level: 'A1', status: 'I' })
    setShowForm(false)
    alert('Estudiante registrado exitosamente')
  }

  const filteredStudents = students.filter(student => {
    const matchesFilter = filter === 'all' || student.status === filter
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesFilter && matchesSearch
  })

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-lg font-semibold">Gestión de Estudiantes</h1>
        <button 
          onClick={() => setShowForm(true)}
          className="btn btn-primary"
        >
          <Plus size={16} />
          Registrar Estudiante
        </button>
      </div>

      <div className="card mb-4">
        <div className="flex gap-4 items-center">
          <div className="flex items-center gap-2">
            <Search size={16} />
            <input
              type="text"
              placeholder="Buscar estudiantes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input"
              style={{ width: '250px' }}
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Filter size={16} />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="form-select"
              style={{ width: '150px' }}
            >
              <option value="all">Todos</option>
              <option value="I">Inscriptos</option>
              <option value="C">Cursando</option>
              <option value="A">Abandonados</option>
              <option value="G">Graduados</option>
            </select>
          </div>
        </div>
      </div>

      {showForm && (
        <div className="card mb-4">
          <div className="card-header">
            <h3 className="card-title">Registrar Nuevo Estudiante</h3>
          </div>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Nombre *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="form-input"
                  maxLength="40"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Apellido *</label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                  className="form-input"
                  maxLength="40"
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
                  maxLength="50"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Teléfono *</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="form-input"
                  maxLength="10"
                  pattern="[0-9]{10}"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">DNI *</label>
                <input
                  type="text"
                  value={formData.dni}
                  onChange={(e) => setFormData({...formData, dni: e.target.value})}
                  className="form-input"
                  maxLength="8"
                  pattern="[0-9]{8}"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Nivel Inicial *</label>
                <select
                  value={formData.level}
                  onChange={(e) => setFormData({...formData, level: e.target.value})}
                  className="form-select"
                  required
                >
                  {levelOptions.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button type="submit" className="btn btn-primary">Registrar</button>
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
        <table className="table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Email</th>
              <th>Teléfono</th>
              <th>DNI</th>
              <th>Nivel</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>
                  No se encontraron estudiantes con los criterios seleccionados
                </td>
              </tr>
            ) : (
              filteredStudents.map(student => (
                <tr key={student.id}>
                  <td>{student.name} {student.lastName}</td>
                  <td>{student.email}</td>
                  <td>{student.phone}</td>
                  <td>{student.dni}</td>
                  <td>{student.level}</td>
                  <td>
                    <span className={`status-badge ${
                      student.status === 'C' ? 'status-active' : 
                      student.status === 'I' ? 'status-pending' : 'status-inactive'
                    }`}>
                      {statusLabels[student.status]}
                    </span>
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <button className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem' }}>
                        <Eye size={14} />
                      </button>
                      <button className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem' }}>
                        <Edit size={14} />
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
  )
}

export default StudentManagement