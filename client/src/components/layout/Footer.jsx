import React from 'react'
import { Link } from 'react-router-dom'
import { routes } from '../../utils/routes'

// Footer that appears at the bottom of every page
const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          {/* Company information section */}
          <div className="footer-section">
            <h4>Lingua Academy</h4>
            <p>Consultora especializada en enseñanza de idiomas con metodologías innovadoras.</p>
          </div>
          
          {/* Quick navigation links */}
          <div className="footer-section">
            <h4>Enlaces</h4>
            <ul>
              <li><Link to={routes.ABOUT}>Nosotros</Link></li>
              <li><Link to={routes.SERVICES}>Servicios</Link></li>
              <li><Link to={routes.CLIENTS}>Clientes</Link></li>
              <li><Link to={routes.CONTACT}>Contacto</Link></li>
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