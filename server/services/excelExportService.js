const XLSX = require('xlsx');

/**
 * Genera Excel de reporte académico
 */
const generarReporteAcademicoExcel = (reporte) => {
  const workbook = XLSX.utils.book_new();
  
  // Hoja 1: Resumen
  const resumenData = [
    ['REPORTE ACADÉMICO'],
    [],
    ['Estudiante', `${reporte.estudiante?.firstName || 'N/A'} ${reporte.estudiante?.lastName || ''}`],
    ['Curso', reporte.curso?.nombre || 'N/A'],
    ['Período', reporte.periodo],
    ['Fecha Generación', new Date(reporte.fechaGeneracion).toLocaleDateString()],
    [],
    ['ESTADÍSTICAS'],
    ['Asistencia', `${reporte.porcentajeAsistencia?.toFixed(2) || 0}%`],
    ['Clases Asistidas', `${reporte.clasesAsistidas || 0} / ${reporte.clasesTotales || 0}`],
    ['Promedio General', reporte.promedioGeneral?.toFixed(2) || 0],
  ];
  
  const wsResumen = XLSX.utils.aoa_to_sheet(resumenData);
  XLSX.utils.book_append_sheet(workbook, wsResumen, 'Resumen');
  
  // Hoja 2: Evaluaciones
  if (reporte.evaluaciones && reporte.evaluaciones.length > 0) {
    const evaluacionesData = [
      ['Tipo', 'Nombre', 'Nota', 'Fecha', 'Observaciones']
    ];
    
    reporte.evaluaciones.forEach(evaluacion => {
      evaluacionesData.push([
        evaluacion.tipo,
        evaluacion.nombre,
        evaluacion.nota,
        new Date(evaluacion.fecha).toLocaleDateString(),
        evaluacion.observaciones || ''
      ]);
    });
    
    const wsEvaluaciones = XLSX.utils.aoa_to_sheet(evaluacionesData);
    XLSX.utils.book_append_sheet(workbook, wsEvaluaciones, 'Evaluaciones');
  }
  
  return workbook;
};

/**
 * Genera Excel de reporte financiero
 */
const generarReporteFinancieroExcel = (reporte) => {
  const workbook = XLSX.utils.book_new();
  
  // Determinar tipo de período
  const tipoPeriodo = reporte.periodo?.includes('Q') ? 'Trimestral' : 'Mensual';
  
  // Hoja 1: Resumen
  const resumenData = [
    ['REPORTE FINANCIERO'],
    [],
    ['Período', reporte.periodo || 'N/A'],
    ['Tipo', tipoPeriodo],
    ['Fecha Inicio', reporte.fechaInicio ? new Date(reporte.fechaInicio).toLocaleDateString() : 'N/A'],
    ['Fecha Fin', reporte.fechaFin ? new Date(reporte.fechaFin).toLocaleDateString() : 'N/A'],
    ['Fecha Generación', reporte.fechaGeneracion ? new Date(reporte.fechaGeneracion).toLocaleDateString() : 'N/A'],
    [],
    ['RESUMEN FINANCIERO'],
    ['Ingresos Totales', reporte.totalIngresos?.toFixed(2) || 0],
    ['Gastos Totales', reporte.totalGastos?.toFixed(2) || 0],
    ['Utilidad Neta', reporte.utilidadNeta?.toFixed(2) || 0],
    ['Saldo Pendiente', reporte.saldoPendiente?.toFixed(2) || 0],
    ['Pagos Pendientes', reporte.pagosPendientes || 0],
    ['Pagos Vencidos', reporte.pagosVencidos || 0],
    [],
    ['MOROSIDAD'],
    ['Deuda Total', reporte.saldoPendiente?.toFixed(2) || 0],
    ['Estudiantes con Deuda', reporte.estudiantesConDeuda?.length || 0],
  ];
  
  const wsResumen = XLSX.utils.aoa_to_sheet(resumenData);
  XLSX.utils.book_append_sheet(workbook, wsResumen, 'Resumen');
  
  // Hoja 2: Detalles de Ingresos por Concepto
  if (reporte.ingresosPorConcepto) {
    const ingresosData = [
      ['Concepto', 'Monto']
    ];
    
    if (reporte.ingresosPorConcepto.inscripciones !== undefined) {
      ingresosData.push(['Inscripciones', reporte.ingresosPorConcepto.inscripciones?.toFixed(2) || 0]);
    }
    if (reporte.ingresosPorConcepto.mensualidades !== undefined) {
      ingresosData.push(['Mensualidades', reporte.ingresosPorConcepto.mensualidades?.toFixed(2) || 0]);
    }
    if (reporte.ingresosPorConcepto.clasesParticulares !== undefined) {
      ingresosData.push(['Clases Particulares', reporte.ingresosPorConcepto.clasesParticulares?.toFixed(2) || 0]);
    }
    if (reporte.ingresosPorConcepto.otros !== undefined) {
      ingresosData.push(['Otros', reporte.ingresosPorConcepto.otros?.toFixed(2) || 0]);
    }
    
    const wsIngresos = XLSX.utils.aoa_to_sheet(ingresosData);
    XLSX.utils.book_append_sheet(workbook, wsIngresos, 'Ingresos por Concepto');
  }
  
  // Hoja 3: Ingresos por Método de Pago
  if (reporte.ingresosPorMetodo) {
    const metodoData = [
      ['Método de Pago', 'Monto']
    ];
    
    if (reporte.ingresosPorMetodo.transferencia !== undefined) {
      metodoData.push(['Transferencia', reporte.ingresosPorMetodo.transferencia?.toFixed(2) || 0]);
    }
    if (reporte.ingresosPorMetodo.efectivo !== undefined) {
      metodoData.push(['Efectivo', reporte.ingresosPorMetodo.efectivo?.toFixed(2) || 0]);
    }
    if (reporte.ingresosPorMetodo.tarjeta !== undefined) {
      metodoData.push(['Tarjeta', reporte.ingresosPorMetodo.tarjeta?.toFixed(2) || 0]);
    }
    if (reporte.ingresosPorMetodo.mercadopago !== undefined) {
      metodoData.push(['MercadoPago', reporte.ingresosPorMetodo.mercadopago?.toFixed(2) || 0]);
    }
    
    const wsMetodo = XLSX.utils.aoa_to_sheet(metodoData);
    XLSX.utils.book_append_sheet(workbook, wsMetodo, 'Ingresos por Método');
  }
  
  // Hoja 4: Estudiantes con Deuda
  if (reporte.estudiantesConDeuda && reporte.estudiantesConDeuda.length > 0) {
    const deudaData = [
      ['Estudiante', 'Monto Deuda']
    ];
    
    reporte.estudiantesConDeuda.forEach(est => {
      const nombreEstudiante = est.estudiante 
        ? `${est.estudiante.firstName || ''} ${est.estudiante.lastName || ''}`.trim() || 'N/A'
        : 'N/A';
      deudaData.push([
        nombreEstudiante,
        est.montoDeuda?.toFixed(2) || 0
      ]);
    });
    
    const wsDeuda = XLSX.utils.aoa_to_sheet(deudaData);
    XLSX.utils.book_append_sheet(workbook, wsDeuda, 'Deudas');
  }
  
  return workbook;
};

module.exports = {
  generarReporteAcademicoExcel,
  generarReporteFinancieroExcel
};
