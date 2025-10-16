import React, { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth.jsx'
import AuthNavbar from '../../components/common/AuthNavbar'
import { mockPayments as mockPaymentsData, mockPaymentMethods, mockTeachers } from '../../services/mockData'
import { 
  FaSpinner,
  FaPlus,
  FaEdit,
  FaTrash
} from 'react-icons/fa'
import '../../styles/variables.css'
import '../../styles/auth.css'
import '../../styles/charts.css'

const FinancialDashboard = () => {
  const { user, logout } = useAuth()
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('charges')
  const [charges, setCharges] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('Todos')
  const [showChargeModal, setShowChargeModal] = useState(false)
  const [chargeForm, setChargeForm] = useState({
    studentName: '',
    amount: '',
    date: new Date().toISOString().slice(0, 10),
    concept: '',
    method: mockPaymentMethods?.[0] || 'Efectivo'
  })
  // Teachers payments (Pagos)
  const [teacherPayments, setTeacherPayments] = useState([])
  const [searchTeacher, setSearchTeacher] = useState('')
  const [showTeacherPaymentModal, setShowTeacherPaymentModal] = useState(false)
  const [teacherPaymentForm, setTeacherPaymentForm] = useState({
    teacherId: '',
    amount: '',
    date: new Date().toISOString().slice(0, 10),
    concept: '',
    method: mockPaymentMethods?.[0] || 'Transferencia'
  })

  // Initialize with mock data since backend will be developed later
  useEffect(() => {
    setLoading(true)
    // Simulate API call delay
    setTimeout(() => setLoading(false), 500)
  }, [])

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

  // Initialize charges from mock data
  useEffect(() => {
    const mockCharges = (mockPaymentsData || []).map((p, idx) => ({
      id: p._id || idx,
      studentName: p.studentName,
      amount: p.amount,
      status: p.status,
      date: p.date,
      method: p.paymentMethod || '—',
      concept: p.concept || '—'
    }))
    setCharges(mockCharges)
  }, [])

  // initialize teacher payments from mock teachers
  useEffect(() => {
    const defaults = (mockTeachers || []).slice(0, 3).map((t, idx) => ({
      id: `tp-${idx + 1}`,
      teacherId: t._id,
      teacherName: `${t.firstName} ${t.lastName}`,
      concept: idx === 0 ? 'Adelanto Octubre 2025' : 'Pago de horas de Septiembre 2025',
      amount: idx === 0 ? 25000 : idx === 1 ? 82000 : 75000,
      date: idx === 0 ? '2025-10-15' : idx === 1 ? '2025-10-06' : '2025-10-05',
      method: idx === 0 ? 'Efectivo' : 'Transferencia'
    }))
    if (defaults.length > 0 && teacherPayments.length === 0) {
      setTeacherPayments(defaults)
      setTeacherPaymentForm(fp => ({ ...fp, teacherId: defaults[0].teacherId }))
    }
  }, [])

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

  const filteredCharges = charges.filter((c) => {
    const matchesSearch = !searchTerm || (c.studentName || '').toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'Todos' || c.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleOpenChargeModal = () => setShowChargeModal(true)
  const handleCloseChargeModal = () => setShowChargeModal(false)

  const handleRegisterCharge = (e) => {
    e.preventDefault()
    const newCharge = {
      id: Date.now(),
      studentName: chargeForm.studentName || '—',
      amount: Number(chargeForm.amount) || 0,
      status: 'pendiente',
      date: chargeForm.date,
      method: chargeForm.method,
      concept: chargeForm.concept || '—'
    }
    setCharges([newCharge, ...charges])
    setChargeForm({
      studentName: '',
      amount: '',
      date: new Date().toISOString().slice(0, 10),
      concept: '',
      method: mockPaymentMethods?.[0] || 'Efectivo'
    })
    setShowChargeModal(false)
  }

  const handleDeleteCharge = (id) => {
    if (window.confirm('¿Eliminar este cobro?')) {
      setCharges(charges.filter(c => c.id !== id))
    }
  }

  // Teacher payments handlers
  const handleOpenTeacherPaymentModal = () => setShowTeacherPaymentModal(true)
  const handleCloseTeacherPaymentModal = () => setShowTeacherPaymentModal(false)
  const handleRegisterTeacherPayment = (e) => {
    e.preventDefault()
    const teacher = (mockTeachers || []).find(t => t._id === teacherPaymentForm.teacherId)
    const newPayment = {
      id: Date.now().toString(),
      teacherId: teacherPaymentForm.teacherId,
      teacherName: teacher ? `${teacher.firstName} ${teacher.lastName}` : '—',
      concept: teacherPaymentForm.concept || '—',
      amount: Number(teacherPaymentForm.amount) || 0,
      date: teacherPaymentForm.date,
      method: teacherPaymentForm.method
    }
    setTeacherPayments([newPayment, ...teacherPayments])
    setShowTeacherPaymentModal(false)
    setTeacherPaymentForm({
      teacherId: teacher ? teacher._id : '',
      amount: '',
      date: new Date().toISOString().slice(0, 10),
      concept: '',
      method: mockPaymentMethods?.[0] || 'Transferencia'
    })
  }
  const handleDeleteTeacherPayment = (id) => {
    if (window.confirm('¿Eliminar este pago?')) {
      setTeacherPayments(teacherPayments.filter(p => p.id !== id))
    }
  }

  // Common modal styles
  const modalOverlayStyle = {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  }
  const modalContentStyle = {
    width: 'min(95vw, 640px)',
    background: 'var(--card-bg)',
    borderRadius: '12px',
    boxShadow: 'var(--shadow-lg)',
    padding: '1.5rem'
  }
  const inputStyle = {
    width: '100%',
    padding: '0.75rem',
    border: '1px solid var(--input-border)',
    borderRadius: '6px',
    background: 'var(--input-bg)',
    color: 'var(--text-primary)'
  }
  const selectStyle = { ...inputStyle, height: '44px' }
  const buttonStyle = {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '0.75rem',
    marginTop: '1.25rem'
  }

  return (
    <section className="section visible">
      <div className="container dashboard-container">
        <AuthNavbar user={user} onLogout={handleLogout} showBackButton={true} />

        {/* Header */}
        <div className="dashboard-section">
          <h3 className="dashboard-section__title">Gestión Financiera</h3>
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
                onClick={() => setActiveTab('charges')}
                style={{
                  padding: '1rem 1.5rem',
                  fontWeight: '600',
                  fontSize: '1rem',
                  border: 'none',
                  background: activeTab === 'charges' ? 'var(--primary)' : 'transparent',
                  cursor: 'pointer',
                  color: activeTab === 'charges' ? 'white' : 'var(--text-secondary)',
                  transition: 'all 0.2s ease'
                }}
              >
                Cobros
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
              <button
                onClick={() => setActiveTab('reports')}
                style={{
                  padding: '1rem 1.5rem',
                  fontWeight: '600',
                  fontSize: '1rem',
                  border: 'none',
                  background: activeTab === 'reports' ? 'var(--primary)' : 'transparent',
                  cursor: 'pointer',
                  color: activeTab === 'reports' ? 'white' : 'var(--text-secondary)',
                  transition: 'all 0.2s ease'
                }}
              >
                Reportes
              </button>
            </div>
          </div>

          <div style={{ padding: '1.5rem' }}>
            {activeTab === 'charges' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h4 style={{ color: 'var(--text-primary)', margin: 0 }}>Cobros</h4>
                  <button 
                    className="cta-btn"
                    style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}
                    onClick={handleOpenChargeModal}
                  >
                    <FaPlus style={{ marginRight: '0.5rem' }} />
                    Registrar Nuevo Cobro
                  </button>
                </div>

                {/* Filters */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '1rem',
                  marginBottom: '1rem',
                  padding: '1rem',
                  background: 'var(--bg-secondary)',
                  borderRadius: '8px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ color: 'var(--text-secondary)', minWidth: '160px' }}>Buscar por Estudiante:</span>
                    <input
                      type="text"
                      placeholder="Nombre del estudiante..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      style={{
                        flex: 1,
                        padding: '0.5rem',
                        border: '1px solid var(--input-border)',
                        borderRadius: '6px',
                        background: 'var(--input-bg)',
                        color: 'var(--text-primary)'
                      }}
                    />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ color: 'var(--text-secondary)', minWidth: '140px' }}>Filtrar por Estado:</span>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      style={{
                        padding: '0.5rem',
                        border: '1px solid var(--input-border)',
                        borderRadius: '6px',
                        background: 'var(--input-bg)',
                        color: 'var(--text-primary)',
                        minWidth: '160px'
                      }}
                    >
                      <option value="Todos">Todos</option>
                      <option value="pendiente">Pendiente</option>
                      <option value="vencido">Vencido</option>
                      <option value="pagado">Pagado</option>
                    </select>
                  </div>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', minWidth: '900px', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: 'var(--bg-secondary)', borderBottom: '2px solid var(--border-color)' }}>
                        <th style={{ textAlign: 'left', padding: '1rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Estudiante</th>
                        <th style={{ textAlign: 'left', padding: '1rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Concepto</th>
                        <th style={{ textAlign: 'center', padding: '1rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Monto</th>
                        <th style={{ textAlign: 'center', padding: '1rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Método</th>
                        <th style={{ textAlign: 'center', padding: '1rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Fecha</th>
                        <th style={{ textAlign: 'center', padding: '1rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Estado</th>
                        <th style={{ textAlign: 'center', padding: '1rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCharges.map((payment) => (
                        <tr key={payment.id} className="table-row-hover" style={{ borderBottom: '1px solid var(--border-color)' }}>
                          <td style={{ padding: '1rem', color: 'var(--text-primary)', fontWeight: '500' }}>
                            {payment.studentName}
                          </td>
                          <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>
                            {payment.concept || '—'}
                          </td>
                          <td style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-primary)', fontWeight: '600' }}>
                            {formatCurrency(payment.amount)}
                          </td>
                          <td style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                            {payment.method || '—'}
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
                              background: payment.status === 'pagado' ? 'var(--success-light)' : payment.status === 'pendiente' ? 'var(--warning-light)' : 'var(--error-light)',
                              color: payment.status === 'pagado' ? 'var(--success-dark)' : payment.status === 'pendiente' ? 'var(--warning-dark)' : 'var(--error-dark)'
                            }}>
                              {payment.status === 'pagado' ? 'Pagado' : payment.status === 'pendiente' ? 'Pendiente' : 'Vencido'}
                            </span>
                          </td>
                          <td style={{ padding: '1rem', textAlign: 'center' }}>
                            <button
                              title="Editar"
                              style={{
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                color: 'var(--text-secondary)',
                                marginRight: '0.5rem'
                              }}
                              onClick={() => alert('Edición de cobros en desarrollo.')}
                            >
                              <FaEdit />
                            </button>
                            <button
                              title="Eliminar"
                              style={{
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                color: 'var(--error)'
                              }}
                              onClick={() => handleDeleteCharge(payment.id)}
                            >
                              <FaTrash />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Register Charge Modal */}
                {showChargeModal && (
                  <div style={modalOverlayStyle}>
                    <div style={modalContentStyle}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>Registrar Nuevo Cobro</h3>
                        <button onClick={handleCloseChargeModal} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.25rem', color: 'var(--text-secondary)' }}>×</button>
                      </div>
                      <form onSubmit={handleRegisterCharge}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                          <div style={{ gridColumn: '1 / -1' }}>
                            <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>Estudiante</label>
                            <input
                              type="text"
                              placeholder="Escriba para buscar un estudiante..."
                              value={chargeForm.studentName}
                              onChange={(e) => setChargeForm({ ...chargeForm, studentName: e.target.value })}
                              style={inputStyle}
                            />
                          </div>
                          <div>
                            <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>Monto</label>
                            <input
                              type="number"
                              placeholder="Ej: 15000"
                              value={chargeForm.amount}
                              onChange={(e) => setChargeForm({ ...chargeForm, amount: e.target.value })}
                              style={inputStyle}
                              required
                            />
                          </div>
                          <div>
                            <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>Fecha</label>
                            <input
                              type="date"
                              value={chargeForm.date}
                              onChange={(e) => setChargeForm({ ...chargeForm, date: e.target.value })}
                              style={inputStyle}
                              required
                            />
                          </div>
                          <div style={{ gridColumn: '1 / -1' }}>
                            <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>Concepto</label>
                            <input
                              type="text"
                              placeholder="Ej: Cuota mensual, Matrícula, etc."
                              value={chargeForm.concept}
                              onChange={(e) => setChargeForm({ ...chargeForm, concept: e.target.value })}
                              style={inputStyle}
                            />
                          </div>
                          <div style={{ gridColumn: '1 / -1' }}>
                            <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>Medio de Pago</label>
                            <select
                              value={chargeForm.method}
                              onChange={(e) => setChargeForm({ ...chargeForm, method: e.target.value })}
                              style={selectStyle}
                            >
                              {(mockPaymentMethods || ['Efectivo','Transferencia','Tarjeta','Mercado Pago']).map((m) => (
                                <option key={m} value={m}>{m}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                        <div style={buttonStyle}>
                          <button type="button" onClick={handleCloseChargeModal} style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.95rem' }}>Cancelar</button>
                          <button type="submit" className="cta-btn" style={{ padding: '0.5rem 1rem', fontSize: '0.95rem' }}>Registrar</button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'payments' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h4 style={{ color: 'var(--text-primary)', margin: 0 }}>Pagos a Profesores</h4>
                  <button 
                    className="cta-btn"
                    style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}
                    onClick={handleOpenTeacherPaymentModal}
                  >
                    <FaPlus style={{ marginRight: '0.5rem' }} />
                    Registrar Nuevo Pago
                  </button>
                </div>
                {/* Search */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr',
                  gap: '1rem',
                  marginBottom: '1rem',
                  padding: '1rem',
                  background: 'var(--bg-secondary)',
                  borderRadius: '8px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ color: 'var(--text-secondary)', minWidth: '160px' }}>Buscar por Profesor:</span>
                    <input
                      type="text"
                      placeholder="Nombre del profesor..."
                      value={searchTeacher}
                      onChange={(e) => setSearchTeacher(e.target.value)}
                      style={{
                        flex: 1,
                        padding: '0.5rem',
                        border: '1px solid var(--input-border)',
                        borderRadius: '6px',
                        background: 'var(--input-bg)',
                        color: 'var(--text-primary)'
                      }}
                    />
                  </div>
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', minWidth: '900px', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: 'var(--bg-secondary)', borderBottom: '2px solid var(--border-color)' }}>
                        <th style={{ textAlign: 'left', padding: '1rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Profesor</th>
                        <th style={{ textAlign: 'left', padding: '1rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Concepto</th>
                        <th style={{ textAlign: 'center', padding: '1rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Monto</th>
                        <th style={{ textAlign: 'center', padding: '1rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Fecha de Pago</th>
                        <th style={{ textAlign: 'center', padding: '1rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Método</th>
                        <th style={{ textAlign: 'center', padding: '1rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {teacherPayments
                        .filter(p => !searchTeacher || (p.teacherName || '').toLowerCase().includes(searchTeacher.toLowerCase()))
                        .map((p) => (
                        <tr key={p.id} className="table-row-hover" style={{ borderBottom: '1px solid var(--border-color)' }}>
                          <td style={{ padding: '1rem', color: 'var(--text-primary)', fontWeight: '500' }}>
                            {p.teacherName}
                          </td>
                          <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>
                            {p.concept}
                          </td>
                          <td style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-primary)', fontWeight: '600' }}>
                            {formatCurrency(p.amount)}
                          </td>
                          <td style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                            {p.date}
                          </td>
                          <td style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                            {p.method}
                          </td>
                          <td style={{ padding: '1rem', textAlign: 'center' }}>
                            <button
                              title="Editar"
                              style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', marginRight: '0.5rem' }}
                              onClick={() => alert('Edición de pagos en desarrollo.')}
                            >
                              <FaEdit />
                            </button>
                            <button
                              title="Eliminar"
                              style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--error)' }}
                              onClick={() => handleDeleteTeacherPayment(p.id)}
                            >
                              <FaTrash />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Register Teacher Payment Modal */}
                {showTeacherPaymentModal && (
                  <div style={modalOverlayStyle}>
                    <div style={modalContentStyle}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>Registrar Pago a Profesor</h3>
                        <button onClick={handleCloseTeacherPaymentModal} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.25rem', color: 'var(--text-secondary)' }}>×</button>
                      </div>
                      <form onSubmit={handleRegisterTeacherPayment}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                          <div style={{ gridColumn: '1 / -1' }}>
                            <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>Profesor</label>
                            <select
                              value={teacherPaymentForm.teacherId}
                              onChange={(e) => setTeacherPaymentForm({ ...teacherPaymentForm, teacherId: e.target.value })}
                              style={selectStyle}
                            >
                              {(mockTeachers || []).map(t => (
                                <option key={t._id} value={t._id}>{t.firstName} {t.lastName}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>Monto</label>
                            <input
                              type="number"
                              placeholder="Ej: 25000"
                              value={teacherPaymentForm.amount}
                              onChange={(e) => setTeacherPaymentForm({ ...teacherPaymentForm, amount: e.target.value })}
                              style={inputStyle}
                              required
                            />
                          </div>
                          <div>
                            <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>Fecha de Pago</label>
                            <input
                              type="date"
                              value={teacherPaymentForm.date}
                              onChange={(e) => setTeacherPaymentForm({ ...teacherPaymentForm, date: e.target.value })}
                              style={inputStyle}
                              required
                            />
                          </div>
                          <div style={{ gridColumn: '1 / -1' }}>
                            <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>Concepto</label>
                            <input
                              type="text"
                              placeholder="Ej: Pago de horas de Octubre"
                              value={teacherPaymentForm.concept}
                              onChange={(e) => setTeacherPaymentForm({ ...teacherPaymentForm, concept: e.target.value })}
                              style={inputStyle}
                            />
                          </div>
                          <div style={{ gridColumn: '1 / -1' }}>
                            <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>Método de Pago</label>
                            <select
                              value={teacherPaymentForm.method}
                              onChange={(e) => setTeacherPaymentForm({ ...teacherPaymentForm, method: e.target.value })}
                              style={selectStyle}
                            >
                              {(mockPaymentMethods || ['Efectivo','Transferencia','Tarjeta','Mercado Pago']).map((m) => (
                                <option key={m} value={m}>{m}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                        <div style={buttonStyle}>
                          <button type="button" onClick={handleCloseTeacherPaymentModal} style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.95rem' }}>Cancelar</button>
                          <button type="submit" className="cta-btn" style={{ padding: '0.5rem 1rem', fontSize: '0.95rem' }}>Registrar Pago</button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'invoices' && (
              <div>
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                  <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Facturación</h4>
                  <p>Sección en desarrollo. Próximamente podrás generar y gestionar comprobantes.</p>
                </div>
              </div>
            )}

            {activeTab === 'reports' && (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Reportes</h4>
                <p>Sección en desarrollo. Próximamente verás reportes financieros aquí.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

export default FinancialDashboard