import React, { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [theme, setTheme] = useState('light')
  const [menuOpen, setMenuOpen] = useState(false)
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [showScrollBottom, setShowScrollBottom] = useState(true)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

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

    const handleScroll = () => {
      const scrollTop = window.scrollY
      const windowHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight
      
      setShowScrollTop(scrollTop > 300)
      setShowScrollBottom(scrollTop < documentHeight - windowHeight - 300)
    }

    window.addEventListener('scroll', handleScroll)

    return () => {
      observer.disconnect()
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light')
  }

  const toggleMenu = () => {
    setMenuOpen(!menuOpen)
  }

  const scrollToSection = (sectionId) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' })
    setMenuOpen(false)
  }

  return (
    <div className="App">
      {/* Header */}
      <header className="header">
        <div className="container">
          <nav className="nav">
            <div className="logo" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <img src="/images/Logo.png" alt="Logo" />
              <span>Lingua Academy</span>
            </div>
            
            <ul className={`nav-links ${menuOpen ? 'active' : ''}`}>
              <li><a href="#nosotros" onClick={() => scrollToSection('nosotros')}>Nosotros</a></li>
              <li><a href="#servicios" onClick={() => scrollToSection('servicios')}>Servicios</a></li>
              <li><a href="#clientes" onClick={() => scrollToSection('clientes')}>Clientes</a></li>
              <li><a href="#demo" onClick={() => scrollToSection('demo')}>Demo</a></li>
              <li><a href="#contacto" onClick={() => scrollToSection('contacto')}>Contacto</a></li>
            </ul>

            <div className="nav-actions">
              <button className="theme-toggle" onClick={toggleTheme}>
                {theme === 'light' ? '🌙' : '☀️'}
              </button>
              <button className="login-btn">Iniciar Sesión</button>
              <button className="menu-toggle" onClick={toggleMenu}>
                ☰
              </button>
            </div>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="main">
        {/* Hero Section */}
        <section className="hero">
          <div className="container">
            <h1>Aprende las lenguas del mundo</h1>
            <p>Consultora especializada en enseñanza de idiomas con metodologías innovadoras y profesores certificados</p>
            <button className="cta-btn" onClick={() => scrollToSection('servicios')}>Conoce Nuestros Servicios</button>
          </div>
        </section>

        {/* Nosotros */}
        <section id="nosotros" className="section visible">
          <div className="container">
            <h2 className="section-title">Nosotros</h2>
            <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
              <p style={{ fontSize: '1.1rem', marginBottom: '2rem' }}>
                Somos una consultora de idiomas con más de 20 años de experiencia en la enseñanza de múltiples idiomas. 
                Nuestro equipo está conformado por profesores graduados de las mejores universidadesdel país que utilizan metodologías modernas 
                para garantizar un aprendizaje efectivo y personalizado.
              </p>
              <p style={{ fontSize: '1.1rem' }}>
                Nos especializamos en cursos de inglés, ofreciendo desde niveles 
                básicos hasta preparación para certificaciones internacionales. La comunición efectiva es nuestro foco desde el día uno.
              </p>
            </div>
          </div>
        </section>

        {/* Servicios */}
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
                <p>Aprende en grupos reducidos con metodología interactiva y ambiente colaborativo.</p>
              </div>
              <div className="service-card">
                <h3>Cursos Corporativos</h3>
                <p>Programas especializados para empresas con enfoque en comunicación profesional.</p>
              </div>
              <div className="service-card">
                <h3>Preparación Certificaciones</h3>
                <p>Cursos de prepación para FCE, CAE, CPE, TOEFL, TOEIC, y otras certificaciones internacionales.</p>
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

        {/* Clientes */}
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

        {/* Demo */}
        <section id="demo" className="section">
          <div className="container">
            <h2 className="section-title">Demo</h2>
            <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
              <p style={{ fontSize: '1.1rem', marginBottom: '2rem' }}>
                Descubre nuestra plataforma de gestión integral. Experimenta cómo administramos estudiantes, 
                clases, pagos y seguimiento académico de manera eficiente.
              </p>
              <button className="cta-btn">Ver Demo Interactivo</button>
            </div>
          </div>
        </section>

        {/* Contacto */}
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
                  <textarea id="mensaje" name="mensaje" placeholder="Cuéntanos sobre tus objetivos de aprendizaje..." required></textarea>
                </div>
                <button type="submit" className="cta-btn">Enviar Mensaje</button>
              </form>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="social-media">
            <a href="https://instagram.com/linguaacademy" target="_blank" rel="noopener noreferrer" className="social-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>
            <a href="https://linkedin.com/company/lingua-academy-ar" target="_blank" rel="noopener noreferrer" className="social-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            </a>
          </div>
          <p>&copy; 2025 Lingua Academy. Todos los derechos reservados.</p>
          <p>Transformando vidas a través del aprendizaje de idiomas</p>
          <p>Desarrollado por <a href="https://linkedin.com/company/techmoms" target="_blank" rel="noopener noreferrer">Tech Moms</a></p>
        </div>
      </footer>

      {/* WhatsApp Button */}
      <a 
        href="https://wa.me/5491121836922?text=Hola,%20me%20interesa%20conocer%20más%20sobre%20los%20cursos%20de%20idiomas" 
        target="_blank" 
        rel="noopener noreferrer"
        className="whatsapp-btn"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.488"/>
        </svg>
      </a>

      {/* Scroll to Bottom Button */}
      {showScrollBottom && (
        <button 
          className="scroll-bottom-btn" 
          onClick={() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' })}
        >
          ↓
        </button>
      )}

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button 
          className="scroll-top-btn" 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          ↑
        </button>
      )}
    </div>
  )
}

export default App