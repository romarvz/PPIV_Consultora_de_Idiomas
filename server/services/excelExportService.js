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
    
    reporte.evaluaciones.forEach(eval => {
      evaluacionesData.push([
        eval.tipo,
        eval.nombre,
        eval.nota,
        new Date(eval.fecha).toLocaleDateString(),
        eval.observaciones || ''
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
  
  // Hoja 1: Resumen
  const resumenData = [
    ['REPORTE FINANCIERO'],
    [],
    ['Período', reporte.periodo],
    ['Tipo', reporte.tipoPeriodo],
    ['Fecha Inicio', new Date(reporte.fechaInicio).toLocaleDateString()],
    ['Fecha Fin', new Date(reporte.fechaFin).toLocaleDateString()],
    [],
    ['RESUMEN FINANCIERO'],
    ['Ingresos Totales', reporte.ingresosTotales?.toFixed(2) || 0],
    ['Gastos Totales', reporte.gastosTotales?.toFixed(2) || 0],
    ['Ganancia Neta', reporte.gananciaNeta?.toFixed(2) || 0],
    ['Margen de Ganancia', `${reporte.margenGanancia?.toFixed(2) || 0}%`],
    [],
    ['MOROSIDAD'],
    ['Deuda Total', reporte.deudaTotal?.toFixed(2) || 0],
    ['Porcentaje Morosidad', `${reporte.porcentajeMorosidad?.toFixed(2) || 0}%`],
    ['Estudiantes con Deuda', reporte.estudiantesConDeuda?.length || 0],
  ];
  
  const wsResumen = XLSX.utils.aoa_to_sheet(resumenData);
  XLSX.utils.book_append_sheet(workbook, wsResumen, 'Resumen');
  
  // Hoja 2: Detalles de Ingresos
  if (reporte.detalleIngresos) {
    const ingresosData = [
      ['Concepto', 'Monto'],
      ['Matrículas', reporte.detalleIngresos.matriculas?.toFixed(2) || 0],
      ['Mensualidades', reporte.detalleIngresos.mensualidades?.toFixed(2) || 0],
      ['Materiales', reporte.detalleIngresos.materiales?.toFixed(2) || 0],
      ['Otros', reporte.detalleIngresos.otros?.toFixed(2) || 0],
    ];
    
    const wsIngresos = XLSX.utils.aoa_to_sheet(ingresosData);
    XLSX.utils.book_append_sheet(workbook, wsIngresos, 'Ingresos');
  }
  
  // Hoja 3: Estudiantes con Deuda
  if (reporte.estudiantesConDeuda && reporte.estudiantesConDeuda.length > 0) {
    const deudaData = [
      ['Estudiante', 'Monto Deuda', 'Meses Atrasados']
    ];
    
    reporte.estudiantesConDeuda.forEach(est => {
      deudaData.push([
        est.nombre || 'N/A',
        est.montoDeuda?.toFixed(2) || 0,
        est.mesesAtrasados || 0
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
