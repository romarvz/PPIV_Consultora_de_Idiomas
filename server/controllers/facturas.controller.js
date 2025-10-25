const Factura = require('../models/factura.model');
const facturaService = require('../services/factura.service');

const facturaCtrl = {};

// Crear una nueva factura
facturaCtrl.createFactura = async (req, res) => {
    try {
        const {
            estudiante, 
            condicionFiscal,
            fechaVencimiento,
            itemFacturaSchema,
            periodoFacturado,
            } = req.body;
        
        //TODO: Validar datos de entrada
        /*
        const estudianteDB = await BaseUser.findById(estudiante);
        if (!estudianteDB) {
            return res.status(400).json({ message: 'Estudiante no encontrado' });
        }
        */
        // Cálculos en factura
        const subtotal = itemFacturaSchema.reduce((acc, item) => 
            acc + (item.precioUnitario * item.cantidad), 0);
        const numeroFacturaCorrelativo = await facturaService.generarNumeroFactura();
        const nuevaFactura = new Factura({
            estudiante,
            condicionFiscal,
            numeroFactura: numeroFacturaCorrelativo,
            fechaEmision: new Date(),
            fechaVencimiento: fechaVencimiento || new Date(Date.now().toString().slice(0,10)),
            itemFacturaSchema,
            periodoFacturado,
            subtotal,
            total,
            estadoCobro: 'Pendiente'
        });
        await nuevaFactura.save();
        res.status(201).json({ message: 'Factura creada exitosamente', factura: nuevaFactura });
    }catch (error) {
        res.status(500).json({ message: 'Error al crear la factura', error: error.message });
    }
};
  

module.exports = facturaCtrl;

