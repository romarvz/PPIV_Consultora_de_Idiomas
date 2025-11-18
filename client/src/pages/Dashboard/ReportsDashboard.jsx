import React, { useState, useEffect } from 'react'
import apiAdapter from '../../services/apiAdapter'
import api from '../../services/api'
import { FaFileExport, FaSpinner, FaFilePdf, FaFileExcel, FaPlus, FaTrash } from 'react-icons/fa'
import GenerateReportModal from '../../components/reports/GenerateReportModal'

const ReportsDashboard = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState('academic')
  const [loading, setLoading] = useState(false)
  const [academicData, setAcademicData] = useState(null)
  const [financialData, setFinancialData] = useState(null)
  const [recentReports, setRecentReports] = useState([])
  const [filters, setFilters] = useState({ search: '', nivel: '', estado: '' })
  const [financialFilters, setFinancialFilters] = useState({ search: '', paymentStatus: '', minAmount: '', maxAmount: '' })
  const [sortConfig, setSortConfig] = useState({ key: 'dni', direction: 'asc' }) // Ordenar por DNI por defecto
  const [expandedRows, setExpandedRows] = useState(new Set())
  const [showGenerateModal, setShowGenerateModal] = useState(false)

  useEffect(() => {
    loadReports()
    
    // Set up polling for report updates every 1 hour (3600000 ms)
    const pollInterval = setInterval(() => {
      // Only update if page is visible and not currently loading
      if (!document.hidden && !loading) {
        loadReports()
      }
    }, 3600000) // 1 hour = 60 * 60 * 1000 = 3600000 ms
    
    // Cleanup on unmount
    return () => {
      clearInterval(pollInterval)
    }
  }, [])

  const loadReports = async () => {
    setLoading(true)
    try {
      // Fast initial load with essential data only
      const [studentsResponse] = await Promise.all([
        api.get('/students?limit=20') // Reduced limit for faster response
      ])
      
      // Set basic student count immediately
      let realTimeStudentCount = 0
      if (studentsResponse?.data?.success) {
        const students = studentsResponse.data.data?.students || []
        realTimeStudentCount = students.length
        
        // Set minimal academic data for immediate display
        const basicAcademicData = {
          total: realTimeStudentCount,
          realTimeTotal: realTimeStudentCount,
          students: students.slice(0, 10), // Show first 10 for quick display
          averageAttendance: 0 // Will be calculated in background
        }
        setAcademicData(basicAcademicData)
      }
      
      setLoading(false)
      
      // Load detailed data in background
      setTimeout(async () => {
        try {
          const [academicResponse, financialResponse, recentReportsResponse] = await Promise.allSettled([
            apiAdapter.reports.academicDashboard(),
            apiAdapter.reports.financial(),
            api.get('/reportes-academicos/recientes?limite=20') // Reduced limit
          ])
          
          if (academicResponse.status === 'fulfilled' && academicResponse.value?.data?.success) {
            const academicDataReceived = academicResponse.value.data.data
            const updatedAcademicData = {
              ...academicDataReceived,
              total: realTimeStudentCount,
              realTimeTotal: realTimeStudentCount
            }
            setAcademicData(updatedAcademicData)
          }
          
          if (financialResponse.status === 'fulfilled' && financialResponse.value?.data?.success) {
            setFinancialData(financialResponse.value.data.data)
          }

          if (recentReportsResponse.status === 'fulfilled' && recentReportsResponse.value?.data?.success) {
            setRecentReports(recentReportsResponse.value.data.data || [])
          }
        } catch (error) {
          console.error('Background loading error:', error)
        }
      }, 100)
      
    } catch (error) {
      console.error('Error loading reports:', error)
      setLoading(false)
    }
  }

  const handleExportPDF = async () => {
    try {
      setLoading(true)
      
      // Dynamic import of jsPDF
      const { jsPDF } = await import('jspdf')
      
      const doc = new jsPDF()
      const pageWidth = doc.internal.pageSize.width
      let yPosition = 20
      
      // Header with logo placeholder and title
      doc.setFontSize(20)
      doc.setTextColor(10, 44, 89) // Primary color
      doc.text('LINGUA ACADEMY', pageWidth / 2, yPosition, { align: 'center' })
      yPosition += 15
      
      doc.setFontSize(16)
      const reportTitle = activeTab === 'academic' ? 'REPORTE ACADÉMICO' : 'REPORTE FINANCIERO'
      doc.text(reportTitle, pageWidth / 2, yPosition, { align: 'center' })
      yPosition += 10
      
      doc.setFontSize(10)
      doc.setTextColor(100, 100, 100)
      doc.text(`Generado el: ${new Date().toLocaleDateString('es-ES')}`, pageWidth / 2, yPosition, { align: 'center' })
      yPosition += 20
      
      // Line separator
      doc.setDrawColor(15, 92, 140)
      doc.line(20, yPosition, pageWidth - 20, yPosition)
      yPosition += 15
      
      doc.setTextColor(0, 0, 0)
      
      if (activeTab === 'academic') {
        if (!academicData || !academicData.students || academicData.students.length === 0) {
          alert('No hay datos académicos para exportar.')
          return
        }
        
        const filteredData = getFilteredAndSortedData(academicData)
        
        // Summary section
        doc.setFontSize(12)
        doc.setFont(undefined, 'bold')
        doc.text('RESUMEN GENERAL', 20, yPosition)
        yPosition += 10
        
        doc.setFont(undefined, 'normal')
        doc.setFontSize(10)
        doc.text(`Total de estudiantes: ${academicData.realTimeTotal || academicData.total || 0}`, 20, yPosition)
        yPosition += 6
        doc.text(`Promedio de asistencia: ${academicData.averageAttendance?.toFixed(1) || 0}%`, 20, yPosition)
        yPosition += 15
        
        // Students table header
        doc.setFont(undefined, 'bold')
        doc.text('DETALLE DE ESTUDIANTES', 20, yPosition)
        yPosition += 8
        
        doc.setFont(undefined, 'normal')
        doc.text('DNI', 20, yPosition)
        doc.text('Nombre', 50, yPosition)
        doc.text('Nivel', 110, yPosition)
        doc.text('Asistencia', 130, yPosition)
        doc.text('Estado', 160, yPosition)
        yPosition += 5
        
        // Line under header
        doc.line(20, yPosition, pageWidth - 20, yPosition)
        yPosition += 8
        
        // Students data
        filteredData.forEach(student => {
          if (yPosition > 270) {
            doc.addPage()
            yPosition = 20
          }
          
          const estado = student.promedio >= 8 ? 'Excelente' : student.promedio >= 6 ? 'Aprobado' : 'Necesita apoyo'
          
          doc.text(student.dni || 'Sin DNI', 20, yPosition)
          doc.text(`${student.firstName} ${student.lastName}`, 50, yPosition)
          doc.text(student.nivel || 'N/A', 110, yPosition)
          doc.text(`${student.attendance?.toFixed(1) || 0}%`, 130, yPosition)
          doc.text(estado, 160, yPosition)
          yPosition += 6
        })
        
        doc.save(`reporte-academico-${new Date().toISOString().split('T')[0]}.pdf`)
      } else {
        if (!financialData || !financialData.topStudents) {
          alert('No hay datos financieros para exportar.')
          return
        }
        
        const filteredData = getFilteredAndSortedFinancialData(financialData)
        
        // Summary section
        doc.setFontSize(12)
        doc.setFont(undefined, 'bold')
        doc.text('RESUMEN FINANCIERO', 20, yPosition)
        yPosition += 10
        
        doc.setFont(undefined, 'normal')
        doc.setFontSize(10)
        doc.text(`Total de ingresos: $${financialData.totalIncome || 0}`, 20, yPosition)
        yPosition += 6
        doc.text(`Ingresos pendientes: $${financialData.pendingIncome || 0}`, 20, yPosition)
        yPosition += 15
        
        // Financial table header
        doc.setFont(undefined, 'bold')
        doc.text('DETALLE POR ESTUDIANTE', 20, yPosition)
        yPosition += 8
        
        doc.setFont(undefined, 'normal')
        doc.text('Estudiante', 20, yPosition)
        doc.text('Total Pagado', 80, yPosition)
        doc.text('Adeuda', 130, yPosition)
        doc.text('% Cobrado', 160, yPosition)
        yPosition += 5
        
        // Line under header
        doc.line(20, yPosition, pageWidth - 20, yPosition)
        yPosition += 8
        
        // Financial data
        filteredData.forEach(student => {
          if (yPosition > 270) {
            doc.addPage()
            yPosition = 20
          }
          
          const totalExpected = student.total + (student.pending || 0)
          const percentage = totalExpected > 0 ? ((student.total / totalExpected) * 100).toFixed(1) : 0
          
          doc.text(student.studentName, 20, yPosition)
          doc.text(`$${student.total}`, 80, yPosition)
          doc.text(`$${student.pending || 0}`, 130, yPosition)
          doc.text(`${percentage}%`, 160, yPosition)
          yPosition += 6
        })
        
        doc.save(`reporte-financiero-${new Date().toISOString().split('T')[0]}.pdf`)
      }
    } catch (error) {
      console.error('Error exporting PDF:', error)
      alert('Error al exportar PDF: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleExportExcel = async () => {
    try {
      setLoading(true)
      
      if (activeTab === 'academic') {
        if (!academicData || !academicData.students || academicData.students.length === 0) {
          alert('No hay datos académicos para exportar.')
          return
        }
        
        // Create CSV content (Excel-compatible)
        const filteredData = getFilteredAndSortedData(academicData)
        let csvContent = 'LINGUA ACADEMY\n'
        csvContent += 'REPORTE ACADÉMICO\n'
        csvContent += `Generado el: ${new Date().toLocaleDateString('es-ES')}\n\n`
        csvContent += 'DNI,Nombre,Apellido,Nivel,Asistencia (%),Promedio,Estado\n'
        
        filteredData.forEach(student => {
          const estado = student.promedio >= 8 ? 'Excelente' : student.promedio >= 6 ? 'Aprobado' : 'Necesita apoyo'
          csvContent += `"${student.dni || 'Sin DNI'}","${student.firstName}","${student.lastName}","${student.nivel}","${student.attendance?.toFixed(1) || 0}","${student.promedio?.toFixed(2) || 'N/A'}","${estado}"\n`
        })
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `reporte-academico-${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        if (!financialData || !financialData.topStudents) {
          alert('No hay datos financieros para exportar.')
          return
        }
        
        const filteredData = getFilteredAndSortedFinancialData(financialData)
        let csvContent = 'LINGUA ACADEMY\n'
        csvContent += 'REPORTE FINANCIERO\n'
        csvContent += `Generado el: ${new Date().toLocaleDateString('es-ES')}\n\n`
        csvContent += 'Estudiante,Total Pagado,Adeuda,Porcentaje Cobrado (%)\n'
        
        filteredData.forEach(student => {
          const totalExpected = student.total + (student.pending || 0)
          const percentage = totalExpected > 0 ? ((student.total / totalExpected) * 100).toFixed(1) : 0
          csvContent += `"${student.studentName}","${student.total}","${student.pending || 0}","${percentage}"\n`
        })
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `reporte-financiero-${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error('Error exporting:', error)
      alert('Error al exportar: ' + error.message)
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
        
        // Manejar valores null/undefined para promedio (ponerlos al final)
        if (sortConfig.key === 'promedio') {
          if (aValue === null || aValue === undefined) aValue = -1
          if (bValue === null || bValue === undefined) bValue = -1
        }
        
        // Manejar valores null/undefined para DNI (ponerlos al final)
        if (sortConfig.key === 'dni') {
          if (!aValue || aValue === '') aValue = '999999999' // Poner sin DNI al final
          if (!bValue || bValue === '') bValue = '999999999'
          // Convertir a número si es posible para ordenar numéricamente
          const aNum = Number(aValue)
          const bNum = Number(bValue)
          if (!isNaN(aNum) && !isNaN(bNum)) {
            aValue = aNum
            bValue = bNum
          }
        }
        
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
    <div className="dashboard-container">
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

        {/* Action Buttons */}
        <div style={{
          padding: '1rem',
          background: 'var(--bg-secondary)',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <button
            onClick={() => setShowGenerateModal(true)}
            style={{
              background: 'var(--primary)',
              color: 'white',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '6px',
              fontSize: '0.9rem',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.3s ease'
            }}
          >
            <FaPlus /> Generar Reporte
          </button>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={handleExportPDF}
            disabled={loading}
            style={{
              background: '#0F5C8C',
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
              background: '#3088BF',
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
                {!academicData ? (
                  <div style={{ 
                    background: 'var(--card-bg)', 
                    padding: '2rem', 
                    borderRadius: '12px', 
                    boxShadow: 'var(--shadow-md)', 
                    marginBottom: '2rem',
                    textAlign: 'center',
                    color: 'var(--text-secondary)'
                  }}>
                    No hay datos académicos disponibles para mostrar
                  </div>
                ) : (
                  <div style={{ background: 'var(--card-bg)', padding: '1.5rem', borderRadius: '12px', boxShadow: 'var(--shadow-md)', marginBottom: '2rem' }}>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'center' }}>
                      {/* Progress Ring Chart */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{ position: 'relative', width: '160px', height: '160px' }}>
                          <svg width="160" height="160" style={{ transform: 'rotate(-90deg)' }}>
                            <circle cx="80" cy="80" r="70" fill="none" stroke="var(--border-color)" strokeWidth="8" />
                            <circle 
                              cx="80" 
                              cy="80" 
                              r="70" 
                              fill="none" 
                              stroke="#27ae60" 
                              strokeWidth="8"
                              strokeDasharray={`${
                                academicData.averageGrade !== null && academicData.averageGrade !== undefined
                                  ? ((academicData.averageGrade / 10) * 440)
                                  : ((academicData?.averageAttendance || 0) / 100) * 440
                              } 440`}
                              strokeLinecap="round"
                            />
                          </svg>
                          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                              {academicData.averageGrade !== null && academicData.averageGrade !== undefined
                                ? academicData.averageGrade.toFixed(1)
                                : academicData.averageAttendance !== null && academicData.averageAttendance !== undefined
                                  ? `${academicData.averageAttendance.toFixed(1)}%`
                                  : '0%'}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: '1.2' }}>
                              {academicData.averageGrade !== null && academicData.averageGrade !== undefined
                                ? 'Promedio de Calificaciones'
                                : 'Promedio de Asistencia'}
                            </div>
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
                        <span style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--text-primary)' }}>{academicData?.realTimeTotal || academicData?.total || 0} estudiantes</span>
                        {academicData?.realTimeTotal && academicData?.realTimeTotal !== academicData?.total && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--primary)', marginTop: '0.25rem' }}>
                            (Actualizado en tiempo real)
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                )}

                {/* Reportes Generados Recientemente */}
                {recentReports.length > 0 && (
                  <div style={{ 
                    background: 'var(--card-bg)', 
                    padding: '1.5rem', 
                    borderRadius: '12px', 
                    boxShadow: 'var(--shadow-md)', 
                    marginBottom: '2rem' 
                  }}>
                    <h3 style={{
                      fontSize: '1.1rem',
                      fontWeight: '600',
                      marginBottom: '1rem',
                      color: 'var(--text-primary)'
                    }}>
                      Reportes Generados Recientemente ({recentReports.length})
                    </h3>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                      gap: '1rem',
                      maxHeight: '400px',
                      overflowY: 'auto'
                    }}>
                      {recentReports.map((reporte) => (
                        <div
                          key={reporte._id}
                          style={{
                            padding: '1rem',
                            border: '1px solid var(--border-color)',
                            borderRadius: '8px',
                            background: 'var(--bg-secondary)'
                          }}
                        >
                          <div style={{ marginBottom: '0.75rem' }}>
                            <div style={{ fontWeight: '600', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                              {reporte.estudiante ? `${reporte.estudiante.firstName} ${reporte.estudiante.lastName}` : 'Estudiante desconocido'}
                            </div>
                            {reporte.curso && (
                              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                                {reporte.curso.nombre} - {reporte.curso.idioma}
                              </div>
                            )}
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                              Período: {reporte.periodo || 'N/A'} | 
                              Estado: <span style={{
                                color: reporte.estado === 'aprobado' ? '#27ae60' :
                                       reporte.estado === 'reprobado' ? '#e74c3c' :
                                       '#f39c12',
                                fontWeight: '500'
                              }}>
                                {reporte.estado === 'aprobado' ? 'Aprobado' :
                                 reporte.estado === 'reprobado' ? 'Necesita apoyo' :
                                 reporte.estado === 'en_progreso' ? 'En progreso' :
                                 reporte.estado || 'En progreso'}
                              </span>
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
                            <button
                              onClick={async () => {
                                try {
                                  setLoading(true)
                                  const token = localStorage.getItem('token')
                                  const response = await fetch(
                                    `http://localhost:5000/api/reportes-academicos/${reporte._id}/exportar-pdf`,
                                    { headers: { 'Authorization': `Bearer ${token}` } }
                                  )
                                  if (!response.ok) throw new Error('Error al exportar')
                                  const blob = await response.blob()
                                  const url = window.URL.createObjectURL(blob)
                                  const a = document.createElement('a')
                                  a.href = url
                                  a.download = `reporte-${reporte.estudiante?.lastName || 'academico'}-${reporte.periodo || 'actual'}.pdf`
                                  document.body.appendChild(a)
                                  a.click()
                                  window.URL.revokeObjectURL(url)
                                  document.body.removeChild(a)
                                } catch (error) {
                                  alert('Error al exportar PDF: ' + error.message)
                                } finally {
                                  setLoading(false)
                                }
                              }}
                              disabled={loading}
                              style={{
                                flex: 1,
                                minWidth: '80px',
                                padding: '0.5rem',
                                background: '#0F5C8C',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: '0.85rem',
                                fontWeight: '500',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem'
                              }}
                            >
                              <FaFilePdf /> PDF
                            </button>
                            <button
                              onClick={async () => {
                                try {
                                  setLoading(true)
                                  const token = localStorage.getItem('token')
                                  const response = await fetch(
                                    `http://localhost:5000/api/reportes-academicos/${reporte._id}/exportar-excel`,
                                    { headers: { 'Authorization': `Bearer ${token}` } }
                                  )
                                  if (!response.ok) throw new Error('Error al exportar')
                                  const blob = await response.blob()
                                  const url = window.URL.createObjectURL(blob)
                                  const a = document.createElement('a')
                                  a.href = url
                                  a.download = `reporte-${reporte.estudiante?.lastName || 'academico'}-${reporte.periodo || 'actual'}.xlsx`
                                  document.body.appendChild(a)
                                  a.click()
                                  window.URL.revokeObjectURL(url)
                                  document.body.removeChild(a)
                                } catch (error) {
                                  alert('Error al exportar Excel: ' + error.message)
                                } finally {
                                  setLoading(false)
                                }
                              }}
                              disabled={loading}
                              style={{
                                flex: 1,
                                minWidth: '80px',
                                padding: '0.5rem',
                                background: '#3088BF',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: '0.85rem',
                                fontWeight: '500',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem'
                              }}
                            >
                              <FaFileExcel /> Excel
                            </button>
                            <button
                              onClick={async () => {
                                if (!confirm(`¿Estás seguro de que deseas eliminar el reporte de ${reporte.estudiante?.firstName} ${reporte.estudiante?.lastName}?`)) {
                                  return
                                }
                                try {
                                  setLoading(true)
                                  const token = localStorage.getItem('token')
                                  const response = await fetch(
                                    `http://localhost:5000/api/reportes-academicos/${reporte._id}`,
                                    {
                                      method: 'DELETE',
                                      headers: { 'Authorization': `Bearer ${token}` }
                                    }
                                  )
                                  if (!response.ok) {
                                    const errorData = await response.json().catch(() => ({}))
                                    throw new Error(errorData.error || 'Error al eliminar reporte')
                                  }
                                  // Recargar reportes
                                  await loadReports()
                                  alert('✅ Reporte eliminado exitosamente')
                                } catch (error) {
                                  alert('Error al eliminar reporte: ' + error.message)
                                } finally {
                                  setLoading(false)
                                }
                              }}
                              disabled={loading}
                              style={{
                                padding: '0.5rem',
                                background: '#ef4444',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: '0.85rem',
                                fontWeight: '500',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem'
                              }}
                              title="Eliminar reporte"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

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
                          onClick={() => handleSort('dni')}
                          style={{ 
                            textAlign: 'left', 
                            padding: '1rem', 
                            fontWeight: '600', 
                            color: 'var(--text-secondary)',
                            cursor: 'pointer',
                            userSelect: 'none'
                          }}
                        >
                          DNI {sortConfig.key === 'dni' ? (sortConfig.direction === 'asc' ? ' ↑' : ' ↓') : ' ⇅'}
                        </th>
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
                          onClick={() => handleSort('promedio')}
                          style={{ 
                            textAlign: 'center', 
                            padding: '1rem', 
                            fontWeight: '600', 
                            color: 'var(--text-secondary)',
                            cursor: 'pointer',
                            userSelect: 'none'
                          }}
                        >
                          Progreso (Promedio) {sortConfig.key === 'promedio' ? (sortConfig.direction === 'asc' ? ' ↑' : ' ↓') : ' ⇅'}
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
                      {!academicData || !academicData.students || academicData.students.length === 0 ? (
                        <tr>
                          <td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                            No hay datos académicos disponibles
                          </td>
                        </tr>
                      ) : (
                        getFilteredAndSortedData(academicData)?.map((student, index) => (
                        <tr key={student._id} style={{ 
                          borderBottom: '1px solid var(--border-color)'
                        }} className="table-row-hover">
                          <td style={{ padding: '1rem', color: 'var(--text-primary)', fontFamily: 'monospace', fontWeight: '500' }}>
                            {student.dni || 'Sin DNI'}
                          </td>
                          <td style={{ padding: '1rem', color: 'var(--text-primary)' }}>
                            {student.firstName} {student.lastName}
                          </td>
                          <td style={{ padding: '1rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
                            {student.nivel}
                          </td>
                          <td style={{ padding: '1rem', textAlign: 'left' }}>
                            {student.promedio !== null && student.promedio !== undefined ? (
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
                                      background: student.promedio >= 6 ? 'var(--success)' : 
                                                 student.promedio >= 4 ? 'var(--warning)' : 'var(--error)',
                                      height: '8px',
                                      borderRadius: '9999px',
                                      width: `${(student.promedio / 10) * 100}%`
                                    }}
                                  />
                                </div>
                                <span style={{ fontSize: '0.875rem', color: 'var(--text-primary)', fontWeight: '500' }}>
                                  {student.promedio.toFixed(2)}
                                </span>
                              </div>
                            ) : (
                              <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                                Sin calificaciones
                              </span>
                            )}
                          </td>
                          <td style={{ padding: '1rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
                            {student.attendance?.toFixed(1) || 0}%
                          </td>
                          <td style={{ padding: '1rem', textAlign: 'center' }}>
                            {student.promedio !== null && student.promedio !== undefined ? (
                              <span style={{
                                display: 'inline-block',
                                minWidth: '120px',
                                padding: '0.25rem 0.75rem',
                                borderRadius: '12px',
                                fontSize: '0.75rem',
                                fontWeight: '600',
                                textAlign: 'center',
                                textTransform: 'uppercase',
                                background: student.promedio >= 8 ? 'var(--success-light)' : 
                                           student.promedio >= 6 ? 'var(--warning-light)' : 'var(--error-light)',
                                color: student.promedio >= 8 ? 'var(--success-dark)' : 
                                       student.promedio >= 6 ? 'var(--warning-dark)' : 'var(--error-dark)'
                              }}>
                                {student.promedio >= 8 ? 'Excelente' : 
                                 student.promedio >= 6 ? 'Aprobado' : 'Necesita apoyo'}
                              </span>
                            ) : (
                              <span style={{
                                display: 'inline-block',
                                minWidth: '120px',
                                padding: '0.25rem 0.75rem',
                                borderRadius: '12px',
                                fontSize: '0.75rem',
                                fontWeight: '500',
                                textAlign: 'center',
                                color: 'var(--text-muted)',
                                fontStyle: 'italic'
                              }}>
                                No registra progreso aún
                              </span>
                            )}
                          </td>
                        </tr>
                        ))
                      )}
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
                      {!financialData || !financialData.topStudents || financialData.topStudents.length === 0 ? (
                        <tr>
                          <td colSpan="4" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                            No hay datos financieros disponibles
                          </td>
                        </tr>
                      ) : (
                        getFilteredAndSortedFinancialData(financialData)?.map((student, index) => {
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
                      })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>

      {showGenerateModal && (
          <GenerateReportModal
            type={activeTab}
            onClose={() => setShowGenerateModal(false)}
            onSuccess={async () => {
              // Immediate reload after generating new report
              try {
                await loadReports()
              } catch (error) {
                console.error('Error reloading reports after generation:', error)
                // Keep existing data if reload fails
              }
            }}
          />
      )}
    </div>
  )
}

export default ReportsDashboard