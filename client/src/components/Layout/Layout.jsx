import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { 
  Users, 
  BookOpen, 
  Calendar, 
  Building2, 
  GraduationCap, 
  CreditCard, 
  BarChart3, 
  LogOut,
  Home,
  Menu,
  X
} from 'lucide-react'
import './Layout.css'

const Layout = ({ children, user, onLogout }) => {
  const location = useLocation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const menuItems = [
    { path: '/', icon: Home, label: 'Dashboard' },
    { path: '/students', icon: Users, label: 'Estudiantes' },
    { path: '/courses', icon: BookOpen, label: 'Cursos' },
    { path: '/classes', icon: Calendar, label: 'Clases' },
    { path: '/companies', icon: Building2, label: 'Empresas' },
    { path: '/teachers', icon: GraduationCap, label: 'Profesores' },
    { path: '/payments', icon: CreditCard, label: 'Pagos' },
    { path: '/reports', icon: BarChart3, label: 'Reportes' }
  ]

  return (
    <div className="layout">
      <header className="header">
        <div className="header-content">
          <h1 className="logo">Lingua Academy</h1>
          
          <nav className="nav-menu">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`nav-item ${isActive ? 'active' : ''}`}
                >
                  <Icon size={16} />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>

          <div className="user-section">
            <div className="user-info">
              <span className="user-name">{user.name}</span>
              <span className="user-role">({user.role})</span>
            </div>
            <button 
              className="mobile-menu-btn"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <button onClick={onLogout} className="logout-btn">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      {isMobileMenuOpen && (
        <div className="mobile-menu">
          <nav className="mobile-nav">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`mobile-nav-item ${isActive ? 'active' : ''}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>
        </div>
      )}

      <main className="main-content">
        <div className="content-wrapper">
          {children}
        </div>
      </main>
    </div>
  )
}

export default Layout