import React from 'react'

// Dashboard for company users to manage corporate language training
const CompanyDashboard = () => {
  return (
    <div className="dashboard-container">
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
  )
}

export default CompanyDashboard