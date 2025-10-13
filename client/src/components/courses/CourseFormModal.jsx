// /client/src/components/courses/CourseFormModal.jsx

import React, { useState, useEffect } from 'react';
import apiAdapter from '../../services/apiAdapter';

const CourseFormModal = ({ course, onClose, onSave, teachers }) => {
  const [formData, setFormData] = useState({ /* ...la lógica no cambia... */ });

  useEffect(() => { /* ...la lógica no cambia... */ }, [course]);

  const handleChange = (e) => { /* ...la lógica no cambia... */ };

  const handleSubmit = async (e) => { /* ...la lógica no cambia... */ };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close-button" onClick={onClose}>&times;</button>
        <h2 className="modal-title">{course ? 'Editar Curso' : 'Crear Nuevo Curso'}</h2>
        
        <form onSubmit={handleSubmit} className="modal-form">
          <input name="name" value={formData.name} onChange={handleChange} placeholder="Nombre del Curso" required />
          <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Descripción" rows="4" />
          <input name="imageUrl" value={formData.imageUrl} onChange={handleChange} placeholder="URL de la Imagen" />
          
          <select name="teacherId" value={formData.teacherId} onChange={handleChange} required>
            <option value="">Seleccionar Profesor</option>
            {teachers.map(t => <option key={t._id} value={t._id}>{t.firstName} {t.lastName}</option>)}
          </select>
          
          <input name="scheduleText" value={formData.scheduleText} onChange={handleChange} placeholder="Horario (ej: Lunes y Miércoles 18hs)" />
          <input name="price" type="number" value={formData.price} onChange={handleChange} placeholder="Precio" />
          
          <label className="modal-form-label">
            <input name="isActive" type="checkbox" checked={formData.isActive} onChange={handleChange} />
            Curso Activo (visible en la página pública)
          </label>
          
          <button type="submit" className="modal-form-submit">
            {course ? 'Guardar Cambios' : 'Crear Curso'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CourseFormModal;