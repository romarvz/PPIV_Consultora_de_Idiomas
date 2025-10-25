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
    itemFacturaSchemas: [itemFacturaSchema],
    periodoFacturado: {
        type: String,
        required: true 
    },
    subtotal: {
        type: Number,
        required: true,
        min: 0
    },
    impuestos: {
        type: Number,
        required: true,
        min: 0
    },
    total: {
        type: Number,
        required: true,
        min: 0
    },
    estadoPago: {
        type: String,
        enum: ['Pendiente', 'Pagado', 'Vencido'],
        default: 'Pendiente'
    }},{
        timestamps: true
    });
