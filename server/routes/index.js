// routes/index.js
const express = require('express');
const router = express.Router();

// Rutas existentes (Daniela)
const authRoutes = require('./auth');
const teacherRoutes = require('./teacherRoutes');
const studentRoutes = require('./studentRoutes');
const languageRoutes = require('./languages');

// Rutas nuevas (Alexa)
const cursosRoutes = require('./cursos');
const clasesRoutes = require('./clases');

// Rutas futuras (otras integrantes)
// const dashboardRoutes = require('./dashboard'); // Romina
// const auditoriaRoutes = require('./auditoria'); // Romina
// const pagosRoutes = require('./pagos'); // Ayelen
// const facturasRoutes = require('./facturas'); // Ayelen
// const perfilesRoutes = require('./perfiles'); // Verónica
// const reportesRoutes = require('./reportes'); // Verónica

// ============================================
// RUTAS EXISTENTES
// ============================================
router.use('/auth', authRoutes);
router.use('/teachers', teacherRoutes);
router.use('/students', studentRoutes);
router.use('/languages', languageRoutes);

// ============================================
// RUTAS NUEVAS (ALEXA - CURSOS Y CLASES)
// ============================================
router.use('/cursos', cursosRoutes);
router.use('/clases', clasesRoutes);

// ============================================
// RUTAS FUTURAS (DESCOMENTAR CUANDO EXISTAN)
// ============================================
// router.use('/dashboard', dashboardRoutes); // Romina
// router.use('/auditoria', auditoriaRoutes); // Romina
// router.use('/pagos', pagosRoutes); // Ayelen
// router.use('/facturas', facturasRoutes); // Ayelen
// router.use('/perfiles', perfilesRoutes); // Verónica
// router.use('/reportes', reportesRoutes); // Verónica

// Ruta de prueba
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;