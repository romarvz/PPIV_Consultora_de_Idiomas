const cobroService = require('../services/cobro.service');

const cobroCtrl = {};

/**
 * Crear un cobro
 * POST /api/cobros
 */
cobroCtrl.createCobro = async (req, res) => {
    try {
        const resultado = await cobroService.registrarCobro(req.body);
        
        res.status(201).json({
            success: true,
            message: resultado.mensaje,
            data: {
                cobro: resultado.cobro,
                factura: resultado.facturaActualizada
            }
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Obtener cobros de un estudiante
 * GET /api/cobros/estudiante/:idEstudiante
 */
cobroCtrl.getCobrosByEstudiante = async (req, res) => {
    try {
        const { idEstudiante } = req.params;
        const cobros = await cobroService.obtenerCobrosPorEstudiante(idEstudiante);
        
        res.status(200).json({
            success: true,
            total: cobros.length,
            data: cobros
        });
    } catch (error) {
        res.status(404).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = cobroCtrl;