import React, { useState } from 'react';
import './Reports.css';

const Reports = () => {
  const [reportType, setReportType] = useState('academic');
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  });

  const generateReport = () => {
    console.log('Generando reporte:', { reportType, dateRange });
  };

  return (
    <div className="reports-page">
      <div className="page-header">
        <h1>Reportes e Indicadores</h1>
      </div>

      <div className="reports-grid">
        <div className="report-card">
          <h3>📊 Reporte Académico</h3>
          <p>Progreso de estudiantes por curso y período</p>
          <button 
            className="btn btn-primary"
            onClick={() => setReportType('academic')}
          >
            Generar
          </button>
        </div>

        <div className="report-card">
          <h3>💰 Reporte de Ingresos</h3>
          <p>Ingresos totales y por curso en período seleccionado</p>
          <button 
            className="btn btn-primary"
            onClick={() => setReportType('income')}
          >
            Generar
          </button>
        </div>

        <div className="report-card">
          <h3>👥 Reporte de Asistencia</h3>
          <p>Estadísticas de asistencia por estudiante y curso</p>
          <button 
            className="btn btn-primary"
            onClick={() => setReportType('attendance')}
          >
            Generar
          </button>
        </div>

        <div className="report-card">
          <h3>👨🏫 Reporte de Profesores</h3>
          <p>Horas dictadas y evaluaciones de desempeño</p>
          <button 
            className="btn btn-primary"
            onClick={() => setReportType('teachers')}
          >
            Generar
          </button>
        </div>
      </div>

      <div className="report-filters card">
        <h3>Filtros de Reporte</h3>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Fecha Inicio</label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
              className="form-control"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Fecha Fin</label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
              className="form-control"
            />
          </div>
        </div>
        <button className="btn btn-success" onClick={generateReport}>
          📄 Generar Reporte PDF
        </button>
      </div>
    </div>
  );
};

export default Reports;