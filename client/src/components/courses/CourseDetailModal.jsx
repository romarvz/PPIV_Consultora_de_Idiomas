// /client/src/components/courses/CourseDetailModal.jsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/courseModals.css';

const CourseDetailModal = ({ course, onClose, teacher }) => {
  const navigate = useNavigate();

  if (!course) return null;

  const imageSrc =
    course.imageUrl ||
    course.coverImage ||
    (course.images && course.images[0]) ||
    '/images/Logo.png';

  const handleInscribeClick = () => {
    onClose(); // Cerramos el modal

    // Navegar a la ruta raíz con el ancla #contacto
    navigate('/#contacto', { replace: false });
  };

  // --- Lógica de datos  ---
  
  // 1. Mostrar el texto del horario
  const scheduleDisplay = course.horario 
    ? course.horario.display // Si horario está poblado
    : (course.scheduleText || 'Horario a confirmar'); // Fallback

  // 2. Calcular precio disponible
  const rawPrice = Number.isFinite(course.costoTotal)
    ? course.costoTotal
    : Number.isFinite(course.price)
    ? course.price
    : Number.isFinite(course.tarifa)
    ? course.tarifa
    : null;

  const priceDisplay = Number.isFinite(rawPrice)
    ? rawPrice.toLocaleString('es-AR')
    : null;

  const currencyDisplay = Number.isFinite(course.costoTotal) ? 'ARS (Total)' : 'ARS';

  const teacherName = (() => {
    if (teacher && (teacher.firstName || teacher.lastName)) {
      return `${teacher.firstName || ''} ${teacher.lastName || ''}`.trim();
    }
    if (teacher && teacher.name) {
      return teacher.name;
    }
    if (typeof course.teacher === 'string' && course.teacher) {
      return course.teacher;
    }
    if (course.profesor && typeof course.profesor === 'object') {
      const { firstName, lastName } = course.profesor;
      if (firstName || lastName) {
        return `${firstName || ''} ${lastName || ''}`.trim();
      }
    }
    return 'A confirmar';
  })();
  
  // --- Fin lógica ---

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close-button" onClick={onClose}>&times;</button>
        <h2 className="modal-title">{course.name}</h2>
        <p className="modal-description">{course.description}</p>
        
        <div className="modal-image-wrapper">
          <img
            src={imageSrc}
            alt={course.name || 'Curso'}
            className="modal-course-image"
            onError={(event) => {
              if (!event.target.dataset.fallbackApplied) {
                event.target.dataset.fallbackApplied = 'true';
                event.target.src = '/images/Logo.png';
              }
            }}
            loading="lazy"
          />
        </div>

        <div className="modal-details">
          {/* El 'teacher' que se recibió como prop */}
          <p><strong>Profesor:</strong> {teacherName}</p>
          
          <p><strong>Horarios:</strong> {scheduleDisplay}</p>
          {priceDisplay && (
            <p><strong>Valor:</strong> ${priceDisplay} {currencyDisplay}</p>
          )}
          
          {/* Otros detalles del modelo */}
          <p><strong>Nivel:</strong> {course.nivel || course.level}</p>
          {course.duracionTotal && (
            <p><strong>Duración:</strong> {course.duracionTotal} horas</p>
          )}

        </div>
        
        <button className="modal-cta-button" onClick={handleInscribeClick}>
          ¡Quiero Inscribirme!
        </button>
      </div>
    </div>
  );
};

export default CourseDetailModal;