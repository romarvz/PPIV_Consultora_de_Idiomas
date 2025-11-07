// /client/src/components/courses/CourseDetailModal.jsx

import React from 'react';
import { useNavigate } from 'react-router-dom';

const CourseDetailModal = ({ course, onClose, teacher }) => {
  const navigate = useNavigate();

  if (!course) return null;

  const handleInscribeClick = () => {
    onClose(); // Cerramos el modal

    // Navegar a la ruta raíz con el ancla #contacto
    navigate('/#contacto');
  };

  // --- Lógica de datos  ---
  
  // 1. Mostrar el texto del horario
  // 'horario' viene poblado)
  const scheduleDisplay = course.horario 
    ? course.horario.display // Si horario está poblado
    : (course.scheduleText || 'Horario a confirmar'); // Fallback

  // 2. Usar 'costoTotal' (virtual) o 'tarifa'
  const priceDisplay = course.costoTotal 
    ? course.costoTotal.toLocaleString('es-AR') 
    : course.tarifa.toLocaleString('es-AR');
    
  const currencyDisplay = course.costoTotal ? 'ARS (Total)' : 'ARS (por hora)';
  
  // --- Fin lógica ---

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close-button" onClick={onClose}>&times;</button>
        <h2 className="modal-title">{course.name}</h2>
        <p className="modal-description">{course.description}</p>
        
        <div className="modal-details">
          {/* El 'teacher' que se recibió como prop */}
          <p><strong>Profesor:</strong> {teacher ? `${teacher.firstName} ${teacher.lastName}` : 'A confirmar'}</p>
          
          <p><strong>Horarios:</strong> {scheduleDisplay}</p>
          
          <p><strong>Valor:</strong> ${priceDisplay} {currencyDisplay}</p>
          
          {/* Otros detalles del modelo */}
          <p><strong>Nivel:</strong> {course.nivel}</p>
          <p><strong>Duración:</strong> {course.duracionTotal} horas</p>

        </div>
        
        <button className="modal-cta-button" onClick={handleInscribeClick}>
          ¡Quiero Inscribirme!
        </button>
      </div>
    </div>
  );
};

export default CourseDetailModal;