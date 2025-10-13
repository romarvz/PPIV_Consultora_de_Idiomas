import React, { useState } from 'react'
import { useAuth } from '../../hooks/useAuth.jsx'
import CompanyHeader from '../../components/common/CompanyHeader'
import { 
  FaBuilding, 
  FaUsers, 
  FaDollarSign, 
  FaChartLine,
  FaUserTie,
  FaCalendarAlt,
  FaSignOutAlt,
  FaCog,
  FaFileAlt
} from 'react-icons/fa'
import '../../styles/adminDashboard.css'

// Mock data for corporate dashboard
const mockEmployees = [
  { 
    id: 1, 
    name: 'Ana García', 
    position: 'Gerente Marketing',
    level: 'B2 Inglés', 
    progress: 85,
    lastClass: '2025-10-10'
  },
  { 
    id: 2, 
    name: 'Carlos Rodríguez', 
    position: 'Desarrollador Senior',
    level: 'A2 Francés', 
    progress: 60,
    lastClass: '2025-10-08'
  },
  { 
    id: 3, 
    name: 'María López', 
    position: 'Analista Financiero',
    level: 'C1 Inglés', 
    progress: 95,
    lastClass: '2025-10-12'
  },
  { 
    id: 4, 
    name: 'Roberto Silva', 
    position: 'Project Manager',
    level: 'A1 Alemán', 
    progress: 30,
    lastClass: '2025-10-05'
  }
]

const mockCorporatePayments = [
  { 
    id: 1, 
    month: 'Octubre 2025', 
    amount: 45000, 
    employees: 15, 
    status: 'paid',
    concept: 'Plan Corporativo Premium'
  },
  { 
    id: 2, 
    month: 'Noviembre 2025', 
    amount: 48000, 
    employees: 16, 
    status: 'pending',
    concept: 'Plan Corporativo Premium'
  },
  { 
    id: 3, 
    month: 'Septiembre 2025', 
    amount: 42000, 
    employees: 14, 
    status: 'paid',
    concept: 'Plan Corporativo Premium'
  }
]

const mockCompanyStats = {
  totalEmployees: 16,
  activeEmployees: 14,
  completedCourses: 8,
  averageProgress: 67,
  monthlyInvestment: 45000,
  languages: ['Inglés', 'Francés', 'Alemán']
}

// Dashboard for company users to manage corporate language training
const CompanyDashboard = () => {
  const { user, logout } = useAuth()

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return (
    <div className="dashboard-container">
      {/* Header */}
      <CompanyHeader user={user} onLogout={handleLogout} />

      {/* Company Info */}
      <div className="dashboard-info-card">
        <h3 className="dashboard-info-card__title">Información de la Empresa</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
          <div>
            <p className="dashboard-info-card__text"><strong>Empresa:</strong> Tech Solutions Corp</p>
            <p className="dashboard-info-card__text"><strong>Plan:</strong> Corporativo Premium</p>
          </div>
          <div>
            <p className="dashboard-info-card__text"><strong>Empleados Inscritos:</strong> {mockCompanyStats.totalEmployees}</p>
            <p className="dashboard-info-card__text"><strong>Empleados Activos:</strong> {mockCompanyStats.activeEmployees}</p>
          </div>
          <div>
            <p className="dashboard-info-card__text"><strong>Idiomas:</strong> {mockCompanyStats.languages.join(', ')}</p>
            <p className="dashboard-info-card__text"><strong>Progreso Promedio:</strong> {mockCompanyStats.averageProgress}%</p>
          </div>
        </div>
      </div>

      {/* Dashboard Cards */}
      <div className="dashboard-cards-grid dashboard-cards-grid--large">
        {/* Enrolled Employees */}
        <div className="dashboard-card">
          <div className="dashboard-card__header dashboard-card__header--with-button">
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <FaUsers className="dashboard-card__icon" />
              <h4 className="dashboard-card__title">Empleados Inscritos</h4>
            </div>
            <button className="dashboard-card__button">
              <FaCog style={{ marginRight: '5px' }} />
              Gestionar
            </button>
          </div>
          {mockEmployees.map((employee) => (
            <div key={employee.id} style={{ 
              marginBottom: '15px', 
              padding: '10px', 
              border: '1px solid #eee',
              borderRadius: '5px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                <div>
                  <div style={{ fontWeight: 'bold', color: '#333' }}>
                    <FaUserTie style={{ marginRight: '8px', color: '#2c5aa0' }} />
                    {employee.name}
                  </div>
                  <div style={{ fontSize: '13px', color: '#666' }}>{employee.position}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '12px', color: '#888' }}>{employee.level}</div>
                  <div style={{ fontSize: '12px', color: '#888' }}>{employee.progress}% completado</div>
                </div>
              </div>
              <div style={{ 
                width: '100%', 
                height: '4px', 
                backgroundColor: '#e0e0e0', 
                borderRadius: '2px'
              }}>
                <div style={{ 
                  width: `${employee.progress}%`, 
                  height: '100%', 
                  backgroundColor: employee.progress > 80 ? '#28a745' : employee.progress > 50 ? '#ffc107' : '#dc3545',
                  borderRadius: '2px'
                }}></div>
              </div>
            </div>
          ))}
        </div>

        {/* Corporate Payments */}
        <div style={{ 
          background: 'white', 
          padding: '20px', 
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
            <FaDollarSign style={{ color: '#2c5aa0', marginRight: '10px', fontSize: '18px' }} />
            <h4 style={{ color: '#2c5aa0', margin: 0 }}>Pagos Corporativos</h4>
          </div>
          {mockCorporatePayments.map((payment) => (
            <div key={payment.id} style={{ 
              marginBottom: '15px', 
              padding: '10px', 
              border: '1px solid #eee',
              borderRadius: '5px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                <span style={{ fontWeight: 'bold', color: '#333' }}>
                  ${payment.amount.toLocaleString()}
                </span>
                <span style={{ 
                  fontSize: '12px', 
                  padding: '2px 8px', 
                  borderRadius: '12px',
                  backgroundColor: payment.status === 'paid' ? '#d4edda' : '#fff3cd',
                  color: payment.status === 'paid' ? '#155724' : '#856404'
                }}>
                  {payment.status === 'paid' ? '✓ Pagado' : '⏰ Pendiente'}
                </span>
              </div>
              <div style={{ fontSize: '13px', color: '#666' }}>{payment.concept}</div>
              <div style={{ fontSize: '12px', color: '#888' }}>
                {payment.month} • {payment.employees} empleados
              </div>
            </div>
          ))}
        </div>

        {/* Statistics and Reports */}
        <div style={{ 
          background: 'white', 
          padding: '20px', 
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '15px' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <FaChartLine style={{ color: '#2c5aa0', marginRight: '10px', fontSize: '18px' }} />
              <h4 style={{ color: '#2c5aa0', margin: 0 }}>Estadísticas Generales</h4>
            </div>
            <button style={{
              background: '#28a745',
              color: 'white',
              border: 'none',
              padding: '5px 10px',
              borderRadius: '3px',
              fontSize: '12px',
              cursor: 'pointer'
            }}>
              <FaFileAlt style={{ marginRight: '5px' }} />
              Exportar
            </button>
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ fontWeight: 'bold', color: '#333' }}>Progreso General de la Empresa</span>
              <span style={{ fontSize: '14px', color: '#666' }}>{mockCompanyStats.averageProgress}%</span>
            </div>
            <div style={{ 
              width: '100%', 
              height: '12px', 
              backgroundColor: '#e0e0e0', 
              borderRadius: '6px'
            }}>
              <div style={{ 
                width: `${mockCompanyStats.averageProgress}%`, 
                height: '100%', 
                backgroundColor: '#2c5aa0',
                borderRadius: '6px'
              }}></div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div style={{ textAlign: 'center', padding: '10px', background: '#f8f9fa', borderRadius: '5px' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#2c5aa0' }}>
                {mockCompanyStats.completedCourses}
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>Cursos Completados</div>
            </div>
            <div style={{ textAlign: 'center', padding: '10px', background: '#f8f9fa', borderRadius: '5px' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#28a745' }}>
                ${mockCompanyStats.monthlyInvestment.toLocaleString()}
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>Inversión Mensual</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CompanyDashboard