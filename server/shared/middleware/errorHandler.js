/**
 * Global error handling middleware
 * Placed at the END of all routes in index.js
 * 
 * Captures unhandled errors and responds consistently
 * 
 */

const errorHandler = (err, req, res, next) => {
  console.error('Unhandled error:', err)
  
  // Mongoose validation error
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: 'Error de validación',
      details: Object.values(err.errors).map(e => e.message),
      timestamp: new Date().toISOString()
    })
  }
  
  // Mongoose Cast error (invalid ID)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      error: 'ID inválido',
      timestamp: new Date().toISOString()
    })
  }
  
  // Duplicate error (unique constraint)
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0]
    return res.status(409).json({
      success: false,
      error: `El campo '${field}' ya existe`,
      timestamp: new Date().toISOString()
    })
  }
  
  // JWT error
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: 'Token inválido',
      timestamp: new Date().toISOString()
    })
  }
  
  // Generic error
  res.status(err.statusCode || 500).json({
    success: false,
    error: err.message || 'Error interno del servidor',
    timestamp: new Date().toISOString()
  })
}

module.exports = errorHandler
