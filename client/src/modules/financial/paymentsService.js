import { profesores, registroHoras, pagosRealizados } from './models.js';

/**
 * CU-PAG-01: Calcular liquidación de un profesor
 * @param {string} profesorId - ID del profesor
 * @param {string} fechaInicio - Fecha inicio del período (YYYY-MM-DD)
 * @param {string} fechaFin - Fecha fin del período (YYYY-MM-DD)
 * @returns {Object} Liquidación con totalHoras, tarifa, montoBruto
 */
export function calcularLiquidacion(profesorId, fechaInicio, fechaFin) {
  // Buscar profesor
  const profesor = profesores.find(p => p.id === profesorId);
  if (!profesor) {
    throw new Error(`Profesor con ID ${profesorId} no encontrado`);
  }

  // Convertir fechas a objetos Date para comparación
  const inicio = new Date(fechaInicio);
  const fin = new Date(fechaFin);

  // Filtrar horas trabajadas en el período que no han sido pagadas
  const horasEnPeriodo = registroHoras.filter(registro => {
    const fechaRegistro = new Date(registro.fecha);
    return (
      registro.profesorId === profesorId &&
      fechaRegistro >= inicio &&
      fechaRegistro <= fin &&
      !registro.pagado
    );
  });

  // Calcular total de horas
  const totalHoras = horasEnPeriodo.reduce((sum, registro) => sum + registro.horas, 0);

  // Calcular monto bruto
  const montoBruto = totalHoras * profesor.tarifa;

  return {
    profesorId,
    profesorNombre: profesor.nombre,
    fechaInicio,
    fechaFin,
    totalHoras,
    tarifa: profesor.tarifa,
    montoBruto,
    registros: horasEnPeriodo
  };
}

/**
 * CU-PAG-02: Registrar pago de liquidación
 * @param {Object} liquidacion - Objeto de liquidación generado por calcularLiquidacion
 * @returns {Object} Registro del pago realizado
 */
export function registrarPago(liquidacion) {
  if (!liquidacion || liquidacion.montoBruto === 0) {
    throw new Error('No hay monto a pagar');
  }

  // Crear registro de pago
  const pago = {
    id: `pago${Date.now()}`,
    profesorId: liquidacion.profesorId,
    profesorNombre: liquidacion.profesorNombre,
    fechaPago: new Date().toISOString().split('T')[0],
    periodoInicio: liquidacion.fechaInicio,
    periodoFin: liquidacion.fechaFin,
    totalHoras: liquidacion.totalHoras,
    montoBruto: liquidacion.montoBruto,
    estado: 'pagado'
  };

  // Agregar a la lista de pagos
  pagosRealizados.push(pago);

  // Marcar los registros como pagados
  liquidacion.registros.forEach(registro => {
    const reg = registroHoras.find(r => r.id === registro.id);
    if (reg) {
      reg.pagado = true;
    }
  });

  return pago;
}

/**
 * Obtener historial de pagos de un profesor
 * @param {string} profesorId - ID del profesor
 * @returns {Array} Lista de pagos realizados
 */
export function obtenerHistorialPagos(profesorId) {
  return pagosRealizados.filter(pago => pago.profesorId === profesorId);
}

/**
 * Obtener todos los profesores
 * @returns {Array} Lista de profesores
 */
export function obtenerProfesores() {
  return profesores;
}

/**
 * Agregar registro de horas trabajadas
 * @param {Object} registro - Objeto con datos del registro
 * @returns {Object} Registro creado
 */
export function agregarRegistroHoras(registro) {
  const nuevoRegistro = {
    id: `reg${Date.now()}`,
    ...registro,
    pagado: false
  };
  registroHoras.push(nuevoRegistro);
  return nuevoRegistro;
}
