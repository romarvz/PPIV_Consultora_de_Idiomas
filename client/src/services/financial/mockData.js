// --- Modelo de Profesor ---
const profesores = [
  {
    id: 'prof001',
    nombre: 'Juan Pérez',
    tarifaPorHora: 3000, // Tarifa ficticia por hora
    horasPagadas: 0, 
  },
  {
    id: 'prof002',
    nombre: 'Ana Gómez',
    tarifaPorHora: 4500,
    horasPagadas: 0,
  },
];


//Modelo estudiantes
const estudiantes = [
    { 
        id: 'est001', 
        nombre: 'Luisa Fernández', 
        email: 'luisa.f@correo.com',
        userId: 'user_luisa' // Usado para autenticación
    },
    { 
        id: 'est002', 
        nombre: 'Roberto Soto', 
        email: 'roberto.s@correo.com',
        userId: 'user_roberto'
    },
];

//Modelo clases
const clases = [
  // Clases dictadas por Juan (prof001) en el período (Total: 210 min = 3.5 horas)
  { id: 101, profesorId: 'prof001', fecha: '2025-09-29', duracionMinutos: 60, estado: 'Completada', pagada: false },
  { id: 102, profesorId: 'prof001', fecha: '2025-09-30', duracionMinutos: 90, estado: 'Completada', pagada: false },
  { id: 103, profesorId: 'prof001', fecha: '2025-10-01', duracionMinutos: 60, estado: 'Completada', pagada: false },
  
  // Clases dictadas por Ana (prof002) (Total: 180 min = 3.0 horas)
  { id: 201, profesorId: 'prof002', fecha: '2025-09-28', duracionMinutos: 60, estado: 'Completada', pagada: false },
  { id: 202, profesorId: 'prof002', fecha: '2025-10-02', duracionMinutos: 120, estado: 'Completada', pagada: false },
  
  // Clases ya pagadas o no completadas (no deberían ser incluidas en el cálculo)
  { id: 300, profesorId: 'prof001', fecha: '2025-09-25', duracionMinutos: 60, estado: 'Completada', pagada: true },
  { id: 400, profesorId: 'prof001', fecha: '2025-10-03', duracionMinutos: 60, estado: 'Programada', pagada: false },
];

//Modelo cobros
const cobros = [
    { 
        id: 1001, 
        estudianteId: 'est001', 
        fecha: '2025-08-01', 
        monto: 15000, 
        estado: 'Pagado',
        concepto: 'Cuota Mensual Ago 2025'
    },
    { 
        id: 1002, 
        estudianteId: 'est001', 
        fecha: '2025-09-01', 
        monto: 15000, 
        estado: 'Pendiente', // Pago pendiente para Luisa
        vencimiento: '2025-10-07',
        concepto: 'Cuota Mensual Sep 2025'
    },
    { 
        id: 2001, 
        estudianteId: 'est002', 
        fecha: '2025-09-15', 
        monto: 8500, 
        estado: 'Pagado',
        concepto: 'Curso Conversación'
    },
    { 
        id: 2002, 
        estudianteId: 'est002', 
        fecha: '2025-10-06', 
        monto: 8500, 
        estado: 'Vencido', // Pago vencido para Roberto
        vencimiento: '2025-10-05',
        concepto: 'Taller de Gramática'
    },
];

export { profesores, estudiantes, clases, cobros };