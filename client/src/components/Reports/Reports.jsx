import React, { useState } from 'react'
import { BarChart3, FileText, Download, Calendar, TrendingUp, Users, DollarSign } from 'lucide-react'

const Reports = () => {
  const [selectedReport, setSelectedReport] = useState('')
  const [dateRange, setDateRange] = useState({ from: '', to: '' })
  const [selectedStudent, setSelectedStudent] = useState('')
  const [selectedCompany, setSelectedCompany] = useState('')

  const reportTypes = [
    { id: 'academic', name: 'Reporte de Progreso Académico', icon: TrendingUp },
    { id: 'income', name: 'Reporte de Ingresos', icon: DollarSign },
    { id: 'attendance', name: 'Reporte de Asistencias', icon: Users },
    { id: 'company-account', name: 'Cuenta Corriente Empresa', icon: FileText },
    { id: 'company-performance', name: 'Desempeño de Empleados', icon: BarChart3 }
  ]

  const students = ['Ana Martínez', 'Carlos López', 'María García', 'Juan Pérez']
  const companies = ['Tech Solutions SA', 'Global Corp', 'Innovation Ltd']

  const generateReport = () => {
    if (!selectedReport) {
      alert('Por favor seleccione un tipo de reporte')
      return
    }

    // Mock report generation
    const reportData = {
      academic: {
        title: 'Reporte de Progreso Académico',
        data: [
          { student: selectedStudent || 'Ana Martínez', level: 'B1', progress: '75%', grade: '8.5', lastActivity: '2024-01-15' },
          { student: 'Carlos López', level: 'A2', progress: '60%', grade: '7.8', lastActivity: '2024-01-14' }
        ]
      },
      income: {
        title: 'Reporte de Ingresos',
        data: [
          { period: 'Enero 2024', totalIncome: 450000, courseIncome: 380000, corporateIncome: 70000 },
          { period: 'Diciembre 2023', totalIncome: 420000, courseIncome: 350000, corporateIncome: 70000 }
        ]
      },
      attendance: {
        title: 'Reporte de Asistencias',
        data: [
          { student: 'Ana Martínez', totalClasses: 20, attended: 18, absences: 2, attendanceRate: '90%' },
          { student: 'Carlos López', totalClasses: 16, attended: 14, absences: 2, attendanceRate: '87.5%' }
        ]
      },
      'company-account': {
        title: 'Cuenta Corriente - ' + (selectedCompany || 'Tech Solutions SA'),
        data: [
          { date: '2024-01-15', type: 'Factura', number: 'FC-001', debit: 50000, credit: 0, balance: 50000 },
          { date: '2024-01-20', type: 'Pago', number: 'RC-001', debit: 0, credit: 50000, balance: 0 }
        ]
      },
      'company-performance': {
        title: 'Desempeño de Empleados - ' + (selectedCompany || 'Tech Solutions SA'),
        data: [
          { employee: 'Ana García', course: 'Business English', level: 'B2', grade: '8.5', status: 'Activo' },
          { employee: 'Carlos López', course: 'Inglés General', level: 'A2', grade: '7.2', status: 'Activo' }
        ]
      }
    }

    setReportData(reportData[selectedReport])
    alert(`Reporte "${reportTypes.find(r => r.id === selectedReport)?.name}" generado exitosamente`)
  }

  const [reportData, setReportData] = useState(null)

  const exportReport = (format) => {
    alert(`Exportando reporte en formato ${format.toUpperCase()}...`)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-lg font-semibold">Reportes e Indicadores</h1>
      </div>

      <div className="card mb-4">
        <div className="card-header">
          <h3 className="card-title">Generar Reporte</h3>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Tipo de Reporte *</label>
            <select
              value={selectedReport}
              onChange={(e) => setSelectedReport(e.target.value)}
              className="form-select"
              required
            >
              <option value="">Seleccionar tipo de reporte</option>
              {reportTypes.map(report => (
                <option key={report.id} value={report.id}>{report.name}</option>
              ))}
            </select>
          </div>

          {(selectedReport === 'academic' || selectedReport === 'attendance') && (
            <div className="form-group">
              <label className="form-label">Estudiante</label>
              <select
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value)}
                className="form-select"
              >
                <option value="">Todos los estudiantes</option>
                {students.map(student => (
                  <option key={student} value={student}>{student}</option>
                ))}
              </select>
            </div>
          )}

          {(selectedReport === 'company-account' || selectedReport === 'company-performance') && (
            <div className="form-group">
              <label className="form-label">Empresa</label>
              <select
                value={selectedCompany}
                onChange={(e) => setSelectedCompany(e.target.value)}
                className="form-select"
              >
                <option value="">Seleccionar empresa</option>
                {companies.map(company => (
                  <option key={company} value={company}>{company}</option>
                ))}
              </select>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Fecha Desde</label>
            <input
              type="date"
              value={dateRange.from}
              onChange={(e) => setDateRange({...dateRange, from: e.target.value})}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Fecha Hasta</label>
            <input
              type="date"
              value={dateRange.to}
              onChange={(e) => setDateRange({...dateRange, to: e.target.value})}
              className="form-input"
            />
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <button onClick={generateReport} className="btn btn-primary">
            <BarChart3 size={16} />
            Generar Reporte
          </button>
        </div>
      </div>

      {reportData && (
        <div className="card">
          <div className="card-header">
            <div className="flex justify-between items-center">
              <h3 className="card-title">
                <FileText size={20} />
                {reportData.title}
              </h3>
              <div className="flex gap-2">
                <button 
                  onClick={() => exportReport('pdf')}
                  className="btn btn-secondary"
                  style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                >
                  <Download size={12} />
                  PDF
                </button>
                <button 
                  onClick={() => exportReport('excel')}
                  className="btn btn-secondary"
                  style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                >
                  <Download size={12} />
                  Excel
                </button>
                <button 
                  onClick={() => exportReport('csv')}
                  className="btn btn-secondary"
                  style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                >
                  <Download size={12} />
                  CSV
                </button>
              </div>
            </div>
          </div>

          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  {selectedReport === 'academic' && (
                    <>
                      <th>Estudiante</th>
                      <th>Nivel</th>
                      <th>Progreso</th>
                      <th>Calificación</th>
                      <th>Última Actividad</th>
                    </>
                  )}
                  {selectedReport === 'income' && (
                    <>
                      <th>Período</th>
                      <th>Ingresos Totales</th>
                      <th>Cursos Individuales</th>
                      <th>Cursos Corporativos</th>
                    </>
                  )}
                  {selectedReport === 'attendance' && (
                    <>
                      <th>Estudiante</th>
                      <th>Total Clases</th>
                      <th>Asistencias</th>
                      <th>Ausencias</th>
                      <th>% Asistencia</th>
                    </>
                  )}
                  {selectedReport === 'company-account' && (
                    <>
                      <th>Fecha</th>
                      <th>Tipo</th>
                      <th>Número</th>
                      <th>Debe</th>
                      <th>Haber</th>
                      <th>Saldo</th>
                    </>
                  )}
                  {selectedReport === 'company-performance' && (
                    <>
                      <th>Empleado</th>
                      <th>Curso</th>
                      <th>Nivel</th>
                      <th>Calificación</th>
                      <th>Estado</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {reportData.data.map((row, index) => (
                  <tr key={index}>
                    {selectedReport === 'academic' && (
                      <>
                        <td>{row.student}</td>
                        <td>{row.level}</td>
                        <td>{row.progress}</td>
                        <td>{row.grade}</td>
                        <td>{row.lastActivity}</td>
                      </>
                    )}
                    {selectedReport === 'income' && (
                      <>
                        <td>{row.period}</td>
                        <td>${row.totalIncome.toLocaleString()}</td>
                        <td>${row.courseIncome.toLocaleString()}</td>
                        <td>${row.corporateIncome.toLocaleString()}</td>
                      </>
                    )}
                    {selectedReport === 'attendance' && (
                      <>
                        <td>{row.student}</td>
                        <td>{row.totalClasses}</td>
                        <td>{row.attended}</td>
                        <td>{row.absences}</td>
                        <td>{row.attendanceRate}</td>
                      </>
                    )}
                    {selectedReport === 'company-account' && (
                      <>
                        <td>{row.date}</td>
                        <td>{row.type}</td>
                        <td>{row.number}</td>
                        <td>{row.debit ? `$${row.debit.toLocaleString()}` : '-'}</td>
                        <td>{row.credit ? `$${row.credit.toLocaleString()}` : '-'}</td>
                        <td>${row.balance.toLocaleString()}</td>
                      </>
                    )}
                    {selectedReport === 'company-performance' && (
                      <>
                        <td>{row.employee}</td>
                        <td>{row.course}</td>
                        <td>{row.level}</td>
                        <td>{row.grade}</td>
                        <td>
                          <span className={`status-badge ${row.status === 'Activo' ? 'status-active' : 'status-inactive'}`}>
                            {row.status}
                          </span>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            <Calendar size={20} />
            Reportes Disponibles
          </h3>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
          {reportTypes.map(report => {
            const Icon = report.icon
            return (
              <div key={report.id} className="card" style={{ margin: 0, cursor: 'pointer' }} onClick={() => setSelectedReport(report.id)}>
                <div className="flex items-center gap-3">
                  <div style={{ 
                    width: '40px', 
                    height: '40px', 
                    borderRadius: '0.5rem', 
                    backgroundColor: 'var(--light-blue)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    color: 'var(--primary-blue)'
                  }}>
                    <Icon size={20} />
                  </div>
                  <div>
                    <h4 style={{ fontWeight: '500', color: 'var(--gray-900)', marginBottom: '0.25rem' }}>
                      {report.name}
                    </h4>
                    <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>
                      Generar reporte detallado
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default Reports