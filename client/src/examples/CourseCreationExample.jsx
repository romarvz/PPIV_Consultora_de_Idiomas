/**
 * Ejemplo de uso de la nueva funcionalidad de horarios disponibles
 * 
 * Este archivo muestra cómo usar el nuevo método en componentes React
 */

// EJEMPLO DE USO EN UN COMPONENTE REACT

import React, { useState, useEffect } from 'react';
import apiAdapter from '../services/apiAdapter';

const CourseCreationForm = () => {
  const [teachers, setTeachers] = useState([]);
  const [selectedTeacherId, setSelectedTeacherId] = useState('');
  const [availableSchedules, setAvailableSchedules] = useState([]);
  const [loading, setLoading] = useState(false);

  // Cargar profesores al montar el componente
  useEffect(() => {
    loadTeachers();
  }, []);

  const loadTeachers = async () => {
    try {
      const response = await apiAdapter.teachers.getAll();
      setTeachers(response.data.data.teachers || []);
    } catch (error) {
      console.error('Error cargando profesores:', error);
    }
  };

  // Cargar horarios disponibles cuando se selecciona un profesor
  const handleTeacherChange = async (teacherId) => {
    setSelectedTeacherId(teacherId);
    
    if (!teacherId) {
      setAvailableSchedules([]);
      return;
    }

    setLoading(true);
    try {
      // 🚀 USAR EL NUEVO MÉTODO
      const response = await apiAdapter.courses.getAvailableSchedulesByTeacher(teacherId);
      
      // La respuesta viene en formato: { data: { success: true, data: { horarios: [...], count: N } } }
      const schedules = response.data.data.horarios || [];
      setAvailableSchedules(schedules);
      
      console.log('Horarios disponibles:', schedules);
      console.log('Total disponibles:', schedules.length);
      
    } catch (error) {
      console.error('Error obteniendo horarios disponibles:', error);
      setAvailableSchedules([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="course-creation-form">
      <h2>Crear Nuevo Curso</h2>
      
      {/* Selector de profesor */}
      <div className="form-group">
        <label htmlFor="teacher-select">Profesor:</label>
        <select
          id="teacher-select"
          value={selectedTeacherId}
          onChange={(e) => handleTeacherChange(e.target.value)}
        >
          <option value="">Seleccionar profesor...</option>
          {teachers.map(teacher => (
            <option key={teacher._id} value={teacher._id}>
              {teacher.firstName} {teacher.lastName}
            </option>
          ))}
        </select>
      </div>

      {/* Selector de horario disponible */}
      {selectedTeacherId && (
        <div className="form-group">
          <label htmlFor="schedule-select">Horario:</label>
          {loading ? (
            <p>Cargando horarios disponibles...</p>
          ) : (
            <select id="schedule-select">
              <option value="">Seleccionar horario...</option>
              {availableSchedules.map(schedule => (
                <option key={schedule._id} value={schedule._id}>
                  {schedule.display} {/* ej: "Lunes 09:00 - 11:00" */}
                </option>
              ))}
            </select>
          )}
          
          {!loading && availableSchedules.length === 0 && selectedTeacherId && (
            <p className="no-schedules">
              Este profesor no tiene horarios disponibles.
            </p>
          )}
        </div>
      )}

      {/* Mostrar detalles de horarios para debugging */}
      {availableSchedules.length > 0 && (
        <div className="schedules-debug">
          <h4>Horarios Disponibles ({availableSchedules.length}):</h4>
          <ul>
            {availableSchedules.map(schedule => (
              <li key={schedule._id}>
                <strong>{schedule.display}</strong>
                <br />
                <small>
                  ID: {schedule._id} | 
                  Día: {schedule.dia} | 
                  {schedule.horaInicio} - {schedule.horaFin}
                </small>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default CourseCreationForm;

// ===============================================
// EJEMPLO DE LLAMADA DIRECTA (para testing)
// ===============================================

/*
// En consola del navegador o en un useEffect:

import apiAdapter from './services/apiAdapter';

// Probar con ID de profesor mock
const testSchedules = async () => {
  try {
    // Usar ID de profesor de mockData
    const profesorId = 'teacher-001'; // ID del primer profesor mock
    
    const response = await apiAdapter.courses.getAvailableSchedulesByTeacher(profesorId);
    
    console.log('✅ Respuesta completa:', response);
    console.log('✅ Horarios:', response.data.data.horarios);
    console.log('✅ Cantidad:', response.data.data.count);
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
};

testSchedules();
*/

// ===============================================
// FORMATO DE RESPUESTA ESPERADO
// ===============================================

/*
{
  data: {
    success: true,
    data: {
      horarios: [
        {
          _id: "mock-horario-teacher-001-0",
          dia: "lunes",
          horaInicio: "09:00",
          horaFin: "11:00", 
          tipo: "clase",
          display: "Lunes 09:00 - 11:00"
        },
        {
          _id: "mock-horario-teacher-001-1", 
          dia: "martes",
          horaInicio: "14:00",
          horaFin: "16:00",
          tipo: "clase", 
          display: "Martes 14:00 - 16:00"
        }
      ],
      count: 2
    },
    message: "Horarios disponibles obtenidos: 2 encontrados"
  }
}
*/