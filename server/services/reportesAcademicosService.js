const ReporteAcademico = require('../models/ReporteAcademico');
const PerfilEstudiante = require('../models/PerfilEstudiante');
const { BaseUser, Curso } = require('../models');
const cursosService = require('./cursosService');

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

        let progreso = datosReporte.progreso;
        if (!progreso && cursoId && estudianteId) {
            try {
                const progresoData = await cursosService.calcularProgresoCurso(cursoId, estudianteId);
                progreso = progresoData.progreso || 0;
            } catch (error) {
                console.log('Could not calculate progress:', error.message);
                progreso = 0;
            }
        }

        const horasAsistidas = datosReporte.horasAsistidas || 0;
        const horasTotales = datosReporte.horasTotales || 0;

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

/**
 * Obtiene listado global de estudiantes en riesgo por inasistencias,
 * reutilizando la misma lógica que ve el profesor en su curso.
 */
exports.obtenerEstudiantesEnRiesgoAsistencia = async () => {
    try {
        // Considerar cursos activos o planificados
        const cursos = await Curso.find({
            estado: { $in: ['activo', 'planificado'] }
        })
            .select('nombre idioma nivel profesor')
            .populate('profesor', 'firstName lastName email');

        console.log('obtenerEstudiantesEnRiesgoAsistencia - cursos candidatos:', cursos.length);

        const resultados = [];

        for (const curso of cursos) {
            // Usa cursosService.getEstudiantesCurso para mantener lógica unificada
            const estudiantes = await cursosService.getEstudiantesCurso(curso._id);
            console.log(
              'obtenerEstudiantesEnRiesgoAsistencia - curso',
              curso.nombre,
              '- estudiantes:', estudiantes.length
            );

            estudiantes.forEach((item) => {
                const asistencia = item.asistencia || {};
                if (asistencia.estaCercaDelLimite) {
                    console.log(
                      '  -> Estudiante en riesgo encontrado:',
                      item.estudiante?.firstName,
                      item.estudiante?.lastName,
                      'faltas:',
                      asistencia.clasesFaltadas,
                      'límite:',
                      asistencia.limiteMaximoInasistencias,
                      'restantes:',
                      asistencia.inasistenciasRestantes
                    );
                    const estudiante = item.estudiante || {};
                    resultados.push({
                        estudianteId: estudiante._id,
                        estudianteNombre: `${estudiante.firstName || ''} ${estudiante.lastName || ''}`.trim(),
                        estudianteEmail: estudiante.email || '',
                        cursoId: curso._id,
                        cursoNombre: curso.nombre,
                        idioma: curso.idioma,
                        nivel: curso.nivel,
                        profesorNombre: curso.profesor
                            ? `${curso.profesor.firstName || ''} ${curso.profesor.lastName || ''}`.trim()
                            : '',
                        porcentajeAsistencia: asistencia.porcentajeAsistencia ?? 0,
                        clasesFaltadas: asistencia.clasesFaltadas ?? 0,
                        limiteMaximoInasistencias: asistencia.limiteMaximoInasistencias ?? 0,
                        inasistenciasRestantes: asistencia.inasistenciasRestantes ?? 0
                    });
                }
            });
        }

        // Ordenar por "faltas restantes" (menos margen primero)
        resultados.sort((a, b) => {
            const aRest = a.inasistenciasRestantes ?? 0;
            const bRest = b.inasistenciasRestantes ?? 0;
            return aRest - bRest;
        });

        console.log('obtenerEstudiantesEnRiesgoAsistencia - total en riesgo:', resultados.length);

        return resultados;
    } catch (error) {
        throw new Error(`Error al obtener estudiantes en riesgo: ${error.message}`);
    }
};

/**
 * Resumen académico global para el dashboard (asistencia por estudiante)
 * Devuelve shape similar al que espera ReportsDashboard (academicData).
 */
exports.obtenerResumenAcademicoDashboard = async () => {
    try {
        // Traer todos los estudiantes activos
        const estudiantes = await BaseUser.find({ role: 'estudiante', isActive: true })
            .select('firstName lastName nivel email');

        const items = [];

        for (const est of estudiantes) {
            // Usar la misma lógica de asistencia que el dashboard de estudiante,
            // llamando a clasesService.getAsistenciaEstudiante sin cursoId
            let attendance = 0;
            try {
                const asistenciaGlobal = await require('./clasesService').getAsistenciaEstudiante(
                    est._id.toString(),
                    null
                );
                attendance = asistenciaGlobal.porcentajeAsistencia || 0;
            } catch (e) {
                console.error('Error calculando asistencia global para estudiante', est._id.toString(), e.message);
            }

            items.push({
                _id: est._id,
                firstName: est.firstName,
                lastName: est.lastName,
                nivel: est.nivel || '',
                attendance
            });
        }

        const total = items.length;
        const averageAttendance = total > 0
            ? (items.reduce((sum, s) => sum + (s.attendance || 0), 0) / total).toFixed(1)
            : 0;

        return {
            total,
            averageAttendance,
            students: items
        };
    } catch (error) {
        throw new Error(`Error al obtener resumen académico para dashboard: ${error.message}`);
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
        const estudiantes = await cursosService.getEstudiantesCurso(cursoId);
        
        if (!estudiantes || estudiantes.length === 0) {
            throw new Error('No students found in this course');
        }

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
    } catch (error) {
        throw new Error(`Error al generar reportes automáticos: ${error.message}`);
    }
};

module.exports = exports;