import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { routes } from '../utils/routes'

// Home page with all sections for smooth scrolling navigation
const Home = () => {
  const navigate = useNavigate()

  // Set up scroll animations when sections come into view
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
          }
        })
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    )

    const sections = document.querySelectorAll('.section')
    sections.forEach((section) => observer.observe(section))

    return () => observer.disconnect()
  }, [])

  return (
    <>
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <h1>Aprendé las lenguas del mundo</h1>
          <p>Consultora especializada en enseñanza de idiomas con metodologías innovadoras y profesores certificados</p>
          <button className="cta-btn" onClick={() => document.getElementById('servicios')?.scrollIntoView({ behavior: 'smooth' })}>
            Conocé Nuestros Servicios
          </button>
        </div>
      </section>

      {/* About Section */}
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
            <div className="service-card">
              <h3>Clases Individuales</h3>
              <p>Atención personalizada con horarios flexibles adaptados a tus necesidades específicas.</p>
            </div>
            <div className="service-card">
              <h3>Clases Grupales</h3>
              <p>Aprendé en grupos reducidos con metodología interactiva y ambiente colaborativo.</p>
            </div>
            <div className="service-card">
              <h3>Cursos Corporativos</h3>
              <p>Programas especializados para empresas con enfoque en comunicación profesional.</p>
            </div>
            <div className="service-card">
              <h3>Preparación Certificaciones</h3>
              <p>Cursos de preparación para FCE, CAE, CPE, TOEFL, TOEIC, y otras certificaciones internacionales.</p>
            </div>
            <div className="service-card">
              <h3>Modalidad Online</h3>
              <p>Clases virtuales con plataforma interactiva propia y recursos multimedia avanzados.</p>
            </div>
            <div className="service-card">
              <h3>Inmersión Cultural</h3>
              <p>Programas que combinan idioma con cultura para una experiencia de aprendizaje integral.</p>
            </div>
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

      {/* Contact Section */}
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

export default Home