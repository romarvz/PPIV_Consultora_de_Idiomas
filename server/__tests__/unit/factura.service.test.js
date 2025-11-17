const facturaService = require('../../services/factura.service');
const Factura = require('../../models/factura.model');
const BaseUser = require('../../models/BaseUser');
const Estudiante = require('../../models/Estudiante');
const contadorService = require('../../services/contador.service');

describe('Factura Service - Unit Tests', () => {

  let estudianteTest;

  beforeEach(async () => {
    estudianteTest = await Estudiante.create({
      email: 'estudiante@test.com',
      password: 'password123',
      firstName: 'Juan',
      lastName: 'Pérez',
      dni: '12345678',
      role: 'estudiante',
      nivel: 'B1'
    });
  });

  describe('crearFactura', () => {

    test('Debe crear una factura válida con todos los datos correctos', async () => {
      const datosFactura = {
        estudiante: estudianteTest._id,
        condicionFiscal: 'Consumidor Final',
        fechaVencimiento: new Date('2025-12-31'),
        itemFacturaSchema: [
          {
            descripcion: 'Curso Inglés B1',
            cantidad: 1,
            precioUnitario: 5000
          }
        ],
        periodoFacturado: '2025-11'
      };

      const resultado = await facturaService.crearFactura(datosFactura);

      expect(resultado).toHaveProperty('factura');
      expect(resultado).toHaveProperty('mensaje');
      expect(resultado.mensaje).toBe('Factura creada exitosamente');

      const factura = resultado.factura;
      expect(factura.estudiante.toString()).toBe(estudianteTest._id.toString());
      expect(factura.condicionFiscal).toBe('Consumidor Final');
      expect(factura.subtotal).toBe(5000);
      expect(factura.total).toBe(5000);
      expect(factura.estado).toBe('Pendiente');
      expect(factura.numeroFactura).toMatch(/^FC B \d{5}-\d{8}$/);
    });

    test('Debe generar número de factura tipo B para Consumidor Final', async () => {
      const datosFactura = {
        estudiante: estudianteTest._id,
        condicionFiscal: 'Consumidor Final',
        fechaVencimiento: new Date('2025-12-31'),
        itemFacturaSchema: [
          { descripcion: 'Test', cantidad: 1, precioUnitario: 100 }
        ],
        periodoFacturado: '2025-11'
      };

      const resultado = await facturaService.crearFactura(datosFactura);

      expect(resultado.factura.numeroFactura).toMatch(/^FC B/);
    });

    test('Debe generar número de factura tipo A para Responsable Inscripto', async () => {
      const datosFactura = {
        estudiante: estudianteTest._id,
        condicionFiscal: 'Responsable Inscripto',
        fechaVencimiento: new Date('2025-12-31'),
        itemFacturaSchema: [
          { descripcion: 'Test', cantidad: 1, precioUnitario: 100 }
        ],
        periodoFacturado: '2025-11'
      };

      const resultado = await facturaService.crearFactura(datosFactura);

      expect(resultado.factura.numeroFactura).toMatch(/^FC A/);
    });

    test('Debe calcular correctamente el subtotal con múltiples ítems', async () => {
      const datosFactura = {
        estudiante: estudianteTest._id,
        condicionFiscal: 'Consumidor Final',
        fechaVencimiento: new Date('2025-12-31'),
        itemFacturaSchema: [
          { descripcion: 'Item 1', cantidad: 2, precioUnitario: 100 },
          { descripcion: 'Item 2', cantidad: 3, precioUnitario: 200 },
          { descripcion: 'Item 3', cantidad: 1, precioUnitario: 500 }
        ],
        periodoFacturado: '2025-11'
      };

      const resultado = await facturaService.crearFactura(datosFactura);

      const subtotalEsperado = (2 * 100) + (3 * 200) + (1 * 500);
      expect(resultado.factura.subtotal).toBe(subtotalEsperado);
      expect(resultado.factura.total).toBe(subtotalEsperado);
    });

    test('Debe lanzar error si faltan datos requeridos', async () => {
      const datosInvalidos = {
        condicionFiscal: 'Consumidor Final'
      };

      await expect(
        facturaService.crearFactura(datosInvalidos)
      ).rejects.toThrow('Estudiante y ítems de factura son requeridos');
    });

    test('Debe lanzar error si el estudiante no existe', async () => {
      const datosFactura = {
        estudiante: '507f1f77bcf86cd799439011',
        condicionFiscal: 'Consumidor Final',
        itemFacturaSchema: [
          { descripcion: 'Test', cantidad: 1, precioUnitario: 100 }
        ],
        periodoFacturado: '2025-11'
      };

      await expect(
        facturaService.crearFactura(datosFactura)
      ).rejects.toThrow('Estudiante no encontrado');
    });

    test('Debe lanzar error si los ítems tienen precio o cantidad inválidos', async () => {
      const datosFactura = {
        estudiante: estudianteTest._id,
        condicionFiscal: 'Consumidor Final',
        itemFacturaSchema: [
          { descripcion: 'Test', cantidad: 0, precioUnitario: 100 }
        ],
        periodoFacturado: '2025-11'
      };

      await expect(
        facturaService.crearFactura(datosFactura)
      ).rejects.toThrow('Los ítems deben tener precio unitario y cantidad válidos');
    });

    test('Debe generar números de factura secuenciales', async () => {
      const datosBase = {
        estudiante: estudianteTest._id,
        condicionFiscal: 'Consumidor Final',
        fechaVencimiento: new Date('2025-12-31'),
        itemFacturaSchema: [
          { descripcion: 'Test', cantidad: 1, precioUnitario: 100 }
        ],
        periodoFacturado: '2025-11'
      };

      const resultado1 = await facturaService.crearFactura(datosBase);
      const resultado2 = await facturaService.crearFactura(datosBase);
      const resultado3 = await facturaService.crearFactura(datosBase);

      const num1 = resultado1.factura.numeroFactura;
      const num2 = resultado2.factura.numeroFactura;
      const num3 = resultado3.factura.numeroFactura;

      expect(num1).not.toBe(num2);
      expect(num2).not.toBe(num3);
      expect(num1).not.toBe(num3);
    });

    test('Debe guardar la factura en la base de datos', async () => {
      const datosFactura = {
        estudiante: estudianteTest._id,
        condicionFiscal: 'Consumidor Final',
        fechaVencimiento: new Date('2025-12-31'),
        itemFacturaSchema: [
          { descripcion: 'Test', cantidad: 1, precioUnitario: 100 }
        ],
        periodoFacturado: '2025-11'
      };

      const resultado = await facturaService.crearFactura(datosFactura);

      const facturaDB = await Factura.findById(resultado.factura._id);
      expect(facturaDB).toBeTruthy();
      expect(facturaDB.estudiante.toString()).toBe(estudianteTest._id.toString());
    });
  });

  describe('obtenerFacturasPorEstudiante', () => {

    test('Debe retornar todas las facturas de un estudiante', async () => {
      await Factura.create({
        estudiante: estudianteTest._id,
        condicionFiscal: 'Consumidor Final',
        numeroFactura: 'FC B 00001-00000001',
        fechaEmision: new Date(),
        fechaVencimiento: new Date('2025-12-31'),
        itemFacturaSchema: [{ descripcion: 'Test', cantidad: 1, precioUnitario: 100 }],
        periodoFacturado: '2025-11',
        subtotal: 100,
        total: 100,
        estado: 'Pendiente'
      });

      await Factura.create({
        estudiante: estudianteTest._id,
        condicionFiscal: 'Consumidor Final',
        numeroFactura: 'FC B 00001-00000002',
        fechaEmision: new Date(),
        fechaVencimiento: new Date('2025-12-31'),
        itemFacturaSchema: [{ descripcion: 'Test 2', cantidad: 1, precioUnitario: 200 }],
        periodoFacturado: '2025-11',
        subtotal: 200,
        total: 200,
        estado: 'Pendiente'
      });

      const facturas = await facturaService.obtenerFacturasPorEstudiante(estudianteTest._id);

      expect(facturas).toHaveLength(2);
      expect(facturas[0].estudiante.toString()).toBe(estudianteTest._id.toString());
    });

    test('Debe lanzar error si no hay facturas para el estudiante', async () => {
      await expect(
        facturaService.obtenerFacturasPorEstudiante(estudianteTest._id)
      ).rejects.toThrow('No se encontraron facturas para este estudiante');
    });

    test('Debe ordenar las facturas por fecha de emisión descendente', async () => {
      const fecha1 = new Date('2025-01-01');
      const fecha2 = new Date('2025-02-01');
      const fecha3 = new Date('2025-03-01');

      await Factura.create({
        estudiante: estudianteTest._id,
        condicionFiscal: 'Consumidor Final',
        numeroFactura: 'FC B 00001-00000001',
        fechaEmision: fecha2,
        fechaVencimiento: new Date('2025-12-31'),
        itemFacturaSchema: [{ descripcion: 'Test', cantidad: 1, precioUnitario: 100 }],
        periodoFacturado: '2025-02',
        subtotal: 100,
        total: 100,
        estado: 'Pendiente'
      });

      await Factura.create({
        estudiante: estudianteTest._id,
        condicionFiscal: 'Consumidor Final',
        numeroFactura: 'FC B 00001-00000003',
        fechaEmision: fecha3,
        fechaVencimiento: new Date('2025-12-31'),
        itemFacturaSchema: [{ descripcion: 'Test', cantidad: 1, precioUnitario: 100 }],
        periodoFacturado: '2025-03',
        subtotal: 100,
        total: 100,
        estado: 'Pendiente'
      });

      await Factura.create({
        estudiante: estudianteTest._id,
        condicionFiscal: 'Consumidor Final',
        numeroFactura: 'FC B 00001-00000002',
        fechaEmision: fecha1,
        fechaVencimiento: new Date('2025-12-31'),
        itemFacturaSchema: [{ descripcion: 'Test', cantidad: 1, precioUnitario: 100 }],
        periodoFacturado: '2025-01',
        subtotal: 100,
        total: 100,
        estado: 'Pendiente'
      });

      const facturas = await facturaService.obtenerFacturasPorEstudiante(estudianteTest._id);

      expect(facturas[0].periodoFacturado).toBe('2025-03');
      expect(facturas[1].periodoFacturado).toBe('2025-02');
      expect(facturas[2].periodoFacturado).toBe('2025-01');
    });
  });

  describe('obtenerDeudaEstudiante', () => {

    test('Debe calcular correctamente la deuda total del estudiante', async () => {
      await Factura.create({
        estudiante: estudianteTest._id,
        condicionFiscal: 'Consumidor Final',
        numeroFactura: 'FC B 00001-00000001',
        fechaEmision: new Date(),
        fechaVencimiento: new Date('2025-12-31'),
        itemFacturaSchema: [{ descripcion: 'Test', cantidad: 1, precioUnitario: 1000 }],
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
        itemFacturaSchema: [{ descripcion: 'Test 2', cantidad: 1, precioUnitario: 2500 }],
        periodoFacturado: '2025-11',
        subtotal: 2500,
        total: 2500,
        estado: 'Pendiente'
      });

      const deuda = await facturaService.obtenerDeudaEstudiante(estudianteTest._id);

      expect(deuda.deudaTotal).toBe(3500);
      expect(deuda.cantidadFacturasPendientes).toBe(2);
    });

    test('Debe lanzar error si el estudiante no existe', async () => {
      await expect(
        facturaService.obtenerDeudaEstudiante('507f1f77bcf86cd799439011')
      ).rejects.toThrow('Estudiante no encontrado');
    });

    test('Debe retornar deuda cero si no hay facturas pendientes', async () => {
      await Factura.create({
        estudiante: estudianteTest._id,
        condicionFiscal: 'Consumidor Final',
        numeroFactura: 'FC B 00001-00000001',
        fechaEmision: new Date(),
        fechaVencimiento: new Date('2025-12-31'),
        itemFacturaSchema: [{ descripcion: 'Test', cantidad: 1, precioUnitario: 1000 }],
        periodoFacturado: '2025-11',
        subtotal: 1000,
        total: 1000,
        estado: 'Pagada'
      });

      const deuda = await facturaService.obtenerDeudaEstudiante(estudianteTest._id);

      expect(deuda.deudaTotal).toBe(0);
      expect(deuda.cantidadFacturasPendientes).toBe(0);
      expect(deuda.cantidadFacturasPagadas).toBe(1);
    });

    test('Debe separar correctamente facturas pendientes y pagadas', async () => {
      await Factura.create({
        estudiante: estudianteTest._id,
        condicionFiscal: 'Consumidor Final',
        numeroFactura: 'FC B 00001-00000001',
        fechaEmision: new Date(),
        fechaVencimiento: new Date('2025-12-31'),
        itemFacturaSchema: [{ descripcion: 'Test', cantidad: 1, precioUnitario: 1000 }],
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
        itemFacturaSchema: [{ descripcion: 'Test 2', cantidad: 1, precioUnitario: 2000 }],
        periodoFacturado: '2025-11',
        subtotal: 2000,
        total: 2000,
        estado: 'Pagada'
      });

      const deuda = await facturaService.obtenerDeudaEstudiante(estudianteTest._id);

      expect(deuda.deudaTotal).toBe(1000);
      expect(deuda.cantidadFacturasPendientes).toBe(1);
      expect(deuda.cantidadFacturasPagadas).toBe(1);
      expect(deuda.detalle.pendientes).toHaveLength(1);
      expect(deuda.detalle.pagadas).toHaveLength(1);
    });
  });
});
