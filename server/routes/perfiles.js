const express = require('express');
const router = express.Router();
const perfilesController = require('../controllers/perfilesController');
const { authenticateToken, requireRole } = require('../middleware/authMiddlewareNew');
/**
 * RUTAS: Perfiles
 * BASE URL: /api/perfiles
 * 
 * All routes require authentication
 * Some require specific roles
 */

// ============================================
// PROTECT ALL ROUTES WITH AUTHENTICATION
// ============================================
router.use(authenticateToken);

// ============================================
// SECTION 1: COMPLETE STUDENT PROFILE
// ============================================

/**
 * GET /api/perfiles/estudiante/:id
 * Gets complete student profile
 * Acceso: Estudiante (propio), Profesor, Admin
 */
router.get('/estudiante/:id', perfilesController.obtenerPerfilEstudiante);

/**
 * POST /api/perfiles/estudiante/:id
 * Creates or initializes student profile
 * Acceso: Admin
 */
router.post('/estudiante/:id',
    requireRole(['admin']),
    perfilesController.crearPerfilEstudiante
);

// ============================================
// SECTION 2: STUDENT PREFERENCES
// ============================================

/**
 * GET /api/perfiles/estudiante/:id/preferencias
 * Gets only student preferences
 * Acceso: Estudiante (propio), Admin
 */
router.get('/estudiante/:id/preferencias', perfilesController.obtenerPreferencias);

/**
 * PUT /api/perfiles/estudiante/:id/preferencias
 * Updates student preferences (schedules, modality, languages)
 * Acceso: Estudiante (propio), Admin
 */
router.put('/estudiante/:id/preferencias', perfilesController.actualizarPreferencias);

// ============================================
// SECTION 3: CERTIFICATES
// ============================================

/**
 * GET /api/perfiles/estudiante/:id/certificados
 * Gets all student certificates
 * Acceso: Estudiante (propio), Profesor, Admin
 */
router.get('/estudiante/:id/certificados', perfilesController.obtenerCertificados);

/**
 * POST /api/perfiles/estudiante/:id/certificados
 * Adds new certificate to student
 * Acceso: Admin, Profesor (del curso)
 */
router.post('/estudiante/:id/certificados',
    requireRole(['admin', 'profesor']),
    perfilesController.agregarCertificado
);

/**
 * GET /api/perfiles/certificado/verificar/:codigo
 * Verifies certificate authenticity by code
 * Acceso: Public (no authentication required)
 */
router.get('/certificado/verificar/:codigo', perfilesController.verificarCertificado);

// ============================================
// SECTION 4: STATISTICS
// ============================================

/**
 * GET /api/perfiles/estudiante/:id/estadisticas
 * Gets student statistics
 * Acceso: Estudiante (propio), Profesor, Admin
 */
router.get('/estudiante/:id/estadisticas', perfilesController.obtenerEstadisticas);

/**
 * PUT /api/perfiles/estudiante/:id/estadisticas/actualizar
 * Recalculates student statistics
 * Acceso: Admin
 */
router.put('/estudiante/:id/estadisticas/actualizar',
    requireRole(['admin']),
    perfilesController.actualizarEstadisticas
);

// ============================================
// SECTION 5: COURSE HISTORY
// ============================================

/**
 * GET /api/perfiles/estudiante/:id/historial
 * Gets complete student course history
 * Acceso: Estudiante (propio), Profesor, Admin
 */
router.get('/estudiante/:id/historial', perfilesController.obtenerHistorialCursos);

/**
 * POST /api/perfiles/estudiante/:id/historial
 * Adds course to student history
 * Acceso: Admin (called automatically when course ends)
 */
router.post('/estudiante/:id/historial',
    requireRole(['admin']),
    perfilesController.agregarCursoHistorial
);

// ============================================
// SECTION 6: TEACHER PROFILE (OPTIONAL)
// ============================================

/**
 * GET /api/perfiles/profesor/:id
 * Gets teacher public profile
 * Acceso: Todos los usuarios autenticados
 */
router.get('/profesor/:id', perfilesController.obtenerPerfilProfesor);

module.exports = router;