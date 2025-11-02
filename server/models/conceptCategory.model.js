const mongoose = require('mongoose');
const { Schema } = mongoose;

const conceptCategorySchema = new Schema({
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
    active: {
        type: Boolean,
        default: true
    },
},{
    timestamps: true
});

const ConceptCategory = mongoose.model('ConceptCategory', conceptCategorySchema);
module.exports = ConceptCategory;