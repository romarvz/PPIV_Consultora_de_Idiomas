const contadorService = require('../../services/contador.service');
const Contador = require('../../models/contador.model');

describe('Contador Service - Unit Tests', () => {

  describe('obtenerSiguienteNumero', () => {

    test('Debe generar número secuencial para factura en formato F-00001', async () => {
      const numero = await contadorService.obtenerSiguienteNumero('factura');

      expect(numero).toMatch(/^F-\d{5}$/);
      expect(numero).toBe('F-00001');
    });

    test('Debe incrementar el número de factura secuencialmente', async () => {
      const numero1 = await contadorService.obtenerSiguienteNumero('factura');
      const numero2 = await contadorService.obtenerSiguienteNumero('factura');
      const numero3 = await contadorService.obtenerSiguienteNumero('factura');

      expect(numero1).toBe('F-00001');
      expect(numero2).toBe('F-00002');
      expect(numero3).toBe('F-00003');
    });

    test('Debe generar número secuencial para recibo en formato RC-00001-00000001', async () => {
      const numero = await contadorService.obtenerSiguienteNumero('recibo');

      expect(numero).toMatch(/^RC-\d{5}-\d{8}$/);
      expect(numero).toBe('RC-00001-00000001');
    });

    test('Debe incrementar el número de recibo secuencialmente', async () => {
      const numero1 = await contadorService.obtenerSiguienteNumero('recibo');
      const numero2 = await contadorService.obtenerSiguienteNumero('recibo');
      const numero3 = await contadorService.obtenerSiguienteNumero('recibo');

      expect(numero1).toBe('RC-00001-00000001');
      expect(numero2).toBe('RC-00001-00000002');
      expect(numero3).toBe('RC-00001-00000003');
    });

    test('Debe lanzar error si el tipo de documento no es válido', async () => {
      await expect(
        contadorService.obtenerSiguienteNumero('invalido')
      ).rejects.toThrow('Tipo de documento no válido');
    });

    test('Debe crear el contador automáticamente si no existe (upsert)', async () => {
      const contadorAntes = await Contador.findById('factura');
      expect(contadorAntes).toBeNull();

      await contadorService.obtenerSiguienteNumero('factura');

      const contadorDespues = await Contador.findById('factura');
      expect(contadorDespues).toBeTruthy();
      expect(contadorDespues.secuencia).toBe(1);
    });

    test('Debe ser operación atómica (no debe haber duplicados en concurrencia)', async () => {
      const promesas = [];
      for (let i = 0; i < 10; i++) {
        promesas.push(contadorService.obtenerSiguienteNumero('factura'));
      }

      const numeros = await Promise.all(promesas);
      const numerosUnicos = new Set(numeros);

      expect(numerosUnicos.size).toBe(10);
    });
  });

  describe('resetearContador', () => {

    test('Debe resetear el contador a 0', async () => {
      await contadorService.obtenerSiguienteNumero('factura');
      await contadorService.obtenerSiguienteNumero('factura');
      await contadorService.obtenerSiguienteNumero('factura');

      let contador = await Contador.findById('factura');
      expect(contador.secuencia).toBe(3);

      await contadorService.resetearContador('factura');

      contador = await Contador.findById('factura');
      expect(contador.secuencia).toBe(0);
    });

    test('Debe retornar mensaje de confirmación', async () => {
      const resultado = await contadorService.resetearContador('factura');

      expect(resultado).toHaveProperty('message');
      expect(resultado.message).toBe('Contador de factura reseteado a 0');
    });

    test('Después de resetear, el siguiente número debe ser 00001', async () => {
      await contadorService.obtenerSiguienteNumero('factura');
      await contadorService.obtenerSiguienteNumero('factura');

      await contadorService.resetearContador('factura');

      const numero = await contadorService.obtenerSiguienteNumero('factura');
      expect(numero).toBe('F-00001');
    });
  });
});
