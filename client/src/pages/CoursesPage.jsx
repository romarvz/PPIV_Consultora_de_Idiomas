// /client/src/pages/CoursesPage.jsx

import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import apiAdapter from '../services/apiAdapter';
import CourseCard from '../components/courses/CourseCard';
import CourseDetailModal from '../components/courses/CourseDetailModal';

// (slugify)
const slugify = (text) => text.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

const idiomaLabels = {
  ingles: 'Inglés',
  frances: 'Francés',
  aleman: 'Alemán',
  italiano: 'Italiano',
  portugues: 'Portugués',
  chino: 'Chino',
  japones: 'Japonés',
  coreano: 'Coreano'
};

const capitalize = (value) =>
  typeof value === 'string' && value.length > 0
    ? value.charAt(0).toUpperCase() + value.slice(1)
    : value;

const normalizeCourse = (course) => {
  if (!course) return null;

  const id = course._id || course.id;
  const name = course.name || course.nombre || 'Curso sin título';
  const description =
    course.description || course.descripcion || 'Pronto tendremos más información.';
  const language =
    course.language ||
    idiomaLabels[course.idioma] ||
    capitalize(course.idioma) ||
    'Idioma';
  const modality =
    course.modality ||
    (course.modalidad ? capitalize(course.modalidad) : '') ||
    '';
  const level = course.level || course.nivel || 'Todos los niveles';
  const type = course.type || 'Otros';
  const price =
    typeof course.price === 'number'
      ? course.price
      : typeof course.tarifa === 'number'
      ? course.tarifa
      : null;
  const imageUrl = course.imageUrl || course.coverImage || '/images/Logo.png';
  const teacher = course.teacher || course.profesor || null;
  const status = course.status || course.estado || 'planificado';

  return {
    ...course,
    id,
    _id: id,
    name,
    description,
    language,
    modality,
    level,
    type,
    price,
    imageUrl,
    teacher,
    status
  };
};

const CoursesPage = () => {
  const [groupedCourses, setGroupedCourses] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [error, setError] = useState(null);

  const location = useLocation(); 

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const coursesResponse = await apiAdapter.courses.getPublic({
          activeOnly: false,
          page: 1,
          limit: 100
        });

        if (!coursesResponse.data?.success) {
          throw new Error('No se pudieron cargar los cursos disponibles');
        }

        const payload = Array.isArray(coursesResponse.data?.data?.courses)
          ? coursesResponse.data.data.courses
          : Array.isArray(coursesResponse.data?.data)
          ? coursesResponse.data.data
          : [];

        const normalizedCourses = payload
          .map(normalizeCourse)
          .filter(Boolean);

        const groups = normalizedCourses.reduce((acc, course) => {
          const type = course.type || 'Otros';
          if (!acc[type]) acc[type] = [];
          acc[type].push(course);
          return acc;
        }, {});

        setGroupedCourses(groups);
      } catch (error) {
        console.error("Error al cargar los datos:", error);
        setError(error.message || 'No se pudieron cargar los cursos');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []); // Efecto de ejecución única para cargar los datos

  // COMENTADO: useEffect para igualar alturas con JavaScript (DESACTIVADO - usando CSS con min-height)
  // useEffect(() => {
  //   if (loading || Object.keys(groupedCourses).length === 0) return;
  //   const equalizeCardHeights = () => {
  //     const courseCards = document.querySelectorAll('.dashboard-grid .course-card');
  //     if (courseCards.length === 0) return;
  //     courseCards.forEach(card => { card.style.height = 'auto'; });
  //     let maxHeight = 0;
  //     courseCards.forEach(card => {
  //       const height = card.offsetHeight;
  //       if (height > maxHeight) { maxHeight = height; }
  //     });
  //     if (maxHeight > 0) {
  //       courseCards.forEach(card => { card.style.height = `${maxHeight}px`; });
  //     }
  //   };
  //   const timeoutId = setTimeout(() => { equalizeCardHeights(); }, 200);
  //   window.addEventListener('resize', equalizeCardHeights);
  //   return () => {
  //     clearTimeout(timeoutId);
  //     window.removeEventListener('resize', equalizeCardHeights);
  //   };
  // }, [loading, groupedCourses]);

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
  
  const selectedTeacher = (() => {
    if (!selectedCourse) return null;
    if (selectedCourse.teacher && typeof selectedCourse.teacher === 'object') {
      return selectedCourse.teacher;
    }
    if (selectedCourse.profesor && typeof selectedCourse.profesor === 'object') {
      return selectedCourse.profesor;
    }
    return null;
  })();

  if (loading) return (
    <div className="courses-page" style={{ textAlign: 'center', padding: '4rem' }}>
      <h2>Cargando nuestra oferta...</h2>
    </div>
  );

  if (error) {
    return (
      <div className="courses-page" style={{ textAlign: 'center', padding: '4rem' }}>
        <h2>Lo sentimos</h2>
        <p>{error}</p>
      </div>
    );
  }

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