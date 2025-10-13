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
    // Corregimos la inicialización para que el placeholder aparezca
    price: course ? (course.price || '') : '', 
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
        // Aseguramos que el precio sea string vacío si es 0, para el placeholder
        price: course.price !== undefined && course.price !== null ? (course.price.toString() === '0' ? '' : course.price.toString()) : '',
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
      // Convertimos a número solo si hay un valor, si es '' se convierte a 0 (OK para el backend)
      const dataToSave = { ...formData, price: Number(formData.price || 0) };
      
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
      {/* ⬅️ Aplicamos la clase para control de altura/scroll aquí */}
      <div className="modal-content course-form-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close-button" onClick={onClose}>&times;</button>
        <h2 className="modal-title">{course ? 'Editar Curso' : 'Crear Nuevo Curso'}</h2>
        
        <form onSubmit={handleSubmit} className="modal-form">
          {/* Añadimos form-input para asegurar el estilo consistente */}
          <input name="name" value={formData.name} onChange={handleChange} placeholder="Nombre del Curso" required className="form-input" />
          
          {/* --- CAMPO: Tipo de Curso --- */}
          <select name="type" value={formData.type} onChange={handleChange} className="form-input" required>
            <option value="">Seleccionar Tipo de Curso</option>
            {courseTypes.map(type => <option key={type} value={type}>{type}</option>)}
          </select>

          {/* --- CAMPO: Modalidad (Usamos clases CSS) --- */}
          <fieldset className="form-radio-fieldset">
            <legend className="form-radio-legend">Modalidad</legend>
            <div className="form-radio-options">
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
          <div className="form-group-inline"> {/* Wrapper para el precio y moneda si fuera necesario, aunque el input es standalone */}
            <input name="price" type="number" value={formData.price} onChange={handleChange} placeholder="Precio" className="form-input" />
          </div>
          
          <label className="modal-form-label checkbox-label"> {/* Clase extra para el checkbox */}
            <input name="isActive" type="checkbox" checked={formData.isActive} onChange={handleChange} />
            Curso Activo (visible en la página pública)
          </label>
          
          <button type="submit" className="cta-btn modal-form-submit">
            {course ? 'Guardar Cambios' : 'Crear Curso'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CourseFormModal;