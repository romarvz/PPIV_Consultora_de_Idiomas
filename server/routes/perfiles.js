const express = require('express');
const router = express.Router();
const perfilesController = require('../controllers/perfilesController');
const { authenticateToken, requireRole } = require('../middleware/authMiddlewareNew');
/**
 * RUTAS: Perfiles
 * BASE URL: /api/perfiles
 * 
 * Todas las rutas requieren autenticación
 * Algunas requieren roles específicos
 */

// ============================================
// PROTEGER TODAS LAS RUTAS CON AUTENTICACIÓN
// ============================================
router.use(authenticateToken);

// ============================================
// SECCIÓN 1: PERFIL COMPLETO DEL ESTUDIANTE
// ============================================

/**
 * GET /api/perfiles/estudiante/:id
 * Obtiene el perfil completo de un estudiante
 * Acceso: Estudiante (propio), Profesor, Admin
 */
router.get('/estudiante/:id', perfilesController.obtenerPerfilEstudiante);

/**
 * POST /api/perfiles/estudiante/:id
 * Crea o inicializa el perfil de un estudiante
 * Acceso: Admin
 */
router.post('/estudiante/:id',
    requireRole(['admin']),
    perfilesController.crearPerfilEstudiante
);

// ============================================
// SECCIÓN 2: PREFERENCIAS DEL ESTUDIANTE
// ============================================

/**
 * GET /api/perfiles/estudiante/:id/preferencias
 * Obtiene solo las preferencias del estudiante
 * Acceso: Estudiante (propio), Admin
 */
router.get('/estudiante/:id/preferencias', perfilesController.obtenerPreferencias);

/**
 * PUT /api/perfiles/estudiante/:id/preferencias
 * Actualiza las preferencias del estudiante (horarios, modalidad, idiomas)
 * Acceso: Estudiante (propio), Admin
 */
router.put('/estudiante/:id/preferencias', perfilesController.actualizarPreferencias);

// ============================================
// SECCIÓN 3: CERTIFICADOS
// ============================================

/**
 * GET /api/perfiles/estudiante/:id/certificados
 * Obtiene todos los certificados del estudiante
 * Acceso: Estudiante (propio), Profesor, Admin
 */
router.get('/estudiante/:id/certificados', perfilesController.obtenerCertificados);

/**
 * POST /api/perfiles/estudiante/:id/certificados
 * Agrega un nuevo certificado al estudiante
 * Acceso: Admin, Profesor (del curso)
 */
router.post('/estudiante/:id/certificados',
    requireRole(['admin', 'profesor']),
    perfilesController.agregarCertificado
);

/**
 * GET /api/perfiles/certificado/verificar/:codigo
 * Verifica la autenticidad de un certificado por código
 * Acceso: Público (sin autenticación necesaria)
 */
router.get('/certificado/verificar/:codigo', perfilesController.verificarCertificado);

// ============================================
// SECCIÓN 4: ESTADÍSTICAS
// ============================================

/**
 * GET /api/perfiles/estudiante/:id/estadisticas
 * Obtiene las estadísticas del estudiante
 * Acceso: Estudiante (propio), Profesor, Admin
 */
router.get('/estudiante/:id/estadisticas', perfilesController.obtenerEstadisticas);

/**
 * PUT /api/perfiles/estudiante/:id/estadisticas/actualizar
 * Recalcula las estadísticas del estudiante
 * Acceso: Admin
 */
router.put('/estudiante/:id/estadisticas/actualizar',
    requireRole(['admin']),
    perfilesController.actualizarEstadisticas
);

// ============================================
// SECCIÓN 5: HISTORIAL DE CURSOS
// ============================================

/**
 * GET /api/perfiles/estudiante/:id/historial
 * Obtiene el historial completo de cursos del estudiante
 * Acceso: Estudiante (propio), Profesor, Admin
 */
router.get('/estudiante/:id/historial', perfilesController.obtenerHistorialCursos);

/**
 * POST /api/perfiles/estudiante/:id/historial
 * Agrega un curso al historial del estudiante
 * Acceso: Admin (se llama automáticamente cuando termina un curso)
 */
router.post('/estudiante/:id/historial',
    requireRole(['admin']),
    perfilesController.agregarCursoHistorial
);

// ============================================
// SECCIÓN 6: PERFIL DE PROFESOR (OPCIONAL)
// ============================================

/**
 * GET /api/perfiles/profesor/:id
 * Obtiene el perfil público de un profesor
 * Acceso: Todos los usuarios autenticados
 */
router.get('/profesor/:id', perfilesController.obtenerPerfilProfesor);

module.exports = router;