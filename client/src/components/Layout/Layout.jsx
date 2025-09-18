import React from 'react'
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
  Home
} from 'lucide-react'
import './Layout.css'

const Layout = ({ children, user, onLogout }) => {
  const location = useLocation()

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
      <aside className="sidebar">
        <div className="sidebar-header">
          <h1 className="logo">Lingua Academy</h1>
        </div>
        
        <nav className="sidebar-nav">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-item ${isActive ? 'active' : ''}`}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="user-details">
              <div className="user-name">{user.name}</div>
              <div className="user-role">{user.role}</div>
            </div>
          </div>
          <button onClick={onLogout} className="logout-btn">
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      <main className="main-content">
        <div className="content-wrapper">
          {children}
        </div>
      </main>
    </div>
  )
}

export default Layout