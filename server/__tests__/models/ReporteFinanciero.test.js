const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const ReporteFinanciero = require('../../models/ReporteFinanciero');

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
  await ReporteFinanciero.deleteMany({});
});

describe('ReporteFinanciero Model', () => {
  const validReporteData = {
    periodo: '2025-Q1',
    tipoPeriodo: 'trimestral',
    fechaInicio: new Date('2025-01-01'),
    fechaFin: new Date('2025-03-31'),
    ingresosTotales: 100000,
    gastosTotales: 60000,
    generadoPor: new mongoose.Types.ObjectId()
  };

  test('should create a valid reporte', async () => {
    const reporte = new ReporteFinanciero(validReporteData);
    const saved = await reporte.save();

    expect(saved._id).toBeDefined();
    expect(saved.periodo).toBe('2025-Q1');
    expect(saved.ingresosTotales).toBe(100000);
  });

  test('should require periodo and fechas', async () => {
    const reporte = new ReporteFinanciero({});
    
    await expect(reporte.save()).rejects.toThrow();
  });

  test('should auto-calculate gananciaNeta', async () => {
    const reporte = new ReporteFinanciero(validReporteData);
    await reporte.save();

    expect(reporte.gananciaNeta).toBe(40000);
  });

  test('should auto-calculate margenGanancia', async () => {
    const reporte = new ReporteFinanciero(validReporteData);
    await reporte.save();

    expect(reporte.margenGanancia).toBe(40);
  });

  test('should calculate porcentajeMorosidad', async () => {
    const reporte = new ReporteFinanciero({
      ...validReporteData,
      ingresosTotales: 100000,
      deudaTotal: 20000
    });

    await reporte.save();
    expect(reporte.porcentajeMorosidad).toBe(20);
  });

  test('should add estudiante con deuda', async () => {
    const reporte = new ReporteFinanciero(validReporteData);
    await reporte.save();

    reporte.estudiantesConDeuda.push({
      estudiante: new mongoose.Types.ObjectId(),
      montoDeuda: 5000,
      mesesAtrasados: 2
    });

    const updated = await reporte.save();
    expect(updated.estudiantesConDeuda).toHaveLength(1);
    expect(updated.estudiantesConDeuda[0].montoDeuda).toBe(5000);
  });

  test('should validate tipoPeriodo enum', async () => {
    const reporte = new ReporteFinanciero({
      ...validReporteData,
      tipoPeriodo: 'invalid'
    });

    await expect(reporte.save()).rejects.toThrow();
  });

  test('should handle detalleIngresos', async () => {
    const reporte = new ReporteFinanciero({
      ...validReporteData,
      detalleIngresos: {
        matriculas: 30000,
        mensualidades: 50000,
        materiales: 15000,
        otros: 5000
      }
    });

    await reporte.save();
    expect(reporte.detalleIngresos.matriculas).toBe(30000);
    expect(reporte.detalleIngresos.mensualidades).toBe(50000);
  });
});
