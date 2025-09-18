import React, { useState, useEffect } from 'react';

const TeacherForm = ({ teacher, onClose }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    especialidad: '',
    tarifaHora: '',
    disponibilidad: []
  });

  useEffect(() => {
    if (teacher) {
      setFormData(teacher);
    }
  }, [teacher]);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Guardando profesor:', formData);
    onClose();
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{teacher ? 'Editar Profesor' : 'Registrar Nuevo Profesor'}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Nombre</label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                className="form-control"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Apellido</label>
              <input
                type="text"
                value={formData.apellido}
                onChange={(e) => setFormData({...formData, apellido: e.target.value})}
                className="form-control"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="form-control"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Teléfono</label>
              <input
                type="tel"
                value={formData.telefono}
                onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                className="form-control"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Tarifa por Hora</label>
              <input
                type="number"
                value={formData.tarifaHora}
                onChange={(e) => setFormData({...formData, tarifaHora: e.target.value})}
                className="form-control"
                step="0.01"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Especialidad</label>
            <select
              value={formData.especialidad}
              onChange={(e) => setFormData({...formData, especialidad: e.target.value})}
              className="form-control"
              required
            >
              <option value="">Seleccionar especialidad</option>
              <option value="ingles-basico">Inglés Básico</option>
              <option value="ingles-intermedio">Inglés Intermedio</option>
              <option value="ingles-avanzado">Inglés Avanzado</option>
              <option value="ingles-corporativo">Inglés Corporativo</option>
            </select>
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              {teacher ? 'Actualizar' : 'Registrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TeacherForm;