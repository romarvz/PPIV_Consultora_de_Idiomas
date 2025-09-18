import React, { useState, useEffect } from 'react';

const mockCourses = [
  {
    id: 1,
    codigo: 'ENG001',
    nombre: 'Inglés Básico A1',
    modalidad: 'P',
    duracion: 40,
    costo: 1500.00
  },
  {
    id: 2,
    codigo: 'ENG002',
    nombre: 'Inglés Intermedio B1',
    modalidad: 'H',
    duracion: 60,
    costo: 2200.00
  },
  {
    id: 3,
    codigo: 'ENG003',
    nombre: 'Inglés Avanzado C1',
    modalidad: 'D',
    duracion: 80,
    costo: 3000.00
  }
];

const CourseList = ({ onEditCourse }) => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setCourses(mockCourses);
      setLoading(false);
    }, 1000);
  }, []);

  const getModalityLabel = (modalidad) => {
    const labels = {
      'P': 'Presencial',
      'D': 'A Distancia',
      'H': 'Híbrida'
    };
    return labels[modalidad] || modalidad;
  };

  const getModalityBadge = (modalidad) => {
    const badges = {
      'P': 'badge-success',
      'D': 'badge-warning',
      'H': 'badge-info'
    };
    return badges[modalidad] || 'badge-secondary';
  };

  if (loading) {
    return <div className="loading">Cargando cursos...</div>;
  }

  if (courses.length === 0) {
    return (
      <div className="card">
        <div className="no-data">
          <p>No hay cursos registrados.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="courses-grid">
      {courses.map(course => (
        <div key={course.id} className="course-card">
          <div className="course-header">
            <h3>{course.nombre}</h3>
            <span className="course-code">{course.codigo}</span>
          </div>
          
          <div className="course-details">
            <div className="detail-item">
              <span className="detail-label">Modalidad:</span>
              <span className={`badge ${getModalityBadge(course.modalidad)}`}>
                {getModalityLabel(course.modalidad)}
              </span>
            </div>
            
            <div className="detail-item">
              <span className="detail-label">Duración:</span>
              <span>{course.duracion} horas</span>
            </div>
            
            <div className="detail-item">
              <span className="detail-label">Costo:</span>
              <span className="course-price">${course.costo.toFixed(2)}</span>
            </div>
          </div>
          
          <div className="course-actions">
            <button 
              className="btn btn-primary btn-sm"
              onClick={() => onEditCourse(course)}
            >
              Editar
            </button>
            <button className="btn btn-secondary btn-sm">
              Ver Detalle
            </button>
            <button className="btn btn-success btn-sm">
              Programar Clase
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CourseList;