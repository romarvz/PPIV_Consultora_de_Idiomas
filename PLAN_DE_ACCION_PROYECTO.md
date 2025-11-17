# 📋 PLAN DE ACCIÓN - SISTEMA DE GESTIÓN CONSULTORA DE IDIOMAS

**Fecha:** 30 de Octubre de 2025  
**Desarrollador:** Aye  
**Estado:** Análisis y planificación para integración

---

## 🎯 OBJETIVOS PRINCIPALES

### 1. **Completar Simulación ARCA (CAEA) y hacer PR a Dev**
### 2. **Conectar Backend con Frontend de Cobros**
### 3. **Preparar estructura para Pagos a Profesores y MercadoPago**

---

## 📊 ANÁLISIS DE SITUACIÓN ACTUAL

### **Backend (EN DEV - FUNCIONANDO)**

#### ✅ Modelos Completos
- `Cobro.model.js` - Sistema de recibos/cobros
- `Factura.model.js` - Facturas con CAE
- `concept.model.js` - Conceptos facturables
- `conceptCategory.model.js` - Categorías de conceptos
- `contador.model.js` - Numeración de comprobantes

#### ✅ Funcionalidades Implementadas
- Generación de facturas (admin crea factura)
- Cobros parciales y totales de facturas
- Sistema de numeración automática
- Validaciones de negocio

### **Frontend (MÚLTIPLES RAMAS - REQUIERE CONSOLIDACIÓN)**

#### Ramas Activas:
1. `financial-acutalizada` - Trabajo principal de financial
2. `feature/aye-financial-module` - Módulo financial
3. `aye/feature/payments` - Pagos
4. `aye/feature/financial` - Financial

#### ⚠️ Problema Identificado:
- Componente `PaymentRegistration.jsx` usa terminología incorrecta
- **ESTÁ MAL:** "Pagos" 
- **DEBE SER:** "Cobros a Alumnos"
- Frontend usa datos MOCK hardcodeados
- No está conectado al backend real

### **Simulación ARCA (EN RAMA SEPARADA)**

#### Rama: `aye/simulacionArca`
- Estado: **PENDIENTE DE REVISIÓN**
- Objetivo: Implementar CAEA según RG 4291 de ARCA
- Necesita: Validación contra manual ARCA v4.0

---

## 🗺️ PLAN DE TRABAJO DETALLADO

---

## 🔴 FASE 1: COMPLETAR SIMULACIÓN ARCA/CAEA (PRIORIDAD ALTA)

### **Contexto: ¿Qué es CAEA?**

El **CAEA (Código de Autorización Electrónico Anticipado)** es un mecanismo de contingencia de AFIP/ARCA para facturación electrónica cuando:
- No hay conexión con AFIP
- El servicio web está caído
- Hay problemas técnicos temporales

#### Funcionamiento:
1. **Solicitud previa:** Se solicita CAEA **antes** del período de facturación
2. **Períodos quincenales:** 
   - 1era quincena: del 1 al 15 de cada mes
   - 2da quincena: del 16 al último día del mes
3. **Uso en contingencia:** Cuando AFIP no responde, se usa el CAEA pre-aprobado
4. **Informar posteriormente:** Después se informan los comprobantes emitidos con CAEA

---

### **1.1 Revisar Código Actual de Simulación ARCA**

```bash
# Clonar y revisar rama
git checkout aye/simulacionArca
```

**Archivos a revisar:**
- `server/services/afipService.js` o similar
- `server/controllers/facturaController.js`
- `server/models/Factura.model.js`
- `server/routes/factura.routes.js`

---

### **1.2 Implementación CAEA Según Manual ARCA v4.0**

#### **Estructura del Modelo Factura (actualizar si es necesario)**

```javascript
// server/models/Factura.model.js - AGREGAR CAMPOS CAEA

const facturaSchema = new Schema({
  // ... campos existentes ...
  
  // CAMPOS PARA CAE (Ya deberías tenerlos)
  cae: {
    type: String,
    sparse: true, // Permite null, pero único si existe
    validate: {
      validator: function(v) {
        return !v || /^\d{14}$/.test(v); // 14 dígitos
      },
      message: 'CAE debe tener 14 dígitos'
    }
  },
  caeFechaVencimiento: {
    type: Date
  },
  
  // NUEVOS CAMPOS PARA CAEA
  caea: {
    type: String,
    sparse: true,
    validate: {
      validator: function(v) {
        return !v || /^\d{14}$/.test(v);
      },
      message: 'CAEA debe tener 14 dígitos'
    }
  },
  caeaFechaVencimiento: {
    type: Date
  },
  caeaPeriodoQuincena: {
    type: Number,
    enum: [1, 2], // 1 = primera quincena, 2 = segunda quincena
  },
  caeaPeriodoMes: {
    type: Number,
    min: 1,
    max: 12
  },
  caeaPeriodoAnio: {
    type: Number
  },
  
  // Tipo de emisión
  tipoEmision: {
    type: String,
    enum: ['CAE', 'CAEA'],
    required: true,
    default: 'CAE'
  },
  
  // Estado de informar CAEA
  caeaInformado: {
    type: Boolean,
    default: false
  },
  caeaFechaInformado: {
    type: Date
  }
}, {
  timestamps: true
});

// Índices para búsquedas eficientes
facturaSchema.index({ caea: 1 });
facturaSchema.index({ tipoEmision: 1 });
facturaSchema.index({ caeaInformado: 1 });
facturaSchema.index({ 
  caeaPeriodoAnio: 1, 
  caeaPeriodoMes: 1, 
  caeaPeriodoQuincena: 1 
});
```

---

#### **Servicio de Simulación AFIP/ARCA**

```javascript
// server/services/afipSimulacionService.js - CREAR NUEVO ARCHIVO

const { Factura } = require('../models');
const Contador = require('../models/contador.model');

class AFIPSimulacionService {
  
  /**
   * Simula la solicitud de CAEA
   * Según Manual ARCA sección 2.3
   */
  async solicitarCAEA(periodo, mes, anio) {
    try {
      // Validar período (1 o 2)
      if (![1, 2].includes(periodo)) {
        throw new Error('Período debe ser 1 (primera quincena) o 2 (segunda quincena)');
      }
      
      // Validar mes (1-12)
      if (mes < 1 || mes > 12) {
        throw new Error('Mes debe estar entre 1 y 12');
      }
      
      // Generar CAEA simulado (14 dígitos)
      const caea = this.generarCAEASimulado();
      
      // Calcular fecha de vencimiento del CAEA
      // El CAEA vence al finalizar la quincena siguiente
      const fechaVencimiento = this.calcularVencimientoCAEA(periodo, mes, anio);
      
      return {
        success: true,
        data: {
          caea: caea,
          fechaVencimiento: fechaVencimiento,
          periodo: periodo,
          mes: mes,
          anio: anio,
          resultado: 'A', // A = Aprobado
          observaciones: []
        }
      };
      
    } catch (error) {
      console.error('Error solicitando CAEA:', error);
      throw error;
    }
  }
  
  /**
   * Simula autorización de factura con CAE
   * (Modo normal - cuando AFIP responde)
   */
  async autorizarConCAE(datosFactura) {
    try {
      // Simular llamada a AFIP
      // En producción real, aquí iría la llamada SOAP al ws de AFIP
      
      const cae = this.generarCAESimulado();
      const fechaVencimiento = this.calcularVencimientoCAE();
      
      return {
        success: true,
        data: {
          cae: cae,
          caeFechaVencimiento: fechaVencimiento,
          resultado: 'A', // A = Aprobado
          observaciones: [],
          fechaProceso: new Date()
        }
      };
      
    } catch (error) {
      // Si falla, retornar error para activar CAEA
      return {
        success: false,
        error: error.message,
        usarCAEA: true // Bandera para usar CAEA
      };
    }
  }
  
  /**
   * Genera factura con CAEA (modo contingencia)
   */
  async emitirConCAEA(datosFactura, caeaActivo) {
    try {
      // Validar que el CAEA esté activo y no vencido
      if (!caeaActivo || new Date() > caeaActivo.fechaVencimiento) {
        throw new Error('CAEA no válido o vencido');
      }
      
      return {
        success: true,
        data: {
          caea: caeaActivo.caea,
          caeaFechaVencimiento: caeaActivo.fechaVencimiento,
          tipoEmision: 'CAEA',
          periodo: caeaActivo.periodo,
          mes: caeaActivo.mes,
          anio: caeaActivo.anio,
          resultado: 'A'
        }
      };
      
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * Informa comprobantes emitidos con CAEA
   * Según Manual ARCA sección 2.18
   */
  async informarComprobantesCAEA(facturas) {
    try {
      // Simular envío de información a AFIP
      // En producción: método FECAEARegInformativo
      
      const resultados = facturas.map(factura => ({
        facturaId: factura._id,
        resultado: 'A', // A = Aprobado
        observaciones: []
      }));
      
      return {
        success: true,
        data: {
          cantidadInformadas: facturas.length,
          resultados: resultados,
          fechaProceso: new Date()
        }
      };
      
    } catch (error) {
      throw error;
    }
  }
  
  // ========== MÉTODOS AUXILIARES ==========
  
  generarCAEASimulado() {
    // Generar 14 dígitos aleatorios para simulación
    return Math.floor(10000000000000 + Math.random() * 90000000000000).toString();
  }
  
  generarCAESimulado() {
    // Generar 14 dígitos aleatorios
    return Math.floor(10000000000000 + Math.random() * 90000000000000).toString();
  }
  
  calcularVencimientoCAE() {
    // CAE vence 10 días después de la emisión
    const fecha = new Date();
    fecha.setDate(fecha.getDate() + 10);
    return fecha;
  }
  
  calcularVencimientoCAEA(periodo, mes, anio) {
    // CAEA vence al final de la quincena siguiente
    let diaVencimiento;
    
    if (periodo === 1) {
      // Primera quincena: vence el 15
      diaVencimiento = 15;
    } else {
      // Segunda quincena: vence el último día del mes
      diaVencimiento = new Date(anio, mes, 0).getDate();
    }
    
    return new Date(anio, mes - 1, diaVencimiento, 23, 59, 59);
  }
  
  /**
   * Verifica si se debe usar CAEA
   * (simula verificación de conectividad con AFIP)
   */
  async verificarDisponibilidadAFIP() {
    // En simulación, retornamos true
    // En producción, aquí se haría un ping al ws de AFIP
    return {
      disponible: true,
      mensaje: 'Servicio AFIP disponible (simulado)'
    };
  }
}

module.exports = new AFIPSimulacionService();
```

---

#### **Controlador de Facturas - Integrar CAEA**

```javascript
// server/controllers/facturaController.js

const { Factura } = require('../models');
const afipService = require('../services/afipSimulacionService');

/**
 * Generar factura (con lógica CAE/CAEA)
 */
exports.generarFactura = async (req, res) => {
  try {
    const {
      alumnoId,
      conceptos, // array de conceptos facturables
      tipoComprobante, // 'A', 'B', 'C'
      puntoVenta,
      // ... otros campos
    } = req.body;
    
    // 1. Validar datos
    // ... validaciones ...
    
    // 2. Obtener siguiente número de factura
    const numeroFactura = await obtenerSiguienteNumero(puntoVenta, tipoComprobante);
    
    // 3. Calcular totales
    const totales = calcularTotales(conceptos);
    
    // 4. Crear factura en BD (aún sin CAE/CAEA)
    const factura = new Factura({
      alumnoId,
      conceptos,
      tipoComprobante,
      puntoVenta,
      numeroFactura,
      ...totales,
      estado: 'pendiente_autorizacion'
    });
    
    // 5. Intentar obtener CAE (modo normal)
    const verificarAFIP = await afipService.verificarDisponibilidadAFIP();
    
    if (verificarAFIP.disponible) {
      // ==== MODO NORMAL: USAR CAE ====
      const resultadoCAE = await afipService.autorizarConCAE({
        factura: factura.toObject()
      });
      
      if (resultadoCAE.success) {
        factura.cae = resultadoCAE.data.cae;
        factura.caeFechaVencimiento = resultadoCAE.data.caeFechaVencimiento;
        factura.tipoEmision = 'CAE';
        factura.estado = 'autorizada';
        
        await factura.save();
        
        return res.status(201).json({
          success: true,
          message: 'Factura generada y autorizada con CAE',
          data: factura,
          tipoAutorizacion: 'CAE'
        });
      }
    }
    
    // ==== MODO CONTINGENCIA: USAR CAEA ====
    // 6. Obtener CAEA activo para el período actual
    const caeaActivo = await obtenerCAEAActivo();
    
    if (!caeaActivo) {
      return res.status(500).json({
        success: false,
        error: 'No hay CAEA disponible y AFIP no responde. Solicite un CAEA primero.'
      });
    }
    
    const resultadoCAEA = await afipService.emitirConCAEA(
      factura.toObject(),
      caeaActivo
    );
    
    if (resultadoCAEA.success) {
      factura.caea = resultadoCAEA.data.caea;
      factura.caeaFechaVencimiento = resultadoCAEA.data.caeaFechaVencimiento;
      factura.tipoEmision = 'CAEA';
      factura.caeaPeriodoQuincena = resultadoCAEA.data.periodo;
      factura.caeaPeriodoMes = resultadoCAEA.data.mes;
      factura.caeaPeriodoAnio = resultadoCAEA.data.anio;
      factura.estado = 'autorizada_caea'; // Estado especial
      factura.caeaInformado = false; // Pendiente de informar
      
      await factura.save();
      
      return res.status(201).json({
        success: true,
        message: 'Factura generada con CAEA (modo contingencia)',
        data: factura,
        tipoAutorizacion: 'CAEA',
        warning: 'Recuerde informar esta factura a AFIP cuando el servicio esté disponible'
      });
    }
    
  } catch (error) {
    console.error('Error generando factura:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Solicitar CAEA para un período
 */
exports.solicitarCAEA = async (req, res) => {
  try {
    const { periodo, mes, anio } = req.body;
    
    // Validar que no exista ya un CAEA para ese período
    const caeaExistente = await verificarCAEAExistente(periodo, mes, anio);
    if (caeaExistente) {
      return res.status(400).json({
        success: false,
        error: 'Ya existe un CAEA para ese período'
      });
    }
    
    // Solicitar CAEA a AFIP (simulado)
    const resultado = await afipService.solicitarCAEA(periodo, mes, anio);
    
    if (resultado.success) {
      // Guardar CAEA en colección separada o en configuración
      await guardarCAEA(resultado.data);
      
      return res.status(200).json({
        success: true,
        message: 'CAEA solicitado exitosamente',
        data: resultado.data
      });
    }
    
  } catch (error) {
    console.error('Error solicitando CAEA:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Informar comprobantes emitidos con CAEA
 */
exports.informarComprobantesCAEA = async (req, res) => {
  try {
    // Buscar facturas con CAEA pendientes de informar
    const facturasPendientes = await Factura.find({
      tipoEmision: 'CAEA',
      caeaInformado: false,
      estado: 'autorizada_caea'
    });
    
    if (facturasPendientes.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No hay facturas pendientes de informar'
      });
    }
    
    // Informar a AFIP
    const resultado = await afipService.informarComprobantesCAEA(facturasPendientes);
    
    if (resultado.success) {
      // Actualizar facturas como informadas
      await Factura.updateMany(
        { _id: { $in: facturasPendientes.map(f => f._id) } },
        { 
          $set: { 
            caeaInformado: true, 
            caeaFechaInformado: new Date(),
            estado: 'autorizada' // Cambiar a autorizada normal
          } 
        }
      );
      
      return res.status(200).json({
        success: true,
        message: `${resultado.data.cantidadInformadas} facturas informadas exitosamente`,
        data: resultado.data
      });
    }
    
  } catch (error) {
    console.error('Error informando comprobantes CAEA:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// ========== FUNCIONES AUXILIARES ==========

async function obtenerCAEAActivo() {
  // Implementar lógica para obtener CAEA activo del período actual
  // Podría ser de una colección CAEA o de configuración
  // Por ahora, simulación básica
  const hoy = new Date();
  const mes = hoy.getMonth() + 1;
  const anio = hoy.getFullYear();
  const periodo = hoy.getDate() <= 15 ? 1 : 2;
  
  // Buscar en BD o retornar null si no existe
  // return await CAEA.findOne({ mes, anio, periodo, activo: true });
  
  return null; // Modificar según implementación
}

async function guardarCAEA(datosCAEA) {
  // Guardar CAEA en colección específica o configuración
  // Implementar según diseño
}

async function verificarCAEAExistente(periodo, mes, anio) {
  // Verificar si ya existe CAEA para ese período
  return false; // Modificar según implementación
}
```

---

### **1.3 Rutas para CAEA**

```javascript
// server/routes/factura.routes.js

const express = require('express');
const router = express.Router();
const facturaController = require('../controllers/facturaController');
const { authenticate, authorizeRoles } = require('../middleware/auth');

// Rutas existentes de facturas
router.post('/', 
  authenticate, 
  authorizeRoles('admin'), 
  facturaController.generarFactura
);

router.get('/', 
  authenticate, 
  facturaController.listarFacturas
);

// NUEVAS RUTAS PARA CAEA
router.post('/caea/solicitar', 
  authenticate, 
  authorizeRoles('admin'), 
  facturaController.solicitarCAEA
);

router.post('/caea/informar', 
  authenticate, 
  authorizeRoles('admin'), 
  facturaController.informarComprobantesCAEA
);

router.get('/caea/pendientes', 
  authenticate, 
  authorizeRoles('admin'), 
  async (req, res) => {
    try {
      const facturasPendientes = await Factura.find({
        tipoEmision: 'CAEA',
        caeaInformado: false
      }).populate('alumnoId');
      
      res.json({
        success: true,
        data: {
          cantidad: facturasPendientes.length,
          facturas: facturasPendientes
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

module.exports = router;
```

---

### **1.4 Testing de Simulación CAEA**

```javascript
// server/tests/caea.test.js

const request = require('supertest');
const app = require('../app');
const { Factura } = require('../models');

describe('Simulación CAEA', () => {
  let adminToken;
  
  beforeAll(async () => {
    // Obtener token de admin para tests
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@example.com',
        password: 'AdminPassword123'
      });
    
    adminToken = response.body.token;
  });
  
  describe('POST /api/facturas/caea/solicitar', () => {
    it('Debería solicitar CAEA para primera quincena', async () => {
      const response = await request(app)
        .post('/api/facturas/caea/solicitar')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          periodo: 1, // Primera quincena
          mes: 11, // Noviembre
          anio: 2025
        });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.caea).toMatch(/^\d{14}$/); // 14 dígitos
      expect(response.body.data.periodo).toBe(1);
    });
    
    it('Debería rechazar período inválido', async () => {
      const response = await request(app)
        .post('/api/facturas/caea/solicitar')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          periodo: 3, // Inválido
          mes: 11,
          anio: 2025
        });
      
      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
    });
  });
  
  describe('Generación de factura con CAEA', () => {
    it('Debería generar factura con CAEA en modo contingencia', async () => {
      // Test específico para CAEA
      // ... implementar
    });
  });
  
  describe('POST /api/facturas/caea/informar', () => {
    it('Debería informar facturas con CAEA', async () => {
      const response = await request(app)
        .post('/api/facturas/caea/informar')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });
});
```

---

### **1.5 Documentación de Endpoints CAEA**

```markdown
## Endpoints CAEA

### 1. Solicitar CAEA
**POST** `/api/facturas/caea/solicitar`

**Headers:**
```
Authorization: Bearer <token_admin>
```

**Body:**
```json
{
  "periodo": 1,  // 1 = primera quincena, 2 = segunda quincena
  "mes": 11,     // 1-12
  "anio": 2025
}
```

**Response 200:**
```json
{
  "success": true,
  "message": "CAEA solicitado exitosamente",
  "data": {
    "caea": "12345678901234",
    "fechaVencimiento": "2025-11-15T23:59:59.000Z",
    "periodo": 1,
    "mes": 11,
    "anio": 2025,
    "resultado": "A",
    "observaciones": []
  }
}
```

### 2. Informar Comprobantes CAEA
**POST** `/api/facturas/caea/informar`

**Headers:**
```
Authorization: Bearer <token_admin>
```

**Response 200:**
```json
{
  "success": true,
  "message": "5 facturas informadas exitosamente",
  "data": {
    "cantidadInformadas": 5,
    "resultados": [...],
    "fechaProceso": "2025-10-30T15:30:00.000Z"
  }
}
```

### 3. Ver Facturas Pendientes de Informar
**GET** `/api/facturas/caea/pendientes`

**Headers:**
```
Authorization: Bearer <token_admin>
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "cantidad": 3,
    "facturas": [...]
  }
}
```
```

---

### **1.6 Checklist de Completitud CAEA**

- [ ] Modelo Factura actualizado con campos CAEA
- [ ] Servicio AFIPSimulacionService creado
- [ ] Controlador facturaController con métodos CAEA
- [ ] Rutas CAEA configuradas
- [ ] Tests unitarios de CAEA
- [ ] Documentación de endpoints
- [ ] Validaciones de período y fecha
- [ ] Manejo de errores
- [ ] Logs de operaciones CAEA
- [ ] PR a rama Dev preparado

---

## 🟡 FASE 2: CONECTAR BACKEND CON FRONTEND DE COBROS

### **2.1 Análisis de Componentes Frontend**

#### Componente Actual: `PaymentRegistration.jsx`
**Ubicación:** `client/src/components/PaymentRegistration.jsx`

**Problemas:**
1. ❌ Nombre confuso - debería ser `StudentChargeRegistration.jsx` o `StudentInvoicing.jsx`
2. ❌ Usa datos MOCK hardcodeados
3. ❌ No está conectado al backend real
4. ❌ Terminología incorrecta (dice "Pagos" en lugar de "Cobros")

---

### **2.2 Plan de Corrección y Conexión**

#### **Paso 1: Renombrar y Reestructurar Componente**

```bash
# En client/src/components/
mv PaymentRegistration.jsx StudentChargeRegistration.jsx
```

#### **Paso 2: Crear Servicio API para Facturas**

```javascript
// client/src/services/facturaService.js - CREAR NUEVO ARCHIVO

import api from './api'; // Tu configuración axios existente

const facturaService = {
  /**
   * Listar todas las facturas (con filtros opcionales)
   */
  async getAll(filters = {}) {
    const params = new URLSearchParams();
    
    if (filters.alumnoId) params.append('alumnoId', filters.alumnoId);
    if (filters.estado) params.append('estado', filters.estado);
    if (filters.desde) params.append('desde', filters.desde);
    if (filters.hasta) params.append('hasta', filters.hasta);
    
    const response = await api.get(`/facturas?${params.toString()}`);
    return response.data;
  },
  
  /**
   * Obtener una factura por ID
   */
  async getById(id) {
    const response = await api.get(`/facturas/${id}`);
    return response.data;
  },
  
  /**
   * Crear nueva factura
   */
  async create(facturaData) {
    const response = await api.post('/facturas', facturaData);
    return response.data;
  },
  
  /**
   * Obtener facturas de un alumno
   */
  async getByAlumno(alumnoId) {
    const response = await api.get(`/facturas/alumno/${alumnoId}`);
    return response.data;
  },
  
  /**
   * Obtener facturas pendientes
   */
  async getPendientes() {
    const response = await api.get('/facturas?estado=pendiente');
    return response.data;
  },
  
  /**
   * Solicitar CAEA
   */
  async solicitarCAEA(periodo, mes, anio) {
    const response = await api.post('/facturas/caea/solicitar', {
      periodo,
      mes,
      anio
    });
    return response.data;
  },
  
  /**
   * Informar comprobantes CAEA
   */
  async informarCAEA() {
    const response = await api.post('/facturas/caea/informar');
    return response.data;
  },
  
  /**
   * Obtener facturas pendientes de informar CAEA
   */
  async getPendientesCAEA() {
    const response = await api.get('/facturas/caea/pendientes');
    return response.data;
  }
};

export default facturaService;
```

#### **Paso 3: Crear Servicio API para Cobros**

```javascript
// client/src/services/cobroService.js - CREAR NUEVO ARCHIVO

import api from './api';

const cobroService = {
  /**
   * Registrar un cobro (pago parcial o total de factura)
   */
  async registrarCobro(cobroData) {
    const response = await api.post('/cobros', cobroData);
    return response.data;
  },
  
  /**
   * Listar cobros con filtros
   */
  async getAll(filters = {}) {
    const params = new URLSearchParams();
    
    if (filters.facturaId) params.append('facturaId', filters.facturaId);
    if (filters.alumnoId) params.append('alumnoId', filters.alumnoId);
    if (filters.desde) params.append('desde', filters.desde);
    if (filters.hasta) params.append('hasta', filters.hasta);
    
    const response = await api.get(`/cobros?${params.toString()}`);
    return response.data;
  },
  
  /**
   * Obtener cobros de una factura
   */
  async getByFactura(facturaId) {
    const response = await api.get(`/cobros/factura/${facturaId}`);
    return response.data;
  },
  
  /**
   * Obtener cobros de un alumno
   */
  async getByAlumno(alumnoId) {
    const response = await api.get(`/cobros/alumno/${alumnoId}`);
    return response.data;
  }
};

export default cobroService;
```

---

#### **Paso 4: Refactorizar Componente Principal**

```jsx
// client/src/components/StudentChargeRegistration.jsx

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import facturaService from '../services/facturaService';
import cobroService from '../services/cobroService';
import './StudentChargeRegistration.css';

// Validación con Yup
const schema = yup.object({
  alumnoId: yup.string().required('Debe seleccionar un alumno'),
  conceptos: yup.array().min(1, 'Debe agregar al menos un concepto'),
  tipoComprobante: yup.string().required('Debe seleccionar tipo de comprobante'),
}).required();

const StudentChargeRegistration = () => {
  const [alumnos, setAlumnos] = useState([]);
  const [conceptosDisponibles, setConceptosDisponibles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(schema)
  });
  
  // Cargar datos iniciales
  useEffect(() => {
    cargarDatos();
  }, []);
  
  const cargarDatos = async () => {
    try {
      setLoading(true);
      
      // Cargar alumnos (ajustar endpoint según tu API)
      const responseAlumnos = await api.get('/auth/students');
      setAlumnos(responseAlumnos.data.data || []);
      
      // Cargar conceptos facturables (ajustar endpoint)
      const responseConceptos = await api.get('/conceptos');
      setConceptosDisponibles(responseConceptos.data.data || []);
      
    } catch (error) {
      console.error('Error cargando datos:', error);
      setError('Error al cargar datos iniciales');
    } finally {
      setLoading(false);
    }
  };
  
  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      // Generar factura
      const resultado = await facturaService.create({
        alumnoId: data.alumnoId,
        conceptos: data.conceptos,
        tipoComprobante: data.tipoComprobante,
        puntoVenta: 1, // Ajustar según tu lógica
        // ... otros campos necesarios
      });
      
      if (resultado.success) {
        setSuccess(`Factura generada exitosamente. Número: ${resultado.data.numeroFactura}`);
        
        // Si se generó con CAEA, mostrar advertencia
        if (resultado.tipoAutorizacion === 'CAEA') {
          setSuccess(prev => 
            `${prev}\n\nATENCIÓN: Factura emitida con CAEA (modo contingencia). Recuerde informarla a AFIP.`
          );
        }
        
        // Limpiar formulario o redirigir
        // reset();
      }
      
    } catch (error) {
      console.error('Error generando factura:', error);
      setError(error.response?.data?.error || 'Error al generar factura');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="student-charge-container">
      <h2>Facturación - Cobros a Alumnos</h2>
      
      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}
      
      {success && (
        <div className="alert alert-success">
          {success}
        </div>
      )}
      
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Selector de Alumno */}
        <div className="form-group">
          <label>Alumno *</label>
          <select {...register('alumnoId')} className="form-control">
            <option value="">Seleccione un alumno</option>
            {alumnos.map(alumno => (
              <option key={alumno._id} value={alumno._id}>
                {alumno.firstName} {alumno.lastName} - DNI: {alumno.dni}
              </option>
            ))}
          </select>
          {errors.alumnoId && (
            <span className="error-message">{errors.alumnoId.message}</span>
          )}
        </div>
        
        {/* Tipo de Comprobante */}
        <div className="form-group">
          <label>Tipo de Comprobante *</label>
          <select {...register('tipoComprobante')} className="form-control">
            <option value="">Seleccione</option>
            <option value="A">Factura A</option>
            <option value="B">Factura B</option>
            <option value="C">Factura C</option>
          </select>
          {errors.tipoComprobante && (
            <span className="error-message">{errors.tipoComprobante.message}</span>
          )}
        </div>
        
        {/* Conceptos Facturables */}
        {/* TODO: Implementar componente de selección de conceptos */}
        
        {/* Botones */}
        <div className="form-actions">
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Generando...' : 'Generar Factura'}
          </button>
          
          <button 
            type="button" 
            className="btn btn-secondary"
            onClick={() => window.history.back()}
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};

export default StudentChargeRegistration;
```

---

### **2.3 Componente de Listado de Facturas**

```jsx
// client/src/components/FacturasList.jsx

import React, { useState, useEffect } from 'react';
import facturaService from '../services/facturaService';
import './FacturasList.css';

const FacturasList = () => {
  const [facturas, setFacturas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({
    estado: '',
    desde: '',
    hasta: ''
  });
  
  useEffect(() => {
    cargarFacturas();
  }, [filtros]);
  
  const cargarFacturas = async () => {
    try {
      setLoading(true);
      const response = await facturaService.getAll(filtros);
      
      if (response.success) {
        setFacturas(response.data);
      }
    } catch (error) {
      console.error('Error cargando facturas:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleFiltroChange = (e) => {
    setFiltros({
      ...filtros,
      [e.target.name]: e.target.value
    });
  };
  
  if (loading) return <div>Cargando facturas...</div>;
  
  return (
    <div className="facturas-list-container">
      <h2>Listado de Facturas</h2>
      
      {/* Filtros */}
      <div className="filtros-container">
        <select 
          name="estado" 
          value={filtros.estado}
          onChange={handleFiltroChange}
        >
          <option value="">Todos los estados</option>
          <option value="pendiente">Pendiente</option>
          <option value="autorizada">Autorizada</option>
          <option value="pagada">Pagada</option>
          <option value="vencida">Vencida</option>
        </select>
        
        {/* Más filtros */}
      </div>
      
      {/* Tabla de Facturas */}
      <table className="facturas-table">
        <thead>
          <tr>
            <th>Número</th>
            <th>Alumno</th>
            <th>Fecha</th>
            <th>Importe</th>
            <th>Estado</th>
            <th>CAE/CAEA</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {facturas.map(factura => (
            <tr key={factura._id}>
              <td>{factura.numeroFactura}</td>
              <td>
                {factura.alumnoId?.firstName} {factura.alumnoId?.lastName}
              </td>
              <td>{new Date(factura.fecha).toLocaleDateString()}</td>
              <td>${factura.total.toFixed(2)}</td>
              <td>
                <span className={`badge badge-${factura.estado}`}>
                  {factura.estado}
                </span>
              </td>
              <td>
                {factura.tipoEmision === 'CAE' ? (
                  <span title={`CAE: ${factura.cae}`}>CAE</span>
                ) : (
                  <span 
                    title={`CAEA: ${factura.caea}`}
                    className="badge-caea"
                  >
                    CAEA
                    {!factura.caeaInformado && ' ⚠️'}
                  </span>
                )}
              </td>
              <td>
                <button 
                  onClick={() => verDetalle(factura._id)}
                  className="btn btn-sm btn-info"
                >
                  Ver
                </button>
                <button 
                  onClick={() => cobrarFactura(factura._id)}
                  className="btn btn-sm btn-success"
                  disabled={factura.estado === 'pagada'}
                >
                  Cobrar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {facturas.length === 0 && (
        <div className="no-results">
          No se encontraron facturas
        </div>
      )}
    </div>
  );
};

export default FacturasList;
```

---

### **2.4 Componente para Registrar Cobros**

```jsx
// client/src/components/CobroForm.jsx

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import cobroService from '../services/cobroService';

const CobroForm = ({ factura, onCobroRegistrado }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: {
      monto: factura.saldoPendiente || factura.total,
      metodoPago: 'efectivo',
      notas: ''
    }
  });
  
  const montoWatch = watch('monto');
  const esPagoCompleto = parseFloat(montoWatch) === factura.saldoPendiente;
  
  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setError(null);
      
      const resultado = await cobroService.registrarCobro({
        facturaId: factura._id,
        alumnoId: factura.alumnoId,
        monto: parseFloat(data.monto),
        metodoPago: data.metodoPago,
        notas: data.notas
      });
      
      if (resultado.success) {
        alert('Cobro registrado exitosamente');
        onCobroRegistrado && onCobroRegistrado(resultado.data);
      }
      
    } catch (error) {
      console.error('Error registrando cobro:', error);
      setError(error.response?.data?.error || 'Error al registrar cobro');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="cobro-form-container">
      <h3>Registrar Cobro</h3>
      
      <div className="factura-info">
        <p><strong>Factura:</strong> {factura.numeroFactura}</p>
        <p><strong>Total:</strong> ${factura.total.toFixed(2)}</p>
        <p><strong>Saldo Pendiente:</strong> ${factura.saldoPendiente.toFixed(2)}</p>
      </div>
      
      {error && <div className="alert alert-error">{error}</div>}
      
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="form-group">
          <label>Monto a Cobrar *</label>
          <input 
            type="number" 
            step="0.01"
            max={factura.saldoPendiente}
            className="form-control"
            {...register('monto', {
              required: 'El monto es requerido',
              min: { value: 0.01, message: 'El monto debe ser mayor a 0' },
              max: { 
                value: factura.saldoPendiente, 
                message: `El monto no puede superar el saldo pendiente ($${factura.saldoPendiente})` 
              }
            })}
          />
          {errors.monto && (
            <span className="error-message">{errors.monto.message}</span>
          )}
          
          {esPagoCompleto && (
            <span className="info-message">
              ✓ Pago completo - La factura quedará saldada
            </span>
          )}
        </div>
        
        <div className="form-group">
          <label>Método de Pago *</label>
          <select className="form-control" {...register('metodoPago')}>
            <option value="efectivo">Efectivo</option>
            <option value="transferencia">Transferencia</option>
            <option value="tarjeta">Tarjeta</option>
            <option value="cheque">Cheque</option>
          </select>
        </div>
        
        <div className="form-group">
          <label>Notas</label>
          <textarea 
            className="form-control"
            rows="3"
            {...register('notas')}
            placeholder="Observaciones adicionales..."
          />
        </div>
        
        <div className="form-actions">
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Registrando...' : 'Registrar Cobro'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CobroForm;
```

---

### **2.5 Integración en Rutas**

```jsx
// client/src/App.jsx

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import StudentChargeRegistration from './components/StudentChargeRegistration';
import FacturasList from './components/FacturasList';
// ... otros imports

function App() {
  return (
    <Router>
      <Routes>
        {/* ... rutas existentes ... */}
        
        {/* Rutas de facturación */}
        <Route 
          path="/facturas" 
          element={<FacturasList />} 
        />
        
        <Route 
          path="/facturas/nueva" 
          element={<StudentChargeRegistration />} 
        />
        
        {/* Rutas de cobros */}
        <Route 
          path="/cobros" 
          element={<CobrosHistory />} 
        />
      </Routes>
    </Router>
  );
}

export default App;
```

---

### **2.6 Checklist de Conexión Frontend-Backend**

**Backend:**
- [ ] Verificar que endpoints de facturas funcionan
- [ ] Verificar que endpoints de cobros funcionan
- [ ] Verificar CORS configurado correctamente
- [ ] Validar respuestas JSON consistentes
- [ ] Agregar logs para debugging

**Frontend:**
- [ ] Renombrar componente PaymentRegistration → StudentChargeRegistration
- [ ] Crear facturaService.js
- [ ] Crear cobroService.js
- [ ] Actualizar componente para usar servicios reales
- [ ] Eliminar/comentar código MOCK
- [ ] Agregar manejo de errores
- [ ] Agregar loading states
- [ ] Agregar validaciones
- [ ] Testing de integración

**Integración:**
- [ ] Probar creación de factura desde frontend
- [ ] Probar registro de cobro desde frontend
- [ ] Probar listado de facturas
- [ ] Probar filtros
- [ ] Verificar que datos se muestran correctamente
- [ ] Verificar flujo CAEA desde frontend

---

## 🔵 FASE 3: PREPARACIÓN PARA FUNCIONALIDADES FUTURAS

### **3.1 Estructura para Pagos a Profesores**

```javascript
// server/models/PagoProfesor.model.js - CREAR ESTRUCTURA BÁSICA

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const pagoProfesorSchema = new Schema({
  profesorId: {
    type: Schema.Types.ObjectId,
    ref: 'users', // Referencia a colección de usuarios
    required: true
  },
  
  periodo: {
    mes: { type: Number, required: true, min: 1, max: 12 },
    anio: { type: Number, required: true }
  },
  
  clasesImpartidas: [{
    claseId: {
      type: Schema.Types.ObjectId,
      ref: 'Clase'
    },
    fecha: Date,
    duracion: Number, // minutos
    tarifaAplicada: Number
  }],
  
  montoTotal: {
    type: Number,
    required: true,
    min: 0
  },
  
  montoBruto: Number,
  deducciones: [{
    concepto: String,
    monto: Number
  }],
  montoNeto: Number,
  
  estado: {
    type: String,
    enum: ['pendiente', 'procesado', 'pagado', 'cancelado'],
    default: 'pendiente'
  },
  
  metodoPago: {
    type: String,
    enum: ['transferencia', 'efectivo', 'cheque', 'mercadopago'],
    default: 'transferencia'
  },
  
  fechaPago: Date,
  comprobante: String, // URL o referencia al comprobante
  
  notas: String
  
}, {
  timestamps: true
});

// Índices
pagoProfesorSchema.index({ profesorId: 1, 'periodo.mes': 1, 'periodo.anio': 1 });
pagoProfesorSchema.index({ estado: 1 });
pagoProfesorSchema.index({ fechaPago: 1 });

module.exports = mongoose.model('PagoProfesor', pagoProfesorSchema);
```

---

### **3.2 Stub para Integración MercadoPago**

```javascript
// server/services/mercadopagoService.js - ESTRUCTURA BÁSICA

class MercadoPagoService {
  constructor() {
    this.accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN || null;
    this.publicKey = process.env.MERCADOPAGO_PUBLIC_KEY || null;
  }
  
  /**
   * Crear preferencia de pago
   * TODO: Implementar cuando se integre MercadoPago
   */
  async crearPreferencia(datosFactura) {
    // Placeholder
    throw new Error('Método no implementado aún');
  }
  
  /**
   * Procesar webhook de MercadoPago
   * TODO: Implementar cuando se integre MercadoPago
   */
  async procesarWebhook(payload) {
    // Placeholder
    throw new Error('Método no implementado aún');
  }
}

module.exports = new MercadoPagoService();
```

---

### **3.3 Variables de Entorno Requeridas**

```bash
# server/.env - AGREGAR AL FINAL

# ========== CONFIGURACIÓN AFIP/ARCA ==========
AFIP_ENVIRONMENT=homologacion  # homologacion | produccion
AFIP_CUIT=20123456789
AFIP_PUNTO_VENTA=00001

# ========== CONFIGURACIÓN MERCADOPAGO (FUTURO) ==========
MERCADOPAGO_ACCESS_TOKEN=
MERCADOPAGO_PUBLIC_KEY=
MERCADOPAGO_WEBHOOK_SECRET=
```

---

## 📋 PRUEBAS Y TESTING

### **Testing de Backend**

```bash
# Ejecutar tests
npm test

# Tests específicos de CAEA
npm test -- caea.test.js

# Tests de integración facturas
npm test -- factura.test.js
```

### **Testing de Frontend**

```bash
# En /client
npm test

# Testing de servicios
npm test -- facturaService.test.js
```

### **Testing Manual con Thunder Client o Postman**

**Collection de Thunder Client:**

1. **Solicitar CAEA**
   - POST `http://localhost:5000/api/facturas/caea/solicitar`
   - Body: `{ "periodo": 1, "mes": 11, "anio": 2025 }`
   - Header: `Authorization: Bearer <token>`

2. **Crear Factura**
   - POST `http://localhost:5000/api/facturas`
   - Body: (ver documentación)
   - Verificar si retorna CAE o CAEA

3. **Listar Facturas**
   - GET `http://localhost:5000/api/facturas`
   
4. **Informar Comprobantes CAEA**
   - POST `http://localhost:5000/api/facturas/caea/informar`

---

## 🚀 ESTRATEGIA DE PR Y MERGE

### **1. Orden de PRs**

```
1. PR aye/simulacionArca → Dev
   ├─ Simulación CAEA completa
   ├─ Tests pasando
   └─ Documentación actualizada

2. PR financial-acutalizada → Dev
   ├─ Frontend conectado a backend
   ├─ Componentes renombrados
   └─ MOCK eliminado

3. Merge de otras ramas financial
   ├─ Consolidar feature/aye-financial-module
   ├─ Consolidar aye/feature/payments
   └─ Resolver conflictos
```

### **2. Checklist pre-PR**

```markdown
## PR: Simulación ARCA/CAEA

### Cambios Realizados
- [ ] Modelo Factura actualizado con campos CAEA
- [ ] Servicio AFIPSimulacionService implementado
- [ ] Controlador con endpoints CAEA
- [ ] Rutas configuradas
- [ ] Tests unitarios
- [ ] Documentación de endpoints

### Testing
- [ ] Tests unitarios pasan
- [ ] Tests de integración pasan
- [ ] Testing manual exitoso
- [ ] No hay errores en consola

### Documentación
- [ ] README actualizado
- [ ] Endpoints documentados
- [ ] Ejemplos de uso incluidos
- [ ] Variables de entorno documentadas

### Code Review
- [ ] Código revisado
- [ ] Sin console.logs en producción
- [ ] Validaciones implementadas
- [ ] Manejo de errores adecuado
```

---

## 📊 CONSOLIDACIÓN DE RAMAS FRONTEND

### **Plan de Consolidación**

```bash
# 1. Backup de ramas actuales
git checkout Dev
git pull origin Dev

# 2. Crear rama de consolidación
git checkout -b consolidacion-financial

# 3. Merge ordenado de ramas
git merge financial-acutalizada
# Resolver conflictos

git merge feature/aye-financial-module
# Resolver conflictos

git merge aye/feature/payments
# Resolver conflictos

git merge aye/feature/financial
# Resolver conflictos

# 4. Testing exhaustivo
npm test
npm run dev # Verificar que todo funciona

# 5. PR a Dev
git push origin consolidacion-financial
# Crear PR en GitHub
```

---

## 🎯 PRÓXIMOS PASOS RECOMENDADOS

### **Semana 1: CAEA**
- Día 1-2: Revisar código actual simulación ARCA
- Día 3-4: Implementar mejoras según manual
- Día 5: Testing y documentación
- Día 6-7: PR y code review

### **Semana 2: Conexión Frontend**
- Día 1-2: Crear servicios API (facturaService, cobroService)
- Día 3-4: Refactorizar componentes
- Día 5: Testing de integración
- Día 6-7: Consolidación de ramas

### **Semana 3: Refinamiento**
- Testing exhaustivo
- Corrección de bugs
- Documentación
- Preparación para demo

---

## 📝 NOTAS IMPORTANTES

### **Terminología Correcta**
❌ **EVITAR:** Pagos, Payments, PaymentRegistration  
✅ **USAR:** Cobros, Charges, StudentChargeRegistration

### **Conceptos Clave**
- **Factura:** Documento que emite el instituto al alumno
- **Cobro:** Registro de dinero recibido del alumno (parcial o total)
- **CAE:** Código normal de autorización (AFIP responde)
- **CAEA:** Código anticipado para contingencia (AFIP no responde)
- **Pago a Profesor:** Dinero que el instituto paga al profesor (futuro)

---

## 🔗 RECURSOS Y LINKS

### **Documentación ARCA/AFIP**
- Manual Desarrollador v4.0: [Adjunto en este análisis]
- Web Services AFIP: https://www.afip.gob.ar/ws/
- Facturación Electrónica: https://www.afip.gob.ar/fe/

### **Testing**
- Thunder Client: Extensión VS Code
- Postman: https://www.postman.com/

### **Repositorio**
- Dev: https://github.com/romarvz/PPIV_Consultora_de_Idiomas/tree/Dev
- Simulación ARCA: https://github.com/romarvz/PPIV_Consultora_de_Idiomas/tree/aye/simulacionArca

---

## ✅ RESULTADO ESPERADO

Al completar este plan, deberías tener:

1. ✅ **Simulación ARCA/CAEA completa y funcionando**
   - Solicitar CAEA
   - Generar facturas con CAE o CAEA
   - Informar comprobantes CAEA
   - Tests pasando

2. ✅ **Frontend conectado al Backend**
   - Componentes usando API real
   - Sin datos MOCK
   - Terminología correcta
   - Manejo de errores

3. ✅ **Código consolidado en Dev**
   - Ramas mergeadas
   - Conflictos resueltos
   - Documentación actualizada

4. ✅ **Base para próximas funcionalidades**
   - Estructura para pagos a profesores
   - Preparación para MercadoPago
   - Código limpio y mantenible

---

**¿Preguntas? ¿Necesitás ayuda con algún paso específico?**

Puedo ayudarte con:
- Revisar código específico
- Escribir tests
- Resolver conflictos de merge
- Implementar funcionalidades
- Debugging
- Documentación

¡Éxitos con el proyecto! 🚀
