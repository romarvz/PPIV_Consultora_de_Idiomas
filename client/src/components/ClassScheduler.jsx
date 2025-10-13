// /client/src/components/ClassScheduler.jsx (o donde lo tengas)

import React from 'react';

const ClassScheduler = () => {
  return (
    <div className="form-wrapper">
      <h2> Programador de Clases</h2>
      
      <form className="form-container">
        {/* Nombre del curso */}
        <div className="form-group">
          <label htmlFor="course-name" className="form-label">Nombre del curso</label>
          <input
            type="text"
            id="course-name"
            className="form-input"
            placeholder="Ej: Inglés Conversacional"
          />
        </div> 

        {/* Profesor */}
        <div className="form-group">
          <label htmlFor="teacher-name" className="form-label">Profesor</label>
          <input
            type="text"
            id="teacher-name"
            className="form-input"
            placeholder="Ej: Carlos Rodríguez"
          />
        </div>

        
        <div className="form-group">
          <label htmlFor="class-datetime" className="form-label">Fecha y Hora</label>
          <input 
            type="datetime-local" 
            id="class-datetime" 
            className="form-input" 
          />
        </div>
        
        <button type="submit" className="cta-btn">
          Programar Clase
        </button>
      </form>
    </div>
  );
};

export default ClassScheduler;