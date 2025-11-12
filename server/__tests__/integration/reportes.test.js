const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const express = require('express');
const reportesAcademicosRoutes = require('../../routes/reportes-academicos');
const reportesFinancierosRoutes = require('../../routes/reportes-financieros');
const ReporteAcademico = require('../../models/ReporteAcademico');
const ReporteFinanciero = require('../../models/ReporteFinanciero');

let mongoServer;
let app;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  app = express();
  app.use(express.json());
  app.use('/api/reportes-academicos', reportesAcademicosRoutes);
  app.use('/api/reportes-financieros', reportesFinancierosRoutes);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await ReporteAcademico.deleteMany({});
  await ReporteFinanciero.deleteMany({});
});

describe('Reportes Integration Tests', () => {
  describe('Academic Reports', () => {
    test('should generate reporte academico', async () => {
      const response = await request(app)
        .post('/api/reportes-academicos/generar')
        .send({
          estudianteId: new mongoose.Types.ObjectId(),
          cursoId: new mongoose.Types.ObjectId(),
          periodo: '2025-Q1',
          horasAsistidas: 40,
          horasTotales: 50
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.periodo).toBe('2025-Q1');
    });

    test('should get reporte by id', async () => {
      const created = await request(app)
        .post('/api/reportes-academicos/generar')
        .send({
          estudianteId: new mongoose.Types.ObjectId(),
          cursoId: new mongoose.Types.ObjectId(),
          periodo: '2025-Q1'
        });

      const reporteId = created.body.data._id;

      const response = await request(app)
        .get(`/api/reportes-academicos/${reporteId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data._id).toBe(reporteId);
    });

    test('should add evaluacion to reporte', async () => {
      const created = await request(app)
        .post('/api/reportes-academicos/generar')
        .send({
          estudianteId: new mongoose.Types.ObjectId(),
          cursoId: new mongoose.Types.ObjectId(),
          periodo: '2025-Q1'
        });

      const reporteId = created.body.data._id;

      const response = await request(app)
        .post(`/api/reportes-academicos/${reporteId}/evaluacion`)
        .send({
          tipo: 'examen',
          nota: 85,
          fecha: new Date().toISOString()
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.evaluaciones).toHaveLength(1);
    });
  });

  describe('Financial Reports', () => {
    test('should generate reporte financiero', async () => {
      const response = await request(app)
        .post('/api/reportes-financieros/generar')
        .send({
          periodo: '2025-Q1',
          fechaInicio: new Date('2025-01-01'),
          fechaFin: new Date('2025-03-31'),
          totalIngresos: 100000,
          totalGastos: 60000
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.periodo).toBe('2025-Q1');
      expect(response.body.data.gananciaNeta).toBe(40000);
    });

    test('should get reporte by periodo', async () => {
      await request(app)
        .post('/api/reportes-financieros/generar')
        .send({
          periodo: '2025-Q1',
          fechaInicio: new Date('2025-01-01'),
          fechaFin: new Date('2025-03-31')
        });

      const response = await request(app)
        .get('/api/reportes-financieros/periodo/2025-Q1')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.periodo).toBe('2025-Q1');
    });

    test('should compare two periods', async () => {
      await request(app)
        .post('/api/reportes-financieros/generar')
        .send({
          periodo: '2025-Q1',
          fechaInicio: new Date('2025-01-01'),
          fechaFin: new Date('2025-03-31'),
          ingresosTotales: 100000
        });

      await request(app)
        .post('/api/reportes-financieros/generar')
        .send({
          periodo: '2025-Q2',
          fechaInicio: new Date('2025-04-01'),
          fechaFin: new Date('2025-06-30'),
          ingresosTotales: 120000
        });

      const response = await request(app)
        .get('/api/reportes-financieros/comparar/2025-Q1/2025-Q2')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.diferencias).toBeDefined();
    });
  });
});
