const Cobro = require('../models/cobros.model');
const Factura = require('../models/factura.model');
const condatorService = require('../services/contador.service');

const cobroCtrl = {};

//Crear un cobro
cobroCtrl.createCobro = async (req, res) => {
    try {
        const { 
            estudiante, 
            factura, 
            monto,
            metodoCobro,
            fechaCobro,
            notas} = req.body;

        const facturaDB = await Factura.findById(factura);
        if (!facturaDB) {
            res.status(404).json({ message: 'Factura no encontrada' });
        }
        if (facturaDB.estado === 'Cobrada' || facturaDB.estado === 'Anulada'){
            return res.status(400).json({ message: 'No se pueden registrar cobros para facturas pagadas o anuladas' });
        }
        if (facturaDB.estudiante.toString() !== estudiante) {
            return res.status(400).json({ message: 'La Factura no pertenece a este estudiante' });
        }

        // Calcular cuánto se cobró previamente
        const cobrosPrevios = await Cobro.find({ factura: factura });
        const totalCobradoPrevio = cobrosPrevios.reduce((sum, cobro) => sum + cobro.monto, 0);

        // Calcular cuánto sería el total con este nuevo cobro
        const totalConNuevoCobro = totalCobradoPrevio + monto;

        // Validar que no se exceda el total de la factura
        if (totalConNuevoCobro > facturaDB.total) {
            return res.status(400).json({ 
                message: 'El monto del cobro excede el saldo pendiente de la factura',
                totalFactura: facturaDB.total,
                totalCobrado: totalCobradoPrevio,
                saldoPendiente: facturaDB.total - totalCobradoPrevio,
                montoIntentado: monto
            });
        }
        //Generar numero de recibo consecutivo
        const numeroRecibo = await condatorService.obtenerSiguienteNumero('recibo');

        //crear el recibo por el cobro
        const newCobro = new Cobro({
            numeroRecibo: numeroRecibo,
            estudiante,
            factura,
            monto,
            metodoCobro,
            fechaCobro: fechaCobro || Date.now(),
            notas
        });

        //actualizar el estado de la factura 
       if (totalConNuevoCobro >= facturaDB.total){
            facturaDB.estado = 'Cobrada';
        } else {
            facturaDB.estado = 'Cobrada Parcialmente';
        }
        await facturaDB.save();
        await newCobro.save();

        res.status(201).json({ message: 'Cobro registrado exitosamente', cobro: newCobro });
    } catch (error) {
        res.status(500).json({ message: 'Error al registrar el cobro', error: error.message });
    }
};

//Obtener todos los cobros a un estudiante
cobroCtrl.getCobrosByEstudiante = async (req, res) => {
    try {
        const { idEstudiante } = req.params;
        const cobros = await Cobro.find({ estudiante: idEstudiante })
        .sort({ fechaCobro: -1 }) //ordena por fecha
        .populate('factura', 'numeroFactura total estado'); //trae los datos basicos de la factura

        if(!cobros){
            return res.status(404).json({ message: 'No se encontraron cobros para este estudiante' });
        }    
        res.status(200).json(cobros);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener los cobros', error: error.message });
    }
};

module.exports = cobroCtrl;