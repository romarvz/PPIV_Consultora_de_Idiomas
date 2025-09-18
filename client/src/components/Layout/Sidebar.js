import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './Sidebar.css';

const Sidebar = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    { path: '/', label: 'Dashboard', icon: '📊', roles: ['admin', 'teacher', 'student', 'company'] },
    { path: '/estudiantes', label: 'Estudiantes', icon: '👥', roles: ['admin'] },
    { path: '/cursos', label: 'Cursos', icon: '📚', roles: ['admin', 'teacher'] },
    { path: '/agenda', label: 'Agenda', icon: '📅', roles: ['admin', 'teacher', 'student'] },
    { path: '/pagos', label: 'Pagos', icon: '💳', roles: ['admin', 'student', 'company'] },
    { path: '/reportes', label: 'Reportes', icon: '📈', roles: ['admin'] },
    { path: '/profesores', label: 'Profesores', icon: '👨‍🏫', roles: ['admin'] },
    { path: '/empresas', label: 'Empresas', icon: '🏢', roles: ['admin'] }
  ];

  const filteredMenuItems = menuItems.filter(item => 
    item.roles.includes(user?.role)
  );

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <h2 className="sidebar-title">
          {isCollapsed ? 'SI' : 'Sistema Integral'}
        </h2>
        <button 
          className="collapse-btn"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? '→' : '←'}
        </button>
      </div>
      
      <nav className="sidebar-nav">
        {filteredMenuItems.map(item => (
          <Link
            key={item.path}
            to={item.path}
            className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            {!isCollapsed && <span className="nav-label">{item.label}</span>}
          </Link>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;