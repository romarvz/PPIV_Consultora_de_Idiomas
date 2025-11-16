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
   // CAMBIO: Ahora soporta múltiples facturas
   facturas:[{
    facturaId: {
      type: Schema.Types.ObjectId,
      ref: 'Factura',
      required: true
    },
    montoCobrado: {
      type: Number,
      required: true
    }
   }],
   // Monto total del recibo (suma de todos los montos)
   montoTotal:{
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
    timestamps: true
});

const Cobro = mongoose.model('Cobro', CobroSchema);
module.exports = Cobro;