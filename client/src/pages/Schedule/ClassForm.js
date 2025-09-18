import React, { useState } from 'react';

const ClassForm = ({ selectedDate, onClose }) => {
  const [formData, setFormData] = useState({
    curso: '',
    profesor: '',
    fecha: selectedDate ? selectedDate.toISOString().split('T')[0] : '',
    hora: selectedDate ? selectedDate.toTimeString().slice(0, 5) : '',
    duracion: 90
  });
  const [errors, setErrors] = useState({});

  const mockCourses = [
    { id: 1, name: 'Inglés Básico A1' },
    { id: 2, name: 'Inglés Intermedio B1' },
    { id: 3, name: 'Inglés Avanzado C1' }
  ];

  const mockTeachers = [
    { id: 1, name: 'Prof. García' },
    { id: 2, name: 'Prof. Martínez' },
    { id: 3, name: 'Prof. López' }
  ];

  const validateForm = () => {
    const newErrors = {};

    if (!formData.curso) newErrors.curso = 'Seleccione un curso';
    if (!formData.profesor) newErrors.profesor = 'Seleccione un profesor';
    if (!formData.fecha) newErrors.fecha = 'Seleccione una fecha';
    if (!formData.hora) newErrors.hora = 'Seleccione una hora';
    if (!formData.duracion || formData.duracion <= 0) {
      newErrors.duracion = 'La duración debe ser mayor a 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      console.log('Programando clase:', formData);
      onClose();
    }
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Programar Nueva Clase</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="class-form">
          <div className="form-group">
            <label className="form-label">Curso *</label>
            <select
              name="curso"
              value={formData.curso}
              onChange={handleChange}
              className={`form-control ${errors.curso ? 'error' : ''}`}
            >
              <option value="">Seleccionar curso</option>
              {mockCourses.map(course => (
                <option key={course.id} value={course.id}>
                  {course.name}
                </option>
              ))}
            </select>
            {errors.curso && <span className="error-text">{errors.curso}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Profesor *</label>
            <select
              name="profesor"
              value={formData.profesor}
              onChange={handleChange}
              className={`form-control ${errors.profesor ? 'error' : ''}`}
            >
              <option value="">Seleccionar profesor</option>
              {mockTeachers.map(teacher => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.name}
                </option>
              ))}
            </select>
            {errors.profesor && <span className="error-text">{errors.profesor}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Fecha *</label>
              <input
                type="date"
                name="fecha"
                value={formData.fecha}
                onChange={handleChange}
                className={`form-control ${errors.fecha ? 'error' : ''}`}
              />
              {errors.fecha && <span className="error-text">{errors.fecha}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Hora *</label>
              <input
                type="time"
                name="hora"
                value={formData.hora}
                onChange={handleChange}
                className={`form-control ${errors.hora ? 'error' : ''}`}
              />
              {errors.hora && <span className="error-text">{errors.hora}</span>}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Duración (minutos) *</label>
            <select
              name="duracion"
              value={formData.duracion}
              onChange={handleChange}
              className="form-control"
            >
              <option value={60}>60 minutos</option>
              <option value={90}>90 minutos</option>
              <option value={120}>120 minutos</option>
            </select>
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              Programar Clase
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClassForm;