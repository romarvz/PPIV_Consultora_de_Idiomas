const mongoose = require('mongoose');

/**
 * MODEL: ReporteFinanciero
 * PURPOSE: Generates periodic reports of the consultancy's financial status
 * USAGE: For income analysis, delinquency, and decision-making
 * 
 * This report consumes data from:
 * - Payments, invoices, debts, payment methods
 * - Active courses and languages (to segment income)
 */

const reporteFinancieroSchema = new mongoose.Schema({
    // ============================================
    // SECTION 1: REPORT PERIOD
    // ============================================
    periodo: {
        type: String,
        required: [true, 'Período es requerido'],
        unique: true, // Only one report per period
        // Format: "2025-Q1" (quarter) or "2025-01" (month)
        match: [/^\d{4}-(Q[1-4]|\d{2})$/, 'Formato de período inválido']
    },

    fechaInicio: {
        type: Date,
        required: true
    },

    fechaFin: {
        type: Date,
        required: true
    },

    // ============================================
    // SECTION 2: INCOME
    // Total money received in the period
    // ============================================
    totalIngresos: {
        type: Number,
        required: true,
        default: 0,
        min: 0
    },

    ingresosPorConcepto: {
        inscripciones: {
            type: Number,
            default: 0,
            min: 0
        },
        mensualidades: {
            type: Number,
            default: 0,
            min: 0
        },
        clasesParticulares: {
            type: Number,
            default: 0,
            min: 0
        },
        otros: {
            type: Number,
            default: 0,
            min: 0
        }
    },

    ingresosPorMetodo: {
        transferencia: {
            type: Number,
            default: 0,
            min: 0
        },
        efectivo: {
            type: Number,
            default: 0,
            min: 0
        },
        tarjeta: {
            type: Number,
            default: 0,
            min: 0
        },
        mercadopago: {
            type: Number,
            default: 0,
            min: 0
        }
    },

    // ============================================
    // SECTION 3: INCOME BY LANGUAGE
    // Income segmentation by language
    // ============================================
    ingresosPorIdioma: {
        ingles: {
            type: Number,
            default: 0,
            min: 0
        },
        frances: {
            type: Number,
            default: 0,
            min: 0
        },
        aleman: {
            type: Number,
            default: 0,
            min: 0
        },
        italiano: {
            type: Number,
            default: 0,
            min: 0
        },
        portugues: {
            type: Number,
            default: 0,
            min: 0
        },
        espanol: {
            type: Number,
            default: 0,
            min: 0
        }
    },

    // ============================================
    // SECTION 4: EXPENSES (Optional - can be expanded)
    // ============================================
    totalGastos: {
        type: Number,
        default: 0,
        min: 0
    },

    gastosPorCategoria: {
        sueldosProfesores: {
            type: Number,
            default: 0,
            min: 0
        },
        infraestructura: {
            type: Number,
            default: 0,
            min: 0
        },
        materiales: {
            type: Number,
            default: 0,
            min: 0
        },
        otros: {
            type: Number,
            default: 0,
            min: 0
        }
    },

    // ============================================
    // SECTION 5: DEBT AND DELINQUENCY
    // ============================================
    saldoPendiente: {
        type: Number,
        required: true,
        default: 0,
        min: 0
        // Total money owed by students
    },

    morosidad: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
        // Percentage of overdue payments
    },

    pagosPendientes: {
        type: Number,
        default: 0,
        min: 0
        // Number of pending payments
    },

    pagosVencidos: {
        type: Number,
        default: 0,
        min: 0
        // Number of payments that are overdue
    },

    // ============================================
    // SECCIÓN 6: ESTUDIANTES CON DEUDA
    // Lista de estudiantes morosos
    // ============================================
    estudiantesConDeuda: [{
        estudiante: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'BaseUser'
        },
        montoDeuda: {
            type: Number,
            required: true,
            min: 0
        },
        diasVencido: {
            type: Number,
            default: 0,
            min: 0
        }
    }],

    // ============================================
    // SECTION 7: CALCULATED METRICS
    // ============================================
    utilidadNeta: {
        type: Number,
        default: 0
        // totalIncome - totalExpenses
    },

    margenUtilidad: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
        // (netProfit / totalIncome) * 100
    },

    promedioIngresoEstudiante: {
        type: Number,
        default: 0,
        min: 0
        // totalIncome / number of active students
    },

    // ============================================
    // SECTION 8: PROJECTIONS
    // ============================================
    proyeccionIngresos: {
        type: Number,
        default: 0
        // Estimative income for the next period
    },

    // ============================================
    // SECTION 9: METADATA
    // ============================================
    generadoPor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'BaseUser',
        required: true
        // Admin that generated the report
    },

    fechaGeneracion: {
        type: Date,
        default: Date.now
    },

    notas: {
        type: String,
        maxlength: 1000
        // Aditional admin comments
    }

}, {
    timestamps: true,
    collection: 'reportes_financieros'
});

// ============================================
// INDEXES FOR PERFORMANCE
// ============================================
reporteFinancieroSchema.index({ periodo: 1 });
reporteFinancieroSchema.index({ fechaGeneracion: -1 });

// ============================================
// MIDDLEWARE: Pre-save
// Calculate metrics automtically before saving
// ============================================
reporteFinancieroSchema.pre('save', function (next) {
    // Calculate net profit
    this.utilidadNeta = this.totalIngresos - this.totalGastos;

    // Calculate profit margin
    if (this.totalIngresos > 0) {
        this.margenUtilidad = (this.utilidadNeta / this.totalIngresos) * 100;
    }

    // Calculate delinquency percentage
    const totalPagos = this.pagosPendientes + this.pagosVencidos;
    if (totalPagos > 0) {
        this.morosidad = (this.pagosVencidos / totalPagos) * 100;
    }

    next();
});

// ============================================
// METHOD: Add student with debt
// ============================================
reporteFinancieroSchema.methods.agregarEstudianteConDeuda = function (estudianteId, montoDeuda, diasVencido = 0) {
    this.estudiantesConDeuda.push({
        estudiante: estudianteId,
        montoDeuda,
        diasVencido
    });
};

// ============================================
// STATIC METHOD: Get full report
// ============================================
reporteFinancieroSchema.statics.obtenerReporteCompleto = async function (periodo) {
    return await this.findOne({ periodo })
        .populate('generadoPor', 'firstName lastName email')
        .populate('estudiantesConDeuda.estudiante', 'firstName lastName email dni');
};

// ============================================
// STATIC METHOD: Recent Reports
// ============================================
reporteFinancieroSchema.statics.obtenerRecientes = async function (limite = 5) {
    return await this.find()
        .sort({ fechaGeneracion: -1 })
        .limit(limite)
        .populate('generadoPor', 'firstName lastName');
};

// ============================================
// STATIC METHOD: Compare periods
// ============================================
reporteFinancieroSchema.statics.compararPeriodos = async function (periodo1, periodo2) {
    const reporte1 = await this.findOne({ periodo: periodo1 });
    const reporte2 = await this.findOne({ periodo: periodo2 });

    if (!reporte1 || !reporte2) {
        throw new Error('One or both periods do not have a report');
    }

    return {
        periodo1: {
            periodo: reporte1.periodo,
            ingresos: reporte1.totalIngresos,
            gastos: reporte1.totalGastos,
            utilidad: reporte1.utilidadNeta
        },
        periodo2: {
            periodo: reporte2.periodo,
            ingresos: reporte2.totalIngresos,
            gastos: reporte2.totalGastos,
            utilidad: reporte2.utilidadNeta
        },
        variacion: {
            ingresos: reporte2.totalIngresos - reporte1.totalIngresos,
            gastos: reporte2.totalGastos - reporte1.totalGastos,
            utilidad: reporte2.utilidadNeta - reporte1.utilidadNeta,
            porcentajeIngresos: ((reporte2.totalIngresos - reporte1.totalIngresos) / reporte1.totalIngresos) * 100
        }
    };
};

const ReporteFinanciero = mongoose.model('ReporteFinanciero', reporteFinancieroSchema);

module.exports = ReporteFinanciero;