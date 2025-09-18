import React, { useState, useEffect } from 'react';

const mockTeachers = [
  {
    id: 1,
    nombre: 'Ana',
    apellido: 'García',
    email: 'ana.garcia@academia.com',
    telefono: '1234567890',
    especialidad: 'ingles-basico',
    tarifaHora: 25.00,
    cursosActivos: 3
  },
  {
    id: 2,
    nombre: 'Carlos',
    apellido: 'Martínez',
    email: 'carlos.martinez@academia.com',
    telefono: '0987654321',
    especialidad: 'ingles-avanzado',
    tarifaHora: 35.00,
    cursosActivos: 2
  }
];

const TeacherList = ({ onEditTeacher }) => {
  const [teachers, setTeachers] = useState([]);

  useEffect(() => {
    setTeachers(mockTeachers);
  }, []);

  const getSpecialtyLabel = (specialty) => {
    const labels = {
      'ingles-basico': 'Inglés Básico',
      'ingles-intermedio': 'Inglés Intermedio',
      'ingles-avanzado': 'Inglés Avanzado',
      'ingles-corporativo': 'Inglés Corporativo'
    };
    return labels[specialty] || specialty;
  };

  return (
    <div className="teachers-grid">
      {teachers.map(teacher => (
        <div key={teacher.id} className="teacher-card">
          <div className="teacher-header">
            <div className="teacher-avatar">
              {teacher.nombre[0]}{teacher.apellido[0]}
            </div>
            <div className="teacher-info">
              <h3>{teacher.nombre} {teacher.apellido}</h3>
              <p>{getSpecialtyLabel(teacher.especialidad)}</p>
            </div>
          </div>
          
          <div className="teacher-details">
            <div className="detail-item">
              <span>📧</span>
              <span>{teacher.email}</span>
            </div>
            <div className="detail-item">
              <span>📱</span>
              <span>{teacher.telefono}</span>
            </div>
            <div className="detail-item">
              <span>💰</span>
              <span>${teacher.tarifaHora}/hora</span>
            </div>
            <div className="detail-item">
              <span>📚</span>
              <span>{teacher.cursosActivos} cursos activos</span>
            </div>
          </div>
          
          <div className="teacher-actions">
            <button 
              className="btn btn-primary btn-sm"
              onClick={() => onEditTeacher(teacher)}
            >
              Editar
            </button>
            <button className="btn btn-secondary btn-sm">
              Disponibilidad
            </button>
            <button className="btn btn-success btn-sm">
              Liquidación
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TeacherList;