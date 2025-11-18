const reportesFinancierosService = require('../services/reportesFinancierosService');
const { generarReporteFinancieroPDF } = require('../services/pdfExportService');
const { generarReporteFinancieroExcel } = require('../services/excelExportService');
const XLSX = require('xlsx');

/**
 * CONTROLLER: reportesFinancierosController
 * PURPOSE: Handles HTTP requests for financial reports
 * 
 * 
 */

// 
const sendSuccess = (res, data, message = 'Success', statusCode = 200) => {
    return res.status(statusCode).json({
        success: true,
        message,
        data
    });
};

const sendError = (res, error, statusCode = 500) => {
    return res.status(statusCode).json({
        success: false,
        error: error.message || error
    });
};

// ============================================
// SECTION 1: GENERATE REPORTS
// ============================================

/**
 * POST /api/reportes-financieros/generar
 * Generates new financial report for period
 */
exports.generarReporte = async (req, res) => {
    try {
        const {
            periodo,
            fechaInicio,
            fechaFin,
            totalIngresos,
            totalGastos,
            saldoPendiente,
            pagosPendientes,
            pagosVencidos,
            ingresosPorConcepto,
            ingresosPorMetodo,
            ingresosPorIdioma,
            gastosPorCategoria,
            estudiantesConDeuda,
            proyeccionIngresos,
            notas
        } = req.body;

        // 
        if (!periodo) {
            return sendError(res, 'Falta dato requerido: periodo (formato: YYYY-Q1 o YYYY-MM)', 400);
        }

        const generadoPorId = req.user.id;

        const reporte = await reportesFinancierosService.generarReporteFinanciero({
            periodo,
            fechaInicio,
            fechaFin,
            totalIngresos,
            totalGastos,
            saldoPendiente,
            pagosPendientes,
            pagosVencidos,
            ingresosPorConcepto,
            ingresosPorMetodo,
            ingresosPorIdioma,
            gastosPorCategoria,
            estudiantesConDeuda,
            proyeccionIngresos,
            notas,
            generadoPorId
        });

        return sendSuccess(res, reporte, 'Reporte financiero generado exitosamente', 201);
    } catch (error) {
        console.error('Error en generarReporte:', error);
        return sendError(res, error.message, 500);
    }
};

/**
 * POST /api/reportes-financieros/generar-automatico
 * Generates automatic report for current period
 */
exports.generarReporteAutomatico = async (req, res) => {
    try {
        const generadoPorId = req.user.id;

        const reporte = await reportesFinancierosService.generarReporteAutomatico(generadoPorId);

        return sendSuccess(res, reporte, 'Reporte automático generado exitosamente', 201);
    } catch (error) {
        console.error('Error en generarReporteAutomatico:', error);
        return sendError(res, error.message, 500);
    }
};

// ============================================
// SECTION 2: GET REPORTS
// ============================================

/**
 * GET /api/reportes-financieros/periodo/:periodo
 * Gets report by specific period
 */
exports.obtenerReportePorPeriodo = async (req, res) => {
    try {
        const { periodo } = req.params;

        const reporte = await reportesFinancierosService.obtenerReportePorPeriodo(periodo);

        if (!reporte) {
            return sendError(res, 'Reporte no encontrado para ese período', 404);
        }

        return sendSuccess(res, reporte, 'Reporte obtenido exitosamente');
    } catch (error) {
        console.error('Error en obtenerReportePorPeriodo:', error);
        return sendError(res, error.message, 500);
    }
};

/**
 * GET /api/reportes-financieros/recientes
 * Gets most recent reports
 */
exports.obtenerReportesRecientes = async (req, res) => {
    try {
        const { limite } = req.query;
        const limiteNum = limite ? parseInt(limite) : 5;

        const reportes = await reportesFinancierosService.obtenerReportesRecientes(limiteNum);

        return sendSuccess(res, reportes, 'Reportes recientes obtenidos exitosamente');
    } catch (error) {
        console.error('Error en obtenerReportesRecientes:', error);
        return sendError(res, error.message, 500);
    }
};

/**
 * GET /api/reportes-financieros
 * Gets all reports with optional filters
 */
exports.obtenerTodosReportes = async (req, res) => {
    try {
        const { desde, hasta } = req.query;

        const reportes = await reportesFinancierosService.obtenerTodosReportes({
            desde,
            hasta
        });

        return sendSuccess(res, reportes, 'Reportes obtenidos exitosamente');
    } catch (error) {
        console.error('Error en obtenerTodosReportes:', error);
        return sendError(res, error.message, 500);
    }
};

// ============================================
// SECTION 3: UPDATE REPORTS
// ============================================

/**
 * PUT /api/reportes-financieros/periodo/:periodo
 * Updates existing report
 */
exports.actualizarReporte = async (req, res) => {
    try {
        const { periodo } = req.params;
        const datosActualizacion = req.body;

        const reporte = await reportesFinancierosService.actualizarReporte(
            periodo,
            datosActualizacion
        );

        return sendSuccess(res, reporte, 'Reporte actualizado exitosamente');
    } catch (error) {
        console.error('Error en actualizarReporte:', error);
        return sendError(res, error.message, 500);
    }
};

/**
 * POST /api/reportes-financieros/periodo/:periodo/deuda
 * Adds student with debt to report
 */
exports.agregarEstudianteConDeuda = async (req, res) => {
    try {
        const { periodo } = req.params;
        const { estudianteId, montoDeuda, diasVencido } = req.body;

        if (!estudianteId || !montoDeuda) {
            return sendError(res, 'Faltan datos requeridos: estudianteId, montoDeuda', 400);
        }

        const reporte = await reportesFinancierosService.agregarEstudianteConDeuda(
            periodo,
            estudianteId,
            montoDeuda,
            diasVencido
        );

        return sendSuccess(res, reporte, 'Estudiante con deuda agregado exitosamente');
    } catch (error) {
        console.error('Error en agregarEstudianteConDeuda:', error);
        return sendError(res, error.message, 500);
    }
};

// ============================================
// SECTION 4: ANALYSIS AND COMPARISONS
// ============================================

/**
 * GET /api/reportes-financieros/comparar/:periodo1/:periodo2
 * Compares two financial periods
 */
exports.compararPeriodos = async (req, res) => {
    try {
        const { periodo1, periodo2 } = req.params;

        const comparacion = await reportesFinancierosService.compararPeriodos(periodo1, periodo2);

        return sendSuccess(res, comparacion, 'Comparación generada exitosamente');
    } catch (error) {
        console.error('Error en compararPeriodos:', error);
        return sendError(res, error.message, 500);
    }
};

/**
 * GET /api/reportes-financieros/tendencias
 * Gets financial trends from recent periods
 */
exports.obtenerTendencias = async (req, res) => {
    try {
        const { cantidad } = req.query;
        const cantidadNum = cantidad ? parseInt(cantidad) : 4;

        const tendencias = await reportesFinancierosService.calcularTendencias(cantidadNum);

        return sendSuccess(res, tendencias, 'Tendencias calculadas exitosamente');
    } catch (error) {
        console.error('Error en obtenerTendencias:', error);
        return sendError(res, error.message, 500);
    }
};

/**
 * GET /api/reportes-financieros/morosidad
 * Obtiene estadísticas de morosidad
 */
exports.obtenerEstadisticasMorosidad = async (req, res) => {
    try {
        const estadisticas = await reportesFinancierosService.obtenerEstadisticasMorosidad();

        return sendSuccess(res, estadisticas, 'Estadísticas de morosidad obtenidas exitosamente');
    } catch (error) {
        console.error('Error en obtenerEstadisticasMorosidad:', error);
        return sendError(res, error.message, 500);
    }
};

/**
 * GET /api/reportes-financieros/proyeccion
 * Calculates income projection for next period
 */
exports.calcularProyeccion = async (req, res) => {
    try {
        const proyeccion = await reportesFinancierosService.calcularProyeccion();

        return sendSuccess(
            res,
            { proyeccionIngresos: proyeccion },
            'Proyección calculada exitosamente'
        );
    } catch (error) {
        console.error('Error en calcularProyeccion:', error);
        return sendError(res, error.message, 500);
    }
};

// ============================================
// SECTION 5: EXPORT
// ============================================

/**
 * GET /api/reportes-financieros/periodo/:periodo/exportar-pdf
 * Exports financial report to PDF
 */
exports.exportarPDF = async (req, res) => {
    try {
        const { periodo } = req.params;

        const reporte = await reportesFinancierosService.obtenerReportePorPeriodo(periodo);

        if (!reporte) {
            return res.status(404).json({ success: false, error: 'Reporte no encontrado' });
        }

        const doc = generarReporteFinancieroPDF(reporte);
        const filename = `reporte-financiero-${periodo}.pdf`;

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Length', doc.length || 0);

        doc.on('error', (err) => {
            console.error('PDF generation error:', err);
            if (!res.headersSent) {
                res.status(500).json({ success: false, error: 'Error generando PDF' });
            }
        });

        doc.pipe(res);
        doc.end();
    } catch (error) {
        console.error('Error en exportarPDF:', error);
        if (!res.headersSent) {
            return res.status(500).json({ success: false, error: error.message });
        }
    }
};

/**
 * GET /api/reportes-financieros/periodo/:periodo/exportar-excel
 * Exports financial report to Excel
 */
exports.exportarExcel = async (req, res) => {
    try {
        const { periodo } = req.params;

        const reporte = await reportesFinancierosService.obtenerReportePorPeriodo(periodo);

        if (!reporte) {
            return res.status(404).json({ success: false, error: 'Reporte no encontrado' });
        }

        const workbook = generarReporteFinancieroExcel(reporte);
        const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
        const filename = `reporte-financiero-${periodo}.xlsx`;

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Length', buffer.length);

        res.send(buffer);
    } catch (error) {
        console.error('Error en exportarExcel:', error);
        if (!res.headersSent) {
            return res.status(500).json({ success: false, error: error.message });
        }
    }
};

/**
 * GET /api/reportes-financieros/dashboard/financiero
 * Resumen global para el dashboard financiero (admin)
 */
exports.obtenerResumenFinancieroDashboard = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return sendError(res, 'No tienes permiso para ver este resumen', 403);
        }

        const data = await reportesFinancierosService.obtenerResumenFinancieroDashboard();
        return sendSuccess(res, data, 'Resumen financiero obtenido exitosamente');
    } catch (error) {
        console.error('Error en obtenerResumenFinancieroDashboard:', error);
        return sendError(res, error.message, 500);
    }
};

module.exports = exports;