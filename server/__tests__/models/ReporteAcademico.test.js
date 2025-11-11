const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
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

describe('ReporteAcademico Model', () => {
  const validReporteData = {
    estudiante: new mongoose.Types.ObjectId(),
    curso: new mongoose.Types.ObjectId(),
    periodo: '2025-Q1',
    clasesTotales: 20,
    clasesAsistidas: 18,
    generadoPor: new mongoose.Types.ObjectId()
  };

  test('should create a valid reporte', async () => {
    const reporte = new ReporteAcademico(validReporteData);
    const saved = await reporte.save();

    expect(saved._id).toBeDefined();
    expect(saved.periodo).toBe('2025-Q1');
    expect(saved.clasesTotales).toBe(20);
  });

  test('should require estudiante, curso, and periodo', async () => {
    const reporte = new ReporteAcademico({});
    
    await expect(reporte.save()).rejects.toThrow();
  });

  test('should auto-calculate porcentajeAsistencia', async () => {
    const reporte = new ReporteAcademico(validReporteData);
    await reporte.save();

    expect(reporte.porcentajeAsistencia).toBe(90);
  });

  test('should add evaluacion correctly', async () => {
    const reporte = new ReporteAcademico(validReporteData);
    await reporte.save();

    reporte.evaluaciones.push({
      tipo: 'examen',
      nombre: 'Midterm',
      nota: 85,
      fecha: new Date()
    });

    const updated = await reporte.save();
    expect(updated.evaluaciones).toHaveLength(1);
    expect(updated.evaluaciones[0].nota).toBe(85);
  });

  test('should auto-calculate promedioGeneral', async () => {
    const reporte = new ReporteAcademico({
      ...validReporteData,
      evaluaciones: [
        { tipo: 'examen', nombre: 'Test 1', nota: 80, fecha: new Date() },
        { tipo: 'examen', nombre: 'Test 2', nota: 90, fecha: new Date() }
      ]
    });

    await reporte.save();
    expect(reporte.promedioGeneral).toBe(85);
  });

  test('should validate nota range (0-100)', async () => {
    const reporte = new ReporteAcademico({
      ...validReporteData,
      evaluaciones: [
        { tipo: 'examen', nombre: 'Test', nota: 150, fecha: new Date() }
      ]
    });

    await expect(reporte.save()).rejects.toThrow();
  });

  test('should set fechaGeneracion automatically', async () => {
    const reporte = new ReporteAcademico(validReporteData);
    await reporte.save();

    expect(reporte.fechaGeneracion).toBeDefined();
    expect(reporte.fechaGeneracion).toBeInstanceOf(Date);
  });
});
