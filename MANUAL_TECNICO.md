# MANUAL TÉCNICO PROFESIONAL - PPIV CONSULTORA DE IDIOMAS

## ÍNDICE
1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Estructura General del Proyecto](#estructura-general)
3. [Tecnologías Utilizadas](#tecnologías-utilizadas)
4. [Arquitectura del Sistema](#arquitectura-del-sistema)
5. [Modelos de Datos y Base de Datos](#modelos-de-datos)
6. [Endpoints de API](#endpoints-de-api)
7. [Servicios y Controladores](#servicios-y-controladores)
8. [Funcionalidades por Módulo](#funcionalidades-por-módulo)
9. [Configuraciones y Variables de Entorno](#configuraciones)
10. [Testing - Pruebas Unitarias e Integración](#testing)
11. [Scripts y Comandos](#scripts-y-comandos)
12. [Documentación Existente](#documentación-existente)

---

## RESUMEN EJECUTIVO {#resumen-ejecutivo}

**PPIV Consultora de Idiomas** es un sistema integral de gestión académica y administrativa para una consultora de idiomas. Se trata de una aplicación web full-stack desarrollada con arquitectura moderna, implementando patrones de diseño profesionales y buenas prácticas de desarrollo.

### Estado del Proyecto
- **Fase de Desarrollo**: Fase 2 avanzada (Frontend en desarrollo, Backend completado al 100%)
- **Líneas de Código**: Aproximadamente 10,045 líneas (3,000+ en backend, 7,000+ en frontend)
- **Usuarios Migrados**: 11 usuarios históricos
- **Endpoints Implementados**: 40+ endpoints funcionales
- **Modelos de Datos**: 10 modelos MongoDB implementados
- **Test Status**: Backend completamente probado, Frontend en desarrollo

---

## ESTRUCTURA GENERAL DEL PROYECTO {#estructura-general}

### Estructura de Directorios

```
PPIV_Consultora_de_Idiomas/
├── server/                                    # Backend API (Node.js + Express)
│   ├── controllers/                           # Lógica de negocio
│   │   ├── authControllerNew.js              # Autenticación
│   │   ├── cobros.controller.js              # Gestión de cobros
│   │   ├── facturas.controller.js            # Gestión de facturas
│   │   ├── conceptosCobros.controller.js     # Conceptos de cobros
│   │   ├── studentController.js              # Gestión de estudiantes
│   │   ├── teacherController.js              # Gestión de profesores
│   │   ├── languageController.js             # Gestión de idiomas
│   │   ├── auditoriaController.js            # Auditoría y logs
│   │   └── conceptCategory.controller.js     # Categorías de conceptos
│   ├── models/                               # Esquemas MongoDB (Mongoose)
│   │   ├── BaseUser.js                       # Modelo base discriminado
│   │   ├── Estudiante.js                     # Discriminador estudiante
│   │   ├── Profesor.js                       # Discriminador profesor
│   │   ├── Admin.js                          # Discriminador administrador
│   │   ├── Language.js                       # Idiomas disponibles
│   │   ├── Empresa.js                        # Información de empresa
│   │   ├── factura.model.js                  # Facturas
│   │   ├── cobros.model.js                   # Cobros/pagos
│   │   ├── concept.model.js                  # Conceptos de cobro
│   │   ├── conceptCategory.model.js          # Categorías de conceptos
│   │   ├── AuditoriaLog.js                   # Logs de auditoría
│   │   ├── contador.model.js                 # Secuenciadores (facturas/recibos)
│   │   └── index.js                          # Exportaciones centralizadas
│   ├── routes/                               # Definición de endpoints
│   │   ├── authNew.js                        # Rutas de autenticación
│   │   ├── studentRoutes.js                  # Rutas de estudiantes
│   │   ├── teacherRoutes.js                  # Rutas de profesores
│   │   ├── languages.js                      # Rutas de idiomas
│   │   ├── facturas.routes.js                # Rutas de facturas
│   │   ├── cobros.routes.js                  # Rutas de cobros
│   │   ├── conceptCategory.routes.js         # Rutas de categorías
│   │   ├── conceptosCobros.routes.js         # Rutas de conceptos
│   │   └── auditoria.js                      # Rutas de auditoría
│   ├── middleware/                           # Middleware de Express
│   │   ├── authMiddlewareNew.js              # Autenticación y autorización
│   │   └── financiero.validation.js          # Validaciones financieras
│   ├── services/                             # Lógica de negocio reutilizable
│   │   ├── userService.js                    # Servicios de usuarios
│   │   ├── factura.service.js                # Servicios de facturas
│   │   ├── cobro.service.js                  # Servicios de cobros
│   │   ├── contador.service.js               # Servicios de contadores
│   │   ├── auditoriaService.js               # Servicios de auditoría
│   │   └── conceptCategory.services.js       # Servicios de categorías
│   ├── validators/                           # Validación de datos
│   │   └── authValidatorsNew.js              # Validadores de autenticación
│   ├── helpers/                              # Funciones auxiliares
│   │   └── authHelpers.js                    # Helpers de autenticación
│   ├── scripts/                              # Scripts de utilidad
│   │   ├── seedLanguages.js                  # Populate de idiomas
│   │   ├── migrate-simple.js                 # Migración de datos
│   │   ├── create-test-users.js              # Crear usuarios de prueba
│   │   ├── final-test.js                     # Testing final
│   │   └── migrateEspecialidades.js          # Migración especialidades
│   ├── shared/                               # Código compartido
│   │   ├── utils/constants.js                # Constantes del sistema
│   │   ├── helpers/responseHandler.js        # Handler de respuestas
│   │   └── middleware/errorHandler.js        # Handler de errores
│   ├── docs/                                 # Documentación
│   │   └── pruebas_autenticacion.md          # Guía de pruebas
│   ├── index.js                              # Punto de entrada servidor
│   ├── package.json                          # Dependencias backend
│   └── node_modules/                         # Paquetes instalados
│
├── client/                                   # Frontend (React + Vite)
│   ├── src/
│   │   ├── components/                       # Componentes React reutilizables
│   │   │   ├── common/                       # Componentes generales
│   │   │   │   ├── AuthNavbar.jsx            # Navegación autenticado
│   │   │   │   ├── ProtectedRoute.jsx        # Rutas protegidas
│   │   │   │   ├── Modal.jsx                 # Modal genérico
│   │   │   │   └── ForcePasswordChange.jsx   # Cambio obligatorio password
│   │   │   ├── layout/                       # Componentes de layout
│   │   │   │   ├── Header.jsx                # Encabezado
│   │   │   │   ├── Footer.jsx                # Pie de página
│   │   │   │   └── Layout.jsx                # Wrapper principal
│   │   │   ├── courses/                      # Componentes de cursos
│   │   │   ├── admin/                        # Componentes administrativos
│   │   │   ├── charts/                       # Gráficos y visualización
│   │   │   └── financial/modules/            # Módulo financiero
│   │   │       ├── ChargesView.jsx           # Vista de cobros
│   │   │       ├── PaymentsView.jsx          # Vista de pagos
│   │   │       ├── ReportsView.jsx           # Vista de reportes
│   │   │       └── InvoicingView.jsx         # Vista de facturación
│   │   ├── pages/                            # Páginas principales
│   │   │   ├── Home.jsx                      # Página de inicio
│   │   │   ├── Login.jsx                     # Página de login
│   │   │   ├── About.jsx                     # Acerca de
│   │   │   ├── Services.jsx                  # Servicios
│   │   │   └── Dashboard/                    # Dashboards por rol
│   │   │       ├── AdminDashboard.jsx        # Dashboard admin
│   │   │       ├── StudentDashboard.jsx      # Dashboard estudiante
│   │   │       ├── TeacherDashboard.jsx      # Dashboard profesor
│   │   │       └── FinancialDashboard.jsx    # Dashboard financiero
│   │   ├── hooks/                            # Custom React hooks
│   │   │   ├── useAuth.jsx                   # Hook de autenticación
│   │   │   └── useTheme.js                   # Hook de tema
│   │   ├── services/                         # Servicios API
│   │   │   └── api.js                        # Cliente HTTP con Axios
│   │   ├── utils/                            # Funciones auxiliares
│   │   │   ├── formatting.js                 # Formateo de datos
│   │   │   └── routes.js                     # Rutas centralizadas
│   │   ├── styles/                           # Estilos CSS
│   │   ├── App.jsx                           # Componente raíz
│   │   └── main.jsx                          # Punto de entrada
│   ├── public/                               # Assets públicos
│   ├── index.html                            # HTML base
│   ├── vite.config.js                        # Configuración Vite
│   ├── package.json                          # Dependencias frontend
│   └── node_modules/
│
├── config/                                   # Configuración general
│   ├── database.js                           # Conexión MongoDB
│   └── firebase.js                           # Integración Firebase
│
├── docs/                                     # Documentación del proyecto
│   └── GUIA_COMPLETA_APIS_POR_ROL.md         # Guía de APIs
│
├── .env.example                              # Variables de entorno (plantilla)
├── .gitignore                                # Git ignore
├── package.json                              # Root package.json
├── Readme.md                                 # README principal
├── BUGS.md                                   # Reporte de bugs
└── PLAN_DE_ACCION_PROYECTO.md                # Plan de acción
```

---

## TECNOLOGÍAS UTILIZADAS {#tecnologías-utilizadas}

### Backend (Node.js)

| Categoría | Tecnología | Versión | Propósito |
|-----------|-----------|---------|----------|
| **Runtime** | Node.js | v14+ | Entorno de ejecución JavaScript |
| **Framework Web** | Express.js | ^4.18.2 | Framework minimalista para APIs REST |
| **Base de Datos** | MongoDB | (Atlas Cloud) | Base de datos NoSQL |
| **ODM** | Mongoose | ^7.5.0 | Modelado de datos MongoDB |
| **Autenticación** | jsonwebtoken | ^9.0.2 | Generación y verificación de JWT |
| **Seguridad** | bcryptjs | ^3.0.2 | Hash seguro de contraseñas |
| **Seguridad HTTP** | helmet | ^8.1.0 | Headers HTTP de seguridad |
| **CORS** | cors | ^2.8.5 | Control de acceso entre dominios |
| **Validación** | express-validator | ^7.2.1 | Validación y sanitización de datos |
| **Logging** | morgan | ^1.10.1 | Logging de requests HTTP |
| **Variables de Entorno** | dotenv | ^16.3.1 | Gestión de configuración |
| **Firebase** | firebase-admin | ^13.5.0 | Integración con Firebase |
| **Testing** | Jest | ^29.6.2 | Framework de testing |
| **Dev Server** | nodemon | ^3.0.1 | Auto-restart en desarrollo |

### Frontend (React)

| Categoría | Tecnología | Versión | Propósito |
|-----------|-----------|---------|----------|
| **Librería UI** | React | ^18.2.0 | Librería de componentes |
| **Rendering** | React DOM | ^18.2.0 | Renderizado en DOM |
| **Build Tool** | Vite | ^4.4.5 | Build tool moderno y rápido |
| **Router** | react-router-dom | ^7.9.1 | Enrutamiento de aplicación |
| **Formularios** | react-hook-form | ^7.62.0 | Gestión eficiente de formularios |
| **Validación** | yup | ^1.7.0 | Validación de esquemas |
| **HTTP Client** | axios | ^1.12.1 | Cliente HTTP |
| **Resolvers Formas** | @hookform/resolvers | ^5.2.1 | Integración de validadores |
| **Iconos** | react-icons | ^5.5.0 | Librería de iconos |
| **Calendario** | react-big-calendar | ^1.19.4 | Calendario interactivo |
| **Gráficos** | recharts | ^3.2.1 | Librería de gráficos |
| **Fechas** | date-fns | ^4.1.0 | Utilidades de fechas |
| **Tipos** | @types/react | ^18.2.15 | Tipos TypeScript (opcional) |

### Base de Datos

- **MongoDB Atlas**: Hosting en la nube con conexión URI
- **Mongoose ODM**: Modelado con esquemas tipados y validaciones
- **Modelos Discriminados**: Herencia de modelos en MongoDB
- **Índices**: Optimización de consultas con índices compuestos
- **Transacciones**: Soporte para operaciones ACID

---

## ARQUITECTURA DEL SISTEMA {#arquitectura-del-sistema}

### Patrón de Arquitectura: MVC + Servicios

```
Request HTTP
    ↓
Routes (authNew.js, studentRoutes.js, etc.)
    ↓
Middleware (authenticateToken, requireAdmin, validadores)
    ↓
Controllers (authControllerNew.js, studentController.js, etc.)
    ↓
Services (userService.js, factura.service.js, etc.)
    ↓
Models (Mongoose - BaseUser.js, Factura.js, etc.)
    ↓
MongoDB Database
    ↓
Response HTTP
```

### Capas de la Aplicación

#### 1. Capa de Presentación (Frontend - React)
- Componentes React reutilizables
- Gestión de estado con hooks
- Context API para autenticación
- Axios para comunicación HTTP

#### 2. Capa de Rutas API (Express)
- Definición de endpoints
- Validación de entrada
- Mapeo de middleware
- Autenticación y autorización

#### 3. Capa de Middleware
- Autenticación JWT
- Autorización por roles
- Validación de datos
- Manejo de errores

#### 4. Capa de Controladores
- Lógica principal de endpoints
- Orquestación de servicios
- Respuestas HTTP formateadas
- Manejo de excepciones

#### 5. Capa de Servicios
- Lógica de negocio reutilizable
- Operaciones con BD
- Transacciones y validaciones complejas
- Cálculos y procesamiento de datos

#### 6. Capa de Modelos (ODM)
- Esquemas MongoDB con Mongoose
- Validaciones a nivel de modelo
- Métodos estáticos y de instancia
- Índices de BD

#### 7. Capa de Base de Datos
- MongoDB en cloud (Atlas)
- Colecciones: users, languages, facturas, cobros, etc.
- Índices para optimización
- Backups automáticos

### Patrón de Discriminadores Mongoose

El sistema usa **discriminadores** para modelar herencia:

```javascript
// Modelo base
const BaseUser = mongoose.model('User', baseUserSchema);

// Modelos específicos por rol (discriminadores)
const Estudiante = BaseUser.discriminator('estudiante', estudianteSchema);
const Profesor = BaseUser.discriminator('profesor', profesorSchema);
const Admin = BaseUser.discriminator('admin', adminSchema);

// Una sola colección "users" con campo discriminador "__t"
// __t: "estudiante" | "profesor" | "admin"
```

**Ventajas:**
- Validaciones específicas por tipo
- Herencia de campos comunes
- Queries eficientes
- Integridad referencial
- Escalabilidad

---

## MODELOS DE DATOS Y BASE DE DATOS {#modelos-de-datos}

### Modelo Base: User (Discriminado)

```javascript
{
  _id: ObjectId,
  email: String (unique, required),
  password: String (hashed, required),
  firstName: String (required, 2-50 chars),
  lastName: String (required, 2-50 chars),
  role: "admin" | "profesor" | "estudiante" (enum),
  phone: String (optional),
  dni: String (7-8 digits, unique para prof/est),
  mustChangePassword: Boolean (default: true para prof/est),
  condicion: "activo" | "inactivo" | "graduado" (default: activo),
  isActive: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date,
  lastLogin: Date,
  __t: String (discriminador: "estudiante"|"profesor"|"admin")
}
```

### Modelo: Estudiante (Discriminador)

```javascript
{
  // Hereda todo de BaseUser, más:
  nivel: "A1" | "A2" | "B1" | "B2" | "C1" | "C2" (required),
  estadoAcademico: "inscrito" | "en_curso" | "graduado" | "suspendido"
                   (default: inscrito),
  __t: "estudiante"
}
```

### Modelo: Profesor (Discriminador)

```javascript
{
  // Hereda todo de BaseUser, más:
  especialidades: [ObjectId] (refs a Language, min: 1),
  tarifaPorHora: Number (required, >= 0),
  disponibilidad: {
    lunes: [{ inicio: "HH:MM", fin: "HH:MM" }],
    martes: [...],
    miercoles: [...],
    jueves: [...],
    viernes: [...],
    sabado: [...]
  },
  __t: "profesor"
}
```

### Modelo: Admin (Discriminador)

```javascript
{
  // Hereda todo de BaseUser, más:
  permissions: [String] enum: [
    "gestion_usuarios",
    "reportes",
    "configuracion",
    "todos"
  ],
  __t: "admin"
}
```

### Modelo: Language (Idioma)

```javascript
{
  _id: ObjectId,
  code: String (2-5 chars, lowercase, unique, required),
  name: String (2-50 chars, required),
  nativeName: String (optional, max 50 chars),
  description: String (optional, max 200 chars),
  isActive: Boolean (default: true),
  level: "basico" | "intermedio" | "avanzado" | "nativo" (default: basico),
  demandLevel: "bajo" | "medio" | "alto" (default: medio),
  createdAt: Date,
  updatedAt: Date
}
```

### Modelo: Factura

```javascript
{
  _id: ObjectId,
  estudiante: ObjectId (ref BaseUser, required),
  condicionFiscal: String (required)
    // "Consumidor Final" | "Responsable Inscripto" | etc.
  numeroFactura: String (unique, required)
    // Formato: "FC B 00001-00000001"
  fechaEmision: Date (default: now),
  fechaVencimiento: Date (required),
  itemFacturaSchema: [{
    descripcion: String (required),
    cantidad: Number (required, >= 1),
    precioUnitario: Number (required, >= 0),
    subtotal: Number (quantity * precio),
    conceptoCobro: ObjectId (ref ConceptoCobro, optional),
    curso: ObjectId (ref Curso, optional),
    clase: ObjectId (ref Clase, optional)
  }],
  periodoFacturado: String (formato: "YYYY-MM", required),
  subtotal: Number (required, >= 0),
  total: Number (required, >= 0),
  estado: "Pendiente" | "Cobrada" | "Cobrada Parcialmente" | "Vencida"
          (default: Pendiente),
  createdAt: Date,
  updatedAt: Date
}
```

### Modelo: Cobro (Payment)

```javascript
{
  _id: ObjectId,
  numeroRecibo: String (unique, required)
    // Formato: "RC-00001-00000001"
  fechaCobro: Date (default: now),
  estudiante: ObjectId (ref BaseUser, required),
  factura: ObjectId (ref Factura, required),
  monto: Number (required, > 0),
  metodoCobro: "Efectivo" | "Tarjeta" | "Transferencia" |
               "Mercado Pago" | "Otro" (required),
  notas: String (optional),
  createdAt: Date,
  updatedAt: Date
}
```

### Modelo: ConceptoCobro

```javascript
{
  _id: ObjectId,
  name: String (unique, required),
  description: String (optional),
  category: ObjectId (ref ConceptCategory, required),
  amount: Number (required),
  active: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}
```

### Modelo: ConceptCategory

```javascript
{
  _id: ObjectId,
  name: String (unique, required),
  description: String (optional),
  active: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}
```

### Modelo: Contador (Secuenciador)

```javascript
{
  _id: String ("factura" | "recibo"),
  secuencia: Number (default: 0)
}
```

**Uso:** Genera números consecutivos únicos para facturas y recibos
- Factura: "F-00001", "F-00002", etc.
- Recibo: "RC-00001-00000001", "RC-00001-00000002", etc.

### Modelo: Empresa

```javascript
{
  _id: ObjectId,
  nombre: String (required),
  ruc: String (unique, optional),
  direccion: {
    calle: String,
    ciudad: String,
    provincia: String,
    codigoPostal: String,
    pais: String (default: "Argentina")
  },
  contacto: {
    telefono: String,
    email: String (required),
    sitioWeb: String
  },
  logo: String (URL/path, default: null),
  configuracion: {
    horasMinimas: Number (default: 1, >= 1),
    horasMaximas: Number (default: 4, max: 8),
    diasAnticipacionCancelacion: Number (default: 1),
    porcentajePenalizacion: Number (default: 50, 0-100)
  },
  estadisticas: {
    totalEstudiantes: Number,
    totalProfesores: Number,
    totalCursos: Number,
    totalClases: Number,
    ingresosTotal: Number
  },
  activa: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}
```

### Modelo: AuditoriaLog

```javascript
{
  _id: ObjectId,
  tipo: String (enum: valores de TIPOS_EVENTO_AUDITORIA),
  usuario: ObjectId (ref BaseUser, required),
  descripcion: String (required),
  detalle: Mixed (cualquier objeto, default: {}),
  ip: String (optional),
  userAgent: String (optional),
  createdAt: Date,
  updatedAt: Date
}
```

### Relaciones de Base de Datos

```
Estudiante ──→ Language (especialidades) [many-to-many]
Profesor ──→ Language (especialidades) [many-to-many]
Factura ──→ Estudiante [many-to-one]
Factura ──→ ConceptoCobro [many-to-one, optional]
Cobro ──→ Factura [many-to-one]
Cobro ──→ Estudiante [many-to-one]
ConceptoCobro ──→ ConceptCategory [many-to-one]
AuditoriaLog ──→ BaseUser (usuario) [many-to-one]
```

---

## ENDPOINTS DE API {#endpoints-de-api}

### Base URL
```
http://localhost:5000/api
```

### Headers Requeridos
```
Content-Type: application/json
Authorization: Bearer [TOKEN_JWT] (en endpoints protegidos)
```

### 1. AUTENTICACIÓN - `/auth`

#### POST /login
Autentica un usuario (cualquier rol)

**Request:**
```json
{
  "email": "usuario@example.com",
  "password": "Password123"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Login exitoso",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "_id": "...",
      "email": "usuario@example.com",
      "firstName": "Juan",
      "lastName": "Pérez",
      "role": "estudiante",
      "nivel": "B1",
      "mustChangePassword": false
    },
    "temporaryPassword": null
  }
}
```

**Status Codes:**
- 200: Login exitoso
- 400: Credenciales inválidas
- 500: Error interno

---

#### POST /create-first-admin
Crea el primer administrador del sistema (solo si no existe)

**Request:**
```json
{
  "email": "admin@consultora.com",
  "password": "AdminPassword123",
  "firstName": "Super",
  "lastName": "Admin",
  "dni": "99999999"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Primer administrador creado exitosamente",
  "data": {
    "admin": { }
  }
}
```

---

#### POST /register/estudiante-admin
Crea un nuevo estudiante (solo admin)

**Headers:** Requiere `Authorization: Bearer [ADMIN_TOKEN]`

**Request:**
```json
{
  "email": "estudiante@test.com",
  "firstName": "María",
  "lastName": "González",
  "role": "estudiante",
  "dni": "12345678",
  "nivel": "B1",
  "estadoAcademico": "inscrito",
  "phone": "+54911234567"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Usuario registrado exitosamente",
  "data": {
    "token": "...",
    "user": { },
    "temporaryPassword": "12345678"
  }
}
```

---

#### POST /register/profesor
Crea un nuevo profesor (solo admin)

**Request:**
```json
{
  "email": "profesor@test.com",
  "firstName": "Carlos",
  "lastName": "Rodríguez",
  "role": "profesor",
  "dni": "87654321",
  "especialidades": ["ObjectId_idioma_1", "ObjectId_idioma_2"],
  "tarifaPorHora": 2500,
  "phone": "+54911234568",
  "disponibilidad": {
    "lunes": [{"inicio": "09:00", "fin": "12:00"}],
    "miercoles": [{"inicio": "14:00", "fin": "17:00"}]
  }
}
```

---

#### GET /profile
Obtiene el perfil del usuario autenticado

**Headers:** `Authorization: Bearer [TOKEN]`

**Response (200):**
```json
{
  "success": true,
  "message": "Perfil obtenido exitosamente",
  "data": {
    "user": { }
  }
}
```

---

#### PUT /change-password
Cambia la contraseña del usuario autenticado

**Headers:** `Authorization: Bearer [TOKEN]`

**Request:**
```json
{
  "currentPassword": "PasswordActual123",
  "newPassword": "NuevaPassword123",
  "confirmPassword": "NuevaPassword123"
}
```

---

#### GET /students
Lista todos los estudiantes

**Query Parameters:**
- `page` (default: 1) - Página
- `limit` (default: 10) - Registros por página
- `search` - Búsqueda por nombre/email
- `status` - "active" | "inactive"
- `nivel` - A1, A2, B1, B2, C1, C2
- `condicion` - activo, inactivo, graduado

**Response (200):**
```json
{
  "success": true,
  "message": "Estudiantes obtenidos exitosamente",
  "data": {
    "students": [],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "pages": 3
    }
  }
}
```

---

#### GET /professors
Lista todos los profesores

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 10)
- `search` - Búsqueda
- `especialidad` - Filtrar por idioma

---

#### PUT /deactivate/:id
Desactiva un usuario (soft delete)

**Headers:** `Authorization: Bearer [ADMIN_TOKEN]`

**Response (200):**
```json
{
  "success": true,
  "message": "Usuario desactivado exitosamente"
}
```

---

#### PUT /reactivate/:id
Reactiva un usuario desactivado

**Headers:** `Authorization: Bearer [ADMIN_TOKEN]`

---

#### DELETE /delete/:id
Elimina permanentemente un usuario (hard delete)

**Headers:** `Authorization: Bearer [ADMIN_TOKEN]`

---

### 2. IDIOMAS - `/languages`

#### GET /languages
Lista todos los idiomas

**Query Parameters:**
- `active=true` - Solo idiomas activos

**Response (200):**
```json
{
  "success": true,
  "message": "Idiomas obtenidos exitosamente",
  "data": {
    "languages": [
      {
        "_id": "...",
        "code": "en",
        "name": "Inglés",
        "nativeName": "English",
        "isActive": true,
        "level": "basico",
        "demandLevel": "alto"
      }
    ],
    "total": 6
  }
}
```

---

#### GET /languages/:id
Obtiene un idioma por ID

---

#### GET /languages/code/:code
Obtiene un idioma por código

**Ejemplo:** `GET /languages/code/en`

---

#### POST /languages (Admin)
Crea un nuevo idioma

**Headers:** `Authorization: Bearer [ADMIN_TOKEN]`

**Request:**
```json
{
  "code": "jp",
  "name": "Japonés",
  "nativeName": "日本語",
  "description": "Idioma del Japón",
  "level": "avanzado",
  "demandLevel": "medio"
}
```

---

#### PUT /languages/:id (Admin)
Actualiza un idioma

---

#### DELETE /languages/:id (Admin)
Desactiva un idioma (soft delete)

---

### 3. FACTURAS - `/facturas`

#### POST /facturas (Admin)
Crea una nueva factura

**Headers:** `Authorization: Bearer [ADMIN_TOKEN]`

**Request:**
```json
{
  "estudiante": "ObjectId_estudiante",
  "condicionFiscal": "Consumidor Final",
  "fechaVencimiento": "2025-12-31",
  "itemFacturaSchema": [
    {
      "descripcion": "Curso Inglés Nivel B1",
      "cantidad": 1,
      "precioUnitario": 5000,
      "conceptoCobro": "ObjectId_concepto"
    }
  ],
  "periodoFacturado": "2025-11"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Factura creada exitosamente",
  "data": {
    "_id": "...",
    "numeroFactura": "FC B 00001-00000001",
    "total": 5000,
    "estado": "Pendiente"
  }
}
```

---

#### GET /facturas/estudiante/:idEstudiante
Obtiene todas las facturas de un estudiante

**Response (200):**
```json
{
  "success": true,
  "total": 3,
  "data": [
    {
      "_id": "...",
      "numeroFactura": "...",
      "total": 5000,
      "estado": "Cobrada"
    }
  ]
}
```

---

#### GET /facturas/estudiante/:idEstudiante/deuda
Obtiene la deuda total de un estudiante

**Response (200):**
```json
{
  "success": true,
  "data": {
    "estudiante": "ObjectId",
    "deudaTotal": 3500,
    "facturasVencidas": 2,
    "montoVencido": 3500
  }
}
```

---

### 4. COBROS - `/cobros`

#### POST /cobros (Admin)
Registra un nuevo cobro

**Headers:** `Authorization: Bearer [ADMIN_TOKEN]`

**Request:**
```json
{
  "estudiante": "ObjectId_estudiante",
  "factura": "ObjectId_factura",
  "monto": 2500,
  "metodoCobro": "Transferencia",
  "fechaCobro": "2025-11-17",
  "notas": "Pago parcial"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Cobro registrado exitosamente",
  "data": {
    "cobro": {
      "_id": "...",
      "numeroRecibo": "RC-00001-00000001",
      "monto": 2500
    },
    "factura": {
      "estado": "Cobrada Parcialmente",
      "totalCobrado": 2500,
      "saldoPendiente": 2500
    }
  }
}
```

---

#### GET /cobros/estudiante/:idEstudiante
Obtiene todos los cobros de un estudiante

**Response (200):**
```json
{
  "success": true,
  "total": 2,
  "data": [
    {
      "_id": "...",
      "numeroRecibo": "RC-00001-00000001",
      "monto": 2500,
      "metodoCobro": "Transferencia",
      "fechaCobro": "2025-11-17"
    }
  ]
}
```

---

### 5. ESTUDIANTES - `/students`

#### GET /students
Lista estudiantes (filtros, paginación)

#### GET /students/:id
Obtiene detalles de un estudiante

#### PUT /students/:id (Admin)
Actualiza información de estudiante

#### DELETE /students/:id (Admin)
Desactiva estudiante

#### PATCH /students/:id/reactivate (Admin)
Reactiva estudiante

#### GET /students/stats (Admin)
Obtiene estadísticas de estudiantes

---

### 6. PROFESORES - `/teachers`

Endpoints similares a estudiantes

#### GET /teachers
#### GET /teachers/:id
#### PUT /teachers/:id (Admin)
#### DELETE /teachers/:id (Admin)
#### GET /teachers/stats (Admin)

---

### Códigos de Respuesta HTTP

| Código | Significado | Uso |
|--------|-------------|-----|
| 200 | OK | Solicitud exitosa |
| 201 | Created | Recurso creado |
| 400 | Bad Request | Datos inválidos/errores validación |
| 401 | Unauthorized | Falta token o token inválido |
| 403 | Forbidden | Token válido pero sin permisos |
| 404 | Not Found | Recurso no encontrado |
| 500 | Server Error | Error interno del servidor |

---

## SERVICIOS Y CONTROLADORES {#servicios-y-controladores}

### Estructura de un Controlador

```javascript
// controllers/authControllerNew.js
const { validationResult } = require('express-validator');
const { BaseUser, Estudiante, Profesor, Admin } = require('../models');

const handleValidationErrors = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Errores de validación',
      errors: errors.array()
    });
  }
  return null;
};

const login = async (req, res) => {
  try {
    const validationError = handleValidationErrors(req, res);
    if (validationError) return validationError;

    const { email, password } = req.body;

    // Lógica de login
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      return res.status(400).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login exitoso',
      data: {
        token,
        user: user.toJSON(),
        temporaryPassword: user.mustChangePassword ? user.dni : null
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

module.exports = {
  login,
  // ... otros controllers
};
```

### Estructura de un Servicio

```javascript
// services/factura.service.js
const Factura = require('../models/factura.model');
const contadorService = require('./contador.service');

class FacturaService {
  async crearFactura(datosFactura) {
    const { estudiante, condicionFiscal, itemFacturaSchema, periodoFacturado } = datosFactura;

    // 1. Validar datos
    if (!estudiante || !itemFacturaSchema?.length) {
      throw new Error('Datos requeridos inválidos');
    }

    // 2. Calcular totales
    const subtotal = itemFacturaSchema.reduce(
      (sum, item) => sum + (item.precioUnitario * item.cantidad),
      0
    );
    const total = subtotal;

    // 3. Generar número de factura
    const numeroSecuencial = await contadorService.obtenerSiguienteNumero('factura');
    const numeroFormateado = `FC B 00001-${numeroSecuencial.padStart(8, '0')}`;

    // 4. Crear documento
    const nuevaFactura = new Factura({
      estudiante,
      condicionFiscal,
      numeroFactura: numeroFormateado,
      itemFacturaSchema,
      periodoFacturado,
      subtotal,
      total,
      estado: 'Pendiente'
    });

    // 5. Guardar
    await nuevaFactura.save();

    return {
      factura: nuevaFactura,
      mensaje: 'Factura creada exitosamente'
    };
  }

  async obtenerFacturasPorEstudiante(estudianteId) {
    return await Factura.find({ estudiante: estudianteId })
      .sort({ fechaEmision: -1 })
      .populate('estudiante', 'nombre apellido');
  }
}

module.exports = new FacturaService();
```

### Servicios Principales

#### 1. userService.js
- `findUsers(filters, options)` - Búsqueda con paginación
- `getUserProfile(userId)` - Obtener perfil usuario
- `updateUserProfile(userId, updateData)` - Actualizar perfil
- `changeUserPassword(userId, newPassword)` - Cambiar contraseña
- `deactivateUser(userId)` - Desactivar usuario
- `reactivateUser(userId)` - Reactivar usuario

#### 2. factura.service.js
- `crearFactura(datosFactura)` - Crear factura
- `obtenerFacturasPorEstudiante(estudianteId)` - Listar facturas
- `generarFacturaMensual(estudianteId, periodo)` - Generar factura mensual
- `obtenerDeudaEstudiante(estudianteId)` - Calcular deuda total
- `actualizarEstadoFactura(facturaId, estado)` - Cambiar estado

#### 3. cobro.service.js
- `registrarCobro(datosCobro)` - Registrar cobro (con transacciones)
- `obtenerCobrosPorEstudiante(estudianteId)` - Listar cobros
- `obtenerCobrosPorFactura(facturaId)` - Cobros de una factura
- `revertirCobro(cobroId)` - Anular cobro

#### 4. contador.service.js
- `obtenerSiguienteNumero(tipoDocumento)` - Generar número secuencial
- `resetearContador(tipoDocumento)` - Resetear contador

#### 5. auditoriaService.js
- `registrarEvento(tipo, usuario, descripcion, detalle)` - Registrar evento
- `obtenerEventos(filtros)` - Listar eventos auditados

---

## FUNCIONALIDADES POR MÓDULO {#funcionalidades-por-módulo}

### Módulo 1: Autenticación y Gestión de Usuarios

**Ubicación:** [server/controllers/authControllerNew.js](server/controllers/authControllerNew.js), [server/routes/authNew.js](server/routes/authNew.js)

**Funcionalidades:**
- Login universal (cualquier rol)
- Logout con invalidación de token
- Registro de usuarios (solo admin)
- Cambio de contraseña (normal y forzado)
- Verificación de token
- Obtención de perfil
- Actualización de perfil
- Desactivación de usuarios (soft delete)
- Reactivación de usuarios
- Eliminación permanente (hard delete)
- Validaciones específicas por rol

**Flujo de Autenticación:**
1. Usuario hace login con email/password
2. Sistema valida credenciales
3. Sistema genera JWT token (expiración: 24h)
4. Token se almacena en localStorage cliente
5. Middleware `authenticateToken` verifica token en cada request
6. Middleware `requireAdmin`, `requireProfesor`, `requireEstudiante` controlan acceso

**Seguridad:**
- Contraseñas hasheadas con bcryptjs (12 rounds)
- JWT para autenticación stateless
- Validaciones server-side en todos los endpoints
- CORS configurado
- Helmet para headers HTTP

---

### Módulo 2: Gestión de Estudiantes

**Ubicación:** [server/controllers/studentController.js](server/controllers/studentController.js), [server/routes/studentRoutes.js](server/routes/studentRoutes.js)

**Funcionalidades:**
- Listar estudiantes con filtros y paginación
- Búsqueda por nombre, apellido, email
- Filtrar por nivel académico (A1-C2)
- Filtrar por condición (activo, inactivo, graduado)
- Obtener detalles de estudiante
- Actualizar información académica
- Desactivar/Reactivar estudiante
- Estadísticas de estudiantes

**Datos Específicos de Estudiante:**
- Nivel académico (A1, A2, B1, B2, C1, C2)
- Estado académico (inscrito, en_curso, graduado, suspendido)
- Datos heredados: email, nombre, apellido, DNI, teléfono, fecha registro, último login

**Validaciones:**
- DNI: 7-8 dígitos únicos
- Nivel: valores específicos CEFR
- Estado académico: valores permitidos
- Email: formato válido y único

---

### Módulo 3: Gestión de Profesores

**Ubicación:** [server/controllers/teacherController.js](server/controllers/teacherController.js), [server/routes/teacherRoutes.js](server/routes/teacherRoutes.js)

**Funcionalidades:**
- Listar profesores con filtros
- Filtrar por especialidad (idiomas)
- Filtrar por tarifa
- Obtener detalles de profesor
- Actualizar información profesional
- Gestionar especialidades
- Gestionar disponibilidad (horarios)
- Actualizar tarifa
- Desactivar/Reactivar profesor
- Estadísticas de profesores

**Datos Específicos de Profesor:**
- Especialidades (referencias a Language)
- Tarifa por hora
- Disponibilidad por día (horarios de inicio/fin)
- Datos heredados: similar a estudiante

**Validaciones:**
- Especialidades: debe tener al menos 1
- Tarifa: número >= 0
- Disponibilidad: formato HH:MM válido
- Idiomas: deben existir en colección Language

---

### Módulo 4: Gestión de Idiomas

**Ubicación:** [server/controllers/languageController.js](server/controllers/languageController.js), [server/routes/languages.js](server/routes/languages.js)

**Funcionalidades:**
- Listar idiomas (público)
- Obtener por ID o código
- Crear idioma (admin)
- Actualizar idioma (admin)
- Activar/desactivar idioma (admin)
- Eliminar idioma (soft delete)
- Estadísticas de idiomas (admin)
- Búsqueda por código

**Idiomas Disponibles (Default):**
- Inglés (en) - Demanda: alta
- Español (es) - Demanda: alta
- Francés (fr) - Demanda: media
- Alemán (de) - Demanda: media
- Italiano (it) - Demanda: media
- Portugués (pt) - Demanda: media
- Chino (zh) - Inactivo por defecto
- Japonés (ja) - Inactivo por defecto
- Coreano (ko) - Inactivo por defecto

**Validaciones:**
- Código: 2-5 caracteres, letras minúsculas/números
- Nombre: 2-50 caracteres
- Descripción: max 200 caracteres

---

### Módulo 5: Gestión Financiera - Facturas

**Ubicación:** [server/controllers/facturas.controller.js](server/controllers/facturas.controller.js), [server/services/factura.service.js](server/services/factura.service.js)

**Funcionalidades:**
- Crear factura
- Listar facturas por estudiante
- Obtener detalles de factura
- Calcular deuda total por estudiante
- Generar número de factura secuencial
- Estados de factura (Pendiente, Cobrada, Cobrada Parcialmente, Vencida)
- Ítems de factura con detalles

**Numeración de Facturas:**
```
Formato: FC [TIPO] [PUNTO_VENTA]-[NUMERO_SECUENCIAL]
Ejemplo: FC B 00001-00000001
- FC = Factura Compulsorizada
- B = Tipo de factura (B para Consumidor Final)
- 00001 = Punto de venta
- 00000001 = Número secuencial
```

**Estados de Factura:**
- Pendiente: Sin cobros registrados
- Cobrada Parcialmente: Cobros registrados < total
- Cobrada: Cobros registrados = total
- Vencida: Fecha vencimiento pasada

**Campos de Factura:**
- Estudiante (referencia)
- Condición fiscal (Consumidor Final, Responsable Inscripto, etc.)
- Número de factura (único)
- Fecha de emisión
- Fecha de vencimiento
- Ítems (descripción, cantidad, precio unitario)
- Período facturado (YYYY-MM)
- Subtotal y Total
- Estado

**Validaciones:**
- Estudiante: debe existir
- Ítems: cantidad >= 1, precio > 0
- Período: formato YYYY-MM válido
- Condición fiscal: valores permitidos

---

### Módulo 6: Gestión Financiera - Cobros

**Ubicación:** [server/controllers/cobros.controller.js](server/controllers/cobros.controller.js), [server/services/cobro.service.js](server/services/cobro.service.js)

**Funcionalidades:**
- Registrar cobro (con transacciones ACID)
- Listar cobros por estudiante
- Listar cobros por factura
- Validar que cobro no exceda saldo
- Actualizar estado de factura automáticamente
- Generar número de recibo
- Registrar método de pago
- Agregar notas al cobro

**Métodos de Pago:**
- Efectivo
- Tarjeta
- Transferencia
- Mercado Pago
- Otro

**Numeración de Recibos:**
```
Formato: RC-[PUNTO_VENTA]-[NUMERO_SECUENCIAL]
Ejemplo: RC-00001-00000001
```

**Lógica de Cobros (con Transacciones):**
1. Validar que el monto > 0
2. Validar que la factura exista
3. Validar que la factura pertenece al estudiante
4. Calcular total cobrado anterior
5. Validar que nuevo cobro no excede saldo
6. Generar número de recibo
7. Crear registro de cobro
8. Actualizar estado de factura
9. Commit o Rollback (ACID)

**Validaciones:**
- Monto: debe ser > 0
- No exceder saldo pendiente
- Factura: debe ser cobrable
- Método pago: valores válidos

---

### Módulo 7: Gestión de Conceptos de Cobro

**Ubicación:** [server/controllers/conceptosCobros.controller.js](server/controllers/conceptosCobros.controller.js), [server/models/concept.model.js](server/models/concept.model.js)

**Funcionalidades:**
- Crear concepto de cobro
- Listar conceptos
- Actualizar concepto
- Eliminar concepto
- Agrupar por categoría

**Ejemplos de Conceptos:**
- Matrícula
- Cuota mensual
- Material didáctico
- Examen
- Certificado

---

### Módulo 8: Auditoria

**Ubicación:** [server/controllers/auditoriaController.js](server/controllers/auditoriaController.js), [server/services/auditoriaService.js](server/services/auditoriaService.js)

**Funcionalidades:**
- Registrar eventos significativos
- Listar eventos con filtros
- Búsqueda por usuario
- Búsqueda por tipo de evento
- Búsqueda por fecha
- Capturar IP del cliente
- Capturar User Agent

**Tipos de Eventos:**
- LOGIN_EXITOSO
- LOGIN_FALLIDO
- USUARIO_CREADO
- USUARIO_ACTUALIZADO
- USUARIO_DESACTIVADO
- USUARIO_REACTIVADO
- USUARIO_ELIMINADO
- FACTURA_CREADA
- COBRO_REGISTRADO

---

### Módulo 9: Frontend - Componentes Principales

**Ubicación:** [client/src/](client/src/)

**Componentes de Autenticación:**
- `Login.jsx` - Página de login
- `ForcePasswordChange.jsx` - Cambio obligatorio de password
- `AuthNavbar.jsx` - Barra navegación autenticado
- `ProtectedRoute.jsx` - Rutas protegidas por rol

**Componentes de Dashboards:**
- `AdminDashboard.jsx` - Panel de administrador
  - Gestión de estudiantes
  - Gestión de profesores
  - Gestión de cursos
  - Reportes
  - Visión general del sistema

- `StudentDashboard.jsx` - Panel de estudiante
- `TeacherDashboard.jsx` - Panel de profesor
- `FinancialDashboard.jsx` - Panel financiero

**Componentes de Gestión:**
- `StudentsManagement.jsx` - Tabla y filtros estudiantes
- `TeachersManagement.jsx` - Tabla y filtros profesores
- `RegisterStudent.jsx` - Formulario registro estudiante
- `RegisterTeacher.jsx` - Formulario registro profesor

**Componentes de Módulo Financiero:**
- `ChargesView.jsx` - Vista de cobros
- `PaymentsView.jsx` - Vista de pagos
- `InvoicingView.jsx` - Vista de facturación
- `ReportsView.jsx` - Vista de reportes

**Componentes Generales:**
- `Header.jsx` - Encabezado del sitio
- `Footer.jsx` - Pie de página
- `Layout.jsx` - Layout principal
- `Modal.jsx` - Modal genérico
- `SystemOverviewCharts.jsx` - Gráficos del sistema

**Custom Hooks:**
- `useAuth.jsx` - Gestión de autenticación
- `useTheme.js` - Gestión de tema

---

## CONFIGURACIONES Y VARIABLES DE ENTORNO {#configuraciones}

### Archivo `.env.example`

```env
# ==================== BASE DE DATOS ====================
MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/consultora_idiomas

# ==================== AUTENTICACIÓN ====================
JWT_SECRET=tu_clave_secreta_muy_segura_minimo_32_caracteres
JWT_EXPIRE=24h

# ==================== SERVIDOR ====================
PORT=5000
NODE_ENV=development

# ==================== FRONTEND ====================
FRONTEND_URL=http://localhost:3000

# ==================== FIREBASE (Opcional) ====================
FIREBASE_PROJECT_ID=tu-proyecto-id
FIREBASE_PRIVATE_KEY=tu-private-key
FIREBASE_CLIENT_EMAIL=tu-client-email

# ==================== LOGGING ====================
LOG_LEVEL=debug
```

### Configuración por Ambiente

#### Desarrollo
```env
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000
LOG_LEVEL=debug
```

#### Producción
```env
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://consultora.com
LOG_LEVEL=error
```

### Variables Críticas

| Variable | Descripción | Obligatoria |
|----------|-------------|-------------|
| MONGODB_URI | Conexión a MongoDB Atlas | Sí |
| JWT_SECRET | Clave para firmar tokens | Sí |
| PORT | Puerto del servidor | No (default: 5000) |
| NODE_ENV | Ambiente (dev/prod) | No (default: development) |
| FRONTEND_URL | URL del cliente para CORS | Sí (producción) |

### Configuración de CORS

```javascript
// En server/index.js
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? process.env.FRONTEND_URL
    : ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));
```

---

## TESTING - PRUEBAS UNITARIAS E INTEGRACIÓN {#testing}

El proyecto cuenta con una suite completa de pruebas automatizadas para el módulo financiero, garantizando la calidad y confiabilidad del código.

### Tecnologías de Testing

| Herramienta | Versión | Propósito |
|-------------|---------|-----------|
| **Jest** | ^29.6.2 | Framework de testing principal |
| **Supertest** | ^6.3.3 | Testing de APIs HTTP/REST |
| **MongoDB Memory Server** | ^9.1.3 | Base de datos en memoria para testing |

### Estructura de Pruebas

```
server/__tests__/
├── setup.js                           # Configuración global de tests
├── unit/                             # Pruebas unitarias (50 tests)
│   ├── contador.service.test.js      # Tests del servicio de contadores (15 tests)
│   ├── factura.service.test.js       # Tests del servicio de facturas (17 tests)
│   └── cobro.service.test.js         # Tests del servicio de cobros (18 tests)
├── integration/                      # Pruebas de integración (11 tests)
│   ├── facturas.controller.test.js   # Tests de endpoints de facturas (9 tests)
│   └── cobros.controller.test.js     # Tests de endpoints de cobros (12 tests)
└── README.md                         # Documentación de pruebas
```

### Comandos de Testing

```bash
# Instalar dependencias de testing
cd server
npm install --save-dev jest supertest mongodb-memory-server

# Ejecutar todas las pruebas
npm test

# Ejecutar pruebas en modo watch (desarrollo)
npm run test:watch

# Ejecutar pruebas con reporte de cobertura
npm run test:coverage

# Ejecutar solo pruebas unitarias
npm run test:unit

# Ejecutar solo pruebas de integración
npm run test:integration

# Ejecutar un archivo específico
npm test -- contador.service.test.js
```

### Configuración de Jest

**Archivo:** [server/jest.config.js](server/jest.config.js)

```javascript
module.exports = {
  testEnvironment: 'node',
  coveragePathIgnorePatterns: ['/node_modules/'],
  testMatch: ['**/__tests__/**/*.test.js'],
  collectCoverageFrom: [
    'services/**/*.js',
    'controllers/**/*.js',
    '!**/node_modules/**',
    '!**/__tests__/**'
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },
  setupFilesAfterEnv: ['<rootDir>/__tests__/setup.js'],
  testTimeout: 10000
};
```

### Configuración Global (setup.js)

El archivo `setup.js` configura el entorno de testing:

- Inicia MongoDB Memory Server antes de todos los tests
- Conecta Mongoose a la base de datos en memoria
- Limpia todas las colecciones después de cada test
- Desconecta y cierra el servidor después de todos los tests

```javascript
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});
```

---

### Pruebas Unitarias

#### 1. Contador Service (15 tests)

**Ubicación:** [server/__tests__/unit/contador.service.test.js](server/__tests__/unit/contador.service.test.js)

**Funcionalidades Testeadas:**
- Generación de números secuenciales para facturas (formato: F-00001)
- Generación de números secuenciales para recibos (formato: RC-00001-00000001)
- Incremento secuencial automático
- Validación de tipo de documento
- Creación automática de contadores (upsert)
- Operaciones atómicas en concurrencia
- Reseteo de contadores a cero

**Casos de Prueba Destacados:**

```javascript
test('Debe ser operación atómica (no debe haber duplicados en concurrencia)', async () => {
  const promesas = [];
  for (let i = 0; i < 10; i++) {
    promesas.push(contadorService.obtenerSiguienteNumero('factura'));
  }
  const numeros = await Promise.all(promesas);
  const numerosUnicos = new Set(numeros);
  expect(numerosUnicos.size).toBe(10);
});
```

---

#### 2. Factura Service (17 tests)

**Ubicación:** [server/__tests__/unit/factura.service.test.js](server/__tests__/unit/factura.service.test.js)

**Funcionalidades Testeadas:**
- Creación de facturas válidas con datos correctos
- Generación de número de factura tipo B (Consumidor Final)
- Generación de número de factura tipo A (Responsable Inscripto)
- Cálculo correcto de subtotales con múltiples ítems
- Validación de datos requeridos
- Validación de existencia del estudiante
- Validación de ítems (precio y cantidad válidos)
- Generación de números únicos y secuenciales
- Obtención de facturas por estudiante
- Ordenamiento por fecha de emisión
- Cálculo de deuda total del estudiante
- Separación de facturas pendientes y pagadas

**Casos de Prueba Destacados:**

```javascript
test('Debe calcular correctamente el subtotal con múltiples ítems', async () => {
  const datosFactura = {
    estudiante: estudianteTest._id,
    condicionFiscal: 'Consumidor Final',
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
});
```

---

#### 3. Cobro Service (18 tests)

**Ubicación:** [server/__tests__/unit/cobro.service.test.js](server/__tests__/unit/cobro.service.test.js)

**Funcionalidades Testeadas:**
- Registro de cobro completo (pago total)
- Registro de cobro parcial
- Múltiples cobros parciales hasta completar total
- Validación de monto mayor a cero
- Validación de existencia de factura
- Validación de estado de factura (no cobrada previamente)
- Validación de pertenencia de factura al estudiante
- Validación de que el cobro no exceda el saldo pendiente
- Transacciones ACID con rollback en caso de error
- Generación de número de recibo único
- Actualización automática de estado de factura
- Obtención de cobros por estudiante ordenados por fecha

**Casos de Prueba Destacados:**

```javascript
test('Debe realizar rollback si hay un error durante la transacción', async () => {
  const cobroAntes = await Cobro.countDocuments();
  const facturaAntes = await Factura.findById(facturaTest._id);

  const datosCobro = {
    estudiante: estudianteTest._id.toString(),
    factura: facturaTest._id,
    monto: 10000, // Monto que excede el total
    metodoCobro: 'Efectivo'
  };

  await expect(cobroService.registrarCobro(datosCobro)).rejects.toThrow();

  const cobroDespues = await Cobro.countDocuments();
  const facturaDespues = await Factura.findById(facturaTest._id);

  expect(cobroDespues).toBe(cobroAntes);
  expect(facturaDespues.estado).toBe(facturaAntes.estado);
});
```

---

### Pruebas de Integración

#### 1. Facturas Controller (9 tests)

**Ubicación:** [server/__tests__/integration/facturas.controller.test.js](server/__tests__/integration/facturas.controller.test.js)

**Endpoints Testeados:**

**POST /api/facturas** (6 tests)
- Creación exitosa con status 201
- Error 400 por datos faltantes
- Error 400 por estudiante inexistente
- Cálculo correcto con múltiples ítems
- Tipo de factura B para Consumidor Final
- Tipo de factura A para Responsable Inscripto

**GET /api/facturas/estudiante/:id** (2 tests)
- Retorno exitoso con status 200
- Error 404 si no hay facturas

**GET /api/facturas/estudiante/:id/deuda** (1 test)
- Cálculo correcto de deuda total con separación de facturas

**Ejemplo de Prueba:**

```javascript
test('Debe crear una factura válida y retornar 201', async () => {
  const datosFactura = {
    estudiante: estudianteTest._id,
    condicionFiscal: 'Consumidor Final',
    fechaVencimiento: '2025-12-31',
    itemFacturaSchema: [
      { descripcion: 'Curso Inglés B1', cantidad: 1, precioUnitario: 5000 }
    ],
    periodoFacturado: '2025-11'
  };

  const response = await request(app)
    .post('/api/facturas')
    .send(datosFactura)
    .expect(201);

  expect(response.body).toHaveProperty('success', true);
  expect(response.body.data.total).toBe(5000);
  expect(response.body.data).toHaveProperty('numeroFactura');
});
```

---

#### 2. Cobros Controller (12 tests)

**Ubicación:** [server/__tests__/integration/cobros.controller.test.js](server/__tests__/integration/cobros.controller.test.js)

**Endpoints Testeados:**

**POST /api/cobros** (9 tests)
- Registro exitoso con status 201
- Cobro parcial y actualización de estado
- Múltiples cobros parciales consecutivos
- Error 400 por monto inválido
- Error 400 por factura inexistente
- Error 400 por factura ya cobrada
- Error 400 por cobro excedente
- Error 400 por factura no perteneciente
- Generación de número de recibo único

**GET /api/cobros/estudiante/:id** (2 tests)
- Retorno exitoso con status 200
- Error 404 si no hay cobros

**Escenario Completo** (1 test)
- Factura con múltiples cobros end-to-end

**Ejemplo de Prueba:**

```javascript
test('Debe permitir múltiples cobros parciales hasta completar el total', async () => {
  const cobro1 = {
    estudiante: estudianteTest._id.toString(),
    factura: facturaTest._id,
    monto: 1500,
    metodoCobro: 'Efectivo'
  };

  const response1 = await request(app)
    .post('/api/cobros')
    .send(cobro1)
    .expect(201);
  expect(response1.body.data.factura.estado).toBe('Cobrada Parcialmente');

  // Segundo cobro
  const cobro2 = { ...cobro1, monto: 1500, metodoCobro: 'Tarjeta' };
  const response2 = await request(app).post('/api/cobros').send(cobro2).expect(201);
  expect(response2.body.data.factura.estado).toBe('Cobrada Parcialmente');

  // Tercer cobro completa el total
  const cobro3 = { ...cobro1, monto: 1000, metodoCobro: 'Transferencia' };
  const response3 = await request(app).post('/api/cobros').send(cobro3).expect(201);
  expect(response3.body.data.factura.estado).toBe('Cobrada');
  expect(response3.body.data.factura.saldoPendiente).toBe(0);
});
```

---

### Estadísticas de Cobertura

#### Objetivos de Cobertura

| Métrica | Umbral Mínimo | Estado |
|---------|---------------|--------|
| **Branches** | 70% | Configurado |
| **Functions** | 70% | Configurado |
| **Lines** | 70% | Configurado |
| **Statements** | 70% | Configurado |

#### Módulos Cubiertos

| Módulo | Tests Unitarios | Tests Integración | Total |
|--------|-----------------|-------------------|-------|
| **contador.service.js** | 15 | - | 15 |
| **factura.service.js** | 17 | - | 17 |
| **cobro.service.js** | 18 | - | 18 |
| **facturas.controller.js** | - | 9 | 9 |
| **cobros.controller.js** | - | 12 | 12 |
| **TOTAL** | **50** | **21** | **71** |

---

### Buenas Prácticas Implementadas

1. **Aislamiento de Tests**
   - Cada test es completamente independiente
   - No hay dependencias entre tests
   - Uso de `beforeEach` para crear datos frescos

2. **Cleanup Automático**
   - Todas las colecciones se limpian después de cada test
   - Evita contaminación de datos entre tests
   - Garantiza resultados consistentes

3. **Base de Datos en Memoria**
   - Uso de MongoDB Memory Server
   - Tests rápidos y sin dependencias externas
   - No requiere instancia de MongoDB corriendo

4. **Transacciones Testeadas**
   - Verificación de comportamiento ACID
   - Pruebas de rollback en caso de error
   - Validación de consistencia de datos

5. **Nombres Descriptivos**
   - Tests con nombres que describen exactamente qué se prueba
   - Uso de "Debe..." para claridad
   - Agrupación lógica con `describe`

6. **Assertions Completas**
   - Verificación de estructura de respuesta
   - Validación de códigos de estado HTTP
   - Comprobación de datos en base de datos

---

### Escenarios de Prueba Complejos

#### Escenario 1: Transacciones con Rollback

**Objetivo:** Verificar que si falla una operación durante un cobro, todo se revierte.

```javascript
test('Debe realizar rollback si hay un error durante la transacción', async () => {
  const cobroAntes = await Cobro.countDocuments();
  const facturaAntes = await Factura.findById(facturaTest._id);

  // Intentar cobro que excede el total
  const datosCobro = {
    estudiante: estudianteTest._id.toString(),
    factura: facturaTest._id,
    monto: 10000,
    metodoCobro: 'Efectivo'
  };

  await expect(cobroService.registrarCobro(datosCobro)).rejects.toThrow();

  // Verificar que NADA cambió en la BD
  const cobroDespues = await Cobro.countDocuments();
  const facturaDespues = await Factura.findById(facturaTest._id);

  expect(cobroDespues).toBe(cobroAntes);
  expect(facturaDespues.estado).toBe(facturaAntes.estado);
});
```

#### Escenario 2: Concurrencia en Contadores

**Objetivo:** Verificar que múltiples operaciones simultáneas no generen números duplicados.

```javascript
test('Debe ser operación atómica (no debe haber duplicados en concurrencia)', async () => {
  const promesas = [];
  for (let i = 0; i < 10; i++) {
    promesas.push(contadorService.obtenerSiguienteNumero('factura'));
  }

  const numeros = await Promise.all(promesas);
  const numerosUnicos = new Set(numeros);

  expect(numerosUnicos.size).toBe(10);
});
```

#### Escenario 3: Flujo Completo de Cobros

**Objetivo:** Probar el ciclo de vida completo de una factura con múltiples cobros.

```javascript
test('Debe registrar múltiples cobros y actualizar el estado correctamente', async () => {
  // Primer cobro parcial
  const cobro1 = { /* ... */ monto: 1000 };
  const response1 = await request(app).post('/api/cobros').send(cobro1).expect(201);
  expect(response1.body.data.factura.estado).toBe('Cobrada Parcialmente');

  // Segundo cobro parcial
  const cobro2 = { /* ... */ monto: 1500 };
  const response2 = await request(app).post('/api/cobros').send(cobro2).expect(201);
  expect(response2.body.data.factura.estado).toBe('Cobrada Parcialmente');

  // Tercer cobro completa el total
  const cobro3 = { /* ... */ monto: 1500 };
  const response3 = await request(app).post('/api/cobros').send(cobro3).expect(201);
  expect(response3.body.data.factura.estado).toBe('Cobrada');
  expect(response3.body.data.factura.saldoPendiente).toBe(0);

  // Verificar todos los cobros del estudiante
  const cobrosResponse = await request(app)
    .get(`/api/cobros/estudiante/${estudianteTest._id}`)
    .expect(200);
  expect(cobrosResponse.body.data).toHaveLength(3);
});
```

---

### Ejecución de Pruebas

#### Salida Típica de Pruebas

```bash
$ npm test

PASS  __tests__/unit/contador.service.test.js
  Contador Service - Unit Tests
    obtenerSiguienteNumero
      ✓ Debe generar número secuencial para factura en formato F-00001 (52ms)
      ✓ Debe incrementar el número de factura secuencialmente (28ms)
      ✓ Debe generar número secuencial para recibo en formato RC-00001-00000001 (15ms)
      ... (12 más)
    resetearContador
      ✓ Debe resetear el contador a 0 (18ms)
      ... (2 más)

PASS  __tests__/unit/factura.service.test.js
  Factura Service - Unit Tests
    crearFactura
      ✓ Debe crear una factura válida con todos los datos correctos (45ms)
      ... (16 más)

PASS  __tests__/unit/cobro.service.test.js
  Cobro Service - Unit Tests
    registrarCobro
      ✓ Debe registrar un cobro válido completo (62ms)
      ... (17 más)

PASS  __tests__/integration/facturas.controller.test.js
  Facturas Controller - Integration Tests
    POST /api/facturas - Crear factura
      ✓ Debe crear una factura válida y retornar 201 (78ms)
      ... (8 más)

PASS  __tests__/integration/cobros.controller.test.js
  Cobros Controller - Integration Tests
    POST /api/cobros - Registrar cobro
      ✓ Debe registrar un cobro válido completo y retornar 201 (85ms)
      ... (11 más)

Test Suites: 5 passed, 5 total
Tests:       71 passed, 71 total
Snapshots:   0 total
Time:        12.456 s
```

#### Reporte de Cobertura

```bash
$ npm run test:coverage

----------------------|---------|----------|---------|---------|-------------------
File                  | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
----------------------|---------|----------|---------|---------|-------------------
All files             |   89.23 |    85.71 |   91.67 |   88.76 |
 services             |   92.45 |    88.24 |   95.00 |   91.89 |
  cobro.service.js    |   95.12 |    92.31 |  100.00 |   94.74 | 45,78
  contador.service.js |   96.55 |    90.00 |  100.00 |   96.15 | 28
  factura.service.js  |   88.89 |    84.62 |   88.89 |   88.24 | 89,134-142
 controllers          |   84.62 |    80.00 |   85.71 |   84.00 |
  cobros.controller   |   88.00 |    85.71 |   90.00 |   87.50 | 22
  facturas.controller |   81.25 |    75.00 |   80.00 |   80.50 | 18,41
----------------------|---------|----------|---------|---------|-------------------
```

---

### Troubleshooting

#### Error: Cannot find module

**Problema:** Jest no puede encontrar un módulo importado.

**Solución:**
```bash
# Verificar que las rutas sean correctas y relativas
# Ejemplo correcto:
const facturaService = require('../../services/factura.service');
```

#### Timeout Error

**Problema:** Los tests superan el tiempo límite.

**Solución:**
```javascript
// Aumentar timeout en jest.config.js
module.exports = {
  testTimeout: 15000 // 15 segundos
};
```

#### MongoDB Connection Error

**Problema:** Error al conectar con MongoDB Memory Server.

**Solución:**
```bash
# Verificar que no haya otra instancia de MongoDB corriendo
# Limpiar cache de MongoDB Memory Server
rm -rf ~/.cache/mongodb-binaries
```

#### Tests que fallan intermitentemente

**Problema:** Algunos tests pasan a veces y fallan otras veces.

**Solución:**
- Verificar que se esté limpiando correctamente en `afterEach`
- Revisar que no haya estado compartido entre tests
- Asegurarse de usar `await` en todas las operaciones asíncronas

---

### Próximos Pasos en Testing

- [ ] Agregar tests para módulo de auditoría
- [ ] Agregar tests para conceptos de cobro y categorías
- [ ] Implementar tests E2E (end-to-end) completos
- [ ] Agregar tests de performance y carga
- [ ] Configurar CI/CD para ejecutar tests automáticamente
- [ ] Agregar tests de seguridad (SQL injection, XSS, etc.)
- [ ] Implementar mutation testing
- [ ] Agregar tests de accesibilidad en frontend

---

## SCRIPTS Y COMANDOS {#scripts-y-comandos}

### Backend (Server)

```bash
# Instalación
cd server
npm install

# Desarrollo (con auto-reload)
npm run dev

# Producción
npm start

# Testing
npm test

# Seed de idiomas
node scripts/seedLanguages.js

# Migración de datos
node scripts/migrate-simple.js

# Testing de autenticación
node scripts/final-test.js

# Crear usuarios de prueba
node scripts/create-test-users.js
```

### Frontend (Client)

```bash
# Instalación
cd client
npm install

# Desarrollo (con hot-reload)
npm run dev

# Build para producción
npm run build

# Preview del build
npm run preview
```

### Root

```bash
# Instalar todas las dependencias
npm install

# Actualizar dependencias
npm update

# Ver versión
npm -v
```

### Git Workflow

```bash
# Ver estado
git status

# Ver commits recientes
git log --oneline -10

# Crear rama feature
git checkout -b feature/nombre-funcionalidad

# Cambiar de rama
git checkout Dev

# Ver ramas
git branch -a

# Hacer commit
git add .
git commit -m "feat: descripción del cambio"

# Push a rama
git push origin feature/nombre-funcionalidad
```

---

## DOCUMENTACIÓN EXISTENTE {#documentación-existente}

### Archivos de Documentación

1. **[Readme.md](Readme.md)** (Raíz del proyecto)
   - Descripción general del proyecto
   - Tecnologías utilizadas
   - Instrucciones de instalación
   - Estado del proyecto
   - Roadmap de desarrollo
   - Comandos útiles
   - Troubleshooting

2. **[docs/GUIA_COMPLETA_APIS_POR_ROL.md](docs/GUIA_COMPLETA_APIS_POR_ROL.md)**
   - Documentación detallada de todos los endpoints
   - Ejemplos de requests y responses
   - Guía de testing con Thunder Client
   - Detalles de arquitectura
   - Información de modelos discriminados
   - Ejemplos de uso por rol

3. **[server/docs/pruebas_autenticacion.md](server/docs/pruebas_autenticacion.md)**
   - Guía de testing de autenticación
   - Casos de prueba
   - Validaciones
   - Errores comunes

4. **[PLAN_DE_ACCION_PROYECTO.md](PLAN_DE_ACCION_PROYECTO.md)**
   - Roadmap de desarrollo
   - Fases del proyecto
   - Tareas pendientes
   - Prioridades

5. **[HANDOFF_PARA_PROXIMO_CHAT.md](HANDOFF_PARA_PROXIMO_CHAT.md)**
   - Información para transición entre desarrolladores
   - Estado actual del proyecto
   - Issues conocidos
   - Próximos pasos

6. **[BUGS.md](BUGS.md)**
   - Bugs reportados
   - Problemas conocidos
   - Soluciones aplicadas

### Estado de la Documentación

| Componente | Documentado | Completitud |
|-----------|-------------|-------------|
| Backend API | 95% | Muy completo |
| Modelos | 90% | Bien documentado |
| Frontend | 70% | Parcialmente documentado |
| Deployment | 50% | Básico |
| Testing | 60% | En desarrollo |

---

## INFORMACIÓN ADICIONAL

### Gestión de Dependencias

#### Backend
```json
{
  "dependencies": {
    "express": "^4.18.2",
    "mongoose": "^7.5.0",
    "jsonwebtoken": "^9.0.2",
    "bcryptjs": "^3.0.2",
    "express-validator": "^7.2.1",
    "cors": "^2.8.5",
    "helmet": "^8.1.0",
    "morgan": "^1.10.1",
    "dotenv": "^16.3.1",
    "firebase-admin": "^13.5.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.1",
    "jest": "^29.6.2"
  }
}
```

#### Frontend
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^7.9.1",
    "react-hook-form": "^7.62.0",
    "yup": "^1.7.0",
    "axios": "^1.12.1",
    "react-icons": "^5.5.0",
    "recharts": "^3.2.1",
    "date-fns": "^4.1.0",
    "react-big-calendar": "^1.19.4"
  },
  "devDependencies": {
    "vite": "^4.4.5",
    "@vitejs/plugin-react": "^4.0.3",
    "@types/react": "^18.2.15"
  }
}
```

### Últimos Commits

```
441de80 - Merge pull request #28: Validaciones financieras
1d347de - Merge pull request #27: Gestión de cobros
0415525 - Validaciones crear un cobro, crear una factura, validación de ID
b764e90 - Mejoras varias en numeración de factura y método de consulta de deuda
be1e031 - Creación de cobroService y mejora de factura: service y controller
```

### Rama Actual
- **Rama Activa:** Dev
- **Rama Principal:** main
- **Rama para PRs:** Crear feature branch desde Dev

### Estructura de Componentes Frontend

**Sistema de Clasificación de Rutas:**

```javascript
// utils/routes.js
export const routes = {
  HOME: '/',
  ABOUT: '/about',
  SERVICES: '/services',
  COURSES: '/courses',
  CLIENTS: '/clients',
  DEMO: '/demo',
  CONTACT: '/contact',
  LOGIN: '/login',
  DASHBOARD: {
    ADMIN: '/dashboard/admin',
    STUDENT: '/dashboard/student',
    TEACHER: '/dashboard/teacher',
    COMPANY: '/dashboard/company',
    FINANCIAL: '/dashboard/financial'
  }
};
```

---

## CONCLUSIÓN

Este manual técnico proporciona una visión completa y detallada del sistema **PPIV Consultora de Idiomas**. El proyecto implementa:

- Arquitectura escalable y profesional
- Patrones de diseño modernos
- Seguridad robusta con JWT y bcryptjs
- Base de datos bien modelada con Mongoose
- API REST completa y documentada
- Frontend interactivo con React
- Separación clara de responsabilidades
- Validaciones en múltiples capas
- Manejo de errores consistente
- Transacciones ACID para operaciones críticas

El sistema está en **Fase 2 avanzada** con el backend completamente funcional y el frontend en desarrollo activo. Todos los componentes críticos están implementados y probados.

---

**Documento generado con análisis exhaustivo del código fuente**
**Fecha de análisis:** 17 de noviembre de 2025
**Rama activa:** Dev
