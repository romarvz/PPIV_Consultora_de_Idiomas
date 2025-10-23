const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const conceptoCobroSchema = new Schema({
    nombre: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    descripcion: {
        type: String,
        trim: true
    },
    tipo: {
        type: String,
        enum: ['inscripcion', 'mensualidad', 'material', 'clase_particular', 'otro'],
        required: true
    },
    monto: {
        type: Number,
        required: true
    },
    activo: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true // Añade createdAt y updatedAt
});

const ConceptoCobro = mongoose.model('ConceptoCobro', conceptoCobroSchema);
module.exports = ConceptoCobro;