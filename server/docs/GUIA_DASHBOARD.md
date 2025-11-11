# GUÍA DEL DASHBOARD
## API de Dashboard - Consultora de Idiomas
---

## Descripción

El Dashboard proporciona una vista consolidada del estado general de la empresa, incluyendo:
- KPIs principales (con caché de 5 minutos)
- Estadísticas de usuarios, cursos y clases
- Actividad reciente (últimos 7 días)
- Datos para gráficos (ingresos, estudiantes, clases, cobros)

**Consume datos de:**
- Cursos, Clases
- Cobros, Facturas
- BaseUser (usuarios)

---

## Endpoints Disponibles

### 1. GET /api/dashboard/empresa

**Descripción:** Obtiene información general de la empresa/consultora.

**Autenticación:** Requerida (cualquier rol autenticado)

**Request:**
```bash
GET /api/dashboard/empresa
Authorization: Bearer <token>
```

**Response exitosa (200):**
```json
{
  "success": true,
  "message": "Información de empresa obtenida",
  "data": {
    "_id": "64abc123...",
    "nombre": "Consultora de Idiomas",
    "ruc": "20-12345678-9",
    "direccion": {
      "calle": "Av. Corrientes 1234",
      "ciudad": "Buenos Aires",
      "provincia": "Buenos Aires",
      "codigoPostal": "C1043",
      "pais": "Argentina"
    },
    "contacto": {
      "telefono": "+54 11 1234-5678",
      "email": "info@consultora.com",
      "sitioWeb": "www.consultora.com"
    },
    "configuracion": {
      "horasMinimas": 1,
      "horasMaximas": 4,
      "diasAnticipacionCancelacion": 2,
      "porcentajePenalizacion": 50
    },
    "estadisticas": {
      "totalEstudiantes": 45,
      "totalProfesores": 8,
      "totalCursos": 15,
      "totalClases": 120,
      "ingresosTotal": 125000
    },
    "activa": true
  },
  "timestamp": "2025-11-02T14:30:00.000Z"
}
```

---

### 2. GET /api/dashboard/estadisticas

**Descripción:** Obtiene estadísticas generales del sistema.

**Autenticación:** Requerida (solo admin)

**Request:**
```bash
GET /api/dashboard/estadisticas
Authorization: Bearer <admin_token>
```

**Response exitosa (200):**
```json
{
  "success": true,
  "message": "Estadísticas obtenidas",
  "data": {
    "usuarios": {
      "estudiantes": 45,
      "profesores": 8,
      "admins": 2,
      "total": 55
    },
    "cursos": 12,
    "clases": 120,
    "ingresos": {
      "delMes": 45000,
      "facturasPendientes": 7
    }
  },
  "timestamp": "2025-11-02T14:30:00.000Z"
}
```

---

### 3. GET /api/dashboard/kpis

**Descripción:** Obtiene los KPIs (Key Performance Indicators) principales.

**Autenticación:** Requerida (solo admin)

**Caché:** 5 minutos (optimización)

**Request:**
```bash
GET /api/dashboard/kpis
Authorization: Bearer <admin_token>
```

**Response exitosa (200):**
```json
{
  "success": true,
  "message": "KPIs obtenidos exitosamente",
  "data": {
    "totalUsuarios": 55,
    "estudiantesActivos": 45,
    "profesoresActivos": 8,
    "cursosActivos": 12,
    "clasesDelMes": 48,
    "ingresosMes": 45000,
    "facturasPendientes": 7
  },
  "timestamp": "2025-11-02T14:30:00.000Z"
}
```

**Descripción de KPIs:**
- `totalUsuarios`: Total de usuarios activos en el sistema
- `estudiantesActivos`: Estudiantes con estado activo
- `profesoresActivos`: Profesores con estado activo
- `cursosActivos`: Cursos en estado "activo" (Lorena)
- `clasesDelMes`: Clases programadas/completadas en el mes actual (Lorena)
- `ingresosMes`: Total de ingresos del mes actual (Ayelen - Cobros)
- `facturasPendientes`: Cantidad de facturas con estado "Pendiente" (Ayelen)

---

### 4. GET /api/dashboard/actividad-reciente 

**Descripción:** Obtiene actividad reciente del sistema (últimos 7 días).

**Autenticación:** Requerida (solo admin)

**Request:**
```bash
GET /api/dashboard/actividad-reciente
Authorization: Bearer <admin_token>
```

**Response exitosa (200):**
```json
{
  "success": true,
  "message": "Actividad reciente obtenida",
  "data": {
    "inscripciones": [
      {
        "_id": "64abc...",
        "nombre": "Inglés Intermedio B1",
        "idioma": "ingles",
        "nivel": "B1",
        "estudiantes": [
          {
            "_id": "64def...",
            "firstName": "Juan",
            "lastName": "Pérez"
          }
        ],
        "profesor": {
          "_id": "64ghi...",
          "firstName": "María",
          "lastName": "González"
        },
        "createdAt": "2025-10-28T10:00:00.000Z"
      }
    ],
    "cobros": [
      {
        "_id": "64jkl...",
        "numeroRecibo": "REC-2025-001",
        "monto": 5000,
        "metodoCobro": "Transferencia",
        "fechaCobro": "2025-10-29T15:30:00.000Z",
        "estudiante": {
          "_id": "64def...",
          "firstName": "Juan",
          "lastName": "Pérez"
        }
      }
    ],
    "proximasClases": [
      {
        "_id": "64mno...",
        "titulo": "Clase 5: Present Perfect",
        "fechaHora": "2025-11-03T16:00:00.000Z",
        "duracionMinutos": 90,
        "modalidad": "virtual",
        "curso": {
          "_id": "64abc...",
          "nombre": "Inglés Intermedio B1",
          "idioma": "ingles",
          "nivel": "B1"
        },
        "profesor": {
          "_id": "64ghi...",
          "firstName": "María",
          "lastName": "González"
        }
      }
    ]
  },
  "timestamp": "2025-11-02T14:30:00.000Z"
}
```

---

### 5. GET /api/dashboard/graficos 

**Descripción:** Obtiene datos preparados para renderizar gráficos.

**Autenticación:** Requerida (solo admin)

**Request:**
```bash
GET /api/dashboard/graficos
Authorization: Bearer <admin_token>
```

**Response exitosa (200):**
```json
{
  "success": true,
  "message": "Datos de gráficos obtenidos",
  "data": {
    "ingresosPorMes": [
      { "mes": "may 2025", "ingresos": 32000 },
      { "mes": "jun 2025", "ingresos": 38000 },
      { "mes": "jul 2025", "ingresos": 41000 },
      { "mes": "ago 2025", "ingresos": 39000 },
      { "mes": "sep 2025", "ingresos": 43000 },
      { "mes": "oct 2025", "ingresos": 45000 }
    ],
    "estudiantesPorIdioma": [
      { "_id": "ingles", "cantidad": 25 },
      { "_id": "frances", "cantidad": 12 },
      { "_id": "aleman", "cantidad": 8 },
      { "_id": "italiano", "cantidad": 5 }
    ],
    "clasesPorEstado": [
      { "_id": "completada", "cantidad": 120 },
      { "_id": "programada", "cantidad": 35 },
      { "_id": "cancelada", "cantidad": 5 }
    ],
    "cobrosPorMetodo": [
      { 
        "_id": "Transferencia", 
        "cantidad": 45, 
        "totalMonto": 225000 
      },
      { 
        "_id": "Efectivo", 
        "cantidad": 20, 
        "totalMonto": 100000 
      },
      { 
        "_id": "Tarjeta", 
        "cantidad": 15, 
        "totalMonto": 75000 
      }
    ]
  },
  "timestamp": "2025-11-02T14:30:00.000Z"
}
```

**Gráficos incluidos:**
1. **Ingresos por mes:** Últimos 6 meses (para line chart)
2. **Estudiantes por idioma:** Distribución actual (para pie chart)
3. **Clases por estado:** Completadas, programadas, canceladas (para bar chart)
4. **Cobros por método:** Cantidad y monto total por método de pago (para bar chart)

---

### 6. PUT /api/dashboard/actualizar-estadisticas

**Descripción:** Actualizar estadísticas de la empresa (llamado automáticamente).

**Autenticación:** Requerida (solo admin)

**Request:**
```bash
PUT /api/dashboard/actualizar-estadisticas
Authorization: Bearer <admin_token>
```

**Response exitosa (200):**
```json
{
  "success": true,
  "message": "Estadísticas actualizadas",
  "data": null,
  "timestamp": "2025-11-02T14:30:00.000Z"
}
```

**Nota:** Este endpoint también invalida el caché de KPIs automáticamente.

---

### 7. POST /api/dashboard/invalidar-cache 

**Descripción:** Invalidar caché de KPIs manualmente (útil para debugging).

**Autenticación:** Requerida (solo admin)

**Request:**
```bash
POST /api/dashboard/invalidar-cache
Authorization: Bearer <admin_token>
```

**Response exitosa (200):**
```json
{
  "success": true,
  "message": "Caché invalidado exitosamente",
  "data": null,
  "timestamp": "2025-11-02T14:30:00.000Z"
}
```

---

## Flujos de Uso

### Flujo 1: Cargar Dashboard Admin

```
1. Frontend hace login → obtiene token admin
2. GET /api/dashboard/empresa → Info general
3. GET /api/dashboard/kpis → Métricas principales (desde caché si existe)
4. GET /api/dashboard/actividad-reciente → Últimos eventos
5. GET /api/dashboard/graficos → Datos para charts
6. Renderizar dashboard completo
```

### Flujo 2: Actualizar Estadísticas (automático)

```
1. Crea nuevo curso
2. Llama → dashboardService.actualizarEstadisticas()
3. Se recalculan totales
4. Caché de KPIs se invalida automáticamente
5. Próxima consulta GET /api/dashboard/kpis retorna datos frescos
```

### Flujo 3: Invalidar Caché Manualmente

```
1. Admin nota datos desactualizados
2. POST /api/dashboard/invalidar-cache
3. Caché se limpia
4. Próxima consulta recalcula todo
```

---

## Testing con Thunder Client

### Test 1: Obtener KPIs (con caché)

```json
{
  "method": "GET",
  "url": "{{base_url}}/api/dashboard/kpis",
  "headers": {
    "Authorization": "Bearer {{admin_token}}"
  }
}
```

**Primera llamada:** Calcula todo (puede tardar ~200ms)  
**Segunda llamada (dentro de 5 min):** Desde caché (~10ms)

### Test 2: Actividad Reciente

```json
{
  "method": "GET",
  "url": "{{base_url}}/api/dashboard/actividad-reciente",
  "headers": {
    "Authorization": "Bearer {{admin_token}}"
  }
}
```

**Resultado esperado:** Últimas inscripciones, cobros y próximas clases

### Test 3: Datos para Gráficos

```json
{
  "method": "GET",
  "url": "{{base_url}}/api/dashboard/graficos",
  "headers": {
    "Authorization": "Bearer {{admin_token}}"
  }
}
```

**Resultado esperado:** 4 conjuntos de datos listos para graficar

---

## Errores Comunes

### Error 401: No autenticado
```json
{
  "success": false,
  "error": "Token no proporcionado",
  "timestamp": "2025-11-02T14:30:00.000Z"
}
```
**Solución:** Incluir header `Authorization: Bearer <token>`

### Error 403: Sin permisos
```json
{
  "success": false,
  "error": "Acceso denegado. Rol no autorizado",
  "timestamp": "2025-11-02T14:30:00.000Z"
}
```
**Solución:** Usar token de admin para endpoints restringidos

### Error 500: Error al calcular
```json
{
  "success": false,
  "error": "Error al obtener estadísticas: ...",
  "timestamp": "2025-11-02T14:30:00.000Z"
}
```
**Solución:** 
- Verificar quelos modelos estén disponibles
- Revisar logs del servidor para detalles
- Verificar que hay datos en la BD

---

## Dependencias entre Módulos

```
Dashboard
    ├── Consume: BaseUser
    ├── Consume: Curso
    ├── Consume: Clase
    ├── Consume: Cobro
    └── Consume: Factura
```

**IMPORTANTE:** El Dashboard NO crea datos, solo los lee y consolida.

---

## Optimizaciones Implementadas

### 1. Caché de KPIs (5 minutos)
```javascript
// Primera llamada: calcula todo
GET /api/dashboard/kpis → 200ms

// Llamadas siguientes (< 5 min): desde caché
GET /api/dashboard/kpis → 10ms (20x más rápido)
```

### 2. Agregaciones MongoDB
```javascript
// En vez de:
const cobros = await Cobro.find()
const total = cobros.reduce((sum, c) => sum + c.monto, 0)

// Usamos:
const resultado = await Cobro.aggregate([
  { $group: { _id: null, total: { $sum: '$monto' } } }
])
```
**Beneficio:** 10-100x más rápido en datasets grandes

### 3. Índices en Modelos
Los modelos tienen índices en campos frecuentemente consultados:
- `Curso`: índice en `estado`
- `Clase`: índice en `fechaHora`
- `Cobro`: índice en `fechaCobro`

---

## Métricas de Performance

| Endpoint | Sin caché | Con caché | Mejora |
|----------|-----------|-----------|--------|
| `/kpis` | ~200ms | ~10ms | 20x |
| `/graficos` | ~350ms | N/A | - |
| `/actividad-reciente` | ~150ms | N/A | - |
| `/estadisticas` | ~180ms | N/A | - |

---

## Mantenimiento

### Cuándo invalidar caché manualmente:
- Después de importar datos masivos
- Si notas datos desactualizados
- Después de corregir bugs en cálculos

### Cómo monitorear:
```bash
# Ver logs del servidor
# Buscar líneas:
Retornando KPIs desde caché
Calculando KPIs frescos...
Caché de KPIs invalidado
```

---

## Notas para el Equipo

Cuando crees/actualices Cursos o Clases, considera llamar:
```javascript
await dashboardService.actualizarEstadisticas()
```

Cuando registres Cobros o Facturas, considera llamar:
```javascript
await dashboardService.actualizarEstadisticas()
```

Los reportes pueden consumir datos del dashboard:
```javascript
const kpis = await dashboardService.obtenerKPIs()
// Usar en reportes
```

---

## Glosario

- **KPI:** Key Performance Indicator (Indicador Clave de Desempeño)
- **Caché:** Almacenamiento temporal de datos para mejorar performance
- **TTL:** Time To Live (5 minutos en este caso)
- **Agregación:** Operación de MongoDB para calcular sobre múltiples documentos
- **Consolidado:** Datos combinados de múltiples fuentes

---
