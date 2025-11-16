const cobroService = require('../services/cobro.service');

const cobroCtrl = {};

/**
 * Crear un cobro (soporta una o múltiples facturas)
 * POST /api/cobros
 * 
 * Body para UNA factura:
 * {
 *   "estudiante": "id",
 *   "factura": "id",
 *   "monto": 5000,
 *   "metodoCobro": "Efectivo",
 *   "fechaCobro": "2025-11-14",
 *   "notas": "..."
 * }
 * 
 * Body para MÚLTIPLES facturas:
 * {
 *   "estudiante": "id",
 *   "facturas": [
 *     { "facturaId": "id1", "montoCobrado": 5000 },
 *     { "facturaId": "id2", "montoCobrado": 3000 }
 *   ],
 *   "metodoCobro": "Efectivo",
 *   "fechaCobro": "2025-11-14",
 *   "notas": "..."
 * }
 */
cobroCtrl.createCobro = async (req, res) => {
    try {
        let resultado;

        // Detectar si es cobro simple o múltiple
        if (req.body.facturas && Array.isArray(req.body.facturas)) {
            // Cobro múltiple
            resultado = await cobroService.registrarCobroMultiple(req.body);
        } else if (req.body.factura && req.body.monto) {
            // Cobro simple (retrocompatibilidad)
            resultado = await cobroService.registrarCobro(req.body);
        } else {
            return res.status(400).json({
                success: false,
                message: 'Formato inválido. Debe proporcionar "factura" y "monto" O "facturas" como array'
            });
        }
        
        res.status(201).json({
            success: true,
            message: resultado.mensaje,
            data: {
                cobro: resultado.cobro,
                facturasActualizadas: resultado.facturasActualizadas || [resultado.facturaActualizada]
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
 * Obtener mis propios cobros (estudiante autenticado)
 * GET /api/cobros/mis-cobros
 */
cobroCtrl.getMisCobros = async (req, res) => {
    try {
        const estudianteId = req.user._id || req.user.id;
        const cobros = await cobroService.obtenerCobrosPorEstudiante(estudianteId);

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

/**
 * Listar todos los cobros (con filtros opcionales)
 * GET /api/cobros?estudiante=id&fechaDesde=2025-01-01&fechaHasta=2025-12-31&metodoCobro=Efectivo
 */
cobroCtrl.listarCobros = async (req, res) => {
    try {
        const cobros = await cobroService.listarCobros(req.query);

        res.status(200).json({
            success: true,
            total: cobros.length,
            data: cobros
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Obtener cobros de una factura específica
 * GET /api/cobros/factura/:idFactura
 */
cobroCtrl.getCobrosByFactura = async (req, res) => {
    try {
        const { idFactura } = req.params;
        const cobros = await cobroService.obtenerCobrosPorFactura(idFactura);

        res.status(200).json({
            success: true,
            total: cobros.length,
            data: cobros
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = cobroCtrl;