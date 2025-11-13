// Agregar este método ANTES de facturaCtrl.autorizarFactura en facturas.controller.js

/**
 * Autorizar una factura (solicitar CAE)
 * PUT /api/facturas/:id/autorizar
 */
facturaCtrl.autorizarFactura = async (req, res) => {
    try {
        const { id } = req.params;
        const Factura = require('../models/factura.model');
        
        // Obtener factura a autorizar
        const facturaActual = await Factura.findById(id);
        if (!facturaActual) {
            return res.status(404).json({
                success: false,
                message: 'Factura no encontrada'
            });
        }

        if (facturaActual.estado !== 'Borrador') {
            return res.status(400).json({
                success: false,
                message: 'Solo se pueden autorizar facturas en estado Borrador'
            });
        }

        // VALIDACIÓN: Verificar que no haya facturas anteriores sin CAE
        const numeroActual = parseInt(facturaActual.numeroFactura.split('-')[1]);
        
        const facturasAnterioresSinCAE = await Factura.find({
            numeroFactura: {
                $regex: `^${facturaActual.numeroFactura.substring(0, 11)}`
            },
            estado: 'Borrador'
        }).sort({ numeroFactura: 1 });

        // Filtrar solo las que tienen número menor
        const pendientesAnteriores = facturasAnterioresSinCAE.filter(f => {
            const numFactura = parseInt(f.numeroFactura.split('-')[1]);
            return numFactura < numeroActual;
        });

        if (pendientesAnteriores.length > 0) {
            const numerosAnteriores = pendientesAnteriores.map(f => f.numeroFactura).join(', ');
            return res.status(400).json({
                success: false,
                message: `No puede autorizar esta factura. Debe autorizar primero las facturas anteriores: ${numerosAnteriores}`,
                facturasAnteriores: numerosAnteriores
            });
        }

        // Si pasa la validación, autorizar
        const facturaService = require('../services/facturaBorrador.service');
        const resultado = await facturaService.autorizarFactura(id);

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