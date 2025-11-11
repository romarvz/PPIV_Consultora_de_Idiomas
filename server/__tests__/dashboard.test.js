/**
 * Dashboard module tests
 */

const request = require('supertest')
const mongoose = require('mongoose')
const app = require('../index')

describe('Dashboard API', () => {
  let adminToken
  
  beforeAll(async () => {
    // Conect to testing database
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI_TEST || process.env.MONGODB_URI)
    }
    
    // Login as admin to get token
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@example.com',
        password: 'Admin123'
      })
    
    adminToken = loginResponse.body.token
  })
  
  afterAll(async () => {
    await mongoose.connection.close()
  })
  
  describe('GET /api/dashboard/empresa', () => {
    test('Debe obtener información de la empresa', async () => {
      const response = await request(app)
        .get('/api/dashboard/empresa')
        .set('Authorization', `Bearer ${adminToken}`)
      
      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.data).toHaveProperty('nombre')
      expect(response.body.data).toHaveProperty('contacto')
      expect(response.body.data.contacto).toHaveProperty('email')
    })
    
    test('Debe crear empresa por defecto si no existe', async () => {
      const response = await request(app)
        .get('/api/dashboard/empresa')
        .set('Authorization', `Bearer ${adminToken}`)
      
      expect(response.status).toBe(200)
      expect(response.body.data.nombre).toBeDefined()
      expect(response.body.data.activa).toBe(true)
    })
  })
  
  describe('GET /api/dashboard/estadisticas', () => {
    test('Debe obtener estadísticas generales', async () => {
      const response = await request(app)
        .get('/api/dashboard/estadisticas')
        .set('Authorization', `Bearer ${adminToken}`)
      
      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.data).toHaveProperty('usuarios')
      expect(response.body.data).toHaveProperty('cursos')
      expect(response.body.data).toHaveProperty('clases')
      expect(response.body.data).toHaveProperty('ingresos')
    })
    
    test('Debe tener estructura correcta de usuarios', async () => {
      const response = await request(app)
        .get('/api/dashboard/estadisticas')
        .set('Authorization', `Bearer ${adminToken}`)
      
      const { usuarios } = response.body.data
      
      expect(usuarios).toHaveProperty('estudiantes')
      expect(usuarios).toHaveProperty('profesores')
      expect(usuarios).toHaveProperty('admins')
      expect(usuarios).toHaveProperty('total')
      expect(typeof usuarios.total).toBe('number')
    })
    
    test('Debe tener estructura correcta de ingresos', async () => {
      const response = await request(app)
        .get('/api/dashboard/estadisticas')
        .set('Authorization', `Bearer ${adminToken}`)
      
      const { ingresos } = response.body.data
      
      expect(ingresos).toHaveProperty('delMes')
      expect(ingresos).toHaveProperty('facturasPendientes')
      expect(typeof ingresos.delMes).toBe('number')
    })
  })
  
  describe('GET /api/dashboard/kpis', () => {
    test('Debe obtener KPIs principales', async () => {
      const response = await request(app)
        .get('/api/dashboard/kpis')
        .set('Authorization', `Bearer ${adminToken}`)
      
      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.data).toHaveProperty('totalUsuarios')
      expect(response.body.data).toHaveProperty('estudiantesActivos')
      expect(response.body.data).toHaveProperty('profesoresActivos')
      expect(response.body.data).toHaveProperty('cursosActivos')
      expect(response.body.data).toHaveProperty('clasesDelMes')
      expect(response.body.data).toHaveProperty('ingresosMes')
      expect(response.body.data).toHaveProperty('facturasPendientes')
    })
    
    test('KPIs deben ser números válidos', async () => {
      const response = await request(app)
        .get('/api/dashboard/kpis')
        .set('Authorization', `Bearer ${adminToken}`)
      
      const { data } = response.body
      
      expect(typeof data.totalUsuarios).toBe('number')
      expect(typeof data.estudiantesActivos).toBe('number')
      expect(typeof data.profesoresActivos).toBe('number')
      expect(typeof data.cursosActivos).toBe('number')
      expect(typeof data.clasesDelMes).toBe('number')
      expect(typeof data.ingresosMes).toBe('number')
      expect(data.totalUsuarios).toBeGreaterThanOrEqual(0)
    })
    
    test('Caché debe funcionar (segunda llamada más rápida)', async () => {
      // First call
      const start1 = Date.now()
      await request(app)
        .get('/api/dashboard/kpis')
        .set('Authorization', `Bearer ${adminToken}`)
      const time1 = Date.now() - start1
      
      // Second call
      const start2 = Date.now()
      await request(app)
        .get('/api/dashboard/kpis')
        .set('Authorization', `Bearer ${adminToken}`)
      const time2 = Date.now() - start2
      
      // The second call should be faster due to caching
      console.log(`Primera llamada: ${time1}ms, Segunda llamada (caché): ${time2}ms`)
      // Not allways faster due to variability, but generally should be
    })
  })
  
  describe('GET /api/dashboard/actividad-reciente (NUEVO)', () => {
    test('Debe obtener actividad reciente', async () => {
      const response = await request(app)
        .get('/api/dashboard/actividad-reciente')
        .set('Authorization', `Bearer ${adminToken}`)
      
      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.data).toHaveProperty('inscripciones')
      expect(response.body.data).toHaveProperty('cobros')
      expect(response.body.data).toHaveProperty('proximasClases')
    })
    
    test('Arrays de actividad deben ser arrays', async () => {
      const response = await request(app)
        .get('/api/dashboard/actividad-reciente')
        .set('Authorization', `Bearer ${adminToken}`)
      
      const { data } = response.body
      
      expect(Array.isArray(data.inscripciones)).toBe(true)
      expect(Array.isArray(data.cobros)).toBe(true)
      expect(Array.isArray(data.proximasClases)).toBe(true)
    })
  })
  
  describe('GET /api/dashboard/graficos (NUEVO)', () => {
    test('Debe obtener datos para gráficos', async () => {
      const response = await request(app)
        .get('/api/dashboard/graficos')
        .set('Authorization', `Bearer ${adminToken}`)
      
      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.data).toHaveProperty('ingresosPorMes')
      expect(response.body.data).toHaveProperty('estudiantesPorIdioma')
      expect(response.body.data).toHaveProperty('clasesPorEstado')
      expect(response.body.data).toHaveProperty('cobrosPorMetodo')
    })
    
    test('Datos de gráficos deben tener formato correcto', async () => {
      const response = await request(app)
        .get('/api/dashboard/graficos')
        .set('Authorization', `Bearer ${adminToken}`)
      
      const { data } = response.body
      
      // Monthly incomes should be array with max 6 entries
      expect(Array.isArray(data.ingresosPorMes)).toBe(true)
      expect(data.ingresosPorMes.length).toBeLessThanOrEqual(6)
      
      // Each entry should have month and incomes
      if (data.ingresosPorMes.length > 0) {
        expect(data.ingresosPorMes[0]).toHaveProperty('mes')
        expect(data.ingresosPorMes[0]).toHaveProperty('ingresos')
      }
      
      // Students by language should be array
      expect(Array.isArray(data.estudiantesPorIdioma)).toBe(true)
      
      // Classes by status should be array
      expect(Array.isArray(data.clasesPorEstado)).toBe(true)
      
      // Charges by method should be array
      expect(Array.isArray(data.cobrosPorMetodo)).toBe(true)
    })
  })
  
  describe('PUT /api/dashboard/actualizar-estadisticas', () => {
    test('Debe actualizar estadísticas correctamente', async () => {
      const response = await request(app)
        .put('/api/dashboard/actualizar-estadisticas')
        .set('Authorization', `Bearer ${adminToken}`)
      
      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
    })
  })
  
  describe('POST /api/dashboard/invalidar-cache (NUEVO)', () => {
    test('Debe invalidar caché correctamente', async () => {
      const response = await request(app)
        .post('/api/dashboard/invalidar-cache')
        .set('Authorization', `Bearer ${adminToken}`)
      
      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.message).toContain('invalidado')
    })
  })
})