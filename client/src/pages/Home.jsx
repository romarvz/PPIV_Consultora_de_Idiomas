import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { routes } from '../utils/routes';
import apiAdapter from '../services/apiAdapter';

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

const slugify = (text) =>
  (text || 'otros')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');

const normalizeCourse = (course) => {
  if (!course) return null;

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
  const price =
    typeof course.price === 'number'
      ? course.price
      : typeof course.tarifa === 'number'
      ? course.tarifa
      : null;
  const type = course.type || 'Otros';

  return {
    id: course._id || course.id || name,
    name,
    description,
    language,
    modality,
    level,
    price,
    type
  };
};

// Home page with all sections for smooth scrolling navigation
const Home = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [courses, setCourses] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [coursesError, setCoursesError] = useState(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setCoursesLoading(true);
        setCoursesError(null);

        const response = await apiAdapter.courses.getPublic({
          activeOnly: true,
          page: 1,
          limit: 6
        });

        if (!response.data?.success) {
          throw new Error('No se pudieron cargar los cursos');
        }

        const payload = Array.isArray(response.data?.data?.courses)
          ? response.data.data.courses
          : Array.isArray(response.data?.data)
          ? response.data.data
          : [];

        const normalized = payload.map(normalizeCourse).filter(Boolean).slice(0, 6);
        setCourses(normalized);
      } catch (error) {
        console.error('Error al cargar cursos públicos:', error);
        setCoursesError('No pudimos cargar los cursos en este momento.');
      } finally {
        setCoursesLoading(false);
      }
    };

    fetchCourses();
  }, []);

  // Set up scroll animations when sections come into view (Tu useEffect original)
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    const sections = document.querySelectorAll('.section');
    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  // NUEVO useEffect para manejar el scroll al ancla (#contacto)
  useEffect(() => {
    // Si hay un ancla en la URL (ej: #contacto)
    if (location.hash) {
      const id = location.hash.substring(1); // Quitamos el '#' para obtener el ID
      const element = document.getElementById(id);
      if (element) {
        // Usamos un pequeño delay para asegurarnos de que el componente ya está en el DOM
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100); // 100ms de delay
      }
    }
  }, [location.hash]); // Se ejecuta cada vez que el ancla de la URL cambia

  return (
    <>
      <section className="hero">
        <div className="container">
          <h1>Aprendé las lenguas del mundo</h1>
          <p>Consultora especializada en enseñanza de idiomas con metodologías innovadoras y profesores certificados</p>
          <button className="cta-btn" onClick={() => document.getElementById('servicios')?.scrollIntoView({ behavior: 'smooth' })}>
            Conocé Nuestros Servicios
          </button>
        </div>
      </section>

      <section id="nosotros" className="section">
        <div className="container">
          <h2 className="section-title">Nosotros</h2>
          <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
            <p style={{ fontSize: '1.1rem', marginBottom: '2rem' }}>
              Somos una consultora de idiomas con más de 20 años de experiencia en la enseñanza de múltiples idiomas. 
              Nuestro equipo está conformado por profesores graduados de las mejores universidades del país que utilizan metodologías modernas 
              para garantizar un aprendizaje efectivo y personalizado.
            </p>
            <p style={{ fontSize: '1.1rem' }}>
              Nos especializamos en cursos de inglés, ofreciendo desde niveles 
              básicos hasta preparación para certificaciones internacionales. La comunicación efectiva es nuestro foco desde el día uno.
            </p>
          </div>
        </div>
      </section>
      
      {/* Services Section */}
      <section id="servicios" className="section">
        <div className="container">
          <h2 className="section-title">Servicios</h2>

          {coursesLoading && (
            <p style={{ textAlign: 'center', margin: '2rem 0' }}>
              Estamos preparando nuestra oferta académica...
            </p>
          )}

          {coursesError && (
            <p style={{ textAlign: 'center', margin: '2rem 0', color: '#e74c3c' }}>
              {coursesError}
            </p>
          )}

          {!coursesLoading && !coursesError && courses.length === 0 && (
            <p style={{ textAlign: 'center', margin: '2rem 0' }}>
              Aún no hay cursos publicados. ¡Vuelve pronto!
            </p>
          )}

          {!coursesLoading && !coursesError && courses.length > 0 && (
            <div className="services-grid">
              {courses.map((course) => (
                <Link
                  key={course.id}
                  to={`/cursos#${slugify(course.type)}`}
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <div className="service-card">
                    <h3>{course.name}</h3>
                    <p>
                      {course.description.length > 160
                        ? `${course.description.slice(0, 157)}...`
                        : course.description}
                    </p>
                    <div
                      style={{
                        display: 'flex',
                        gap: '0.5rem',
                        flexWrap: 'wrap',
                        marginTop: '1rem',
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        color: '#1f76d3'
                      }}
                    >
                      <span>{course.language}</span>
                      <span>{course.level}</span>
                      {course.modality && <span>{course.modality}</span>}
                    </div>
                    {typeof course.price === 'number' && (
                      <p style={{ marginTop: '0.75rem', fontWeight: 600, color: '#2c3e50' }}>
                        Desde ${course.price.toLocaleString('es-AR')}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}

          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <Link to="/cursos" className="cta-btn">
              Ver todos los cursos
            </Link>
          </div>
        </div>
      </section>


      {/* Clients Section */}
      <section id="clientes" className="section">
        <div className="container">
          <h2 className="section-title">Nuestros Clientes</h2>
          <div className="clients-grid">
            <div className="client-card">
              <h4>Empresas Multinacionales</h4>
              <p>Capacitación en idiomas para equipos internacionales</p>
            </div>

            <div className="client-card">
              <h4>Estudiantes Universitarios</h4>
              <p>Preparación para intercambios y certificaciones</p>
            </div>

            <div className="client-card">
              <h4>Profesionales</h4>
              <p>Desarrollo de habilidades lingüísticas para crecimiento profesional</p>
            </div>

            <div className="client-card">
              <h4>Instituciones Educativas</h4>
              <p>Programas complementarios para colegios y universidades</p>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section id="demo" className="section">
        <div className="container">
          <h2 className="section-title">Demo</h2>
          <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
            <p style={{ fontSize: '1.1rem', marginBottom: '2rem' }}>
              Descubrí nuestra plataforma de gestión integral. Experimentá cómo administramos estudiantes, 
              clases, pagos y seguimiento académico de manera eficiente.
            </p>
            <button className="cta-btn" onClick={() => navigate(routes.LOGIN)}>
              Ver Demo Interactivo
            </button>
          </div>
        </div>
      </section>

      {/* Contact Section - Contiene id="contacto" */}
      <section id="contacto" className="section">
        <div className="container">
          <h2 className="section-title">Contacto</h2>
          <div className="contact-form">
            <form>
              <div className="form-group">
                <label htmlFor="nombre">Nombre Completo</label>
                <input type="text" id="nombre" name="nombre" required />
              </div>

              <div className="form-group">
                <label htmlFor="email">Correo Electrónico</label>
                <input type="email" id="email" name="email" required />
              </div>

              <div className="form-group">
                <label htmlFor="telefono">Teléfono</label>
                <input type="tel" id="telefono" name="telefono" />
              </div>

              <div className="form-group">
                <label htmlFor="mensaje">Mensaje</label>
                <textarea
                  id="mensaje"
                  name="mensaje"
                  placeholder="Contanos sobre tus objetivos de aprendizaje..."
                  required
                ></textarea>
              </div>
              <button type="submit" className="cta-btn">Enviar Mensaje</button>
            </form>
          </div>
        </div>
      </section>
    </>
  )
}

export default Home;