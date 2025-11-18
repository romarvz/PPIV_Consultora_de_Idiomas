const PDFDocument = require('pdfkit');

/**
 * Genera PDF de reporte académico
 */
const generarReporteAcademicoPDF = (reporte) => {
  const doc = new PDFDocument({ margin: 50 });
  
  // Header
  doc.fontSize(20).text('Reporte Académico', { align: 'center' });
  doc.moveDown();
  
  // Información del estudiante
  doc.fontSize(14).text('Información del Estudiante', { underline: true });
  doc.fontSize(10);
  doc.text(`Estudiante: ${reporte.estudiante?.firstName || 'N/A'} ${reporte.estudiante?.lastName || ''}`);
  doc.text(`Curso: ${reporte.curso?.nombre || 'N/A'}`);
  doc.text(`Período: ${reporte.periodo}`);
  doc.text(`Fecha: ${new Date(reporte.fechaGeneracion).toLocaleDateString()}`);
  doc.moveDown();
  
  // Estadísticas
  doc.fontSize(14).text('Estadísticas', { underline: true });
  doc.fontSize(10);
  doc.text(`Asistencia: ${reporte.porcentajeAsistencia?.toFixed(2) || 0}%`);
  doc.text(`Horas Asistidas: ${reporte.horasAsistidas?.toFixed(2) || 0} / ${reporte.horasTotales?.toFixed(2) || 0} horas`);
  
  // Calcular clases asistidas/totales desde las horas (asumiendo duración promedio de clase)
  // Si no hay horas, mostrar 0
  const horasAsistidas = reporte.horasAsistidas || 0;
  const horasTotales = reporte.horasTotales || 0;
  const duracionPromedioClase = 1.0; // Asumir 1 hora por clase como promedio
  const clasesAsistidas = Math.round(horasAsistidas / duracionPromedioClase);
  const clasesTotales = Math.round(horasTotales / duracionPromedioClase);
  doc.text(`Clases Asistidas: ${clasesAsistidas} / ${clasesTotales}`);
  
  doc.text(`Promedio General: ${reporte.calificacionPromedio?.toFixed(2) || 'N/A'}`);
  doc.moveDown();
  
  // Evaluaciones
  if (reporte.evaluaciones && reporte.evaluaciones.length > 0) {
    doc.fontSize(14).text('Evaluaciones', { underline: true });
    doc.fontSize(10);
    
    reporte.evaluaciones.forEach((evaluacion, index) => {
      doc.text(`${index + 1}. ${evaluacion.tipo || 'Evaluación'}`);
      doc.text(`   Nota: ${evaluacion.nota?.toFixed(2) || 'N/A'} - Fecha: ${evaluacion.fecha ? new Date(evaluacion.fecha).toLocaleDateString() : 'N/A'}`);
      if (evaluacion.comentarios) {
        doc.text(`   Comentarios: ${evaluacion.comentarios}`);
      }
      doc.moveDown(0.5);
    });
  } else {
    doc.fontSize(14).text('Evaluaciones', { underline: true });
    doc.fontSize(10);
    doc.text('No hay evaluaciones registradas aún.');
    doc.moveDown();
  }
  
  // Observaciones generales
  if (reporte.observaciones) {
    doc.moveDown();
    doc.fontSize(14).text('Observaciones Generales', { underline: true });
    doc.fontSize(10).text(reporte.observaciones);
  }
  
  // Footer
  doc.fontSize(8).text(
    `Generado el ${new Date().toLocaleString()}`,
    50,
    doc.page.height - 50,
    { align: 'center' }
  );
  
  return doc;
};

/**
 * Genera PDF de reporte financiero
 */
const generarReporteFinancieroPDF = (reporte) => {
  const doc = new PDFDocument({ margin: 50 });
  
  // Header
  doc.fontSize(20).text('Reporte Financiero', { align: 'center' });
  doc.moveDown();
  
  // Información del período
  doc.fontSize(14).text('Información del Período', { underline: true });
  doc.fontSize(10);
  doc.text(`Período: ${reporte.periodo}`);
  doc.text(`Tipo: ${reporte.tipoPeriodo}`);
  doc.text(`Fecha Inicio: ${new Date(reporte.fechaInicio).toLocaleDateString()}`);
  doc.text(`Fecha Fin: ${new Date(reporte.fechaFin).toLocaleDateString()}`);
  doc.moveDown();
  
  // Resumen financiero
  doc.fontSize(14).text('Resumen Financiero', { underline: true });
  doc.fontSize(10);
  doc.text(`Ingresos Totales: $${reporte.ingresosTotales?.toFixed(2) || 0}`);
  doc.text(`Gastos Totales: $${reporte.gastosTotales?.toFixed(2) || 0}`);
  doc.text(`Ganancia Neta: $${reporte.gananciaNeta?.toFixed(2) || 0}`);
  doc.text(`Margen de Ganancia: ${reporte.margenGanancia?.toFixed(2) || 0}%`);
  doc.moveDown();
  
  // Detalles de ingresos
  if (reporte.detalleIngresos) {
    doc.fontSize(14).text('Detalles de Ingresos', { underline: true });
    doc.fontSize(10);
    doc.text(`Por Matrículas: $${reporte.detalleIngresos.matriculas?.toFixed(2) || 0}`);
    doc.text(`Por Mensualidades: $${reporte.detalleIngresos.mensualidades?.toFixed(2) || 0}`);
    doc.text(`Por Materiales: $${reporte.detalleIngresos.materiales?.toFixed(2) || 0}`);
    doc.text(`Otros: $${reporte.detalleIngresos.otros?.toFixed(2) || 0}`);
    doc.moveDown();
  }
  
  // Morosidad
  doc.fontSize(14).text('Morosidad', { underline: true });
  doc.fontSize(10);
  doc.text(`Deuda Total: $${reporte.deudaTotal?.toFixed(2) || 0}`);
  doc.text(`Porcentaje de Morosidad: ${reporte.porcentajeMorosidad?.toFixed(2) || 0}%`);
  doc.text(`Estudiantes con Deuda: ${reporte.estudiantesConDeuda?.length || 0}`);
  doc.moveDown();
  
  // Observaciones
  if (reporte.observaciones) {
    doc.fontSize(14).text('Observaciones', { underline: true });
    doc.fontSize(10).text(reporte.observaciones);
  }
  
  // Footer
  doc.fontSize(8).text(
    `Generado el ${new Date().toLocaleString()}`,
    50,
    doc.page.height - 50,
    { align: 'center' }
  );
  
  return doc;
};

module.exports = {
  generarReporteAcademicoPDF,
  generarReporteFinancieroPDF
};
