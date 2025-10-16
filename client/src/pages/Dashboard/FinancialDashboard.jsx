import React, { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth.jsx'
import AuthNavbar from '../../components/common/AuthNavbar'
import apiAdapter from '../../services/apiAdapter'
import { 
  FaDollarSign, 
  FaCreditCard, 
  FaFileInvoiceDollar,
  FaChartLine,
  FaUsers,
  FaCalendarAlt,
  FaSpinner,
  FaPlus,
  FaDownload
} from 'react-icons/fa'
import '../../styles/variables.css'
import '../../styles/auth.css'
import '../../styles/charts.css'

const FinancialDashboard = () => {
  const { user, logout } = useAuth()
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [financialData, setFinancialData] = useState(null)
  const [payments, setPayments] = useState([])
  const [invoices, setInvoices] = useState([])

  useEffect(() => {
    loadFinancialData()
  }, [])

  const loadFinancialData = async () => {
    setLoading(true)
    try {
      const [financialResponse, paymentsResponse, invoicesResponse] = await Promise.all([
        apiAdapter.reports.financial(),
        apiAdapter.payments.getAll(),
        apiAdapter.invoices.getAll()
      ])
      
      setFinancialData(financialResponse.data.data)
      setPayments(paymentsResponse.data.data.payments || [])
      setInvoices(invoicesResponse.data.data.invoices || [])
    } catch (error) {
      console.error('Error loading financial data:', error)
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
            <p>Cargando datos financieros...</p>
          </div>
        </div>
      </section>
    )
  }

  const mockPayments = payments.length > 0 ? payments : [
    { id: 1, studentName: 'Ana García', amount: 4500, status: 'paid', date: '2025-10-15', method: 'transferencia' },
    { id: 2, studentName: 'Carlos López', amount: 4200, status: 'pending', date: '2025-10-20', method: 'efectivo' },
    { id: 3, studentName: 'María Silva', amount: 5000, status: 'paid', date: '2025-10-12', method: 'tarjeta' },
    { id: 4, studentName: 'Roberto Díaz', amount: 3800, status: 'overdue', date: '2025-10-05', method: 'transferencia' }
  ]

  const mockInvoices = invoices.length > 0 ? invoices : [
    { id: 1, number: 'FAC-001', studentName: 'Ana García', amount: 4500, status: 'paid', date: '2025-10-15' },
    { id: 2, number: 'FAC-002', studentName: 'Carlos López', amount: 4200, status: 'pending', date: '2025-10-20' },
    { id: 3, number: 'FAC-003', studentName: 'María Silva', amount: 5000, status: 'sent', date: '2025-10-12' }
  ]

  const stats = {
    totalIncome: financialData?.totalIncome || 125000,
    pendingIncome: financialData?.pendingIncome || 18500,
    monthlyRevenue: financialData?.monthlyRevenue || 45000,
    totalStudents: financialData?.totalStudents || 28,
    paidStudents: financialData?.paidStudents || 22,
    overduePayments: financialData?.overduePayments || 3
  }

  return (
    <section className="section visible">
      <div className="container dashboard-container">
        <AuthNavbar user={user} onLogout={handleLogout} showBackButton={true} />

        {/* Header */}
        <div className="dashboard-section">
          <h3 className="dashboard-section__title">Gestión Financiera</h3>
          
          {/* Financial Overview Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1.5rem',
            marginBottom: '2rem'
          }}>
            <div className="service-card">
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                <FaDollarSign style={{ color: 'var(--success)', fontSize: '1.5rem', marginRight: '0.75rem' }} />
                <h4 style={{ color: 'var(--text-primary)', margin: 0 }}>Ingresos Totales</h4>
              </div>
              <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--success)', marginBottom: '0.5rem' }}>
                {formatCurrency(stats.totalIncome)}
              </div>
              <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.9rem' }}>
                Este mes: {formatCurrency(stats.monthlyRevenue)}
              </p>
            </div>
            
            <div className="service-card">
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                <FaCreditCard style={{ color: 'var(--warning)', fontSize: '1.5rem', marginRight: '0.75rem' }} />
                <h4 style={{ color: 'var(--text-primary)', margin: 0 }}>Pagos Pendientes</h4>
              </div>
              <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--warning)', marginBottom: '0.5rem' }}>
                {formatCurrency(stats.pendingIncome)}
              </div>
              <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.9rem' }}>
                {stats.overduePayments} pagos vencidos
              </p>
            </div>
            
            <div className="service-card">
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                <FaUsers style={{ color: 'var(--primary)', fontSize: '1.5rem', marginRight: '0.75rem' }} />
                <h4 style={{ color: 'var(--text-primary)', margin: 0 }}>Estado de Pagos</h4>
              </div>
              <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--primary)', marginBottom: '0.5rem' }}>
                {stats.paidStudents}/{stats.totalStudents}
              </div>
              <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.9rem' }}>
                {Math.round((stats.paidStudents / stats.totalStudents) * 100)}% al día
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{
          background: 'var(--card-bg)',
          borderRadius: '12px',
          boxShadow: 'var(--shadow-md)',
          overflow: 'hidden',
          marginBottom: '2rem'
        }}>
          <div style={{ borderBottom: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex' }}>
              <button
                onClick={() => setActiveTab('overview')}
                style={{
                  padding: '1rem 1.5rem',
                  fontWeight: '600',
                  fontSize: '1rem',
                  border: 'none',
                  background: activeTab === 'overview' ? 'var(--primary)' : 'transparent',
                  cursor: 'pointer',
                  color: activeTab === 'overview' ? 'white' : 'var(--text-secondary)',
                  transition: 'all 0.2s ease'
                }}
              >
                Resumen
              </button>
              <button
                onClick={() => setActiveTab('payments')}
                style={{
                  padding: '1rem 1.5rem',
                  fontWeight: '600',
                  fontSize: '1rem',
                  border: 'none',
                  background: activeTab === 'payments' ? 'var(--primary)' : 'transparent',
                  cursor: 'pointer',
                  color: activeTab === 'payments' ? 'white' : 'var(--text-secondary)',
                  transition: 'all 0.2s ease'
                }}
              >
                Pagos
              </button>
              <button
                onClick={() => setActiveTab('invoices')}
                style={{
                  padding: '1rem 1.5rem',
                  fontWeight: '600',
                  fontSize: '1rem',
                  border: 'none',
                  background: activeTab === 'invoices' ? 'var(--primary)' : 'transparent',
                  cursor: 'pointer',
                  color: activeTab === 'invoices' ? 'white' : 'var(--text-secondary)',
                  transition: 'all 0.2s ease'
                }}
              >
                Facturación
              </button>
            </div>
          </div>

          <div style={{ padding: '1.5rem' }}>
            {activeTab === 'overview' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h4 style={{ color: 'var(--text-primary)', margin: 0 }}>Resumen Financiero</h4>
                  <button 
                    className="cta-btn" 
                    style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}
                    onClick={() => alert('Aquí se verán opciones de exportación de reportes financieros.\n\nEn proceso de desarrollo.')}
                  >
                    <FaDownload style={{ marginRight: '0.5rem' }} />
                    Exportar Reporte
                  </button>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                  <div>
                    <h5 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>Ingresos por Mes</h5>
                    <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span>Octubre 2025</span>
                        <span style={{ fontWeight: '600' }}>{formatCurrency(45000)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span>Septiembre 2025</span>
                        <span style={{ fontWeight: '600' }}>{formatCurrency(42000)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Agosto 2025</span>
                        <span style={{ fontWeight: '600' }}>{formatCurrency(38000)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h5 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>Métodos de Pago</h5>
                    <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span>Transferencia</span>
                        <span style={{ fontWeight: '600' }}>65%</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span>Tarjeta</span>
                        <span style={{ fontWeight: '600' }}>25%</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Efectivo</span>
                        <span style={{ fontWeight: '600' }}>10%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'payments' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h4 style={{ color: 'var(--text-primary)', margin: 0 }}>Gestión de Pagos</h4>
                  <button 
                    className="cta-btn" 
                    style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}
                    onClick={() => alert('Aquí se verán opciones para registrar nuevos pagos.\n\nEn proceso de desarrollo.')}
                  >
                    <FaPlus style={{ marginRight: '0.5rem' }} />
                    Nuevo Pago
                  </button>
                </div>
                
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', minWidth: '700px', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: 'var(--bg-secondary)', borderBottom: '2px solid var(--border-color)' }}>
                        <th style={{ textAlign: 'left', padding: '1rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Estudiante</th>
                        <th style={{ textAlign: 'center', padding: '1rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Monto</th>
                        <th style={{ textAlign: 'center', padding: '1rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Método</th>
                        <th style={{ textAlign: 'center', padding: '1rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Fecha</th>
                        <th style={{ textAlign: 'center', padding: '1rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mockPayments.map((payment) => (
                        <tr key={payment.id} className="table-row-hover" style={{ borderBottom: '1px solid var(--border-color)' }}>
                          <td style={{ padding: '1rem', color: 'var(--text-primary)', fontWeight: '500' }}>
                            {payment.studentName}
                          </td>
                          <td style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-primary)', fontWeight: '600' }}>
                            {formatCurrency(payment.amount)}
                          </td>
                          <td style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                            {payment.method}
                          </td>
                          <td style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                            {payment.date}
                          </td>
                          <td style={{ padding: '1rem', textAlign: 'center' }}>
                            <span style={{
                              padding: '0.25rem 0.75rem',
                              borderRadius: '12px',
                              fontSize: '0.75rem',
                              fontWeight: '600',
                              textTransform: 'uppercase',
                              width: '90px',
                              textAlign: 'center',
                              display: 'inline-block',
                              background: payment.status === 'paid' ? 'var(--success-light)' : 
                                         payment.status === 'pending' ? 'var(--warning-light)' : 'var(--error-light)',
                              color: payment.status === 'paid' ? 'var(--success-dark)' : 
                                     payment.status === 'pending' ? 'var(--warning-dark)' : 'var(--error-dark)'
                            }}>
                              {payment.status === 'paid' ? 'Pagado' : 
                               payment.status === 'pending' ? 'Pendiente' : 'Vencido'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'invoices' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h4 style={{ color: 'var(--text-primary)', margin: 0 }}>Facturación</h4>
                  <button 
                    className="cta-btn" 
                    style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}
                    onClick={() => alert('Aquí se verán opciones para generar nuevas facturas.\n\nEn proceso de desarrollo.')}
                  >
                    <FaFileInvoiceDollar style={{ marginRight: '0.5rem' }} />
                    Nueva Factura
                  </button>
                </div>
                
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', minWidth: '700px', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: 'var(--bg-secondary)', borderBottom: '2px solid var(--border-color)' }}>
                        <th style={{ textAlign: 'left', padding: '1rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Número</th>
                        <th style={{ textAlign: 'left', padding: '1rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Cliente</th>
                        <th style={{ textAlign: 'center', padding: '1rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Monto</th>
                        <th style={{ textAlign: 'center', padding: '1rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Fecha</th>
                        <th style={{ textAlign: 'center', padding: '1rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mockInvoices.map((invoice) => (
                        <tr key={invoice.id} className="table-row-hover" style={{ borderBottom: '1px solid var(--border-color)' }}>
                          <td style={{ padding: '1rem', color: 'var(--text-primary)', fontWeight: '600' }}>
                            {invoice.number}
                          </td>
                          <td style={{ padding: '1rem', color: 'var(--text-primary)' }}>
                            {invoice.studentName}
                          </td>
                          <td style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-primary)', fontWeight: '600' }}>
                            {formatCurrency(invoice.amount)}
                          </td>
                          <td style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                            {invoice.date}
                          </td>
                          <td style={{ padding: '1rem', textAlign: 'center' }}>
                            <span style={{
                              padding: '0.25rem 0.75rem',
                              borderRadius: '12px',
                              fontSize: '0.75rem',
                              fontWeight: '600',
                              textTransform: 'uppercase',
                              width: '90px',
                              textAlign: 'center',
                              display: 'inline-block',
                              background: invoice.status === 'paid' ? 'var(--success-light)' : 
                                         invoice.status === 'sent' ? 'var(--info-light)' : 'var(--warning-light)',
                              color: invoice.status === 'paid' ? 'var(--success-dark)' : 
                                     invoice.status === 'sent' ? 'var(--info-dark)' : 'var(--warning-dark)'
                            }}>
                              {invoice.status === 'paid' ? 'Pagada' : 
                               invoice.status === 'sent' ? 'Enviada' : 'Pendiente'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

export default FinancialDashboard