
// ==================== ESTUDIANTES ====================
export const mockStudents = [
  {
    _id: 'mock-student-1',
    firstName: 'Juan',
    lastName: 'Pérez',
    email: 'juan.perez@email.com',
    dni: '12345678',
    phone: '+54911234567',
    nivel: 'B1',
    condicion: 'activo',
    estadoAcademico: 'en_curso',
    isActive: true,
    createdAt: '2025-09-15T10:00:00Z'
  },
  {
    _id: 'mock-student-2',
    firstName: 'María',
    lastName: 'González',
    email: 'maria.gonzalez@email.com',
    dni: '87654321',
    phone: '+54911234568',
    nivel: 'A2',
    condicion: 'activo',
    estadoAcademico: 'inscrito',
    isActive: true,
    createdAt: '2025-10-01T10:00:00Z'
  },
  {
    _id: 'mock-student-3',
    firstName: 'Carlos',
    lastName: 'Fernández',
    email: 'carlos.fernandez@email.com',
    dni: '11223344',
    phone: '+54911234569',
    nivel: 'C1',
    condicion: 'activo',
    estadoAcademico: 'en_curso',
    isActive: true,
    createdAt: '2025-08-20T10:00:00Z'
  },
  {
    _id: 'mock-student-4',
    firstName: 'Ana',
    lastName: 'Martínez',
    email: 'ana.martinez@email.com',
    dni: '55667788',
    phone: '+54911234570',
    nivel: 'B2',
    condicion: 'activo',
    estadoAcademico: 'en_curso',
    isActive: true,
    createdAt: '2025-07-10T10:00:00Z'
  },
  {
    _id: 'mock-student-5',
    firstName: 'Luis',
    lastName: 'Rodríguez',
    email: 'luis.rodriguez@email.com',
    dni: '99887766',
    phone: '+54911234571',
    nivel: 'A1',
    condicion: 'activo',
    estadoAcademico: 'inscrito',
    isActive: true,
    createdAt: '2025-10-05T10:00:00Z'
  },
  {
    _id: 'mock-student-6',
    firstName: 'Laura',
    lastName: 'Sánchez',
    email: 'laura.sanchez@email.com',
    dni: '44556677',
    phone: '+54911234572',
    nivel: 'B1',
    condicion: 'graduado',
    estadoAcademico: 'graduado',
    isActive: false,
    createdAt: '2024-03-15T10:00:00Z'
  },
  {
    _id: 'mock-student-7',
    firstName: 'Diego',
    lastName: 'Torres',
    email: 'diego.torres@email.com',
    dni: '33445566',
    phone: '+54911234573',
    nivel: 'A2',
    condicion: 'activo',
    estadoAcademico: 'en_curso',
    isActive: true,
    createdAt: '2025-09-01T10:00:00Z'
  },
  {
    _id: 'mock-student-8',
    firstName: 'Sofía',
    lastName: 'Ramírez',
    email: 'sofia.ramirez@email.com',
    dni: '22334455',
    phone: '+54911234574',
    nivel: 'C2',
    condicion: 'activo',
    estadoAcademico: 'en_curso',
    isActive: true,
    createdAt: '2025-06-12T10:00:00Z'
  },
  {
    _id: 'mock-student-9',
    firstName: 'Martín',
    lastName: 'López',
    email: 'martin.lopez@email.com',
    dni: '66778899',
    phone: '+54911234575',
    nivel: 'B2',
    condicion: 'inactivo',
    estadoAcademico: 'suspendido',
    isActive: false,
    createdAt: '2025-05-20T10:00:00Z'
  },
  {
    _id: 'mock-student-10',
    firstName: 'Valentina',
    lastName: 'Castro',
    email: 'valentina.castro@email.com',
    dni: '77889900',
    phone: '+54911234576',
    nivel: 'A1',
    condicion: 'activo',
    estadoAcademico: 'inscrito',
    isActive: true,
    createdAt: '2025-10-08T10:00:00Z'
  }
]

// ==================== PROFESORES ====================
export const mockTeachers = [
  {
    _id: 'mock-teacher-1',
    firstName: 'Carlos',
    lastName: 'Rodríguez',
    email: 'carlos.rodriguez@lingua.com',
    dni: '11223344',
    phone: '+54911234569',
    especialidades: [
      { _id: 'lang-1', name: 'Inglés' },
      { _id: 'lang-2', name: 'Francés' }
    ],
    condicion: 'activo',
    tarifaPorHora: 2500,
    isActive: true,
    horarios: [
      { dia: 'lunes', horaInicio: '09:00', horaFin: '12:00' },
      { dia: 'miercoles', horaInicio: '14:00', horaFin: '18:00' },
      { dia: 'viernes', horaInicio: '09:00', horaFin: '13:00' }
    ],
    createdAt: '2025-01-15T10:00:00Z'
  },
  {
    _id: 'mock-teacher-2',
    firstName: 'Patricia',
    lastName: 'Gómez',
    email: 'patricia.gomez@lingua.com',
    dni: '55667788',
    phone: '+54911234577',
    especialidades: [
      { _id: 'lang-1', name: 'Inglés' },
      { _id: 'lang-4', name: 'Italiano' }
    ],
    condicion: 'activo',
    tarifaPorHora: 2800,
    isActive: true,
    horarios: [
      { dia: 'martes', horaInicio: '10:00', horaFin: '14:00' },
      { dia: 'jueves', horaInicio: '15:00', horaFin: '19:00' }
    ],
    createdAt: '2025-02-20T10:00:00Z'
  },
  {
    _id: 'mock-teacher-3',
    firstName: 'Roberto',
    lastName: 'Silva',
    email: 'roberto.silva@lingua.com',
    dni: '99887766',
    phone: '+54911234578',
    especialidades: [
      { _id: 'lang-3', name: 'Alemán' },
      { _id: 'lang-1', name: 'Inglés' }
    ],
    condicion: 'activo',
    tarifaPorHora: 3000,
    isActive: true,
    horarios: [
      { dia: 'lunes', horaInicio: '14:00', horaFin: '18:00' },
      { dia: 'miercoles', horaInicio: '09:00', horaFin: '13:00' }
    ],
    createdAt: '2025-03-10T10:00:00Z'
  },
  {
    _id: 'mock-teacher-4',
    firstName: 'Elena',
    lastName: 'Morales',
    email: 'elena.morales@lingua.com',
    dni: '44556677',
    phone: '+54911234579',
    especialidades: [
      { _id: 'lang-5', name: 'Portugués' }
    ],
    condicion: 'activo',
    tarifaPorHora: 2600,
    isActive: true,
    horarios: [
      { dia: 'martes', horaInicio: '09:00', horaFin: '12:00' },
      { dia: 'jueves', horaInicio: '10:00', horaFin: '14:00' }
    ],
    createdAt: '2025-04-05T10:00:00Z'
  },
  {
    _id: 'mock-teacher-5',
    firstName: 'Miguel',
    lastName: 'Herrera',
    email: 'miguel.herrera@lingua.com',
    dni: '33445566',
    phone: '+54911234580',
    especialidades: [
      { _id: 'lang-2', name: 'Francés' }
    ],
    condicion: 'inactivo',
    tarifaPorHora: 2400,
    isActive: false,
    horarios: [],
    createdAt: '2024-12-01T10:00:00Z'
  }
]

// ==================== CLASES ====================
export const mockClasses = [
  {
    _id: 'mock-class-1',
    studentId: 'mock-student-1',
    studentName: 'Juan Pérez',
    teacherId: 'mock-teacher-1',
    teacherName: 'Carlos Rodríguez',
    subject: 'Inglés',
    nivel: 'B1',
    date: '2025-10-15',
    time: '10:00',
    duration: 60,
    status: 'completada',
    createdAt: '2025-10-01T10:00:00Z'
  },
  {
    _id: 'mock-class-2',
    studentId: 'mock-student-2',
    studentName: 'María González',
    teacherId: 'mock-teacher-1',
    teacherName: 'Carlos Rodríguez',
    subject: 'Inglés',
    nivel: 'A2',
    date: '2025-10-16',
    time: '14:00',
    duration: 90,
    status: 'programada',
    createdAt: '2025-10-02T10:00:00Z'
  },
  {
    _id: 'mock-class-3',
    studentId: 'mock-student-3',
    studentName: 'Carlos Fernández',
    teacherId: 'mock-teacher-2',
    teacherName: 'Patricia Gómez',
    subject: 'Inglés',
    nivel: 'C1',
    date: '2025-10-17',
    time: '10:00',
    duration: 60,
    status: 'programada',
    createdAt: '2025-10-03T10:00:00Z'
  },
  {
    _id: 'mock-class-4',
    studentId: 'mock-student-4',
    studentName: 'Ana Martínez',
    teacherId: 'mock-teacher-3',
    teacherName: 'Roberto Silva',
    subject: 'Alemán',
    nivel: 'B2',
    date: '2025-10-18',
    time: '15:00',
    duration: 60,
    status: 'programada',
    createdAt: '2025-10-04T10:00:00Z'
  },
  {
    _id: 'mock-class-5',
    studentId: 'mock-student-5',
    studentName: 'Luis Rodríguez',
    teacherId: 'mock-teacher-1',
    teacherName: 'Carlos Rodríguez',
    subject: 'Inglés',
    nivel: 'A1',
    date: '2025-10-19',
    time: '09:00',
    duration: 60,
    status: 'programada',
    createdAt: '2025-10-05T10:00:00Z'
  },
  {
    _id: 'mock-class-6',
    studentId: 'mock-student-1',
    studentName: 'Juan Pérez',
    teacherId: 'mock-teacher-1',
    teacherName: 'Carlos Rodríguez',
    subject: 'Inglés',
    nivel: 'B1',
    date: '2025-10-08',
    time: '10:00',
    duration: 60,
    status: 'completada',
    createdAt: '2025-09-25T10:00:00Z'
  },
  {
    _id: 'mock-class-7',
    studentId: 'mock-student-7',
    studentName: 'Diego Torres',
    teacherId: 'mock-teacher-2',
    teacherName: 'Patricia Gómez',
    subject: 'Italiano',
    nivel: 'A2',
    date: '2025-10-20',
    time: '11:00',
    duration: 90,
    status: 'programada',
    createdAt: '2025-10-06T10:00:00Z'
  },
  {
    _id: 'mock-class-8',
    studentId: 'mock-student-8',
    studentName: 'Sofía Ramírez',
    teacherId: 'mock-teacher-1',
    teacherName: 'Carlos Rodríguez',
    subject: 'Francés',
    nivel: 'C2',
    date: '2025-10-21',
    time: '16:00',
    duration: 60,
    status: 'programada',
    createdAt: '2025-10-07T10:00:00Z'
  },
  {
    _id: 'mock-class-9',
    studentId: 'mock-student-3',
    studentName: 'Carlos Fernández',
    teacherId: 'mock-teacher-3',
    teacherName: 'Roberto Silva',
    subject: 'Inglés',
    nivel: 'C1',
    date: '2025-10-05',
    time: '14:00',
    duration: 60,
    status: 'cancelada',
    createdAt: '2025-09-28T10:00:00Z'
  },
  {
    _id: 'mock-class-10',
    studentId: 'mock-student-10',
    studentName: 'Valentina Castro',
    teacherId: 'mock-teacher-4',
    teacherName: 'Elena Morales',
    subject: 'Portugués',
    nivel: 'A1',
    date: '2025-10-22',
    time: '10:00',
    duration: 60,
    status: 'programada',
    createdAt: '2025-10-08T10:00:00Z'
  }
]

// ==================== CURSOS (PLANTILLAS) ====================
export const mockCourses = [
  {
    _id: 'course-1',
    name: 'Inglés Conversacional',
    description: 'Cursos de inglés adaptados a todos los niveles (A1 a C2). Enfocados en la fluidez y la comunicación práctica para el día a día.',
    language: 'Inglés',
    level: 'Multi-nivel',
    teacherId: 'mock-teacher-1',
    scheduleText: 'Horarios flexibles por la mañana y tarde.',
    price: 25000,
    currency: 'ARS',
    isActive: true,
    imageUrl: 'https://a.travel-assets.com/findyours-php/viewfinder/images/res70/166000/166870-Tower-Bridge.jpg?q=80&w=2070&auto=format&fit=crop'
  },
  {
    _id: 'course-2',
    name: 'Alemán Intermedio B2',
    description: 'Perfecciona tu alemán con nuestro curso de nivel B2. Ideal para quienes ya tienen una base y buscan consolidar su gramática y vocabulario avanzado.',
    language: 'Alemán',
    level: 'B2',
    teacherId: 'mock-teacher-3',
    scheduleText: 'Viernes - 15:00hs',
    price: 32000,
    currency: 'ARS',
    isActive: true,
    imageUrl: 'https://aunclicdelaaventura.com/wp-content/uploads/2018/02/Castillo-de-Neuschwanstein.jpg?q=80&w=1964&auto=format&fit=crop'
  },
  {
    _id: 'course-3',
    name: 'Italiano para Principiantes',
    description: 'Iníciate en el idioma italiano. Nuestro curso de nivel A2 te dará las herramientas básicas para presentarte, hacer preguntas y entender conversaciones sencillas.',
    language: 'Italiano',
    level: 'A2',
    teacherId: 'mock-teacher-2',
    scheduleText: 'Martes - 11:00hs',
    price: 22000,
    currency: 'ARS',
    isActive: true,
    imageUrl: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?q=80&w=1996&auto=format&fit=crop'
  },
  {
    _id: 'course-4',
    name: 'Francés Avanzado C2',
    description: 'Curso de perfeccionamiento para alcanzar la maestría en el idioma francés. Análisis de textos complejos, debate y producción de discursos a nivel nativo.',
    language: 'Francés',
    level: 'C2',
    teacherId: 'mock-teacher-1',
    scheduleText: 'Miércoles - 16:00hs',
    price: 38000,
    currency: 'ARS',
    isActive: true,
    imageUrl: 'https://www.civitatis.com/f/francia/paris/subida-torre-eiffel-589x392.jpg?q=80&w=1974&auto=format&fit=crop'
  },
  {
    _id: 'course-5',
    name: 'Portugués desde Cero',
    description: 'Aprende portugués desde la base con nuestro curso de nivel A1. Ideal para planificar tu próximo viaje a Brasil o Portugal.',
    language: 'Portugués',
    level: 'A1',
    teacherId: 'mock-teacher-4',
    scheduleText: 'Jueves - 10:00hs',
    price: 20000,
    currency: 'ARS',
    isActive: true,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Redentor_Over_Clouds_1.jpg/640px-Redentor_Over_Clouds_1.jpg?q=80&w=2071&auto=format&fit=crop'
  }
];
// ==================== PAGOS ====================
export const mockPayments = [
  {
    _id: 'mock-payment-1',
    studentId: 'mock-student-1',
    studentName: 'Juan Pérez',
    amount: 5000,
    concept: 'Mensualidad Octubre 2025',
    date: '2025-10-01',
    dueDate: '2025-10-05',
    status: 'pagado',
    paymentMethod: 'transferencia',
    createdAt: '2025-10-01T10:00:00Z'
  },
  {
    _id: 'mock-payment-2',
    studentId: 'mock-student-2',
    studentName: 'María González',
    amount: 4500,
    concept: 'Mensualidad Octubre 2025',
    date: '2025-10-05',
    dueDate: '2025-10-10',
    status: 'pendiente',
    paymentMethod: null,
    createdAt: '2025-10-01T10:00:00Z'
  },
  {
    _id: 'mock-payment-3',
    studentId: 'mock-student-3',
    studentName: 'Carlos Fernández',
    amount: 6000,
    concept: 'Mensualidad Octubre 2025',
    date: '2025-10-02',
    dueDate: '2025-10-06',
    status: 'pagado',
    paymentMethod: 'efectivo',
    createdAt: '2025-10-02T10:00:00Z'
  },
  {
    _id: 'mock-payment-4',
    studentId: 'mock-student-4',
    studentName: 'Ana Martínez',
    amount: 5500,
    concept: 'Mensualidad Octubre 2025',
    date: '2025-10-03',
    dueDate: '2025-10-08',
    status: 'pagado',
    paymentMethod: 'tarjeta',
    createdAt: '2025-10-03T10:00:00Z'
  },
  {
    _id: 'mock-payment-5',
    studentId: 'mock-student-5',
    studentName: 'Luis Rodríguez',
    amount: 4000,
    concept: 'Mensualidad Octubre 2025',
    date: '2025-10-05',
    dueDate: '2025-10-12',
    status: 'pendiente',
    paymentMethod: null,
    createdAt: '2025-10-05T10:00:00Z'
  },
  {
    _id: 'mock-payment-6',
    studentId: 'mock-student-7',
    studentName: 'Diego Torres',
    amount: 4800,
    concept: 'Mensualidad Octubre 2025',
    date: '2025-10-04',
    dueDate: '2025-10-09',
    status: 'pagado',
    paymentMethod: 'transferencia',
    createdAt: '2025-10-04T10:00:00Z'
  },
  {
    _id: 'mock-payment-7',
    studentId: 'mock-student-8',
    studentName: 'Sofía Ramírez',
    amount: 7000,
    concept: 'Mensualidad Octubre 2025',
    date: '2025-10-06',
    dueDate: '2025-10-11',
    status: 'vencido',
    paymentMethod: null,
    createdAt: '2025-10-01T10:00:00Z'
  },
  {
    _id: 'mock-payment-8',
    studentId: 'mock-student-10',
    studentName: 'Valentina Castro',
    amount: 4200,
    concept: 'Mensualidad Octubre 2025',
    date: '2025-10-08',
    dueDate: '2025-10-13',
    status: 'pendiente',
    paymentMethod: null,
    createdAt: '2025-10-08T10:00:00Z'
  },
  {
    _id: 'mock-payment-9',
    studentId: 'mock-student-1',
    studentName: 'Juan Pérez',
    amount: 5000,
    concept: 'Mensualidad Septiembre 2025',
    date: '2025-09-01',
    dueDate: '2025-09-05',
    status: 'pagado',
    paymentMethod: 'transferencia',
    createdAt: '2025-09-01T10:00:00Z'
  },
  {
    _id: 'mock-payment-10',
    studentId: 'mock-student-3',
    studentName: 'Carlos Fernández',
    amount: 6000,
    concept: 'Mensualidad Septiembre 2025',
    date: '2025-09-02',
    dueDate: '2025-09-06',
    status: 'pagado',
    paymentMethod: 'efectivo',
    createdAt: '2025-09-02T10:00:00Z'
  }
]

// ==================== IDIOMAS ====================
export const mockLanguages = [
  { 
    _id: 'lang-1', 
    name: 'Inglés', 
    code: 'en', 
    isActive: true,
    description: 'Idioma internacional más hablado'
  },
  { 
    _id: 'lang-2', 
    name: 'Francés', 
    code: 'fr', 
    isActive: true,
    description: 'Idioma romance ampliamente utilizado'
  },
  { 
    _id: 'lang-3', 
    name: 'Alemán', 
    code: 'de', 
    isActive: true,
    description: 'Idioma germánico, clave en Europa'
  },
  { 
    _id: 'lang-4', 
    name: 'Italiano', 
    code: 'it', 
    isActive: true,
    description: 'Idioma romance, lengua de la cultura'
  },
  { 
    _id: 'lang-5', 
    name: 'Portugués', 
    code: 'pt', 
    isActive: true,
    description: 'Idioma lusófono, importante en Latinoamérica'
  }
]

// ==================== EMPRESAS (para CompanyDashboard) ====================
export const mockCompanies = [
  {
    _id: 'mock-company-1',
    name: 'Tech Solutions SA',
    cuit: '30-12345678-9',
    email: 'contacto@techsolutions.com',
    phone: '+54911555000',
    address: 'Av. Corrientes 1234, CABA',
    employees: [
      {
        _id: 'mock-emp-1',
        studentId: 'mock-student-1',
        firstName: 'Juan',
        lastName: 'Pérez',
        email: 'juan.perez@techsolutions.com',
        nivel: 'B1',
        status: 'activo'
      },
      {
        _id: 'mock-emp-2',
        studentId: 'mock-student-3',
        firstName: 'Carlos',
        lastName: 'Fernández',
        email: 'carlos.fernandez@techsolutions.com',
        nivel: 'C1',
        status: 'activo'
      }
    ],
    isActive: true,
    createdAt: '2025-06-15T10:00:00Z'
  }
]