// /client/src/components/courses/CourseFormModal.jsx

import React, { useState, useEffect } from 'react';
import apiAdapter from '../../services/apiAdapter';

const CourseFormModal = ({ course, onClose, onSave, teachers }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    language: 'Inglés',
    level: 'A1',
    type: 'Curso Grupal', // Valor por defecto
    modality: 'Online', // Valor por defecto
    teacherId: '',
    scheduleText: '',
    price: 0,
    currency: 'ARS',
    isActive: true,
    imageUrl: ''
  });

  // Opciones para el desplegable de tipo de curso
  const courseTypes = [
    'Clase Individual', 
    'Curso Grupal', 
    'Curso Corporativo', 
    'Preparación para Certificación', 
    'Inmersión Cultural'
  ];

  useEffect(() => {
    if (course) {
      setFormData({
        name: course.name || '',
        description: course.description || '',
        language: course.language || 'Inglés',
        level: course.level || 'A1',
        type: course.type || 'Curso Grupal',
        modality: course.modality || 'Online',
        teacherId: course.teacherId || '',
        scheduleText: course.scheduleText || '',
        price: course.price || 0,
        currency: course.currency || 'ARS',
        isActive: course.isActive !== undefined ? course.isActive : true,
        imageUrl: course.imageUrl || ''
      });
    }
  }, [course]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let response;
      const dataToSave = { ...formData, price: Number(formData.price) };
      
      if (course) {
        response = await apiAdapter.courses.update(course._id, dataToSave);
      } else {
        response = await apiAdapter.courses.create(dataToSave);
      }
      
      if (response.data.success) {
        onSave();
      } else {
        alert('Error al guardar el curso');
      }
    } catch (error) {
      console.error("Error:", error);
      alert(`Error: ${error.message}`);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close-button" onClick={onClose}>&times;</button>
        <h2 className="modal-title">{course ? 'Editar Curso' : 'Crear Nuevo Curso'}</h2>
        
        <form onSubmit={handleSubmit} className="modal-form">
          <input name="name" value={formData.name} onChange={handleChange} placeholder="Nombre del Curso" required />
          
          {/* --- CAMPO: Tipo de Curso --- */}
          <select name="type" value={formData.type} onChange={handleChange} className="form-input" required>
            <option value="">Seleccionar Tipo de Curso</option>
            {courseTypes.map(type => <option key={type} value={type}>{type}</option>)}
          </select>

          {/* --- CAMPO: Modalidad --- */}
          <fieldset style={{ border: '1px solid #ddd', padding: '0.5rem', borderRadius: '4px' }}>
            <legend style={{ padding: '0 0.5rem' }}>Modalidad</legend>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <label className="modal-form-label">
                <input type="radio" name="modality" value="Online" checked={formData.modality === 'Online'} onChange={handleChange} />
                Online
              </label>
              <label className="modal-form-label">
                <input type="radio" name="modality" value="Presencial" checked={formData.modality === 'Presencial'} onChange={handleChange} />
                Presencial
              </label>
            </div>
          </fieldset>

          <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Descripción" rows="3" className="form-input" />
          <input name="imageUrl" value={formData.imageUrl} onChange={handleChange} placeholder="URL de la Imagen" className="form-input" />
          
          <select name="teacherId" value={formData.teacherId} onChange={handleChange} className="form-input" required>
            <option value="">Seleccionar Profesor</option>
            {teachers.map(t => <option key={t._id} value={t._id}>{t.firstName} {t.lastName}</option>)}
          </select>
          
          <input name="scheduleText" value={formData.scheduleText} onChange={handleChange} placeholder="Horario (ej: Lunes y Miércoles 18hs)" className="form-input" />
          <input name="price" type="number" value={formData.price} onChange={handleChange} placeholder="Precio" className="form-input" />
          
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