const ReporteAcademico = require('../models/ReporteAcademico');
const PerfilEstudiante = require('../models/PerfilEstudiante');
const { BaseUser } = require('../models');

/**
 * SERVICE: reportesAcademicosService
 * PROPÓSITO: Lógica de negocio para generación de reportes académicos
 * 
 * DEPENDENCIAS:
 * - Lorena: cursosService, clasesService (para progreso y asistencia)
 * - Propio: PerfilEstudiante (para estadísticas)
 * 
 * NOTA: Algunas funciones esperan que Lorena haya completado sus servicios.
 * Por ahora, incluyen comentarios indicando dónde integrar sus datos.
 */

// ============================================
// SECCIÓN 1: GENERAR REPORTES
// ============================================

/**
 * Genera un reporte académico completo para un estudiante en un curso
 */
exports.generarReporteAcademico = async (datosReporte) => {
    try {
        const {
            estudianteId,
            cursoId,
            periodo,
            generadoPorId
        } = datosReporte;

        // Validar que el estudiante existe
        const estudiante = await BaseUser.findById(estudianteId);
        if (!estudiante || estudiante.__t !== 'estudiante') {
            throw new Error('Estudiante no encontrado');
        }

        // TODO: Cuando Lorena tenga su servicio, usar esto:
        // const cursosService = require('./cursosService');
        // const curso = await cursosService.getCursoById(cursoId);
        // if (!curso) throw new Error('Curso no encontrado');

        // TODO: Obtener datos de asistencia de Lorena
        // const clasesService = require('./clasesService');
        // const horasData = await clasesService.getHorasCompletadasCurso(cursoId, estudianteId);

        // TEMPORAL: Datos de ejemplo hasta que Lorena tenga su módulo
        const horasAsistidas = datosReporte.horasAsistidas || 0;
        const horasTotales = datosReporte.horasTotales || 0;
        const progreso = datosReporte.progreso || 0;

        // Crear el reporte
        const nuevoReporte = new ReporteAcademico({
            estudiante: estudianteId,
            curso: cursoId,
            periodo: periodo || generarPeriodoActual(),
            horasAsistidas,
            horasTotales,
            progreso,
            evaluaciones: datosReporte.evaluaciones || [],
            comentariosProfesor: datosReporte.comentariosProfesor || '',
            fortalezas: datosReporte.fortalezas || [],
            areasAMejorar: datosReporte.areasAMejorar || [],
            estado: 'en_progreso',
            generadoPor: generadoPorId,
            fechaGeneracion: new Date()
        });

        // El middleware pre-save calculará automáticamente porcentajes
        await nuevoReporte.save();

        // Actualizar estadísticas del perfil del estudiante
        await actualizarEstadisticasEstudiante(estudianteId);

        return nuevoReporte;
    } catch (error) {
        throw new Error(`Error al generar reporte académico: ${error.message}`);
    }
};

/**
 * Genera el período actual en formato YYYY-Q1/Q2/Q3/Q4
 */
const generarPeriodoActual = () => {
    const fecha = new Date();
    const year = fecha.getFullYear();
    const month = fecha.getMonth() + 1;
    const quarter = Math.ceil(month / 3);
    return `${year}-Q${quarter}`;
};

/**
 * Actualiza las estadísticas del estudiante basado en sus reportes
 */
const actualizarEstadisticasEstudiante = async (estudianteId) => {
    try {
        const perfil = await PerfilEstudiante.findOne({ usuario: estudianteId });
        if (perfil) {
            await perfil.actualizarEstadisticas();
        }
    } catch (error) {
        console.error('Error al actualizar estadísticas:', error.message);
    }
};

// ============================================
// SECCIÓN 2: OBTENER REPORTES
// ============================================

/**
 * Obtiene un reporte completo por ID
 */
exports.obtenerReportePorId = async (reporteId) => {
    try {
        const reporte = await ReporteAcademico.obtenerReporteCompleto(reporteId);

        if (!reporte) {
            return null;
        }

        return reporte;
    } catch (error) {
        throw new Error(`Error al obtener reporte: ${error.message}`);
    }
};

/**
 * Obtiene todos los reportes de un estudiante
 */
exports.obtenerReportesPorEstudiante = async (estudianteId, opciones = {}) => {
    try {
        const query = { estudiante: estudianteId };

        // Filtros opcionales
        if (opciones.periodo) {
            query.periodo = opciones.periodo;
        }

        if (opciones.estado) {
            query.estado = opciones.estado;
        }

        if (opciones.cursoId) {
            query.curso = opciones.cursoId;
        }

        const reportes = await ReporteAcademico.find(query)
            .populate('curso', 'nombre idioma nivel')
            .populate('generadoPor', 'firstName lastName')
            .sort({ fechaGeneracion: -1 });

        return reportes;
    } catch (error) {
        throw new Error(`Error al obtener reportes del estudiante: ${error.message}`);
    }
};

/**
 * Obtiene todos los reportes de un curso
 */
exports.obtenerReportesPorCurso = async (cursoId, opciones = {}) => {
    try {
        const query = { curso: cursoId };

        if (opciones.periodo) {
            query.periodo = opciones.periodo;
        }

        if (opciones.estado) {
            query.estado = opciones.estado;
        }

        const reportes = await ReporteAcademico.find(query)
            .populate('estudiante', 'firstName lastName email dni')
            .populate('generadoPor', 'firstName lastName')
            .sort({ 'estudiante.lastName': 1 });

        return reportes;
    } catch (error) {
        throw new Error(`Error al obtener reportes del curso: ${error.message}`);
    }
};

/**
 * Obtiene reportes de un período específico
 */
exports.obtenerReportesPorPeriodo = async (periodo) => {
    try {
        const reportes = await ReporteAcademico.find({ periodo })
            .populate('estudiante', 'firstName lastName email')
            .populate('curso', 'nombre idioma nivel')
            .populate('generadoPor', 'firstName lastName')
            .sort({ fechaGeneracion: -1 });

        return reportes;
    } catch (error) {
        throw new Error(`Error al obtener reportes del período: ${error.message}`);
    }
};

// ============================================
// SECCIÓN 3: ACTUALIZAR REPORTES
// ============================================

/**
 * Actualiza un reporte existente
 */
exports.actualizarReporte = async (reporteId, datosActualizacion) => {
    try {
        const reporte = await ReporteAcademico.findById(reporteId);

        if (!reporte) {
            throw new Error('Reporte no encontrado');
        }

        // Actualizar campos permitidos
        if (datosActualizacion.horasAsistidas !== undefined) {
            reporte.horasAsistidas = datosActualizacion.horasAsistidas;
        }

        if (datosActualizacion.horasTotales !== undefined) {
            reporte.horasTotales = datosActualizacion.horasTotales;
        }

        if (datosActualizacion.progreso !== undefined) {
            reporte.progreso = datosActualizacion.progreso;
        }

        if (datosActualizacion.comentariosProfesor) {
            reporte.comentariosProfesor = datosActualizacion.comentariosProfesor;
        }

        if (datosActualizacion.fortalezas) {
            reporte.fortalezas = datosActualizacion.fortalezas;
        }

        if (datosActualizacion.areasAMejorar) {
            reporte.areasAMejorar = datosActualizacion.areasAMejorar;
        }

        if (datosActualizacion.estado) {
            reporte.estado = datosActualizacion.estado;
        }

        if (datosActualizacion.notaFinal !== undefined) {
            reporte.notaFinal = datosActualizacion.notaFinal;
        }

        await reporte.save();
        return reporte;
    } catch (error) {
        throw new Error(`Error al actualizar reporte: ${error.message}`);
    }
};

/**
 * Agrega una evaluación al reporte
 */
exports.agregarEvaluacion = async (reporteId, datosEvaluacion) => {
    try {
        const reporte = await ReporteAcademico.findById(reporteId);

        if (!reporte) {
            throw new Error('Reporte no encontrado');
        }

        await reporte.agregarEvaluacion(
            datosEvaluacion.tipo,
            datosEvaluacion.nota,
            datosEvaluacion.fecha,
            datosEvaluacion.comentarios
        );

        return reporte;
    } catch (error) {
        throw new Error(`Error al agregar evaluación: ${error.message}`);
    }
};

// ============================================
// SECCIÓN 4: ESTADÍSTICAS Y ANÁLISIS
// ============================================

/**
 * Calcula estadísticas generales de un estudiante
 */
exports.obtenerEstadisticasEstudiante = async (estudianteId) => {
    try {
        const reportes = await ReporteAcademico.find({ estudiante: estudianteId });

        if (reportes.length === 0) {
            return {
                totalReportes: 0,
                promedioGeneral: 0,
                asistenciaPromedio: 0,
                cursosAprobados: 0,
                cursosReprobados: 0,
                cursosEnProgreso: 0
            };
        }

        const estadisticas = {
            totalReportes: reportes.length,
            promedioGeneral: 0,
            asistenciaPromedio: 0,
            cursosAprobados: reportes.filter(r => r.estado === 'aprobado').length,
            cursosReprobados: reportes.filter(r => r.estado === 'reprobado').length,
            cursosEnProgreso: reportes.filter(r => r.estado === 'en_progreso').length
        };

        // Calcular promedio de calificaciones
        const sumaCalificaciones = reportes.reduce((sum, r) => sum + r.calificacionPromedio, 0);
        estadisticas.promedioGeneral = sumaCalificaciones / reportes.length;

        // Calcular promedio de asistencia
        const sumaAsistencia = reportes.reduce((sum, r) => sum + r.porcentajeAsistencia, 0);
        estadisticas.asistenciaPromedio = sumaAsistencia / reportes.length;

        return estadisticas;
    } catch (error) {
        throw new Error(`Error al calcular estadísticas: ${error.message}`);
    }
};

/**
 * Obtiene resumen de un curso (todos los estudiantes)
 */
exports.obtenerResumenCurso = async (cursoId) => {
    try {
        const reportes = await ReporteAcademico.find({ curso: cursoId })
            .populate('estudiante', 'firstName lastName');

        if (reportes.length === 0) {
            return {
                totalEstudiantes: 0,
                promedioGeneral: 0,
                asistenciaPromedio: 0,
                aprobados: 0,
                reprobados: 0,
                enProgreso: 0
            };
        }

        const resumen = {
            totalEstudiantes: reportes.length,
            promedioGeneral: 0,
            asistenciaPromedio: 0,
            aprobados: reportes.filter(r => r.estado === 'aprobado').length,
            reprobados: reportes.filter(r => r.estado === 'reprobado').length,
            enProgreso: reportes.filter(r => r.estado === 'en_progreso').length,
            estudiantes: reportes.map(r => ({
                nombre: `${r.estudiante.firstName} ${r.estudiante.lastName}`,
                progreso: r.progreso,
                calificacion: r.calificacionPromedio,
                asistencia: r.porcentajeAsistencia,
                estado: r.estado
            }))
        };

        // Calcular promedios
        const sumaCalificaciones = reportes.reduce((sum, r) => sum + r.calificacionPromedio, 0);
        resumen.promedioGeneral = sumaCalificaciones / reportes.length;

        const sumaAsistencia = reportes.reduce((sum, r) => sum + r.porcentajeAsistencia, 0);
        resumen.asistenciaPromedio = sumaAsistencia / reportes.length;

        return resumen;
    } catch (error) {
        throw new Error(`Error al obtener resumen del curso: ${error.message}`);
    }
};

// ============================================
// SECCIÓN 5: GENERACIÓN AUTOMÁTICA
// ============================================

/**
 * Genera reportes automáticos para todos los estudiantes de un curso
 * Esta función se puede ejecutar periódicamente (ej: fin de trimestre)
 */
exports.generarReportesAutomaticosCurso = async (cursoId, generadoPorId) => {
    try {
        // TODO: Cuando Lorena tenga su servicio, obtener estudiantes del curso
        // const cursosService = require('./cursosService');
        // const estudiantes = await cursosService.getEstudiantesCurso(cursoId);

        // Por ahora, lanzar error indicando que falta integración
        throw new Error('Esta función requiere integración con el módulo de Lorena (cursosService)');

        // FUTURO: Iterar sobre estudiantes y generar reporte para cada uno
        /*
        const reportesGenerados = [];
        
        for (const estudiante of estudiantes) {
        const reporte = await exports.generarReporteAcademico({
            estudianteId: estudiante._id,
            cursoId,
            periodo: generarPeriodoActual(),
            generadoPorId
            });
            reportesGenerados.push(reporte);
        }
    
        return reportesGenerados;
        */
    } catch (error) {
        throw new Error(`Error al generar reportes automáticos: ${error.message}`);
    }
};

module.exports = exports;