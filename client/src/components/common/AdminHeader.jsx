import React, { useState, useEffect } from 'react';
import { FaMoon, FaSun, FaSignOutAlt, FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { routes } from '../../utils/routes';
import '../../styles/adminDashboard.css';

const AdminHeader = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Load saved preference from localStorage
    const savedMode = localStorage.getItem('darkMode');
    return savedMode ? JSON.parse(savedMode) : false;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark-mode');
    } else {
      document.documentElement.classList.remove('dark-mode');
    }
    //  localStorage
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <div className="admin-header">
      {/* Logo and tittle section*/}
      <div className="admin-header__left">
        <div className="admin-header__logo-section">
          {/* Logo */}
          <img 
            src="/images/Logo.png" 
            alt="PPIV Consultora" 
            className="admin-header__logo"
            onError={(e) => {
             
              e.target.style.display = 'none';
            }}
          />

          {/* Title section */}
          <div className="admin-header__title-section">
            <h2>Panel de Administración</h2>
            <p>¡Bienvenido/a {user?.firstName || user?.name || 'Administrador'}!</p>
          </div>
        </div>
      </div>

     
      <div className="admin-header__right">
      
        <button
          onClick={toggleDarkMode}
          className={`admin-header__theme-toggle ${isDarkMode ? 'admin-header__theme-toggle--dark' : ''}`}
          title={isDarkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
        >
          {isDarkMode ? (
            <FaSun style={{ fontSize: '1.2rem' }} />
          ) : (
            <FaMoon style={{ fontSize: '1.2rem' }} />
          )}
        </button>

        {/* Información del usuario */}
        <div className="admin-header__user-info">
          <div className="admin-header__user-name">
            {user?.firstName} {user?.lastName}
          </div>
          <div className="admin-header__user-role">
            {user?.role || 'Administrador'}
          </div>
        </div>

        {/* Botón para volver al Dashboard */}
        <button 
          onClick={() => navigate(routes.DASHBOARD.ADMIN)}
          style={{
            background: 'var(--primary)',
            color: 'white',
            border: 'none',
            padding: '0.75rem 1.5rem',
            borderRadius: '8px',
            fontSize: '0.9rem',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 4px 12px rgba(0, 123, 255, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = 'none';
          }}
        >
          <FaArrowLeft />
          Volver al Dashboard
        </button>

        {/* Botón cerrar sesión */}
        <button 
          onClick={onLogout}
          className="admin-header__logout-btn"
        >
          <FaSignOutAlt />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </div>
  );
};

export default AdminHeader;