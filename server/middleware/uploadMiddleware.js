const multer = require('multer')

const MAX_IMAGE_SIZE = 5 * 1024 * 1024 // 5MB

const storage = multer.memoryStorage()

const imageFileFilter = (req, file, cb) => {
  if (file.mimetype && file.mimetype.startsWith('image/')) {
    cb(null, true)
  } else {
    cb(new Error('Solo se permiten archivos de imagen.'))
  }
}

const upload = multer({
  storage,
  limits: { fileSize: MAX_IMAGE_SIZE },
  fileFilter: imageFileFilter
})

const courseImageUpload = upload.single('image')

module.exports = {
  courseImageUpload
}

