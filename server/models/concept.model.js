const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const conceptSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    category: {
        type: Schema.Types.ObjectId,
        ref: 'ConceptCategory', // Referencia a tu modelo de categoría
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    active: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

const Concept = mongoose.model('Concept', conceptSchema);
module.exports = Concept;