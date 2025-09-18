import React from 'react'
import { Users, BookOpen, Calendar, Building2, CreditCard, BarChart3, LogIn, Play } from 'lucide-react'
import './LandingPage.css'

const LandingPage = ({ onLogin }) => {
  const features = [
    {
      icon: Users,
      title: 'Gestión de Estudiantes',
      description: 'Registro completo de estudiantes con historial académico, niveles de inglés y seguimiento de progreso personalizado.'
    },
    {
      icon: BookOpen,
      title: 'Catálogo de Cursos',
      description: 'Administra cursos grupales, individuales y corporativos con diferentes modalidades y niveles de dificultad.'
    },
    {
      icon: Calendar,
      title: 'Agenda y Reservas',
      description: 'Programación inteligente de clases con control de disponibilidad y notificaciones automáticas.'
    },
    {
      icon: Building2,
      title: 'Gestión Empresarial',
      description: 'Manejo completo de clientes corporativos con seguimiento de empleados y facturación especializada.'
    },
    {
      icon: CreditCard,
      title: 'Pagos y Facturación',
      description: 'Sistema integrado de pagos con múltiples métodos y generación automática de comprobantes.'
    },
    {
      icon: BarChart3,
      title: 'Reportes Avanzados',
      description: 'Informes detallados de progreso académico, ingresos, asistencias y métricas de rendimiento.'
    }
  ]

  const testUsers = [
    { role: 'Administrador', email: 'admin@linguaacademy.com', password: '123456' },
    { role: 'Profesor', email: 'profesor@linguaacademy.com', password: '123456' },
    { role: 'Estudiante', email: 'estudiante@linguaacademy.com', password: '123456' },
    { role: 'Empresa', email: 'empresa@linguaacademy.com', password: '123456' }
  ]

  return (
    <div className="landing-page">
      <header className="header">
        <nav className="nav">
          <div className="logo">Lingua Academy</div>
          <ul className="nav-menu">
            <li><a href="#inicio">Inicio</a></li>
            <li><a href="#servicios">Servicios</a></li>
            <li><a href="#nosotros">Nosotros</a></li>
            <li><a href="#contacto">Contacto</a></li>
            <li><button onClick={() => window.open('/public/demo.html', '_blank')} className="btn btn-secondary">
              <Play size={16} />
              Demo
            </button></li>
            <li><button onClick={onLogin} className="btn btn-primary">
              <LogIn size={16} />
              Acceder
            </button></li>
          </ul>
        </nav>
      </header>

      <main className="main">
        <section className="hero" id="inicio">
          <div className="hero-content">
            <h1>Sistema Integral de Gestión de Idiomas</h1>
            <p>Automatiza la gestión de tu consultora de idiomas con nuestra plataforma completa. Gestiona estudiantes, cursos, pagos y reportes desde un solo lugar.</p>
            <div className="hero-buttons">
              <button onClick={() => window.open('/public/demo.html', '_blank')} className="btn btn-large btn-secondary">
                <Play size={20} />
                Probar Demo
              </button>
              <button onClick={onLogin} className="btn btn-large btn-primary">
                <LogIn size={20} />
                Acceder al Sistema
              </button>
            </div>
          </div>
        </section>

        <section className="features" id="servicios">
          <div className="features-container">
            <h2>Funcionalidades Principales</h2>
            <div className="features-grid">
              {features.map((feature, index) => {
                const Icon = feature.icon
                return (
                  <div key={index} className="feature-card">
                    <div className="feature-icon">
                      <Icon size={24} />
                    </div>
                    <h3>{feature.title}</h3>
                    <p>{feature.description}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        <section className="cta" id="nosotros">
          <div className="cta-container">
            <h2>¿Listo para optimizar tu consultora de idiomas?</h2>
            <p>Accede al sistema de demostración y explora todas las funcionalidades disponibles. Usuarios de prueba incluidos para cada rol.</p>
            
            <div className="test-users-box">
              <h3>Usuarios de Prueba Disponibles:</h3>
              <div className="test-users-grid">
                {testUsers.map((user, index) => (
                  <div key={index} className="test-user">
                    <strong>{user.role}:</strong><br />
                    {user.email}<br />
                    Contraseña: {user.password}
                  </div>
                ))}
              </div>
            </div>

            <div className="cta-buttons">
              <button onClick={() => window.open('/public/demo.html', '_blank')} className="btn btn-secondary btn-large">
                <Play size={20} />
                Probar Demo
              </button>
              <button onClick={onLogin} className="btn btn-primary btn-large">
                <LogIn size={20} />
                Acceder con Login
              </button>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer" id="contacto">
        <div className="footer-container">
          <div className="footer-content">
            <div className="footer-section">
              <h3>Lingua Academy</h3>
              <p>Sistema integral para la gestión de consultoras de idiomas en inglés.</p>
              <p>Automatiza procesos, mejora la experiencia del estudiante y optimiza tu negocio.</p>
            </div>
            <div className="footer-section">
              <h3>Funcionalidades</h3>
              <a href="#servicios">Gestión de Estudiantes</a>
              <a href="#servicios">Programación de Clases</a>
              <a href="#servicios">Pagos y Facturación</a>
              <a href="#servicios">Reportes Avanzados</a>
            </div>
            <div className="footer-section">
              <h3>Soporte</h3>
              <a href="#">Documentación</a>
              <a href="#">Guías de Usuario</a>
              <a href="#">Centro de Ayuda</a>
              <a href="#">Contacto Técnico</a>
            </div>
            <div className="footer-section">
              <h3>Contacto</h3>
              <p>Email: info@linguaacademy.com</p>
              <p>Teléfono: +54 11 1234-5678</p>
              <p>Horario: Lun-Vie 9:00-18:00</p>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2024 Lingua Academy. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage