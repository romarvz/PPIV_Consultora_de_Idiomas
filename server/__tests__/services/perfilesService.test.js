const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const perfilesService = require('../../services/perfilesService');
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

describe('perfilesService', () => {
  const estudianteId = new mongoose.Types.ObjectId();

  describe('obtenerOCrearPerfil', () => {
    test('should create new perfil if not exists', async () => {
      const perfil = await perfilesService.obtenerOCrearPerfil(estudianteId);

      expect(perfil).toBeDefined();
      expect(perfil.estudiante.toString()).toBe(estudianteId.toString());
    });

    test('should return existing perfil', async () => {
      await perfilesService.obtenerOCrearPerfil(estudianteId);
      const perfil = await perfilesService.obtenerOCrearPerfil(estudianteId);

      const count = await PerfilEstudiante.countDocuments({ estudiante: estudianteId });
      expect(count).toBe(1);
    });
  });

  describe('actualizarPreferencias', () => {
    test('should update preferencias', async () => {
      await perfilesService.obtenerOCrearPerfil(estudianteId);

      const updated = await perfilesService.actualizarPreferencias(estudianteId, {
        horarioPreferido: 'tarde',
        modalidadPreferida: 'online'
      });

      expect(updated.preferencias.horarioPreferido).toBe('tarde');
      expect(updated.preferencias.modalidadPreferida).toBe('online');
    });

    test('should throw error if perfil not found', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      await expect(
        perfilesService.actualizarPreferencias(fakeId, {})
      ).rejects.toThrow('Perfil no encontrado');
    });
  });

  describe('agregarCertificado', () => {
    test('should add certificado', async () => {
      await perfilesService.obtenerOCrearPerfil(estudianteId);

      const certificado = {
        nombre: 'TOEFL',
        nivel: 'B2',
        fechaObtencion: new Date()
      };

      const updated = await perfilesService.agregarCertificado(estudianteId, certificado);

      expect(updated.certificados).toHaveLength(1);
      expect(updated.certificados[0].nombre).toBe('TOEFL');
      expect(updated.certificados[0].codigoVerificacion).toBeDefined();
    });
  });

  describe('actualizarEstadisticas', () => {
    test('should update estadisticas', async () => {
      await perfilesService.obtenerOCrearPerfil(estudianteId);

      const updated = await perfilesService.actualizarEstadisticas(estudianteId, {
        horasCompletadas: 50,
        clasesAsistidas: 25
      });

      expect(updated.estadisticas.horasCompletadas).toBe(50);
      expect(updated.estadisticas.clasesAsistidas).toBe(25);
    });
  });
});
