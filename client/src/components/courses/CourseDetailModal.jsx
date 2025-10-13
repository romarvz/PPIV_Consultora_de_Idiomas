// /client/src/components/courses/CourseDetailModal.jsx

import React from 'react';

const CourseDetailModal = ({ course, onClose, teacher }) => {
  if (!course) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close-button" onClick={onClose}>&times;</button>

        <h2 className="modal-title">{course.name}</h2>
        <p className="modal-description">{course.description}</p>
        
        <div className="modal-details">
          <p><strong>Profesor:</strong> {teacher ? `${teacher.firstName} ${teacher.lastName}` : 'A confirmar'}</p>
          <p><strong> Horarios:</strong> {course.scheduleText}</p>
          <p><strong> Valor:</strong> ${course.price.toLocaleString('es-AR')} {course.currency}</p>
        </div>
        
        <button className="modal-cta-button" onClick={() => alert('Redirigiendo a contacto...')}>
          ¡Quiero Inscribirme!
        </button>
      </div>
    </div>
  );
};

export default CourseDetailModal;