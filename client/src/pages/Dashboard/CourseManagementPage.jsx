// /client/src/pages/Dashboard/CourseManagementPage.jsx

import React, { useState, useEffect } from 'react';
import apiAdapter from '../../services/apiAdapter';
import CourseFormModal from '../../components/courses/CourseFormModal';
import { FaCheckCircle } from 'react-icons/fa';

const CourseManagementPage = () => {
  // Component logic
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [coursesResponse, teachersData] = await Promise.all([
          apiAdapter.courses.getAll(),
          import('../../services/mockData').then(module => module.mockTeachers)
        ]);
        if (coursesResponse.data.success) {
          setCourses(coursesResponse.data.data.courses);
        }
        setTeachers(teachersData);
      } catch (error) {
        console.error("Hubo un error al cargar los datos:", error);
        alert('No se pudieron cargar los datos para la gestión de cursos.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleOpenModal = (course = null) => { setEditingCourse(course); setIsModalOpen(true); };
  const handleCloseModal = () => { setEditingCourse(null); setIsModalOpen(false); };
  const handleSave = () => { handleCloseModal(); window.location.reload(); };
  const handleDelete = async (courseId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este curso?')) {
      try {
        await apiAdapter.courses.delete(courseId);
        setCourses(prevCourses => prevCourses.filter(c => c._id !== courseId));
      } catch (error) { alert('Error al eliminar el curso.'); }
    }
  };

  if (loading) {
    return <p className="loading-message" style={{ textAlign: 'center', padding: '2rem' }}>Cargando gestión de cursos...</p>;
  }

  // Component JSX with modified table
  return (
    <div className="course-management-page">
      <div className="course-management-page__header">
        <h1>Gestión de Catálogo de Cursos</h1>
        <button className="cta-btn" onClick={() => handleOpenModal()}>
          + Crear Nuevo Curso
        </button>
      </div>
      
      <table className="course-management-page__table">
        <thead>
          <tr>
            <th>Nombre del Curso</th>
            <th>Tipo</th>      {/* 1. CAMBIO DE ENCABEZADO */}
            <th>Modalidad</th> {/* 2. CAMBIO DE ENCABEZADO */}
            <th>Estado</th>
            <th className="cell--center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {courses.map(course => (
            <tr key={course._id}>
              <td>{course.name}</td>
              <td>{course.type}</td>          {/* 3. MUESTRA EL TEXTO COMPLETO DEL TIPO */}
              <td>{course.modality}</td>    {/* 4. MUESTRA EL TEXTO COMPLETO DE LA MODALIDAD */}
              <td>
                <span className={`status-badge ${course.isActive ? 'status-badge--active' : 'status-badge--inactive'}`}>
                  {course.isActive ? 'Activo' : 'Inactivo'}
                </span>
              </td>
              <td className="actions-cell">
                <button className="cta-btn action-btn" onClick={() => handleOpenModal(course)}>Editar</button>
                <button className="cta-btn action-btn action-btn--delete" onClick={() => handleDelete(course._id)}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {isModalOpen && (
        <CourseFormModal
          course={editingCourse}
          onClose={handleCloseModal}
          onSave={handleSave}
          teachers={teachers}
        />
      )}
    </div>
  );
};

export default CourseManagementPage;