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
    <div style={{
      backgroundColor: 'white',
      borderRadius: '12px',
      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
      width: '100%',
      maxWidth: '600px',
      maxHeight: 'calc(100vh - 80px)',
      overflow: 'hidden'
    }}>
      <div style={{
        padding: '1.5rem 1.5rem 0 1.5rem',
        borderBottom: '1px solid #dee2e6',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h3 style={{ margin: '0', color: '#2c3e50', fontSize: '1.25rem', fontWeight: '600' }}>
          {course ? 'Editar Curso' : 'Crear Nuevo Curso'}
        </h3>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '1.5rem',
            color: '#6c757d',
            cursor: 'pointer',
            padding: '0.25rem'
          }}
        >×</button>
      </div>
      
      <div style={{ maxHeight: 'calc(100vh - 160px)', overflowY: 'auto' }}>
        <form onSubmit={handleSubmit} style={{ padding: '0 24px 24px 24px' }}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#495057' }}>Nombre del Curso *</label>
            <input 
              name="name" 
              value={formData.name} 
              onChange={handleChange} 
              placeholder="Nombre del Curso" 
              required 
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '0.9rem'
              }}
            />
          </div>
          
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#495057' }}>Tipo de Curso *</label>
            <select 
              name="type" 
              value={formData.type} 
              onChange={handleChange} 
              required
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '0.9rem',
                height: '48px'
              }}
            >
              <option value="">Seleccionar Tipo de Curso</option>
              {courseTypes.map(type => <option key={type} value={type}>{type}</option>)}
            </select>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#495057' }}>Modalidad *</label>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input type="radio" name="modality" value="Online" checked={formData.modality === 'Online'} onChange={handleChange} />
                Online
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input type="radio" name="modality" value="Presencial" checked={formData.modality === 'Presencial'} onChange={handleChange} />
                Presencial
              </label>
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#495057' }}>Descripción</label>
            <textarea 
              name="description" 
              value={formData.description} 
              onChange={handleChange} 
              placeholder="Descripción del curso" 
              rows="3"
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '0.9rem',
                resize: 'vertical'
              }}
            />
          </div>
          
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#495057' }}>Profesor *</label>
            <select 
              name="teacherId" 
              value={formData.teacherId} 
              onChange={handleChange} 
              required
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '0.9rem',
                height: '48px'
              }}
            >
              <option value="">Seleccionar Profesor</option>
              {teachers.map(t => <option key={t._id} value={t._id}>{t.firstName} {t.lastName}</option>)}
            </select>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#495057' }}>Horario</label>
              <input 
                name="scheduleText" 
                value={formData.scheduleText} 
                onChange={handleChange} 
                placeholder="Ej: Lunes y Miércoles 18hs"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '0.9rem'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#495057' }}>Precio</label>
              <input 
                name="price" 
                type="number" 
                value={formData.price} 
                onChange={handleChange} 
                placeholder="Precio"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '0.9rem'
                }}
              />
            </div>
          </div>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input name="isActive" type="checkbox" checked={formData.isActive} onChange={handleChange} />
              <span style={{ fontWeight: '500', color: '#495057' }}>Curso Activo (visible en la página pública)</span>
            </label>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', paddingTop: '1rem', borderTop: '1px solid #dee2e6' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'linear-gradient(135deg, #95a5a6, #7f8c8d)',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '0.95rem'
              }}
            >
              Cancelar
            </button>
            <button 
              type="submit"
              style={{
                background: 'linear-gradient(135deg, #27ae60, #229954)',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '0.95rem'
              }}
            >
              {course ? 'Guardar Cambios' : 'Crear Curso'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CourseFormModal;