// /client/src/pages/CoursesPage.jsx

import React, { useState, useEffect } from 'react';
import apiAdapter from '../services/apiAdapter';
import CourseCard from '../components/courses/CourseCard';
import CourseDetailModal from '../components/courses/CourseDetailModal';

// Función para convertir un título en un ID para el link (ej: "Curso Grupal" -> "curso-grupal")
const slugify = (text) => text.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

const CoursesPage = () => {
  const [groupedCourses, setGroupedCourses] = useState({});
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const coursesResponse = await apiAdapter.courses.getAll({ activeOnly: true });
        const { mockTeachers } = await import('../services/mockData');

        if (coursesResponse.data.success) {
          // Agrupamos los cursos por su 'tipo'
          const groups = coursesResponse.data.data.courses.reduce((acc, course) => {
            const type = course.type || 'Otros';
            if (!acc[type]) {
              acc[type] = [];
            }
            acc[type].push(course);
            return acc;
          }, {});

          setGroupedCourses(groups);
          setTeachers(mockTeachers);
        }
      } catch (error) {
        console.error("Error al cargar los cursos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSelectCourse = (course) => setSelectedCourse(course);
  const handleCloseModal = () => setSelectedCourse(null);
  const selectedTeacher = teachers.find(t => t._id === selectedCourse?.teacherId);

  if (loading) return <div style={{ textAlign: 'center', padding: '4rem' }}><h2>Cargando nuestra oferta...</h2></div>;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '3rem' }}>Nuestra Oferta Académica</h1>
      
      {Object.entries(groupedCourses).map(([type, courses]) => (
        <section key={type} id={slugify(type)} style={{ marginBottom: '4rem' }}>
          <h2 style={{ borderBottom: '2px solid var(--primary-color)', paddingBottom: '0.5rem', marginBottom: '2rem' }}>
            {type}
          </h2>
          <div className="dashboard-grid"> {/* Reutilizamos la clase de la grilla del dashboard */}
            {courses.map(course => (
              <CourseCard 
                key={course._id} 
                course={course} 
                onSelectCourse={handleSelectCourse} 
              />
            ))}
          </div>
        </section>
      ))}

      <CourseDetailModal 
        course={selectedCourse} 
        teacher={selectedTeacher}
        onClose={handleCloseModal} 
      />
    </div>
  );
};

export default CoursesPage;