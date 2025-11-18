const Factura = require('../models/factura.model');
const BaseUser = require('../models/BaseUser');
const contadorService = require('./contador.service');
const ArcaSimulacionService = require('./arcaSimulacionSimple.service');

class FacturaService {
    /**
     * Crea una nueva factura en estado BORRADOR (sin autorización ARCA)
     * La factura puede ser editada o eliminada mientras está en borrador
     * 
     * @param {Object} datosFactura - { estudiante, condicionFiscal, fechaVencimiento, itemFacturaSchema, periodoFacturado }
     * @returns {Object} - { factura, mensaje }
     */
    async crearFactura(datosFactura) {
        const { estudiante, condicionFiscal, fechaVencimiento, itemFacturaSchema, periodoFacturado } = datosFactura;

        // 1. Validar datos de entrada
        if (!estudiante || !itemFacturaSchema || !itemFacturaSchema.length) {
            throw new Error('Estudiante y ítems de factura son requeridos');
        }

        // 2. Validar existencia del estudiante
        const estudianteDB = await BaseUser.findById(estudiante);
        if (!estudianteDB) {
            throw new Error('Estudiante no encontrado');
        }

        // 3. Validar ítems de factura
        for (const item of itemFacturaSchema) {
            if (!item.precioUnitario || !item.cantidad || item.precioUnitario <= 0 || item.cantidad <= 0) {
                throw new Error('Los ítems deben tener precio unitario y cantidad válidos');
            }
        }

        // ========================================
        // VALIDACIÓN i: Fecha de emisión no puede ser mayor a 10 días hacia atrás
        // ========================================
        const fechaEmision = new Date();
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0); // Normalizar a medianoche
        
        const fechaLimite = new Date(hoy);
        fechaLimite.setDate(hoy.getDate() - 10);
        
        const fechaEmisionNormalizada = new Date(fechaEmision);
        fechaEmisionNormalizada.setHours(0, 0, 0, 0);
        
        if (fechaEmisionNormalizada < fechaLimite) {
            throw new Error('La fecha de emisión no puede ser mayor a 10 días contados hacia atrás');
        }

        // ========================================
        // VALIDACIÓN ii: Fecha debe ser >= última factura creada (con límite de 10 días)
        // ========================================
        const ultimaFactura = await Factura.findOne()
            .sort({ fechaEmision: -1 })
            .select('fechaEmision numeroFactura');

        if (ultimaFactura) {
            const ultimaFechaEmision = new Date(ultimaFactura.fechaEmision);
            ultimaFechaEmision.setHours(0, 0, 0, 0);
            
            if (fechaEmisionNormalizada < ultimaFechaEmision) {
                throw new Error(`La fecha de emisión no puede ser anterior a la última factura creada (${ultimaFactura.numeroFactura} - ${ultimaFechaEmision.toLocaleDateString()})`);
            }
        }

        // ========================================
        // 4. Calcular subtotal y total
        // ========================================
        const subtotal = itemFacturaSchema.reduce((acc, item) => acc + (item.precioUnitario * item.cantidad), 0);
        const total = subtotal; 

        // ========================================
        // 5. Determinar tipo de factura y generar número
        // ========================================
        const tipoFactura = (condicionFiscal === 'Consumidor Final') ? 'B' : 'A';
        const tipoContador = tipoFactura === 'A' ? 'factura_a' : 'factura_b';
        
        // Obtener número secuencial del contador correcto
        const numeroSecuencial = await contadorService.obtenerSiguienteNumero(tipoContador);
        
        // Extraer solo el número del formato FA-00001 o FB-00001
        const match = numeroSecuencial.match(/\d+$/);
        const numeroLimpio = match ? match[0] : numeroSecuencial;
        
        // Formatear número de factura final
        const puntoVenta = '00001';
        const numeroFormateado = numeroLimpio.padStart(8, '0');
        const numeroFactura = `FC ${tipoFactura} ${puntoVenta}-${numeroFormateado}`;

        // ========================================
        // 6. Crear la factura en estado BORRADOR (SIN CAE)
        // ========================================
        const nuevaFactura = new Factura({
            estudiante,
            condicionFiscal,
            numeroFactura,
            fechaEmision: fechaEmision,
            fechaVencimiento: fechaVencimiento || new Date(),
            itemFacturaSchema,
            periodoFacturado,
            subtotal,
            total,
            estado: 'Borrador'  
           
        });

        // 7. Guardar factura
        await nuevaFactura.save();

        console.log(`Factura ${numeroFactura} creada en borrador (sin autorizar)`);

        // 8. Retornar resultado
        return {
            factura: nuevaFactura,
            mensaje: 'Factura creada en borrador. Debe autorizarla para emitirla.'
        };
    }

    /**
     * Autoriza una factura en borrador solicitando CAE a ARCA
     * Después de autorizar, la factura NO puede ser editada ni eliminada
     * 
     * @param {String} facturaId - ID de la factura a autorizar
     * @returns {Object} - { factura, cae, mensaje }
     */
    async autorizarFactura(facturaId) {
        // 1. Buscar la factura
        const factura = await Factura.findById(facturaId);
        
        if (!factura) {
            throw new Error('Factura no encontrada');
        }

        // 2. Validar que esté en estado borrador
        if (!factura.esBorrador()) {
            throw new Error(`No se puede autorizar. La factura ya está en estado: ${factura.estado}`);
        }

        // 3. Validar que no tenga ya una autorización
        if (factura.estaAutorizada()) {
            throw new Error('La factura ya tiene una autorización (CAE o CAEA)');
        }

        // ========================================
        // VALIDACIÓN iii: No autorizar si hay facturas anteriores sin autorizar (correlatividad)
        // ========================================
        const facturasAnterioresSinAutorizar = await Factura.find({
            fechaEmision: { $lt: factura.fechaEmision },
            estado: 'Borrador'
        }).sort({ fechaEmision: 1 });

        if (facturasAnterioresSinAutorizar.length > 0) {
            const primeraNoAutorizada = facturasAnterioresSinAutorizar[0];
            throw new Error(`No se puede autorizar. Existe una o más facturas anteriores sin autorizar: ${primeraNoAutorizada.numeroFactura} del ${new Date(primeraNoAutorizada.fechaEmision).toLocaleDateString()}. Las autorizaciones deben ser consecutivas y correlativas.`);
        }

        // ========================================
        // SOLICITAR CAE A ARCA (SIMULADO)
        // ========================================
        
        console.log(`Autorizando factura ${factura.numeroFactura}...`);
        console.log(`Solicitando CAE a ARCA (simulado)...`);
        
        try {
            const resultadoCAE = await ArcaSimulacionService.solicitarCAE({
                numeroFactura: factura.numeroFactura,
                total: factura.total,
                condicionFiscal: factura.condicionFiscal
            });
            
            if (!resultadoCAE.success) {
                throw new Error('Error al obtener CAE: ' + resultadoCAE.error);
            }
            
            // 4. Actualizar factura con CAE
            factura.cae = resultadoCAE.cae;
            factura.caeVencimiento = resultadoCAE.vencimiento;
            factura.estado = 'Pendiente';  
            factura.usoCaea = false;
            
            // 5. Guardar cambios
            await factura.save();
            
            console.log(`Factura ${factura.numeroFactura} autorizada con CAE: ${resultadoCAE.cae}`);
            
            // 6. Retornar resultado
            return {
                factura: factura,
                cae: resultadoCAE.cae,
                caeVencimiento: resultadoCAE.vencimiento,
                mensaje: `Factura autorizada exitosamente. CAE: ${resultadoCAE.cae}`
            };
            
        } catch (error) {
            console.error(`Error al autorizar factura ${factura.numeroFactura}:`, error);
            throw new Error('Error al autorizar factura con ARCA: ' + error.message);
        }
    }

    /**
     * Edita una factura en estado borrador
     * Solo se pueden editar facturas que NO han sido autorizadas
     * 
     * @param {String} facturaId - ID de la factura
     * @param {Object} datosActualizados - Datos a actualizar
     * @returns {Object} - { factura, mensaje }
     */
    async editarFactura(facturaId, datosActualizados) {
        // 1. Buscar la factura
        const factura = await Factura.findById(facturaId);
        
        if (!factura) {
            throw new Error('Factura no encontrada');
        }

        // 2. Validar que se pueda editar (solo borradores)
        if (!factura.puedeEditarse()) {
            throw new Error(`No se puede editar. La factura está en estado: ${factura.estado}. Solo se pueden editar facturas en borrador.`);
        }

        // 3. Validar datos actualizados
        const { itemFacturaSchema, fechaVencimiento, periodoFacturado } = datosActualizados;

        if (itemFacturaSchema) {
            // Validar ítems
            for (const item of itemFacturaSchema) {
                if (!item.precioUnitario || !item.cantidad || item.precioUnitario <= 0 || item.cantidad <= 0) {
                    throw new Error('Los ítems deben tener precio unitario y cantidad válidos');
                }
            }

            // Recalcular totales
            const subtotal = itemFacturaSchema.reduce((acc, item) => acc + (item.precioUnitario * item.cantidad), 0);
            const total = subtotal;

            factura.itemFacturaSchema = itemFacturaSchema;
            factura.subtotal = subtotal;
            factura.total = total;
        }

        if (fechaVencimiento) {
            factura.fechaVencimiento = fechaVencimiento;
        }

        if (periodoFacturado) {
            factura.periodoFacturado = periodoFacturado;
        }

        // 4. Guardar cambios
        await factura.save();

        console.log(`Factura ${factura.numeroFactura} editada`);

        // 5. Retornar resultado
        return {
            factura: factura,
            mensaje: 'Factura editada exitosamente'
        };
    }

    /**
     * Elimina una factura en estado borrador
     * Solo se pueden eliminar facturas que NO han sido autorizadas
     * 
     * @param {String} facturaId - ID de la factura
     * @returns {Object} - { mensaje }
     */
    async eliminarFactura(facturaId) {
        // 1. Buscar la factura
        const factura = await Factura.findById(facturaId);
        
        if (!factura) {
            throw new Error('Factura no encontrada');
        }

        // 2. Validar que se pueda eliminar (solo borradores)
        if (!factura.puedeEliminarse()) {
            throw new Error(`No se puede eliminar. La factura está en estado: ${factura.estado}. Solo se pueden eliminar facturas en borrador.`);
        }

        // 3. Eliminar la factura
        await Factura.findByIdAndDelete(facturaId);

        console.log(`Factura ${factura.numeroFactura} eliminada`);

        // 4. Retornar resultado
        return {
            mensaje: `Factura ${factura.numeroFactura} eliminada exitosamente`
        };
    }

    /**
     * Obtiene todas las facturas de un estudiante
     * @param {String} estudianteId
     * @returns {Array} - Lista de facturas con datos poblados
     */
    async obtenerFacturasPorEstudiante(estudianteId) {
        const facturas = await Factura.find({ estudiante: estudianteId })
            .sort({ fechaEmision: -1 })
            .populate('estudiante', 'nombre apellido');

        if (!facturas || facturas.length === 0) {
            throw new Error('No se encontraron facturas para este estudiante');
        }
        return facturas;
    }

    /**
     * Obtiene una factura por ID
     * @param {String} facturaId
     * @returns {Object} - Factura con datos poblados
     */
    async obtenerFacturaPorId(facturaId) {
        const factura = await Factura.findById(facturaId)
            .populate('estudiante', 'nombre apellido email');

        if (!factura) {
            throw new Error('Factura no encontrada');
        }

        return factura;
    }

    /**
     * Genera una factura mensual para un estudiante
     * @param {String} estudianteId
     * @param {String} periodo - Formato: 'YYYY-MM'
     * @returns {Object} - { factura, mensaje }
     */
    async generarFacturaMensual(estudianteId, periodo) {
        // 1. Validar estudiante
        const estudianteDB = await BaseUser.findById(estudianteId);
        if (!estudianteDB) {
            throw new Error('Estudiante no encontrado');
        }

        // 2. TODO: Obtener cursos y clases del estudiante (pendiente de implementación)
        // Ejemplo: const cursos = await Curso.find({ estudiante: estudianteId });
        // generar los ítems basados en los cursos/clases
        const itemFacturaSchema = [
            // TODO: reemplazar con lógica real
            { descripcion: 'Cuota mensual', precioUnitario: 100, cantidad: 1, subtotal: 100 }
        ];

        // 3. Llamar a crearFactura (crea borrador)
        return await this.crearFactura({
            estudiante: estudianteId,
            condicionFiscal: estudianteDB.condicionFiscal || 'Consumidor Final',
            fechaVencimiento: new Date(new Date().setMonth(new Date().getMonth() + 1)),
            itemFacturaSchema,
            periodoFacturado: periodo
        });
    }

    /**
     * Obtiene la deuda total de un estudiante
     * @param {String} estudianteId
     * @returns {Object} - { deudaTotal, facturasPendientes, facturasPagadas, detalle }
     */
    async obtenerDeudaEstudiante(estudianteId) {
        // 1. Validar existencia del estudiante
        const estudianteDB = await BaseUser.findById(estudianteId);
        if (!estudianteDB) {
            throw new Error('Estudiante no encontrado');
        }

        // 2. Obtener todas las facturas del estudiante
        const todasFacturas = await Factura.find({ estudiante: estudianteId })
            .sort({ fechaEmision: -1 });

        // 3. Separar facturas por estado
        const facturasPendientes = todasFacturas.filter(f => 
            f.estado === 'Pendiente' || f.estado === 'Cobrada Parcialmente'
        );
        const facturasPagadas = todasFacturas.filter(f => f.estado === 'Cobrada');
        const facturasBorrador = todasFacturas.filter(f => f.estado === 'Borrador');

        // 4. Calcular deuda total (solo facturas autorizadas pendientes)
        const deudaTotal = facturasPendientes.reduce((acc, factura) => acc + factura.total, 0);

        // 5. Retornar resultado
        return {
            deudaTotal,
            cantidadFacturasPendientes: facturasPendientes.length,
            cantidadFacturasPagadas: facturasPagadas.length,
            cantidadFacturasBorrador: facturasBorrador.length,
            detalle: {
                pendientes: facturasPendientes.map(f => ({
                    id: f._id,
                    numeroFactura: f.numeroFactura,
                    total: f.total,
                    estado: f.estado,
                    fechaEmision: f.fechaEmision,
                    fechaVencimiento: f.fechaVencimiento,
                    periodoFacturado: f.periodoFacturado,
                    cae: f.cae,
                    tipoAutorizacion: f.getTipoAutorizacion()
                })),
                pagadas: facturasPagadas.map(f => ({
                    id: f._id,
                    numeroFactura: f.numeroFactura,
                    total: f.total,
                    estado: f.estado,
                    fechaPago: f.fechaPago,
                    cae: f.cae
                })),
                borradores: facturasBorrador.map(f => ({
                    id: f._id,
                    numeroFactura: f.numeroFactura,
                    total: f.total,
                    estado: f.estado,
                    fechaEmision: f.fechaEmision,
                    puedeEditar: f.puedeEditarse(),
                    puedeEliminar: f.puedeEliminarse()
                }))
            }
        };
    }

    /**
     * Verifica el estado del servicio ARCA (simulado)
     * @returns {Object} - Estado de disponibilidad
     */
    verificarEstadoARCA() {
        return ArcaSimulacionService.verificarDisponibilidadARCA();
    }
}

module.exports = new FacturaService();