import React, { useState, useEffect } from 'react';
import { FaMoon, FaSun, FaSignOutAlt, FaArrowLeft } from 'react-icons/fa';

import { useNavigate } from 'react-router-dom';
import { routes } from '../../utils/routes';

const AdminHeader = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Obtener modo guardado del localStorage o usar false por defecto
    const savedMode = localStorage.getItem('darkMode');
    return savedMode ? JSON.parse(savedMode) : false;
  });

  // Aplicar/quitar modo oscuro al documento
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark-mode');
    } else {
      document.documentElement.classList.remove('dark-mode');
    }
    // Guardar preferencia en localStorage
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      marginBottom: '2rem',
      background: 'var(--card-bg)',
      padding: '1.5rem',
      borderRadius: '10px',
      boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
      borderBottom: '3px solid var(--primary)'
    }}>
      {/* Logo y título */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.75rem' 
        }}>
          {/* Logo */}
          <img 
            src="/images/Logo.png" 
            alt="PPIV Consultora" 
            style={{ 
              height: '50px', 
              width: 'auto',
              objectFit: 'contain'
            }}
            onError={(e) => {
              // Si no se puede cargar la imagen, mostrar un placeholder
              e.target.style.display = 'none';
            }}
          />
          
          {/* Título y subtítulo */}
          <div>
            <h2 style={{ 
              margin: 0, 
              fontSize: '1.5rem', 
              fontWeight: '700',
              color: 'var(--primary)',
              lineHeight: '1.2'
            }}>
              Panel de Administración
            </h2>
            <p style={{ 
              color: 'var(--text-secondary)', 
              margin: 0,
              fontSize: '0.9rem',
              fontWeight: '400'
            }}>
              ¡Bienvenido/a {user?.firstName || user?.name || 'Administrador'}!
            </p>
          </div>
        </div>
      </div>

      {/* Controles de la derecha */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '1rem' 
      }}>
        {/* Toggle modo oscuro */}
        <button
          onClick={toggleDarkMode}
          style={{
            background: 'none',
            border: `2px solid ${isDarkMode ? '#f39c12' : '#34495e'}`,
            borderRadius: '50%',
            width: '45px',
            height: '45px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            color: isDarkMode ? '#f39c12' : '#34495e'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'scale(1.1)';
            e.target.style.boxShadow = `0 4px 8px rgba(${isDarkMode ? '243, 156, 18' : '52, 73, 94'}, 0.3)`;
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'scale(1)';
            e.target.style.boxShadow = 'none';
          }}
          title={isDarkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
        >
          {isDarkMode ? (
            <FaSun style={{ fontSize: '1.2rem' }} />
          ) : (
            <FaMoon style={{ fontSize: '1.2rem' }} />
          )}
        </button>

        {/* Información del usuario */}
        <div style={{ 
          textAlign: 'right',
          borderRight: '2px solid var(--border-color)',
          paddingRight: '1rem'
        }}>
          <div style={{ 
            fontSize: '0.85rem', 
            fontWeight: '600',
            color: 'var(--text-primary)',
            marginBottom: '2px'
          }}>
            {user?.firstName} {user?.lastName}
          </div>
          <div style={{ 
            fontSize: '0.75rem', 
            color: 'var(--text-secondary)',
            textTransform: 'capitalize'
          }}>
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
          style={{
            background: 'linear-gradient(135deg, #e74c3c, #c0392b)',
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
            e.target.style.boxShadow = '0 4px 12px rgba(231, 76, 60, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = 'none';
          }}
        >
          <FaSignOutAlt />
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
};

export default AdminHeader;