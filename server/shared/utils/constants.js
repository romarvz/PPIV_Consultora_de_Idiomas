/**
 * System constants
 * Centralizes values use
 * 
 */
 
const ROLES = {
  ADMIN: 'admin',
  PROFESOR: 'profesor',
  ESTUDIANTE: 'estudiante'
}

const IDIOMAS = {
  INGLES: 'ingles',
  FRANCES: 'frances',
  ALEMAN: 'aleman',
  ITALIANO: 'italiano',
  PORTUGUES: 'portugues',
  ESPANOL: 'espanol'
}

const NIVELES = {
  A1: 'A1',
  A2: 'A2',
  B1: 'B1',
  B2: 'B2',
  C1: 'C1',
  C2: 'C2'
}

const ESTADOS_CLASE = {
  PROGRAMADA: 'programada',
  EN_CURSO: 'en_curso',
  COMPLETADA: 'completada',
  CANCELADA: 'cancelada'
}

const ESTADOS_PAGO = {
  PENDIENTE: 'pendiente',
  PAGADO: 'pagado',
  VENCIDO: 'vencido',
  CANCELADO: 'cancelado'
}

const METODOS_PAGO = {
  TRANSFERENCIA: 'transferencia',
  EFECTIVO: 'efectivo',
  TARJETA: 'tarjeta',
  MERCADOPAGO: 'mercadopago'
}

const TIPOS_EVENTO_AUDITORIA = {
  LOGIN: 'login',
  LOGOUT: 'logout',
  REGISTRO: 'registro',
  ACTUALIZACION: 'actualizacion',
  ELIMINACION: 'eliminacion',
  INSCRIPCION_CURSO: 'inscripcion_curso',
  PAGO_REGISTRADO: 'pago_registrado',
  CLASE_PROGRAMADA: 'clase_programada',
  ASISTENCIA_REGISTRADA: 'asistencia_registrada'
}

module.exports = {
  ROLES,
  IDIOMAS,
  NIVELES,
  ESTADOS_CLASE,
  ESTADOS_PAGO,
  METODOS_PAGO,
  TIPOS_EVENTO_AUDITORIA
}