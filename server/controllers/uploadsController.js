const { uploadCourseImage, isCloudinaryConfigured } = require('../services/cloudinaryService')

exports.uploadCourseImage = async (req, res) => {
  try {
    if (!isCloudinaryConfigured()) {
      return res.status(503).json({
        success: false,
        error: 'Cloudinary no está configurado. Contacta al administrador.'
      })
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No se recibió ningún archivo.'
      })
    }

    const result = await uploadCourseImage(req.file.buffer, req.file.originalname)

    return res.status(201).json({
      success: true,
      message: 'Imagen subida correctamente.',
      data: {
        publicId: result.public_id,
        url: result.url,
        secureUrl: result.secure_url,
        format: result.format,
        bytes: result.bytes,
        width: result.width,
        height: result.height
      }
    })
  } catch (error) {
    console.error('Error al subir imagen de curso:', error)
    const status = error.http_code || 500
    return res.status(status).json({
      success: false,
      error: error.message || 'Error al subir la imagen.'
    })
  }
}

