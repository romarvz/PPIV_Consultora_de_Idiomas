// __tests__/models.test.js
const mongoose = require('mongoose');
const Curso = require('../models/Curso');
const Inscripcion = require('../models/Inscripcion');
const Clase = require('../models/Clase');
const EventoCalendario = require('../models/EventoCalendario');
const BaseUser = require('../models/BaseUser');

jest.setTimeout(30000);

// CONFIGURACIÓN DE SEGURIDAD PARA TESTS
const isTestEnvironment = () => {
  return (
    process.env.NODE_ENV === 'test' || 
    process.env.JEST_WORKER_ID !== undefined ||
    process.argv.some(arg => arg.includes('jest'))
  );
};

const getTestDbUri = () => {
  // SOLO usar URIs de bases de datos de test
  const testUri = process.env.MONGO_TEST_URI;
  
  if (!testUri) {
    throw new Error('❌ MONGO_TEST_URI no está configurada. Los tests requieren una base de datos específica para testing.');
  }
  
  // Verificar que la URI sea claramente una base de datos de test
  if (!testUri.includes('_test') && !testUri.includes('test_')) {
    throw new Error('❌ SEGURIDAD: La URI de test debe contener "_test" o "test_" para evitar eliminar datos importantes.');
  }
  
  return testUri;
};

beforeAll(async () => {
  // Verificaciones de seguridad antes de conectar
  if (!isTestEnvironment()) {
    throw new Error('❌ SEGURIDAD: Este archivo solo debe ejecutarse en entorno de testing');
  }
  
  try {
    const mongoUri = getTestDbUri();
    console.log('🔒 Conectando a base de datos de test:', mongoUri.replace(/\/\/.*@/, '//***@')); // Ocultar credenciales en log
    
    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB Test conectado de forma segura');
    
    // Verificar que estamos en la base de datos correcta
    const dbName = mongoose.connection.db.databaseName;
    if (!dbName.includes('test')) {
      await mongoose.connection.close();
      throw new Error(`❌ SEGURIDAD: Base de datos "${dbName}" no parece ser de testing`);
    }
    
  } catch (error) {
    console.error('❌ Error en configuración de tests:', error.message);
    process.exit(1);
  }
});

afterAll(async () => {
  try {
    // SOLO limpiar si estamos en entorno de test y base de datos de test
    if (isTestEnvironment() && mongoose.connection.db.databaseName.includes('test')) {
      // Limpiar colecciones en lugar de drop database completo
      const collections = mongoose.connection.collections;
      for (const key in collections) {
        await collections[key].deleteMany({});
      }
      console.log('✅ Datos de test limpiados');
    } else {
      console.warn('⚠️ No se limpiaron datos - verificaciones de seguridad fallaron');
    }
  } catch (error) {
    console.error('❌ Error limpiando datos de test:', error);
  } finally {
    await mongoose.connection.close();
    console.log('✅ Conexión de test cerrada');
  }
});

afterEach(async () => {
  // Limpiar solo si estamos en entorno de test seguro
  if (isTestEnvironment() && mongoose.connection.db.databaseName.includes('test')) {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  }
});

describe('Modelo Curso', () => {
  let profesorId, estudianteId;

  beforeEach(async () => {
    const profesor = await BaseUser.create({
      firstName: 'Juan',
      lastName: 'Profesor',
      email: 'profesor@test.com',
      password: 'password123',
      role: 'profesor',
      dni: '12345678'
    });
    profesorId = profesor._id;

    const estudiante = await BaseUser.create({
      firstName: 'Ana',
      lastName: 'Estudiante',
      email: 'estudiante@test.com',
      password: 'password123',
      role: 'estudiante',
      dni: '87654321'
    });
    estudianteId = estudiante._id;
  });

  test('Debe crear un curso válido', async () => {
    const curso = await Curso.create({
      nombre: 'Inglés Básico',
      idioma: 'ingles',
      nivel: 'A1',
      descripcion: 'Curso de inglés nivel básico',
      duracionTotal: 40,
      tarifa: 2500,
      profesor: profesorId,
      fechaInicio: new Date('2025-02-01'),
      fechaFin: new Date('2025-05-01')
    });

    expect(curso).toBeDefined();
    expect(curso.nombre).toBe('Inglés Básico');
    expect(curso.estado).toBe('planificado');
  });

  test('Debe agregar estudiante correctamente', async () => {
    const curso = await Curso.create({
      nombre: 'Test',
      idioma: 'ingles',
      nivel: 'A1',
      duracionTotal: 40,
      tarifa: 2500,
      profesor: profesorId,
      fechaInicio: new Date('2025-02-01'),
      fechaFin: new Date('2025-05-01')
    });

    curso.agregarEstudiante(estudianteId);
    expect(curso.estaInscrito(estudianteId)).toBe(true);
  });
});

describe('Modelo Inscripcion', () => {
  let profesorId, estudianteId, cursoId;

  beforeEach(async () => {
    const profesor = await BaseUser.create({
      firstName: 'Juan',
      lastName: 'Profesor',
      email: 'profesor@test.com',
      password: 'password123',
      role: 'profesor',
      dni: '12345678'
    });
    profesorId = profesor._id;

    const estudiante = await BaseUser.create({
      firstName: 'Ana',
      lastName: 'Estudiante',
      email: 'estudiante@test.com',
      password: 'password123',
      role: 'estudiante',
      dni: '87654321'
    });
    estudianteId = estudiante._id;

    const curso = await Curso.create({
      nombre: 'Test',
      idioma: 'ingles',
      nivel: 'A1',
      duracionTotal: 40,
      tarifa: 2500,
      profesor: profesorId,
      fechaInicio: new Date('2025-02-01'),
      fechaFin: new Date('2025-05-01')
    });
    cursoId = curso._id;
  });

  test('Debe crear inscripción válida', async () => {
    const inscripcion = await Inscripcion.create({
      estudiante: estudianteId,
      curso: cursoId
    });

    expect(inscripcion).toBeDefined();
    expect(inscripcion.estado).toBe('pendiente');
  });

  test('Debe actualizar progreso correctamente', async () => {
    const inscripcion = await Inscripcion.create({
      estudiante: estudianteId,
      curso: cursoId,
      estado: 'confirmada'
    });

    await inscripcion.actualizarProgreso(10);
    expect(inscripcion.progreso.horasCompletadas).toBe(10);
    expect(inscripcion.progreso.porcentaje).toBe(25);
  });
});

describe('Modelo Clase', () => {
  let profesorId, estudianteId, cursoId;

  beforeEach(async () => {
    const profesor = await BaseUser.create({
      firstName: 'Juan',
      lastName: 'Profesor',
      email: 'profesor@test.com',
      password: 'password123',
      role: 'profesor',
      dni: '12345678'
    });
    profesorId = profesor._id;

    const estudiante = await BaseUser.create({
      firstName: 'Ana',
      lastName: 'Estudiante',
      email: 'estudiante@test.com',
      password: 'password123',
      role: 'estudiante',
      dni: '87654321'
    });
    estudianteId = estudiante._id;

    const curso = await Curso.create({
      nombre: 'Test',
      idioma: 'ingles',
      nivel: 'A1',
      duracionTotal: 40,
      tarifa: 2500,
      profesor: profesorId,
      fechaInicio: new Date('2025-02-01'),
      fechaFin: new Date('2025-05-01')
    });
    cursoId = curso._id;
  });

  test('Debe crear clase válida', async () => {
    const clase = await Clase.create({
      curso: cursoId,
      titulo: 'Clase 1',
      profesor: profesorId,
      fechaHora: new Date('2025-02-05T10:00:00'),
      duracionMinutos: 90,
      modalidad: 'presencial',
      aula: 'Aula 101'
    });

    expect(clase).toBeDefined();
    expect(clase.estado).toBe('programada');
  });

  test('Debe registrar asistencia', async () => {
    const clase = await Clase.create({
      curso: cursoId,
      titulo: 'Clase 1',
      profesor: profesorId,
      estudiantes: [estudianteId],
      fechaHora: new Date('2025-02-05T10:00:00'),
      duracionMinutos: 90,
      modalidad: 'presencial',
      aula: 'Aula 101'
    });

    await clase.registrarAsistencia(estudianteId, true);
    expect(clase.asistencia.length).toBe(1);
  });
});

describe('Modelo EventoCalendario', () => {
  let usuarioId;

  beforeEach(async () => {
    const usuario = await BaseUser.create({
      firstName: 'Juan',
      lastName: 'Usuario',
      email: 'usuario@test.com',
      password: 'password123',
      role: 'estudiante',
      dni: '11223344'
    });
    usuarioId = usuario._id;
  });

  test('Debe crear evento válido', async () => {
    const evento = await EventoCalendario.create({
      usuario: usuarioId,
      tipo: 'clase',
      titulo: 'Clase de Inglés',
      fechaHora: new Date('2025-02-05T10:00:00'),
      duracion: 90
    });

    expect(evento).toBeDefined();
    expect(evento.estado).toBe('pendiente');
    expect(evento.color).toBe('#3B82F6');
  });

  test('Debe completar evento', async () => {
    const evento = await EventoCalendario.create({
      usuario: usuarioId,
      tipo: 'personal',
      titulo: 'Tarea',
      fechaHora: new Date(),
      duracion: 30
    });

    await evento.completar();
    expect(evento.estado).toBe('completado');
  });
});