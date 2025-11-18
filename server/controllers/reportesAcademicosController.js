const reportesAcademicosService = require('../services/reportesAcademicosService');
const { generarReporteAcademicoPDF } = require('../services/pdfExportService');
const { generarReporteAcademicoExcel } = require('../services/excelExportService');
const XLSX = require('xlsx');

/**
 * CONTROLLER: reportesAcademicosController
 * PURPOSE: Handles HTTP requests for academic reports
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
 * POST /api/reportes-academicos/generar
 * Generates new academic report
 */
exports.generarReporte = async (req, res) => {
    try {
        const {
            estudianteId,
            cursoId,
            periodo,
            horasAsistidas,
            horasTotales,
            progreso,
            evaluaciones,
            comentariosProfesor,
            fortalezas,
            areasAMejorar
        } = req.body;

        // 
        if (!estudianteId || !cursoId) {
            return sendError(res, 'Faltan datos requeridos: estudianteId, cursoId', 400);
        }

        // 
        const generadoPorId = req.user.id;

        const reporte = await reportesAcademicosService.generarReporteAcademico({
            estudianteId,
            cursoId,
            periodo,
            horasAsistidas,
            horasTotales,
            progreso,
            evaluaciones,
            comentariosProfesor,
            fortalezas,
            areasAMejorar,
            generadoPorId
        });

        return sendSuccess(res, reporte, 'Reporte académico generado exitosamente', 201);
    } catch (error) {
        console.error('Error en generarReporte:', error);
        return sendError(res, error.message, 500);
    }
};

/**
 * POST /api/reportes-academicos/generar-automatico/:cursoId
 * Generates automatic reports for all course students
 */
exports.generarReportesAutomaticos = async (req, res) => {
    try {
        const { cursoId } = req.params;
        const generadoPorId = req.user.id;

        const reportes = await reportesAcademicosService.generarReportesAutomaticosCurso(
            cursoId,
            generadoPorId
        );

        return sendSuccess(res, reportes, 'Reportes automáticos generados exitosamente', 201);
    } catch (error) {
        console.error('Error en generarReportesAutomaticos:', error);
        return sendError(res, error.message, 500);
    }
};

// ============================================
// SECTION 2: GET REPORTS
// ============================================

/**
 * GET /api/reportes-academicos/estudiantes-en-riesgo/asistencia
 * Devuelve listado global de estudiantes en riesgo por inasistencias
 */
exports.obtenerEstudiantesEnRiesgoAsistencia = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return sendError(res, 'No tienes permiso para ver este reporte', 403);
        }

        const datos = await reportesAcademicosService.obtenerEstudiantesEnRiesgoAsistencia();
        return sendSuccess(res, datos, 'Estudiantes en riesgo por inasistencias obtenidos exitosamente');
    } catch (error) {
        console.error('Error en obtenerEstudiantesEnRiesgoAsistencia:', error);
        return sendError(res, error.message, 500);
    }
};

/**
 * GET /api/reportes-academicos/dashboard/academico
 * Resumen global para el dashboard académico (admin)
 */
exports.obtenerResumenAcademicoDashboard = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return sendError(res, 'No tienes permiso para ver este resumen', 403);
        }

        const data = await reportesAcademicosService.obtenerResumenAcademicoDashboard();
        return sendSuccess(res, data, 'Resumen académico obtenido exitosamente');
    } catch (error) {
        console.error('Error en obtenerResumenAcademicoDashboard:', error);
        return sendError(res, error.message, 500);
    }
};

/**
 * GET /api/reportes-academicos/:id
 * Gets specific report by ID
 */
exports.obtenerReportePorId = async (req, res) => {
    try {
        const { id } = req.params;

        const reporte = await reportesAcademicosService.obtenerReportePorId(id);

        if (!reporte) {
            return sendError(res, 'Reporte no encontrado', 404);
        }

        // 
        const esEstudiante = reporte.estudiante._id.toString() === req.user.id.toString();
        const esProfesorOAdmin = ['profesor', 'admin'].includes(req.user.role);

        if (!esEstudiante && !esProfesorOAdmin) {
            return sendError(res, 'No tienes permiso para ver este reporte', 403);
        }

        return sendSuccess(res, reporte, 'Reporte obtenido exitosamente');
    } catch (error) {
        console.error('Error en obtenerReportePorId:', error);
        return sendError(res, error.message, 500);
    }
};

/**
 * GET /api/reportes-academicos/estudiante/:estudianteId
 * Gets all student reports
 */
exports.obtenerReportesPorEstudiante = async (req, res) => {
    try {
        const { estudianteId } = req.params;
        const { periodo, estado, cursoId } = req.query;

        // 
        const esPropio = req.user.id.toString() === estudianteId;
        const esProfesorOAdmin = ['profesor', 'admin'].includes(req.user.role);

        if (!esPropio && !esProfesorOAdmin) {
            return sendError(res, 'No tienes permiso para ver estos reportes', 403);
        }

        const reportes = await reportesAcademicosService.obtenerReportesPorEstudiante(
            estudianteId,
            { periodo, estado, cursoId }
        );

        return sendSuccess(res, reportes, 'Reportes obtenidos exitosamente');
    } catch (error) {
        console.error('Error en obtenerReportesPorEstudiante:', error);
        return sendError(res, error.message, 500);
    }
};

/**
 * GET /api/reportes-academicos/recientes
 * Gets recent reports (for dashboard)
 * Acceso: Admin
 */
exports.obtenerReportesRecientes = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return sendError(res, 'No tienes permiso para ver estos reportes', 403);
        }

        const limite = parseInt(req.query.limite) || 50;
        const reportes = await reportesAcademicosService.obtenerReportesRecientes(limite);

        return sendSuccess(res, reportes, 'Reportes recientes obtenidos exitosamente');
    } catch (error) {
        console.error('Error en obtenerReportesRecientes:', error);
        return sendError(res, error.message, 500);
    }
};

/**
 * GET /api/reportes-academicos/curso/:cursoId
 * Gets all course reports
 */
exports.obtenerReportesPorCurso = async (req, res) => {
    try {
        const { cursoId } = req.params;
        const { periodo, estado } = req.query;

        // Solo profesores y admin pueden ver reportes de todo un curso
        if (!['profesor', 'admin'].includes(req.user.role)) {
            return sendError(res, 'No tienes permiso para ver estos reportes', 403);
        }

        const reportes = await reportesAcademicosService.obtenerReportesPorCurso(
            cursoId,
            { periodo, estado }
        );

        return sendSuccess(res, reportes, 'Reportes del curso obtenidos exitosamente');
    } catch (error) {
        console.error('Error en obtenerReportesPorCurso:', error);
        return sendError(res, error.message, 500);
    }
};

/**
 * GET /api/reportes-academicos/periodo/:periodo
 * Gets all period reports
 */
exports.obtenerReportesPorPeriodo = async (req, res) => {
    try {
        const { periodo } = req.params;

        // Solo admin puede ver reportes de todo un período
        if (req.user.role !== 'admin') {
            return sendError(res, 'No tienes permiso para ver estos reportes', 403);
        }

        const reportes = await reportesAcademicosService.obtenerReportesPorPeriodo(periodo);

        return sendSuccess(res, reportes, 'Reportes del período obtenidos exitosamente');
    } catch (error) {
        console.error('Error en obtenerReportesPorPeriodo:', error);
        return sendError(res, error.message, 500);
    }
};

// ============================================
// SECTION 3: UPDATE REPORTS
// ============================================

/**
 * DELETE /api/reportes-academicos/:id
 * Elimina un reporte académico
 * Acceso: Admin
 */
exports.eliminarReporte = async (req, res) => {
    try {
        const { id } = req.params;

        if (req.user.role !== 'admin') {
            return sendError(res, 'Solo los administradores pueden eliminar reportes', 403);
        }

        const reporte = await reportesAcademicosService.eliminarReporte(id);

        return sendSuccess(res, reporte, 'Reporte eliminado exitosamente');
    } catch (error) {
        console.error('Error en eliminarReporte:', error);
        return sendError(res, error.message, 500);
    }
};

/**
 * PUT /api/reportes-academicos/:id
 * Updates existing report
 */
exports.actualizarReporte = async (req, res) => {
    try {
        const { id } = req.params;
        const datosActualizacion = req.body;

        const reporte = await reportesAcademicosService.actualizarReporte(
            id,
            datosActualizacion
        );

        return sendSuccess(res, reporte, 'Reporte actualizado exitosamente');
    } catch (error) {
        console.error('Error en actualizarReporte:', error);
        return sendError(res, error.message, 500);
    }
};

/**
 * POST /api/reportes-academicos/:id/evaluacion
 * Adds evaluation to report
 */
exports.agregarEvaluacion = async (req, res) => {
    try {
        const { id } = req.params;
        const { tipo, nota, fecha, comentarios } = req.body;

        // 
        if (!tipo || nota === undefined) {
            return sendError(res, 'Faltan datos requeridos: tipo, nota', 400);
        }

        const reporte = await reportesAcademicosService.agregarEvaluacion(id, {
            tipo,
            nota,
            fecha,
            comentarios
        });

        return sendSuccess(res, reporte, 'Evaluación agregada exitosamente', 201);
    } catch (error) {
        console.error('Error en agregarEvaluacion:', error);
        return sendError(res, error.message, 500);
    }
};

// ============================================
// SECTION 4: STATISTICS AND ANALYSIS
// ============================================

/**
 * GET /api/reportes-academicos/estudiante/:estudianteId/estadisticas
 * Gets general student statistics
 */
exports.obtenerEstadisticasEstudiante = async (req, res) => {
    try {
        const { estudianteId } = req.params;

        // 
        const esPropio = req.user.id.toString() === estudianteId;
        const esProfesorOAdmin = ['profesor', 'admin'].includes(req.user.role);

        if (!esPropio && !esProfesorOAdmin) {
            return sendError(res, 'No tienes permiso para ver estas estadísticas', 403);
        }

        const estadisticas = await reportesAcademicosService.obtenerEstadisticasEstudiante(estudianteId);

        return sendSuccess(res, estadisticas, 'Estadísticas obtenidas exitosamente');
    } catch (error) {
        console.error('Error en obtenerEstadisticasEstudiante:', error);
        return sendError(res, error.message, 500);
    }
};

/**
 * GET /api/reportes-academicos/curso/:cursoId/resumen
 * Gets course summary (all students)
 */
exports.obtenerResumenCurso = async (req, res) => {
    try {
        const { cursoId } = req.params;

        // Solo profesores y admin
        if (!['profesor', 'admin'].includes(req.user.role)) {
            return sendError(res, 'No tienes permiso para ver este resumen', 403);
        }

        const resumen = await reportesAcademicosService.obtenerResumenCurso(cursoId);

        return sendSuccess(res, resumen, 'Resumen del curso obtenido exitosamente');
    } catch (error) {
        console.error('Error en obtenerResumenCurso:', error);
        return sendError(res, error.message, 500);
    }
};

// ============================================
// SECTION 5: EXPORT
// ============================================

/**
 * GET /api/reportes-academicos/:id/exportar-pdf
 * Exports report to PDF
 */
exports.exportarPDF = async (req, res) => {
    try {
        const { id } = req.params;

        const reporte = await reportesAcademicosService.obtenerReportePorId(id);

        if (!reporte) {
            return res.status(404).json({ success: false, error: 'Reporte no encontrado' });
        }

        const esEstudiante = reporte.estudiante._id.toString() === req.user.id.toString();
        const esProfesorOAdmin = ['profesor', 'admin'].includes(req.user.role);

        if (!esEstudiante && !esProfesorOAdmin) {
            return res.status(403).json({ success: false, error: 'No tienes permiso para exportar este reporte' });
        }

        const doc = generarReporteAcademicoPDF(reporte);
        const filename = `reporte-academico-${id}.pdf`;

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
 * GET /api/reportes-academicos/:id/exportar-excel
 * Exports report to Excel
 */
exports.exportarExcel = async (req, res) => {
    try {
        const { id } = req.params;

        const reporte = await reportesAcademicosService.obtenerReportePorId(id);

        if (!reporte) {
            return res.status(404).json({ success: false, error: 'Reporte no encontrado' });
        }

        const esEstudiante = reporte.estudiante._id.toString() === req.user.id.toString();
        const esProfesorOAdmin = ['profesor', 'admin'].includes(req.user.role);

        if (!esEstudiante && !esProfesorOAdmin) {
            return res.status(403).json({ success: false, error: 'No tienes permiso para exportar este reporte' });
        }

        const workbook = generarReporteAcademicoExcel(reporte);
        const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
        const filename = `reporte-academico-${id}.xlsx`;

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

module.exports = exports;