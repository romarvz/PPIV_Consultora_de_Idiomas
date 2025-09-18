import React from 'react'
import { Users, BookOpen, Calendar, DollarSign, AlertTriangle, TrendingUp } from 'lucide-react'
import './Dashboard.css'

const Dashboard = ({ user }) => {
  const stats = [
    { title: 'Estudiantes Activos', value: '248', icon: Users, color: 'blue' },
    { title: 'Cursos Disponibles', value: '12', icon: BookOpen, color: 'green' },
    { title: 'Clases Programadas', value: '156', icon: Calendar, color: 'purple' },
    { title: 'Ingresos del Mes', value: '$45,230', icon: DollarSign, color: 'yellow' }
  ]

  const alerts = [
    { type: 'warning', message: '5 estudiantes con pagos vencidos' },
    { type: 'info', message: '3 profesores requieren actualización de disponibilidad' },
    { type: 'success', message: '12 nuevas inscripciones esta semana' }
  ]

  const recentActivities = [
    { action: 'Nuevo estudiante registrado', user: 'Ana Martínez', time: 'Hace 2 horas' },
    { action: 'Clase programada', user: 'Prof. García', time: 'Hace 3 horas' },
    { action: 'Pago recibido', user: 'Carlos López', time: 'Hace 5 horas' },
    { action: 'Curso creado', user: 'Admin', time: 'Hace 1 día' }
  ]

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Bienvenido, {user.name}</h1>
        <p className="dashboard-subtitle">Resumen de actividades del sistema</p>
      </div>

      <div className="stats-grid">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div key={index} className={`stat-card stat-${stat.color}`}>
              <div className="stat-icon">
                <Icon size={24} />
              </div>
              <div className="stat-content">
                <div className="stat-value">{stat.value}</div>
                <div className="stat-title">{stat.title}</div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="dashboard-content">
        <div className="dashboard-section">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">
                <AlertTriangle size={20} />
                Alertas y Notificaciones
              </h3>
            </div>
            <div className="alerts-list">
              {alerts.map((alert, index) => (
                <div key={index} className={`alert alert-${alert.type}`}>
                  {alert.message}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="dashboard-section">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">
                <TrendingUp size={20} />
                Actividad Reciente
              </h3>
            </div>
            <div className="activity-list">
              {recentActivities.map((activity, index) => (
                <div key={index} className="activity-item">
                  <div className="activity-content">
                    <div className="activity-action">{activity.action}</div>
                    <div className="activity-user">{activity.user}</div>
                  </div>
                  <div className="activity-time">{activity.time}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard