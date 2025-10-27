const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CobroSchema = new Schema({
   numeroRecibo:{
    type: String,
    required: true,
    unique: true    
   },
   fechaCobro:{
    type: Date,
    required: true,
    default: Date.now
   },
   estudiante:{
    type: Schema.Types.ObjectId,
    ref: 'BaseUser',
    required: true
   },
   factura:{
    type: Schema.Types.ObjectId,
    ref: 'Factura',
    required: true
   },
    monto:{
        type: Number,
        required: true,
    },
    metodoCobro:{
        type: String,
        enum: ['Efectivo', 'Tarjeta', 'Transferencia', 'Mercado Pago', 'Otro'],
        required: true
},
    notas:{
        type: String,
        trim: true
    },
},  {
    timestamps: true // Añade createdAt y updatedAt
});

const Cobro = mongoose.model('Cobro', CobroSchema);
module.exports = Cobro;