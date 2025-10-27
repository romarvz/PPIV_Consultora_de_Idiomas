const { validationResult } = require('express-validator');
const { Language } = require('../models');

// auxiliary function to handle validation errors
const handleValidationErrors = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Errores de validación',
      errors: errors.array().map(error => ({
        field: error.path,
        message: error.msg
      }))
    });
  }
  return null;
};


const getLanguages = async (req, res) => {
  try {
    const { active } = req.query;

    // Filter by active if specified
    const filter = active === 'true' ? { isActive: true } : {};
    
    const languages = await Language.find(filter).sort({ name: 1 });

    res.json({
      success: true,
      message: 'Idiomas obtenidos exitosamente',
      data: {
        languages,
        total: languages.length
      }
    });

  } catch (error) {
    console.error('Error en getLanguages:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      code: 'INTERNAL_ERROR'
    });
  }
};

const getLanguageById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const language = await Language.findById(id);
    
    if (!language) {
      return res.status(404).json({
        success: false,
        message: 'Idioma no encontrado',
        code: 'LANGUAGE_NOT_FOUND'
      });
    }

    res.json({
      success: true,
      message: 'Idioma obtenido exitosamente',
      data: {
        language
      }
    });

  } catch (error) {
    console.error('Error en getLanguageById:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'ID de idioma inválido',
        code: 'INVALID_ID'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      code: 'INTERNAL_ERROR'
    });
  }
};

const getLanguageByCode = async (req, res) => {
  try {
    const { code } = req.params;
    
    const language = await Language.findByCode(code);
    
    if (!language) {
      return res.status(404).json({
        success: false,
        message: 'Idioma no encontrado',
        code: 'LANGUAGE_NOT_FOUND'
      });
    }

    res.json({
      success: true,
      message: 'Idioma obtenido exitosamente',
      data: {
        language
      }
    });

  } catch (error) {
    console.error('Error en getLanguageByCode:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      code: 'INTERNAL_ERROR'
    });
  }
};

//create language

const createLanguage = async (req, res) => {
  try {
    const validationError = handleValidationErrors(req, res);
    if (validationError) return validationError;

    const { code, name, nativeName, description, level, demandLevel } = req.body;

    // verrify unique code
    const existingLanguage = await Language.findByCode(code);
    if (existingLanguage) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe un idioma con ese código',
        code: 'LANGUAGE_EXISTS'
      });
    }

    // Create and save new language
    const language = new Language({
      code,
      name,
      nativeName,
      description,
      level,
      demandLevel
    });

    await language.save();

    res.status(201).json({
      success: true,
      message: 'Idioma creado exitosamente',
      data: {
        language
      }
    });

  } catch (error) {
    console.error('Error en createLanguage:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe un idioma con ese código',
        code: 'DUPLICATE_CODE'
      });
    }

    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message
      }));
      
      return res.status(400).json({
        success: false,
        message: 'Errores de validación',
        errors: validationErrors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      code: 'INTERNAL_ERROR'
    });
  }
};

// update language

const updateLanguage = async (req, res) => {
  try {
    const validationError = handleValidationErrors(req, res);
    if (validationError) return validationError;

    const { id } = req.params;
    const { code, name, nativeName, description, level, demandLevel, isActive } = req.body;

    const language = await Language.findById(id);
    
    if (!language) {
      return res.status(404).json({
        success: false,
        message: 'Idioma no encontrado',
        code: 'LANGUAGE_NOT_FOUND'
      });
    }

    // Verify unique code if changed
    if (code && code !== language.code) {
      const existingLanguage = await Language.findByCode(code);
      if (existingLanguage) {
        return res.status(400).json({
          success: false,
          message: 'Ya existe un idioma con ese código',
          code: 'LANGUAGE_EXISTS'
        });
      }
    }

    // Update fields
    if (code) language.code = code;
    if (name) language.name = name;
    if (nativeName !== undefined) language.nativeName = nativeName;
    if (description !== undefined) language.description = description;
    if (level) language.level = level;
    if (demandLevel) language.demandLevel = demandLevel;
    if (typeof isActive === 'boolean') language.isActive = isActive;

    await language.save();

    res.json({
      success: true,
      message: 'Idioma actualizado exitosamente',
      data: {
        language
      }
    });

  } catch (error) {
    console.error('Error en updateLanguage:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'ID de idioma inválido',
        code: 'INVALID_ID'
      });
    }

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe un idioma con ese código',
        code: 'DUPLICATE_CODE'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      code: 'INTERNAL_ERROR'
    });
  }
};

const toggleLanguageStatus = async (req, res) => {
  try {
    const { id } = req.params;
    
    const language = await Language.findById(id);
    
    if (!language) {
      return res.status(404).json({
        success: false,
        message: 'Idioma no encontrado',
        code: 'LANGUAGE_NOT_FOUND'
      });
    }

    await language.toggleActive();

    res.json({
      success: true,
      message: `Idioma ${language.isActive ? 'activado' : 'desactivado'} exitosamente`,
      data: {
        language
      }
    });

  } catch (error) {
    console.error('Error en toggleLanguageStatus:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'ID de idioma inválido',
        code: 'INVALID_ID'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      code: 'INTERNAL_ERROR'
    });
  }
};

// delete language (soft delete)
const deleteLanguage = async (req, res) => {
  try {
    const { id } = req.params;
    
    const language = await Language.findById(id);
    
    if (!language) {
      return res.status(404).json({
        success: false,
        message: 'Idioma no encontrado',
        code: 'LANGUAGE_NOT_FOUND'
      });
    }

    // Soft delete 
    language.isActive = false;
    await language.save();

    res.json({
      success: true,
      message: 'Idioma desactivado exitosamente',
      data: {
        language
      }
    });

  } catch (error) {
    console.error('Error en deleteLanguage:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'ID de idioma inválido',
        code: 'INVALID_ID'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      code: 'INTERNAL_ERROR'
    });
  }
};


const getLanguageStats = async (req, res) => {
  try {
    const totalLanguages = await Language.countDocuments();
    const activeLanguages = await Language.countDocuments({ isActive: true });
    const inactiveLanguages = await Language.countDocuments({ isActive: false });

    
    const demandStats = await Language.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$demandLevel', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    const levelStats = await Language.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$level', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      message: 'Estadísticas obtenidas exitosamente',
      data: {
        overview: {
          total: totalLanguages,
          active: activeLanguages,
          inactive: inactiveLanguages
        },
        byDemand: demandStats,
        byLevel: levelStats
      }
    });

  } catch (error) {
    console.error('Error en getLanguageStats:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      code: 'INTERNAL_ERROR'
    });
  }
};

module.exports = {
  getLanguages,
  getLanguageById,
  getLanguageByCode,
  createLanguage,
  updateLanguage,
  toggleLanguageStatus,
  deleteLanguage,
  getLanguageStats
};