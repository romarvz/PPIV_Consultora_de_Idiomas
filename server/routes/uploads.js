const express = require('express')
const router = express.Router()

const { authenticateToken, requireRole } = require('../middleware/authMiddlewareNew')
const { uploadCourseImage: uploadCourseImageController } = require('../controllers/uploadsController')
const { courseImageUpload } = require('../middleware/uploadMiddleware')

// Helper middleware to capturar errores de multer y responder adecuadamente
const handleMulter = (req, res, next) => {
  courseImageUpload(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        error: err.message || 'Error al procesar el archivo.'
      })
    }
    next()
  })
}

router.post(
  '/course-image',
  authenticateToken,
  requireRole(['admin', 'profesor']),
  handleMulter,
  uploadCourseImageController
)

module.exports = router

