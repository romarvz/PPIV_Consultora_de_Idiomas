const PerfilEstudiante = require('../models/PerfilEstudiante');
const { BaseUser } = require('../models');

/**
 * SERVICE: perfilesService
 * PROPÓSITO: Lógica de negocio para gestión de perfiles de estudiantes
 * 
 * Este servicio maneja:
 * - Creación y obtención de perfiles
 * - Actualización de preferencias
 * - Gestión de certificados
 * - Cálculo de estadísticas
 * - Historial académico
 */

// ============================================
// SECCIÓN 1: OBTENER PERFILES
// ============================================

/**
 * Obtiene el perfil completo de un estudiante con todas las relaciones
 */
exports.obtenerPerfilCompleto = async (estudianteId) => {
    try {
        const perfil = await PerfilEstudiante.obtenerPerfilCompleto(estudianteId);

        if (!perfil) {
            return null;
        }

        return perfil;
    } catch (error) {
        throw new Error(`Error al obtener perfil: ${error.message}`);
    }
};

/**
 * Crea o inicializa un perfil para un estudiante
 */
exports.crearPerfil = async (estudianteId) => {
    try {
        // Verificar que el estudiante existe
        const estudiante = await BaseUser.findById(estudianteId);
        if (!estudiante || estudiante.__t !== 'estudiante') {
            throw new Error('Estudiante no encontrado');
        }

        // Verificar si ya tiene perfil
        const perfilExistente = await PerfilEstudiante.findOne({ usuario: estudianteId });
        if (perfilExistente) {
            return perfilExistente;
        }

        // Crear perfil nuevo
        const nuevoPerfil = new PerfilEstudiante({
            usuario: estudianteId,
            cursosActivos: [],
            historialCursos: [],
            certificados: [],
            preferencias: {
                horarios: [],
                modalidad: 'presencial',
                idiomasInteres: []
            },
            estadisticas: {
                horasTotales: 0,
                asistenciaPromedio: 0,
                cursosCompletados: 0,
                promedioCalificaciones: 0
            }
        });

        await nuevoPerfil.save();
        return nuevoPerfil;
    } catch (error) {
        throw new Error(`Error al crear perfil: ${error.message}`);
    }
};

// ============================================
// SECCIÓN 2: PREFERENCIAS
// ============================================

/**
 * Obtiene solo las preferencias del estudiante
 */
exports.obtenerPreferencias = async (estudianteId) => {
    try {
        const perfil = await PerfilEstudiante.findOne({ usuario: estudianteId })
            .select('preferencias');

        if (!perfil) {
            return null;
        }

        return perfil.preferencias;
    } catch (error) {
        throw new Error(`Error al obtener preferencias: ${error.message}`);
    }
};

/**
 * Actualiza las preferencias del estudiante
 */
exports.actualizarPreferencias = async (estudianteId, nuevasPreferencias) => {
    try {
        const perfil = await PerfilEstudiante.findOne({ usuario: estudianteId });

        if (!perfil) {
            throw new Error('Perfil no encontrado');
        }

        // Actualizar solo los campos proporcionados
        if (nuevasPreferencias.horarios) {
            perfil.preferencias.horarios = nuevasPreferencias.horarios;
        }

        if (nuevasPreferencias.modalidad) {
            perfil.preferencias.modalidad = nuevasPreferencias.modalidad;
        }

        if (nuevasPreferencias.idiomasInteres) {
            perfil.preferencias.idiomasInteres = nuevasPreferencias.idiomasInteres;
        }

        await perfil.save();
        return perfil.preferencias;
    } catch (error) {
        throw new Error(`Error al actualizar preferencias: ${error.message}`);
    }
};

// ============================================
// SECCIÓN 3: CERTIFICADOS
// ============================================

/**
 * Obtiene todos los certificados del estudiante
 */
exports.obtenerCertificados = async (estudianteId) => {
    try {
        const perfil = await PerfilEstudiante.findOne({ usuario: estudianteId })
            .select('certificados')
            .populate('certificados.curso', 'nombre idioma nivel');

        if (!perfil) {
            return [];
        }

        return perfil.certificados;
    } catch (error) {
        throw new Error(`Error al obtener certificados: ${error.message}`);
    }
};

/**
 * Genera un código único de verificación para certificado
 */
const generarCodigoVerificacion = () => {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `CERT-${timestamp}-${random}`.toUpperCase();
};

/**
 * Agrega un nuevo certificado al estudiante
 */
exports.agregarCertificado = async (estudianteId, datosCertificado) => {
    try {
        const perfil = await PerfilEstudiante.findOne({ usuario: estudianteId });

        if (!perfil) {
            throw new Error('Perfil no encontrado');
        }

        const certificado = {
            curso: datosCertificado.cursoId,
            idioma: datosCertificado.idioma,
            nivel: datosCertificado.nivel,
            fechaEmision: new Date(),
            codigoVerificacion: generarCodigoVerificacion()
        };

        perfil.certificados.push(certificado);
        await perfil.save();

        return certificado;
    } catch (error) {
        throw new Error(`Error al agregar certificado: ${error.message}`);
    }
};

/**
 * Verifica un certificado por su código
 */
exports.verificarCertificado = async (codigoVerificacion) => {
    try {
        const perfil = await PerfilEstudiante.findOne({
            'certificados.codigoVerificacion': codigoVerificacion
        })
            .populate('usuario', 'firstName lastName email')
            .populate('certificados.curso', 'nombre idioma nivel');

        if (!perfil) {
            return null;
        }

        // Encontrar el certificado específico
        const certificado = perfil.certificados.find(
            cert => cert.codigoVerificacion === codigoVerificacion
        );

        return {
            valido: true,
            estudiante: {
                nombre: `${perfil.usuario.firstName} ${perfil.usuario.lastName}`,
                email: perfil.usuario.email
            },
            certificado: {
                curso: certificado.curso.nombre,
                idioma: certificado.idioma,
                nivel: certificado.nivel,
                fechaEmision: certificado.fechaEmision,
                codigoVerificacion: certificado.codigoVerificacion
            }
        };
    } catch (error) {
        throw new Error(`Error al verificar certificado: ${error.message}`);
    }
};

// ============================================
// SECCIÓN 4: ESTADÍSTICAS
// ============================================

/**
 * Obtiene las estadísticas del estudiante
 */
exports.obtenerEstadisticas = async (estudianteId) => {
    try {
        const perfil = await PerfilEstudiante.findOne({ usuario: estudianteId })
            .select('estadisticas');

        if (!perfil) {
            return null;
        }

        return perfil.estadisticas;
    } catch (error) {
        throw new Error(`Error al obtener estadísticas: ${error.message}`);
    }
};

/**
 * Actualiza las estadísticas del estudiante (recalcula todo)
 */
exports.actualizarEstadisticas = async (estudianteId) => {
    try {
        const perfil = await PerfilEstudiante.findOne({ usuario: estudianteId });

        if (!perfil) {
            throw new Error('Perfil no encontrado');
        }

        // Usar el método del modelo para recalcular
        await perfil.actualizarEstadisticas();

        return perfil.estadisticas;
    } catch (error) {
        throw new Error(`Error al actualizar estadísticas: ${error.message}`);
    }
};

// ============================================
// SECCIÓN 5: HISTORIAL DE CURSOS
// ============================================

/**
 * Obtiene el historial completo de cursos
 */
exports.obtenerHistorialCursos = async (estudianteId) => {
    try {
        const perfil = await PerfilEstudiante.findOne({ usuario: estudianteId })
            .select('historialCursos')
            .populate('historialCursos.curso', 'nombre idioma nivel duracionTotal');

        if (!perfil) {
            return [];
        }

        return perfil.historialCursos;
    } catch (error) {
        throw new Error(`Error al obtener historial: ${error.message}`);
    }
};

/**
 * Agrega un curso al historial cuando el estudiante lo completa
 */
exports.agregarCursoHistorial = async (estudianteId, datosCurso) => {
    try {
        const perfil = await PerfilEstudiante.findOne({ usuario: estudianteId });

        if (!perfil) {
            throw new Error('Perfil no encontrado');
        }

        const cursoHistorial = {
            curso: datosCurso.cursoId,
            fechaInicio: datosCurso.fechaInicio,
            fechaFin: datosCurso.fechaFin || new Date(),
            progreso: datosCurso.progreso || 100,
            calificacionFinal: datosCurso.calificacionFinal,
            estado: datosCurso.estado || 'aprobado'
        };

        perfil.historialCursos.push(cursoHistorial);

        // Remover de cursos activos si está ahí
        perfil.cursosActivos = perfil.cursosActivos.filter(
            cursoId => cursoId.toString() !== datosCurso.cursoId.toString()
        );

        await perfil.save();

        // Actualizar estadísticas automáticamente
        await perfil.actualizarEstadisticas();

        return cursoHistorial;
    } catch (error) {
        throw new Error(`Error al agregar curso al historial: ${error.message}`);
    }
};

/**
 * Agrega un curso a los cursos activos del estudiante
 */
exports.agregarCursoActivo = async (estudianteId, cursoId) => {
    try {
        const perfil = await PerfilEstudiante.findOne({ usuario: estudianteId });

        if (!perfil) {
            // Si no existe el perfil, crearlo
            const nuevoPerfil = await exports.crearPerfil(estudianteId);
            nuevoPerfil.cursosActivos.push(cursoId);
            await nuevoPerfil.save();
            return nuevoPerfil;
        }

        // Verificar que no esté ya en activos
        if (!perfil.cursosActivos.includes(cursoId)) {
            perfil.cursosActivos.push(cursoId);
            await perfil.save();
        }

        return perfil;
    } catch (error) {
        throw new Error(`Error al agregar curso activo: ${error.message}`);
    }
};

// ============================================
// SECCIÓN 6: PERFIL DE PROFESOR (Básico)
// ============================================

/**
 * Obtiene información pública del profesor
 */
exports.obtenerPerfilProfesor = async (profesorId) => {
    try {
        const profesor = await BaseUser.findById(profesorId)
            .select('firstName lastName email especialidades tarifa disponibilidad');

        if (!profesor || profesor.__t !== 'profesor') {
            return null;
        }

        return {
            id: profesor._id,
            nombre: `${profesor.firstName} ${profesor.lastName}`,
            email: profesor.email,
            especialidades: profesor.especialidades,
            tarifa: profesor.tarifa,
            disponibilidad: profesor.disponibilidad
        };
    } catch (error) {
        throw new Error(`Error al obtener perfil de profesor: ${error.message}`);
    }
};

module.exports = exports;