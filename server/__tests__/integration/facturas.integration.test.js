const request = require('supertest');
const mongoose = require('mongoose');
const express = require('express');
const Admin = require('../../models/Admin');
const Estudiante = require('../../models/Estudiante');

// Crear app de prueba
const createTestApp = () => {
  const app = express();

  // Middleware básico
  app.use(express.json());

  // Rutas
  const authRoutes = require('../../routes/authNew');
  const facturasRoutes = require('../../routes/facturas.routes');

  app.use('/api/auth', authRoutes);
  app.use('/api/facturas', facturasRoutes);

  return app;
};

describe('Facturas Integration Tests', () => {
  let app;
  let adminToken;
  let estudianteId;

  beforeAll(async () => {
    app = createTestApp();

    // Crear admin de prueba
    const adminData = {
      email: 'admin@test.com',
      password: 'Admin123!',
      firstName: 'Admin',
      lastName: 'Test',
      dni: '11111111',
      role: 'admin'
    };

    await Admin.create(adminData);

    // Login para obtener token
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@test.com',
        password: 'Admin123!'
      });

    adminToken = loginResponse.body.data.token;

    // Crear estudiante de prueba
    const estudiante = await Estudiante.create({
      email: 'estudiante@test.com',
      password: 'password123',
      firstName: 'Juan',
      lastName: 'Perez',
      dni: '22222222',
      role: 'estudiante',
      nivel: 'B1'
    });

    estudianteId = estudiante._id;
  });

  test('Crear una factura con autenticación', async () => {
    const facturaData = {
      estudiante: estudianteId.toString(),
      condicionFiscal: 'Consumidor Final',
      fechaVencimiento: '2025-12-31',
      itemFacturaSchema: [
        { descripcion: 'Cuota mensual', cantidad: 1, precioUnitario: 1500 }
      ],
      periodoFacturado: '2025-11'
    };

    const response = await request(app)
      .post('/api/facturas')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(facturaData);

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toBeDefined();
    expect(response.body.data.total).toBe(1500);
  });
});
