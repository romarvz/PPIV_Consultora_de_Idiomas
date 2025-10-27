const Concept = require('../models/concept.model');
const ConceptCategory = require('../models/conceptCategory.model');

const conceptCtrl = {};

//create new concept 
conceptCtrl.createConcept = async (req, res) => {
    try{
        const { name, description, category, amount } = req.body;
        const categoryExists = await ConceptCategory.findById({_id: category, active: true});
        if(!categoryExists){
            return  res.status(400).json({message: 'La categoria especificada no existe o está inactiva.'});
        }
        const newConcept = new Concept({ 
            name, 
            description, 
            category, 
            amount, 
            active: true
        }); 
        await newConcept.save();
        res.status(201).json({message: 'Concepto creado con éxito.', concept: newConcept});
    }   catch(error){
        //TO DO: Validation error handling
        if(error.name === 11000){
            return res.status(400).json({message: 'Error de validación.', error: error.message});
        }
        res.status(500).json({message: 'Error al crear el concepto.', error: error.message});
    }
};

//get all concepts
conceptCtrl.getAllConcepts = async (req, res) => {
    try{
        const concepts = await Concept.find({active: true})
        .populate('category', 'name description');

        res.status(200).json({data: concepts});
    }   catch(error){
        res.status(500).json({message: 'Error al obtener los conceptos.', error: error.message});
    }   
};

//get concept by id
conceptCtrl.getConceptById = async (req, res) => {
    try{
        const concept = await Concept.findById(req.params.id)
        .populate('category', 'name description');

        if(!concept){
            return res.status(404).json({message: 'Concepto no encontrado.'});
        }
        res.status(200).json({data: concept});
    }   catch(error){
        res.status(500).json({message: 'Error al obtener el concepto.', error: error.message});
    }
};

//update concept by id
conceptCtrl.updateConcept = async (req, res) => {
    try{
        const { category } = req.body;
        if(category){
            const categoryExists = await ConceptCategory.findById({_id: category, active: true});
            if(!categoryExists){
                return  res.status(400).json({message: 'La categoria especificada no existe o está inactiva.'});
            }
        }

        const conceptUpdated = await Concept.findByIdAndUpdate(req.params.id, req.body, {new: true});
        if(!conceptUpdated){
            return res.status(404).json({message: 'Concepto no encontrado.'});
        }
        res.status(200).json({message: 'Concepto actualizado con éxito.', data: conceptUpdated});
    }  catch(error){
        res.status(500).json({message: 'Error al actualizar el concepto.', error: error.message});
    }
};

//delete or deactivate concept by id
conceptCtrl.deleteConcept = async (req, res) => {
    try{
        const conceptDesactivated = await Concept.findByIdAndUpdate(
            req.params.id, 
            { active: false }, 
            { new: true }
        );

        if(!conceptDesactivated){
            return res.status(404).json({message: 'Concepto no encontrado.'});
        }
        res.status(200).json({message: 'Concepto desactivado con éxito.', data: conceptDesactivated});
    }   catch(error){
        res.status(500).json({message: 'Error al desactivar el concepto.', error: error.message});
    }
};

module.exports = conceptCtrl;