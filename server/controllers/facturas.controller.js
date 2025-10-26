const facturaService = require('../services/factura.service');

const facturaCtrl = {};

/**
 * Crear una nueva factura
 * POST /api/facturas
 */
facturaCtrl.createFactura = async (req, res) => {
    try {
        const resultado = await facturaService.crearFactura(req.body);

        res.status(201).json({
            success: true,
            message: resultado.mensaje,
            data: resultado.factura
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Obtener facturas de un estudiante
 * GET /api/facturas/estudiante/:idEstudiante
 */
facturaCtrl.getFacturasByEstudiante = async (req, res) => {
    try {
        const { idEstudiante } = req.params;
        const facturas = await facturaService.obtenerFacturasPorEstudiante(idEstudiante);

        res.status(200).json({
            success: true,
            total: facturas.length,
            data: facturas
        });
    } catch (error) {
        res.status(404).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = facturaCtrl;