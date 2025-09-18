import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();

  const getIcon = (iconName) => {
    const icons = {
      users: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      ),
      book: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
        </svg>
      ),
      calendar: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
      ),
      dollar: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="12" y1="1" x2="12" y2="23"/>
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
        </svg>
      ),
      clock: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12,6 12,12 16,14"/>
        </svg>
      ),
      trending: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="23,6 13.5,15.5 8.5,10.5 1,18"/>
          <polyline points="17,6 23,6 23,12"/>
        </svg>
      ),
      file: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2Z"/>
          <polyline points="14,2 14,8 20,8"/>
        </svg>
      )
    };
    return icons[iconName] || icons.users;
  };

  const stats = {
    admin: [
      { title: 'Estudiantes Activos', value: '156', icon: 'users' },
      { title: 'Cursos Disponibles', value: '24', icon: 'book' },
      { title: 'Clases Hoy', value: '18', icon: 'calendar' },
      { title: 'Ingresos del Mes', value: '$45,230', icon: 'dollar' }
    ],
    teacher: [
      { title: 'Mis Cursos', value: '8', icon: 'book' },
      { title: 'Clases Hoy', value: '5', icon: 'calendar' },
      { title: 'Estudiantes', value: '42', icon: 'users' },
      { title: 'Horas del Mes', value: '68', icon: 'clock' }
    ],
    student: [
      { title: 'Mis Cursos', value: '3', icon: 'book' },
      { title: 'Próxima Clase', value: 'Hoy 14:00', icon: 'calendar' },
      { title: 'Progreso', value: '75%', icon: 'trending' },
      { title: 'Pagos Pendientes', value: '$1,200', icon: 'dollar' }
    ],
    company: [
      { title: 'Empleados Activos', value: '25', icon: 'users' },
      { title: 'Cursos Contratados', value: '6', icon: 'book' },
      { title: 'Facturas Pendientes', value: '2', icon: 'file' },
      { title: 'Gasto Mensual', value: '$8,500', icon: 'dollar' }
    ]
  };

  const currentStats = stats[user?.role] || stats.admin;

  const recentActivities = [
    { type: 'payment', message: 'Pago recibido de Juan Pérez', time: '2 min ago' },
    { type: 'class', message: 'Clase de Inglés Intermedio programada', time: '15 min ago' },
    { type: 'student', message: 'Nuevo estudiante registrado: María García', time: '1 hora ago' },
    { type: 'alert', message: 'Recordatorio: Clase en 30 minutos', time: '2 horas ago' }
  ];

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Bienvenido, {user?.name}</p>
      </div>

      <div className="stats-grid">
        {currentStats.map((stat, index) => (
          <div key={index} className="stat-card">
            <div className="stat-icon">
              {getIcon(stat.icon)}
            </div>
            <div className="stat-content">
              <h3>{stat.value}</h3>
              <p>{stat.title}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-content">
        <div className="recent-activities">
          <h2>Actividad Reciente</h2>
          <div className="activities-list">
            {recentActivities.map((activity, index) => (
              <div key={index} className="activity-item">
                <div className="activity-content">
                  <p>{activity.message}</p>
                  <span className="activity-time">{activity.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="quick-actions">
          <h2>Acciones Rápidas</h2>
          <div className="actions-grid">
            {user?.role === 'admin' && (
              <>
                <button className="action-btn">
                  <span className="action-icon">{getIcon('users')}</span>
                  Registrar Estudiante
                </button>
                <button className="action-btn">
                  <span className="action-icon">{getIcon('book')}</span>
                  Crear Curso
                </button>
                <button className="action-btn">
                  <span className="action-icon">{getIcon('calendar')}</span>
                  Programar Clase
                </button>
                <button className="action-btn">
                  <span className="action-icon">{getIcon('dollar')}</span>
                  Registrar Pago
                </button>
              </>
            )}
            {user?.role === 'teacher' && (
              <>
                <button className="action-btn">
                  <span className="action-icon">{getIcon('calendar')}</span>
                  Ver Agenda
                </button>
                <button className="action-btn">
                  <span className="action-icon">{getIcon('users')}</span>
                  Mis Estudiantes
                </button>
                <button className="action-btn">
                  <span className="action-icon">{getIcon('file')}</span>
                  Registrar Asistencia
                </button>
              </>
            )}
            {user?.role === 'student' && (
              <>
                <button className="action-btn">
                  <span className="action-icon">{getIcon('calendar')}</span>
                  Mi Horario
                </button>
                <button className="action-btn">
                  <span className="action-icon">{getIcon('dollar')}</span>
                  Mis Pagos
                </button>
                <button className="action-btn">
                  <span className="action-icon">{getIcon('trending')}</span>
                  Mi Progreso
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;