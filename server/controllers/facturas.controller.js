const facturaService = require('../services/factura.service');

const facturaCtrl = {};

/**
 * Crear una nueva factura en BORRADOR (sin autorización)
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
 * Obtener todas las facturas
 * GET /api/facturas
 */
facturaCtrl.getAllFacturas = async (req, res) => {
    try {
        const Factura = require('../models/factura.model');
        const facturas = await Factura.find()
            .populate('estudiante', 'firstName lastName dni email')
            .sort({ fechaEmision: -1 });

        res.status(200).json({
            success: true,
            total: facturas.length,
            data: facturas
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Obtener una factura por ID
 * GET /api/facturas/:id
 */
facturaCtrl.getFacturaById = async (req, res) => {
    try {
        const { id } = req.params;
        const factura = await facturaService.obtenerFacturaPorId(id);

        res.status(200).json({
            success: true,
            data: factura
        });
    } catch (error) {
        res.status(404).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Editar una factura en BORRADOR
 * PUT /api/facturas/:id
 */
facturaCtrl.editarFactura = async (req, res) => {
    try {
        const { id } = req.params;
        const resultado = await facturaService.editarFactura(id, req.body);

        res.status(200).json({
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
 * Eliminar una factura en BORRADOR
 * DELETE /api/facturas/:id
 */
facturaCtrl.eliminarFactura = async (req, res) => {
    try {
        const { id } = req.params;
        const resultado = await facturaService.eliminarFactura(id);

        res.status(200).json({
            success: true,
            message: resultado.mensaje
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Autorizar una factura (solicitar CAE a AFIP)
 * PUT /api/facturas/:id/autorizar
 */
facturaCtrl.autorizarFactura = async (req, res) => {
    try {
        const { id } = req.params;
        const resultado = await facturaService.autorizarFactura(id);
        
        res.status(200).json({
            success: true,
            message: resultado.mensaje,
            data: {
                factura: resultado.factura,
                cae: resultado.cae,
                caeVencimiento: resultado.caeVencimiento
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
 * Obtener mis propias facturas (estudiante autenticado)
 * GET /api/facturas/mis-facturas
 */
facturaCtrl.getMisFacturas = async (req, res) => {
    try {
        const estudianteId = req.user._id || req.user.id;
        console.log('getMisFacturas - ID del estudiante desde token:', estudianteId);
        console.log('getMisFacturas - Usuario completo:', req.user);

        // Buscar facturas directamente sin usar el servicio que lanza error
        const Factura = require('../models/factura.model');
        const Cobro = require('../models/cobros.model');

        const facturas = await Factura.find({ estudiante: estudianteId })
            .sort({ fechaEmision: -1 })
            .populate('estudiante', 'firstName lastName email');

        console.log('getMisFacturas - Facturas encontradas:', facturas.length);

        // Calcular saldo pendiente para cada factura
        const facturasConSaldo = await Promise.all(facturas.map(async (factura) => {
            const facturaObj = factura.toObject();

            // Obtener todos los cobros de esta factura
            const cobros = await Cobro.find({
                'facturas.facturaId': factura._id
            });

            // Calcular total cobrado
            let totalCobrado = 0;
            cobros.forEach(cobro => {
                const facturaEnCobro = cobro.facturas.find(
                    f => f.facturaId.toString() === factura._id.toString()
                );
                if (facturaEnCobro) {
                    totalCobrado += facturaEnCobro.montoCobrado;
                }
            });

            // Agregar información de cobros
            facturaObj.totalCobrado = totalCobrado;
            facturaObj.saldoPendiente = factura.total - totalCobrado;

            return facturaObj;
        }));

        res.status(200).json({
            success: true,
            total: facturasConSaldo.length,
            data: facturasConSaldo
        });
    } catch (error) {
        console.error('getMisFacturas - Error:', error);
        res.status(500).json({
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

/**
 * Obtener deuda total de un estudiante
 * GET /api/facturas/estudiante/:idEstudiante/deuda
 */
facturaCtrl.getDeudaEstudiante = async (req, res) => {
    try {
        const { idEstudiante } = req.params;
        const deuda = await facturaService.obtenerDeudaEstudiante(idEstudiante);

        res.status(200).json({
            success: true,
            data: deuda
        });
    } catch (error) {
        res.status(404).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Verificar estado del servicio AFIP (simulado)
 * GET /api/facturas/afip/estado
 */
facturaCtrl.verificarEstadoAFIP = async (req, res) => {
    try {
        const estado = facturaService.verificarEstadoARCA();

        res.status(200).json({
            success: true,
            data: estado
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = facturaCtrl;