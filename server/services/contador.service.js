const Contador = require('../models/contador.model');

const contadorService = {};

/**
 * Obtiene el siguiente número consecutivo para un tipo de documento
 * @param {String} tipoDocumento - 'factura_a', 'factura_b' o 'recibo'
 * @returns {String} - Número formateado
 */
contadorService.obtenerSiguienteNumero = async (tipoDocumento) => {
    try {
        // Buscar y actualizar el contador en una sola operación (atómico)
        const contador = await Contador.findByIdAndUpdate(
            tipoDocumento, // 'factura_a', 'factura_b' o 'recibo'
            { $inc: { secuencia: 1 } }, // Incrementa en 1
            { 
                new: true, // Devuelve el documento actualizado
                upsert: true, // Si no existe, lo crea
                setDefaultsOnInsert: true // Aplica valores por defecto si crea uno nuevo
            }
        );

        // Formatear el número según el tipo
        let numeroFormateado;
        
        if (tipoDocumento === 'factura_a') {
            // Formato: FA-00001, FA-00002, etc.
            numeroFormateado = `FA-${String(contador.secuencia).padStart(5, '0')}`;
            
        } else if (tipoDocumento === 'factura_b') {
            // Formato: FB-00001, FB-00002, etc.
            numeroFormateado = `FB-${String(contador.secuencia).padStart(5, '0')}`;
            
        } else if (tipoDocumento === 'recibo') {
            // Formato: RC-00001-00000001, RC-00001-00000002, etc.
            const puntoVenta = '00001'; 
            const numeroConsecutivo = String(contador.secuencia).padStart(8, '0');
            numeroFormateado = `RC-${puntoVenta}-${numeroConsecutivo}`;
            
        } else {
            throw new Error(`Tipo de documento no válido: ${tipoDocumento}. Use 'factura_a', 'factura_b' o 'recibo'`);
        }

        console.log(`Contador ${tipoDocumento}: Generado número ${numeroFormateado}`);
        return numeroFormateado;
        
    } catch (error) {
        console.error('Error al obtener siguiente número:', error);
        throw error;
    }
};

/**
 * Obtiene el valor actual de un contador SIN incrementarlo
 * @param {String} tipoDocumento 
 * @returns {Number} - Valor actual de la secuencia
 */
contadorService.obtenerValorActual = async (tipoDocumento) => {
    try {
        const contador = await Contador.findById(tipoDocumento);
        return contador ? contador.secuencia : 0;
    } catch (error) {
        console.error('Error al obtener valor actual:', error);
        throw error;
    }
};

/**
 * Resetear un contador (usar con cuidado)
 * @param {String} tipoDocumento 
 */
contadorService.resetearContador = async (tipoDocumento) => {
    try {
        await Contador.findByIdAndUpdate(
            tipoDocumento,
            { secuencia: 0 },
            { upsert: true }
        );
        console.log(`Contador de ${tipoDocumento} reseteado a 0`);
        return { message: `Contador de ${tipoDocumento} reseteado a 0` };
    } catch (error) {
        throw error;
    }
};

/**
 * Establecer un contador en un valor específico (para migración)
 * @param {String} tipoDocumento 
 * @param {Number} valor 
 */
contadorService.establecerContador = async (tipoDocumento, valor) => {
    try {
        await Contador.findByIdAndUpdate(
            tipoDocumento,
            { secuencia: valor },
            { upsert: true }
        );
        console.log(`Contador de ${tipoDocumento} establecido en ${valor}`);
        return { message: `Contador de ${tipoDocumento} establecido en ${valor}` };
    } catch (error) {
        throw error;
    }
};

module.exports = contadorService;