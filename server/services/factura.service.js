const Contador = require('../models/contador.model');
const Factura = require('../models/factura.model');
//const Curso = require('../models/curso.model');
//const Clase = require('../models/clase.model');
//const BaseUser = require('../models/BaseUser.model');

const facturaService = {};

/**
 * Genera el próximo número de factura correlativo.
 * Busca el contador 'factura', lo incrementa en 1, y devuelve un string formateado.
 * Formato: F-0001-00000001
 */

facturaService.generarNumeroFactura = async () => {
    try{
        // 1. Busca el contador con ID 'factura' y lo incrementa en 1.
        // { upsert: true } crea el contador si no existe.
        // { new: true } devuelve el documento actualizado.
        const contador = await Contador.findByIdAndUpdate(
            'factura', // El ID de nuestro contador
            { $inc: { secuencia: 1 } }, // Incrementa el campo 'secuencia' en 1
            { upsert: true, new: true }
        );
        // 2. Formatea el número de factura.
        const numeroSecuencia = String(contador.secuencia).toString().padStart(8, '0'); // Rellena con ceros a la izquierda hasta 8 dígitos
        //TODO: crear servicio para el punto de venta
        const numeroFormateado = `F-00001-${numeroSecuencia}`; // Formato final
    }catch(error){
        throw new Error('Error al generar el número de factura: ' + error.message);
    }
};

 //Genera la factura mensual para un estudiante.
 facturaService.generarFacturaMensual = async (estudianteId, periodo) => {
    //TODO: 
    //1) buscar todos los cursos y clases del estudiante
    //2) crear el array de items de la factura
    //3) calcular subtotal y total
    //4) llamar a this.generarNumeroFactura() para obtener el número correlativo
    //5) crear y guardar la factura en la base de datos
    console.log('Generando factura mensual para estudiante:', estudianteId, 'Periodo:', periodo);


};

module.exports = facturaService;

