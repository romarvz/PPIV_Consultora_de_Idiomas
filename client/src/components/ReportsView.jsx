import React, { useState, useEffect } from 'react'
import apiAdapter from '../services/apiAdapter'
import { FaFileExport, FaSpinner } from 'react-icons/fa'

const ReportsView = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState('academic')
  const [loading, setLoading] = useState(false)
  const [academicData, setAcademicData] = useState(null)
  const [financialData, setFinancialData] = useState(null)
  const [filters, setFilters] = useState({ search: '', nivel: '', estado: '' })
  const [financialFilters, setFinancialFilters] = useState({ search: '', paymentStatus: '', minAmount: '', maxAmount: '' })
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' })
  const [expandedRows, setExpandedRows] = useState(new Set())

  useEffect(() => {
    loadReports()
  }, [])

  const loadReports = async () => {
    setLoading(true)
    try {
      const response = await apiAdapter.classes.getAll()
      const [academicResponse, financialResponse] = await Promise.all([
        apiAdapter.reports.academic(),
        apiAdapter.reports.financial()
      ])
      
      setAcademicData(academicResponse.data.data)
      setFinancialData(financialResponse.data.data)
    } catch (error) {
      console.error('Error loading reports:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleExportCSV = () => {
    const reportType = activeTab === 'academic' ? 'Académico' : 'Financiero'
    alert(`Exportando Reporte ${reportType} a CSV...\n\nEsta funcionalidad está simulada. En producción, aquí se generaría y descargaría el archivo CSV.`)
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(amount)
  }

  const handleSort = (key) => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc'
    })
  }

  const getFilteredAndSortedData = (data) => {
    if (!data?.students) return []
    
    let filtered = data.students.filter(student => {
      const matchesSearch = !filters.search || 
        `${student.firstName} ${student.lastName}`.toLowerCase().includes(filters.search.toLowerCase())
      const matchesNivel = !filters.nivel || student.nivel === filters.nivel
      const matchesEstado = !filters.estado || 
        (filters.estado === 'excelente' && student.attendance >= 85) ||
        (filters.estado === 'bueno' && student.attendance >= 70 && student.attendance < 85) ||
        (filters.estado === 'necesita_apoyo' && student.attendance < 70)
      
      return matchesSearch && matchesNivel && matchesEstado
    })

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aValue = sortConfig.key === 'name' ? `${a.firstName} ${a.lastName}` : a[sortConfig.key]
        let bValue = sortConfig.key === 'name' ? `${b.firstName} ${b.lastName}` : b[sortConfig.key]
        
        if (typeof aValue === 'string') {
          aValue = aValue.toLowerCase()
          bValue = bValue.toLowerCase()
        }
        
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1
        return 0
      })
    }

    return filtered
  }

  const toggleExpandedRow = (studentId) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(studentId)) {
      newExpanded.delete(studentId)
    } else {
      newExpanded.add(studentId)
    }
    setExpandedRows(newExpanded)
  }

  const getFilteredAndSortedFinancialData = (data) => {
    if (!data?.topStudents) return []
    
    let filtered = data.topStudents.filter(student => {
      const matchesSearch = !financialFilters.search || 
        student.studentName.toLowerCase().includes(financialFilters.search.toLowerCase())
      const totalExpected = student.total + (student.pending || 0)
      const percentagePaid = totalExpected > 0 ? ((student.total / totalExpected) * 100) : 0
      const matchesPaymentStatus = !financialFilters.paymentStatus || 
        (financialFilters.paymentStatus === 'excellent' && percentagePaid >= 80) ||
        (financialFilters.paymentStatus === 'good' && percentagePaid >= 60 && percentagePaid < 80) ||
        (financialFilters.paymentStatus === 'fair' && percentagePaid >= 40 && percentagePaid < 60) ||
        (financialFilters.paymentStatus === 'poor' && percentagePaid < 40)
      const matchesMinAmount = !financialFilters.minAmount || student.total >= parseFloat(financialFilters.minAmount)
      const matchesMaxAmount = !financialFilters.maxAmount || student.total <= parseFloat(financialFilters.maxAmount)
      
      return matchesSearch && matchesPaymentStatus && matchesMinAmount && matchesMaxAmount
    })

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aValue, bValue
        if (sortConfig.key === 'studentName') {
          aValue = a.studentName.toLowerCase()
          bValue = b.studentName.toLowerCase()
        } else if (sortConfig.key === 'total') {
          aValue = a.total
          bValue = b.total
        } else if (sortConfig.key === 'pending') {
          aValue = a.pending || 0
          bValue = b.pending || 0
        } else if (sortConfig.key === 'percentage') {
          const totalExpectedA = a.total + (a.pending || 0)
          const totalExpectedB = b.total + (b.pending || 0)
          aValue = totalExpectedA > 0 ? ((a.total / totalExpectedA) * 100) : 0
          bValue = totalExpectedB > 0 ? ((b.total / totalExpectedB) * 100) : 0
        }
        
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1
        return 0
      })
    }

    return filtered
  }

  return (
    <div className="reports-container" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'var(--bg-secondary)',
      zIndex: 9999,
      overflow: 'auto',
      padding: '1.5rem'
    }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: 'var(--primary)', margin: 0 }}>
              Reportes
            </h1>
            <button
              onClick={onClose}
              className="cta-btn"
              style={{
                transform: 'none'
              }}
            >
              ← Volver al Dashboard
            </button>
          </div>
          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
            Visualiza y exporta reportes académicos y financieros
          </p>
        </div>

        {/* Tabs */}
        <div className="reports-card" style={{
          background: 'var(--card-bg)',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          marginBottom: '1.5rem',
          border: '1px solid var(--input-border)'
        }}>
          <div style={{ borderBottom: '1px solid #e5e7eb' }}>
            <div style={{ display: 'flex' }}>
              <button
                onClick={() => setActiveTab('academic')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '1rem 1.5rem',
                  fontWeight: '600',
                  fontSize: '1.1rem',
                  border: 'none',
                  background: activeTab === 'academic' ? 'var(--primary)' : 'transparent',
                  cursor: 'pointer',
                  borderBottom: activeTab === 'academic' ? '2px solid var(--primary)' : 'none',
                  color: activeTab === 'academic' ? 'white' : 'var(--text-secondary)',
                  transition: 'all 0.2s ease'
                }}
              >
                Reporte Académico
              </button>
              <button
                onClick={() => setActiveTab('financial')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '1rem 1.5rem',
                  fontWeight: '600',
                  fontSize: '1.1rem',
                  border: 'none',
                  background: activeTab === 'financial' ? 'var(--primary)' : 'transparent',
                  cursor: 'pointer',
                  borderBottom: activeTab === 'financial' ? '2px solid var(--primary)' : 'none',
                  color: activeTab === 'financial' ? 'white' : 'var(--text-secondary)',
                  transition: 'all 0.2s ease'
                }}
              >
                Reporte Financiero
              </button>
            </div>
          </div>

          {/* Export Button */}
          <div style={{
            padding: '1rem',
            background: 'var(--bg-secondary)',
            borderBottom: '1px solid var(--input-border)',
            display: 'flex',
            justifyContent: 'flex-end'
          }}>
            <button
              onClick={handleExportCSV}
              className="cta-btn"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                transform: 'none',
                padding: '0.5rem 1rem',
                fontSize: '0.8rem'
              }}
            >
              <FaFileExport size={14} />
              Exportar a CSV
            </button>
          </div>

          {/* Content */}
          <div style={{ padding: '1.5rem' }}>
            {loading ? (
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
                <p>Cargando reportes...</p>
              </div>
            ) : activeTab === 'academic' ? (
              <div>
                <h2 style={{
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  marginBottom: '1rem',
                  color: 'var(--text-primary)'
                }}>
                  Progreso Académico de Estudiantes
                </h2>

                {/* Filters */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '1rem',
                  marginBottom: '1rem',
                  padding: '1rem',
                  background: 'var(--bg-secondary)',
                  borderRadius: '8px'
                }}>
                  <input
                    type="text"
                    placeholder="Buscar estudiante..."
                    value={filters.search}
                    onChange={(e) => setFilters({...filters, search: e.target.value})}
                    style={{
                      padding: '0.5rem',
                      border: '1px solid var(--input-border)',
                      borderRadius: '6px',
                      fontSize: '0.875rem',
                      background: 'var(--input-bg)',
                      color: 'var(--text-primary)'
                    }}
                  />
                  <select
                    value={filters.nivel}
                    onChange={(e) => setFilters({...filters, nivel: e.target.value})}
                    style={{
                      padding: '0.5rem',
                      border: '1px solid var(--input-border)',
                      borderRadius: '6px',
                      fontSize: '0.875rem',
                      background: 'var(--input-bg)',
                      color: 'var(--text-primary)'
                    }}
                  >
                    <option value="">Todos los niveles</option>
                    <option value="A1">A1</option>
                    <option value="A2">A2</option>
                    <option value="B1">B1</option>
                    <option value="B2">B2</option>
                    <option value="C1">C1</option>
                    <option value="C2">C2</option>
                  </select>
                  <select
                    value={filters.estado}
                    onChange={(e) => setFilters({...filters, estado: e.target.value})}
                    style={{
                      padding: '0.5rem',
                      border: '1px solid var(--input-border)',
                      borderRadius: '6px',
                      fontSize: '0.875rem',
                      background: 'var(--input-bg)',
                      color: 'var(--text-primary)'
                    }}
                  >
                    <option value="">Todos los estados</option>
                    <option value="excelente">Excelente</option>
                    <option value="bueno">Bueno</option>
                    <option value="necesita_apoyo">Necesita apoyo</option>
                  </select>
                </div>
                
                {/* Academic Table */}
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', background: 'var(--card-bg)' }}>
                    <thead>
                      <tr style={{ background: '#f3f4f6' }}>
                        <th 
                          onClick={() => handleSort('name')}
                          style={{ 
                            textAlign: 'left', 
                            padding: '0.75rem', 
                            fontWeight: '600', 
                            color: 'var(--text-primary)',
                            cursor: 'pointer',
                            userSelect: 'none'
                          }}
                        >
                          Estudiante {sortConfig.key === 'name' ? (sortConfig.direction === 'asc' ? ' ↑' : ' ↓') : ' ⇅'}
                        </th>
                        <th 
                          onClick={() => handleSort('nivel')}
                          style={{ 
                            textAlign: 'center', 
                            padding: '0.75rem', 
                            fontWeight: '600', 
                            color: 'var(--text-primary)',
                            cursor: 'pointer',
                            userSelect: 'none'
                          }}
                        >
                          Nivel {sortConfig.key === 'nivel' ? (sortConfig.direction === 'asc' ? ' ↑' : ' ↓') : ' ⇅'}
                        </th>
                        <th 
                          onClick={() => handleSort('attendance')}
                          style={{ 
                            textAlign: 'center', 
                            padding: '0.75rem', 
                            fontWeight: '600', 
                            color: 'var(--text-primary)',
                            cursor: 'pointer',
                            userSelect: 'none'
                          }}
                        >
                          Progreso (%) {sortConfig.key === 'attendance' ? (sortConfig.direction === 'asc' ? ' ↑' : ' ↓') : ' ⇅'}
                        </th>
                        <th 
                          onClick={() => handleSort('attendance')}
                          style={{ 
                            textAlign: 'center', 
                            padding: '0.75rem', 
                            fontWeight: '600', 
                            color: 'var(--text-primary)',
                            cursor: 'pointer',
                            userSelect: 'none'
                          }}
                        >
                          Asistencia (%) {sortConfig.key === 'attendance' ? (sortConfig.direction === 'asc' ? ' ↑' : ' ↓') : ' ⇅'}
                        </th>
                        <th style={{ textAlign: 'center', padding: '0.75rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                          Estado
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {getFilteredAndSortedData(academicData)?.map((student, index) => (
                        <tr key={student._id} style={{ 
                          borderBottom: '1px solid #e5e7eb',
                          background: index % 2 === 0 ? 'white' : '#f9fafb'
                        }}>
                          <td style={{ padding: '0.75rem', color: 'var(--text-primary)' }}>
                            {student.firstName} {student.lastName}
                          </td>
                          <td style={{ padding: '0.75rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
                            {student.nivel}
                          </td>
                          <td style={{ padding: '0.75rem', textAlign: 'left' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <div style={{
                                flex: 1,
                                background: '#e5e7eb',
                                borderRadius: '9999px',
                                height: '8px',
                                maxWidth: '100px'
                              }}>
                                <div
                                  style={{
                                    background: 'var(--primary)',
                                    height: '8px',
                                    borderRadius: '9999px',
                                    width: `${student.attendance}%`
                                  }}
                                />
                              </div>
                              <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                {student.attendance}%
                              </span>
                            </div>
                          </td>
                          <td style={{ padding: '0.75rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
                            {student.attendance}%
                          </td>
                          <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                            <span style={{
                              display: 'inline-block',
                              width: '100px',
                              padding: '0.25rem 0.5rem',
                              borderRadius: '9999px',
                              fontSize: '0.75rem',
                              fontWeight: '500',
                              textAlign: 'center',
                              background: student.attendance >= 85 ? 'var(--success-light)' : 
                                         student.attendance >= 70 ? 'var(--warning-light)' : 'var(--error-light)',
                              color: student.attendance >= 85 ? 'var(--success-dark)' : 
                                     student.attendance >= 70 ? 'var(--warning-dark)' : 'var(--error-dark)'
                            }}>
                              {student.attendance >= 85 ? 'Excelente' : 
                               student.attendance >= 70 ? 'Bueno' : 'Necesita apoyo'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Summary Statistics */}
                <div style={{
                  marginTop: '1.5rem',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '1rem'
                }}>
                  <div style={{ background: 'var(--info-light)', padding: '1rem', borderRadius: '8px' }}>
                    <p style={{ fontSize: '0.875rem', color: 'var(--info)', fontWeight: '500', margin: 0 }}>
                      Promedio General
                    </p>
                    <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--info-dark)', margin: '0.25rem 0 0 0' }}>
                      {academicData?.averageAttendance || 0}%
                    </p>
                  </div>
                  <div style={{ background: 'var(--success-light)', padding: '1rem', borderRadius: '8px' }}>
                    <p style={{ fontSize: '0.875rem', color: 'var(--success)', fontWeight: '500', margin: 0 }}>
                      Asistencia Promedio
                    </p>
                    <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--success-dark)', margin: '0.25rem 0 0 0' }}>
                      {academicData?.averageAttendance || 0}%
                    </p>
                  </div>
                  <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--input-border)' }}>
                    <p style={{ fontSize: '0.875rem', color: 'var(--primary)', fontWeight: '500', margin: 0 }}>
                      Total Estudiantes
                    </p>
                    <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary)', margin: '0.25rem 0 0 0' }}>
                      {academicData?.total || 0}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <h2 style={{
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  marginBottom: '1rem',
                  color: 'var(--text-primary)'
                }}>
                  Reporte Financiero
                </h2>

                {/* Financial Summary Cards */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                  gap: '1rem',
                  marginBottom: '1.5rem'
                }}>
                  <div style={{
                    background: 'linear-gradient(135deg, #16a34a, #15803d)',
                    padding: '1.5rem',
                    borderRadius: '8px',
                    color: 'white'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <p style={{ color: 'rgba(255,255,255,0.8)', margin: 0 }}>Ingresos Totales</p>
                    </div>
                    <p style={{ fontSize: '1.875rem', fontWeight: 'bold', margin: 0 }}>
                      {formatCurrency(financialData?.totalIncome || 0)}
                    </p>
                  </div>
                  <div style={{
                    background: 'linear-gradient(135deg, #ea580c, #dc2626)',
                    padding: '1.5rem',
                    borderRadius: '8px',
                    color: 'white'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <p style={{ color: 'rgba(255,255,255,0.8)', margin: 0 }}>Pagos Pendientes</p>
                    </div>
                    <p style={{ fontSize: '1.875rem', fontWeight: 'bold', margin: 0 }}>
                      {formatCurrency(financialData?.pendingIncome || 0)}
                    </p>
                  </div>
                  <div style={{
                    background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                    padding: '1.5rem',
                    borderRadius: '8px',
                    color: 'white'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <p style={{ color: 'rgba(255,255,255,0.8)', margin: 0 }}>Tasa de Pago</p>
                    </div>
                    <p style={{ fontSize: '1.875rem', fontWeight: 'bold', margin: 0 }}>
                      {((financialData?.totalIncome || 0) / ((financialData?.totalIncome || 0) + (financialData?.pendingIncome || 0)) * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>

                {/* Financial Filters */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '1rem',
                  marginBottom: '1rem',
                  padding: '1rem',
                  background: 'var(--bg-secondary)',
                  borderRadius: '8px'
                }}>
                  <input
                    type="text"
                    placeholder="Buscar estudiante..."
                    value={financialFilters.search}
                    onChange={(e) => setFinancialFilters({...financialFilters, search: e.target.value})}
                    style={{
                      padding: '0.5rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '0.875rem'
                    }}
                  />
                  <select
                    value={financialFilters.paymentStatus}
                    onChange={(e) => setFinancialFilters({...financialFilters, paymentStatus: e.target.value})}
                    style={{
                      padding: '0.5rem',
                      border: '1px solid var(--input-border)',
                      borderRadius: '6px',
                      fontSize: '0.875rem',
                      background: 'var(--input-bg)',
                      color: 'var(--text-primary)'
                    }}
                  >
                    <option value="">Todos los estados</option>
                    <option value="excellent">Excelente (80-100%)</option>
                    <option value="good">Bueno (60-79%)</option>
                    <option value="fair">Regular (40-59%)</option>
                    <option value="poor">Malo (0-39%)</option>
                  </select>
                  <input
                    type="number"
                    placeholder="Monto mínimo"
                    value={financialFilters.minAmount}
                    onChange={(e) => setFinancialFilters({...financialFilters, minAmount: e.target.value})}
                    style={{
                      padding: '0.5rem',
                      border: '1px solid var(--input-border)',
                      borderRadius: '6px',
                      fontSize: '0.875rem',
                      background: 'var(--input-bg)',
                      color: 'var(--text-primary)'
                    }}
                  />
                  <input
                    type="number"
                    placeholder="Monto máximo"
                    value={financialFilters.maxAmount}
                    onChange={(e) => setFinancialFilters({...financialFilters, maxAmount: e.target.value})}
                    style={{
                      padding: '0.5rem',
                      border: '1px solid var(--input-border)',
                      borderRadius: '6px',
                      fontSize: '0.875rem',
                      background: 'var(--input-bg)',
                      color: 'var(--text-primary)'
                    }}
                  />
                </div>

                {/* Top Students Table */}
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: '#f3f4f6' }}>
                        <th 
                          onClick={() => handleSort('studentName')}
                          style={{ 
                            textAlign: 'left', 
                            padding: '0.75rem', 
                            fontWeight: '600', 
                            color: 'var(--text-primary)',
                            cursor: 'pointer',
                            userSelect: 'none'
                          }}
                        >
                          Estudiante {sortConfig.key === 'studentName' ? (sortConfig.direction === 'asc' ? ' ↑' : ' ↓') : ' ⇅'}
                        </th>
                        <th 
                          onClick={() => handleSort('total')}
                          style={{ 
                            textAlign: 'center', 
                            padding: '0.75rem', 
                            fontWeight: '600', 
                            color: 'var(--text-primary)',
                            cursor: 'pointer',
                            userSelect: 'none'
                          }}
                        >
                          Total Pagado {sortConfig.key === 'total' ? (sortConfig.direction === 'asc' ? ' ↑' : ' ↓') : ' ⇅'}
                        </th>
                        <th 
                          onClick={() => handleSort('pending')}
                          style={{ 
                            textAlign: 'center', 
                            padding: '0.75rem', 
                            fontWeight: '600', 
                            color: 'var(--text-primary)',
                            cursor: 'pointer',
                            userSelect: 'none'
                          }}
                        >
                          Adeuda {sortConfig.key === 'pending' ? (sortConfig.direction === 'asc' ? ' ↑' : ' ↓') : ' ⇅'}
                        </th>
                        <th 
                          onClick={() => handleSort('percentage')}
                          style={{ 
                            textAlign: 'center', 
                            padding: '0.75rem', 
                            fontWeight: '600', 
                            color: 'var(--text-primary)',
                            cursor: 'pointer',
                            userSelect: 'none'
                          }}
                        >
                          Porcentaje Cobrado {sortConfig.key === 'percentage' ? (sortConfig.direction === 'asc' ? ' ↑' : ' ↓') : ' ⇅'}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {getFilteredAndSortedFinancialData(financialData)?.map((student, index) => {
                        const totalExpected = student.total + (student.pending || 0)
                        const percentagePaid = totalExpected > 0 ? ((student.total / totalExpected) * 100).toFixed(1) : 0
                        const isExpanded = expandedRows.has(student.id || index)
                        
                        return (
                          <React.Fragment key={student.id || index}>
                            <tr 
                              onClick={() => toggleExpandedRow(student.id || index)}
                              style={{ 
                                borderBottom: '1px solid var(--input-border)',
                                background: index % 2 === 0 ? 'var(--card-bg)' : 'var(--bg-secondary)',
                                cursor: 'pointer'
                              }}
                            >
                              <td style={{ padding: '0.75rem', color: 'var(--text-primary)', fontWeight: '500' }}>
                                <span style={{ marginRight: '0.5rem' }}>
                                  {isExpanded ? '▼' : '▶'}
                                </span>
                                {student.studentName}
                              </td>
                              <td style={{ padding: '0.75rem', color: 'var(--success)', fontWeight: '600', textAlign: 'center' }}>
                                {formatCurrency(student.total)}
                              </td>
                              <td style={{ padding: '0.75rem', color: 'var(--error)', fontWeight: '600', textAlign: 'center' }}>
                                {formatCurrency(student.pending || 0)}
                              </td>
                              <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                                <span style={{
                                  display: 'inline-block',
                                  padding: '0.25rem 0.75rem',
                                  borderRadius: '9999px',
                                  fontSize: '0.75rem',
                                  fontWeight: '600',
                                  textAlign: 'center',
                                  background: percentagePaid >= 80 ? 'var(--success-light)' : 
                                             percentagePaid >= 60 ? 'var(--warning-light)' : 
                                             percentagePaid >= 40 ? '#fed7aa' : 'var(--error-light)',
                                  color: percentagePaid >= 80 ? 'var(--success-dark)' : 
                                         percentagePaid >= 60 ? 'var(--warning-dark)' : 
                                         percentagePaid >= 40 ? '#c2410c' : 'var(--error-dark)'
                                }}>
                                  {percentagePaid}%
                                </span>
                              </td>
                            </tr>
                            {isExpanded && (
                              <tr style={{ background: 'var(--bg-secondary)' }}>
                                <td colSpan="4" style={{ padding: '1rem' }}>
                                  <div style={{ marginLeft: '1rem' }}>
                                    <h4 style={{ margin: '0 0 0.75rem 0', color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                                      Detalle Mensual
                                    </h4>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                                      <thead>
                                        <tr style={{ background: 'var(--input-bg)' }}>
                                          <th style={{ textAlign: 'left', padding: '0.5rem', fontWeight: '600' }}>Mes</th>
                                          <th style={{ textAlign: 'center', padding: '0.5rem', fontWeight: '600' }}>Total Esperado</th>
                                          <th style={{ textAlign: 'center', padding: '0.5rem', fontWeight: '600' }}>Total Ingresado</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {student.monthlyDetails?.map((month, idx) => {
                                          const isPaid = month.received >= month.expected
                                          const isPartiallyPaid = month.received > 0 && month.received < month.expected
                                          const isUnpaid = month.received === 0
                                          
                                          return (
                                            <tr key={idx} style={{ 
                                              borderBottom: '1px solid var(--input-border)',
                                              background: isPaid ? 'var(--info-light)' : isPartiallyPaid ? 'var(--warning-light)' : isUnpaid ? 'var(--error-light)' : 'var(--card-bg)'
                                            }}>
                                              <td style={{ padding: '0.5rem' }}>{month.month}</td>
                                              <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                                                {formatCurrency(month.expected)}
                                              </td>
                                              <td style={{ 
                                                padding: '0.5rem', 
                                                textAlign: 'center',
                                                color: isPaid ? 'var(--success-dark)' : isPartiallyPaid ? 'var(--warning-dark)' : isUnpaid ? 'var(--error-dark)' : 'inherit',
                                                fontWeight: isPaid ? '600' : isUnpaid ? '600' : 'normal'
                                              }}>
                                                {formatCurrency(month.received)}
                                              </td>
                                            </tr>
                                          )
                                        }) || (
                                          <tr>
                                            <td colSpan="3" style={{ padding: '0.5rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                              No hay datos mensuales disponibles
                                            </td>
                                          </tr>
                                        )}
                                      </tbody>
                                    </table>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ReportsView