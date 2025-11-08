const ReporteFinanciero = require('../models/ReporteFinanciero');
const { BaseUser } = require('../models');
const Cobro = require('../models/cobros.model');
const Factura = require('../models/factura.model');

/**
 * SERVICE: reportesFinancierosService
 * PROPÓSITO: Lógica de negocio para generación de reportes financieros
 * 
 * DEPENDENCIAS:
 * - Ayelen: pagosService, facturasService (para ingresos, deudas, morosidad)
 * - Lorena: cursosService (para segmentar ingresos por idioma)
 * 
 * NOTA: Algunas funciones esperan que Ayelen haya completado sus servicios.
 * Por ahora, incluyen comentarios indicando dónde integrar sus datos.
 */

// ============================================
// SECCIÓN 1: GENERAR REPORTES FINANCIEROS
// ============================================

/**
 * Genera un reporte financiero completo para un período
 */
exports.generarReporteFinanciero = async (datosReporte) => {
    try {
        const {
            periodo,
            fechaInicio,
            fechaFin,
            generadoPorId
        } = datosReporte;

        // Validar que no exista ya un reporte para este período
        const reporteExistente = await ReporteFinanciero.findOne({ periodo });
        if (reporteExistente) {
            throw new Error(`Ya existe un reporte para el período ${periodo}`);
        }

        let totalIngresos = datosReporte.totalIngresos;
        let saldoPendiente = datosReporte.saldoPendiente;
        let pagosPendientes = datosReporte.pagosPendientes;
        let pagosVencidos = datosReporte.pagosVencidos;

        if (!totalIngresos) {
            const cobros = await Cobro.find({
                fechaCobro: { $gte: fechaInicio || calcularFechaInicioPeriodo(periodo), $lte: fechaFin || calcularFechaFinPeriodo(periodo) }
            });
            totalIngresos = cobros.reduce((sum, c) => sum + c.monto, 0);
        }

        if (!saldoPendiente) {
            const facturasPendientes = await Factura.find({ estado: { $in: ['Pendiente', 'Cobrada Parcialmente'] } });
            saldoPendiente = facturasPendientes.reduce((sum, f) => sum + (f.total - (f.totalCobrado || 0)), 0);
        }

        if (!pagosPendientes) {
            pagosPendientes = await Factura.countDocuments({ estado: 'Pendiente' });
        }

        if (!pagosVencidos) {
            pagosVencidos = await Factura.countDocuments({ estado: 'Vencida' });
        }

        const totalGastos = datosReporte.totalGastos || 0;

        // Crear el reporte
        const nuevoReporte = new ReporteFinanciero({
            periodo,
            fechaInicio: fechaInicio || calcularFechaInicioPeriodo(periodo),
            fechaFin: fechaFin || calcularFechaFinPeriodo(periodo),
            totalIngresos,
            ingresosPorConcepto: datosReporte.ingresosPorConcepto || {
                inscripciones: 0,
                mensualidades: 0,
                clasesParticulares: 0,
                otros: 0
            },
            ingresosPorMetodo: datosReporte.ingresosPorMetodo || {
                transferencia: 0,
                efectivo: 0,
                tarjeta: 0,
                mercadopago: 0
            },
            ingresosPorIdioma: datosReporte.ingresosPorIdioma || {
                ingles: 0,
                frances: 0,
                aleman: 0,
                italiano: 0,
                portugues: 0,
                espanol: 0
            },
            totalGastos,
            gastosPorCategoria: datosReporte.gastosPorCategoria || {
                sueldosProfesores: 0,
                infraestructura: 0,
                materiales: 0,
                otros: 0
            },
            saldoPendiente,
            pagosPendientes,
            pagosVencidos,
            estudiantesConDeuda: datosReporte.estudiantesConDeuda || [],
            proyeccionIngresos: datosReporte.proyeccionIngresos || 0,
            generadoPor: generadoPorId,
            fechaGeneracion: new Date(),
            notas: datosReporte.notas || ''
        });

        // El middleware pre-save calculará automáticamente utilidad, margen y morosidad
        await nuevoReporte.save();

        return nuevoReporte;
    } catch (error) {
        throw new Error(`Error al generar reporte financiero: ${error.message}`);
    }
};

/**
 * Calcula la fecha de inicio del período
 */
const calcularFechaInicioPeriodo = (periodo) => {
    const match = periodo.match(/^(\d{4})-(Q[1-4]|(\d{2}))$/);
    if (!match) throw new Error('Formato de período inválido');

    const year = parseInt(match[1]);

    if (match[2].startsWith('Q')) {
        // Trimestre
        const quarter = parseInt(match[2][1]);
        const month = (quarter - 1) * 3;
        return new Date(year, month, 1);
    } else {
        // Mes
        const month = parseInt(match[3]) - 1;
        return new Date(year, month, 1);
    }
};

/**
 * Calcula la fecha de fin del período
 */
const calcularFechaFinPeriodo = (periodo) => {
    const match = periodo.match(/^(\d{4})-(Q[1-4]|(\d{2}))$/);
    if (!match) throw new Error('Formato de período inválido');

    const year = parseInt(match[1]);

    if (match[2].startsWith('Q')) {
        // Trimestre
        const quarter = parseInt(match[2][1]);
        const month = quarter * 3;
        return new Date(year, month, 0); // Último día del último mes del trimestre
    } else {
        // Mes
        const month = parseInt(match[3]);
        return new Date(year, month, 0); // Último día del mes
    }
};

/**
 * Genera el período actual
 */
const generarPeriodoActual = () => {
    const fecha = new Date();
    const year = fecha.getFullYear();
    const month = fecha.getMonth() + 1;
    const quarter = Math.ceil(month / 3);
    return `${year}-Q${quarter}`;
};

// ============================================
// SECCIÓN 2: OBTENER REPORTES
// ============================================

/**
 * Obtiene un reporte financiero por período
 */
exports.obtenerReportePorPeriodo = async (periodo) => {
    try {
        const reporte = await ReporteFinanciero.obtenerReporteCompleto(periodo);

        if (!reporte) {
            return null;
        }

        return reporte;
    } catch (error) {
        throw new Error(`Error al obtener reporte: ${error.message}`);
    }
};

/**
 * Obtiene los reportes más recientes
 */
exports.obtenerReportesRecientes = async (limite = 5) => {
    try {
        const reportes = await ReporteFinanciero.obtenerRecientes(limite);
        return reportes;
    } catch (error) {
        throw new Error(`Error al obtener reportes recientes: ${error.message}`);
    }
};

/**
 * Obtiene todos los reportes con filtros opcionales
 */
exports.obtenerTodosReportes = async (opciones = {}) => {
    try {
        const query = {};

        if (opciones.desde && opciones.hasta) {
            query.fechaGeneracion = {
                $gte: new Date(opciones.desde),
                $lte: new Date(opciones.hasta)
            };
        }

        const reportes = await ReporteFinanciero.find(query)
            .populate('generadoPor', 'firstName lastName')
            .sort({ fechaGeneracion: -1 });

        return reportes;
    } catch (error) {
        throw new Error(`Error al obtener reportes: ${error.message}`);
    }
};

// ============================================
// SECCIÓN 3: ACTUALIZAR REPORTES
// ============================================

/**
 * Actualiza un reporte financiero existente
 */
exports.actualizarReporte = async (periodo, datosActualizacion) => {
    try {
        const reporte = await ReporteFinanciero.findOne({ periodo });

        if (!reporte) {
            throw new Error('Reporte no encontrado');
        }

        // Actualizar campos permitidos
        if (datosActualizacion.totalIngresos !== undefined) {
            reporte.totalIngresos = datosActualizacion.totalIngresos;
        }

        if (datosActualizacion.totalGastos !== undefined) {
            reporte.totalGastos = datosActualizacion.totalGastos;
        }

        if (datosActualizacion.saldoPendiente !== undefined) {
            reporte.saldoPendiente = datosActualizacion.saldoPendiente;
        }

        if (datosActualizacion.ingresosPorConcepto) {
            reporte.ingresosPorConcepto = {
                ...reporte.ingresosPorConcepto,
                ...datosActualizacion.ingresosPorConcepto
            };
        }

        if (datosActualizacion.ingresosPorMetodo) {
            reporte.ingresosPorMetodo = {
                ...reporte.ingresosPorMetodo,
                ...datosActualizacion.ingresosPorMetodo
            };
        }

        if (datosActualizacion.ingresosPorIdioma) {
            reporte.ingresosPorIdioma = {
                ...reporte.ingresosPorIdioma,
                ...datosActualizacion.ingresosPorIdioma
            };
        }

        if (datosActualizacion.gastosPorCategoria) {
            reporte.gastosPorCategoria = {
                ...reporte.gastosPorCategoria,
                ...datosActualizacion.gastosPorCategoria
            };
        }

        if (datosActualizacion.proyeccionIngresos !== undefined) {
            reporte.proyeccionIngresos = datosActualizacion.proyeccionIngresos;
        }

        if (datosActualizacion.notas) {
            reporte.notas = datosActualizacion.notas;
        }

        await reporte.save();
        return reporte;
    } catch (error) {
        throw new Error(`Error al actualizar reporte: ${error.message}`);
    }
};

/**
 * Agrega un estudiante con deuda al reporte
 */
exports.agregarEstudianteConDeuda = async (periodo, estudianteId, montoDeuda, diasVencido = 0) => {
    try {
        const reporte = await ReporteFinanciero.findOne({ periodo });

        if (!reporte) {
            throw new Error('Reporte no encontrado');
        }

        reporte.agregarEstudianteConDeuda(estudianteId, montoDeuda, diasVencido);
        await reporte.save();

        return reporte;
    } catch (error) {
        throw new Error(`Error al agregar estudiante con deuda: ${error.message}`);
    }
};

// ============================================
// SECCIÓN 4: ANÁLISIS Y COMPARACIONES
// ============================================

/**
 * Compara dos períodos financieros
 */
exports.compararPeriodos = async (periodo1, periodo2) => {
    try {
        const comparacion = await ReporteFinanciero.compararPeriodos(periodo1, periodo2);
        return comparacion;
    } catch (error) {
        throw new Error(`Error al comparar períodos: ${error.message}`);
    }
};

/**
 * Calcula tendencias financieras (últimos N períodos)
 */
exports.calcularTendencias = async (cantidad = 4) => {
    try {
        const reportes = await ReporteFinanciero.find()
            .sort({ periodo: -1 })
            .limit(cantidad);

        if (reportes.length === 0) {
            return {
                periodos: [],
                ingresos: [],
                gastos: [],
                utilidades: [],
                tendenciaIngresos: 'sin datos',
                tendenciaUtilidades: 'sin datos'
            };
        }

        const tendencias = {
            periodos: reportes.map(r => r.periodo).reverse(),
            ingresos: reportes.map(r => r.totalIngresos).reverse(),
            gastos: reportes.map(r => r.totalGastos).reverse(),
            utilidades: reportes.map(r => r.utilidadNeta).reverse()
        };

        // Calcular tendencia simple (creciente/decreciente/estable)
        if (tendencias.ingresos.length >= 2) {
            const ultimoIngreso = tendencias.ingresos[tendencias.ingresos.length - 1];
            const penultimoIngreso = tendencias.ingresos[tendencias.ingresos.length - 2];

            if (ultimoIngreso > penultimoIngreso * 1.05) {
                tendencias.tendenciaIngresos = 'creciente';
            } else if (ultimoIngreso < penultimoIngreso * 0.95) {
                tendencias.tendenciaIngresos = 'decreciente';
            } else {
                tendencias.tendenciaIngresos = 'estable';
            }

            const ultimaUtilidad = tendencias.utilidades[tendencias.utilidades.length - 1];
            const penultimaUtilidad = tendencias.utilidades[tendencias.utilidades.length - 2];

            if (ultimaUtilidad > penultimaUtilidad * 1.05) {
                tendencias.tendenciaUtilidades = 'creciente';
            } else if (ultimaUtilidad < penultimaUtilidad * 0.95) {
                tendencias.tendenciaUtilidades = 'decreciente';
            } else {
                tendencias.tendenciaUtilidades = 'estable';
            }
        }

        return tendencias;
    } catch (error) {
        throw new Error(`Error al calcular tendencias: ${error.message}`);
    }
};

/**
 * Obtiene estadísticas de morosidad
 */
exports.obtenerEstadisticasMorosidad = async () => {
    try {
        const facturasPendientes = await Factura.find({ 
            estado: { $in: ['Pendiente', 'Cobrada Parcialmente', 'Vencida'] } 
        }).populate('estudiante', 'firstName lastName');

        const estudiantesConDeuda = facturasPendientes.map(f => ({
            estudiante: f.estudiante,
            montoDeuda: f.total - (f.totalCobrado || 0),
            factura: f.numeroFactura
        }));

        const montoTotalDeuda = estudiantesConDeuda.reduce((sum, e) => sum + e.montoDeuda, 0);

        return {
            totalEstudiantesConDeuda: estudiantesConDeuda.length,
            montoTotalDeuda,
            promedioDeudaPorEstudiante: estudiantesConDeuda.length > 0 ? montoTotalDeuda / estudiantesConDeuda.length : 0,
            estudiantesMayorDeuda: estudiantesConDeuda.sort((a, b) => b.montoDeuda - a.montoDeuda).slice(0, 10)
        };
    } catch (error) {
        throw new Error(`Error al obtener estadísticas de morosidad: ${error.message}`);
    }
};

/**
 * Calcula proyección de ingresos para próximo período
 */
exports.calcularProyeccion = async () => {
    try {
        const reportesRecientes = await ReporteFinanciero.find()
            .sort({ periodo: -1 })
            .limit(3);

        if (reportesRecientes.length === 0) {
            return 0;
        }

        // Proyección simple: promedio de últimos 3 períodos
        const sumaIngresos = reportesRecientes.reduce((sum, r) => sum + r.totalIngresos, 0);
        const proyeccion = sumaIngresos / reportesRecientes.length;

        return Math.round(proyeccion);
    } catch (error) {
        throw new Error(`Error al calcular proyección: ${error.message}`);
    }
};

// ============================================
// SECCIÓN 5: GENERACIÓN AUTOMÁTICA
// ============================================

/**
 * Genera reporte financiero automático para el período actual
 * Esta función se puede ejecutar automáticamente (ej: inicio de mes)
 */
exports.generarReporteAutomatico = async (generadoPorId) => {
    try {
        const periodo = generarPeriodoActual();

        const fechaInicio = calcularFechaInicioPeriodo(periodo);
        const fechaFin = calcularFechaFinPeriodo(periodo);
        
        const cobros = await Cobro.find({
            fechaCobro: { $gte: fechaInicio, $lte: fechaFin }
        });
        const totalIngresos = cobros.reduce((sum, c) => sum + c.monto, 0);

        const facturasPendientes = await Factura.find({ estado: { $in: ['Pendiente', 'Cobrada Parcialmente'] } });
        const saldoPendiente = facturasPendientes.reduce((sum, f) => sum + (f.total - (f.totalCobrado || 0)), 0);

        const estudiantesConDeuda = facturasPendientes.map(f => ({
            estudiante: f.estudiante,
            montoDeuda: f.total - (f.totalCobrado || 0)
        }));
        
        return await exports.generarReporteFinanciero({
            periodo,
            fechaInicio,
            fechaFin,
            totalIngresos,
            saldoPendiente,
            estudiantesConDeuda,
            generadoPorId
        });
    } catch (error) {
        throw new Error(`Error al generar reporte automático: ${error.message}`);
    }
};

module.exports = exports;