const ConceptCategory = require('../models/conceptCategory.model');
const Concept = require('../models/concept.model');
const categoryCtrl = {};

//create new category
categoryCtrl.createCategory = async (req, res) => {
    try{
        const { name, description } = req.body;
        const newCategory = new ConceptCategory({ name, description });
        await newCategory.save();
        res.status(201).json({message: 'Categoria de concepto creada con éxito.', category: newCategory});
    }   catch(error){
        res.status(500).json({message: 'Error al crear la categoria de concepto.', error: error.message});
    }
};

//get all categories
//TO DO: filter by active or inactive
categoryCtrl.getAllCategories = async (req, res) => {
    try{
        const categories = await ConceptCategory.find({active: true});
        res.status(200).json({data: categories});
    }   catch(error){
        res.status(500).json({message: 'Error al obtener las categorias de concepto.', error: error.message});
    }
};

categoryCtrl.getCategoryById = async (req, res) => {
    try{
        const category = await ConceptCategory.findById(req.params.id);
        if(!category){
            return res.status(404).json({message: 'Categoria de concepto no encontrada.'});
        }
        res.status(200).json({data: category});
    }   catch(error){
        res.status(500).json({message: 'Error al obtener la categoria de concepto.', error: error.message});
    }
}


//update category by id
categoryCtrl.updateCategory = async (req, res) => {
    try{
        const categoryUpdated = await ConceptCategory.findByIdAndUpdate(req.params.id, req.body, {new: true});
        if(!categoryUpdated){
            return res.status(404).json({message: 'Categoria de concepto no encontrada.'});
        }
        res.status(200).json({message: 'Categoria de concepto actualizada con éxito.', data: categoryUpdated});
    }  catch(error){
        res.status(500).json({message: 'Error al actualizar la categoria de concepto.', error: error.message});
    }   
};

//delete or deactivate category by id
categoryCtrl.deleteCategory = async (req, res) => {
    try{
        const categoryId = req.params.id;
        const linkedConcepts = await Concept.findOne({ category: categoryId });

        if(linkedConcepts){
            const categoryDeactivated = await ConceptCategory.findByIdAndUpdate(
                categoryId, 
                { active: false }, 
                { new: true }
            );
            if(!categoryDeactivated){
                return res.status(404).json({message: 'Categoria de concepto no encontrada.'});
            }

            res.status(200).json({
                message: 'Categoria desactivada.', 
                category: categoryDeactivated});
            
        } else {
            const categoryDeleted = await ConceptCategory.findByIdAndDelete(categoryId);
            if (!categoryDeleted) {
                return res.status(404).json({ message: 'Categoría no encontrada.' });
            }
            res.status(200).json({ message: 'Categoría eliminada permanentemente (no estaba en uso).' });
        }
    }catch(error){
            res.status(500).json({
                message: 'Error al eliminar/desactivar la categoria de concepto.', 
                error: error.message});
    }
};   

module.exports = categoryCtrl;