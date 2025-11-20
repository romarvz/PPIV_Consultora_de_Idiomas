// __tests__/models.test.js
const mongoose = require('mongoose');
const Curso = require('../models/Curso');
const Inscripcion = require('../models/Inscripcion');
const Clase = require('../models/Clase');
const EventoCalendario = require('../models/EventoCalendario');
const BaseUser = require('../models/BaseUser');

jest.setTimeout(30000);

beforeAll(async () => {
  const mongoUri = process.env.MONGO_TEST_URI || 'mongodb://127.0.0.1:27017/idiomas_test';
  await mongoose.connect(mongoUri);
  console.log('✅ MongoDB Test conectado');
});

afterAll(async () => {
  // ⚠️ REMOVIDO: dropDatabase() era peligroso y podía borrar la BD de producción
  // Solo cerramos la conexión sin borrar datos
  await mongoose.connection.close();
  console.log('✅ MongoDB Test desconectado');
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany();
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