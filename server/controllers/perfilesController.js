const perfilesService = require('../services/perfilesService');

/**
 * CONTROLLER: perfilesController
 * PROPÓSITO: Maneja las peticiones HTTP relacionadas con perfiles
 * 
 * IMPORTANTE: Este controlador debe usar los helpers de Romina cuando estén listos:
 * - const { sendSuccess, sendError } = require('../shared/helpers/responseHandler');
 * 
 * Por ahora usa respuestas estándar de Express
 */

// Helpers temporales (reemplazar con los de Romina cuando estén listos)
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

// SECCIÓN 6: PERFIL DE PROFESOR
// ============================================

/**
 * GET /api/perfiles/profesor/:id
 * Obtiene el perfil público de un profesor
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
// SECCIÓN 1: PERFIL COMPLETO DEL ESTUDIANTE
// ============================================

/**
 * GET /api/perfiles/estudiante/:id
 * Obtiene el perfil completo de un estudiante
 */
exports.obtenerPerfilEstudiante = async (req, res) => {
    try {
        const { id } = req.params;

        // Verificar permisos: solo el estudiante mismo, profesores o admin
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
 * Crea o inicializa el perfil de un estudiante
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
// SECCIÓN 2: PREFERENCIAS
// ============================================

/**
 * GET /api/perfiles/estudiante/:id/preferencias
 * Obtiene las preferencias del estudiante
 */
exports.obtenerPreferencias = async (req, res) => {
    try {
        const { id } = req.params;

        // Verificar permisos: solo el estudiante mismo o admin
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
 * Actualiza las preferencias del estudiante
 */
exports.actualizarPreferencias = async (req, res) => {
    try {
        const { id } = req.params;
        const nuevasPreferencias = req.body;

        // Verificar permisos: solo el estudiante mismo o admin
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
// SECCIÓN 3: CERTIFICADOS
// ============================================

/**
 * GET /api/perfiles/estudiante/:id/certificados
 * Obtiene todos los certificados del estudiante
 */
exports.obtenerCertificados = async (req, res) => {
    try {
        const { id } = req.params;

        // Verificar permisos: estudiante, profesor o admin
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
 * Agrega un nuevo certificado al estudiante
 */
exports.agregarCertificado = async (req, res) => {
    try {
        const { id } = req.params;
        const { cursoId, idioma, nivel } = req.body;

        // Validar datos requeridos
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
 * Verifica un certificado por su código (público, sin autenticación)
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
// SECCIÓN 4: ESTADÍSTICAS
// ============================================

/**
 * GET /api/perfiles/estudiante/:id/estadisticas
 * Obtiene las estadísticas del estudiante
 */
exports.obtenerEstadisticas = async (req, res) => {
    try {
        const { id } = req.params;

        // Verificar permisos
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
 * Recalcula las estadísticas del estudiante
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
// SECCIÓN 5: HISTORIAL DE CURSOS
// ============================================

/**
 * GET /api/perfiles/estudiante/:id/historial
 * Obtiene el historial completo de cursos
 */
exports.obtenerHistorialCursos = async (req, res) => {
    try {
        const { id } = req.params;

        // Verificar permisos
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
 * Agrega un curso al historial
 */
exports.agregarCursoHistorial = async (req, res) => {
    try {
        const { id } = req.params;
        const { cursoId, fechaInicio, fechaFin, progreso, calificacionFinal, estado } = req.body;

        // Validar datos requeridos
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