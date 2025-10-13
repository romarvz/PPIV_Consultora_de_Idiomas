import React, { useState, useEffect, useCallback } from 'react';
import apiAdapter from '../../services/apiAdapter';
import CourseFormModal from '../../components/courses/CourseFormModal';

const CourseManagementPage = () => {
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);

  // Función para obtener los cursos de la API (mock)
  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true);
      // Pedimos TODOS los cursos (activos e inactivos) para la gestión
      const response = await apiAdapter.courses.getAll();
      if (response.data.success) {
        setCourses(response.data.data.courses);
      }
    } catch (error) {
      console.error("Error al cargar cursos:", error);
      alert('Hubo un error al cargar los cursos.');
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Función para obtener los profesores (necesario para el formulario del modal)
  const fetchTeachers = async () => {
    // En una app real, esto sería apiAdapter.teachers.getAll()
    try {
      const { mockTeachers } = await import('../../services/mockData');
      setTeachers(mockTeachers);
    } catch (error) {
      console.error("Error al cargar profesores:", error);
    }
  };

  useEffect(() => {
    fetchCourses();
    fetchTeachers();
  }, [fetchCourses]);

  const handleOpenModal = (course = null) => {
    setEditingCourse(course);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingCourse(null);
    setIsModalOpen(false);
  };

  const handleSave = () => {
    handleCloseModal();
    fetchCourses(); // Volvemos a cargar los cursos para ver los cambios
  };

  const handleDelete = async (courseId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este curso? Esta acción no se puede deshacer.')) {
      try {
        await apiAdapter.courses.delete(courseId);
        fetchCourses(); // Recargar lista después de eliminar
      } catch (error) {
        alert('Error al eliminar el curso.');
      }
    }
  };

  if (loading) return <p style={{textAlign: 'center', padding: '2rem'}}>Cargando gestión de cursos...</p>;

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Gestión de Catálogo de Cursos</h1>
        <button className="cta-btn" onClick={() => handleOpenModal()}>
          + Crear Nuevo Curso
        </button>
      </div>
      
      {/* Tabla de Cursos */}
      <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: '8px', overflow: 'hidden' }}>
        <thead>
          <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
            <th style={{ padding: '1rem', textAlign: 'left' }}>Nombre del Curso</th>
            <th style={{ padding: '1rem', textAlign: 'left' }}>Nivel</th>
            <th style={{ padding: '1rem', textAlign: 'left' }}>Estado</th>
            <th style={{ padding: '1rem', textAlign: 'center' }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {courses.map(course => (
            <tr key={course._id} style={{ borderBottom: '1px solid #dee2e6' }}>
              <td style={{ padding: '1rem' }}>{course.name}</td>
              <td style={{ padding: '1rem' }}>{course.level}</td>
              <td style={{ padding: '1rem' }}>
                <span style={{
                  padding: '0.25rem 0.5rem',
                  borderRadius: '12px',
                  color: 'white',
                  background: course.isActive ? 'var(--success-color)' : '#6c757d'
                }}>
                  {course.isActive ? 'Activo' : 'Inactivo'}
                </span>
              </td>
              <td style={{ padding: '1rem', display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                <button className="cta-btn" style={{padding: '0.5rem 1rem'}} onClick={() => handleOpenModal(course)}>Editar</button>
                <button className="cta-btn" style={{padding: '0.5rem 1rem', background: 'var(--danger-color)'}} onClick={() => handleDelete(course._id)}>Eliminar</button>
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