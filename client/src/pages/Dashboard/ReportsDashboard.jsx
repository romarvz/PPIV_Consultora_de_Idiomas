import React, { useState, useEffect } from 'react'
import apiAdapter from '../../services/apiAdapter'
import api from '../../services/api'
import { FaFileExport, FaSpinner, FaFilePdf, FaFileExcel } from 'react-icons/fa'

const ReportsDashboard = ({ onClose }) => {
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

  const handleExportPDF = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      
      if (activeTab === 'academic') {
        const reportId = academicData?.students?.[0]?._id
        if (!reportId) {
          alert('No hay reportes académicos disponibles para exportar. Por favor, genere un reporte primero.')
          return
        }
        
        const response = await fetch(`http://localhost:5000/api/reportes-academicos/${reportId}/exportar-pdf`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || `Error ${response.status}: No se pudo exportar el reporte`)
        }
        
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `reporte-academico-${reportId}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        const periodo = '2025-Q1'
        const response = await fetch(`http://localhost:5000/api/reportes-financieros/periodo/${periodo}/exportar-pdf`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || `Error ${response.status}: No se pudo exportar el reporte`)
        }
        
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `reporte-financiero-${periodo}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error('Error exporting PDF:', error)
      alert('Error al exportar PDF:\n' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleExportExcel = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      
      if (activeTab === 'academic') {
        const reportId = academicData?.students?.[0]?._id
        if (!reportId) {
          alert('No hay reportes académicos disponibles para exportar. Por favor, genere un reporte primero.')
          return
        }
        
        const response = await fetch(`http://localhost:5000/api/reportes-academicos/${reportId}/exportar-excel`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || `Error ${response.status}: No se pudo exportar el reporte`)
        }
        
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `reporte-academico-${reportId}.xlsx`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        const periodo = '2025-Q1'
        const response = await fetch(`http://localhost:5000/api/reportes-financieros/periodo/${periodo}/exportar-excel`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || `Error ${response.status}: No se pudo exportar el reporte`)
        }
        
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `reporte-financiero-${periodo}.xlsx`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error('Error exporting Excel:', error)
      alert('Error al exportar Excel:\n' + error.message)
    } finally {
      setLoading(false)
    }
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
    <div>
      {/* Header */}
      <div className="dashboard-section">
        <h3 className="dashboard-section__title">Reportes</h3>
      </div>

      {/* Tabs */}
      <div style={{
        background: 'var(--card-bg)',
        borderRadius: '12px',
        boxShadow: 'var(--shadow-md)',
        overflow: 'hidden'
      }}>
        <div style={{ borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex' }}>
            <button
              onClick={() => setActiveTab('academic')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '1rem 1.5rem',
                fontWeight: '600',
                fontSize: '1rem',
                border: 'none',
                background: activeTab === 'academic' ? 'var(--primary)' : 'transparent',
                cursor: 'pointer',
                color: activeTab === 'academic' ? 'white' : 'var(--text-secondary)',
                transition: 'all 0.2s ease',
                minWidth: '200px'
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
                fontSize: '1rem',
                border: 'none',
                background: activeTab === 'financial' ? 'var(--primary)' : 'transparent',
                cursor: 'pointer',
                color: activeTab === 'financial' ? 'white' : 'var(--text-secondary)',
                transition: 'all 0.2s ease',
                minWidth: '200px'
              }}
            >
              Reporte Financiero
            </button>
          </div>
        </div>

        {/* Export Buttons */}
        <div style={{
          padding: '1rem',
          background: 'var(--bg-secondary)',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '0.75rem'
        }}>
          <button
            onClick={handleExportPDF}
            disabled={loading}
            style={{
              background: '#dc2626',
              color: 'white',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '6px',
              fontSize: '0.9rem',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.3s ease',
              opacity: loading ? 0.6 : 1
            }}
          >
            <FaFilePdf /> Exportar PDF
          </button>
          <button
            onClick={handleExportExcel}
            disabled={loading}
            style={{
              background: '#16a34a',
              color: 'white',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '6px',
              fontSize: '0.9rem',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.3s ease',
              opacity: loading ? 0.6 : 1
            }}
          >
            <FaFileExcel /> Exportar Excel
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

                {/* Academic Performance Chart */}
                <div style={{ background: 'var(--card-bg)', padding: '1.5rem', borderRadius: '12px', boxShadow: 'var(--shadow-md)', marginBottom: '2rem' }}>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'center' }}>
                    {/* Progress Ring Chart */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div style={{ position: 'relative', width: '120px', height: '120px' }}>
                        <svg width="120" height="120" style={{ transform: 'rotate(-90deg)' }}>
                          <circle cx="60" cy="60" r="50" fill="none" stroke="var(--border-color)" strokeWidth="8" />
                          <circle 
                            cx="60" 
                            cy="60" 
                            r="50" 
                            fill="none" 
                            stroke="#27ae60" 
                            strokeWidth="8"
                            strokeDasharray={`${(academicData?.averageAttendance || 0) * 3.14} 314`}
                            strokeLinecap="round"
                          />
                        </svg>
                        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                          <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-primary)' }}>{academicData?.averageAttendance || 0}%</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Promedio</div>
                        </div>
                      </div>
                    </div>
                    {/* Performance Distribution */}
                    <div>
                      <div style={{ marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                          <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>Excelente (85%+)</span>
                          <span style={{ fontSize: '0.9rem', fontWeight: '600', color: '#27ae60' }}>{academicData?.students?.filter(s => s.attendance >= 85).length || 0}</span>
                        </div>
                        <div style={{ width: '100%', height: '8px', background: 'var(--border-color)', borderRadius: '4px' }}>
                          <div style={{ width: `${((academicData?.students?.filter(s => s.attendance >= 85).length || 0) / (academicData?.total || 1)) * 100}%`, height: '8px', background: '#27ae60', borderRadius: '4px' }} />
                        </div>
                      </div>
                      <div style={{ marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                          <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>Bueno (70-84%)</span>
                          <span style={{ fontSize: '0.9rem', fontWeight: '600', color: '#f39c12' }}>{academicData?.students?.filter(s => s.attendance >= 70 && s.attendance < 85).length || 0}</span>
                        </div>
                        <div style={{ width: '100%', height: '8px', background: 'var(--border-color)', borderRadius: '4px' }}>
                          <div style={{ width: `${((academicData?.students?.filter(s => s.attendance >= 70 && s.attendance < 85).length || 0) / (academicData?.total || 1)) * 100}%`, height: '8px', background: '#f39c12', borderRadius: '4px' }} />
                        </div>
                      </div>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                          <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>Necesita apoyo (&lt;70%)</span>
                          <span style={{ fontSize: '0.9rem', fontWeight: '600', color: '#e74c3c' }}>{academicData?.students?.filter(s => s.attendance < 70).length || 0}</span>
                        </div>
                        <div style={{ width: '100%', height: '8px', background: 'var(--border-color)', borderRadius: '4px' }}>
                          <div style={{ width: `${((academicData?.students?.filter(s => s.attendance < 70).length || 0) / (academicData?.total || 1)) * 100}%`, height: '8px', background: '#e74c3c', borderRadius: '4px' }} />
                        </div>
                      </div>
                      <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'var(--bg-secondary)', borderRadius: '6px', textAlign: 'center' }}>
                        <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Total: </span>
                        <span style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--text-primary)' }}>{academicData?.total || 0} estudiantes</span>
                      </div>
                    </div>
                  </div>
                </div>

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
                  <table style={{ width: '100%', minWidth: '800px', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: 'var(--bg-secondary)', borderBottom: '2px solid var(--border-color)' }}>
                        <th 
                          onClick={() => handleSort('name')}
                          style={{ 
                            textAlign: 'left', 
                            padding: '1rem', 
                            fontWeight: '600', 
                            color: 'var(--text-secondary)',
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
                            padding: '1rem', 
                            fontWeight: '600', 
                            color: 'var(--text-secondary)',
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
                            padding: '1rem', 
                            fontWeight: '600', 
                            color: 'var(--text-secondary)',
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
                            padding: '1rem', 
                            fontWeight: '600', 
                            color: 'var(--text-secondary)',
                            cursor: 'pointer',
                            userSelect: 'none'
                          }}
                        >
                          Asistencia (%) {sortConfig.key === 'attendance' ? (sortConfig.direction === 'asc' ? ' ↑' : ' ↓') : ' ⇅'}
                        </th>
                        <th style={{ textAlign: 'center', padding: '1rem', fontWeight: '600', color: 'var(--text-secondary)' }}>
                          Estado
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {getFilteredAndSortedData(academicData)?.map((student, index) => (
                        <tr key={student._id} style={{ 
                          borderBottom: '1px solid var(--border-color)'
                        }} className="table-row-hover">
                          <td style={{ padding: '1rem', color: 'var(--text-primary)' }}>
                            {student.firstName} {student.lastName}
                          </td>
                          <td style={{ padding: '1rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
                            {student.nivel}
                          </td>
                          <td style={{ padding: '1rem', textAlign: 'left' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <div style={{
                                flex: 1,
                                background: 'var(--border-color)',
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
                          <td style={{ padding: '1rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
                            {student.attendance}%
                          </td>
                          <td style={{ padding: '1rem', textAlign: 'center' }}>
                            <span style={{
                              display: 'inline-block',
                              minWidth: '120px',
                              padding: '0.25rem 0.75rem',
                              borderRadius: '12px',
                              fontSize: '0.75rem',
                              fontWeight: '600',
                              textAlign: 'center',
                              textTransform: 'uppercase',
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

                {/* Financial Overview Chart */}
                <div style={{ background: 'var(--card-bg)', padding: '1.5rem', borderRadius: '12px', boxShadow: 'var(--shadow-md)', marginBottom: '2rem' }}>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'center' }}>
                    {/* Income vs Pending Chart */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div style={{ position: 'relative', width: '140px', height: '140px' }}>
                        <svg width="140" height="140" style={{ transform: 'rotate(-90deg)' }}>
                          <circle cx="70" cy="70" r="60" fill="none" stroke="var(--border-color)" strokeWidth="12" />
                          <circle 
                            cx="70" 
                            cy="70" 
                            r="60" 
                            fill="none" 
                            stroke="#27ae60" 
                            strokeWidth="12"
                            strokeDasharray={`${((financialData?.totalIncome || 0) / ((financialData?.totalIncome || 0) + (financialData?.pendingIncome || 0)) || 0) * 377} 377`}
                            strokeLinecap="round"
                          />
                          <circle 
                            cx="70" 
                            cy="70" 
                            r="60" 
                            fill="none" 
                            stroke="#e74c3c" 
                            strokeWidth="12"
                            strokeDasharray={`${((financialData?.pendingIncome || 0) / ((financialData?.totalIncome || 0) + (financialData?.pendingIncome || 0)) || 0) * 377} 377`}
                            strokeDashoffset={`-${((financialData?.totalIncome || 0) / ((financialData?.totalIncome || 0) + (financialData?.pendingIncome || 0)) || 0) * 377}`}
                            strokeLinecap="round"
                          />
                        </svg>
                        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                          <div style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--text-primary)' }}>{((financialData?.totalIncome || 0) / ((financialData?.totalIncome || 0) + (financialData?.pendingIncome || 0)) * 100).toFixed(1)}%</div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Cobrado</div>
                        </div>
                      </div>
                    </div>
                    {/* Financial Breakdown */}
                    <div>
                      <div style={{ marginBottom: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                          <div style={{ width: '12px', height: '12px', background: '#27ae60', borderRadius: '50%' }} />
                          <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: '500' }}>Ingresos Cobrados</span>
                        </div>
                        <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#27ae60', marginLeft: '1.5rem' }}>
                          {formatCurrency(financialData?.totalIncome || 0)}
                        </div>
                      </div>
                      <div style={{ marginBottom: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                          <div style={{ width: '12px', height: '12px', background: '#e74c3c', borderRadius: '50%' }} />
                          <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: '500' }}>Pagos Pendientes</span>
                        </div>
                        <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#e74c3c', marginLeft: '1.5rem' }}>
                          {formatCurrency(financialData?.pendingIncome || 0)}
                        </div>
                      </div>

                    </div>
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
                  <table style={{ width: '100%', minWidth: '800px', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: 'var(--bg-secondary)', borderBottom: '2px solid var(--border-color)' }}>
                        <th 
                          onClick={() => handleSort('studentName')}
                          style={{ 
                            textAlign: 'left', 
                            padding: '1rem', 
                            fontWeight: '600', 
                            color: 'var(--text-secondary)',
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
                            padding: '1rem', 
                            fontWeight: '600', 
                            color: 'var(--text-secondary)',
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
                            padding: '1rem', 
                            fontWeight: '600', 
                            color: 'var(--text-secondary)',
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
                            padding: '1rem', 
                            fontWeight: '600', 
                            color: 'var(--text-secondary)',
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
                                borderBottom: '1px solid var(--border-color)',
                                cursor: 'pointer'
                              }}
                              className="table-row-hover"
                            >
                              <td style={{ padding: '1rem', color: 'var(--text-primary)', fontWeight: '500' }}>
                                <span style={{ marginRight: '0.5rem' }}>
                                  {isExpanded ? '▼' : '▶'}
                                </span>
                                {student.studentName}
                              </td>
                              <td style={{ padding: '1rem', color: 'var(--success)', fontWeight: '600', textAlign: 'center' }}>
                                {formatCurrency(student.total)}
                              </td>
                              <td style={{ padding: '1rem', color: (student.pending || 0) === 0 ? 'var(--success)' : 'var(--error)', fontWeight: '600', textAlign: 'center' }}>
                                {formatCurrency(student.pending || 0)}
                              </td>
                              <td style={{ padding: '1rem', textAlign: 'center' }}>
                                <span style={{
                                  display: 'inline-block',
                                  minWidth: '120px',
                                  padding: '0.25rem 0.75rem',
                                  borderRadius: '12px',
                                  fontSize: '0.75rem',
                                  fontWeight: '600',
                                  textAlign: 'center',
                                  textTransform: 'uppercase',
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
  )
}

export default ReportsDashboard