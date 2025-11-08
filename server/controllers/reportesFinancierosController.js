const reportesFinancierosService = require('../services/reportesFinancierosService');
const { generarReporteFinancieroPDF } = require('../services/pdfExportService');
const { generarReporteFinancieroExcel } = require('../services/excelExportService');
const XLSX = require('xlsx');

/**
 * CONTROLLER: reportesFinancierosController
 * PROPÓSITO: Maneja las peticiones HTTP para reportes financieros
 * 
 * IMPORTANTE: Usa helpers temporales, reemplazar con los de Romina
 */

// Helpers temporales
const sendSuccess = (res, data, message = 'Éxito', statusCode = 200) => {
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
// SECCIÓN 1: GENERAR REPORTES
// ============================================

/**
 * POST /api/reportes-financieros/generar
 * Genera un nuevo reporte financiero para un período
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

        // Validar datos requeridos
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
 * Genera reporte automático para el período actual
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
// SECCIÓN 2: OBTENER REPORTES
// ============================================

/**
 * GET /api/reportes-financieros/periodo/:periodo
 * Obtiene un reporte por período específico
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
 * Obtiene los reportes más recientes
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
 * Obtiene todos los reportes con filtros opcionales
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
// SECCIÓN 3: ACTUALIZAR REPORTES
// ============================================

/**
 * PUT /api/reportes-financieros/periodo/:periodo
 * Actualiza un reporte existente
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
 * Agrega un estudiante con deuda al reporte
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
// SECCIÓN 4: ANÁLISIS Y COMPARACIONES
// ============================================

/**
 * GET /api/reportes-financieros/comparar/:periodo1/:periodo2
 * Compara dos períodos financieros
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
 * Obtiene tendencias financieras de últimos períodos
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
 * Calcula proyección de ingresos para próximo período
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
// SECCIÓN 5: EXPORTACIÓN
// ============================================

/**
 * GET /api/reportes-financieros/periodo/:periodo/exportar-pdf
 * Exporta reporte financiero a PDF
 */
exports.exportarPDF = async (req, res) => {
    try {
        const { periodo } = req.params;

        const reporte = await reportesFinancierosService.obtenerReportePorPeriodo(periodo);

        if (!reporte) {
            return sendError(res, 'Reporte no encontrado', 404);
        }

        const doc = generarReporteFinancieroPDF(reporte);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=reporte-financiero-${periodo}.pdf`);

        doc.pipe(res);
        doc.end();
    } catch (error) {
        console.error('Error en exportarPDF:', error);
        return sendError(res, error.message, 500);
    }
};

/**
 * GET /api/reportes-financieros/periodo/:periodo/exportar-excel
 * Exporta reporte financiero a Excel
 */
exports.exportarExcel = async (req, res) => {
    try {
        const { periodo } = req.params;

        const reporte = await reportesFinancierosService.obtenerReportePorPeriodo(periodo);

        if (!reporte) {
            return sendError(res, 'Reporte no encontrado', 404);
        }

        const workbook = generarReporteFinancieroExcel(reporte);

        const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=reporte-financiero-${periodo}.xlsx`);

        res.send(buffer);
    } catch (error) {
        console.error('Error en exportarExcel:', error);
        return sendError(res, error.message, 500);
    }
};

module.exports = exports;