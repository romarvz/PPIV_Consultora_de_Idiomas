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
    console.log('MongoDB connected successfully');

    const app = express();
    const PORT = process.env.PORT || 5000;

    // Middleware de seguridad
    app.use(helmet());

    // CORS
    app.use(cors({
      origin: process.env.NODE_ENV === 'production' 
        ? process.env.FRONTEND_URL 
        : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://localhost:3003'],
      credentials: true
    }));

    // Body parsers
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true }));

    // Logging en desarrollo
    if (process.env.NODE_ENV === 'development') {
      app.use(morgan('dev'));
    }

    // Ruta de prueba principal
    app.get('/', (req, res) => {
      res.json({ 
        success: true,
        message: 'Language Consultancy API v1.0',
        version: '1.0.0',
        status: 'active',
        endpoints: {
          auth: '/api/auth',
          dashboard: '/api/dashboard',
          auditoria: '/api/auditoria',
          test: '/api/auth/test'
        }
      });
    });

    // ===== RUTAS DE AUTENTICACIÓN (Daniela) =====
    const authRoutes = require('./routes/authNew');
    app.use('/api/auth', authRoutes);

    // ===== RUTAS ESPECÍFICAS DE USUARIOS =====
    const studentRoutes = require('./routes/studentRoutes');
    const teacherRoutes = require('./routes/teacherRoutes');
    app.use('/api/students', studentRoutes);
    app.use('/api/teachers', teacherRoutes);

    // ===== RUTAS DE ROMINA (Dashboard + Auditoría) =====
    const dashboardRoutes = require('./routes/dashboard');
    const auditoriaRoutes = require('./routes/auditoria');
    app.use('/api/dashboard', dashboardRoutes);
    app.use('/api/auditoria', auditoriaRoutes);

    // ===== RUTAS DE IDIOMAS =====
    const languageRoutes = require('./routes/languages');
    app.use('/api/languages', languageRoutes);


      // Rutas para gestion financiera
    const conceptCategoryRoutes = require('./routes/conceptCategory.routes');
    const conceptosCobrosRoutes = require('./routes/conceptosCobros.routes');
    const cobrosRoutes = require('./routes/cobros.routes');
    const facturasRoutes = require('./routes/facturasBorrador.routes');

    app.use('/api/concept-categories', conceptCategoryRoutes);
    app.use('/api/conceptos-cobros', conceptosCobrosRoutes);
    app.use('/api/cobros', cobrosRoutes);
    app.use('/api/facturas', facturasRoutes);  

      //middleware para cuando no encontramos ruta (solo GET y POST seguros)
  app.get('*', (req, res) => {
    res.status(404).json({
      success: false,
      message: `Ruta ${req.originalUrl} no encontrada`,
      availableEndpoints: {
        auth: '/api/auth',
        students: '/api/students',
        teachers: '/api/teachers',
        languages: '/api/languages',
        horarios: '/api/horarios',
        cursos: '/api/cursos',
        test: '/api/auth/test'
      }
    });
  });
  
    // ===== RUTAS NO ENCONTRADAS (404) =====
    app.get('*', (req, res) => {
      res.status(404).json({
        success: false,
        message: `Ruta ${req.originalUrl} no encontrada`,
        availableEndpoints: {
          auth: '/api/auth',
          dashboard: '/api/dashboard',
          auditoria: '/api/auditoria',
          test: '/api/auth/test'
        }
      });
    });

    app.post('*', (req, res) => {
      res.status(404).json({
        success: false,
        message: `Ruta ${req.originalUrl} no encontrada`,
        availableEndpoints: {
          auth: '/api/auth',
          dashboard: '/api/dashboard',
          auditoria: '/api/auditoria',
          test: '/api/auth/test'
        }
      });
    });

    // ===== MIDDLEWARE DE ERROR GLOBAL (shared/middleware) =====
    const { errorHandler } = require('./shared/middleware');
    app.use(errorHandler);

    // ===== INICIAR SERVIDOR =====
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`API URL: http://localhost:${PORT}`);
      console.log(`Auth endpoints: http://localhost:${PORT}/api/auth`);
      console.log(`Dashboard endpoints: http://localhost:${PORT}/api/dashboard`);
      console.log(`Auditoría endpoints: http://localhost:${PORT}/api/auditoria`);
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Iniciar la aplicación
startServer();