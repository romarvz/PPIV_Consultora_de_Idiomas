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
    : 'http://localhost:3000',
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
      test: '/api/auth/test'
    }
  });
});

// Rutas de autenticación
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

//middleware para cuando no encontramos ruta (solo GET y POST seguros)
app.get('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Ruta ${req.originalUrl} no encontrada`,
    availableEndpoints: {
      auth: '/api/auth',
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
      test: '/api/auth/test'
    }
  });
});

// Middleware global para manejo de errores
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Error interno del servidor',
    ...(process.env.NODE_ENV === 'development' && { 
      stack: err.stack,
      error: err 
    })
  });
});

app.listen(PORT, () => {
  console.log(` Server running on port ${PORT}`);
  console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(` API URL: http://localhost:${PORT}`);
  console.log(`
    Auth endpoints: http://localhost:${PORT}/api/auth`);
});

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Iniciar la aplicación
startServer();