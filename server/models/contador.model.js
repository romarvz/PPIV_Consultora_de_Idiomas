const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const contadorSchema = new Schema({
    _id: {
        type: String,
        required: true,
    },
    secuencia:{
        type: Number,
        default: 0
    }
});

module.exports = mongoose.model('Contador', contadorSchema);
module.exports = Contador;
    