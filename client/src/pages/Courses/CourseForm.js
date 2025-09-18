import React, { useState, useEffect } from 'react';

const CourseForm = ({ course, onClose }) => {
  const [formData, setFormData] = useState({
    codigo: '',
    nombre: '',
    modalidad: 'P',
    duracion: '',
    costo: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (course) {
      setFormData(course);
    }
  }, [course]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.codigo.trim()) {
      newErrors.codigo = 'El código es obligatorio';
    } else if (formData.codigo.length > 6) {
      newErrors.codigo = 'El código no puede exceder 6 caracteres';
    }

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es obligatorio';
    } else if (formData.nombre.length > 20) {
      newErrors.nombre = 'El nombre no puede exceder 20 caracteres';
    }

    if (!formData.duracion) {
      newErrors.duracion = 'La duración es obligatoria';
    } else if (isNaN(formData.duracion) || formData.duracion <= 0) {
      newErrors.duracion = 'La duración debe ser un número positivo';
    }

    if (!formData.costo) {
      newErrors.costo = 'El costo es obligatorio';
    } else if (isNaN(formData.costo) || formData.costo <= 0) {
      newErrors.costo = 'El costo debe ser un número positivo';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      console.log('Guardando curso:', formData);
      onClose();
    }
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{course ? 'Editar Curso' : 'Crear Nuevo Curso'}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="course-form">
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Código *</label>
              <input
                type="text"
                name="codigo"
                value={formData.codigo}
                onChange={handleChange}
                className={`form-control ${errors.codigo ? 'error' : ''}`}
                maxLength="6"
                placeholder="ENG001"
              />
              {errors.codigo && <span className="error-text">{errors.codigo}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Modalidad *</label>
              <select
                name="modalidad"
                value={formData.modalidad}
                onChange={handleChange}
                className="form-control"
              >
                <option value="P">Presencial</option>
                <option value="D">A Distancia / Virtual</option>
                <option value="H">Híbrida</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Nombre *</label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              className={`form-control ${errors.nombre ? 'error' : ''}`}
              maxLength="20"
              placeholder="Inglés Básico"
            />
            {errors.nombre && <span className="error-text">{errors.nombre}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Duración (horas) *</label>
              <input
                type="number"
                name="duracion"
                value={formData.duracion}
                onChange={handleChange}
                className={`form-control ${errors.duracion ? 'error' : ''}`}
                min="1"
                placeholder="40"
              />
              {errors.duracion && <span className="error-text">{errors.duracion}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Costo ($) *</label>
              <input
                type="number"
                name="costo"
                value={formData.costo}
                onChange={handleChange}
                className={`form-control ${errors.costo ? 'error' : ''}`}
                min="0"
                step="0.01"
                placeholder="1500.00"
              />
              {errors.costo && <span className="error-text">{errors.costo}</span>}
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              {course ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CourseForm;