const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();
const mongoose = require('mongoose');

const startServer = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected successfully');

    require('./models');

    const app = express();
    const PORT = process.env.PORT || 5000;

    app.use(helmet());

    app.use(cors({
      origin: process.env.NODE_ENV === 'production'
        ? process.env.FRONTEND_URL
        : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://localhost:3003'],
      credentials: true
    }));

    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true }));

    if (process.env.NODE_ENV === 'development') {
      app.use(morgan('dev'));
    }

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
          uploads: '/api/uploads',
          cobros: '/api/cobros',
          facturas: '/api/facturas',
          perfiles: '/api/perfiles',
          reportesAcademicos: '/api/reportes-academicos',
          reportesFinancieros: '/api/reportes-financieros',
          test: '/api/auth/test'
        }
      });
    });

    // Debug endpoint to check data counts without auth
    app.get('/debug/counts', async (req, res) => {
      try {
        const { BaseUser } = require('./models');
        const students = await BaseUser.countDocuments({ role: 'estudiante' });
        const teachers = await BaseUser.countDocuments({ role: 'profesor' });
        res.json({
          success: true,
          data: { students, teachers }
        });
      } catch (error) {
        res.json({ success: false, error: error.message });
      }
    });

    const authRoutes = require('./routes/authNew');
    app.use('/api/auth', authRoutes);

    const studentRoutes = require('./routes/studentRoutes');
    const teacherRoutes = require('./routes/teacherRoutes');
    app.use('/api/students', studentRoutes);
    app.use('/api/teachers', teacherRoutes);

    const dashboardRoutes = require('./routes/dashboard');
    const auditoriaRoutes = require('./routes/auditoria');
    app.use('/api/dashboard', dashboardRoutes);
    app.use('/api/auditoria', auditoriaRoutes);

    const cursosRoutes = require('./routes/cursos');
    const clasesRoutes = require('./routes/clases');
    const uploadsRoutes = require('./routes/uploads');
    app.use('/api/cursos', cursosRoutes);
    app.use('/api/clases', clasesRoutes);
    app.use('/api/uploads', uploadsRoutes);

    const languageRoutes = require('./routes/languages');
    app.use('/api/languages', languageRoutes);

    const cobrosRoutes = require('./routes/cobros.routes');
    const facturasRoutes = require('./routes/facturas.routes');
    const conceptCategoryRoutes = require('./routes/conceptCategory.routes');
    const conceptosCobrosRoutes = require('./routes/conceptosCobros.routes');
    app.use('/api/cobros', cobrosRoutes);
    app.use('/api/facturas', facturasRoutes);
    app.use('/api/concept-categories', conceptCategoryRoutes);
    app.use('/api/conceptos-cobros', conceptosCobrosRoutes);

    const perfilesRoutes = require('./routes/perfiles');
    const reportesAcademicosRoutes = require('./routes/reportes-academicos');
    const reportesFinancierosRoutes = require('./routes/reportes-financieros');
    app.use('/api/perfiles', perfilesRoutes);
    app.use('/api/reportes-academicos', reportesAcademicosRoutes);
    app.use('/api/reportes-financieros', reportesFinancierosRoutes);

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
          uploads: '/api/uploads',
          cobros: '/api/cobros',
          facturas: '/api/facturas',
          perfiles: '/api/perfiles',
          reportesAcademicos: '/api/reportes-academicos',
          reportesFinancieros: '/api/reportes-financieros',
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
          uploads: '/api/uploads',
          cobros: '/api/cobros',
          facturas: '/api/facturas',
          perfiles: '/api/perfiles',
          reportesAcademicos: '/api/reportes-academicos',
          reportesFinancieros: '/api/reportes-financieros',
          test: '/api/auth/test'
        }
      });
    });

    const { errorHandler } = require('./shared/middleware');
    app.use(errorHandler);

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

startServer();