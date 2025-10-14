import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { routes } from '../../utils/routes'

// Navigation header that appears on every page
const Header = ({ theme, toggleTheme }) => {
  const [menuOpen, setMenuOpen] = useState(false)
  const [serviciosDropdownOpen, setServiciosDropdownOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  // Toggle mobile menu visibility
  const toggleMenu = () => {
    setMenuOpen(!menuOpen)
  }

  // Close menu when user clicks a navigation link
  const handleNavClick = () => {
    setMenuOpen(false)
  }

  // Handle logo click - go to home and scroll to top
  const handleLogoClick = () => {
    if (location.pathname === '/') {
      // Already on home page, just scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      // Navigate to home page first, then scroll to top
      navigate('/')
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }, 100)
    }
  }

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
    handleNavClick()
  }

  return (
    <header className="header">
      <div className="container">
        <nav className="nav">
          {/* Company logo that links back to home and scrolls to top */}
          <div className="logo" onClick={handleLogoClick}>
            <img src="/images/Logo.png" alt="Logo" />
            <span>Lingua Academy</span>
          </div>
          
          {/* Main navigation menu */}
          <ul className={`nav-links ${menuOpen ? 'active' : ''}`}>
            <li>
              <a href="#nosotros" onClick={(e) => { e.preventDefault(); handleSectionClick('nosotros') }}>
                Nosotros
              </a>
            </li>
            <li className="nav-dropdown" 
                onMouseEnter={() => setServiciosDropdownOpen(true)}
                onMouseLeave={() => setServiciosDropdownOpen(false)}>
              <a href="#servicios" onClick={(e) => { e.preventDefault(); handleSectionClick('servicios') }}>
                Servicios
              </a>
              <ul className={`dropdown-menu ${serviciosDropdownOpen ? 'show' : ''}`}>
                <li><Link to="/cursos" onClick={handleNavClick}>Ver Todos los Cursos</Link></li>
                <li><Link to="/cursos#clase-individual" onClick={handleNavClick}>Clases Individuales</Link></li>
                <li><Link to="/cursos#curso-grupal" onClick={handleNavClick}>Clases Grupales</Link></li>
                <li><Link to="/cursos#curso-corporativo" onClick={handleNavClick}>Cursos Corporativos</Link></li>
                <li><Link to="/cursos#certificacion" onClick={handleNavClick}>Preparación Certificaciones</Link></li>
                <li><Link to="/cursos#inmersion-cultural" onClick={handleNavClick}>Inmersión Cultural</Link></li>
              </ul>
            </li>
            <li>
              <a href="#clientes" onClick={(e) => { e.preventDefault(); handleSectionClick('clientes') }}>
                Clientes
              </a>
            </li>
            <li>
              <a href="#demo" onClick={(e) => { e.preventDefault(); handleSectionClick('demo') }}>
                Demo
              </a>
            </li>
            <li>
              <a href="#contacto" onClick={(e) => { e.preventDefault(); handleSectionClick('contacto') }}>
                Contacto
              </a>
            </li>
          </ul>

          {/* Right side buttons and controls */}
          <div className="nav-actions">
            {/* Theme switcher button */}
            <button className="theme-toggle" onClick={toggleTheme}>
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
            
            {/* Login button */}
            <button className="login-btn" onClick={() => navigate(routes.LOGIN)}>
              Iniciar Sesión
            </button>
            
            {/* Mobile menu hamburger button */}
            <button className="menu-toggle" onClick={toggleMenu}>
              ☰
            </button>
          </div>
        </nav>
      </div>
    </header>
  )
}

export default Header