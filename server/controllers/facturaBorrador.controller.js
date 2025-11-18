// const facturaService = require('../services/facturaBorrador.service');

// const facturaCtrl = {};

// /**
//  * Crear una nueva factura en BORRADOR (sin autorización)
//  * POST /api/facturas
//  */
// facturaCtrl.createFactura = async (req, res) => {
//     try {
//         const resultado = await facturaService.crearFactura(req.body);

//         res.status(201).json({
//             success: true,
//             message: resultado.mensaje,
//             data: resultado.factura
//         });
//     } catch (error) {
//         res.status(400).json({
//             success: false,
//             message: error.message
//         });
//     }
// };

// /**
//  * Autorizar una factura en borrador (solicitar CAE)
//  * PUT /api/facturas/:id/autorizar
//  */
// facturaCtrl.autorizarFactura = async (req, res) => {
//     try {
//         const { id } = req.params;
//         const resultado = await facturaService.autorizarFactura(id);

//         res.status(200).json({
//             success: true,
//             message: resultado.mensaje,
//             data: {
//                 factura: resultado.factura,
//                 cae: resultado.cae,
//                 caeVencimiento: resultado.caeVencimiento
//             }
//         });
//     } catch (error) {
//         res.status(400).json({
//             success: false,
//             message: error.message
//         });
//     }
// };

// /**
//  * Editar una factura en borrador
//  * PUT /api/facturas/:id
//  */
// facturaCtrl.editarFactura = async (req, res) => {
//     try {
//         const { id } = req.params;
//         const resultado = await facturaService.editarFactura(id, req.body);

//         res.status(200).json({
//             success: true,
//             message: resultado.mensaje,
//             data: resultado.factura
//         });
//     } catch (error) {
//         res.status(400).json({
//             success: false,
//             message: error.message
//         });
//     }
// };

// /**
//  * Eliminar una factura en borrador
//  * DELETE /api/facturas/:id
//  */
// facturaCtrl.eliminarFactura = async (req, res) => {
//     try {
//         const { id } = req.params;
//         const resultado = await facturaService.eliminarFactura(id);

//         res.status(200).json({
//             success: true,
//             message: resultado.mensaje
//         });
//     } catch (error) {
//         res.status(400).json({
//             success: false,
//             message: error.message
//         });
//     }
// };

// /**
//  * Obtener una factura por ID
//  * GET /api/facturas/:id
//  */
// facturaCtrl.getFacturaById = async (req, res) => {
//     try {
//         const { id } = req.params;
//         const factura = await facturaService.obtenerFacturaPorId(id);

//         res.status(200).json({
//             success: true,
//             data: factura
//         });
//     } catch (error) {
//         res.status(404).json({
//             success: false,
//             message: error.message
//         });
//     }
// };

// /**
//  * Obtener facturas de un estudiante
//  * GET /api/facturas/estudiante/:idEstudiante
//  */
// facturaCtrl.getFacturasByEstudiante = async (req, res) => {
//     try {
//         const { idEstudiante } = req.params;
//         const facturas = await facturaService.obtenerFacturasPorEstudiante(idEstudiante);

//         res.status(200).json({
//             success: true,
//             total: facturas.length,
//             data: facturas
//         });
//     } catch (error) {
//         res.status(404).json({
//             success: false,
//             message: error.message
//         });
//     }
// };

// /**
//  * Obtener deuda total de un estudiante
//  * GET /api/facturas/estudiante/:idEstudiante/deuda
//  */
// facturaCtrl.getDeudaEstudiante = async (req, res) => {
//     try {
//         const { idEstudiante } = req.params;
//         const deuda = await facturaService.obtenerDeudaEstudiante(idEstudiante);

//         res.status(200).json({
//             success: true,
//             data: deuda
//         });
//     } catch (error) {
//         res.status(404).json({
//             success: false,
//             message: error.message
//         });
//     }
// };

// /**
//  * Verificar estado del servicio Arca (simulado)
//  * GET /api/facturas/arca/estado
//  */
// facturaCtrl.verificarEstadoArca = async (req, res) => {
//     try {
//         const estado = facturaService.verificarEstadoArca();

//         res.status(200).json({
//             success: true,
//             data: estado
//         });
//     } catch (error) {
//         res.status(500).json({
//             success: false,
//             message: error.message
//         });
//     }
// };

// module.exports = facturaCtrl;