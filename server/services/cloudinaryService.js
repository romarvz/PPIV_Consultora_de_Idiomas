const { v2: cloudinary } = require('cloudinary')

const {
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
  CLOUDINARY_UPLOAD_FOLDER = 'ppiv-consultora/courses'
} = process.env

let isConfigured = false

if (CLOUDINARY_CLOUD_NAME && CLOUDINARY_API_KEY && CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET
  })
  isConfigured = true
} else {
  console.warn('[Cloudinary] Variables de entorno incompletas. Carga de imágenes deshabilitada temporalmente.')
}

const uploadCourseImage = (fileBuffer, filename) => {
  if (!isConfigured) {
    return Promise.reject(new Error('Cloudinary no está configurado. Verifica las variables de entorno.'))
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: CLOUDINARY_UPLOAD_FOLDER,
        resource_type: 'image',
        use_filename: true,
        unique_filename: true,
        overwrite: false,
        transformation: [{ quality: 'auto', fetch_format: 'auto' }]
      },
      (error, result) => {
        if (error) {
          return reject(error)
        }
        resolve(result)
      }
    )

    uploadStream.end(fileBuffer)
  })
}

module.exports = {
  uploadCourseImage,
  isCloudinaryConfigured: () => isConfigured
}

