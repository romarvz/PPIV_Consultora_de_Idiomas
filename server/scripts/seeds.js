// scripts/seeds.js
// datos de prueba

require('dotenv').config();
const mongoose = require('mongoose');
const BaseUser = require('../models/BaseUser');
const Curso = require('../models/Curso');
const Inscripcion = require('../models/Inscripcion');
const Clase = require('../models/Clase');
const EventoCalendario = require('../models/EventoCalendario');

// Conectar a MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log(' MongoDB conectado');
  } catch (error) {
    console.error(' Error conectando a MongoDB:', error);
    process.exit(1);
  }
};

// Limpiar base de datos
const clearDB = async () => {
  try {
    await BaseUser.deleteMany({});
    await Curso.deleteMany({});
    await Inscripcion.deleteMany({});
    await Clase.deleteMany({});
    await EventoCalendario.deleteMany({});
    console.log(' Base de datos limpia');
  } catch (error) {
    console.error(' Error limpiando BD:', error);
  }
};

// Crear usuarios
const createUsers = async () => {
  console.log('\n Creando usuarios...');
  
  // Admin
  const admin = await BaseUser.create({
    firstName: 'Admin',
    lastName: 'Sistema',
    email: 'admin@consultora.com',
    password: 'admin123',
    role: 'admin',
    phone: '1234567890'
  });
  console.log(' Admin creado');

  // Profesores
  const profesores = await BaseUser.create([
    {
      firstName: 'María',
      lastName: 'García',
      email: 'maria.garcia@consultora.com',
      password: 'profesor123',
      role: 'profesor',
      dni: '20123456',
      phone: '1122334455'
    },
    {
      firstName: 'John',
      lastName: 'Smith',
      email: 'john.smith@consultora.com',
      password: 'profesor123',
      role: 'profesor',
      dni: '20234567',
      phone: '1122334466'
    },
    {
      firstName: 'Sophie',
      lastName: 'Martin',
      email: 'sophie.martin@consultora.com',
      password: 'profesor123',
      role: 'profesor',
      dni: '20345678',
      phone: '1122334477'
    }
  ]);
  console.log(` ${profesores.length} profesores creados`);

  // Estudiantes
  const estudiantes = await BaseUser.create([
    {
      firstName: 'Carlos',
      lastName: 'Rodríguez',
      email: 'carlos.rodriguez@email.com',
      password: 'estudiante123',
      role: 'estudiante',
      dni: '30123456',
      phone: '1155667788'
    },
    {
      firstName: 'Ana',
      lastName: 'Martínez',
      email: 'ana.martinez@email.com',
      password: 'estudiante123',
      role: 'estudiante',
      dni: '30234567',
      phone: '1155667799'
    },
    {
      firstName: 'Luis',
      lastName: 'Fernández',
      email: 'luis.fernandez@email.com',
      password: 'estudiante123',
      role: 'estudiante',
      dni: '30345678',
      phone: '1155668800'
    },
    {
      firstName: 'Laura',
      lastName: 'López',
      email: 'laura.lopez@email.com',
      password: 'estudiante123',
      role: 'estudiante',
      dni: '30456789',
      phone: '1155668811'
    },
    {
      firstName: 'Diego',
      lastName: 'González',
      email: 'diego.gonzalez@email.com',
      password: 'estudiante123',
      role: 'estudiante',
      dni: '30567890',
      phone: '1155668822'
    },
    {
      firstName: 'Sofía',
      lastName: 'Pérez',
      email: 'sofia.perez@email.com',
      password: 'estudiante123',
      role: 'estudiante',
      dni: '30678901',
      phone: '1155668833'
    },
    {
      firstName: 'Mateo',
      lastName: 'Sánchez',
      email: 'mateo.sanchez@email.com',
      password: 'estudiante123',
      role: 'estudiante',
      dni: '30789012',
      phone: '1155668844'
    },
    {
      firstName: 'Valentina',
      lastName: 'Ramírez',
      email: 'valentina.ramirez@email.com',
      password: 'estudiante123',
      role: 'estudiante',
      dni: '30890123',
      phone: '1155668855'
    },
    {
      firstName: 'Sebastián',
      lastName: 'Torres',
      email: 'sebastian.torres@email.com',
      password: 'estudiante123',
      role: 'estudiante',
      dni: '30901234',
      phone: '1155668866'
    },
    {
      firstName: 'Camila',
      lastName: 'Flores',
      email: 'camila.flores@email.com',
      password: 'estudiante123',
      role: 'estudiante',
      dni: '31012345',
      phone: '1155668877'
    }
  ]);
  console.log(` ${estudiantes.length} estudiantes creados`);

  return { admin, profesores, estudiantes };
};

// Crear cursos
const createCursos = async (profesores) => {
  console.log('\n Creando cursos...');

  const ahora = new Date();
  const enUnMes = new Date(ahora.getTime() + 30 * 24 * 60 * 60 * 1000);
  const enTresMeses = new Date(ahora.getTime() + 90 * 24 * 60 * 60 * 1000);
  const enSeisMeses = new Date(ahora.getTime() + 180 * 24 * 60 * 60 * 1000);

  const cursos = await Curso.create([
    {
      nombre: 'Inglés Básico - Nivel A1',
      idioma: 'ingles',
      nivel: 'A1',
      descripcion: 'Curso de inglés para principiantes absolutos',
      duracionTotal: 40,
      tarifa: 2500,
      profesor: profesores[0]._id,
      fechaInicio: enUnMes,
      fechaFin: enTresMeses,
      estado: 'activo',
      requisitos: 'Ninguno',
      objetivos: 'Comunicación básica en inglés'
    },
    {
      nombre: 'Inglés Intermedio - Nivel B1',
      idioma: 'ingles',
      nivel: 'B1',
      descripcion: 'Curso de inglés nivel intermedio',
      duracionTotal: 60,
      tarifa: 3000,
      profesor: profesores[1]._id,
      fechaInicio: enUnMes,
      fechaFin: enSeisMeses,
      estado: 'activo',
      requisitos: 'Nivel A2 completado',
      objetivos: 'Conversación fluida en situaciones cotidianas'
    },
    {
      nombre: 'Francés Principiantes - Nivel A1',
      idioma: 'frances',
      nivel: 'A1',
      descripcion: 'Introducción al idioma francés',
      duracionTotal: 40,
      tarifa: 2800,
      profesor: profesores[2]._id,
      fechaInicio: enUnMes,
      fechaFin: enTresMeses,
      estado: 'activo',
      requisitos: 'Ninguno',
      objetivos: 'Bases del francés y pronunciación'
    },
    {
      nombre: 'Alemán Básico - Nivel A1',
      idioma: 'aleman',
      nivel: 'A1',
      descripcion: 'Curso inicial de alemán',
      duracionTotal: 50,
      tarifa: 3200,
      profesor: profesores[0]._id,
      fechaInicio: new Date(ahora.getTime() + 45 * 24 * 60 * 60 * 1000),
      fechaFin: new Date(ahora.getTime() + 135 * 24 * 60 * 60 * 1000),
      estado: 'planificado',
      requisitos: 'Ninguno',
      objetivos: 'Fundamentos del alemán'
    },
    {
      nombre: 'Italiano para Viajeros - Nivel A2',
      idioma: 'italiano',
      nivel: 'A2',
      descripcion: 'Italiano práctico para turismo',
      duracionTotal: 30,
      tarifa: 2500,
      profesor: profesores[1]._id,
      fechaInicio: new Date(ahora.getTime() + 60 * 24 * 60 * 60 * 1000),
      fechaFin: new Date(ahora.getTime() + 120 * 24 * 60 * 60 * 1000),
      estado: 'planificado',
      requisitos: 'Nivel A1 de italiano',
      objetivos: 'Desenvolverse en viajes a Italia'
    }
  ]);

  console.log(` ${cursos.length} cursos creados`);
  return cursos;
};

// Crear inscripciones
const createInscripciones = async (cursos, estudiantes) => {
  console.log('\n Creando inscripciones...');

  const inscripciones = [];

  // Inscribir estudiantes al curso de Inglés A1
  for (let i = 0; i < 6; i++) {
    const inscripcion = await Inscripcion.create({
      estudiante: estudiantes[i]._id,
      curso: cursos[0]._id,
      estado: 'confirmada',
      fechaInscripcion: new Date(Date.now() - (30 - i) * 24 * 60 * 60 * 1000)
    });
    inscripciones.push(inscripcion);
  }

  // Inscribir al curso de Inglés B1
  for (let i = 3; i < 8; i++) {
    const inscripcion = await Inscripcion.create({
      estudiante: estudiantes[i]._id,
      curso: cursos[1]._id,
      estado: 'confirmada',
      fechaInscripcion: new Date(Date.now() - (25 - i) * 24 * 60 * 60 * 1000)
    });
    inscripciones.push(inscripcion);
  }

  // Inscribir al curso de Francés
  for (let i = 0; i < 4; i++) {
    const inscripcion = await Inscripcion.create({
      estudiante: estudiantes[i]._id,
      curso: cursos[2]._id,
      estado: 'confirmada',
      fechaInscripcion: new Date(Date.now() - (20 - i) * 24 * 60 * 60 * 1000)
    });
    inscripciones.push(inscripcion);
  }

  console.log(` ${inscripciones.length} inscripciones creadas`);
  return inscripciones;
};

// Crear clases
const createClases = async (cursos) => {
  console.log('\n Creando clases...');

  const clases = [];
  const ahora = new Date();

  // Clases para Inglés A1 (curso activo)
  for (let i = 0; i < 5; i++) {
    const fechaClase = new Date(ahora.getTime() + (i + 1) * 7 * 24 * 60 * 60 * 1000);
    fechaClase.setHours(10, 0, 0, 0);

    const clase = await Clase.create({
      curso: cursos[0]._id,
      titulo: `Clase ${i + 1}: ${['Introducción', 'Verbos básicos', 'Números y colores', 'Presentaciones', 'Conversación'][i]}`,
      descripcion: `Contenido de la clase ${i + 1}`,
      profesor: cursos[0].profesor,
      estudiantes: cursos[0].estudiantes,
      fechaHora: fechaClase,
      duracionMinutos: 90,
      estado: i === 0 ? 'completada' : 'programada',
      modalidad: i % 2 === 0 ? 'presencial' : 'virtual',
      aula: i % 2 === 0 ? `Aula ${i + 1}01` : null,
      enlaceVirtual: i % 2 === 1 ? `https://meet.google.com/clase-ingles-${i + 1}` : null,
      contenido: `Temas: Gramática, vocabulario y práctica oral`,
      tareas: `Ejercicios páginas ${i * 10 + 1}-${i * 10 + 10}`
    });
    clases.push(clase);
  }

  // Clases para Inglés B1
  for (let i = 0; i < 5; i++) {
    const fechaClase = new Date(ahora.getTime() + (i + 2) * 7 * 24 * 60 * 60 * 1000);
    fechaClase.setHours(14, 30, 0, 0);

    const clase = await Clase.create({
      curso: cursos[1]._id,
      titulo: `Clase ${i + 1}: ${['Past tenses', 'Future forms', 'Conditionals', 'Modal verbs', 'Phrasal verbs'][i]}`,
      profesor: cursos[1].profesor,
      estudiantes: cursos[1].estudiantes,
      fechaHora: fechaClase,
      duracionMinutos: 120,
      estado: 'programada',
      modalidad: 'virtual',
      enlaceVirtual: `https://zoom.us/j/ingles-b1-${i + 1}`,
      contenido: `Gramática avanzada y práctica conversacional`,
      tareas: `Leer capítulo ${i + 1} y hacer ejercicios`
    });
    clases.push(clase);
  }

  // Clases para Francés
  for (let i = 0; i < 4; i++) {
    const fechaClase = new Date(ahora.getTime() + (i + 3) * 7 * 24 * 60 * 60 * 1000);
    fechaClase.setHours(16, 0, 0, 0);

    const clase = await Clase.create({
      curso: cursos[2]._id,
      titulo: `Leçon ${i + 1}: ${['Alphabet', 'Salutations', 'Les nombres', 'La famille'][i]}`,
      profesor: cursos[2].profesor,
      estudiantes: cursos[2].estudiantes,
      fechaHora: fechaClase,
      duracionMinutos: 90,
      estado: 'programada',
      modalidad: 'presencial',
      aula: `Aula 202`,
      contenido: `Introduction au français`,
      tareas: `Pratiquer la prononciation`
    });
    clases.push(clase);
  }

  console.log(` ${clases.length} clases creadas`);
  return clases;
};

// Crear eventos de calendario
const createEventos = async (clases, estudiantes) => {
  console.log('\n Creando eventos de calendario...');

  let eventosCreados = 0;

  for (const clase of clases) {
    // Crear evento para el profesor
    await EventoCalendario.crearDesdeClase(clase, clase.profesor);
    eventosCreados++;

    // Crear eventos para cada estudiante
    for (const estudianteId of clase.estudiantes) {
      await EventoCalendario.crearDesdeClase(clase, estudianteId);
      eventosCreados++;
    }
  }

  // Crear algunos eventos personales
  for (let i = 0; i < 3; i++) {
    await EventoCalendario.create({
      usuario: estudiantes[i]._id,
      tipo: 'personal',
      titulo: `Estudio personal - Repaso`,
      descripcion: 'Tiempo dedicado a repasar los temas vistos',
      fechaHora: new Date(Date.now() + (i + 1) * 3 * 24 * 60 * 60 * 1000),
      duracion: 60
    });
    eventosCreados++;
  }

  console.log(` ${eventosCreados} eventos creados`);
};

// Función principal
const seedDatabase = async () => {
  console.log(' Iniciando seeds...\n');
  console.log('='.repeat(50));

  await connectDB();
  await clearDB();

  const { admin, profesores, estudiantes } = await createUsers();
  const cursos = await createCursos(profesores);
  const inscripciones = await createInscripciones(cursos, estudiantes);
  const clases = await createClases(cursos);
  await createEventos(clases, estudiantes);

  console.log('\n' + '='.repeat(50));
  console.log(' Seeds completados exitosamente!\n');
  console.log(' Resumen:');
  console.log(`   - 1 Admin`);
  console.log(`   - ${profesores.length} Profesores`);
  console.log(`   - ${estudiantes.length} Estudiantes`);
  console.log(`   - ${cursos.length} Cursos`);
  console.log(`   - ${inscripciones.length} Inscripciones`);
  console.log(`   - ${clases.length} Clases`);
  console.log('\n Credenciales de acceso:');
  console.log('   Admin: admin@consultora.com / admin123');
  console.log('   Profesor: maria.garcia@consultora.com / profesor123');
  console.log('   Estudiante: carlos.rodriguez@email.com / estudiante123');
  console.log('='.repeat(50));

  await mongoose.connection.close();
  console.log('\n Conexión cerrada');
  process.exit(0);
};

// Ejecutar
seedDatabase().catch(error => {
  console.error(' Error en seeds:', error);
  process.exit(1);
});