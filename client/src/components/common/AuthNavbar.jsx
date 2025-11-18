import React, { useState, useEffect } from 'react';
import { FaMoon, FaSun, FaSignOutAlt, FaArrowLeft } from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom';
import { routes } from '../../utils/routes';

const AuthNavbar = ({ user, onLogout, showBackButton = true, onBack }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode ? JSON.parse(savedMode) : false;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark-mode');
    } else {
      document.documentElement.classList.remove('dark-mode');
    }
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const isMainDashboard = location.pathname === '/dashboard' || location.pathname === '/dashboard/';

  return (
    <div className="auth-navbar" style={{ position: 'fixed !important', top: '0 !important', left: '0 !important', right: '0 !important', zIndex: '1000 !important', backgroundColor: 'var(--card-bg, white)', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', height: '60px' }}>
      <div className="auth-navbar__left">
        <img 
          src="/images/Logo.png" 
          alt="PPIV Consultora" 
          className="auth-navbar__logo"
          onError={(e) => { e.target.style.display = 'none'; }}
        />
        <div className="auth-navbar__title-section">
          <h2>Panel de Administración</h2>
          <p>¡Bienvenido/a {user?.firstName || user?.name || 'Administrador'}!</p>
        </div>
      </div>

      <div className="auth-navbar__right">
        <button
          onClick={toggleDarkMode}
          className="auth-navbar__theme-toggle"
          title={isDarkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
        >
          {isDarkMode ? <FaSun /> : <FaMoon />}
        </button>

        <div className="auth-navbar__user-info">
          <div className="auth-navbar__user-name">
            {user?.firstName} {user?.lastName}
          </div>
          <div className="auth-navbar__user-role">
            {user?.role || 'Administrador'}
          </div>
        </div>

        {showBackButton && (
          <button 
            onClick={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
              if (onBack) {
                onBack();
              } else {
                navigate('/dashboard/admin');
              }
            }}
            className="auth-navbar__back-btn"
          >
            <FaArrowLeft />
            Volver al Dashboard
          </button>
        )}

        <button 
          onClick={onLogout}
          className="auth-navbar__logout-btn"
        >
          <FaSignOutAlt />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </div>
  );
};

export default AuthNavbar;