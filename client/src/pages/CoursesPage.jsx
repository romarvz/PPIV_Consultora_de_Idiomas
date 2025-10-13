// /client/src/pages/CoursesPage.jsx

import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom'; // 1. Importar useLocation
import apiAdapter from '../services/apiAdapter';
import CourseCard from '../components/courses/CourseCard';
import CourseDetailModal from '../components/courses/CourseDetailModal';

// ... (la función slugify no cambia)
const slugify = (text) => text.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

const CoursesPage = () => {
  const [groupedCourses, setGroupedCourses] = useState({});
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(null);
  
  const location = useLocation(); // 2. Obtener la información de la URL actual

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const coursesResponse = await apiAdapter.courses.getAll({ activeOnly: true });
        const { mockTeachers } = await import('../services/mockData');

        if (coursesResponse.data.success) {
          const groups = coursesResponse.data.data.courses.reduce((acc, course) => {
            const type = course.type || 'Otros';
            if (!acc[type]) acc[type] = [];
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
  }, []); // Este efecto se ejecuta solo una vez para cargar los datos

  useEffect(() => {
    // Si no estamos cargando y hay un ancla en la URL...
    if (!loading && location.hash) {
      // Usamos un pequeño delay para asegurarnos de que el DOM esté 100% listo
      setTimeout(() => {
        const id = location.hash.replace('#', '');
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  }, [loading, location.hash]); // Se ejecuta cuando 'loading' o el ancla cambian

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
          <div className="dashboard-grid">
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