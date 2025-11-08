const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const reportesAcademicosService = require('../../services/reportesAcademicosService');
const ReporteAcademico = require('../../models/ReporteAcademico');

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
  await ReporteAcademico.deleteMany({});
});

describe('reportesAcademicosService', () => {
  const estudianteId = new mongoose.Types.ObjectId();
  const cursoId = new mongoose.Types.ObjectId();
  const generadoPorId = new mongoose.Types.ObjectId();

  describe('generarReporteAcademico', () => {
    test('should create reporte academico', async () => {
      const data = {
        estudianteId,
        cursoId,
        periodo: '2025-Q1',
        horasAsistidas: 40,
        horasTotales: 50,
        generadoPorId
      };

      const reporte = await reportesAcademicosService.generarReporteAcademico(data);

      expect(reporte).toBeDefined();
      expect(reporte.periodo).toBe('2025-Q1');
      expect(reporte.estudiante.toString()).toBe(estudianteId.toString());
    });

    test('should throw error if missing required fields', async () => {
      await expect(
        reportesAcademicosService.generarReporteAcademico({})
      ).rejects.toThrow();
    });
  });

  describe('obtenerReportePorId', () => {
    test('should get reporte by id', async () => {
      const created = await reportesAcademicosService.generarReporteAcademico({
        estudianteId,
        cursoId,
        periodo: '2025-Q1',
        generadoPorId
      });

      const found = await reportesAcademicosService.obtenerReportePorId(created._id);

      expect(found).toBeDefined();
      expect(found._id.toString()).toBe(created._id.toString());
    });

    test('should return null if not found', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const found = await reportesAcademicosService.obtenerReportePorId(fakeId);

      expect(found).toBeNull();
    });
  });

  describe('agregarEvaluacion', () => {
    test('should add evaluacion to reporte', async () => {
      const reporte = await reportesAcademicosService.generarReporteAcademico({
        estudianteId,
        cursoId,
        periodo: '2025-Q1',
        generadoPorId
      });

      const evaluacion = {
        tipo: 'examen',
        nota: 85,
        fecha: new Date()
      };

      const updated = await reportesAcademicosService.agregarEvaluacion(
        reporte._id,
        evaluacion
      );

      expect(updated.evaluaciones).toHaveLength(1);
      expect(updated.evaluaciones[0].nota).toBe(85);
    });
  });

  describe('obtenerReportesPorEstudiante', () => {
    test('should get all reportes for estudiante', async () => {
      await reportesAcademicosService.generarReporteAcademico({
        estudianteId,
        cursoId,
        periodo: '2025-Q1',
        generadoPorId
      });

      await reportesAcademicosService.generarReporteAcademico({
        estudianteId,
        cursoId,
        periodo: '2025-Q2',
        generadoPorId
      });

      const reportes = await reportesAcademicosService.obtenerReportesPorEstudiante(
        estudianteId
      );

      expect(reportes).toHaveLength(2);
    });
  });

  describe('obtenerEstadisticasEstudiante', () => {
    test('should calculate student statistics', async () => {
      await reportesAcademicosService.generarReporteAcademico({
        estudianteId,
        cursoId,
        periodo: '2025-Q1',
        clasesTotales: 20,
        clasesAsistidas: 18,
        evaluaciones: [
          { tipo: 'examen', nombre: 'Test', nota: 85, fecha: new Date() }
        ],
        generadoPorId
      });

      const stats = await reportesAcademicosService.obtenerEstadisticasEstudiante(
        estudianteId
      );

      expect(stats).toBeDefined();
      expect(stats.totalReportes).toBe(1);
      expect(stats.promedioAsistencia).toBeGreaterThan(0);
    });
  });
});
