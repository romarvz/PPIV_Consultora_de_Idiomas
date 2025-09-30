import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

// Footer that appears at the bottom of every page
const Footer = () => {
  const navigate = useNavigate()
  const location = useLocation()

  // Handle navigation - scroll on home page, route to home then scroll on other pages
  const handleSectionClick = (sectionId) => {
    if (location.pathname === '/') {
      // Already on home page, just scroll to section
      document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' })
    } else {
      // Navigate to home page first, then scroll to section
      navigate('/')
      setTimeout(() => {
        document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    }
  }

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          {/* Company information section */}
          <div className="footer-section">
            <h4>Lingua Academy</h4>
            <p>Consultora especializada en enseñanza de idiomas con metodologías innovadoras.</p>
          </div>
          
          {/* Quick navigation links with scroll functionality */}
          <div className="footer-section">
            <h4>Enlaces</h4>
            <ul>
              <li>
                <a href="#nosotros" onClick={(e) => { e.preventDefault(); handleSectionClick('nosotros') }}>
                  Nosotros
                </a>
              </li>
              <li>
                <a href="#servicios" onClick={(e) => { e.preventDefault(); handleSectionClick('servicios') }}>
                  Servicios
                </a>
              </li>
              <li>
                <a href="#clientes" onClick={(e) => { e.preventDefault(); handleSectionClick('clientes') }}>
                  Clientes
                </a>
              </li>
              <li>
                <a href="#contacto" onClick={(e) => { e.preventDefault(); handleSectionClick('contacto') }}>
                  Contacto
                </a>
              </li>
            </ul>
          </div>
          
          {/* Contact information */}
          <div className="footer-section">
            <h4>Contacto</h4>
            <p>Email: info@linguaacademy.com</p>
            <p>Teléfono: +54 11 2183-6922</p>
            <p>LinkedIn: <a href="https://www.linkedin.com/company/lingua-academy-ar/about/?viewAsMember=true" target="_blank" rel="noopener noreferrer">Lingua Academy</a></p>
          </div>
        </div>
        
        {/* Copyright notice */}
        <div className="footer-bottom">
          <p>&copy; 2025 Lingua Academy. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer