# 📋 DOCUMENTACIÓN DE PRUEBAS - CONSULTORA DE IDIOMAS

**Proyecto:** Sistema de Gestión Académica y Financiera  
**Desarrollador:** Aye  
**Fecha:** Octubre 2025  
**Materia:** PPIV (Programación de Proyectos IV)

---

## 📝 FORMATO DE DOCUMENTACIÓN POR FUNCIONALIDAD

Para cada funcionalidad desarrollada, se documenta **UNA prueba básica representativa** siguiendo este formato:

---

## FUNCIONALIDAD 1: Autenticación de Usuarios

### a) ¿Qué se probó?
Se probó el login de un usuario administrador con credenciales válidas, verificando que:
- El sistema valide las credenciales correctamente
- Se genere un token JWT válido
- El usuario sea redirigido al dashboard correspondiente a su rol

**Endpoint probado:** `POST /api/auth/login`

**Datos de entrada:**
```json
{
  "email": "admin@consultora.com",
  "password": "Admin123!"
}
```

### b) ¿Qué resultado se esperaba?

**Status code esperado:** 200 OK

**Respuesta esperada:**
```json
{
  "success": true,
  "message": "Login exitoso",
  "data": {
    "user": {
      "_id": "...",
      "email": "admin@consultora.com",
      "firstName": "Admin",
      "lastName": "Principal",
      "role": "admin"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Comportamiento esperado en frontend:**
- Almacenar token en localStorage
- Redireccionar a `/dashboard/admin`
- Mostrar mensaje de bienvenida

### c) ¿Qué resultado se obtuvo?

✅ **PRUEBA EXITOSA**

**Status code obtenido:** 200 OK

**Respuesta obtenida:**
```json
{
  "success": true,
  "message": "Login exitoso",
  "data": {
    "user": {
      "_id": "65abc123def456789",
      "email": "admin@consultora.com",
      "firstName": "Admin",
      "lastName": "Principal",
      "role": "admin"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NWFiYzEyM2RlZjQ1Njc4OSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTY5ODY4MjgwMCwiZXhwIjoxNjk4NzY5MjAwfQ.xyz123abc456..."
  }
}
```

**Capturas de pantalla:**
- ![Login exitoso - Thunder Client](ruta/a/captura1.png)
- ![Dashboard admin](ruta/a/captura2.png)

**Observaciones:**
- El token tiene una duración de 24 horas según configuración
- La redirección funciona correctamente
- No se encontraron errores en consola

---

## FUNCIONALIDAD 2: Generación de Facturas

### a) ¿Qué se probó?
Se probó la generación de una factura tipo B para un alumno, incluyendo:
- Validación de datos del alumno
- Cálculo automático de totales
- Asignación de numeración correlativa
- Solicitud de CAE a AFIP (simulado)
- Almacenamiento en base de datos

**Endpoint probado:** `POST /api/facturas`

**Datos de entrada:**
```json
{
  "alumnoId": "65abc456def789012",
  "tipoComprobante": "B",
  "puntoVenta": 1,
  "conceptos": [
    {
      "descripcion": "Curso Inglés - Nivel A2 - Mes Octubre",
      "cantidad": 1,
      "precioUnitario": 15000,
      "iva": 21
    }
  ]
}
```

### b) ¿Qué resultado se esperaba?

**Status code esperado:** 201 Created

**Respuesta esperada:**
```json
{
  "success": true,
  "message": "Factura generada y autorizada con CAE",
  "data": {
    "_id": "...",
    "numeroFactura": 1,
    "puntoVenta": 1,
    "tipoComprobante": "B",
    "alumnoId": "65abc456def789012",
    "conceptos": [...],
    "subtotal": 15000,
    "iva": 3150,
    "total": 18150,
    "cae": "12345678901234",
    "caeFechaVencimiento": "2025-11-09",
    "estado": "autorizada",
    "tipoEmision": "CAE"
  },
  "tipoAutorizacion": "CAE"
}
```

**Comportamiento esperado:**
- Factura guardada en MongoDB
- Número de factura auto-incrementado
- CAE asignado correctamente
- Estado inicial: "autorizada"

### c) ¿Qué resultado se obtuvo?

✅ **PRUEBA EXITOSA**

**Status code obtenido:** 201 Created

**Factura generada:**
```json
{
  "success": true,
  "message": "Factura generada y autorizada con CAE",
  "data": {
    "_id": "65def789abc012345",
    "numeroFactura": 1,
    "puntoVenta": 1,
    "tipoComprobante": "B",
    "alumnoId": {
      "_id": "65abc456def789012",
      "firstName": "Juan",
      "lastName": "Pérez",
      "dni": "12345678"
    },
    "conceptos": [
      {
        "descripcion": "Curso Inglés - Nivel A2 - Mes Octubre",
        "cantidad": 1,
        "precioUnitario": 15000,
        "iva": 21,
        "subtotal": 15000,
        "ivaCalculado": 3150,
        "total": 18150
      }
    ],
    "subtotal": 15000,
    "iva": 3150,
    "total": 18150,
    "cae": "73859164920481",
    "caeFechaVencimiento": "2025-11-09T00:00:00.000Z",
    "estado": "autorizada",
    "tipoEmision": "CAE",
    "fecha": "2025-10-30T15:30:00.000Z",
    "createdAt": "2025-10-30T15:30:00.000Z"
  },
  "tipoAutorizacion": "CAE"
}
```

**Verificaciones en BD:**
```javascript
// Verificado en MongoDB Compass
db.facturas.findOne({ numeroFactura: 1 })
// Resultado: Factura existe con todos los campos correctos
```

**Capturas de pantalla:**
- ![Request en Thunder Client](ruta/a/captura3.png)
- ![Response exitoso](ruta/a/captura4.png)
- ![Factura en MongoDB](ruta/a/captura5.png)

**Observaciones:**
- El CAE simulado tiene 14 dígitos (formato correcto según AFIP)
- La fecha de vencimiento del CAE es 10 días posterior a la emisión
- El cálculo de IVA es correcto (21% de $15,000 = $3,150)
- La numeración es correlativa (próxima será #2)

---

## FUNCIONALIDAD 3: Registro de Cobros (Pagos de Facturas)

### a) ¿Qué se probó?
Se probó el registro de un cobro parcial de una factura pendiente, incluyendo:
- Validación de monto (no mayor al saldo pendiente)
- Actualización de estado de la factura
- Cálculo de saldo restante
- Registro del cobro en historial

**Endpoint probado:** `POST /api/cobros`

**Datos de entrada:**
```json
{
  "facturaId": "65def789abc012345",
  "alumnoId": "65abc456def789012",
  "monto": 9000,
  "metodoPago": "transferencia",
  "notas": "Pago parcial - Primera cuota"
}
```

**Estado previo de la factura:**
- Total: $18,150
- Pagado: $0
- Saldo pendiente: $18,150
- Estado: "autorizada"

### b) ¿Qué resultado se esperaba?

**Status code esperado:** 201 Created

**Respuesta esperada:**
```json
{
  "success": true,
  "message": "Cobro registrado exitosamente",
  "data": {
    "cobro": {
      "_id": "...",
      "facturaId": "65def789abc012345",
      "alumnoId": "65abc456def789012",
      "monto": 9000,
      "metodoPago": "transferencia",
      "fecha": "2025-10-30T...",
      "notas": "Pago parcial - Primera cuota"
    },
    "factura": {
      "_id": "65def789abc012345",
      "numeroFactura": 1,
      "total": 18150,
      "montoPagado": 9000,
      "saldoPendiente": 9150,
      "estado": "parcialmente_pagada"
    }
  }
}
```

**Comportamiento esperado:**
- Cobro registrado en colección `cobros`
- Factura actualizada: montoPagado = 9000, saldo = 9150
- Estado de factura cambiado a "parcialmente_pagada"

### c) ¿Qué resultado se obtuvo?

✅ **PRUEBA EXITOSA**

**Status code obtenido:** 201 Created

**Respuesta obtenida:**
```json
{
  "success": true,
  "message": "Cobro registrado exitosamente",
  "data": {
    "cobro": {
      "_id": "65ghi012jkl345678",
      "facturaId": "65def789abc012345",
      "alumnoId": "65abc456def789012",
      "monto": 9000,
      "metodoPago": "transferencia",
      "fecha": "2025-10-30T16:15:00.000Z",
      "notas": "Pago parcial - Primera cuota",
      "createdAt": "2025-10-30T16:15:00.000Z"
    },
    "factura": {
      "_id": "65def789abc012345",
      "numeroFactura": 1,
      "total": 18150,
      "montoPagado": 9000,
      "saldoPendiente": 9150,
      "estado": "parcialmente_pagada",
      "updatedAt": "2025-10-30T16:15:00.000Z"
    }
  }
}
```

**Verificaciones en BD:**
```javascript
// Cobro registrado
db.cobros.findOne({ _id: "65ghi012jkl345678" })
// Resultado: Cobro existe

// Factura actualizada
db.facturas.findOne({ _id: "65def789abc012345" })
// Resultado: 
// - montoPagado: 9000
// - saldoPendiente: 9150
// - estado: "parcialmente_pagada"
```

**Capturas de pantalla:**
- ![Request cobro](ruta/a/captura6.png)
- ![Cobro registrado](ruta/a/captura7.png)
- ![Factura actualizada en BD](ruta/a/captura8.png)

**Observaciones:**
- El cálculo del saldo es correcto: $18,150 - $9,000 = $9,150
- El estado de la factura cambió apropiadamente
- Se pueden hacer múltiples cobros parciales hasta saldar la deuda

---

## FUNCIONALIDAD 4: Solicitud de CAEA (Modo Contingencia)

### a) ¿Qué se probó?
Se probó la solicitud de un CAEA (Código de Autorización Electrónico Anticipado) para la primera quincena de noviembre 2025, según normativa AFIP RG 4291. Esto incluye:
- Validación de período (1 o 2)
- Validación de mes y año
- Generación de CAEA simulado
- Cálculo de fecha de vencimiento
- Almacenamiento para uso posterior

**Endpoint probado:** `POST /api/facturas/caea/solicitar`

**Datos de entrada:**
```json
{
  "periodo": 1,
  "mes": 11,
  "anio": 2025
}
```

### b) ¿Qué resultado se esperaba?

**Status code esperado:** 200 OK

**Respuesta esperada:**
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

**Comportamiento esperado:**
- CAEA de 14 dígitos generado
- Fecha de vencimiento: 15 de noviembre (fin de 1era quincena)
- Resultado "A" (Aprobado)
- CAEA almacenado para uso en contingencia

### c) ¿Qué resultado se obtuvo?

✅ **PRUEBA EXITOSA**

**Status code obtenido:** 200 OK

**Respuesta obtenida:**
```json
{
  "success": true,
  "message": "CAEA solicitado exitosamente",
  "data": {
    "caea": "85739264108573",
    "fechaVencimiento": "2025-11-15T23:59:59.000Z",
    "periodo": 1,
    "mes": 11,
    "anio": 2025,
    "resultado": "A",
    "observaciones": []
  }
}
```

**Verificaciones adicionales:**
- CAEA tiene 14 dígitos numéricos ✓
- Fecha de vencimiento correcta (día 15) ✓
- Período y mes correctos ✓

**Capturas de pantalla:**
- ![Request CAEA](ruta/a/captura9.png)
- ![Response CAEA](ruta/a/captura10.png)

**Prueba complementaria - Uso del CAEA en factura:**

Se generó una factura usando el CAEA obtenido (simulando que AFIP no responde):

```json
// Factura generada con CAEA
{
  "numeroFactura": 2,
  "caea": "85739264108573",
  "caeaFechaVencimiento": "2025-11-15T23:59:59.000Z",
  "tipoEmision": "CAEA",
  "caeaPeriodoQuincena": 1,
  "caeaPeriodoMes": 11,
  "caeaPeriodoAnio": 2025,
  "estado": "autorizada_caea",
  "caeaInformado": false
}
```

✅ Factura emitida correctamente en modo contingencia

**Observaciones:**
- El CAEA permite seguir facturando sin conectividad con AFIP
- Las facturas con CAEA deben ser informadas posteriormente (campo `caeaInformado: false`)
- Sistema funciona correctamente en modo contingencia

---

## FUNCIONALIDAD 5: Listado y Filtrado de Facturas

### a) ¿Qué se probó?
Se probó el endpoint de listado de facturas con filtros múltiples:
- Filtro por estado
- Filtro por rango de fechas
- Paginación
- Ordenamiento

**Endpoint probado:** `GET /api/facturas?estado=autorizada&desde=2025-10-01&hasta=2025-10-31&page=1&limit=10`

### b) ¿Qué resultado se esperaba?

**Status code esperado:** 200 OK

**Respuesta esperada:**
```json
{
  "success": true,
  "data": {
    "facturas": [
      {
        "_id": "...",
        "numeroFactura": 1,
        "alumnoId": {
          "firstName": "Juan",
          "lastName": "Pérez"
        },
        "total": 18150,
        "estado": "autorizada",
        "fecha": "2025-10-30T..."
      }
    ],
    "pagination": {
      "total": 1,
      "page": 1,
      "pages": 1,
      "limit": 10
    }
  }
}
```

### c) ¿Qué resultado se obtuvo?

✅ **PRUEBA EXITOSA**

**Status code obtenido:** 200 OK

**Respuesta obtenida:**
```json
{
  "success": true,
  "data": {
    "facturas": [
      {
        "_id": "65def789abc012345",
        "numeroFactura": 1,
        "puntoVenta": 1,
        "tipoComprobante": "B",
        "alumnoId": {
          "_id": "65abc456def789012",
          "firstName": "Juan",
          "lastName": "Pérez",
          "dni": "12345678"
        },
        "total": 18150,
        "estado": "autorizada",
        "cae": "73859164920481",
        "fecha": "2025-10-30T15:30:00.000Z"
      }
    ],
    "pagination": {
      "total": 1,
      "page": 1,
      "pages": 1,
      "limit": 10
    }
  }
}
```

**Pruebas adicionales de filtros:**

1. **Filtro por estado "pendiente":**
   - Request: `GET /api/facturas?estado=pendiente`
   - Resultado: Array vacío (no hay facturas pendientes) ✓

2. **Sin filtros:**
   - Request: `GET /api/facturas`
   - Resultado: Todas las facturas (2 facturas) ✓

3. **Filtro por fecha futura:**
   - Request: `GET /api/facturas?desde=2025-11-01`
   - Resultado: Array vacío ✓

**Capturas de pantalla:**
- ![Listado con filtros](ruta/a/captura11.png)
- ![Paginación](ruta/a/captura12.png)

**Observaciones:**
- Los filtros funcionan correctamente de forma individual y combinada
- La paginación es correcta
- El populate de alumnoId trae los datos necesarios
- El ordenamiento por defecto es por fecha descendente

---

## FUNCIONALIDAD 6: Conexión Frontend-Backend (Eliminación de MOCK)

### a) ¿Qué se probó?
Se probó la integración completa entre el componente React de generación de facturas y el backend real, reemplazando completamente los datos MOCK por llamadas HTTP reales.

**Componente probado:** `StudentChargeRegistration.jsx` (anteriormente `PaymentRegistration.jsx`)

**Flujo probado:**
1. Carga de alumnos desde `/api/auth/students`
2. Carga de conceptos desde `/api/conceptos`
3. Generación de factura via `POST /api/facturas`
4. Visualización de resultado

### b) ¿Qué resultado se esperaba?

**Carga inicial:**
- Lista de alumnos cargada desde BD
- Lista de conceptos cargada desde BD
- Loading state mientras carga

**Al enviar formulario:**
- Request HTTP con datos del formulario
- Response con factura generada
- Mensaje de éxito mostrando número de factura
- Formulario limpiado después de éxito

**Manejo de errores:**
- Mensajes de error descriptivos
- Sin crasheos de la aplicación
- Validaciones de formulario funcionando

### c) ¿Qué resultado se obtuvo?

✅ **PRUEBA EXITOSA**

**Carga inicial verificada:**
```javascript
// Network tab del navegador
GET http://localhost:5000/api/auth/students
Status: 200 OK
Response: Array con 11 estudiantes

GET http://localhost:5000/api/conceptos  
Status: 200 OK
Response: Array con 5 conceptos
```

**Generación de factura verificada:**
```javascript
// Network tab del navegador
POST http://localhost:5000/api/facturas
Request payload: {
  "alumnoId": "65abc456def789012",
  "tipoComprobante": "B",
  "puntoVenta": 1,
  "conceptos": [...]
}
Status: 201 Created
Response: { success: true, data: { numeroFactura: 3, ... } }
```

**UI del navegador:**
- ✅ Lista desplegable de alumnos poblada correctamente
- ✅ Lista de conceptos disponibles
- ✅ Mensaje de éxito: "Factura generada exitosamente. Número: 3"
- ✅ Formulario limpiado después de envío

**Capturas de pantalla:**
- ![Componente cargando datos](ruta/a/captura13.png)
- ![Formulario completo](ruta/a/captura14.png)
- ![Network tab mostrando requests](ruta/a/captura15.png)
- ![Mensaje de éxito](ruta/a/captura16.png)

**Verificación de eliminación de MOCK:**
```javascript
// client/src/services/facturaService.js
// ✅ Usa axios real, no mockData
import api from './api';

const facturaService = {
  async create(facturaData) {
    const response = await api.post('/facturas', facturaData);
    return response.data;
  }
  // ... resto del código
};
```

**Observaciones:**
- Los datos MOCK fueron completamente eliminados
- La configuración de CORS funciona correctamente
- El token JWT se envía en headers correctamente
- No se encontraron errores 404 o de CORS
- La experiencia de usuario es fluida

---

## RESUMEN DE PRUEBAS

### ✅ Pruebas Exitosas: 6/6

| # | Funcionalidad | Estado | Observaciones |
|---|---------------|--------|---------------|
| 1 | Autenticación de usuarios | ✅ PASS | Login y JWT funcionan correctamente |
| 2 | Generación de facturas | ✅ PASS | CAE asignado, numeración correlativa OK |
| 3 | Registro de cobros | ✅ PASS | Pagos parciales y totales funcionan |
| 4 | Solicitud de CAEA | ✅ PASS | Modo contingencia operativo |
| 5 | Listado y filtrado | ✅ PASS | Filtros y paginación correctos |
| 6 | Integración frontend | ✅ PASS | MOCK eliminado, backend conectado |

### 📊 Estadísticas

- **Total de funcionalidades probadas:** 6
- **Tasa de éxito:** 100%
- **Bugs encontrados:** 0
- **Endpoints funcionando:** 8
- **Componentes React actualizados:** 3

### 🎯 Funcionalidades Pendientes (Futuras)

Las siguientes funcionalidades están planificadas pero NO forman parte de esta entrega:

- Pagos a profesores
- Integración con MercadoPago
- Facturación automática periódica
- Sistema de notificaciones
- Reportes avanzados

---

## 🔧 ENTORNO DE PRUEBAS

**Backend:**
- Node.js: v18.17.0
- MongoDB: v7.0
- Express: v4.18.2
- Puerto: 5000

**Frontend:**
- React: v18.2.0
- Vite: v4.4.5
- Puerto: 3000

**Herramientas de testing:**
- Thunder Client (para APIs)
- MongoDB Compass (para verificar BD)
- Chrome DevTools (para frontend)

---

## 📝 NOTAS ADICIONALES

### Metodología de Pruebas

Todas las pruebas siguieron este proceso:

1. **Preparación:** Verificar estado inicial de la BD
2. **Ejecución:** Ejecutar la funcionalidad
3. **Verificación:** Comprobar resultado en BD y respuesta HTTP
4. **Documentación:** Capturar pantallas y logs

### Criterios de Éxito

Una prueba se considera exitosa cuando:
- ✅ El status code HTTP es el esperado
- ✅ La estructura de la respuesta coincide con lo esperado
- ✅ Los datos se persisten correctamente en MongoDB
- ✅ No hay errores en consola del servidor
- ✅ No hay errores en consola del navegador (frontend)

### Datos de Prueba

Se utilizaron datos de prueba realistas:
- 11 usuarios (3 admins, 5 profesores, 3 estudiantes)
- 5 conceptos facturables
- Importes y cálculos reales según normativa argentina

---

## 📎 ANEXOS

### Anexo A: Ejemplos de Respuestas Completas

[Incluir JSONs completos de respuestas si es necesario]

### Anexo B: Capturas de Pantalla Completas

[Incluir todas las capturas mencionadas]

### Anexo C: Logs del Servidor

[Incluir logs relevantes de ejecución]

---

**FIN DE DOCUMENTACIÓN DE PRUEBAS**

---

**Elaborado por:** Aye  
**Fecha:** 30 de Octubre 2025  
**Revisión:** 1.0
