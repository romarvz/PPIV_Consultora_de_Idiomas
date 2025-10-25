const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();
const mongoose = require('mongoose');

// Main function to start the application
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

    // Development logging
    if (process.env.NODE_ENV === 'development') {
      app.use(morgan('dev'));
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

    // ===== ROMINA'S ROUTES (Dashboard + Audit) =====
    const dashboardRoutes = require('./routes/dashboard');
    const auditoriaRoutes = require('./routes/auditoria');
    app.use('/api/dashboard', dashboardRoutes);
    app.use('/api/auditoria', auditoriaRoutes);

    // ===== LANGUAGE ROUTES =====
    const languageRoutes = require('./routes/languages');
    app.use('/api/languages', languageRoutes);

    // ===== ROUTES NOT FOUND (404) =====
    app.get('*', (req, res) => {
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
