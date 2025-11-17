const request = require('supertest');
const express = require('express');
const Cobro = require('../../models/cobros.model');
const Factura = require('../../models/factura.model');
const Estudiante = require('../../models/Estudiante');
const cobroRoutes = require('../../routes/cobros.routes');

const app = express();
app.use(express.json());
app.use('/api/cobros', cobroRoutes);

describe('Cobros Controller - Integration Tests', () => {

  let estudianteTest;
  let facturaTest;

  beforeEach(async () => {
    estudianteTest = await Estudiante.create({
      email: 'estudiante.cobros@test.com',
      password: 'password123',
      firstName: 'Ana',
      lastName: 'Fernández',
      dni: '33445566',
      role: 'estudiante',
      nivel: 'A2'
    });

    facturaTest = await Factura.create({
      estudiante: estudianteTest._id,
      condicionFiscal: 'Consumidor Final',
      numeroFactura: 'FC B 00001-00000001',
      fechaEmision: new Date(),
      fechaVencimiento: new Date('2025-12-31'),
      itemFacturaSchema: [
        { descripcion: 'Curso Francés A2', cantidad: 1, precioUnitario: 4000 }
      ],
      periodoFacturado: '2025-11',
      subtotal: 4000,
      total: 4000,
      estado: 'Pendiente'
    });
  });

  describe('POST /api/cobros - Registrar cobro', () => {

    test('Debe registrar un cobro válido completo y retornar 201', async () => {
      const datosCobro = {
        estudiante: estudianteTest._id.toString(),
        factura: facturaTest._id,
        monto: 4000,
        metodoCobro: 'Efectivo',
        fechaCobro: new Date(),
        notas: 'Pago completo'
      };

      const response = await request(app)
        .post('/api/cobros')
        .send(datosCobro)
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message');
      expect(response.body.data).toHaveProperty('cobro');
      expect(response.body.data).toHaveProperty('factura');
      expect(response.body.data.cobro.monto).toBe(4000);
      expect(response.body.data.cobro.metodoCobro).toBe('Efectivo');
      expect(response.body.data.cobro).toHaveProperty('numeroRecibo');
      expect(response.body.data.factura.estado).toBe('Cobrada');
    });

    test('Debe registrar un cobro parcial y actualizar estado a "Cobrada Parcialmente"', async () => {
      const datosCobro = {
        estudiante: estudianteTest._id.toString(),
        factura: facturaTest._id,
        monto: 2000,
        metodoCobro: 'Transferencia'
      };

      const response = await request(app)
        .post('/api/cobros')
        .send(datosCobro)
        .expect(201);

      expect(response.body.data.factura.estado).toBe('Cobrada Parcialmente');
      expect(response.body.data.factura.totalCobrado).toBe(2000);
      expect(response.body.data.factura.saldoPendiente).toBe(2000);
    });

    test('Debe permitir múltiples cobros parciales hasta completar el total', async () => {
      const cobro1 = {
        estudiante: estudianteTest._id.toString(),
        factura: facturaTest._id,
        monto: 1500,
        metodoCobro: 'Efectivo'
      };

      const cobro2 = {
        estudiante: estudianteTest._id.toString(),
        factura: facturaTest._id,
        monto: 1500,
        metodoCobro: 'Tarjeta'
      };

      const cobro3 = {
        estudiante: estudianteTest._id.toString(),
        factura: facturaTest._id,
        monto: 1000,
        metodoCobro: 'Transferencia'
      };

      const response1 = await request(app)
        .post('/api/cobros')
        .send(cobro1)
        .expect(201);
      expect(response1.body.data.factura.estado).toBe('Cobrada Parcialmente');

      const response2 = await request(app)
        .post('/api/cobros')
        .send(cobro2)
        .expect(201);
      expect(response2.body.data.factura.estado).toBe('Cobrada Parcialmente');

      const response3 = await request(app)
        .post('/api/cobros')
        .send(cobro3)
        .expect(201);
      expect(response3.body.data.factura.estado).toBe('Cobrada');
      expect(response3.body.data.factura.saldoPendiente).toBe(0);
    });

    test('Debe retornar 400 si el monto es cero o negativo', async () => {
      const datosCobro = {
        estudiante: estudianteTest._id.toString(),
        factura: facturaTest._id,
        monto: 0,
        metodoCobro: 'Efectivo'
      };

      const response = await request(app)
        .post('/api/cobros')
        .send(datosCobro)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('El monto debe ser mayor a cero');
    });

    test('Debe retornar 400 si la factura no existe', async () => {
      const datosCobro = {
        estudiante: estudianteTest._id.toString(),
        factura: '507f1f77bcf86cd799439011',
        monto: 1000,
        metodoCobro: 'Efectivo'
      };

      const response = await request(app)
        .post('/api/cobros')
        .send(datosCobro)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('Factura no encontrada');
    });

    test('Debe retornar 400 si la factura ya está cobrada', async () => {
      facturaTest.estado = 'Cobrada';
      await facturaTest.save();

      const datosCobro = {
        estudiante: estudianteTest._id.toString(),
        factura: facturaTest._id,
        monto: 1000,
        metodoCobro: 'Efectivo'
      };

      const response = await request(app)
        .post('/api/cobros')
        .send(datosCobro)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('No se pueden registrar cobros para facturas cobradas');
    });

    test('Debe retornar 400 si el cobro excede el saldo pendiente', async () => {
      const datosCobro = {
        estudiante: estudianteTest._id.toString(),
        factura: facturaTest._id,
        monto: 5000,
        metodoCobro: 'Efectivo'
      };

      const response = await request(app)
        .post('/api/cobros')
        .send(datosCobro)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('El cobro excede el saldo pendiente');
    });

    test('Debe retornar 400 si la factura no pertenece al estudiante', async () => {
      const otroEstudiante = await Estudiante.create({
        email: 'otro.estudiante@test.com',
        password: 'password123',
        firstName: 'Luis',
        lastName: 'García',
        dni: '77665544',
        role: 'estudiante',
        nivel: 'B1'
      });

      const datosCobro = {
        estudiante: otroEstudiante._id.toString(),
        factura: facturaTest._id,
        monto: 1000,
        metodoCobro: 'Efectivo'
      };

      const response = await request(app)
        .post('/api/cobros')
        .send(datosCobro)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('La factura no pertenece a este estudiante');
    });

    test('Debe generar número de recibo único para cada cobro', async () => {
      const cobro1 = {
        estudiante: estudianteTest._id.toString(),
        factura: facturaTest._id,
        monto: 2000,
        metodoCobro: 'Efectivo'
      };

      const cobro2 = {
        estudiante: estudianteTest._id.toString(),
        factura: facturaTest._id,
        monto: 2000,
        metodoCobro: 'Tarjeta'
      };

      const response1 = await request(app)
        .post('/api/cobros')
        .send(cobro1)
        .expect(201);

      const response2 = await request(app)
        .post('/api/cobros')
        .send(cobro2)
        .expect(201);

      expect(response1.body.data.cobro.numeroRecibo).not.toBe(
        response2.body.data.cobro.numeroRecibo
      );
      expect(response1.body.data.cobro.numeroRecibo).toMatch(/^RC-\d{5}-\d{8}$/);
      expect(response2.body.data.cobro.numeroRecibo).toMatch(/^RC-\d{5}-\d{8}$/);
    });

    test('Debe actualizar el estado de la factura en la base de datos', async () => {
      const datosCobro = {
        estudiante: estudianteTest._id.toString(),
        factura: facturaTest._id,
        monto: 4000,
        metodoCobro: 'Efectivo'
      };

      await request(app)
        .post('/api/cobros')
        .send(datosCobro)
        .expect(201);

      const facturaActualizada = await Factura.findById(facturaTest._id);
      expect(facturaActualizada.estado).toBe('Cobrada');
    });
  });

  describe('GET /api/cobros/estudiante/:idEstudiante - Obtener cobros por estudiante', () => {

    beforeEach(async () => {
      await Cobro.create({
        numeroRecibo: 'RC-00001-00000001',
        estudiante: estudianteTest._id,
        factura: facturaTest._id,
        monto: 2000,
        metodoCobro: 'Efectivo',
        fechaCobro: new Date('2025-01-15')
      });

      await Cobro.create({
        numeroRecibo: 'RC-00001-00000002',
        estudiante: estudianteTest._id,
        factura: facturaTest._id,
        monto: 2000,
        metodoCobro: 'Tarjeta',
        fechaCobro: new Date('2025-02-15')
      });
    });

    test('Debe retornar todos los cobros del estudiante con status 200', async () => {
      const response = await request(app)
        .get(`/api/cobros/estudiante/${estudianteTest._id}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('total', 2);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data[0]).toHaveProperty('numeroRecibo');
      expect(response.body.data[0]).toHaveProperty('monto');
      expect(response.body.data[0]).toHaveProperty('metodoCobro');
    });

    test('Debe retornar 404 si el estudiante no tiene cobros', async () => {
      const otroEstudiante = await Estudiante.create({
        email: 'sin.cobros@test.com',
        password: 'password123',
        firstName: 'Pedro',
        lastName: 'López',
        dni: '11223344',
        role: 'estudiante',
        nivel: 'C1'
      });

      const response = await request(app)
        .get(`/api/cobros/estudiante/${otroEstudiante._id}`)
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('No se encontraron cobros');
    });

    test('Debe ordenar los cobros por fecha descendente', async () => {
      await Cobro.create({
        numeroRecibo: 'RC-00001-00000003',
        estudiante: estudianteTest._id,
        factura: facturaTest._id,
        monto: 500,
        metodoCobro: 'Transferencia',
        fechaCobro: new Date('2025-03-15')
      });

      const response = await request(app)
        .get(`/api/cobros/estudiante/${estudianteTest._id}`)
        .expect(200);

      expect(response.body.data).toHaveLength(3);

      const fechas = response.body.data.map(cobro => new Date(cobro.fechaCobro));
      expect(fechas[0] >= fechas[1]).toBe(true);
      expect(fechas[1] >= fechas[2]).toBe(true);
    });
  });

  describe('Escenario completo - Factura con múltiples cobros', () => {

    test('Debe registrar múltiples cobros y actualizar el estado de la factura correctamente', async () => {
      const cobro1 = {
        estudiante: estudianteTest._id.toString(),
        factura: facturaTest._id,
        monto: 1000,
        metodoCobro: 'Efectivo'
      };

      const response1 = await request(app)
        .post('/api/cobros')
        .send(cobro1)
        .expect(201);

      expect(response1.body.data.factura.estado).toBe('Cobrada Parcialmente');
      expect(response1.body.data.factura.totalCobrado).toBe(1000);

      const cobro2 = {
        estudiante: estudianteTest._id.toString(),
        factura: facturaTest._id,
        monto: 1500,
        metodoCobro: 'Tarjeta'
      };

      const response2 = await request(app)
        .post('/api/cobros')
        .send(cobro2)
        .expect(201);

      expect(response2.body.data.factura.estado).toBe('Cobrada Parcialmente');
      expect(response2.body.data.factura.totalCobrado).toBe(2500);

      const cobro3 = {
        estudiante: estudianteTest._id.toString(),
        factura: facturaTest._id,
        monto: 1500,
        metodoCobro: 'Transferencia'
      };

      const response3 = await request(app)
        .post('/api/cobros')
        .send(cobro3)
        .expect(201);

      expect(response3.body.data.factura.estado).toBe('Cobrada');
      expect(response3.body.data.factura.totalCobrado).toBe(4000);
      expect(response3.body.data.factura.saldoPendiente).toBe(0);

      const cobrosEstudiante = await request(app)
        .get(`/api/cobros/estudiante/${estudianteTest._id}`)
        .expect(200);

      expect(cobrosEstudiante.body.data).toHaveLength(3);

      const totalCobrado = cobrosEstudiante.body.data.reduce(
        (sum, cobro) => sum + cobro.monto,
        0
      );
      expect(totalCobrado).toBe(4000);
    });
  });
});
