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

    // Cargar todos los modelos ANTES de las rutas para asegurar que estén registrados
    require('./models'); // Esto carga todos los modelos y los registra en mongoose

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
      students: '/api/students',
      teachers: '/api/teachers',
      languages: '/api/languages',
      cursos: '/api/cursos',
      clases: '/api/clases',
      cobros: '/api/cobros',
      facturas: '/api/facturas',
      conceptos: '/api/conceptos-cobros',
      categorias: '/api/concept-categories',
      test: '/api/auth/test'
    }
  });
});

// Rutas de autenticación
const authRoutes = require('./routes/authNew');
app.use('/api/auth', authRoutes);

// Rutas específicas para estudiantes y profesores
const studentRoutes = require('./routes/studentRoutes');
const teacherRoutes = require('./routes/teacherRoutes');
app.use('/api/students', studentRoutes);
app.use('/api/teachers', teacherRoutes);

// Rutas para gestión de idiomas
const languageRoutes = require('./routes/languages');
app.use('/api/languages', languageRoutes);

// ===== RUTAS DE (Dashboard + Auditoría) =====
const dashboardRoutes = require('./routes/dashboard');
const auditoriaRoutes = require('./routes/auditoria');
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/auditoria', auditoriaRoutes);

// ===== RUTAS DE CURSOS Y CLASES (Alexa) =====
const cursosRoutes = require('./routes/cursos');
const clasesRoutes = require('./routes/clases');
app.use('/api/cursos', cursosRoutes);
app.use('/api/clases', clasesRoutes);

// ===== RUTAS FINANCIERAS =====
const conceptCategoryRoutes = require('./routes/conceptCategory.routes');
const conceptosCobrosRoutes = require('./routes/conceptosCobros.routes');
const cobrosRoutes = require('./routes/cobros.routes');
const facturasRoutes = require('./routes/facturas.routes');

app.use('/api/concept-categories', conceptCategoryRoutes);
app.use('/api/conceptos-cobros', conceptosCobrosRoutes);
app.use('/api/cobros', cobrosRoutes);
app.use('/api/facturas', facturasRoutes);

// ===== RUTAS NO ENCONTRADAS (404) =====
app.get('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Ruta ${req.originalUrl} no encontrada`,
    availableEndpoints: {
      auth: '/api/auth',
      dashboard: '/api/dashboard',
      auditoria: '/api/auditoria',
      students: '/api/students',
      teachers: '/api/teachers',
      languages: '/api/languages',
      cursos: '/api/cursos',
      clases: '/api/clases',
      cobros: '/api/cobros',
      facturas: '/api/facturas',
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
      students: '/api/students',
      teachers: '/api/teachers',
      languages: '/api/languages',
      cursos: '/api/cursos',
      clases: '/api/clases',
      cobros: '/api/cobros',
      facturas: '/api/facturas',
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
  console.log(`Cursos endpoints: http://localhost:${PORT}/api/cursos`);
  console.log(`Clases endpoints: http://localhost:${PORT}/api/clases`);
  console.log(`Financial endpoints: http://localhost:${PORT}/api/cobros`);
});

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Iniciar la aplicación
startServer();