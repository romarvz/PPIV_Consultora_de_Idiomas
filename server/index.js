const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();
const mongoose = require('mongoose');


// Función principal para iniciar la aplicación
const startServer = async () => {
  try {
    // Connect directly to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected successfully');

    const app = express();
    const PORT = process.env.PORT || 5000;

    // Security middleware
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
      students: '/api/students',
      teachers: '/api/teachers',
      languages: '/api/languages',
      horarios: '/api/horarios',
      financial: {
        conceptCategories: '/api/concept-categories',
        conceptosCobros: '/api/conceptos-cobros',
        cobros: '/api/cobros',
        facturas: '/api/facturas'
      },
      test: '/api/auth/test'
    }

    // Main test route
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

    // ===== AUTHENTICATION ROUTES (Daniela) =====
    const authRoutes = require('./routes/authNew');
    app.use('/api/auth', authRoutes);

    // ===== USER SPECIFIC ROUTES =====
    const studentRoutes = require('./routes/studentRoutes');
    const teacherRoutes = require('./routes/teacherRoutes');
    app.use('/api/students', studentRoutes);
    app.use('/api/teachers', teacherRoutes);

// Rutas para gestión de horarios
const horariosRoutes = require('./routes/horarios');
app.use('/api/horarios', horariosRoutes);

// Rutas para gestión de cursos
const cursoRoutes = require('./routes/cursoRoutes');
app.use('/api/cursos', cursoRoutes);

// Rutas para gestion financiera
const conceptCategoryRoutes = require('./routes/conceptCategory.routes');
const conceptosCobrosRoutes = require('./routes/conceptosCobros.routes');
const cobrosRoutes = require('./routes/cobros.routes');
const facturasRoutes = require('./routes/facturas.routes');

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

app.post('*', (req, res) => {
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

// Middleware global para manejo de errores (usando shared errorHandler)
const { errorHandler } = require('./shared/middleware');
app.use(errorHandler);

    app.post('*', (req, res) => {
      res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} not found`,
        availableEndpoints: {
          auth: '/api/auth',
          dashboard: '/api/dashboard',
          auditoria: '/api/auditoria',
          test: '/api/auth/test'
        }
      });
    });

    // ===== GLOBAL ERROR MIDDLEWARE (Romina - shared/middleware) =====
    const { errorHandler } = require('./shared/middleware');
    app.use(errorHandler);

    // ===== START SERVER =====
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`API URL: http://localhost:${PORT}`);
      console.log(`Auth endpoints: http://localhost:${PORT}/api/auth`);
      console.log(`Dashboard endpoints: http://localhost:${PORT}/api/dashboard`);
      console.log(`Audit endpoints: http://localhost:${PORT}/api/auditoria`);
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start the application
startServer();
