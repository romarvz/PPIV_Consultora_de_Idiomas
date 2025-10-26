const {body, param, validationResult} = require('express-validator');

//middleware para manejar errores de validacion en el modulo financiero
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Errores de validación',
            errors: errors.array().map(err => ({
                campo: err.path,
                mensaje: err.msg,
                valorRecibido: err.value
            }))
        });
    }
    next();
};

//Validacion para crear cobros
const validateCrearCobro = [
    body('estudiante')
    .notEmpty().withMessage('El campo estudiante es obligatorio')
    .isMongoId().withMessage('El campo estudiante debe ser un ID válido'),

    body('factura')
    .notEmpty().withMessage('El campo factura es obligatorio')
    .isMongoId().withMessage('El campo factura debe ser un ID válido'),

    body('monto')
        .notEmpty().withMessage('El monto es requerido')
        .isFloat({ min: 0.01 }).withMessage('El monto debe ser mayor a 0')
        .toFloat(),
    
    body('metodoCobro')
        .notEmpty().withMessage('El método de cobro es requerido')
        .isIn(['Efectivo', 'Tarjeta', 'Transferencia', 'Mercado Pago', 'Otro'])
        .withMessage('Método de cobro inválido'),
    
    body('fechaCobro')
        .optional()
        .isISO8601().withMessage('Formato de fecha inválido')
        .toDate(),
    
    body('notas')
        .optional()
        .isString().withMessage('Las notas deben ser texto')
        .trim()
        .isLength({ max: 500 }).withMessage('Las notas no pueden exceder 500 caracteres'),
    
    handleValidationErrors
];

//Validaciones para crear factura
const validateCrearFactura = [
    body('estudiante')
        .notEmpty().withMessage('El ID del estudiante es requerido')
        .isMongoId().withMessage('ID de estudiante inválido'),
    
    body('condicionFiscal')
        .notEmpty().withMessage('La condición fiscal es requerida')
        .isIn(['Consumidor Final', 'Responsable Inscripto', 'Monotributista', 'Exento'])
        .withMessage('Condición fiscal inválida'),
    
    body('fechaVencimiento')
        .optional()
        .isISO8601().withMessage('Formato de fecha de vencimiento inválido')
        .toDate(),
    
    body('itemFacturaSchema')
        .isArray({ min: 1 }).withMessage('Debe incluir al menos un ítem')
        .custom((items) => {
            for (const item of items) {
                if (!item.descripcion || !item.cantidad || !item.precioUnitario) {
                    throw new Error('Cada ítem debe tener descripción, cantidad y precio unitario');
                }
                if (item.cantidad <= 0 || item.precioUnitario <= 0) {
                    throw new Error('Cantidad y precio deben ser mayores a 0');
                }
            }
            return true;
        }),
    
    body('periodoFacturado')
        .notEmpty().withMessage('El período facturado es requerido')
        .matches(/^\d{4}-(0[1-9]|1[0-2])$/).withMessage('Formato de período inválido (usar YYYY-MM)'),
    
    handleValidationErrors
];

//Validaciones para parametos de ID
const validateMongoId = [
    param('idEstudiante')
        .isMongoId().withMessage('ID de estudiante inválido'),
    
    handleValidationErrors
];

const validateFacturaId = [
    param('idFactura')
        .isMongoId().withMessage('ID de factura inválido'),
    
    handleValidationErrors
];

module.exports = {
    validateCrearFactura,
    validateCrearCobro,
    validateMongoId,
    validateFacturaId
};
