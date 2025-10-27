const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();
const mongoose = require('mongoose');


// Función principal para iniciar la aplicación
const startServer = async () => {
  try {
    // Conectar directamente a MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected successfully');

    const app = express();
    const PORT = process.env.PORT || 5000;

    // ============================================
    // MIDDLEWARE DE SEGURIDAD
    // ============================================
    app.use(helmet());

    // ============================================
    // CORS
    // ============================================
    app.use(cors({
      origin: process.env.NODE_ENV === 'production' 
        ? process.env.FRONTEND_URL 
        : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://localhost:3003'],
      credentials: true
    }));

    // ============================================
    // BODY PARSERS
    // ============================================
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true }));

    // ============================================
    // LOGGING EN DESARROLLO
    // ============================================
    if (process.env.NODE_ENV === 'development') {
      app.use(morgan('dev'));
    }

    // Logging básico personalizado
    app.use((req, res, next) => {
      console.log(`${req.method} ${req.path}`);
      next();
    });

    // ============================================
    // RUTA PRINCIPAL
    // ============================================
    app.get('/', (req, res) => {
      res.json({ 
        success: true,
        message: 'Language Consultancy API v1.0',
        version: '1.0.0',
        status: 'active',
        endpoints: {
          // Rutas existentes
          auth: '/api/auth',
          test: '/api/auth/test',
          crud: '/api',
          languages: '/api/languages',
          // Rutas nuevas (Alexa)
          cursos: '/api/cursos',
          clases: '/api/clases',
          health: '/api/health'
        }
      });
    });

    // ============================================
    // RUTAS EXISTENTES (Daniela)
    // ============================================
    const authRoutes = require('./routes/authNew');
    app.use('/api/auth', authRoutes);

// Rutas CRUD para estudiantes y profesores
const crudRoutes = require('./routes/crud');
app.use('/api', crudRoutes);

    const languageRoutes = require('./routes/languages');
    app.use('/api/languages', languageRoutes);

// Rutas para gestion financiera
const conceptCategoryRoutes = require('./routes/conceptCategory.routes');
const conceptosCobrosRoutes = require('./routes/conceptosCobros.routes');
const cobrosRoutes = require('./routes/cobros.routes');
const facturasRoutes = require('./routes/facturas.routes');

app.use('/api/concept-categories', conceptCategoryRoutes);
app.use('/api/conceptos-cobros', conceptosCobrosRoutes);
app.use('/api/cobros', cobrosRoutes);
app.use('/api/facturas', facturasRoutes);

// Rutas para gestion financiera
const conceptCategoryRoutes = require('./routes/conceptCategory.routes');
const conceptosCobrosRoutes = require('./routes/conceptosCobros.routes');
const cobrosRoutes = require('./routes/cobros.routes');
const facturasRoutes = require('./routes/facturas.routes');

app.use('/api/concept-categories', conceptCategoryRoutes);
app.use('/api/conceptos-cobros', conceptosCobrosRoutes);
app.use('/api/cobros', cobrosRoutes);
app.use('/api/facturas', facturasRoutes);

    // ============================================
    // RUTAS NUEVAS (Alexa - Cursos y Clases)
    // ============================================
    const cursosRoutes = require('./routes/cursos');
    app.use('/api/cursos', cursosRoutes);

    const clasesRoutes = require('./routes/clases');
    app.use('/api/clases', clasesRoutes);

    // ============================================
    // RUTA DE HEALTH CHECK
    // ============================================
    app.get('/api/health', (req, res) => {
      res.status(200).json({
        success: true,
        message: 'API funcionando correctamente',
        timestamp: new Date().toISOString(),
        mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
        environment: process.env.NODE_ENV || 'development'
      });
    });

    // ============================================
    // RUTAS FUTURAS (Otras integrantes)
    // ============================================
    // Descomentar cuando estén listas:
    
    // const dashboardRoutes = require('./routes/dashboard'); // Romina
    // app.use('/api/dashboard', dashboardRoutes);
    
    // const auditoriaRoutes = require('./routes/auditoria'); // Romina
    // app.use('/api/auditoria', auditoriaRoutes);
    
    // const pagosRoutes = require('./routes/pagos'); // Ayelen
    // app.use('/api/pagos', pagosRoutes);
    
    // const facturasRoutes = require('./routes/facturas'); // Ayelen
    // app.use('/api/facturas', facturasRoutes);
    
    // const perfilesRoutes = require('./routes/perfiles'); // Verónica
    // app.use('/api/perfiles', perfilesRoutes);
    
    // const reportesRoutes = require('./routes/reportes'); // Verónica
    // app.use('/api/reportes', reportesRoutes);

    // ============================================
    // MIDDLEWARE PARA RUTAS NO ENCONTRADAS (404)
    // ============================================
    app.use((req, res) => {
      res.status(404).json({
        success: false,
        message: `Ruta ${req.method} ${req.originalUrl} no encontrada`,
        availableEndpoints: {
          // Rutas existentes
          auth: '/api/auth',
          test: '/api/auth/test',
          crud: '/api',
          languages: '/api/languages',
          // Rutas nuevas
          cursos: '/api/cursos',
          clases: '/api/clases',
          health: '/api/health'
        }
      });
    });

    // ============================================
    // MIDDLEWARE GLOBAL PARA MANEJO DE ERRORES
    // ============================================
    app.use((err, req, res, next) => {
      console.error(' Error:', err.stack);
      
      res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Error interno del servidor',
        ...(process.env.NODE_ENV === 'development' && { 
          stack: err.stack,
          error: err 
        })
      });
    });

    // ============================================
    // INICIAR SERVIDOR
    // ============================================
    app.listen(PORT, () => {
      console.log('');
      console.log('='.repeat(60));
      console.log(` Server running on port ${PORT}`);
      console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(` API URL: http://localhost:${PORT}`);
      console.log('='.repeat(60));
      console.log(' Available endpoints:');
      console.log(`   Auth:      http://localhost:${PORT}/api/auth`);
      console.log(`   CRUD:      http://localhost:${PORT}/api`);
      console.log(`   Languages: http://localhost:${PORT}/api/languages`);
      console.log(`   Cursos:    http://localhost:${PORT}/api/cursos`);
      console.log(`   Clases:    http://localhost:${PORT}/api/clases`);
      console.log(`   Health:    http://localhost:${PORT}/api/health`);
      console.log('='.repeat(60));
      console.log('');
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// ============================================
// MANEJO DE SEÑALES DE TERMINACIÓN
// ============================================
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing HTTP server');
  await mongoose.connection.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('\nSIGINT signal received: closing HTTP server');
  await mongoose.connection.close();
  process.exit(0);
});

// Iniciar la aplicación
startServer();

module.exports = { startServer }; // Para testing