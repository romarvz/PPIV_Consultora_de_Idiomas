const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const PerfilEstudiante = require('../../models/PerfilEstudiante');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await PerfilEstudiante.deleteMany({});
});

describe('PerfilEstudiante Model', () => {
  const validPerfilData = {
    estudiante: new mongoose.Types.ObjectId(),
    preferencias: {
      horarioPreferido: 'mañana',
      modalidadPreferida: 'presencial',
      objetivosAprendizaje: ['conversación', 'negocios']
    }
  };

  test('should create a valid perfil', async () => {
    const perfil = new PerfilEstudiante(validPerfilData);
    const savedPerfil = await perfil.save();

    expect(savedPerfil._id).toBeDefined();
    expect(savedPerfil.estudiante).toEqual(validPerfilData.estudiante);
    expect(savedPerfil.preferencias.horarioPreferido).toBe('mañana');
  });

  test('should require estudiante field', async () => {
    const perfil = new PerfilEstudiante({});
    
    await expect(perfil.save()).rejects.toThrow();
  });

  test('should validate horarioPreferido enum', async () => {
    const perfil = new PerfilEstudiante({
      ...validPerfilData,
      preferencias: {
        horarioPreferido: 'invalid'
      }
    });

    await expect(perfil.save()).rejects.toThrow();
  });

  test('should add certificado correctly', async () => {
    const perfil = new PerfilEstudiante(validPerfilData);
    await perfil.save();

    perfil.certificados.push({
      nombre: 'TOEFL',
      nivel: 'B2',
      fechaObtencion: new Date(),
      codigoVerificacion: 'TOEFL123'
    });

    const updated = await perfil.save();
    expect(updated.certificados).toHaveLength(1);
    expect(updated.certificados[0].nombre).toBe('TOEFL');
  });

  test('should calculate statistics correctly', async () => {
    const perfil = new PerfilEstudiante({
      ...validPerfilData,
      estadisticas: {
        horasCompletadas: 50,
        clasesAsistidas: 25,
        cursosCompletados: 2
      }
    });

    await perfil.save();

    expect(perfil.estadisticas.horasCompletadas).toBe(50);
    expect(perfil.estadisticas.clasesAsistidas).toBe(25);
  });

  test('should add historial academico', async () => {
    const perfil = new PerfilEstudiante(validPerfilData);
    await perfil.save();

    perfil.historialAcademico.push({
      curso: new mongoose.Types.ObjectId(),
      fechaInicio: new Date('2025-01-01'),
      fechaFin: new Date('2025-06-01'),
      estado: 'completado',
      calificacionFinal: 85
    });

    const updated = await perfil.save();
    expect(updated.historialAcademico).toHaveLength(1);
    expect(updated.historialAcademico[0].estado).toBe('completado');
  });
});
