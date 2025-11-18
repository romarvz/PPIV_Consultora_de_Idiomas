const perfilesService = require('../services/perfilesService');

/**
 * CONTROLLER: perfilesController
 * PURPOSE: Handles HTTP requests for profiles
 * 
 * 
 * - const { sendSuccess, sendError } = require('../shared/helpers/responseHandler');
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

// SECTION 6: TEACHER PROFILE
// ============================================

/**
 * GET /api/perfiles/profesor/:id
 * Gets teacher public profile
 */
exports.obtenerPerfilProfesor = async (req, res) => {
    try {
        const { id } = req.params;

        const perfil = await perfilesService.obtenerPerfilProfesor(id);

        if (!perfil) {
            return sendError(res, 'Profesor no encontrado', 404);
        }

        return sendSuccess(res, perfil, 'Perfil de profesor obtenido exitosamente');
    } catch (error) {
        console.error('Error en obtenerPerfilProfesor:', error);
        return sendError(res, error.message, 500);
    }
};

module.exports = exports;
// SECTION 1: COMPLETE STUDENT PROFILE
// ============================================

/**
 * GET /api/perfiles/estudiante/:id
 * Gets complete student profile
 */
exports.obtenerPerfilEstudiante = async (req, res) => {
    try {
        const { id } = req.params;

        // 
        const esPropio = req.user.id.toString() === id;
        const esProfesorOAdmin = ['profesor', 'admin'].includes(req.user.role);

        if (!esPropio && !esProfesorOAdmin) {
            return sendError(res, 'No tienes permiso para ver este perfil', 403);
        }

        const perfil = await perfilesService.obtenerPerfilCompleto(id);

        if (!perfil) {
            return sendError(res, 'Perfil no encontrado', 404);
        }

        return sendSuccess(res, perfil, 'Perfil obtenido exitosamente');
    } catch (error) {
        console.error('Error en obtenerPerfilEstudiante:', error);
        return sendError(res, error.message, 500);
    }
};

/**
 * POST /api/perfiles/estudiante/:id
 * Creates or initializes student profile
 */
exports.crearPerfilEstudiante = async (req, res) => {
    try {
        const { id } = req.params;

        const perfil = await perfilesService.crearPerfil(id);

        return sendSuccess(res, perfil, 'Perfil creado exitosamente', 201);
    } catch (error) {
        console.error('Error en crearPerfilEstudiante:', error);
        return sendError(res, error.message, 500);
    }
};

// ============================================
// SECTION 2: PREFERENCES
// ============================================

/**
 * GET /api/perfiles/estudiante/:id/preferencias
 * Gets student preferences
 */
exports.obtenerPreferencias = async (req, res) => {
    try {
        const { id } = req.params;

        // 
        const esPropio = req.user.id.toString() === id;
        const esAdmin = req.user.role === 'admin';

        if (!esPropio && !esAdmin) {
            return sendError(res, 'No tienes permiso para ver estas preferencias', 403);
        }

        const preferencias = await perfilesService.obtenerPreferencias(id);

        if (!preferencias) {
            return sendError(res, 'Preferencias no encontradas', 404);
        }

        return sendSuccess(res, preferencias, 'Preferencias obtenidas exitosamente');
    } catch (error) {
        console.error('Error en obtenerPreferencias:', error);
        return sendError(res, error.message, 500);
    }
};

/**
 * PUT /api/perfiles/estudiante/:id/preferencias
 * Updates student preferences
 */
exports.actualizarPreferencias = async (req, res) => {
    try {
        const { id } = req.params;
        const nuevasPreferencias = req.body;

        // 
        const esPropio = req.user.id.toString() === id;
        const esAdmin = req.user.role === 'admin';

        if (!esPropio && !esAdmin) {
            return sendError(res, 'No tienes permiso para modificar estas preferencias', 403);
        }

        const preferencias = await perfilesService.actualizarPreferencias(id, nuevasPreferencias);

        return sendSuccess(res, preferencias, 'Preferencias actualizadas exitosamente');
    } catch (error) {
        console.error('Error en actualizarPreferencias:', error);
        return sendError(res, error.message, 500);
    }
};

// ============================================
// SECTION 3: CERTIFICATES
// ============================================

/**
 * GET /api/perfiles/estudiante/:id/certificados
 * Gets all student certificates
 */
exports.obtenerCertificados = async (req, res) => {
    try {
        const { id } = req.params;

        // 
        const esPropio = req.user.id.toString() === id;
        const esProfesorOAdmin = ['profesor', 'admin'].includes(req.user.role);

        if (!esPropio && !esProfesorOAdmin) {
            return sendError(res, 'No tienes permiso para ver estos certificados', 403);
        }

        const certificados = await perfilesService.obtenerCertificados(id);

        return sendSuccess(res, certificados, 'Certificados obtenidos exitosamente');
    } catch (error) {
        console.error('Error en obtenerCertificados:', error);
        return sendError(res, error.message, 500);
    }
};

/**
 * POST /api/perfiles/estudiante/:id/certificados
 * Adds new certificate to student
 */
exports.agregarCertificado = async (req, res) => {
    try {
        const { id } = req.params;
        const { cursoId, idioma, nivel } = req.body;

        // 
        if (!cursoId || !idioma || !nivel) {
            return sendError(res, 'Faltan datos requeridos: cursoId, idioma, nivel', 400);
        }

        const certificado = await perfilesService.agregarCertificado(id, {
            cursoId,
            idioma,
            nivel
        });

        return sendSuccess(res, certificado, 'Certificado agregado exitosamente', 201);
    } catch (error) {
        console.error('Error en agregarCertificado:', error);
        return sendError(res, error.message, 500);
    }
};

/**
 * GET /api/perfiles/certificado/verificar/:codigo
 * Verifies certificate by code (public, no auth)
 */
exports.verificarCertificado = async (req, res) => {
    try {
        const { codigo } = req.params;

        const resultado = await perfilesService.verificarCertificado(codigo);

        if (!resultado) {
            return sendError(res, 'Certificado no encontrado o inválido', 404);
        }

        return sendSuccess(res, resultado, 'Certificado verificado exitosamente');
    } catch (error) {
        console.error('Error en verificarCertificado:', error);
        return sendError(res, error.message, 500);
    }
};

// ============================================
// SECTION 4: STATISTICS
// ============================================

/**
 * GET /api/perfiles/estudiante/:id/estadisticas
 * Gets student statistics
 */
exports.obtenerEstadisticas = async (req, res) => {
    try {
        const { id } = req.params;

        // 
        const esPropio = req.user.id.toString() === id;
        const esProfesorOAdmin = ['profesor', 'admin'].includes(req.user.role);

        if (!esPropio && !esProfesorOAdmin) {
            return sendError(res, 'No tienes permiso para ver estas estadísticas', 403);
        }

        const estadisticas = await perfilesService.obtenerEstadisticas(id);

        if (!estadisticas) {
            return sendError(res, 'Estadísticas no encontradas', 404);
        }

        return sendSuccess(res, estadisticas, 'Estadísticas obtenidas exitosamente');
    } catch (error) {
        console.error('Error en obtenerEstadisticas:', error);
        return sendError(res, error.message, 500);
    }
};

/**
 * PUT /api/perfiles/estudiante/:id/estadisticas/actualizar
 * Recalculates student statistics
 */
exports.actualizarEstadisticas = async (req, res) => {
    try {
        const { id } = req.params;

        const estadisticas = await perfilesService.actualizarEstadisticas(id);

        return sendSuccess(res, estadisticas, 'Estadísticas actualizadas exitosamente');
    } catch (error) {
        console.error('Error en actualizarEstadisticas:', error);
        return sendError(res, error.message, 500);
    }
};

// ============================================
// SECTION 5: COURSE HISTORY
// ============================================

/**
 * GET /api/perfiles/estudiante/:id/historial
 * Gets complete course history
 */
exports.obtenerHistorialCursos = async (req, res) => {
    try {
        const { id } = req.params;

        // 
        const esPropio = req.user.id.toString() === id;
        const esProfesorOAdmin = ['profesor', 'admin'].includes(req.user.role);

        if (!esPropio && !esProfesorOAdmin) {
            return sendError(res, 'No tienes permiso para ver este historial', 403);
        }

        const historial = await perfilesService.obtenerHistorialCursos(id);

        return sendSuccess(res, historial, 'Historial obtenido exitosamente');
    } catch (error) {
        console.error('Error en obtenerHistorialCursos:', error);
        return sendError(res, error.message, 500);
    }
};

/**
 * POST /api/perfiles/estudiante/:id/historial
 * Adds course to history
 */
exports.agregarCursoHistorial = async (req, res) => {
    try {
        const { id } = req.params;
        const { cursoId, fechaInicio, fechaFin, progreso, calificacionFinal, estado } = req.body;

        // 
        if (!cursoId || !fechaInicio) {
            return sendError(res, 'Faltan datos requeridos: cursoId, fechaInicio', 400);
        }

        const cursoHistorial = await perfilesService.agregarCursoHistorial(id, {
            cursoId,
            fechaInicio,
            fechaFin,
            progreso,
            calificacionFinal,
            estado
        });

        return sendSuccess(res, cursoHistorial, 'Curso agregado al historial exitosamente', 201);
    } catch (error) {
        console.error('Error en agregarCursoHistorial:', error);
        return sendError(res, error.message, 500);
    }
};

// ============================================