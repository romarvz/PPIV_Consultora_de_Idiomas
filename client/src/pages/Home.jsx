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

const serviceHighlights = [
  {
    title: 'Cursos Grupales',
    description:
      'Programas dinámicos para avanzar en equipo, con foco en conversación, gramática aplicada y proyectos colaborativos.',
    tags: ['Grupos reducidos', 'Todos los niveles', 'Inicio mensual']
  },
  {
    title: 'Clases Individuales',
    description:
      'Sesiones personalizadas para objetivos específicos: entrevistas, viajes, exámenes o práctica intensiva.',
    tags: ['Agenda flexible', 'Plan a medida', 'Seguimiento 1:1']
  },
  {
    title: 'Preparación de Certificaciones',
    description:
      'Entrenamiento para exámenes internacionales (Cambridge, TOEFL, DELF, TestDaF, CELI y más).',
    tags: ['Simulacros', 'Estrategias de examen', 'Material oficial']
  },
  {
    title: 'Inmersión Cultural',
    description:
      'Talleres temáticos para vivir el idioma: gastronomía, cine, literatura y experiencias conversacionales.',
    tags: ['Workshops', 'Clubs de conversación', 'Eventos especiales']
  },
  {
    title: 'Programas para Empresas',
    description:
      'Capacitación corporativa con reportes de avance, KPIs y contenido adaptado a cada industria.',
    tags: ['In-Company', 'Bilingüismo profesional', 'Planes a medida']
  },
  {
    title: 'Traducciones',
    description:
      'Traducciones técnicas, legales y académicas realizadas por traductores públicos certificados para empresas, profesionales y particulares.',
    tags: ['Rapidez', 'Precisión', 'Eficiencia']
  }
];

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
  const imageUrl =
    course.imageUrl ||
    course.coverImage ||
    (Array.isArray(course.images) && course.images[0]) ||
    '/images/Logo.png';
  const status = course.status || course.estado || 'planificado';

  return {
    id: course._id || course.id || name,
    name,
    description,
    language,
    modality,
    level,
    price,
    type,
    imageUrl,
    status
  };
};

const normalizeText = (text) =>
  typeof text === 'string'
    ? text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
    : '';

const selectFeaturedCourses = (courseList = []) => {
  if (!Array.isArray(courseList) || courseList.length === 0) {
    return [];
  }

  const preferredNames = [
    'Alemán Intermedio B2 Online',
    'Cambridge C1 Advanced (CAE)',
    'Italiano intermedio',
    'Portugués desde Cero',
    'Francés conversacional',
    'Inglés de Negocios para Empresas'
  ];

  const normalizedCourses = courseList.map((course) => ({
    ...course,
    normalizedName: normalizeText(course.name)
  }));

  const featured = [];
  const used = new Set();

  preferredNames.forEach((targetName) => {
    const normalizedTarget = normalizeText(targetName);
    const match = normalizedCourses.find((course) => {
      if (!course || used.has(course.id)) return false;
      return course.normalizedName === normalizedTarget;
    });

    if (match) {
      featured.push(match);
      used.add(match.id);
    }
  });

  for (const course of normalizedCourses) {
    if (featured.length >= 4) break;
    if (!course || used.has(course.id)) continue;
    featured.push(course);
    used.add(course.id);
  }

  return featured.slice(0, 6);
};

// Home page with all sections for smooth scrolling navigation
const Home = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [courses, setCourses] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [coursesError, setCoursesError] = useState(null);

  // Function to get navigation target for each service
  const getServiceNavigation = (serviceTitle) => {
    const navigationMap = {
      'Clases Individuales': { type: 'contacto', path: '/#contacto' },
      'Traducciones': { type: 'contacto', path: '/#contacto' },
      'Cursos Grupales': { type: 'cursos', path: '/cursos#curso-grupal' },
      'Preparación de Certificaciones': { type: 'cursos', path: '/cursos#certificacion' },
      'Inmersión Cultural': { type: 'cursos', path: '/cursos#inmersion-cultural' },
      'Programas para Empresas': { type: 'cursos', path: '/cursos#curso-corporativo' }
    };
    return navigationMap[serviceTitle] || null;
  };

  // Handle service card click
  const handleServiceClick = (serviceTitle) => {
    const nav = getServiceNavigation(serviceTitle);
    if (!nav) return;

    if (nav.type === 'contacto') {
      // Navigate to contacto section
      if (location.pathname === '/') {
        const element = document.getElementById('contacto');
        if (element) {
          const headerHeight = document.querySelector('header')?.offsetHeight || 0;
          const y = element.getBoundingClientRect().top + window.pageYOffset - headerHeight - 20;
          window.scrollTo({ top: y, behavior: 'smooth' });
        }
      } else {
        navigate('/#contacto', {
          state: { scrollTo: 'contacto' },
          replace: false
        });
      }
    } else if (nav.type === 'cursos') {
      // Navigate to cursos page with hash
      navigate(nav.path);
    }
  };

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setCoursesLoading(true);
        setCoursesError(null);

        const response = await apiAdapter.courses.getPublic({
          activeOnly: false,
          page: 1,
          limit: 100
        });

        if (!response.data?.success) {
          throw new Error('No se pudieron cargar los cursos');
        }

        const payload = Array.isArray(response.data?.data?.courses)
          ? response.data.data.courses
          : Array.isArray(response.data?.data)
          ? response.data.data
          : [];

        const normalized = payload
          .map(normalizeCourse)
          .filter(Boolean);
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

  // COMENTADO: useEffect para igualar alturas de tarjetas de cursos destacados (NO SE USA - se aplica en CoursesPage)
  // useEffect(() => {
  //   if (coursesLoading || courses.length === 0) return;
  //   const equalizeCardHeights = () => {
  //     const courseCards = document.querySelectorAll('.service-card--course');
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
  //   const timeoutId = setTimeout(() => { equalizeCardHeights(); }, 100);
  //   window.addEventListener('resize', equalizeCardHeights);
  //   return () => {
  //     clearTimeout(timeoutId);
  //     window.removeEventListener('resize', equalizeCardHeights);
  //   };
  // }, [coursesLoading, courses]);

  // NUEVO useEffect para manejar el scroll al ancla (#contacto)
  useEffect(() => {
    if (coursesLoading) return;

    const stateTarget = location.state?.scrollTo;
    const hashTarget = location.hash ? location.hash.replace('#', '') : null;
    const target = stateTarget || hashTarget;

    if (!target) return;

    const performScroll = () => {
      const element = document.getElementById(target);
      if (element) {
        const headerHeight = document.querySelector('header')?.offsetHeight || 0;
        const y = element.getBoundingClientRect().top + window.pageYOffset - headerHeight - 20;
        window.scrollTo({ top: y, behavior: 'smooth' });
        return true;
      }
      return false;
    };

    // Try immediately
    if (!performScroll()) {
      // If element not found, wait a bit and try again (for dynamic content)
      let attempts = 0;
      const interval = setInterval(() => {
        attempts += 1;
        if (performScroll() || attempts > 15) {
          clearInterval(interval);
        }
      }, 100);
      return () => clearInterval(interval);
    }

    // Clean up state after scrolling
    if (stateTarget) {
      // Use setTimeout to ensure scroll happens before navigation state cleanup
      setTimeout(() => {
        navigate(location.pathname + (hashTarget ? `#${hashTarget}` : ''), { replace: true, state: {} });
      }, 500);
    }
  }, [coursesLoading, location.hash, location.state, location.pathname, navigate]);

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

          <div className="services-grid">
            {serviceHighlights.map((service) => {
              const nav = getServiceNavigation(service.title);
              const isClickable = nav !== null;
              
              return (
                <div 
                  key={service.title} 
                  className="service-card service-card--highlight"
                  onClick={() => isClickable && handleServiceClick(service.title)}
                  style={{
                    cursor: isClickable ? 'pointer' : 'default',
                    transition: isClickable ? 'transform 0.2s ease, box-shadow 0.2s ease' : 'none'
                  }}
                  onMouseEnter={(e) => {
                    if (isClickable) {
                      e.currentTarget.style.transform = 'translateY(-5px)';
                      e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.15)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (isClickable) {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '';
                    }
                  }}
                >
                  <h3>{service.title}</h3>
                  <p>{service.description}</p>
                  <div
                    style={{
                      display: 'flex',
                      gap: '0.5rem',
                      flexWrap: 'wrap',
                      justifyContent: 'center',
                      textAlign: 'center',
                      marginTop: '1rem',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      color: '#1f76d3'
                    }}
                  >
                    {service.tags.map((tag) => (
                      <span key={tag}>{tag}</span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: '3rem' }}>
            <h3 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Cursos destacados</h3>

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
                Estamos actualizando los cursos disponibles. ¡Volvé pronto!
              </p>
            )}

            {!coursesLoading && !coursesError && courses.length > 0 && (
              <div className="services-grid services-grid--featured">
                {selectFeaturedCourses(courses).map((course) => (
                  <Link
                    key={course.id}
                    to={`/cursos#${slugify(course.type)}`}
                    style={{ 
                      textDecoration: 'none', 
                      color: 'inherit',
                      display: 'flex',
                      height: '100%'
                    }}
                  >
                    <div className="service-card service-card--course" style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
                      <div
                        className="service-card__image-wrapper"
                        style={{
                          width: '100%',
                          height: '160px',
                          borderRadius: '10px',
                          overflow: 'hidden',
                          marginBottom: '1rem',
                          flexShrink: 0
                        }}
                      >
                        <img
                          src={course.imageUrl}
                          alt={course.name}
                          className="service-card__image"
                          loading="lazy"
                          onError={(event) => {
                            if (!event.target.dataset.fallbackApplied) {
                              event.target.dataset.fallbackApplied = 'true';
                              event.target.src = '/images/Logo.png';
                            }
                          }}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                          }}
                        />
                      </div>
                      <h3 style={{ flexShrink: 0, marginBottom: '0.75rem' }}>{course.name}</h3>
                      <p style={{ marginBottom: '1.5rem', flexGrow: 1 }}>
                        {course.description.length > 160
                          ? `${course.description.slice(0, 157)}...`
                          : course.description}
                      </p>
                      <div
                        style={{
                          display: 'flex',
                          gap: '0.5rem',
                          flexWrap: 'wrap',
                          justifyContent: 'center',
                          textAlign: 'center',
                          marginTop: 'auto',
                          fontSize: '0.9rem',
                          fontWeight: 600,
                          color: '#1f76d3',
                          flexShrink: 0
                        }}
                      >
                        <span>{course.language}</span>
                        <span>{course.level}</span>
                        {course.modality && <span>{course.modality}</span>}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

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