const cobroService = require('../../services/cobro.service');
const Cobro = require('../../models/cobros.model');
const Factura = require('../../models/factura.model');
const Estudiante = require('../../models/Estudiante');
const contadorService = require('../../services/contador.service');

describe('Cobro Service - Unit Tests', () => {

  let estudianteTest;
  let facturaTest;

  beforeEach(async () => {
    estudianteTest = await Estudiante.create({
      email: 'estudiante@test.com',
      password: 'password123',
      firstName: 'María',
      lastName: 'González',
      dni: '87654321',
      role: 'estudiante',
      nivel: 'B2'
    });

    facturaTest = await Factura.create({
      estudiante: estudianteTest._id,
      condicionFiscal: 'Consumidor Final',
      numeroFactura: 'FC B 00001-00000001',
      fechaEmision: new Date(),
      fechaVencimiento: new Date('2025-12-31'),
      itemFacturaSchema: [
        { descripcion: 'Curso Inglés B2', cantidad: 1, precioUnitario: 5000 }
      ],
      periodoFacturado: '2025-11',
      subtotal: 5000,
      total: 5000,
      estado: 'Pendiente'
    });
  });

  describe('registrarCobro', () => {

    test('Debe registrar un cobro válido completo', async () => {
      const datosCobro = {
        estudiante: estudianteTest._id.toString(),
        factura: facturaTest._id,
        monto: 5000,
        metodoCobro: 'Efectivo',
        fechaCobro: new Date(),
        notas: 'Pago completo en efectivo'
      };

      const resultado = await cobroService.registrarCobro(datosCobro);

      expect(resultado).toHaveProperty('cobro');
      expect(resultado).toHaveProperty('facturaActualizada');
      expect(resultado).toHaveProperty('mensaje');
      expect(resultado.mensaje).toBe('Cobro registrado exitosamente');

      expect(resultado.cobro.monto).toBe(5000);
      expect(resultado.cobro.metodoCobro).toBe('Efectivo');
      expect(resultado.cobro.numeroRecibo).toMatch(/^RC-\d{5}-\d{8}$/);

      expect(resultado.facturaActualizada.estado).toBe('Cobrada');
      expect(resultado.facturaActualizada.totalCobrado).toBe(5000);
      expect(resultado.facturaActualizada.saldoPendiente).toBe(0);
    });

    test('Debe registrar un cobro parcial y actualizar estado a "Cobrada Parcialmente"', async () => {
      const datosCobro = {
        estudiante: estudianteTest._id.toString(),
        factura: facturaTest._id,
        monto: 2500,
        metodoCobro: 'Transferencia',
        fechaCobro: new Date()
      };

      const resultado = await cobroService.registrarCobro(datosCobro);

      expect(resultado.facturaActualizada.estado).toBe('Cobrada Parcialmente');
      expect(resultado.facturaActualizada.totalCobrado).toBe(2500);
      expect(resultado.facturaActualizada.saldoPendiente).toBe(2500);
    });

    test('Debe permitir múltiples cobros parciales hasta completar el total', async () => {
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

      const cobro3 = {
        estudiante: estudianteTest._id.toString(),
        factura: facturaTest._id,
        monto: 1000,
        metodoCobro: 'Transferencia'
      };

      const resultado1 = await cobroService.registrarCobro(cobro1);
      expect(resultado1.facturaActualizada.estado).toBe('Cobrada Parcialmente');
      expect(resultado1.facturaActualizada.saldoPendiente).toBe(3000);

      const resultado2 = await cobroService.registrarCobro(cobro2);
      expect(resultado2.facturaActualizada.estado).toBe('Cobrada Parcialmente');
      expect(resultado2.facturaActualizada.saldoPendiente).toBe(1000);

      const resultado3 = await cobroService.registrarCobro(cobro3);
      expect(resultado3.facturaActualizada.estado).toBe('Cobrada');
      expect(resultado3.facturaActualizada.saldoPendiente).toBe(0);
    });

    test('Debe lanzar error si el monto es cero o negativo', async () => {
      const datosCobro = {
        estudiante: estudianteTest._id.toString(),
        factura: facturaTest._id,
        monto: 0,
        metodoCobro: 'Efectivo'
      };

      await expect(
        cobroService.registrarCobro(datosCobro)
      ).rejects.toThrow('El monto debe ser mayor a cero');
    });

    test('Debe lanzar error si la factura no existe', async () => {
      const datosCobro = {
        estudiante: estudianteTest._id.toString(),
        factura: '507f1f77bcf86cd799439011',
        monto: 1000,
        metodoCobro: 'Efectivo'
      };

      await expect(
        cobroService.registrarCobro(datosCobro)
      ).rejects.toThrow('Factura no encontrada');
    });

    test('Debe lanzar error si la factura ya está cobrada', async () => {
      facturaTest.estado = 'Cobrada';
      await facturaTest.save();

      const datosCobro = {
        estudiante: estudianteTest._id.toString(),
        factura: facturaTest._id,
        monto: 1000,
        metodoCobro: 'Efectivo'
      };

      await expect(
        cobroService.registrarCobro(datosCobro)
      ).rejects.toThrow('No se pueden registrar cobros para facturas cobradas');
    });

    test('Debe lanzar error si la factura no pertenece al estudiante', async () => {
      const otroEstudiante = await Estudiante.create({
        email: 'otro@test.com',
        password: 'password123',
        firstName: 'Pedro',
        lastName: 'López',
        dni: '11111111',
        role: 'estudiante',
        nivel: 'A1'
      });

      const datosCobro = {
        estudiante: otroEstudiante._id.toString(),
        factura: facturaTest._id,
        monto: 1000,
        metodoCobro: 'Efectivo'
      };

      await expect(
        cobroService.registrarCobro(datosCobro)
      ).rejects.toThrow('La factura no pertenece a este estudiante');
    });

    test('Debe lanzar error si el cobro excede el saldo pendiente', async () => {
      const datosCobro = {
        estudiante: estudianteTest._id.toString(),
        factura: facturaTest._id,
        monto: 6000,
        metodoCobro: 'Efectivo'
      };

      await expect(
        cobroService.registrarCobro(datosCobro)
      ).rejects.toThrow(/El cobro excede el saldo pendiente/);
    });

    test('Debe lanzar error si la suma de cobros parciales excede el total', async () => {
      const cobro1 = {
        estudiante: estudianteTest._id.toString(),
        factura: facturaTest._id,
        monto: 3000,
        metodoCobro: 'Efectivo'
      };

      await cobroService.registrarCobro(cobro1);

      const cobro2 = {
        estudiante: estudianteTest._id.toString(),
        factura: facturaTest._id,
        monto: 3000,
        metodoCobro: 'Tarjeta'
      };

      await expect(
        cobroService.registrarCobro(cobro2)
      ).rejects.toThrow(/El cobro excede el saldo pendiente/);
    });

    test('Debe realizar rollback si hay un error durante la transacción', async () => {
      const cobroAntes = await Cobro.countDocuments();
      const facturaAntes = await Factura.findById(facturaTest._id);

      const datosCobro = {
        estudiante: estudianteTest._id.toString(),
        factura: facturaTest._id,
        monto: 10000,
        metodoCobro: 'Efectivo'
      };

      await expect(
        cobroService.registrarCobro(datosCobro)
      ).rejects.toThrow();

      const cobroDespues = await Cobro.countDocuments();
      const facturaDespues = await Factura.findById(facturaTest._id);

      expect(cobroDespues).toBe(cobroAntes);
      expect(facturaDespues.estado).toBe(facturaAntes.estado);
    });

    test('Debe generar número de recibo único', async () => {
      const datosCobro1 = {
        estudiante: estudianteTest._id.toString(),
        factura: facturaTest._id,
        monto: 2000,
        metodoCobro: 'Efectivo'
      };

      const datosCobro2 = {
        estudiante: estudianteTest._id.toString(),
        factura: facturaTest._id,
        monto: 2000,
        metodoCobro: 'Tarjeta'
      };

      const resultado1 = await cobroService.registrarCobro(datosCobro1);
      const resultado2 = await cobroService.registrarCobro(datosCobro2);

      expect(resultado1.cobro.numeroRecibo).not.toBe(resultado2.cobro.numeroRecibo);
    });

    test('Debe guardar el cobro en la base de datos', async () => {
      const datosCobro = {
        estudiante: estudianteTest._id.toString(),
        factura: facturaTest._id,
        monto: 5000,
        metodoCobro: 'Efectivo'
      };

      const resultado = await cobroService.registrarCobro(datosCobro);

      const cobroDB = await Cobro.findById(resultado.cobro._id);
      expect(cobroDB).toBeTruthy();
      expect(cobroDB.monto).toBe(5000);
      expect(cobroDB.metodoCobro).toBe('Efectivo');
    });

    test('Debe actualizar el estado de la factura en la base de datos', async () => {
      const datosCobro = {
        estudiante: estudianteTest._id.toString(),
        factura: facturaTest._id,
        monto: 5000,
        metodoCobro: 'Efectivo'
      };

      await cobroService.registrarCobro(datosCobro);

      const facturaDB = await Factura.findById(facturaTest._id);
      expect(facturaDB.estado).toBe('Cobrada');
    });
  });

  describe('obtenerCobrosPorEstudiante', () => {

    test('Debe retornar todos los cobros de un estudiante', async () => {
      await Cobro.create({
        numeroRecibo: 'RC-00001-00000001',
        estudiante: estudianteTest._id,
        factura: facturaTest._id,
        monto: 2500,
        metodoCobro: 'Efectivo',
        fechaCobro: new Date()
      });

      await Cobro.create({
        numeroRecibo: 'RC-00001-00000002',
        estudiante: estudianteTest._id,
        factura: facturaTest._id,
        monto: 2500,
        metodoCobro: 'Tarjeta',
        fechaCobro: new Date()
      });

      const cobros = await cobroService.obtenerCobrosPorEstudiante(estudianteTest._id);

      expect(cobros).toHaveLength(2);
      expect(cobros[0].estudiante.toString()).toBe(estudianteTest._id.toString());
    });

    test('Debe lanzar error si no hay cobros para el estudiante', async () => {
      await expect(
        cobroService.obtenerCobrosPorEstudiante(estudianteTest._id)
      ).rejects.toThrow('No se encontraron cobros para este estudiante');
    });

    test('Debe ordenar los cobros por fecha de cobro descendente', async () => {
      const fecha1 = new Date('2025-01-01');
      const fecha2 = new Date('2025-02-01');
      const fecha3 = new Date('2025-03-01');

      await Cobro.create({
        numeroRecibo: 'RC-00001-00000002',
        estudiante: estudianteTest._id,
        factura: facturaTest._id,
        monto: 1000,
        metodoCobro: 'Efectivo',
        fechaCobro: fecha2
      });

      await Cobro.create({
        numeroRecibo: 'RC-00001-00000003',
        estudiante: estudianteTest._id,
        factura: facturaTest._id,
        monto: 1000,
        metodoCobro: 'Tarjeta',
        fechaCobro: fecha3
      });

      await Cobro.create({
        numeroRecibo: 'RC-00001-00000001',
        estudiante: estudianteTest._id,
        factura: facturaTest._id,
        monto: 1000,
        metodoCobro: 'Transferencia',
        fechaCobro: fecha1
      });

      const cobros = await cobroService.obtenerCobrosPorEstudiante(estudianteTest._id);

      expect(new Date(cobros[0].fechaCobro)).toEqual(fecha3);
      expect(new Date(cobros[1].fechaCobro)).toEqual(fecha2);
      expect(new Date(cobros[2].fechaCobro)).toEqual(fecha1);
    });
  });
});
