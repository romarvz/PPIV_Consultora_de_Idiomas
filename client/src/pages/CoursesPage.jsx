// /client/src/pages/CoursesPage.jsx

import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import apiAdapter from '../services/apiAdapter';
import CourseCard from '../components/courses/CourseCard';
import CourseDetailModal from '../components/courses/CourseDetailModal';

// (slugify)
const slugify = (text) => text.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

const CoursesPage = () => {
  const [groupedCourses, setGroupedCourses] = useState({});
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(null);
  
  const location = useLocation(); 

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
   // Llamada a APIs cursos y profesores 
        const [coursesResponse, teachersResponse] = await Promise.all([
          apiAdapter.courses.getAll({ activeOnly: true }),
          apiAdapter.teachers.getAll() // tenemos un adapter para 'teachers'
        ]);

        // Verificación de respuestas exitosas
        if (coursesResponse.data.success && teachersResponse.data.success) {
          
          // Agrupar cursos por 'type' 
          const groups = coursesResponse.data.data.courses.reduce((acc, course) => {
            const type = course.type || 'Otros'; // Usamos el campo 'type' del modelo
            if (!acc[type]) acc[type] = [];
            acc[type].push(course);
            return acc;
          }, {});

          setGroupedCourses(groups);
          setTeachers(teachersResponse.data.data); // Profesores de la API
        

        } else {
          // Una de las dos falle
          throw new Error('No se pudieron cargar los cursos o profesores');
        }

      } catch (error) {
        console.error("Error al cargar los datos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []); // Efecto de ejecución única para cargar los datos

  useEffect(() => {
    if (!loading) {
      if (location.hash) {
        // Si hay anchor, scroll a esa sección
        setTimeout(() => {
          const id = location.hash.replace('#', '');
          const element = document.getElementById(id);
          if (element) {
            const headerHeight = 80; 
            const elementPosition = element.offsetTop - headerHeight - 20; 
            window.scrollTo({ top: elementPosition, behavior: 'smooth' });
          }
        }, 100);
      } else {
        // Si no hay anchor ("Ver todos los cursos"), scroll a top
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }, [loading, location.hash]); // Se ejecuta cuando 'loading' o el anchor cambian

  const handleSelectCourse = (course) => setSelectedCourse(course);
  const handleCloseModal = () => setSelectedCourse(null);
  
  const selectedTeacher = selectedCourse 
    ? teachers.find(t => t._id === selectedCourse.profesor) 
    : null;
  // --- FIN DE LA CORRECCIÓN ---

  if (loading) return (
    <div className="courses-page" style={{ textAlign: 'center', padding: '4rem' }}>
      <h2>Cargando nuestra oferta...</h2>
    </div>
  );

  return (
    <div className="courses-page" style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '3rem' }}>Nuestra Oferta Académica</h1>
      
      {Object.entries(groupedCourses)
        .sort(([a], [b]) => {
          // Orden personalizado (campo 'type')
          const order = ['Clase Individual', 'Curso Grupal', 'Curso Corporativo', 'Certificacion', 'Inmersion Cultural', 'Otros'];
          return order.indexOf(a) - order.indexOf(b);
        })
        .map(([type, courses]) => (
        <section key={type} id={slugify(type)} style={{ marginBottom: '4rem' }}>
          <h2 style={{ paddingBottom: '0.5rem', marginBottom: '2rem' }}>
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