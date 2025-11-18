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
        console.log(`[generarReporteAcademico] Buscando estudiante con ID: ${estudianteId}`);
        const estudiante = await BaseUser.findById(estudianteId);
        console.log(`[generarReporteAcademico] Estudiante encontrado:`, {
            existe: !!estudiante,
            tieneId: !!estudiante?._id,
            tipo: estudiante?.__t,
            role: estudiante?.role,
            nombre: estudiante ? `${estudiante.firstName} ${estudiante.lastName}` : 'N/A'
        });
        
        if (!estudiante) {
            throw new Error(`Estudiante con ID ${estudianteId} no encontrado en la base de datos`);
        }
        
        if (estudiante.__t !== 'estudiante' && estudiante.role !== 'estudiante') {
            throw new Error(`El usuario con ID ${estudianteId} no es un estudiante (tipo: ${estudiante.__t || estudiante.role})`);
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

        // Calcular horas asistidas y totales desde las clases del curso
        let horasAsistidas = datosReporte.horasAsistidas;
        let horasTotales = datosReporte.horasTotales;
        
        if ((horasAsistidas === undefined || horasAsistidas === null || horasAsistidas === 0) && cursoId) {
            try {
                const Clase = require('../models/Clase');
                const clasesService = require('./clasesService');
                
                // Usar el método existente para obtener estadísticas de asistencia
                const estadisticasAsistencia = await clasesService.getAsistenciaEstudiante(estudianteId, cursoId);
                
                // Obtener SOLO las clases completadas para calcular horas totales y asistidas
                // No incluir clases programadas porque aún no se pueden asistir
                const clasesCompletadas = await Clase.find({ 
                    curso: cursoId,
                    estado: 'completada'
                }).select('duracionMinutos asistencia').lean();
                
                // Calcular horas totales SOLO con clases completadas
                horasTotales = clasesCompletadas.reduce((total, clase) => {
                    const duracionHoras = (clase.duracionMinutos || 0) / 60;
                    return total + duracionHoras;
                }, 0);
                
                // Calcular horas asistidas y clases asistidas contando solo las clases donde el estudiante estuvo presente
                if (clasesCompletadas.length > 0) {
                    let horasAsistidasCalculadas = 0;
                    let clasesAsistidasContadas = 0;
                    const estudianteIdStr = estudianteId.toString();
                    
                    console.log(`[generarReporteAcademico] Buscando asistencia para estudiante: ${estudianteIdStr}`);
                    console.log(`[generarReporteAcademico] Total clases completadas: ${clasesCompletadas.length}`);
                    
                    for (const clase of clasesCompletadas) {
                        // Verificar si el estudiante estuvo presente
                        // asistencia.estudiante es un ObjectId (no populado)
                        const asistenciaEstudiante = clase.asistencia?.find(a => {
                            if (!a || !a.estudiante) return false;
                            // asistencia.estudiante es un ObjectId, convertirlo a string para comparar
                            const idEstudiante = a.estudiante.toString();
                            return idEstudiante === estudianteIdStr;
                        });
                        
                        if (asistenciaEstudiante && asistenciaEstudiante.presente === true) {
                            const duracionHoras = (clase.duracionMinutos || 0) / 60;
                            horasAsistidasCalculadas += duracionHoras;
                            clasesAsistidasContadas++;
                            console.log(`[generarReporteAcademico] Estudiante presente en clase, agregando ${duracionHoras.toFixed(2)} horas`);
                        }
                    }
                    
                    horasAsistidas = horasAsistidasCalculadas;
                    
                    // Guardar clases asistidas/totales como campos virtuales o en el reporte
                    // Los usaremos para el PDF
                    console.log(`[generarReporteAcademico] Clases completadas: ${clasesCompletadas.length}, Clases asistidas: ${clasesAsistidasContadas}, Horas asistidas: ${horasAsistidasCalculadas.toFixed(2)}, Horas totales: ${horasTotales.toFixed(2)}`);
                } else {
                    horasAsistidas = 0;
                    horasTotales = 0;
                    console.log(`[generarReporteAcademico] No hay clases completadas para este curso`);
                }
                
                const porcentajeCalculado = horasTotales > 0 ? (horasAsistidas / horasTotales) * 100 : 0;
                console.log(`[generarReporteAcademico] Horas calculadas para estudiante ${estudianteId}: asistidas=${horasAsistidas.toFixed(2)}, totales=${horasTotales.toFixed(2)}, porcentaje=${porcentajeCalculado.toFixed(2)}%`);
            } catch (error) {
                console.error(`[generarReporteAcademico] Error calculando horas:`, error.message);
                horasAsistidas = horasAsistidas || 0;
                horasTotales = horasTotales || 0;
            }
        } else {
            horasAsistidas = horasAsistidas || 0;
            horasTotales = horasTotales || 0;
        }

        // Obtener evaluaciones desde la inscripción del estudiante
        let evaluaciones = datosReporte.evaluaciones || [];
        if (evaluaciones.length === 0 && cursoId && estudianteId) {
            try {
                const Inscripcion = require('../models/Inscripcion');
                const inscripcion = await Inscripcion.findOne({
                    estudiante: estudianteId,
                    curso: cursoId,
                    estado: 'confirmada'
                }).select('tp1 tp2 parcial1 parcial2 examenFinal');
                
                if (inscripcion) {
                    console.log(`[generarReporteAcademico] Inscripción encontrada con notas: TP1=${inscripcion.tp1}, TP2=${inscripcion.tp2}, Parcial1=${inscripcion.parcial1}, Parcial2=${inscripcion.parcial2}, ExamenFinal=${inscripcion.examenFinal}`);
                    
                    // Convertir las calificaciones de la inscripción en evaluaciones del reporte
                    // Validar que las notas sean números válidos en escala 0-10
                    const validarNota = (nota) => {
                        const num = Number(nota);
                        return !isNaN(num) && num >= 0 && num <= 10 ? num : null;
                    };
                    
                    if (inscripcion.tp1 !== undefined && inscripcion.tp1 !== null) {
                        const nota = validarNota(inscripcion.tp1);
                        if (nota !== null) {
                            evaluaciones.push({
                                tipo: 'TP1',
                                nota: nota,
                                fecha: new Date(),
                                comentarios: 'Trabajo Práctico 1'
                            });
                        }
                    }
                    if (inscripcion.tp2 !== undefined && inscripcion.tp2 !== null) {
                        const nota = validarNota(inscripcion.tp2);
                        if (nota !== null) {
                            evaluaciones.push({
                                tipo: 'TP2',
                                nota: nota,
                                fecha: new Date(),
                                comentarios: 'Trabajo Práctico 2'
                            });
                        }
                    }
                    if (inscripcion.parcial1 !== undefined && inscripcion.parcial1 !== null) {
                        const nota = validarNota(inscripcion.parcial1);
                        if (nota !== null) {
                            evaluaciones.push({
                                tipo: 'Parcial 1',
                                nota: nota,
                                fecha: new Date(),
                                comentarios: 'Primer Parcial'
                            });
                        }
                    }
                    if (inscripcion.parcial2 !== undefined && inscripcion.parcial2 !== null) {
                        const nota = validarNota(inscripcion.parcial2);
                        if (nota !== null) {
                            evaluaciones.push({
                                tipo: 'Parcial 2',
                                nota: nota,
                                fecha: new Date(),
                                comentarios: 'Segundo Parcial'
                            });
                        }
                    }
                    if (inscripcion.examenFinal !== undefined && inscripcion.examenFinal !== null) {
                        const nota = validarNota(inscripcion.examenFinal);
                        if (nota !== null) {
                            evaluaciones.push({
                                tipo: 'Examen Final',
                                nota: nota,
                                fecha: new Date(),
                                comentarios: 'Examen Final'
                            });
                        }
                    }
                    
                    const notasDetalle = evaluaciones.map(e => `${e.tipo}=${e.nota}`).join(', ');
                    console.log(`[generarReporteAcademico] Evaluaciones obtenidas desde inscripción: ${evaluaciones.length} (${notasDetalle})`);
                } else {
                    console.log(`[generarReporteAcademico] No se encontró inscripción para estudiante ${estudianteId} en curso ${cursoId}`);
                }
            } catch (error) {
                console.error(`[generarReporteAcademico] Error obteniendo evaluaciones:`, error.message);
            }
        }
        
        // Validar que todas las evaluaciones tengan estructura correcta
        evaluaciones = evaluaciones.filter(e => {
            if (!e || typeof e !== 'object') return false;
            if (!e.tipo || typeof e.tipo !== 'string') return false;
            const nota = Number(e.nota);
            if (isNaN(nota) || nota < 0 || nota > 10) {
                console.warn(`[generarReporteAcademico] Evaluación inválida ignorada: tipo=${e.tipo}, nota=${e.nota}`);
                return false;
            }
            e.nota = nota; // Asegurar que nota sea número
            if (!e.fecha) e.fecha = new Date();
            if (!e.comentarios) e.comentarios = '';
            return true;
        });

        // Asegurar que horasAsistidas y horasTotales sean números válidos
        horasAsistidas = Number(horasAsistidas) || 0;
        horasTotales = Number(horasTotales) || 0;
        
        // Log antes de crear el reporte
        console.log(`[generarReporteAcademico] Creando reporte con ${evaluaciones.length} evaluaciones`);
        console.log(`[generarReporteAcademico] Horas: asistidas=${horasAsistidas}, totales=${horasTotales}`);
        if (evaluaciones.length > 0) {
            console.log(`[generarReporteAcademico] Evaluaciones a guardar:`, evaluaciones.map(e => `${e.tipo}=${e.nota}`).join(', '));
        } else {
            console.log(`[generarReporteAcademico] ADVERTENCIA: No hay evaluaciones para este estudiante`);
        }

        // Crear el reporte
        const nuevoReporte = new ReporteAcademico({
            estudiante: estudianteId,
            curso: cursoId,
            periodo: periodo || generarPeriodoActual(),
            horasAsistidas: horasAsistidas,
            horasTotales: horasTotales,
            progreso: progreso || 0,
            evaluaciones: evaluaciones,
            comentariosProfesor: datosReporte.comentariosProfesor || '',
            fortalezas: datosReporte.fortalezas || [],
            areasAMejorar: datosReporte.areasAMejorar || [],
            estado: 'en_progreso', // El pre-save lo cambiará según criterios
            generadoPor: generadoPorId,
            fechaGeneracion: new Date()
        });

        // El middleware pre-save calculará automáticamente porcentajes, promedio y estado
        await nuevoReporte.save();
        
        // Verificar que las evaluaciones se guardaron correctamente
        const reporteGuardado = await ReporteAcademico.findById(nuevoReporte._id)
            .select('evaluaciones calificacionPromedio porcentajeAsistencia horasAsistidas horasTotales estado')
            .lean();
        console.log(`[generarReporteAcademico] Reporte guardado:`);
        console.log(`  - Evaluaciones: ${reporteGuardado.evaluaciones?.length || 0}`);
        console.log(`  - Promedio: ${reporteGuardado.calificacionPromedio?.toFixed(2) || 'N/A'}`);
        console.log(`  - Asistencia: ${reporteGuardado.porcentajeAsistencia?.toFixed(2) || 'N/A'}% (${reporteGuardado.horasAsistidas || 0}/${reporteGuardado.horasTotales || 0} horas)`);
        console.log(`  - Estado: ${reporteGuardado.estado || 'N/A'}`);

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
 * Obtiene reportes recientes (últimos generados)
 * Optimizado para mejor rendimiento
 */
exports.obtenerReportesRecientes = async (limite = 50) => {
    try {
        const reportes = await ReporteAcademico.find({})
            .select('estudiante curso periodo estado fechaGeneracion evaluaciones horasAsistidas horasTotales porcentajeAsistencia calificacionPromedio')
            .populate('estudiante', 'firstName lastName email')
            .populate('curso', 'nombre idioma')
            .sort({ fechaGeneracion: -1 })
            .limit(limite)
            .lean(); // Usar lean() para mejor rendimiento
        
        return reportes;
    } catch (error) {
        throw new Error(`Error al obtener reportes recientes: ${error.message}`);
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
 * Elimina un reporte académico
 */
exports.eliminarReporte = async (reporteId) => {
    try {
        const reporte = await ReporteAcademico.findByIdAndDelete(reporteId);
        if (!reporte) {
            throw new Error('Reporte no encontrado');
        }
        return reporte;
    } catch (error) {
        throw new Error(`Error al eliminar reporte: ${error.message}`);
    }
};

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
                        estudianteDni: estudiante.dni || '',
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
        // Traer todos los estudiantes activos, ordenados por DNI
        const estudiantes = await BaseUser.find({ role: 'estudiante', isActive: true })
            .select('firstName lastName nivel email dni')
            .sort({ dni: 1 }); // Ordenar por DNI ascendente

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

            // Obtener el promedio de calificaciones
            // Primero intentar desde reportes académicos, si no hay, calcular desde inscripciones
            let promedio = null;
            try {
                // 1. Intentar obtener del último reporte académico
                const ultimoReporte = await ReporteAcademico.findOne({ estudiante: est._id })
                    .select('calificacionPromedio')
                    .sort({ fechaGeneracion: -1 })
                    .lean();
                
                if (ultimoReporte && ultimoReporte.calificacionPromedio !== undefined && ultimoReporte.calificacionPromedio !== null) {
                    promedio = parseFloat(ultimoReporte.calificacionPromedio.toFixed(2));
                } else {
                    // 2. Si no hay reporte, calcular desde inscripciones
                    const Inscripcion = require('../models/Inscripcion');
                    const inscripciones = await Inscripcion.find({
                        estudiante: est._id,
                        estado: 'confirmada'
                    }).select('tp1 tp2 parcial1 parcial2 examenFinal').lean();
                    
                    if (inscripciones && inscripciones.length > 0) {
                        // Recolectar todas las notas válidas de todas las inscripciones
                        const todasLasNotas = [];
                        inscripciones.forEach(insc => {
                            if (insc.tp1 !== undefined && insc.tp1 !== null) {
                                const nota = Number(insc.tp1);
                                if (!isNaN(nota) && nota >= 0 && nota <= 10) todasLasNotas.push(nota);
                            }
                            if (insc.tp2 !== undefined && insc.tp2 !== null) {
                                const nota = Number(insc.tp2);
                                if (!isNaN(nota) && nota >= 0 && nota <= 10) todasLasNotas.push(nota);
                            }
                            if (insc.parcial1 !== undefined && insc.parcial1 !== null) {
                                const nota = Number(insc.parcial1);
                                if (!isNaN(nota) && nota >= 0 && nota <= 10) todasLasNotas.push(nota);
                            }
                            if (insc.parcial2 !== undefined && insc.parcial2 !== null) {
                                const nota = Number(insc.parcial2);
                                if (!isNaN(nota) && nota >= 0 && nota <= 10) todasLasNotas.push(nota);
                            }
                            if (insc.examenFinal !== undefined && insc.examenFinal !== null) {
                                const nota = Number(insc.examenFinal);
                                if (!isNaN(nota) && nota >= 0 && nota <= 10) todasLasNotas.push(nota);
                            }
                        });
                        
                        // Calcular promedio si hay notas
                        if (todasLasNotas.length > 0) {
                            const suma = todasLasNotas.reduce((sum, nota) => sum + nota, 0);
                            promedio = parseFloat((suma / todasLasNotas.length).toFixed(2));
                            console.log(`[obtenerResumenAcademicoDashboard] Promedio calculado desde inscripciones para ${est.firstName} ${est.lastName}: ${promedio} (${todasLasNotas.length} notas)`);
                        }
                    }
                }
            } catch (e) {
                console.error('Error obteniendo promedio para estudiante', est._id.toString(), e.message);
            }

            items.push({
                _id: est._id,
                firstName: est.firstName,
                lastName: est.lastName,
                dni: est.dni || '',
                nivel: est.nivel || '',
                attendance,
                promedio // Promedio de calificaciones (0-10) o null si no tiene
            });
        }

        const total = items.length;
        const averageAttendance = total > 0
            ? parseFloat((items.reduce((sum, s) => sum + (s.attendance || 0), 0) / total).toFixed(1))
            : 0;
        
        // Calcular promedio de calificaciones (solo estudiantes con notas)
        const estudiantesConNotas = items.filter(s => s.promedio !== null && s.promedio !== undefined);
        const averageGrade = estudiantesConNotas.length > 0
            ? parseFloat((estudiantesConNotas.reduce((sum, s) => sum + (s.promedio || 0), 0) / estudiantesConNotas.length).toFixed(1))
            : null;

        return {
            total,
            averageAttendance,
            averageGrade, // Promedio de calificaciones (0-10) o null si no hay estudiantes con notas
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
        console.log(`[generarReportesAutomaticosCurso] Iniciando para curso: ${cursoId}`);
        const estudiantes = await cursosService.getEstudiantesCurso(cursoId);
        
        console.log(`[generarReportesAutomaticosCurso] Estudiantes encontrados: ${estudiantes?.length || 0}`);
        
        if (!estudiantes || estudiantes.length === 0) {
            throw new Error('No se encontraron estudiantes inscritos en este curso');
        }

        const reportesGenerados = [];
        const errores = [];
        
        for (let i = 0; i < estudiantes.length; i++) {
            const item = estudiantes[i];
            console.log(`[generarReportesAutomaticosCurso] Procesando estudiante ${i + 1}/${estudiantes.length}:`, {
                tieneEstudiante: !!item.estudiante,
                estudianteType: typeof item.estudiante,
                estudianteIsObject: item.estudiante && typeof item.estudiante === 'object',
                tieneId: !!(item.estudiante?._id || item.estudiante)
            });
            
            // getEstudiantesCurso devuelve { estudiante: ..., ... }
            // El estudiante puede ser un objeto populado o un ID
            const estudianteId = item.estudiante?._id || item.estudiante;
            
            if (!estudianteId) {
                const errorMsg = `Estudiante sin ID válido en posición ${i + 1}`;
                console.warn(`[generarReportesAutomaticosCurso] ${errorMsg}:`, item);
                errores.push(errorMsg);
                continue; // Saltar este estudiante y continuar con el siguiente
            }
            
            const estudianteIdStr = estudianteId.toString();
            console.log(`[generarReportesAutomaticosCurso] Intentando generar reporte para estudiante: ${estudianteIdStr}`);
            
            try {
                const reporte = await exports.generarReporteAcademico({
                    estudianteId: estudianteIdStr,
                    cursoId,
                    periodo: generarPeriodoActual(),
                    generadoPorId
                });
                console.log(`[generarReportesAutomaticosCurso] Reporte generado exitosamente para estudiante: ${estudianteIdStr}`);
                reportesGenerados.push(reporte);
            } catch (error) {
                const errorMsg = `Error generando reporte para estudiante ${estudianteIdStr}: ${error.message}`;
                console.error(`[generarReportesAutomaticosCurso] ${errorMsg}`);
                errores.push(errorMsg);
                // Continuar con el siguiente estudiante en lugar de fallar todo
            }
        }
    
        console.log(`[generarReportesAutomaticosCurso] Resultado: ${reportesGenerados.length} reportes generados, ${errores.length} errores`);
        
        if (reportesGenerados.length === 0) {
            const mensajeError = errores.length > 0 
                ? `No se pudo generar ningún reporte. Errores: ${errores.join('; ')}`
                : 'No se pudo generar ningún reporte. Verifique que los estudiantes del curso existan y sean válidos.';
            throw new Error(mensajeError);
        }
    
        return reportesGenerados;
    } catch (error) {
        console.error(`[generarReportesAutomaticosCurso] Error general:`, error);
        throw new Error(`Error al generar reportes automáticos: ${error.message}`);
    }
};

module.exports = exports;