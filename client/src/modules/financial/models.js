// Modelo de datos para profesores
export const profesores = [
  {
    id: 'prof001',
    nombre: 'Juan Pérez',
    tarifa: 3000, // Tarifa por hora en pesos
    horasTrabajadas: []
  },
  {
    id: 'prof002',
    nombre: 'María González',
    tarifa: 3500,
    horasTrabajadas: []
  },
  {
    id: 'prof003',
    nombre: 'Carlos Rodríguez',
    tarifa: 3200,
    horasTrabajadas: []
  }
];

// Modelo de registro de horas trabajadas
export const registroHoras = [
  {
    id: 'reg001',
    profesorId: 'prof001',
    fecha: '2025-09-27',
    horaInicio: '14:00',
    horaFin: '15:30',
    horas: 1.5,
    pagado: false
  },
  {
    id: 'reg002',
    profesorId: 'prof001',
    fecha: '2025-10-01',
    horaInicio: '10:00',
    horaFin: '12:00',
    horas: 2.0,
    pagado: false
  },
  {
    id: 'reg003',
    profesorId: 'prof002',
    fecha: '2025-10-02',
    horaInicio: '16:00',
    horaFin: '18:00',
    horas: 2.0,
    pagado: false
  }
];

// Modelo de pagos realizados
export const pagosRealizados = [];
