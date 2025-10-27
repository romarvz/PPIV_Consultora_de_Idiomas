const Cobro = require('../models/cobros.model');
const Factura = require('../models/factura.model');
const contadorService = require('./contador.service');

class CobroService {
    
    /**
 * Registra un nuevo cobro y actualiza el estado de la factura
 * USANDO TRANSACCIONES para garantizar consistencia
 */
async registrarCobro(datosCobro) {
    const { estudiante, factura, monto, metodoCobro, fechaCobro, notas } = datosCobro;

    // Iniciar sesión de MongoDB
    const session = await Cobro.startSession();
    
    try {
        // Iniciar transacción
        session.startTransaction();

        // 1. Validar monto
        if (!monto || monto <= 0) {
            throw new Error('El monto debe ser mayor a cero');
        }

        // 2. Buscar factura (dentro de la transacción)
        const facturaDB = await Factura.findById(factura).session(session);
        if (!facturaDB) {
            throw new Error('Factura no encontrada');
        }

        // 3. Validar estado de factura
        if (facturaDB.estado === 'Cobrada') {
            throw new Error('No se pueden registrar cobros para facturas cobradas');
        }

        // 4. Validar que la factura pertenece al estudiante
        if (facturaDB.estudiante.toString() !== estudiante) {
            throw new Error('La factura no pertenece a este estudiante');
        }

        // 5. Calcular total cobrado ANTES del nuevo cobro
        const cobrosPrevios = await Cobro.find({ factura }).session(session);
        const totalCobradoPrevio = cobrosPrevios.reduce((sum, cobro) => sum + cobro.monto, 0);

        // 6. Validar que no exceda el total
        const totalConNuevoCobro = totalCobradoPrevio + monto;
        if (totalConNuevoCobro > facturaDB.total) {
            throw new Error(
                `El cobro excede el saldo pendiente. ` +
                `Total factura: $${facturaDB.total}, ` +
                `Ya cobrado: $${totalCobradoPrevio}, ` +
                `Saldo: $${facturaDB.total - totalCobradoPrevio}, ` +
                `Intentando cobrar: $${monto}`
            );
        }

        // 7. Generar número de recibo
        const numeroRecibo = await contadorService.obtenerSiguienteNumero('recibo');

        // 8. Crear el cobro (dentro de la transacción)
        const nuevoCobro = new Cobro({
            numeroRecibo,
            estudiante,
            factura,
            monto,
            metodoCobro,
            fechaCobro: fechaCobro || Date.now(),
            notas
        });

        // 9. Guardar cobro (con sesión)
        await nuevoCobro.save({ session });

        // 10. Actualizar estado de factura (con sesión)
        if (totalConNuevoCobro >= facturaDB.total) {
            facturaDB.estado = 'Cobrada';
        } else {
            facturaDB.estado = 'Cobrada Parcialmente';
        }
        await facturaDB.save({ session });

        // ✅ COMMIT: Si llegamos acá, todo salió bien
        await session.commitTransaction();

        // 11. Retornar resultado
        return {
            cobro: nuevoCobro,
            facturaActualizada: {
                id: facturaDB._id,
                estado: facturaDB.estado,
                total: facturaDB.total,
                totalCobrado: totalConNuevoCobro,
                saldoPendiente: facturaDB.total - totalConNuevoCobro
            },
            mensaje: 'Cobro registrado exitosamente'
        };

    } catch (error) {
        // ❌ ROLLBACK: Si algo falló, revertir TODO
        await session.abortTransaction();
        throw error; // Re-lanzar el error para que el controller lo maneje
        
    } finally {
        // Siempre cerrar la sesión
        session.endSession();
    }
    }
    /**
     * Obtiene todos los cobros de un estudiante
     * @param {String} estudianteId 
     * @returns {Array} - Lista de cobros con datos de factura
     */
    async obtenerCobrosPorEstudiante(estudianteId) {
        const cobros = await Cobro.find({ estudiante: estudianteId })
            .sort({ fechaCobro: -1 })
            .populate('factura', 'numeroFactura total estado')
            .populate('estudiante', 'nombre apellido');

        if (!cobros || cobros.length === 0) {
            throw new Error('No se encontraron cobros para este estudiante');
        }

        return cobros;
    }
}

module.exports = new CobroService();