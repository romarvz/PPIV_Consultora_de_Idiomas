import { profesores, estudiantes, clases, cobros} from "../../services/financial/mockData";

/**
 * CU-PAG-01: Calcula la liquidación a un profesor en un rango de fechas.
 * @param {string} profesorId - ID del profesor.
 * @param {Date} fechaInicio - Inicio del período de liquidación.
 * @param {Date} fechaFin - Fin del período de liquidación.
 * @returns {object} Resumen del pago (horas, monto, clases a liquidar).
 */
export function calcularLiquidacion(profesorId, fechaInicio, fechaFin) {
  // 1. Obtener el perfil del profesor y verificar la tarifa.
  const profesor = profesores.find(p => p.id === profesorId);
  
  // Validaciones (simuladas)
  if (!profesor) {
    throw new Error('Profesor no encontrado.');
  }
  
  // Criterio de aceptación A2 - Profesor sin tarifa configurada
  if (!profesor.tarifaPorHora) {
    throw new Error('El profesor no tiene una tarifa por hora configurada.'); 
  }

  const { tarifaPorHora } = profesor;
  const fechaInicioTS = new Date(fechaInicio).getTime();
  const fechaFinTS = new Date(fechaFin).getTime();

  // 2. Filtrar y sumar las horas trabajadas.
  let totalMinutos = 0;
  const clasesPendientes = [];

  for (const clase of clases) {
    const claseFechaTS = new Date(clase.fecha).getTime();
    
    // Filtramos por: 1) Profesor; 2) Rango de Fechas; 3) Estado 'Completada'; 4) No pagada.
    if (
      clase.profesorId === profesorId &&
      claseFechaTS >= fechaInicioTS &&
      claseFechaTS <= fechaFinTS &&
      clase.estado === 'Completada' &&
      clase.pagada === false
    ) {
      totalMinutos += clase.duracionMinutos;
      clasesPendientes.push(clase.id);
    }
  }

  // Criterio de aceptación A1 - Sin clases registradas en el período.
  if (totalMinutos === 0) {
    return { 
      totalHoras: 0, 
      montoBruto: 0, 
      mensaje: 'No se encontraron horas trabajadas para el periodo seleccionado.', 
      clasesLiquidadas: [] 
    };
  }

  // 3. Calcular el monto total (Monto bruto = Horas * Tarifa)
  const totalHoras = totalMinutos / 60;
  const montoBruto = totalHoras * tarifaPorHora;

  // 4. Retornar el resumen (Simula el paso 5 del Flujo Principal)
  return {
    profesorId: profesorId,
    totalHoras: totalHoras,
    tarifa: tarifaPorHora,
    montoBruto: montoBruto,
    clasesLiquidadas: clasesPendientes,
  };
}

/**
 * Simula el registro final del pago (Paso 9 del Flujo Principal)
 * En un sistema real, esto crearía un registro en la tabla 'Pagos' y marcaría las clases como 'pagadas'.
 */
export function registrarPago(liquidacionData) {
    // Simulación de marcar las clases como pagadas para evitar dobles pagos
    liquidacionData.clasesLiquidadas.forEach(claseId => {
        const claseIndex = clases.findIndex(c => c.id === claseId);
        if (claseIndex !== -1) {
            clases[claseIndex].pagada = true;
        }
    });

    // Simulación de guardar el registro del pago y el comprobante digital
    const pago = {
        id: Date.now(),
        ...liquidacionData,
        fechaPago: new Date().toISOString(),
        estado: 'Pagado',
    };
    
    // Aquí iría la lógica para guardar en la base de datos.
    console.log(`Pago registrado con éxito. ID de pago: ${pago.id}`);
    
    return pago;
}
