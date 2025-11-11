/**
 * Tests del módulo de Auditoría
 */

const request = require('supertest')
const mongoose = require('mongoose')
const app = require('../index')
const { AuditoriaLog } = require('../models')
const { TIPOS_EVENTO_AUDITORIA } = require('../shared/utils/constants')

describe('Auditoría API', () => {
  let adminToken
  let testUserId
  
  // Antes de todos los tests, hacer login como admin
  beforeAll(async () => {
    // Conectar a base de datos de testing
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI_TEST || process.env.MONGODB_URI)
    }
    
    // Login como admin para obtener token
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@example.com', // Cambiar por tu admin de testing
        password: 'Admin123' // Cambiar por tu password de testing
      })
    
    adminToken = loginResponse.body.token
    testUserId = loginResponse.body.data?.user?._id
  })
  
  // Limpiar logs de prueba después de todos los tests
  afterAll(async () => {
    await AuditoriaLog.deleteMany({ descripcion: /test/i })
    await mongoose.connection.close()
  })
  
  describe('Servicio de Auditoría', () => {
    test('Debe registrar un evento correctamente', async () => {
      const auditoriaService = require('../services/auditoriaService')
      
      const log = await auditoriaService.registrarEvento(
        TIPOS_EVENTO_AUDITORIA.LOGIN,
        testUserId,
        'Test: Usuario inició sesión'
      )
      
      expect(log).toBeDefined()
      expect(log.tipo).toBe(TIPOS_EVENTO_AUDITORIA.LOGIN)
      expect(log.descripcion).toContain('Test')
    })
  })
  
  describe('GET /api/auditoria', () => {
    test('Debe obtener logs con paginación', async () => {
      const response = await request(app)
        .get('/api/auditoria')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ page: 1, limit: 10 })
      
      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.data).toHaveProperty('logs')
      expect(response.body.data).toHaveProperty('total')
      expect(Array.isArray(response.body.data.logs)).toBe(true)
    })
    
    test('Debe filtrar logs por tipo', async () => {
      const response = await request(app)
        .get('/api/auditoria')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ tipo: TIPOS_EVENTO_AUDITORIA.LOGIN })
      
      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
    })
    
    test('Debe denegar acceso sin token', async () => {
      const response = await request(app)
        .get('/api/auditoria')
      
      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
    })
  })
  
  describe('GET /api/auditoria/usuario/:usuarioId', () => {
    test('Debe obtener logs de un usuario específico', async () => {
      const response = await request(app)
        .get(`/api/auditoria/usuario/${testUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
      
      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(Array.isArray(response.body.data)).toBe(true)
    })
  })
  
  describe('GET /api/auditoria/estadisticas', () => {
    test('Debe obtener estadísticas de eventos', async () => {
      const response = await request(app)
        .get('/api/auditoria/estadisticas')
        .set('Authorization', `Bearer ${adminToken}`)
      
      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(Array.isArray(response.body.data)).toBe(true)
    })
  })
})