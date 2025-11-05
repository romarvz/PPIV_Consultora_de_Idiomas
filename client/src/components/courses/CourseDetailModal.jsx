// /client/src/components/courses/CourseDetailModal.jsx

import React from 'react';
import { useNavigate } from 'react-router-dom';

// NOTA: Asumo que 'teacher' se pasa como un objeto poblado
const CourseDetailModal = ({ course, onClose, teacher }) => {
  const navigate = useNavigate();

  if (!course) return null;

  const handleInscribeClick = () => {
    onClose(); // Cerramos el modal
    // Navegar a la ruta raíz con el ancla #contacto
    navigate('/#contacto');
  };

  // --- Lógica de datos corregida ---
  
  // 1. Mostrar el texto del horario desde el objeto 'horario' poblado
  const scheduleDisplay = course.horario 
    ? course.horario.display 
    : (course.scheduleText || 'Horario a confirmar'); // Fallback por si acaso

  // 2. Usar 'costoTotal' (virtual del backend) o 'tarifa' en lugar de 'price'
  // El backend calcula costoTotal = duracionTotal * tarifa
  const priceDisplay = course.costoTotal 
    ? course.costoTotal.toLocaleString('es-AR') 
    : course.tarifa.toLocaleString('es-AR');
    
  const currencyDisplay = course.costoTotal ? 'ARS (Total)' : 'ARS (por hora)';
  
  // --- Fin lógica corregida ---

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close-button" onClick={onClose}>&times;</button>
        <h2 className="modal-title">{course.name}</h2>
        <p className="modal-description">{course.description}</p>
        
        <div className="modal-details">
          <p><strong>Profesor:</strong> {teacher ? `${teacher.firstName} ${teacher.lastName}` : 'A confirmar'}</p>
          
          {/* --- CAMBIO AQUÍ --- */}
          <p><strong>Horarios:</strong> {scheduleDisplay}</p>
          
          {/* --- CAMBIO AQUÍ --- */}
          <p><strong>Valor:</strong> ${priceDisplay} {currencyDisplay}</p>
          
          {/* Otros detalles que podrías querer agregar desde tu modelo */}
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