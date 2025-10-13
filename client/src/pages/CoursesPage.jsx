// /client/src/pages/CoursesPage.jsx

import React, { useState, useEffect } from 'react';
import apiAdapter from '../services/apiAdapter';
import CourseCard from '../components/courses/CourseCard';
import CourseDetailModal from '../components/courses/CourseDetailModal';

const CoursesPage = () => {
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]); // Necesitamos los profesores para mostrar sus nombres
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Pedimos solo los cursos activos para la vista pública
        const coursesResponse = await apiAdapter.courses.getAll({ activeOnly: true });
        
        // ¡OJO! Tu mock API no tiene un endpoint para profesores, así que usamos un truco
        // En una app real, harías: const teachersResponse = await apiAdapter.teachers.getAll();
        const { mockTeachers } = await import('../services/mockData');

        if (coursesResponse.data.success) {
          setCourses(coursesResponse.data.data.courses);
          setTeachers(mockTeachers); // Usamos los datos importados directamente
        }
      } catch (error) {
        console.error("Error al cargar los cursos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSelectCourse = (course) => {
    setSelectedCourse(course);
  };

  const handleCloseModal = () => {
    setSelectedCourse(null);
  };

  // Buscar el profesor del curso seleccionado para pasarlo al modal
  const selectedTeacher = teachers.find(t => t._id === selectedCourse?.teacherId);

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '4rem' }}><h2>Cargando cursos...</h2></div>;
  }

  const pageStyle = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '2rem'
  };

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '2rem'
  };

  return (
    <div style={pageStyle}>
      <h1 style={{ textAlign: 'center', marginBottom: '3rem' }}>Nuestra Oferta Académica</h1>
      <div style={gridStyle}>
        {courses.map(course => (
          <CourseCard 
            key={course._id} 
            course={course} 
            onSelectCourse={handleSelectCourse} 
          />
        ))}
      </div>
      <CourseDetailModal 
        course={selectedCourse} 
        teacher={selectedTeacher}
        onClose={handleCloseModal} 
      />
    </div>
  );
};

export default CoursesPage;