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
            enum: ['examen', 'tarea', 'proyecto', 'oral', 'escrito', 'practica'],
            required: true
        },
        nota: {
            type: Number,
            min: 0,
            max: 100,
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
    // Calculate attendance percentage
    if (this.horasTotales > 0) {
        this.porcentajeAsistencia = (this.horasAsistidas / this.horasTotales) * 100;
    }

    // Calculate average grade from evaluations
    if (this.evaluaciones && this.evaluaciones.length > 0) {
        const sumaNotas = this.evaluaciones.reduce((sum, evaluacion) => sum + evaluacion.nota, 0);
        this.calificacionPromedio = sumaNotas / this.evaluaciones.length;
    }

    // Determine if passed (criteria: >60% grade and >75% attendance)
    if (this.calificacionPromedio >= 60 && this.porcentajeAsistencia >= 75) {
        this.aprobado = true;
        this.estado = 'aprobado';
    } else if (this.calificacionPromedio < 60) {
        this.aprobado = false;
        this.estado = 'reprobado'; // failed
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