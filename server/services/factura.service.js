// const Factura = require('../models/factura.model');
// const BaseUser = require('../models/BaseUser');
// const contadorService = require('./contador.service');

// class FacturaService {
//     /**
//      * Crea una nueva factura
//      * @param {Object} datosFactura - { estudiante, condicionFiscal, fechaVencimiento, itemFacturaSchema, periodoFacturado }
//      * @returns {Object} - { factura, mensaje }
//      */
//     async crearFactura(datosFactura) {
//         const { estudiante, condicionFiscal, fechaVencimiento, itemFacturaSchema, periodoFacturado } = datosFactura;

//         // 1. Validar datos de entrada
//         if (!estudiante || !itemFacturaSchema || !itemFacturaSchema.length) {
//             throw new Error('Estudiante y ítems de factura son requeridos');
//         }

//         // 2. Validar existencia del estudiante
//         const estudianteDB = await BaseUser.findById(estudiante);
//         if (!estudianteDB) {
//             throw new Error('Estudiante no encontrado');
//         }

//         // 3. Validar ítems de factura
//         for (const item of itemFacturaSchema) {
//             if (!item.precioUnitario || !item.cantidad || item.precioUnitario <= 0 || item.cantidad <= 0) {
//                 throw new Error('Los ítems deben tener precio unitario y cantidad válidos');
//             }
//         }

//         // 4. Calcular subtotal y total
//         const subtotal = itemFacturaSchema.reduce((acc, item) => acc + (item.precioUnitario * item.cantidad), 0);
//         const total = subtotal; 

//         // 5. Generar número de factura
//         const numeroSecuencial = await contadorService.obtenerSiguienteNumero('factura');
        
//         // Extraer solo el número si viene con formato (ej: "F-00004")
//         let numeroLimpio = numeroSecuencial;
//         if (typeof numeroSecuencial === 'string') {
//             const match = numeroSecuencial.match(/\d+$/);
//             numeroLimpio = match ? match[0] : numeroSecuencial;
//         }
        
//         // Formatear número de factura según condición fiscal
//         const puntoVenta = '00001';
//         const numeroFormateado = parseInt(numeroLimpio, 10).toString().padStart(8, '0');
//         const tipoFactura = (condicionFiscal === 'Consumidor Final') ? 'B' : 'A';
//         const numeroFactura = `FC ${tipoFactura} ${puntoVenta}-${numeroFormateado}`;

//         // 6. Crear la factura
//         const nuevaFactura = new Factura({
//             estudiante,
//             condicionFiscal,
//             numeroFactura,
//             fechaEmision: new Date(),
//             fechaVencimiento: fechaVencimiento || new Date(),
//             itemFacturaSchema,
//             periodoFacturado,
//             subtotal,
//             total,
//             estado: 'Pendiente'
//         });

//         // 7. Guardar factura
//         await nuevaFactura.save();

//         // 8. Retornar resultado
//         return {
//             factura: nuevaFactura,
//             mensaje: 'Factura creada exitosamente'
//         };
//     }

//     /**
//      * Obtiene todas las facturas de un estudiante
//      * @param {String} estudianteId
//      * @returns {Array} - Lista de facturas con datos poblados
//      */
//     async obtenerFacturasPorEstudiante(estudianteId) {
//         const facturas = await Factura.find({ estudiante: estudianteId })
//             .sort({ fechaEmision: -1 })
//             .populate('estudiante', 'nombre apellido');

//         if (!facturas || facturas.length === 0) {
//             throw new Error('No se encontraron facturas para este estudiante');
//         }

//         return facturas;
//     }

//     /**
//      * Genera una factura mensual para un estudiante
//      * @param {String} estudianteId
//      * @param {String} periodo - Formato: 'YYYY-MM'
//      * @returns {Object} - { factura, mensaje }
//      */
//     async generarFacturaMensual(estudianteId, periodo) {
//         // 1. Validar estudiante
//         const estudianteDB = await BaseUser.findById(estudianteId);
//         if (!estudianteDB) {
//             throw new Error('Estudiante no encontrado');
//         }

//         // 2. TODO: Obtener cursos y clases del estudiante (pendiente de implementación)
//         // Ejemplo: const cursos = await Curso.find({ estudiante: estudianteId });
//         // Aquí deberías generar los ítems basados en los cursos/clases
//         const itemFacturaSchema = [
//             // Ejemplo estático, reemplazar con lógica real
//             { descripcion: 'Cuota mensual', precioUnitario: 100, cantidad: 1 }
//         ];

//         // 3. Calcular subtotal y total
//         const subtotal = itemFacturaSchema.reduce((acc, item) => acc + (item.precioUnitario * item.cantidad), 0);
//         const total = subtotal;

//         // 4. Generar número de factura
//         const numeroSecuencial = await contadorService.obtenerSiguienteNumero('factura');
        
//         // Extraer solo el número si viene con formato (ej: "F-00004")
//         let numeroLimpio = numeroSecuencial;
//         if (typeof numeroSecuencial === 'string') {
//             const match = numeroSecuencial.match(/\d+$/);
//             numeroLimpio = match ? match[0] : numeroSecuencial;
//         }
        
//         // Formatear número de factura según condición fiscal
//         const puntoVenta = '00001';
//         const numeroFormateado = parseInt(numeroLimpio, 10).toString().padStart(8, '0');
//         const condicionFiscal = estudianteDB.condicionFiscal || 'Consumidor Final';
//         const tipoFactura = (condicionFiscal === 'Consumidor Final') ? 'B' : 'A';
//         const numeroFactura = `FC ${tipoFactura} ${puntoVenta}-${numeroFormateado}`;

//         // 5. Crear y guardar factura
//         const nuevaFactura = new Factura({
//             estudiante: estudianteId,
//             condicionFiscal: 'Consumidor Final', // Valor por defecto, ajustar según lógica
//             numeroFactura,
//             fechaEmision: new Date(),
//             fechaVencimiento: new Date(new Date().setMonth(new Date().getMonth() + 1)),
//             itemFacturaSchema,
//             periodoFacturado: periodo,
//             subtotal,
//             total,
//             estado: 'Pendiente'
//         });

//         await nuevaFactura.save();

//         // 6. Retornar resultado
//         return {
//             factura: nuevaFactura,
//             mensaje: 'Factura mensual generada exitosamente'
//         };
//     }
//     /**
//      * Obtiene la deuda total de un estudiante
//      * @param {String} estudianteId
//      * @returns {Object} - { deudaTotal, facturasPendientes, facturasPagadas, detalle }
//      */
//     async obtenerDeudaEstudiante(estudianteId) {
//         // 1. Validar existencia del estudiante
//         const estudianteDB = await BaseUser.findById(estudianteId);
//         if (!estudianteDB) {
//             throw new Error('Estudiante no encontrado');
//         }

//         // 2. Obtener todas las facturas del estudiante
//         const todasFacturas = await Factura.find({ estudiante: estudianteId })
//             .sort({ fechaEmision: -1 });

//         // 3. Separar facturas por estado
//         const facturasPendientes = todasFacturas.filter(f => f.estado === 'Pendiente');
//         const facturasPagadas = todasFacturas.filter(f => f.estado === 'Pagada');

//         // 4. Calcular deuda total
//         const deudaTotal = facturasPendientes.reduce((acc, factura) => acc + factura.total, 0);

//         // 5. Retornar resultado
//         return {
//             deudaTotal,
//             cantidadFacturasPendientes: facturasPendientes.length,
//             cantidadFacturasPagadas: facturasPagadas.length,
//             detalle: {
//                 pendientes: facturasPendientes.map(f => ({
//                     id: f._id,
//                     numeroFactura: f.numeroFactura,
//                     total: f.total,
//                     fechaEmision: f.fechaEmision,
//                     fechaVencimiento: f.fechaVencimiento,
//                     periodoFacturado: f.periodoFacturado
//                 })),
//                 pagadas: facturasPagadas.map(f => ({
//                     id: f._id,
//                     numeroFactura: f.numeroFactura,
//                     total: f.total,
//                     fechaPago: f.fechaPago
//                 }))
//             }
//         };
//     }
// }

// module.exports = new FacturaService();