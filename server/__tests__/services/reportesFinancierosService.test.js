const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const reportesFinancierosService = require('../../services/reportesFinancierosService');
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

describe('reportesFinancierosService', () => {
  const generadoPorId = new mongoose.Types.ObjectId();

  describe('generarReporteFinanciero', () => {
    test('should create reporte financiero', async () => {
      const data = {
        periodo: '2025-Q1',
        fechaInicio: new Date('2025-01-01'),
        fechaFin: new Date('2025-03-31'),
        totalIngresos: 100000,
        totalGastos: 60000,
        generadoPorId
      };

      const reporte = await reportesFinancierosService.generarReporteFinanciero(data);

      expect(reporte).toBeDefined();
      expect(reporte.periodo).toBe('2025-Q1');
      expect(reporte.gananciaNeta).toBe(40000);
    });

    test('should throw error if missing required fields', async () => {
      await expect(
        reportesFinancierosService.generarReporteFinanciero({})
      ).rejects.toThrow();
    });
  });

  describe('obtenerReportePorPeriodo', () => {
    test('should get reporte by periodo', async () => {
      await reportesFinancierosService.generarReporteFinanciero({
        periodo: '2025-Q1',
        fechaInicio: new Date('2025-01-01'),
        fechaFin: new Date('2025-03-31'),
        generadoPorId
      });

      const found = await reportesFinancierosService.obtenerReportePorPeriodo('2025-Q1');

      expect(found).toBeDefined();
      expect(found.periodo).toBe('2025-Q1');
    });

    test('should return null if not found', async () => {
      const found = await reportesFinancierosService.obtenerReportePorPeriodo('2099-Q1');

      expect(found).toBeNull();
    });
  });

  describe('compararPeriodos', () => {
    test('should compare two periods', async () => {
      await reportesFinancierosService.generarReporteFinanciero({
        periodo: '2025-Q1',
        fechaInicio: new Date('2025-01-01'),
        fechaFin: new Date('2025-03-31'),
        ingresosTotales: 100000,
        gastosTotales: 60000,
        generadoPorId
      });

      await reportesFinancierosService.generarReporteFinanciero({
        periodo: '2025-Q2',
        fechaInicio: new Date('2025-04-01'),
        fechaFin: new Date('2025-06-30'),
        ingresosTotales: 120000,
        gastosTotales: 70000,
        generadoPorId
      });

      const comparacion = await reportesFinancierosService.compararPeriodos(
        '2025-Q1',
        '2025-Q2'
      );

      expect(comparacion).toBeDefined();
      expect(comparacion.periodo1).toBeDefined();
      expect(comparacion.periodo2).toBeDefined();
      expect(comparacion.diferencias).toBeDefined();
    });
  });

  describe('agregarEstudianteConDeuda', () => {
    test('should add estudiante con deuda', async () => {
      await reportesFinancierosService.generarReporteFinanciero({
        periodo: '2025-Q1',
        fechaInicio: new Date('2025-01-01'),
        fechaFin: new Date('2025-03-31'),
        generadoPorId
      });

      const estudianteId = new mongoose.Types.ObjectId();
      const updated = await reportesFinancierosService.agregarEstudianteConDeuda(
        '2025-Q1',
        estudianteId,
        5000,
        2
      );

      expect(updated.estudiantesConDeuda).toHaveLength(1);
      expect(updated.estudiantesConDeuda[0].montoDeuda).toBe(5000);
    });
  });

  describe('calcularTendencias', () => {
    test('should calculate financial trends', async () => {
      await reportesFinancierosService.generarReporteFinanciero({
        periodo: '2025-Q1',
        fechaInicio: new Date('2025-01-01'),
        fechaFin: new Date('2025-03-31'),
        ingresosTotales: 100000,
        generadoPorId
      });

      await reportesFinancierosService.generarReporteFinanciero({
        periodo: '2025-Q2',
        fechaInicio: new Date('2025-04-01'),
        fechaFin: new Date('2025-06-30'),
        ingresosTotales: 120000,
        generadoPorId
      });

      const tendencias = await reportesFinancierosService.calcularTendencias(2);

      expect(tendencias).toBeDefined();
      expect(tendencias.periodos).toHaveLength(2);
    });
  });
});
