const Cobro = require('../models/cobros.model');
const Factura = require('../models/factura.model');

const cobroCtrl = {};

//Crear un pago
cobroCtrl.createCobro = async (req, res) => {
    try {
        const { 
            estudiante, 
            factura, 
            monto,
            metodoCobro,
            fecha,
            notas} = req.body;

        const facturaDB = await Factura.findById(factura);
        if (!facturaDB) {
            res.status(404).json({ message: 'Factura no encontrada' });
        }
        if (facturaDB.estado === 'Pagada' || facturaDB.estado === 'Anulada'){
            return res.status(400).json({ message: 'No se pueden registrar cobros para facturas pagadas o anuladas' });
        }
        if (facturaDB.estudiante.toString() !== estudiante) {
            return res.status(400).json({ message: 'La Factura no pertenece a este estudiante' });
        }

        //TODO: Generar el servicio de numeracion correlativa de recibos
        const numeroReciboSimulado = `R-00001-${Date.now().toString.slice(-6)}`; 

        //crear el recibo por el cobro
        const newCobro = new Cobro({
            numeroRecibo: numeroReciboSimulado,
            estudiante,
            factura,
            monto,
            metodoCobro,
            fechaCobro: fechaCobro || Date.now(),
            notas
        });
        await newCobro.save();

        //actualizar el estado de la factura 
        if (totalPagado >= facturaDB.total){
            facturaDB.estado = 'Pagada';
        } else {
            facturaDB.estado = 'Pago Parcial';
        }
        await facturaDB.save();

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