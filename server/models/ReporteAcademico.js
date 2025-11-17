const mongoose = require('mongoose');

/**
 * MODEL: ReporteAcademico
 * PURPOSE: Generates periodic reports of students' academic performance
 * USAGE: For evaluations, progress tracking, and certifications
 * 
 * This report consumes data from:
 * - Course progress, class attendance
 * - Payment status (optional for validation)
 */

const reporteAcademicoSchema = new mongoose.Schema({
    // ============================================
    // SECTION 1: REPORT IDENTIFICATION
    // ============================================
    estudiante: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'BaseUser',
        required: [true, 'Estudiante es requerido'],
        index: true
    },

    curso: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Curso',
        required: [true, 'Curso es requerido'],
        index: true
    },

    periodo: {
        type: String,
        required: [true, 'Período es requerido'],
        // Format: "2025-Q1" (quarter) or "2025-01" (month)
        // Examples: "2025-Q1", "2025-Q2", "2025-01", "2025-02"
        match: [/^\d{4}-(Q[1-4]|\d{2})$/, 'Formato de período inválido']
    },

    // ============================================
    // SECTION 2: ATTENDANCE
    // Class attendance data (from Lorena)
    // ============================================
    horasAsistidas: {
        type: Number,
        required: true,
        min: 0,
        default: 0
    },

    horasTotales: {
        type: Number,
        required: true,
        min: 0,
        default: 0
    },

    porcentajeAsistencia: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
    },

    // ============================================
    // SECTION 3: EVALUATIONS
    // Record of evaluations and exams
    // ============================================
    evaluaciones: [{
        tipo: {
            type: String,
            enum: ['examen', 'tarea', 'proyecto', 'oral', 'escrito', 'practica', 'TP1', 'TP2', 'Parcial 1', 'Parcial 2', 'Examen Final'],
            required: true
        },
        nota: {
            type: Number,
            min: 0,
            max: 10, // Escala 0-10, no 0-100
            required: true
        },
        fecha: {
            type: Date,
            required: true
        },
        comentarios: {
            type: String,
            maxlength: 500
        }
    }],

    // ============================================
    // SECTION 4: PROGRESS AND GRADING
    // ============================================
    progreso: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
        // Percentage of course completion (0-100)
    },

    calificacionPromedio: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
        // Average of all evaluations
    },

    // ============================================
    // SECTION 5: TEACHER'S COMMENTS
    // ============================================
    comentariosProfesor: {
        type: String,
        maxlength: 1000
    },

    fortalezas: [{
        type: String,
        maxlength: 200
    }],

    areasAMejorar: [{
        type: String,
        maxlength: 200
    }],

    // ============================================
    // SECTION 6: REPORT STATUS
    // ============================================
    estado: {
        type: String,
        enum: ['en_progreso', 'aprobado', 'reprobado', 'pendiente_evaluacion'],
        default: 'en_progreso'
    },

    // ============================================
    // SECTION 7: GENERATION METADATA
    // ============================================
    generadoPor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'BaseUser',
        required: true
        // Can be a teacher or admin
    },

    fechaGeneracion: {
        type: Date,
        default: Date.now
    },

    aprobado: {
        type: Boolean,
        default: false
    },

    notaFinal: {
        type: Number,
        min: 0,
        max: 100
    }

}, {
    timestamps: true,
    collection: 'reportes_academicos'
});

// ============================================
// COMPOUND INDEXES FOR COMMON QUERIES
// ============================================
reporteAcademicoSchema.index({ estudiante: 1, curso: 1 });
reporteAcademicoSchema.index({ estudiante: 1, periodo: 1 });
reporteAcademicoSchema.index({ curso: 1, periodo: 1 });
reporteAcademicoSchema.index({ estado: 1 });

// ============================================
// MIDDLEWARE: Pre-save
// Automatically calculates percentages before saving
// ============================================
reporteAcademicoSchema.pre('save', function (next) {
    // Asegurar que horasAsistidas y horasTotales sean números válidos
    const horasAsistidas = Number(this.horasAsistidas) || 0;
    const horasTotales = Number(this.horasTotales) || 0;
    
    // Calculate attendance percentage - SIEMPRE establecer un valor
    if (horasTotales > 0) {
        this.porcentajeAsistencia = Math.min(100, Math.max(0, (horasAsistidas / horasTotales) * 100));
    } else {
        // Si no hay horas totales, el porcentaje es 0 (no se puede calcular)
        this.porcentajeAsistencia = 0;
    }

    // Calculate average grade from evaluations
    if (this.evaluaciones && Array.isArray(this.evaluaciones) && this.evaluaciones.length > 0) {
        // Filtrar evaluaciones válidas (con nota numérica)
        const evaluacionesValidas = this.evaluaciones.filter(e => 
            e && typeof e.nota === 'number' && !isNaN(e.nota) && e.nota >= 0 && e.nota <= 10
        );
        
        if (evaluacionesValidas.length > 0) {
            const sumaNotas = evaluacionesValidas.reduce((sum, evaluacion) => sum + evaluacion.nota, 0);
            this.calificacionPromedio = parseFloat((sumaNotas / evaluacionesValidas.length).toFixed(2));
        } else {
            // Si no hay evaluaciones válidas, no hay promedio
            this.calificacionPromedio = null;
        }
    } else {
        // No hay evaluaciones
        this.calificacionPromedio = null;
    }

    // Log para debugging
    console.log(`[ReporteAcademico pre-save] Estudiante: ${this.estudiante}, Horas: ${horasAsistidas}/${horasTotales}, Porcentaje: ${this.porcentajeAsistencia?.toFixed(2)}%`);
    console.log(`[ReporteAcademico pre-save] Evaluaciones: ${this.evaluaciones?.length || 0}, Promedio: ${this.calificacionPromedio?.toFixed(2) || 'N/A'}`);

    // Determine if passed (criteria: >=6.0 grade (escala 0-10) and >=75% attendance)
    // Solo determinar estado si hay evaluaciones (calificaciones)
    const tieneEvaluaciones = this.calificacionPromedio !== null && this.calificacionPromedio !== undefined;
    
    if (tieneEvaluaciones) {
        // Las calificaciones están en escala 0-10, no 0-100
        const notaMinimaAprobacion = 6.0;
        const porcentajeMinimoAsistencia = 75;
        
        const cumpleNota = this.calificacionPromedio >= notaMinimaAprobacion;
        const cumpleAsistencia = this.porcentajeAsistencia >= porcentajeMinimoAsistencia;
        
        console.log(`[ReporteAcademico pre-save] Criterios: Nota ${this.calificacionPromedio.toFixed(2)} >= ${notaMinimaAprobacion}? ${cumpleNota}, Asistencia ${this.porcentajeAsistencia.toFixed(2)}% >= ${porcentajeMinimoAsistencia}%? ${cumpleAsistencia}`);
        
        if (cumpleNota && cumpleAsistencia) {
            this.aprobado = true;
            this.estado = 'aprobado';
            console.log(`[ReporteAcademico pre-save] Estado: APROBADO`);
        } else {
            // No cumple criterios: reprobado
            this.aprobado = false;
            this.estado = 'reprobado';
            console.log(`[ReporteAcademico pre-save] Estado: REPROBADO (nota: ${cumpleNota ? 'OK' : 'NO'}, asistencia: ${cumpleAsistencia ? 'OK' : 'NO'})`);
        }
    } else {
        // Sin evaluaciones o sin calificación promedio, mantener en progreso
        this.aprobado = undefined;
        this.estado = 'en_progreso';
        console.log(`[ReporteAcademico pre-save] Estado: EN_PROGRESO (sin evaluaciones o sin promedio)`);
    }

    next();
});

// ============================================
// METHOD: Add evaluation
// Makes it easy to add new evaluations to the report
// ============================================
reporteAcademicoSchema.methods.agregarEvaluacion = async function (tipo, nota, fecha, comentarios) {
    this.evaluaciones.push({
        tipo,
        nota,
        fecha: fecha || new Date(),
        comentarios
    });

    await this.save(); // Trigger pre-save to recalculate average
};

// ============================================
// STATIC METHOD: Get full report
// Populates all necessary references
// ============================================
reporteAcademicoSchema.statics.obtenerReporteCompleto = async function (reporteId) {
    return await this.findById(reporteId)
        .populate('estudiante', 'firstName lastName email dni')
        .populate('curso', 'nombre idioma nivel')
        .populate('generadoPor', 'firstName lastName role');
};

// ============================================
// STATIC METHOD: Reports by student
// ============================================
reporteAcademicoSchema.statics.obtenerPorEstudiante = async function (estudianteId, opciones = {}) {
    const query = { estudiante: estudianteId };

    if (opciones.periodo) {
        query.periodo = opciones.periodo;
    }

    if (opciones.estado) {
        query.estado = opciones.estado;
    }

    return await this.find(query)
        .populate('curso', 'nombre idioma nivel')
        .sort({ fechaGeneracion: -1 });
};

const ReporteAcademico = mongoose.model('ReporteAcademico', reporteAcademicoSchema);

module.exports = ReporteAcademico;