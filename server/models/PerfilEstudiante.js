const mongoose = require('mongoose');

/**
 * MODEL: PerfilEstudiante
 * PURPOSE: Extends student information with detailed academic data
 * RELATIONSHIP: Links to BaseUser (student) by reference
 * 
 * This model does NOT replace Estudiante.js, it COMPLEMENTS it with additional info
 */

const perfilEstudianteSchema = new mongoose.Schema({
    // ============================================
    // SECTION 1: USER REFERENCE
    // Links this profile to the student in BaseUser
    // ============================================
    usuario: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'BaseUser',
        required: [true, 'User is required'],
        unique: true,
        index: true
    },

    // ============================================
    // SECTION 2: ACTIVE COURSES
    // List of courses in which the student is currently enrolled
    // ============================================
    cursosActivos: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Curso'
    }],

    // ============================================
    // SECTION 3: ACADEMIC HISTORY
    // Complete record of all courses taken
    // ============================================
    historialCursos: [{
        curso: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Curso',
            required: true
        },
        fechaInicio: {
            type: Date,
            required: true
        },
        fechaFin: {
            type: Date
        },
        progreso: {
            type: Number,
            min: 0,
            max: 100,
            default: 0
        },
        calificacionFinal: {
            type: Number,
            min: 0,
            max: 100
        },
        estado: {
            type: String,
            enum: ['en_curso', 'aprobado', 'reprobado', 'abandonado'],
            default: 'en_curso'
        }
    }],

    // ============================================
    // SECTION 4: CERTIFICATES
    // Certificates obtained by the student
    // ============================================
    certificados: [{
        curso: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Curso'
        },
        idioma: {
            type: String,
            enum: ['ingles', 'frances', 'aleman', 'italiano', 'portugues', 'espanol'],
            required: true
        },
        nivel: {
            type: String,
            enum: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'],
            required: true
        },
        fechaEmision: {
            type: Date,
            default: Date.now
        },
        codigoVerificacion: {
            type: String,
            unique: true,
            sparse: true
        }
    }],

    // ============================================
    // SECTION 5: STUDENT PREFERENCES
    // Personal configuration of schedules and modalities
    // ============================================
    preferencias: {
        horarios: [{
            dia: {
                type: String,
                enum: ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo']
            },
            horaInicio: String,
            horaFin: String
        }],
        modalidad: {
            type: String,
            enum: ['presencial', 'virtual', 'hibrido'],
            default: 'presencial'
        },
        idiomasInteres: [{
            type: String,
            enum: ['ingles', 'frances', 'aleman', 'italiano', 'portugues', 'espanol']
        }]
    },

    // ============================================
    // SECTION 6: GENERAL STATISTICS
    // Calculated metrics of the student's performance
    // ============================================
    estadisticas: {
        horasTotales: {
            type: Number,
            default: 0,
            min: 0
        },
        asistenciaPromedio: {
            type: Number,
            default: 0,
            min: 0,
            max: 100
        },
        cursosCompletados: {
            type: Number,
            default: 0,
            min: 0
        },
        promedioCalificaciones: {
            type: Number,
            default: 0,
            min: 0,
            max: 100
        }
    }

}, {
    timestamps: true,
    collection: 'perfiles_estudiantes'
});

// ============================================
// INDEXES FOR QUERY OPTIMIZATION
// ============================================
perfilEstudianteSchema.index({ usuario: 1 });
perfilEstudianteSchema.index({ 'certificados.codigoVerificacion': 1 });

// ============================================
// METHOD: Update statistics
// Recalculates all student metrics
// ============================================
perfilEstudianteSchema.methods.actualizarEstadisticas = async function () {
    // Calculate completed courses
    this.estadisticas.cursosCompletados = this.historialCursos.filter(
        curso => curso.estado === 'aprobado'
    ).length;

    // Calculate average grade (only for courses with a grade)
    const cursosConCalificacion = this.historialCursos.filter(
        curso => curso.calificacionFinal != null
    );

    if (cursosConCalificacion.length > 0) {
        const sumaCalificaciones = cursosConCalificacion.reduce(
            (sum, curso) => sum + curso.calificacionFinal, 0
        );
        this.estadisticas.promedioCalificaciones = sumaCalificaciones / cursosConCalificacion.length;
    }

    await this.save();
};

// ============================================
// STATIC METHOD: Get full profile
// Finds the profile and populates all references
// ============================================
perfilEstudianteSchema.statics.obtenerPerfilCompleto = async function (usuarioId) {
    return await this.findOne({ usuario: usuarioId })
        .populate('usuario', 'firstName lastName email dni')
        .populate('cursosActivos', 'nombre idioma nivel')
        .populate('historialCursos.curso', 'nombre idioma nivel')
        .populate('certificados.curso', 'nombre');
};

const PerfilEstudiante = mongoose.model('PerfilEstudiante', perfilEstudianteSchema);

module.exports = PerfilEstudiante;