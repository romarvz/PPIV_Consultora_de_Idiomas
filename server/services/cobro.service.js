const Cobro = require('../models/cobros.model');
const Factura = require('../models/factura.model');
const contadorService = require('./contador.service');

class CobroService {
    
    /**
     * Registra un nuevo cobro para MÚLTIPLES facturas y actualiza sus estados
     * USANDO TRANSACCIONES para garantizar consistencia
     */
    async registrarCobroMultiple(datosCobro) {
        const { estudiante, facturas, metodoCobro, fechaCobro, notas } = datosCobro;

        // Validar que se proporcionaron facturas
        if (!facturas || facturas.length === 0) {
            throw new Error('Debe proporcionar al menos una factura para cobrar');
        }

        // Iniciar sesión de MongoDB
        const session = await Cobro.startSession();
        
        try {
            // Iniciar transacción
            session.startTransaction();

            let montoTotal = 0;
            const facturasActualizadas = [];
            const detallesFacturas = [];

            // Procesar cada factura
            for (const facturaData of facturas) {
                const { facturaId, montoCobrado } = facturaData;

                // 1. Validar monto
                if (!montoCobrado || montoCobrado <= 0) {
                    throw new Error(`El monto a cobrar debe ser mayor a cero para factura ${facturaId}`);
                }

                // 2. Buscar factura (dentro de la transacción)
                const facturaDB = await Factura.findById(facturaId).session(session);
                if (!facturaDB) {
                    throw new Error(`Factura ${facturaId} no encontrada`);
                }

                // 3. Validar estado de factura
                if (facturaDB.estado === 'Cobrada') {
                    throw new Error(`No se pueden registrar cobros para factura ${facturaDB.numeroFactura} (ya cobrada)`);
                }

                // 4. Validar que la factura pertenece al estudiante
                if (facturaDB.estudiante.toString() !== estudiante) {
                    throw new Error(`La factura ${facturaDB.numeroFactura} no pertenece a este estudiante`);
                }

                // 5. Calcular total cobrado ANTES del nuevo cobro
                const cobrosPrevios = await Cobro.find({
                    'facturas.facturaId': facturaId
                }).session(session);

                let totalCobradoPrevio = 0;
                cobrosPrevios.forEach(cobro => {
                    const facturaEnCobro = cobro.facturas.find(
                        f => f.facturaId.toString() === facturaId
                    );
                    if (facturaEnCobro) {
                        totalCobradoPrevio += facturaEnCobro.montoCobrado;
                    }
                });

                // 6. Validar que no exceda el total
                const totalConNuevoCobro = totalCobradoPrevio + montoCobrado;
                if (totalConNuevoCobro > facturaDB.total) {
                    throw new Error(
                        `El cobro excede el saldo pendiente de factura ${facturaDB.numeroFactura}. ` +
                        `Total factura: $${facturaDB.total}, ` +
                        `Ya cobrado: $${totalCobradoPrevio}, ` +
                        `Saldo: $${facturaDB.total - totalCobradoPrevio}, ` +
                        `Intentando cobrar: $${montoCobrado}`
                    );
                }

                // 7. Actualizar estado de factura
                if (totalConNuevoCobro >= facturaDB.total) {
                    facturaDB.estado = 'Cobrada';
                } else {
                    facturaDB.estado = 'Cobrada Parcialmente';
                }
                await facturaDB.save({ session });

                // Agregar al monto total
                montoTotal += montoCobrado;

                // Guardar detalles
                detallesFacturas.push({
                    facturaId,
                    montoCobrado
                });

                facturasActualizadas.push({
                    id: facturaDB._id,
                    numeroFactura: facturaDB.numeroFactura,
                    estado: facturaDB.estado,
                    total: facturaDB.total,
                    totalCobrado: totalConNuevoCobro,
                    saldoPendiente: facturaDB.total - totalConNuevoCobro
                });
            }

            // 8. Generar número de recibo
            const numeroRecibo = await contadorService.obtenerSiguienteNumero('recibo');

            // 9. Crear el cobro (dentro de la transacción)
            const nuevoCobro = new Cobro({
                numeroRecibo,
                estudiante,
                facturas: detallesFacturas,
                montoTotal,
                metodoCobro,
                fechaCobro: fechaCobro || Date.now(),
                notas
            });

            // 10. Guardar cobro (con sesión)
            await nuevoCobro.save({ session });

            // ✅ COMMIT: Si llegamos acá, todo salió bien
            await session.commitTransaction();

            // 11. Retornar resultado
            return {
                cobro: nuevoCobro,
                facturasActualizadas,
                mensaje: `Cobro registrado exitosamente. ${facturas.length} factura(s) procesada(s).`
            };

        } catch (error) {
            // ❌ ROLLBACK: Si algo falló, revertir TODO
            await session.abortTransaction();
            throw error;
            
        } finally {
            // Siempre cerrar la sesión
            session.endSession();
        }
    }

    /**
     * Registra un cobro para UNA SOLA factura (retrocompatibilidad)
     */
    async registrarCobro(datosCobro) {
        const { estudiante, factura, monto, metodoCobro, fechaCobro, notas } = datosCobro;

        // Convertir a formato múltiple
        return await this.registrarCobroMultiple({
            estudiante,
            facturas: [{
                facturaId: factura,
                montoCobrado: monto
            }],
            metodoCobro,
            fechaCobro,
            notas
        });
    }

    /**
     * Obtiene todos los cobros de un estudiante
     */
    async obtenerCobrosPorEstudiante(estudianteId) {
        const cobros = await Cobro.find({ estudiante: estudianteId })
            .sort({ fechaCobro: -1 })
            .populate('facturas.facturaId', 'numeroFactura total estado')
            .populate('estudiante', 'firstName lastName');

        if (!cobros || cobros.length === 0) {
            throw new Error('No se encontraron cobros para este estudiante');
        }

        return cobros;
    }

    /**
     * Obtiene todos los cobros asociados a una factura específica
     */
    async obtenerCobrosPorFactura(facturaId) {
        const cobros = await Cobro.find({
            'facturas.facturaId': facturaId
        })
            .sort({ fechaCobro: -1 })
            .populate('facturas.facturaId', 'numeroFactura total estado')
            .populate('estudiante', 'firstName lastName');

        return cobros;
    }

    /**
     * Obtiene todos los cobros (con filtros opcionales)
     */
    async listarCobros(filtros = {}) {
        const query = {};

        if (filtros.estudiante) {
            query.estudiante = filtros.estudiante;
        }

        if (filtros.fechaDesde || filtros.fechaHasta) {
            query.fechaCobro = {};
            if (filtros.fechaDesde) {
                query.fechaCobro.$gte = new Date(filtros.fechaDesde);
            }
            if (filtros.fechaHasta) {
                query.fechaCobro.$lte = new Date(filtros.fechaHasta);
            }
        }

        if (filtros.metodoCobro) {
            query.metodoCobro = filtros.metodoCobro;
        }

        const cobros = await Cobro.find(query)
            .sort({ fechaCobro: -1 })
            .populate('facturas.facturaId', 'numeroFactura total estado periodoFacturado')
            .populate('estudiante', 'firstName lastName dni');

        return cobros;
    }
}

module.exports = new CobroService();