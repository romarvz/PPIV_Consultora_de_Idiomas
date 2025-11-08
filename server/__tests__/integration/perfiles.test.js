const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const express = require('express');
const perfilesRoutes = require('../../routes/perfiles');
const PerfilEstudiante = require('../../models/PerfilEstudiante');

let mongoServer;
let app;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  app = express();
  app.use(express.json());
  app.use('/api/perfiles', perfilesRoutes);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await PerfilEstudiante.deleteMany({});
});

describe('Perfiles Integration Tests', () => {
  const estudianteId = new mongoose.Types.ObjectId().toString();

  describe('GET /api/perfiles/estudiante/:id', () => {
    test('should get or create perfil', async () => {
      const response = await request(app)
        .get(`/api/perfiles/estudiante/${estudianteId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.estudiante).toBe(estudianteId);
    });
  });

  describe('PUT /api/perfiles/estudiante/:id/preferencias', () => {
    test('should update preferencias', async () => {
      await request(app).get(`/api/perfiles/estudiante/${estudianteId}`);

      const response = await request(app)
        .put(`/api/perfiles/estudiante/${estudianteId}/preferencias`)
        .send({
          horarioPreferido: 'tarde',
          modalidadPreferida: 'online',
          objetivosAprendizaje: ['conversación']
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.preferencias.horarioPreferido).toBe('tarde');
    });
  });

  describe('POST /api/perfiles/estudiante/:id/certificados', () => {
    test('should add certificado', async () => {
      await request(app).get(`/api/perfiles/estudiante/${estudianteId}`);

      const response = await request(app)
        .post(`/api/perfiles/estudiante/${estudianteId}/certificados`)
        .send({
          nombre: 'TOEFL',
          nivel: 'B2',
          fechaObtencion: new Date().toISOString()
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.certificados).toHaveLength(1);
      expect(response.body.data.certificados[0].nombre).toBe('TOEFL');
    });
  });

  describe('PUT /api/perfiles/estudiante/:id/estadisticas/actualizar', () => {
    test('should update estadisticas', async () => {
      await request(app).get(`/api/perfiles/estudiante/${estudianteId}`);

      const response = await request(app)
        .put(`/api/perfiles/estudiante/${estudianteId}/estadisticas/actualizar`)
        .send({
          horasCompletadas: 50,
          clasesAsistidas: 25
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.estadisticas.horasCompletadas).toBe(50);
    });
  });
});
