import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './Header.css';

const Header = () => {
  const { user, logout } = useAuth();

  const getRoleLabel = (role) => {
    const roles = {
      admin: 'Administrador',
      teacher: 'Profesor',
      student: 'Estudiante',
      company: 'Empresa'
    };
    return roles[role] || role;
  };

  return (
    <header className="header">
      <div className="header-content">
        <h1 className="page-title">Academia de Idiomas</h1>
        
        <div className="header-right">
          <div className="user-info">
            <span className="user-name">{user?.name}</span>
            <span className="user-role">{getRoleLabel(user?.role)}</span>
          </div>
          
          <div className="header-actions">
            <button className="notification-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
              <span className="notification-badge">3</span>
            </button>
            
            <button className="logout-btn" onClick={logout}>
              Salir
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;