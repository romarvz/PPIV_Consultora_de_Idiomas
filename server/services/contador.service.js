const Contador = require('../models/contador.model');

const contadorService = {};

/**
 * Obtiene el siguiente número consecutivo para un tipo de documento
 * @param {String} tipoDocumento - 'factura' o 'recibo'
 * @returns {String} - Número formateado
 */
contadorService.obtenerSiguienteNumero = async (tipoDocumento) => {
    try {
        // Buscar y actualizar el contador en una sola operación (atómico)
        const contador = await Contador.findByIdAndUpdate(
            tipoDocumento, // 'factura' o 'recibo'
            { $inc: { secuencia: 1 } }, // Incrementa en 1
            { 
                new: true, // Devuelve el documento actualizado
                upsert: true, // Si no existe, lo crea
                setDefaultsOnInsert: true // Aplica valores por defecto si crea uno nuevo
            }
        );

        // Formatear el número según el tipo
        let numeroFormateado;
        if (tipoDocumento === 'factura') {
            // Formato: F-00001, F-00002, etc.
            numeroFormateado = `F-${String(contador.secuencia).padStart(5, '0')}`;
        } else if (tipoDocumento === 'recibo') {
            // Formato: RC-00001-00000001, RC-00001-00000002, etc.
            const puntoVenta = '00001'; 
            const numeroConsecutivo = String(contador.secuencia).padStart(8, '0');
            numeroFormateado = `RC-${puntoVenta}-${numeroConsecutivo}`;
        } else {
            throw new Error('Tipo de documento no válido');
        }

        return numeroFormateado;
    } catch (error) {
        console.error('Error al obtener siguiente número:', error);
        throw error;
    }
};

/**
 * Resetear un contador (usar con cuidado)
 */
contadorService.resetearContador = async (tipoDocumento) => {
    try {
        await Contador.findByIdAndUpdate(
            tipoDocumento,
            { secuencia: 0 },
            { upsert: true }
        );
        return { message: `Contador de ${tipoDocumento} reseteado a 0` };
    } catch (error) {
        throw error;
    }
};

module.exports = contadorService;