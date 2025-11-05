const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const itemFacturaSchema = new Schema({
    descripcion: {
        type: String,
        required: true,
        min: 1
    },
    cantidad: {
        type: Number,
        required: true,
        min: 1
    },
    precioUnitario: {
        type: Number,
        required: true,
        min: 0
    },
    subtotal: {
        type: Number,
        required: true,
        min: 0
    },
    conceptoCobro:{
        type: Schema.Types.ObjectId,
        ref: 'ConceptoCobro',
    },
    curso:{
        type: Schema.Types.ObjectId,
        ref: 'Curso',
    },
    clase:{
        type: Schema.Types.ObjectId,
        ref: 'Clase',
    }
},{_id: false });


const facturaSchema = new Schema({
    estudiante: {
        type: Schema.Types.ObjectId,
        ref: 'BaseUser',
        required: true
    },
    condicionFiscal:{
        type: String,
        required: true,
    },
    numeroFactura: {
        type: String,
        required: true, 
        unique: true
    },
    fechaEmision: {
        type: Date,
        required: true,
        default: Date.now
    },
    fechaVencimiento: {
        type: Date,
        required: true,
        default: Date.now
    },
    itemFacturaSchema: [itemFacturaSchema],
    periodoFacturado: {
        type: String,
        required: true 
    },
    subtotal: {
        type: Number,
        required: true,
        min: 0
    },
    total: {
    type: Number,
    required: true,
    min: 0
    },
    estado: {
        type: String,
        enum: ['Borrador','Pendiente', 'Cobrada', 'Cobrada Parcialmente', 'Vencida'],
        default: 'Borrador'
    },

   // ========================================
    // CAMPOS PARA FACTURACIÓN ELECTRÓNICA AFIP
    // ========================================
    
    /**
     * CAE - Código de Autorización Electrónico (modo normal)
     * Se obtiene de AFIP al emitir el comprobante
     * Formato: 14 dígitos numéricos
     */
    cae: {
        type: String,
        sparse: true, // Permite null pero índice único si existe
        validate: {
            validator: function(v) {
                return !v || /^\d{14}$/.test(v);
            },
            message: 'CAE debe tener 14 dígitos numéricos'
        }
    },
    
    /**
     * Fecha de vencimiento del CAE
     * Típicamente 10 días después de la emisión
     */
    caeVencimiento: {
        type: Date
    },
    
    /**
     * CAEA - Código de Autorización Electrónico Anticipado (contingencia)
     * Se solicita ANTES del período de facturación
     * Se usa cuando AFIP no responde
     * Formato: 14 dígitos numéricos
     */
    caea: {
        type: String,
        sparse: true,
        validate: {
            validator: function(v) {
                return !v || /^\d{14}$/.test(v);
            },
            message: 'CAEA debe tener 14 dígitos numéricos'
        }
    },
    
    /**
     * Fecha de vencimiento del CAEA
     * Vence al final de la quincena correspondiente
     */
    caeaVencimiento: {
        type: Date
    },
    
    /**
     * Indica si la factura se emitió usando CAEA (modo contingencia)
     */
    usoCaea: {
        type: Boolean,
        default: false
    },
    
    /**
     * Período del CAEA (si aplica)
     * 1 = primera quincena (1-15)
     * 2 = segunda quincena (16-fin de mes)
     */
    caeaPeriodo: {
        type: Number,
        enum: [1, 2],
        sparse: true
    },
    
    /**
     * Mes del CAEA (1-12)
     */
    caeaMes: {
        type: Number,
        min: 1,
        max: 12,
        sparse: true
    },
    
    /**
     * Año del CAEA
     */
    caeaAnio: {
        type: Number,
        sparse: true
    },
    
    /**
     * Indica si el comprobante emitido con CAEA ya fue informado a AFIP
     * Debe hacerse cuando el servicio vuelve a estar disponible
     */
    caeaInformado: {
        type: Boolean,
        default: false
    },
    
    /**
     * Fecha en que se informó el comprobante con CAEA a AFIP
     */
    caeaFechaInformado: {
        type: Date
    }
    
}, {
    timestamps: true
});

// ========================================
// ÍNDICES PARA BÚSQUEDAS EFICIENTES
// ========================================

// Índice para buscar facturas por CAE
facturaSchema.index({ cae: 1 });

// Índice para buscar facturas por CAEA
facturaSchema.index({ caea: 1 });

// Índice compuesto para facturas con CAEA pendientes de informar
facturaSchema.index({ usoCaea: 1, caeaInformado: 1 });

// Índice para buscar por período CAEA
facturaSchema.index({ caeaAnio: 1, caeaMes: 1, caeaPeriodo: 1 });

// ========================================
// MÉTODOS DEL MODELO
// ========================================

/**
 * Verifica si la factura tiene autorización válida (CAE o CAEA)
 */
facturaSchema.methods.tieneAutorizacionValida = function() {
    const ahora = new Date();
    
    if (this.cae && this.caeVencimiento) {
        return this.caeVencimiento > ahora;
    }
    
    if (this.caea && this.caeaVencimiento) {
        return this.caeaVencimiento > ahora;
    }
    
    return false;
};

/**
 * Obtiene el tipo de autorización
 */
facturaSchema.methods.getTipoAutorizacion = function() {
    if (this.cae) return 'CAE';
    if (this.caea) return 'CAEA';
    return 'Sin autorización';
};

/**
 * Verifica si la factura requiere ser informada a AFIP
 */
facturaSchema.methods.requiereInformarAFIP = function() {
    return this.usoCaea && !this.caeaInformado;
};

/**
 * Verifica si la factura está en estado borrador (editable)
 */
facturaSchema.methods.esBorrador = function() {
    return this.estado === 'Borrador';
};

/**
 * Verifica si la factura puede ser editada
 * Solo se puede editar si está en estado borrador
 */
facturaSchema.methods.puedeEditarse = function() {
    return this.estado === 'Borrador';
};

/**
 * Verifica si la factura puede ser eliminada
 * Solo se puede eliminar si está en estado borrador
 */
facturaSchema.methods.puedeEliminarse = function() {
    return this.estado === 'Borrador';
};

/**
 * Verifica si la factura está autorizada (tiene CAE o CAEA)
 */
facturaSchema.methods.estaAutorizada = function() {
    return !!(this.cae || this.caea);
};

module.exports = mongoose.model('Factura', facturaSchema);