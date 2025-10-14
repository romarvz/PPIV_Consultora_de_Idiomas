import React, { useState, useEffect } from 'react';
import { FaMoon, FaSun, FaSignOutAlt } from 'react-icons/fa';
import '../../styles/adminDashboard.css';

const TeacherHeader = ({ user, onLogout }) => {
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
    // Save preference to localStorage
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <div className="admin-header">
      {/* Logo and title section */}
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
            <h2>Dashboard del Profesor</h2>
            <p>¡Bienvenido/a {user?.firstName || user?.name || 'Profesor'}!</p>
          </div>
        </div>
      </div>

      {/* Right controls */}
      <div className="admin-header__right">
        {/* Dark mode toggle */}
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

        {/* User information */}
        <div className="admin-header__user-info">
          <div className="admin-header__user-name">
            {user?.firstName} {user?.lastName}
          </div>
          <div className="admin-header__user-role">
            {user?.role || 'Profesor'}
          </div>
        </div>

        {/* Logout button */}
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

export default TeacherHeader;