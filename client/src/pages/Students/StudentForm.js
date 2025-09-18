import React, { useState, useEffect } from 'react';

const StudentForm = ({ student, onClose }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    dni: '',
    nivelInicial: 'A1',
    condicion: 'I'
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (student) {
      setFormData(student);
    }
  }, [student]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es obligatorio';
    } else if (formData.nombre.length > 40) {
      newErrors.nombre = 'El nombre no puede exceder 40 caracteres';
    }

    if (!formData.apellido.trim()) {
      newErrors.apellido = 'El apellido es obligatorio';
    } else if (formData.apellido.length > 40) {
      newErrors.apellido = 'El apellido no puede exceder 40 caracteres';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El email es obligatorio';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'El email no es válido';
    } else if (formData.email.length > 50) {
      newErrors.email = 'El email no puede exceder 50 caracteres';
    }

    if (!formData.telefono.trim()) {
      newErrors.telefono = 'El teléfono es obligatorio';
    } else if (!/^\d{10}$/.test(formData.telefono)) {
      newErrors.telefono = 'El teléfono debe tener 10 dígitos';
    }

    if (!formData.dni.trim()) {
      newErrors.dni = 'El DNI es obligatorio';
    } else if (!/^\d{8}$/.test(formData.dni)) {
      newErrors.dni = 'El DNI debe tener 8 dígitos';
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
    
    // Limpiar error del campo cuando el usuario empiece a escribir
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
      // Aquí iría la lógica para guardar el estudiante
      console.log('Guardando estudiante:', formData);
      onClose();
    }
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{student ? 'Editar Estudiante' : 'Registrar Nuevo Estudiante'}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="student-form">
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Nombre *</label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                className={`form-control ${errors.nombre ? 'error' : ''}`}
                maxLength="40"
              />
              {errors.nombre && <span className="error-text">{errors.nombre}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Apellido *</label>
              <input
                type="text"
                name="apellido"
                value={formData.apellido}
                onChange={handleChange}
                className={`form-control ${errors.apellido ? 'error' : ''}`}
                maxLength="40"
              />
              {errors.apellido && <span className="error-text">{errors.apellido}</span>}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`form-control ${errors.email ? 'error' : ''}`}
              maxLength="50"
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Teléfono *</label>
              <input
                type="tel"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                className={`form-control ${errors.telefono ? 'error' : ''}`}
                placeholder="1234567890"
                maxLength="10"
              />
              {errors.telefono && <span className="error-text">{errors.telefono}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">DNI *</label>
              <input
                type="text"
                name="dni"
                value={formData.dni}
                onChange={handleChange}
                className={`form-control ${errors.dni ? 'error' : ''}`}
                placeholder="12345678"
                maxLength="8"
              />
              {errors.dni && <span className="error-text">{errors.dni}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Nivel Inicial</label>
              <select
                name="nivelInicial"
                value={formData.nivelInicial}
                onChange={handleChange}
                className="form-control"
              >
                <option value="A1">A1 - Principiante</option>
                <option value="A2">A2 - Elemental</option>
                <option value="B1">B1 - Intermedio</option>
                <option value="B2">B2 - Intermedio Alto</option>
                <option value="C1">C1 - Avanzado</option>
                <option value="C2">C2 - Competencia</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Condición</label>
              <select
                name="condicion"
                value={formData.condicion}
                onChange={handleChange}
                className="form-control"
              >
                <option value="I">Inscripto</option>
                <option value="C">Cursando</option>
                <option value="G">Graduado</option>
                <option value="A">Abandonó</option>
              </select>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              {student ? 'Actualizar' : 'Registrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentForm;