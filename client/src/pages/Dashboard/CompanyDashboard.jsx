import React, { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth.jsx'
import AuthNavbar from '../../components/common/AuthNavbar'
import apiAdapter from '../../services/apiAdapter'
import { 
  FaBuilding, 
  FaUsers, 
  FaDollarSign, 
  FaChartLine,
  FaUserTie,
  FaCalendarAlt,
  FaCog,
  FaFileAlt,
  FaSpinner
} from 'react-icons/fa'
import '../../styles/variables.css'
import '../../styles/auth.css'
import '../../styles/charts.css'

const CompanyDashboard = () => {
  const { user, logout } = useAuth()
  const [loading, setLoading] = useState(true)
  const [companyData, setCompanyData] = useState(null)

  useEffect(() => {
    loadCompanyData()
  }, [])

  const loadCompanyData = async () => {
    setLoading(true)
    try {
      const companyResponse = await apiAdapter.companies.getCompanyData()
      setCompanyData(companyResponse.data.data)
    } catch (error) {
      console.error('Error loading company data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(amount)
  }

  if (loading) {
    return (
      <section className="section visible">
        <div className="container dashboard-container">
          <AuthNavbar user={user} onLogout={handleLogout} showBackButton={true} />
          <div style={{ 
            textAlign: 'center', 
            padding: '4rem',
            color: 'var(--text-secondary)'
          }}>
            <FaSpinner style={{ 
              fontSize: '3rem', 
              marginBottom: '1rem',
              animation: 'spin 1s linear infinite'
            }} />
            <p>Cargando datos corporativos...</p>
          </div>
        </div>
      </section>
    )
  }

  const mockEmployees = companyData?.employees || [
    { id: 1, name: 'Ana García', position: 'Gerente Marketing', level: 'B2 Inglés', progress: 85, lastClass: '2025-10-10' },
    { id: 2, name: 'Carlos Rodríguez', position: 'Desarrollador Senior', level: 'A2 Francés', progress: 60, lastClass: '2025-10-08' },
    { id: 3, name: 'María López', position: 'Analista Financiero', level: 'C1 Inglés', progress: 95, lastClass: '2025-10-12' },
    { id: 4, name: 'Roberto Silva', position: 'Project Manager', level: 'A1 Alemán', progress: 30, lastClass: '2025-10-05' }
  ]

  const mockPayments = companyData?.payments || [
    { id: 1, month: 'Octubre 2025', amount: 45000, employees: 15, status: 'paid', concept: 'Plan Corporativo Premium' },
    { id: 2, month: 'Noviembre 2025', amount: 48000, employees: 16, status: 'pending', concept: 'Plan Corporativo Premium' },
    { id: 3, month: 'Septiembre 2025', amount: 42000, employees: 14, status: 'paid', concept: 'Plan Corporativo Premium' }
  ]

  const stats = companyData?.stats || {
    totalEmployees: 16,
    activeEmployees: 14,
    completedCourses: 8,
    averageProgress: 67,
    monthlyInvestment: 45000,
    languages: ['Inglés', 'Francés', 'Alemán']
  }

  return (
    <section className="section visible">
      <div className="container dashboard-container">
        <AuthNavbar user={user} onLogout={handleLogout} showBackButton={true} />

        {/* Company Info */}
        <div className="dashboard-section">
          <h3 className="dashboard-section__title">Panel Corporativo - {companyData?.companyName || 'Tech Solutions SA'}</h3>
          
          <div style={{
            background: 'var(--card-bg)',
            padding: '1.5rem',
            borderRadius: '12px',
            boxShadow: 'var(--shadow-md)',
            marginBottom: '2rem'
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
              <div>
                <p style={{ margin: '0 0 0.5rem 0', color: 'var(--text-secondary)' }}><strong>Empresa:</strong> {companyData?.companyName || 'Tech Solutions SA'}</p>
                <p style={{ margin: '0 0 0.5rem 0', color: 'var(--text-secondary)' }}><strong>Plan:</strong> {companyData?.plan || 'Corporativo Premium'}</p>
              </div>
              <div>
                <p style={{ margin: '0 0 0.5rem 0', color: 'var(--text-secondary)' }}><strong>Empleados Inscritos:</strong> {stats.totalEmployees}</p>
                <p style={{ margin: '0 0 0.5rem 0', color: 'var(--text-secondary)' }}><strong>Empleados Activos:</strong> {stats.activeEmployees}</p>
              </div>
              <div>
                <p style={{ margin: '0 0 0.5rem 0', color: 'var(--text-secondary)' }}><strong>Idiomas:</strong> {stats.languages.join(', ')}</p>
                <p style={{ margin: '0 0 0.5rem 0', color: 'var(--text-secondary)' }}><strong>Progreso Promedio:</strong> {stats.averageProgress}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
          {/* Enrolled Employees */}
          <div style={{
            background: 'var(--card-bg)',
            padding: '1.5rem',
            borderRadius: '12px',
            boxShadow: 'var(--shadow-md)',
            transition: 'all 0.3s ease',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-5px)';
            e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'var(--shadow-md)';
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <FaUsers style={{ color: 'var(--primary)', fontSize: '1.25rem', marginRight: '0.75rem' }} />
                <h4 style={{ color: 'var(--text-primary)', margin: 0 }}>Empleados Inscritos</h4>
              </div>
              <button 
                className="cta-btn" 
                style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
                onClick={() => alert('Aquí se verán más opciones de gestión de empleados.\n\nEn proceso de desarrollo.')}
              >
                <FaCog style={{ marginRight: '0.3rem' }} />
                Gestionar
              </button>
            </div>
            {mockEmployees.map((employee) => (
              <div key={employee.id} style={{ 
                marginBottom: '1rem', 
                padding: '1rem', 
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                background: 'var(--bg-secondary)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <div>
                    <div style={{ fontWeight: '600', color: 'var(--text-primary)', display: 'flex', alignItems: 'center' }}>
                      <FaUserTie style={{ marginRight: '0.5rem', color: 'var(--primary)' }} />
                      {employee.name}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{employee.position}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{employee.level}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{employee.progress}% completado</div>
                  </div>
                </div>
                <div style={{ 
                  width: '100%', 
                  height: '6px', 
                  backgroundColor: 'var(--border-color)', 
                  borderRadius: '3px'
                }}>
                  <div style={{ 
                    width: `${employee.progress}%`, 
                    height: '100%', 
                    backgroundColor: employee.progress > 80 ? 'var(--success)' : employee.progress > 50 ? 'var(--warning)' : 'var(--error)',
                    borderRadius: '3px'
                  }}></div>
                </div>
              </div>
            ))}
          </div>

          {/* Corporate Payments */}
          <div style={{
            background: 'var(--card-bg)',
            padding: '1.5rem',
            borderRadius: '12px',
            boxShadow: 'var(--shadow-md)',
            transition: 'all 0.3s ease',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-5px)';
            e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'var(--shadow-md)';
          }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem' }}>
              <FaDollarSign style={{ color: 'var(--primary)', fontSize: '1.25rem', marginRight: '0.75rem' }} />
              <h4 style={{ color: 'var(--text-primary)', margin: 0 }}>Pagos Corporativos</h4>
            </div>
            {mockPayments.map((payment) => (
              <div key={payment.id} style={{ 
                marginBottom: '1rem', 
                padding: '1rem', 
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                background: 'var(--bg-secondary)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>
                    {formatCurrency(payment.amount)}
                  </span>
                  <span style={{ 
                    fontSize: '0.75rem', 
                    padding: '0.25rem 0.75rem', 
                    borderRadius: '12px',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    backgroundColor: payment.status === 'paid' ? 'var(--success-light)' : 'var(--warning-light)',
                    color: payment.status === 'paid' ? 'var(--success-dark)' : 'var(--warning-dark)',
                    width: '90px',
                    textAlign: 'center',
                    display: 'inline-block'
                  }}>
                    {payment.status === 'paid' ? 'Pagado' : 'Pendiente'}
                  </span>
                </div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{payment.concept}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  {payment.month} • {payment.employees} empleados
                </div>
              </div>
            ))}
          </div>

          {/* Statistics and Reports */}
          <div style={{
            background: 'var(--card-bg)',
            padding: '1.5rem',
            borderRadius: '12px',
            boxShadow: 'var(--shadow-md)',
            transition: 'all 0.3s ease',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-5px)';
            e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'var(--shadow-md)';
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <FaChartLine style={{ color: 'var(--primary)', fontSize: '1.25rem', marginRight: '0.75rem' }} />
                <h4 style={{ color: 'var(--text-primary)', margin: 0 }}>Estadísticas Generales</h4>
              </div>
              <button 
                className="cta-btn" 
                style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
                onClick={() => alert('Aquí se verán opciones de exportación de reportes.\n\nEn proceso de desarrollo.')}
              >
                <FaFileAlt style={{ marginRight: '0.3rem' }} />
                Exportar
              </button>
            </div>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>Progreso General de la Empresa</span>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{stats.averageProgress}%</span>
              </div>
              <div style={{ 
                width: '100%', 
                height: '12px', 
                backgroundColor: 'var(--border-color)', 
                borderRadius: '6px'
              }}>
                <div style={{ 
                  width: `${stats.averageProgress}%`, 
                  height: '100%', 
                  backgroundColor: 'var(--primary)',
                  borderRadius: '6px'
                }}></div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ textAlign: 'center', padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--primary)' }}>
                  {stats.completedCourses}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Cursos Completados</div>
              </div>
              <div style={{ textAlign: 'center', padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--success)' }}>
                  {formatCurrency(stats.monthlyInvestment)}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Inversión Mensual</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default CompanyDashboard