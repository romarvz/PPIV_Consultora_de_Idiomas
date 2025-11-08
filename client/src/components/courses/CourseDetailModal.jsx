import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/courseModals.css';


const CourseDetailModal = ({ course, onClose, teacher }) => {
  const navigate = useNavigate();

  if (!course) return null;

  const handleInscribeClick = () => {
    onClose(); // Cerramos el modal
    // Navegar a la ruta raíz con el ancla #contacto
    navigate('/#contacto');
  };
  return (

    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close-button" onClick={onClose}>&times;</button>
        <h2 className="modal-title">{course.name}</h2>
        <p className="modal-description">{course.description}</p>
       
        <div className="modal-details">
          <p><strong>Profesor:</strong> {teacher ? `${teacher.firstName} ${teacher.lastName}` : 'A confirmar'}</p>
          <p><strong>Horarios:</strong> {course.scheduleText}</p>
          <p><strong>Valor:</strong> ${course.price.toLocaleString('es-AR')} {course.currency}</p>
        </div>
       
        <button className="modal-cta-button" onClick={handleInscribeClick}>
          ¡Quiero Inscribirme!
        </button>
      </div>
    </div>
  );

};



export default CourseDetailModal;