const request = require('supertest');
const express = require('express');
const Factura = require('../../models/factura.model');
const Estudiante = require('../../models/Estudiante');
const facturaRoutes = require('../../routes/facturas.routes');

const app = express();
app.use(express.json());
app.use('/api/facturas', facturaRoutes);

describe('Facturas Controller - Integration Tests', () => {

  let estudianteTest;

  beforeEach(async () => {
    estudianteTest = await Estudiante.create({
      email: 'estudiante.facturas@test.com',
      password: 'password123',
      firstName: 'Carlos',
      lastName: 'Martínez',
      dni: '22334455',
      role: 'estudiante',
      nivel: 'B1'
    });
  });

  describe('POST /api/facturas - Crear factura', () => {

    test('Debe crear una factura válida y retornar 201', async () => {
      const datosFactura = {
        estudiante: estudianteTest._id,
        condicionFiscal: 'Consumidor Final',
        fechaVencimiento: '2025-12-31',
        itemFacturaSchema: [
          {
            descripcion: 'Curso Inglés B1',
            cantidad: 1,
            precioUnitario: 5000
          }
        ],
        periodoFacturado: '2025-11'
      };

      const response = await request(app)
        .post('/api/facturas')
        .send(datosFactura)
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('numeroFactura');
      expect(response.body.data.estado).toBe('Pendiente');
      expect(response.body.data.total).toBe(5000);
    });

    test('Debe retornar 400 si faltan datos requeridos', async () => {
      const datosInvalidos = {
        condicionFiscal: 'Consumidor Final'
      };

      const response = await request(app)
        .post('/api/facturas')
        .send(datosInvalidos)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message');
    });

    test('Debe retornar 400 si el estudiante no existe', async () => {
      const datosFactura = {
        estudiante: '507f1f77bcf86cd799439011',
        condicionFiscal: 'Consumidor Final',
        itemFacturaSchema: [
          { descripcion: 'Test', cantidad: 1, precioUnitario: 100 }
        ],
        periodoFacturado: '2025-11'
      };

      const response = await request(app)
        .post('/api/facturas')
        .send(datosFactura)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('Estudiante no encontrado');
    });

    test('Debe calcular correctamente el total con múltiples ítems', async () => {
      const datosFactura = {
        estudiante: estudianteTest._id,
        condicionFiscal: 'Consumidor Final',
        fechaVencimiento: '2025-12-31',
        itemFacturaSchema: [
          { descripcion: 'Item 1', cantidad: 2, precioUnitario: 100 },
          { descripcion: 'Item 2', cantidad: 3, precioUnitario: 200 },
          { descripcion: 'Item 3', cantidad: 1, precioUnitario: 500 }
        ],
        periodoFacturado: '2025-11'
      };

      const response = await request(app)
        .post('/api/facturas')
        .send(datosFactura)
        .expect(201);

      const totalEsperado = (2 * 100) + (3 * 200) + (1 * 500);
      expect(response.body.data.total).toBe(totalEsperado);
      expect(response.body.data.subtotal).toBe(totalEsperado);
    });

    test('Debe generar número de factura tipo B para Consumidor Final', async () => {
      const datosFactura = {
        estudiante: estudianteTest._id,
        condicionFiscal: 'Consumidor Final',
        fechaVencimiento: '2025-12-31',
        itemFacturaSchema: [
          { descripcion: 'Test', cantidad: 1, precioUnitario: 100 }
        ],
        periodoFacturado: '2025-11'
      };

      const response = await request(app)
        .post('/api/facturas')
        .send(datosFactura)
        .expect(201);

      expect(response.body.data.numeroFactura).toMatch(/^FC B/);
    });

    test('Debe generar número de factura tipo A para Responsable Inscripto', async () => {
      const datosFactura = {
        estudiante: estudianteTest._id,
        condicionFiscal: 'Responsable Inscripto',
        fechaVencimiento: '2025-12-31',
        itemFacturaSchema: [
          { descripcion: 'Test', cantidad: 1, precioUnitario: 100 }
        ],
        periodoFacturado: '2025-11'
      };

      const response = await request(app)
        .post('/api/facturas')
        .send(datosFactura)
        .expect(201);

      expect(response.body.data.numeroFactura).toMatch(/^FC A/);
    });
  });

  describe('GET /api/facturas/estudiante/:idEstudiante - Obtener facturas por estudiante', () => {

    beforeEach(async () => {
      await Factura.create({
        estudiante: estudianteTest._id,
        condicionFiscal: 'Consumidor Final',
        numeroFactura: 'FC B 00001-00000001',
        fechaEmision: new Date(),
        fechaVencimiento: new Date('2025-12-31'),
        itemFacturaSchema: [
          { descripcion: 'Test 1', cantidad: 1, precioUnitario: 1000 }
        ],
        periodoFacturado: '2025-11',
        subtotal: 1000,
        total: 1000,
        estado: 'Pendiente'
      });

      await Factura.create({
        estudiante: estudianteTest._id,
        condicionFiscal: 'Consumidor Final',
        numeroFactura: 'FC B 00001-00000002',
        fechaEmision: new Date(),
        fechaVencimiento: new Date('2025-12-31'),
        itemFacturaSchema: [
          { descripcion: 'Test 2', cantidad: 1, precioUnitario: 2000 }
        ],
        periodoFacturado: '2025-11',
        subtotal: 2000,
        total: 2000,
        estado: 'Pendiente'
      });
    });

    test('Debe retornar todas las facturas del estudiante con status 200', async () => {
      const response = await request(app)
        .get(`/api/facturas/estudiante/${estudianteTest._id}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('total', 2);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveLength(2);
    });

    test('Debe retornar 404 si el estudiante no tiene facturas', async () => {
      const otroEstudiante = await Estudiante.create({
        email: 'otro@test.com',
        password: 'password123',
        firstName: 'Pedro',
        lastName: 'López',
        dni: '99887766',
        role: 'estudiante',
        nivel: 'A1'
      });

      const response = await request(app)
        .get(`/api/facturas/estudiante/${otroEstudiante._id}`)
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('No se encontraron facturas');
    });
  });

  describe('GET /api/facturas/estudiante/:idEstudiante/deuda - Obtener deuda del estudiante', () => {

    beforeEach(async () => {
      await Factura.create({
        estudiante: estudianteTest._id,
        condicionFiscal: 'Consumidor Final',
        numeroFactura: 'FC B 00001-00000001',
        fechaEmision: new Date(),
        fechaVencimiento: new Date('2025-12-31'),
        itemFacturaSchema: [
          { descripcion: 'Test 1', cantidad: 1, precioUnitario: 1000 }
        ],
        periodoFacturado: '2025-11',
        subtotal: 1000,
        total: 1000,
        estado: 'Pendiente'
      });

      await Factura.create({
        estudiante: estudianteTest._id,
        condicionFiscal: 'Consumidor Final',
        numeroFactura: 'FC B 00001-00000002',
        fechaEmision: new Date(),
        fechaVencimiento: new Date('2025-12-31'),
        itemFacturaSchema: [
          { descripcion: 'Test 2', cantidad: 1, precioUnitario: 2500 }
        ],
        periodoFacturado: '2025-11',
        subtotal: 2500,
        total: 2500,
        estado: 'Pendiente'
      });

      await Factura.create({
        estudiante: estudianteTest._id,
        condicionFiscal: 'Consumidor Final',
        numeroFactura: 'FC B 00001-00000003',
        fechaEmision: new Date(),
        fechaVencimiento: new Date('2025-12-31'),
        itemFacturaSchema: [
          { descripcion: 'Test 3', cantidad: 1, precioUnitario: 1500 }
        ],
        periodoFacturado: '2025-11',
        subtotal: 1500,
        total: 1500,
        estado: 'Pagada'
      });
    });

    test('Debe retornar la deuda total del estudiante con status 200', async () => {
      const response = await request(app)
        .get(`/api/facturas/estudiante/${estudianteTest._id}/deuda`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('deudaTotal', 3500);
      expect(response.body.data).toHaveProperty('cantidadFacturasPendientes', 2);
      expect(response.body.data).toHaveProperty('cantidadFacturasPagadas', 1);
      expect(response.body.data.detalle).toHaveProperty('pendientes');
      expect(response.body.data.detalle).toHaveProperty('pagadas');
    });

    test('Debe retornar 404 si el estudiante no existe', async () => {
      const response = await request(app)
        .get('/api/facturas/estudiante/507f1f77bcf86cd799439011/deuda')
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('Estudiante no encontrado');
    });
  });
});
