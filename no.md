# MANUAL TÉCNICO - PPIV Consultora de Idiomas

## Tabla de Contenidos

1. [Descripción General del Proyecto](#1-descripción-general-del-proyecto)
2. [Arquitectura del Sistema](#2-arquitectura-del-sistema)
3. [Tecnologías Utilizadas](#3-tecnologías-utilizadas)
4. [Estructura del Proyecto](#4-estructura-del-proyecto)
5. [Modelos de Datos](#5-modelos-de-datos)
6. [API REST - Endpoints](#6-api-rest---endpoints)
7. [Componentes Frontend](#7-componentes-frontend)
8. [Flujos de Trabajo](#8-flujos-de-trabajo)
9. [Configuración y Deployment](#9-configuración-y-deployment)
10. [Guía de Desarrollo](#10-guía-de-desarrollo)
11. [Testing](#11-testing)
12. [Seguridad](#12-seguridad)
13. [Troubleshooting](#13-troubleshooting)

---

## 1. Descripción General del Proyecto

### 1.1 Visión General

PPIV Consultora de Idiomas es un sistema integral de gestión académica y financiera diseñado específicamente para instituciones educativas de idiomas. El sistema proporciona herramientas completas para la administración de cursos, estudiantes, profesores, facturación y reportes.

### 1.2 Objetivos del Sistema

- **Gestión Académica**: Administración completa de cursos, clases, horarios y asistencias
- **Gestión de Usuarios**: Manejo de estudiantes, profesores y administradores con diferentes roles y permisos
- **Sistema Financiero**: Facturación, cobros, pagos y reportes financieros
- **Reportes y Analytics**: Generación de reportes académicos y financieros con exportación a PDF/Excel
- **Auditoria**: Registro completo de eventos y acciones del sistema

### 1.3 Roles del Sistema

| Rol | Descripción | Permisos Principales |
|-----|-------------|---------------------|
| **Admin** | Administrador del sistema | Acceso total, gestión de usuarios, configuración, reportes |
| **Profesor** | Docente de la institución | Gestión de clases, asistencias, calificaciones |
| **Estudiante** | Alumno inscrito | Visualización de cursos, pagos, asistencias |
| **Empresa** | Usuario empresarial | Gestión de empleados inscritos, reportes corporativos |

---

## 2. Arquitectura del Sistema

### 2.1 Arquitectura General

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENTE (FRONTEND)                    │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   React UI   │  │  React Router│  │    Axios     │  │
│  │  Components  │  │              │  │   HTTP       │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└────────────────────────┬─────────────────────────────────┘
                         │ HTTP/HTTPS (REST API)
                         │
┌────────────────────────▼─────────────────────────────────┐
│                  SERVIDOR (BACKEND)                       │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Express    │  │  Controllers │  │  Services    │  │
│  │   Routes     │  │              │  │              │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  Middleware  │  │  Validators  │  │    Models    │  │
│  │  (Auth/Val.) │  │              │  │  (Mongoose)  │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└────────────────────────┬─────────────────────────────────┘
                         │
                         │
┌────────────────────────▼─────────────────────────────────┐
│                BASE DE DATOS (MongoDB)                    │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Usuarios   │  │    Cursos    │  │   Clases     │  │
│  │ (Estudiantes,│  │              │  │              │  │
│  │  Profesores) │  │              │  │              │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Facturas   │  │    Cobros    │  │   Reportes   │  │
│  │              │  │              │  │              │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└──────────────────────────────────────────────────────────┘
                         │
                         │
┌────────────────────────▼─────────────────────────────────┐
│               SERVICIOS EXTERNOS                         │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  Cloudinary  │  │   Firebase   │  │   MongoDB    │  │
│  │  (Imágenes)  │  │    Auth      │  │    Atlas     │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└──────────────────────────────────────────────────────────┘
```

### 2.2 Patrón de Arquitectura

El sistema utiliza el patrón **MVC (Model-View-Controller)** adaptado para aplicaciones web modernas:

- **Model**: Mongoose schemas y modelos de MongoDB
- **View**: Componentes React en el frontend
- **Controller**: Controladores Express que manejan la lógica de negocio

Adicionalmente, se implementa una **capa de servicios** para lógica de negocio reutilizable.

### 2.3 Flujo de una Petición Típica

```
Cliente → Request HTTP
    ↓
Express Router → Identifica ruta
    ↓
Middleware Auth → Verifica JWT token
    ↓
Middleware Validation → Valida datos de entrada
    ↓
Controller → Recibe petición
    ↓
Service Layer → Lógica de negocio
    ↓
Model (Mongoose) → Interacción con MongoDB
    ↓
Response ← Respuesta JSON
    ↓
Cliente ← Actualiza UI
```

---

## 3. Tecnologías Utilizadas

### 3.1 Backend (Node.js)

#### Framework y Core
| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| Node.js | LTS | Runtime JavaScript del servidor |
| Express.js | ^4.18.2 | Framework web minimalista |
| Mongoose | ^7.5.0 | ODM para MongoDB |

#### Autenticación y Seguridad
| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| jsonwebtoken | ^9.0.2 | Generación y verificación de JWT |
| bcryptjs | ^3.0.2 | Hashing de contraseñas |
| helmet | ^8.1.0 | Protección de cabeceras HTTP |
| cors | ^2.8.5 | Cross-Origin Resource Sharing |
| firebase-admin | ^13.5.0 | Autenticación con Firebase |

#### Validación y Utilidades
| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| express-validator | ^7.2.1 | Validación de inputs |
| dotenv | ^16.3.1 | Variables de entorno |
| morgan | ^1.10.1 | Logger HTTP |

#### Generación de Documentos
| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| pdfkit | ^0.17.2 | Generación de PDFs |
| xlsx | ^0.18.5 | Exportación a Excel |

#### File Upload y Storage
| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| multer | ^1.4.5-lts.1 | Subida de archivos |
| cloudinary | ^1.41.0 | Almacenamiento de imágenes en la nube |

#### Testing
| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| jest | ^29.7.0 | Framework de testing |
| supertest | ^7.1.4 | Testing de endpoints HTTP |
| mongodb-memory-server | ^10.3.0 | MongoDB en memoria para tests |

### 3.2 Frontend (React)

#### Framework y Librerías Core
| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| React | ^18.2.0 | Biblioteca de UI |
| React DOM | ^18.2.0 | Renderizado en el DOM |
| Vite | ^4.4.5 | Build tool y dev server |
| React Router DOM | ^7.9.1 | Enrutamiento del cliente |

#### Manejo de Formularios
| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| React Hook Form | ^7.62.0 | Gestión de formularios |
| @hookform/resolvers | ^5.2.1 | Integración con validadores |
| Yup | ^1.7.0 | Validación de esquemas |

#### HTTP y Estado
| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| Axios | ^1.12.1 | Cliente HTTP |

#### UI y Visualización
| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| Recharts | ^3.2.1 | Gráficos y visualizaciones |
| react-big-calendar | ^1.19.4 | Componente de calendario |
| react-icons | ^5.5.0 | Librería de iconos |
| lucide-react | ^0.552.0 | Iconos adicionales |

#### Utilidades
| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| date-fns | ^4.1.0 | Manipulación de fechas |

### 3.3 Base de Datos

| Tecnología | Propósito |
|------------|-----------|
| MongoDB | Base de datos NoSQL orientada a documentos |
| MongoDB Atlas | Hosting en la nube de MongoDB |
| Mongoose | ODM (Object Document Mapper) |

### 3.4 Servicios Externos

| Servicio | Propósito |
|----------|-----------|
| Cloudinary | Almacenamiento y optimización de imágenes |
| Firebase Admin | Autenticación alternativa |
| MongoDB Atlas | Database as a Service |

---

## 4. Estructura del Proyecto

### 4.1 Estructura del Backend

```
server/
├── controllers/          # Controladores de la aplicación (20 archivos)
│   ├── authControllerNew.js
│   ├── clasesController.js
│   ├── cobros.controller.js
│   ├── cursosController.js
│   ├── facturas.controller.js
│   ├── perfilesController.js
│   ├── reportesAcademicosController.js
│   ├── reportesFinancierosController.js
│   ├── studentController.js
│   ├── teacherController.js
│   └── ...
│
├── models/              # Modelos de Mongoose (21 archivos)
│   ├── BaseUser.js      # Modelo base con discriminador
│   ├── Estudiante.js
│   ├── Profesor.js
│   ├── Admin.js
│   ├── Curso.js
│   ├── Clase.js
│   ├── factura.model.js
│   ├── cobros.model.js
│   └── ...
│
├── routes/              # Rutas de la API (19 archivos)
│   ├── authNew.js
│   ├── cobros.routes.js
│   ├── clases.js
│   ├── cursos.js
│   ├── facturas.routes.js
│   └── ...
│
├── middleware/          # Middlewares personalizados
│   ├── authMiddlewareNew.js     # JWT authentication
│   ├── uploadMiddleware.js      # File uploads
│   └── financiero.validation.js # Validación financiera
│
├── validators/          # Validadores de express-validator
│   ├── authValidatorsNew.js
│   ├── clasesValidators.js
│   ├── cursosValidator.js
│   └── horarioValidators.js
│
├── services/            # Capa de servicios (17 archivos)
│   ├── clasesService.js
│   ├── cobro.service.js
│   ├── cursosService.js
│   ├── factura.service.js
│   ├── reportesAcademicosService.js
│   ├── reportesFinancierosService.js
│   └── ...
│
├── shared/              # Código compartido
│   ├── middleware/
│   │   ├── errorHandler.js
│   │   └── paginationMiddleware.js
│   ├── helpers/
│   │   └── responseHandler.js
│   └── utils/
│       └── constants.js
│
├── scripts/             # Scripts utilitarios (8 archivos)
│   ├── create-test-users.js
│   ├── check-class-attendance.js
│   └── ...
│
├── docs/                # Documentación
│   ├── ARQUITECTURA_BACKEND.md
│   ├── GUIA_COMPLETA_APIS_POR_ROL.md
│   └── ...
│
├── __tests__/           # Tests automatizados
│   ├── integration/
│   ├── models/
│   └── services/
│
├── index.js             # Punto de entrada
├── package.json         # Dependencias
├── .env                 # Variables de entorno (no versionado)
└── .env.example         # Template de variables de entorno
```

### 4.2 Estructura del Frontend

```
client/
├── src/
│   ├── pages/               # Páginas principales (16 archivos)
│   │   ├── Home.jsx
│   │   ├── Login.jsx
│   │   ├── Dashboard/       # Dashboards por rol
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── StudentDashboard.jsx
│   │   │   ├── TeacherDashboard.jsx
│   │   │   ├── FinancialDashboard.jsx
│   │   │   └── ...
│   │   └── ...
│   │
│   ├── components/          # Componentes reutilizables (34+ archivos)
│   │   ├── common/          # Componentes comunes
│   │   │   ├── AuthNavbar.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   ├── Modal.jsx
│   │   │   └── ...
│   │   │
│   │   ├── layout/          # Componentes de layout
│   │   │   ├── Header.jsx
│   │   │   ├── Footer.jsx
│   │   │   └── Layout.jsx
│   │   │
│   │   ├── courses/         # Componentes de cursos (7 archivos)
│   │   │   ├── CourseCard.jsx
│   │   │   ├── CourseDetailModal.jsx
│   │   │   ├── CourseEnrollmentModal.jsx
│   │   │   └── ...
│   │   │
│   │   ├── payment/         # Componentes de pago (3 archivos)
│   │   │   ├── PaymentDetailModal.jsx
│   │   │   ├── StudentPaymentModal.jsx
│   │   │   └── FacturaDetailModal.jsx
│   │   │
│   │   ├── attendance/      # Componentes de asistencia
│   │   │   ├── ClassAttendanceForm.jsx
│   │   │   └── StudentAttendanceForm.jsx
│   │   │
│   │   └── ...
│   │
│   ├── modules/             # Módulos específicos
│   │   └── financial/       # Módulo financiero
│   │       └── components/  (7 archivos)
│   │           ├── InvoicingView.jsx       (79 KB)
│   │           ├── CollectionsView.jsx     (60 KB)
│   │           ├── ChargesView.jsx
│   │           └── ...
│   │
│   ├── services/            # Servicios de API (6 archivos)
│   │   ├── api.js           # Cliente Axios configurado
│   │   ├── apiAdapter.js
│   │   ├── cobroApi.js
│   │   ├── facturaApi.js
│   │   └── ...
│   │
│   ├── hooks/               # Custom Hooks
│   │   ├── useAuth.jsx
│   │   └── useTheme.js
│   │
│   ├── utils/               # Utilidades
│   │   ├── routes.js
│   │   ├── formatting.js
│   │   └── stringHelpers.js
│   │
│   ├── styles/              # Estilos CSS (7 archivos)
│   │   ├── variables.css
│   │   ├── auth.css
│   │   ├── modal.css
│   │   └── ...
│   │
│   ├── App.jsx              # Componente principal
│   ├── App.css
│   └── main.jsx             # Punto de entrada
│
├── public/                  # Archivos públicos estáticos
│   └── images/
│
├── package.json             # Dependencias
├── vite.config.js           # Configuración de Vite
├── index.html               # HTML principal
└── .env                     # Variables de entorno
```

### 4.3 Convenciones de Nombres

#### Backend
- **Archivos de controladores**: `[entidad]Controller.js` (camelCase)
- **Archivos de modelos**: `[Entidad].js` o `[entidad].model.js` (PascalCase)
- **Archivos de rutas**: `[entidad].js` o `[entidad].routes.js` (camelCase)
- **Archivos de servicios**: `[entidad]Service.js` (camelCase)

#### Frontend
- **Componentes React**: `[ComponentName].jsx` (PascalCase)
- **Páginas**: `[PageName].jsx` (PascalCase)
- **Hooks**: `use[HookName].jsx` (camelCase con prefijo 'use')
- **Utilidades**: `[utilityName].js` (camelCase)

---

## 5. Modelos de Datos

### 5.1 Modelo de Usuarios (Discriminador)

El sistema utiliza **Mongoose Discriminators** para implementar herencia de usuarios:

```javascript
// BaseUser - Modelo base
{
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  role: { type: String, enum: ['estudiante', 'profesor', 'admin'] },
  phone: String,
  dni: { type: String, unique: true },
  mustChangePassword: { type: Boolean, default: false },
  condicion: { type: String, enum: ['regular', 'libre'], default: 'regular' },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  lastLogin: Date,
  horariosPermitidos: [{ type: Schema.Types.ObjectId, ref: 'Horario' }]
}

// Estudiante (extiende BaseUser)
{
  nivel: { type: String, enum: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] },
  estadoAcademico: {
    type: String,
    enum: ['inscrito', 'en_curso', 'graduado', 'suspendido'],
    default: 'inscrito'
  }
}

// Profesor (extiende BaseUser)
{
  especialidades: [String],
  tarifaPorHora: Number,
  disponibilidad: [{
    dia: String,
    horaInicio: String,
    horaFin: String
  }],
  horariosPermitidos: [{ type: Schema.Types.ObjectId, ref: 'Horario' }]
}

// Admin (extiende BaseUser)
{
  permissions: [{
    type: String,
    enum: ['gestion_usuarios', 'reportes', 'configuracion', 'todos']
  }]
}
```

**Uso del Discriminador:**
```javascript
const BaseUser = mongoose.model('BaseUser', baseUserSchema);
const Estudiante = BaseUser.discriminator('Estudiante', estudianteSchema);
const Profesor = BaseUser.discriminator('Profesor', profesorSchema);
const Admin = BaseUser.discriminator('Admin', adminSchema);
```

### 5.2 Modelo de Curso

```javascript
{
  nombre: { type: String, required: true },
  idioma: { type: Schema.Types.ObjectId, ref: 'Language', required: true },
  nivel: { type: String, enum: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] },
  descripcion: String,
  duracionTotal: { type: Number, required: true }, // en horas
  tarifa: { type: Number, required: true },

  profesor: { type: Schema.Types.ObjectId, ref: 'BaseUser' },
  horarios: [{ type: Schema.Types.ObjectId, ref: 'Horario' }],
  horariosDuraciones: [{
    horarioId: { type: Schema.Types.ObjectId, ref: 'Horario' },
    duracion: Number // duración específica para este horario en horas
  }],

  fechaInicio: Date,
  fechaFin: Date,
  modalidad: {
    type: String,
    enum: ['presencial', 'online', 'hibrido'],
    default: 'presencial'
  },
  estado: {
    type: String,
    enum: ['borrador', 'planificado', 'activo', 'completado', 'cancelado'],
    default: 'borrador'
  },
  type: {
    type: String,
    enum: ['grupal', 'individual'],
    default: 'grupal'
  },

  imageUrl: String,
  vacantesMaximas: { type: Number, default: 20 },
  estudiantes: [{ type: Schema.Types.ObjectId, ref: 'BaseUser' }],

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}

// Virtual para calcular costo total
cursoSchema.virtual('costoTotal').get(function() {
  return this.tarifa * this.duracionTotal;
});
```

### 5.3 Modelo de Clase

```javascript
{
  curso: {
    type: Schema.Types.ObjectId,
    ref: 'Curso',
    required: true
  },
  profesor: {
    type: Schema.Types.ObjectId,
    ref: 'BaseUser',
    required: true
  },

  fecha: { type: Date, required: true },
  horaInicio: { type: String, required: true },
  horaFin: { type: String, required: true },

  descripcion: String,
  tema: String,
  recursos: [String], // URLs de recursos adicionales

  asistencia: [{
    estudiante: { type: Schema.Types.ObjectId, ref: 'BaseUser' },
    presente: { type: Boolean, default: false },
    registradoPor: { type: Schema.Types.ObjectId, ref: 'BaseUser' },
    fechaRegistro: { type: Date, default: Date.now },
    observaciones: String
  }],

  calificaciones: [{
    estudiante: { type: Schema.Types.ObjectId, ref: 'BaseUser' },
    puntaje: Number,
    comentarios: String
  }],

  estado: {
    type: String,
    enum: ['planificada', 'en_curso', 'completada', 'cancelada'],
    default: 'planificada'
  },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}
```

### 5.4 Modelo de Factura

```javascript
{
  estudiante: {
    type: Schema.Types.ObjectId,
    ref: 'BaseUser',
    required: true
  },
  numeroFactura: { type: String, unique: true, required: true },

  fechaEmision: { type: Date, required: true, default: Date.now },
  fechaVencimiento: { type: Date, required: true },

  itemFacturaSchema: [{
    descripcion: { type: String, required: true },
    cantidad: { type: Number, required: true, default: 1 },
    precioUnitario: { type: Number, required: true },
    subtotal: { type: Number, required: true }
  }],

  subtotal: { type: Number, required: true },
  total: { type: Number, required: true },

  estado: {
    type: String,
    enum: ['Borrador', 'Pendiente', 'Cobrada', 'Cobrada Parcialmente', 'Vencida'],
    default: 'Borrador'
  },

  periodoFacturado: String, // Ej: "Enero 2025"

  // Integración con sistema de facturación electrónica (ARCA)
  cae: String,
  fechaVencimientoCAE: Date,

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}
```

### 5.5 Modelo de Cobro

```javascript
{
  numeroRecibo: { type: String, unique: true, required: true },
  fechaCobro: { type: Date, required: true, default: Date.now },

  estudiante: {
    type: Schema.Types.ObjectId,
    ref: 'BaseUser',
    required: true
  },

  facturas: [{
    facturaId: { type: Schema.Types.ObjectId, ref: 'Factura', required: true },
    montoCobrado: { type: Number, required: true }
  }],

  montoTotal: { type: Number, required: true },

  metodoCobro: {
    type: String,
    enum: ['Efectivo', 'Transferencia', 'Mercado Pago', 'Tarjeta de Crédito', 'Tarjeta de Débito'],
    required: true
  },

  referenciaPago: String, // Número de transacción, comprobante, etc.
  notas: String,

  createdAt: { type: Date, default: Date.now }
}
```

### 5.6 Modelo de Reporte Académico

```javascript
{
  estudiante: {
    type: Schema.Types.ObjectId,
    ref: 'BaseUser',
    required: true
  },
  curso: {
    type: Schema.Types.ObjectId,
    ref: 'Curso',
    required: true
  },

  periodo: { type: String, required: true },

  asistencia: {
    total: Number,
    presente: Number,
    ausente: Number,
    porcentaje: Number
  },

  evaluacion: {
    promedio: Number,
    calificaciones: [{
      fecha: Date,
      tipo: String, // 'examen', 'tarea', 'participacion'
      puntaje: Number,
      comentarios: String
    }]
  },

  progreso: {
    nivel: String,
    avance: Number, // porcentaje 0-100
    competencias: [{
      nombre: String,
      nivel: String, // 'Básico', 'Intermedio', 'Avanzado'
    }]
  },

  observaciones: String,
  recomendaciones: String,

  fechaGeneracion: { type: Date, default: Date.now },
  generadoPor: { type: Schema.Types.ObjectId, ref: 'BaseUser' }
}
```

### 5.7 Modelo de Reporte Financiero

```javascript
{
  periodo: { type: String, required: true },
  fechaInicio: { type: Date, required: true },
  fechaFin: { type: Date, required: true },

  ingresos: {
    total: { type: Number, default: 0 },
    cobrosEfectivo: { type: Number, default: 0 },
    cobrosTransferencia: { type: Number, default: 0 },
    cobrosMercadoPago: { type: Number, default: 0 },
    cobrosTarjeta: { type: Number, default: 0 }
  },

  gastos: {
    total: { type: Number, default: 0 },
    salariosProfesores: { type: Number, default: 0 },
    gastosOperativos: { type: Number, default: 0 },
    otros: { type: Number, default: 0 }
  },

  saldos: {
    inicial: { type: Number, default: 0 },
    final: { type: Number, default: 0 },
    neto: { type: Number, default: 0 }
  },

  detallesPorCurso: [{
    curso: { type: Schema.Types.ObjectId, ref: 'Curso' },
    ingresos: Number,
    estudiantes: Number
  }],

  detallesPorProfesor: [{
    profesor: { type: Schema.Types.ObjectId, ref: 'BaseUser' },
    horasDictadas: Number,
    montoTotal: Number
  }],

  fechaGeneracion: { type: Date, default: Date.now },
  generadoPor: { type: Schema.Types.ObjectId, ref: 'BaseUser' }
}
```

### 5.8 Modelo de Auditoría

```javascript
{
  tipo: {
    type: String,
    required: true,
    enum: [
      'LOGIN', 'LOGOUT',
      'CREATE_USER', 'UPDATE_USER', 'DELETE_USER',
      'CREATE_CURSO', 'UPDATE_CURSO', 'DELETE_CURSO',
      'CREATE_FACTURA', 'UPDATE_FACTURA', 'DELETE_FACTURA',
      'CREATE_COBRO', 'UPDATE_COBRO', 'DELETE_COBRO',
      'REGISTRO_ASISTENCIA',
      'GENERATE_REPORT',
      'ERROR'
    ]
  },

  usuario: {
    type: Schema.Types.ObjectId,
    ref: 'BaseUser'
  },

  descripcion: { type: String, required: true },

  detalle: Schema.Types.Mixed, // Información adicional

  ipAddress: String,
  userAgent: String,

  timestamp: { type: Date, default: Date.now }
}
```

---

## 6. API REST - Endpoints

### 6.1 Autenticación (`/api/auth`)

#### Registro de Usuarios

**POST** `/api/auth/register/estudiante`
```json
// Request Body
{
  "email": "estudiante@example.com",
  "password": "password123",
  "firstName": "Juan",
  "lastName": "Pérez",
  "phone": "+5491123456789",
  "dni": "12345678",
  "nivel": "A1"
}

// Response 201
{
  "success": true,
  "message": "Estudiante registrado exitosamente",
  "data": {
    "_id": "...",
    "email": "estudiante@example.com",
    "firstName": "Juan",
    "lastName": "Pérez",
    "role": "estudiante",
    "nivel": "A1"
  }
}
```

**POST** `/api/auth/register/profesor`
```json
// Request Body (requiere admin auth)
{
  "email": "profesor@example.com",
  "password": "password123",
  "firstName": "María",
  "lastName": "González",
  "phone": "+5491123456789",
  "dni": "87654321",
  "especialidades": ["Inglés", "Francés"],
  "tarifaPorHora": 2000
}
```

#### Login

**POST** `/api/auth/login`
```json
// Request Body
{
  "email": "usuario@example.com",
  "password": "password123"
}

// Response 200
{
  "success": true,
  "message": "Login exitoso",
  "data": {
    "user": {
      "_id": "...",
      "email": "usuario@example.com",
      "firstName": "Juan",
      "lastName": "Pérez",
      "role": "estudiante"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### Verificación de Token

**GET** `/api/auth/verify-token`
```
Headers:
Authorization: Bearer <token>

// Response 200
{
  "success": true,
  "data": {
    "_id": "...",
    "email": "usuario@example.com",
    "role": "estudiante"
  }
}
```

#### Cambio de Contraseña

**PUT** `/api/auth/change-password`
```json
// Request Body (requiere auth)
{
  "currentPassword": "oldPassword123",
  "newPassword": "newPassword456"
}

// Response 200
{
  "success": true,
  "message": "Contraseña actualizada exitosamente"
}
```

### 6.2 Cursos (`/api/cursos`)

#### Listar Cursos Públicos (sin autenticación)

**GET** `/api/cursos/publico`
```
Query params (opcionales):
- idioma: ObjectId del idioma
- nivel: A1, A2, B1, B2, C1, C2
- modalidad: presencial, online, hibrido
- estado: activo, planificado

// Response 200
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "nombre": "Inglés Básico",
      "idioma": {
        "_id": "...",
        "name": "Inglés"
      },
      "nivel": "A1",
      "duracionTotal": 40,
      "tarifa": 15000,
      "modalidad": "online",
      "estado": "activo",
      "vacantesDisponibles": 15
    }
  ]
}
```

#### Obtener Detalle de Curso

**GET** `/api/cursos/:id`
```
Headers:
Authorization: Bearer <token>

// Response 200
{
  "success": true,
  "data": {
    "_id": "...",
    "nombre": "Inglés Básico",
    "idioma": { ... },
    "nivel": "A1",
    "descripcion": "...",
    "duracionTotal": 40,
    "tarifa": 15000,
    "profesor": {
      "_id": "...",
      "firstName": "María",
      "lastName": "González"
    },
    "horarios": [...],
    "estudiantes": [...],
    "fechaInicio": "2025-02-01",
    "fechaFin": "2025-05-01"
  }
}
```

#### Crear Curso

**POST** `/api/cursos`
```json
// Request Body (requiere auth profesor/admin)
{
  "nombre": "Inglés Intermedio",
  "idioma": "6789abc...",
  "nivel": "B1",
  "descripcion": "Curso de nivel intermedio",
  "duracionTotal": 60,
  "tarifa": 20000,
  "profesor": "1234def...",
  "horarios": ["horario1_id", "horario2_id"],
  "fechaInicio": "2025-03-01",
  "modalidad": "online",
  "type": "grupal",
  "vacantesMaximas": 20
}

// Response 201
{
  "success": true,
  "message": "Curso creado exitosamente",
  "data": { ... }
}
```

#### Inscribir Estudiante a Curso

**PATCH** `/api/cursos/:id/inscripcion`
```json
// Request Body
{
  "estudianteId": "estudiante_id",
  "accion": "inscribir" // o "desinscribir"
}

// Response 200
{
  "success": true,
  "message": "Estudiante inscrito exitosamente",
  "data": { ... }
}
```

### 6.3 Clases (`/api/clases`)

#### Listar Clases de un Curso

**GET** `/api/clases/curso/:cursoId`
```
// Response 200
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "curso": { ... },
      "profesor": { ... },
      "fecha": "2025-02-05",
      "horaInicio": "10:00",
      "horaFin": "12:00",
      "tema": "Presente Simple",
      "estado": "planificada",
      "asistencia": [...]
    }
  ]
}
```

#### Crear Clase

**POST** `/api/clases`
```json
// Request Body (requiere auth)
{
  "curso": "curso_id",
  "profesor": "profesor_id",
  "fecha": "2025-02-05",
  "horaInicio": "10:00",
  "horaFin": "12:00",
  "tema": "Presente Simple",
  "descripcion": "Introducción al presente simple"
}

// Response 201
{
  "success": true,
  "message": "Clase creada exitosamente",
  "data": { ... }
}
```

#### Registrar Asistencia

**PUT** `/api/clases/:id/asistencia`
```json
// Request Body
{
  "asistencia": [
    {
      "estudiante": "estudiante1_id",
      "presente": true,
      "observaciones": "Participó activamente"
    },
    {
      "estudiante": "estudiante2_id",
      "presente": false,
      "observaciones": "Falta justificada"
    }
  ]
}

// Response 200
{
  "success": true,
  "message": "Asistencia registrada exitosamente",
  "data": { ... }
}
```

### 6.4 Facturas (`/api/facturas`)

#### Obtener Mis Facturas (Estudiante)

**GET** `/api/facturas/mis-facturas`
```
Headers:
Authorization: Bearer <token>

// Response 200
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "numeroFactura": "FC 00001-00000001",
      "fechaEmision": "2025-01-15",
      "fechaVencimiento": "2025-02-15",
      "total": 15000,
      "estado": "Pendiente",
      "periodoFacturado": "Enero 2025",
      "saldoPendiente": 15000,
      "totalCobrado": 0
    }
  ]
}
```

#### Crear Factura (Admin)

**POST** `/api/facturas`
```json
// Request Body (requiere admin auth)
{
  "estudiante": "estudiante_id",
  "fechaEmision": "2025-01-15",
  "fechaVencimiento": "2025-02-15",
  "items": [
    {
      "descripcion": "Curso Inglés A1 - Enero 2025",
      "cantidad": 1,
      "precioUnitario": 15000,
      "subtotal": 15000
    }
  ],
  "subtotal": 15000,
  "total": 15000,
  "periodoFacturado": "Enero 2025"
}

// Response 201
{
  "success": true,
  "message": "Factura creada exitosamente",
  "data": { ... }
}
```

### 6.5 Cobros (`/api/cobros`)

#### Registrar Mi Pago (Estudiante)

**POST** `/api/cobros/mi-pago`
```json
// Request Body (requiere auth estudiante)
{
  "facturas": [
    {
      "facturaId": "factura1_id",
      "montoCobrado": 15000
    }
  ],
  "metodoCobro": "Transferencia",
  "referenciaPago": "TRANS123456",
  "notas": "Transferencia desde Banco Nación"
}

// Response 201
{
  "success": true,
  "message": "Pago registrado exitosamente",
  "data": {
    "numeroRecibo": "RC 00001-00000001",
    "montoTotal": 15000,
    "metodoCobro": "Transferencia"
  }
}
```

#### Obtener Mis Cobros (Estudiante)

**GET** `/api/cobros/mis-cobros`
```
Headers:
Authorization: Bearer <token>

// Response 200
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "numeroRecibo": "RC 00001-00000001",
      "fechaCobro": "2025-01-20",
      "montoTotal": 15000,
      "metodoCobro": "Transferencia",
      "facturas": [
        {
          "facturaId": {
            "_id": "...",
            "numeroFactura": "FC 00001-00000001",
            "estado": "Cobrada"
          },
          "montoCobrado": 15000
        }
      ]
    }
  ]
}
```

#### Crear Cobro (Admin)

**POST** `/api/cobros`
```json
// Request Body (requiere admin auth)
{
  "estudiante": "estudiante_id",
  "facturas": [
    {
      "facturaId": "factura1_id",
      "montoCobrado": 10000
    }
  ],
  "metodoCobro": "Efectivo",
  "notas": "Pago parcial"
}

// Response 201
{
  "success": true,
  "message": "Cobro registrado exitosamente",
  "data": { ... }
}
```

### 6.6 Reportes Académicos (`/api/reportes-academicos`)

#### Generar Reporte Académico

**POST** `/api/reportes-academicos/generar`
```json
// Request Body (requiere auth profesor/admin)
{
  "estudiante": "estudiante_id",
  "curso": "curso_id",
  "periodo": "Enero-Marzo 2025",
  "asistencia": {
    "total": 20,
    "presente": 18,
    "ausente": 2,
    "porcentaje": 90
  },
  "evaluacion": {
    "promedio": 85,
    "calificaciones": [
      {
        "fecha": "2025-02-15",
        "tipo": "examen",
        "puntaje": 85,
        "comentarios": "Buen desempeño"
      }
    ]
  },
  "progreso": {
    "nivel": "A1",
    "avance": 75,
    "competencias": [
      { "nombre": "Comprensión oral", "nivel": "Intermedio" },
      { "nombre": "Expresión escrita", "nivel": "Básico" }
    ]
  },
  "observaciones": "Estudiante aplicado y participativo"
}

// Response 201
{
  "success": true,
  "message": "Reporte académico generado exitosamente",
  "data": { ... }
}
```

#### Obtener Estudiantes en Riesgo (Admin)

**GET** `/api/reportes-academicos/estudiantes-en-riesgo/asistencia`
```
Query params:
- umbral: porcentaje mínimo de asistencia (default: 75)

// Response 200
{
  "success": true,
  "data": [
    {
      "estudiante": {
        "_id": "...",
        "firstName": "Juan",
        "lastName": "Pérez"
      },
      "curso": {
        "nombre": "Inglés A1"
      },
      "asistenciaActual": 65,
      "clasesTotales": 20,
      "clasesPresentes": 13
    }
  ]
}
```

### 6.7 Dashboard (`/api/dashboard`)

#### Obtener Estadísticas Generales (Admin)

**GET** `/api/dashboard/estadisticas`
```
Headers:
Authorization: Bearer <token>

// Response 200
{
  "success": true,
  "data": {
    "estudiantes": {
      "total": 150,
      "activos": 142,
      "nuevosEsteMes": 12
    },
    "profesores": {
      "total": 15,
      "activos": 14
    },
    "cursos": {
      "total": 25,
      "activos": 18,
      "completados": 5
    },
    "clases": {
      "totalEsteMes": 120,
      "completadas": 95
    },
    "finanzas": {
      "ingresosEsteMes": 450000,
      "pendientesCobro": 75000
    }
  }
}
```

---

## 7. Componentes Frontend

### 7.1 Estructura de Componentes React

#### AuthNavbar.jsx
```jsx
/**
 * Navbar para usuarios autenticados
 * Muestra navegación según el rol del usuario
 */
const AuthNavbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="auth-navbar">
      {/* Logo y nombre */}
      {/* Links según rol */}
      {user.role === 'admin' && <AdminLinks />}
      {user.role === 'profesor' && <ProfesorLinks />}
      {user.role === 'estudiante' && <EstudianteLinks />}
      {/* Botón de logout */}
    </nav>
  );
};
```

#### ProtectedRoute.jsx
```jsx
/**
 * Componente para proteger rutas según autenticación y roles
 */
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }

    if (!loading && user && allowedRoles.length > 0) {
      if (!allowedRoles.includes(user.role)) {
        navigate('/unauthorized');
      }
    }
  }, [user, loading]);

  if (loading) return <LoadingSpinner />;

  return user ? children : null;
};
```

### 7.2 Hook Personalizado useAuth

```jsx
/**
 * Hook personalizado para manejo de autenticación
 * Provee contexto de usuario y funciones de auth
 */
import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mustChangePassword, setMustChangePassword] = useState(false);

  useEffect(() => {
    // Verificar token al montar
    const token = localStorage.getItem('token');
    if (token) {
      verifyToken(token);
    } else {
      setLoading(false);
    }
  }, []);

  const verifyToken = async (token) => {
    try {
      const response = await api.get('/auth/verify-token', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setUser(response.data.data);
        setMustChangePassword(response.data.data.mustChangePassword);
      }
    } catch (error) {
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });

    if (response.data.success) {
      const { user, token } = response.data.data;
      localStorage.setItem('token', token);
      setUser(user);
      setMustChangePassword(user.mustChangePassword);
      return user;
    }

    throw new Error(response.data.message);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setMustChangePassword(false);
  };

  const changePassword = async (currentPassword, newPassword) => {
    const response = await api.put('/auth/change-password', {
      currentPassword,
      newPassword
    });

    if (response.data.success) {
      setMustChangePassword(false);
    }

    return response.data;
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      mustChangePassword,
      login,
      logout,
      changePassword,
      setMustChangePassword
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

### 7.3 Servicio API (Axios)

```javascript
/**
 * Cliente Axios configurado con interceptores
 * Ubicación: client/src/services/api.js
 */
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor de Request - Agrega token JWT
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor de Response - Manejo de errores
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      // Error del servidor (4xx, 5xx)
      if (error.response.status === 401) {
        // Token expirado o inválido
        localStorage.removeItem('token');
        window.location.href = '/login';
      }

      if (error.response.status === 403) {
        // Sin permisos
        console.error('Acceso denegado');
      }
    } else if (error.request) {
      // Error de red
      console.error('Error de red:', error.message);
    }

    return Promise.reject(error);
  }
);

export default api;
```

---

## 8. Flujos de Trabajo

### 8.1 Flujo de Autenticación

```
┌─────────────┐
│   Cliente   │
└─────┬───────┘
      │
      │ 1. POST /api/auth/login
      │    { email, password }
      ▼
┌─────────────────────┐
│   Auth Controller   │
│                     │
│ - Validar email     │
│ - Verificar password│
│ - Generar JWT       │
└─────┬───────────────┘
      │
      │ 2. Response
      │    { user, token }
      ▼
┌─────────────┐
│   Cliente   │
│             │
│ - Guardar   │
│   token en  │
│   localStorage
│             │
│ - Setear    │
│   user en   │
│   contexto  │
└─────┬───────┘
      │
      │ 3. Siguientes requests
      │    Header: Authorization: Bearer <token>
      ▼
┌─────────────────────┐
│  authMiddleware     │
│                     │
│ - Extraer token     │
│ - Verificar JWT     │
│ - Decodificar user  │
│ - Agregar a req.user│
└─────────────────────┘
```

### 8.2 Flujo de Creación de Curso

```
1. Admin/Profesor accede a Dashboard
2. Click en "Crear Curso"
3. Modal CourseFormModal se abre
4. Completa formulario:
   - Nombre del curso
   - Selecciona idioma
   - Selecciona nivel
   - Define duración y tarifa
   - Asigna profesor
   - Selecciona horarios
   - Define fechas inicio/fin
5. Submit formulario
6. POST /api/cursos
7. Backend:
   - Valida datos (cursosValidator)
   - Crea documento en DB (Curso model)
   - Registra en auditoría
8. Response exitosa
9. Frontend:
   - Cierra modal
   - Recarga lista de cursos
   - Muestra mensaje de éxito
```

### 8.3 Flujo de Registro de Asistencia

```
1. Profesor accede a clase específica
2. Click en "Registrar Asistencia"
3. Sistema muestra lista de estudiantes inscritos
4. Para cada estudiante:
   - Marca presente/ausente
   - Opcionalmente agrega observaciones
5. Submit asistencia
6. PUT /api/clases/:id/asistencia
7. Backend:
   - Valida que la clase exista
   - Valida que profesor sea el asignado
   - Actualiza array de asistencia
   - Calcula estadísticas de asistencia
   - Registra en auditoría
8. Response exitosa
9. Frontend actualiza vista de clase
```

### 8.4 Flujo de Facturación y Cobro

```
┌────────────────────────────────────────┐
│ 1. GENERACIÓN DE FACTURA (Admin)       │
└────────────────┬───────────────────────┘
                 │
                 │ Admin crea factura
                 │ POST /api/facturas
                 ▼
┌────────────────────────────────────────┐
│ Factura creada en estado "Borrador"    │
└────────────────┬───────────────────────┘
                 │
                 │ Admin autoriza factura
                 │ PATCH /api/facturas/:id/autorizar
                 ▼
┌────────────────────────────────────────┐
│ Factura pasa a estado "Pendiente"      │
│ - Se asigna CAE (si corresponde)       │
│ - Se asigna número de factura          │
└────────────────┬───────────────────────┘
                 │
                 │ Estudiante visualiza
                 │ GET /api/facturas/mis-facturas
                 ▼
┌────────────────────────────────────────┐
│ 2. PAGO POR PARTE DEL ESTUDIANTE       │
└────────────────┬───────────────────────┘
                 │
                 │ Estudiante realiza pago
                 │ POST /api/cobros/mi-pago
                 │ {
                 │   facturas: [{ facturaId, montoCobrado }],
                 │   metodoCobro: "Transferencia"
                 │ }
                 ▼
┌────────────────────────────────────────┐
│ Backend procesa cobro:                 │
│ 1. Genera número de recibo automático  │
│ 2. Crea documento Cobro                │
│ 3. Actualiza estado de factura(s):     │
│    - Si montoCobrado = total:          │
│      → estado "Cobrada"                │
│    - Si montoCobrado < total:          │
│      → estado "Cobrada Parcialmente"   │
│ 4. Registra en auditoría               │
└────────────────┬───────────────────────┘
                 │
                 │ Response exitosa
                 │ { numeroRecibo, montoTotal }
                 ▼
┌────────────────────────────────────────┐
│ 3. VISUALIZACIÓN DE COBRO              │
│                                        │
│ Estudiante ve:                         │
│ - Recibo generado                      │
│ - Facturas incluidas                   │
│ - Monto total                          │
│ - Método de pago                       │
│ - Saldo pendiente (si corresponde)    │
└────────────────────────────────────────┘
```

### 8.5 Flujo de Generación de Reportes

```
1. Admin accede a sección de reportes
2. Selecciona tipo de reporte:
   - Académico (por estudiante/curso)
   - Financiero (por período)
3. Define parámetros:
   - Período
   - Filtros específicos
4. Click en "Generar Reporte"
5. Backend:
   - Consulta datos necesarios
   - Procesa y agrega información
   - Genera documento PDF/Excel
   - Guarda registro del reporte
6. Response:
   - Opción 1: URL de descarga
   - Opción 2: Archivo directo
7. Frontend muestra reporte o descarga archivo
```

---

## 9. Configuración y Deployment

### 9.1 Variables de Entorno

#### Backend (`.env`)
```bash
# Puerto del servidor
PORT=5000

# Base de datos MongoDB
MONGODB_URI=mongodb+srv://<usuario>:<password>@<cluster>.mongodb.net/<dbname>?retryWrites=true&w=majority

# JWT
JWT_SECRET=mi_clave_super_secreta_para_jwt_2025_consultora_idiomas_backend
JWT_EXPIRES_IN=7d

# Firebase (opcional)
FIREBASE_PROJECT_ID=tu_project_id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=tu_email@tu_project_id.iam.gserviceaccount.com

# Cloudinary (opcional)
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret

# Entorno
NODE_ENV=development

# Seguridad
BCRYPT_ROUNDS=12

# Frontend URL (para CORS)
FRONTEND_URL=http://localhost:3000
```

#### Frontend (`.env`)
```bash
# URL del backend
VITE_API_URL=http://localhost:5000/api
```

### 9.2 Instalación y Configuración Local

#### Requisitos Previos
- Node.js v16+ y npm
- MongoDB v5+ (local o Atlas)
- Git

#### Pasos de Instalación

```bash
# 1. Clonar repositorio
git clone <url-repositorio>
cd PPIV_Consultora_de_Idiomas

# 2. Instalar dependencias del backend
cd server
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales

# 4. Iniciar servidor backend (modo desarrollo)
npm run dev
# El servidor iniciará en http://localhost:5000

# 5. En otra terminal, instalar dependencias del frontend
cd ../client
npm install

# 6. Configurar variables de entorno del frontend
cp .env.example .env
# Editar .env si es necesario

# 7. Iniciar servidor frontend (modo desarrollo)
npm run dev
# El cliente iniciará en http://localhost:3000
```

#### Crear Primer Administrador

```bash
# Desde el directorio server/
curl -X POST http://localhost:5000/api/auth/create-first-admin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@consultora.com",
    "password": "Admin123!",
    "firstName": "Admin",
    "lastName": "Principal",
    "dni": "00000000"
  }'
```

### 9.3 Scripts Disponibles

#### Backend (`server/package.json`)
```json
{
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js",
    "test": "jest --detectOpenHandles",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "seed": "node scripts/runSeeds.js",
    "seed:empresa": "node seeds/empresaSeed.js"
  }
}
```

#### Frontend (`client/package.json`)
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint src --ext js,jsx"
  }
}
```

### 9.4 Deployment en Producción

#### Backend (Ejemplo con Render/Railway)

1. **Preparación**
```bash
# Asegurar que index.js use process.env.PORT
const PORT = process.env.PORT || 5000;
```

2. **Configurar variables de entorno en plataforma**
   - `MONGODB_URI`: URI de MongoDB Atlas
   - `JWT_SECRET`: Clave secreta fuerte
   - `NODE_ENV`: production
   - `FRONTEND_URL`: URL del frontend en producción

3. **Configurar CORS para producción**
```javascript
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? process.env.FRONTEND_URL
    : ['http://localhost:3000'],
  credentials: true
}));
```

#### Frontend (Ejemplo con Vercel/Netlify)

1. **Build del proyecto**
```bash
cd client
npm run build
# Genera carpeta dist/
```

2. **Configurar variables de entorno**
   - `VITE_API_URL`: URL del backend en producción

3. **Deploy**
```bash
# Vercel
vercel --prod

# O Netlify
netlify deploy --prod --dir=dist
```

### 9.5 Configuración de MongoDB Atlas

1. Crear cuenta en MongoDB Atlas
2. Crear cluster gratuito
3. Configurar IP whitelist (0.0.0.0/0 para cualquier IP)
4. Crear usuario de base de datos
5. Obtener connection string
6. Reemplazar en `MONGODB_URI`:
```
mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/<dbname>?retryWrites=true&w=majority
```

---

## 10. Guía de Desarrollo

### 10.1 Convenciones de Código

#### Naming Conventions

**Variables y Funciones**
```javascript
// camelCase para variables y funciones
const studentName = 'Juan';
const calculateTotal = () => { ... };
```

**Clases y Componentes React**
```javascript
// PascalCase para clases y componentes
class UserService { ... }
const StudentDashboard = () => { ... };
```

**Constantes**
```javascript
// UPPER_SNAKE_CASE para constantes
const API_BASE_URL = 'http://localhost:5000';
const MAX_STUDENTS_PER_COURSE = 20;
```

**Archivos**
```
// Backend
controllers/  → estudianteController.js
models/       → Estudiante.js
routes/       → estudiantes.routes.js
services/     → estudianteService.js

// Frontend
components/   → StudentDashboard.jsx
hooks/        → useAuth.jsx
utils/        → formatting.js
```

#### Estructura de Funciones

```javascript
/**
 * Descripción breve de la función
 * @param {Type} paramName - Descripción del parámetro
 * @returns {Type} Descripción del valor de retorno
 */
const functionName = (paramName) => {
  // Validaciones primero
  if (!paramName) {
    throw new Error('ParamName is required');
  }

  // Lógica principal
  const result = doSomething(paramName);

  // Return
  return result;
};
```

### 10.2 Buenas Prácticas

#### Backend

**1. Separación de Responsabilidades**
```javascript
// CORRECTO
// Controller - Maneja request/response
exports.getCursos = async (req, res) => {
  try {
    const cursos = await cursosService.listarCursos(req.query);
    res.json({ success: true, data: cursos });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Service - Lógica de negocio
exports.listarCursos = async (filtros) => {
  const query = buildQuery(filtros);
  return await Curso.find(query).populate('profesor idioma');
};

// INCORRECTO - Todo en el controller
exports.getCursos = async (req, res) => {
  try {
    const query = {};
    if (req.query.nivel) query.nivel = req.query.nivel;
    const cursos = await Curso.find(query).populate('profesor idioma');
    res.json({ success: true, data: cursos });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
```

**2. Validación de Inputs**
```javascript
// Usar express-validator
const { body, validationResult } = require('express-validator');

const validateCurso = [
  body('nombre').notEmpty().withMessage('Nombre es requerido'),
  body('nivel').isIn(['A1', 'A2', 'B1', 'B2', 'C1', 'C2'])
    .withMessage('Nivel inválido'),
  body('tarifa').isNumeric().withMessage('Tarifa debe ser numérica'),
];

router.post('/cursos', validateCurso, (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  // Procesar...
});
```

**3. Manejo de Errores Centralizado**
```javascript
// shared/middleware/errorHandler.js
exports.errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  const status = err.statusCode || 500;
  const message = err.message || 'Error interno del servidor';

  res.status(status).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

// En index.js
app.use(errorHandler);
```

**4. Uso de Async/Await con Try/Catch**
```javascript
// CORRECTO
exports.getCurso = async (req, res, next) => {
  try {
    const curso = await Curso.findById(req.params.id);
    if (!curso) {
      return res.status(404).json({
        success: false,
        message: 'Curso no encontrado'
      });
    }
    res.json({ success: true, data: curso });
  } catch (error) {
    next(error); // Pasa al error handler
  }
};
```

#### Frontend

**1. Componentes Pequeños y Reutilizables**
```jsx
// CORRECTO - Componente pequeño y específico
const CourseCard = ({ curso, onEnroll }) => {
  return (
    <div className="course-card">
      <h3>{curso.nombre}</h3>
      <p>{curso.descripcion}</p>
      <button onClick={() => onEnroll(curso._id)}>
        Inscribirse
      </button>
    </div>
  );
};

// INCORRECTO - Componente monolítico
const CoursesPage = () => {
  // 500 líneas de código con toda la lógica de cursos
};
```

**2. Hooks Personalizados para Lógica Reutilizable**
```jsx
// hooks/useCursos.jsx
export const useCursos = () => {
  const [cursos, setCursos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCursos = async (filtros = {}) => {
    setLoading(true);
    try {
      const response = await cursosAPI.listar(filtros);
      setCursos(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCursos();
  }, []);

  return { cursos, loading, error, refetch: fetchCursos };
};

// Uso en componente
const CursosPage = () => {
  const { cursos, loading, error } = useCursos();

  if (loading) return <Spinner />;
  if (error) return <Error message={error} />;

  return (
    <div>
      {cursos.map(curso => <CourseCard key={curso._id} curso={curso} />)}
    </div>
  );
};
```

**3. Manejo de Estado con Context API**
```jsx
// Para estado global (usuario, tema, etc.)
import { createContext, useContext, useState } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light');

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
```

**4. Validación de Props con PropTypes o TypeScript**
```jsx
import PropTypes from 'prop-types';

const CourseCard = ({ curso, onEnroll }) => {
  // Component code...
};

CourseCard.propTypes = {
  curso: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    nombre: PropTypes.string.isRequired,
    nivel: PropTypes.string.isRequired,
    tarifa: PropTypes.number.isRequired
  }).isRequired,
  onEnroll: PropTypes.func
};

CourseCard.defaultProps = {
  onEnroll: () => {}
};
```

### 10.3 Testing

#### Backend - Tests con Jest

```javascript
// __tests__/services/cursoService.test.js
const cursoService = require('../../services/cursosService');
const Curso = require('../../models/Curso');

// Mock del modelo
jest.mock('../../models/Curso');

describe('CursoService', () => {
  describe('listarCursos', () => {
    it('debe retornar lista de cursos activos', async () => {
      const mockCursos = [
        { _id: '1', nombre: 'Inglés A1', estado: 'activo' },
        { _id: '2', nombre: 'Francés B1', estado: 'activo' }
      ];

      Curso.find.mockResolvedValue(mockCursos);

      const result = await cursoService.listarCursos({ estado: 'activo' });

      expect(result).toHaveLength(2);
      expect(result[0].nombre).toBe('Inglés A1');
    });

    it('debe manejar errores correctamente', async () => {
      Curso.find.mockRejectedValue(new Error('Database error'));

      await expect(cursoService.listarCursos()).rejects.toThrow('Database error');
    });
  });
});
```

#### Frontend - Tests con React Testing Library

```jsx
// __tests__/components/CourseCard.test.jsx
import { render, screen, fireEvent } from '@testing-library/react';
import CourseCard from '../components/courses/CourseCard';

describe('CourseCard', () => {
  const mockCurso = {
    _id: '1',
    nombre: 'Inglés A1',
    nivel: 'A1',
    tarifa: 15000
  };

  it('debe renderizar información del curso', () => {
    render(<CourseCard curso={mockCurso} />);

    expect(screen.getByText('Inglés A1')).toBeInTheDocument();
    expect(screen.getByText('A1')).toBeInTheDocument();
  });

  it('debe llamar onEnroll al hacer click', () => {
    const mockOnEnroll = jest.fn();
    render(<CourseCard curso={mockCurso} onEnroll={mockOnEnroll} />);

    const button = screen.getByRole('button', { name: /inscribirse/i });
    fireEvent.click(button);

    expect(mockOnEnroll).toHaveBeenCalledWith('1');
  });
});
```

### 10.4 Git Workflow

#### Branches
```
main           → Producción (protegida)
develop        → Desarrollo principal
feature/*      → Nuevas funcionalidades
bugfix/*       → Corrección de bugs
hotfix/*       → Correcciones urgentes en producción
```

#### Commits
```bash
# Formato de commits
<tipo>(<alcance>): <descripción breve>

# Tipos:
# feat: Nueva funcionalidad
# fix: Corrección de bug
# docs: Documentación
# style: Formato (sin cambios en código)
# refactor: Refactorización
# test: Tests
# chore: Tareas de mantenimiento

# Ejemplos:
git commit -m "feat(cursos): agregar filtro por modalidad"
git commit -m "fix(auth): corregir validación de token expirado"
git commit -m "docs(api): actualizar documentación de endpoints"
```

---

## 11. Testing

### 11.1 Configuración de Jest (Backend)

```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'node',
  coveragePathIgnorePatterns: ['/node_modules/'],
  testMatch: ['**/__tests__/**/*.test.js'],
  collectCoverageFrom: [
    'controllers/**/*.js',
    'services/**/*.js',
    'models/**/*.js'
  ],
  setupFilesAfterEnv: ['<rootDir>/__tests__/setup.js']
};
```

### 11.2 Tests de Integración (Backend)

```javascript
// __tests__/integration/auth.test.js
const request = require('supertest');
const app = require('../../index');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Auth Endpoints', () => {
  describe('POST /api/auth/register/estudiante', () => {
    it('debe registrar un nuevo estudiante', async () => {
      const response = await request(app)
        .post('/api/auth/register/estudiante')
        .send({
          email: 'test@example.com',
          password: 'password123',
          firstName: 'Test',
          lastName: 'User',
          dni: '12345678'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBe('test@example.com');
    });

    it('debe rechazar email duplicado', async () => {
      // Primer registro
      await request(app)
        .post('/api/auth/register/estudiante')
        .send({
          email: 'duplicate@example.com',
          password: 'password123',
          firstName: 'Test',
          lastName: 'User',
          dni: '12345678'
        });

      // Segundo registro con mismo email
      const response = await request(app)
        .post('/api/auth/register/estudiante')
        .send({
          email: 'duplicate@example.com',
          password: 'password456',
          firstName: 'Another',
          lastName: 'User',
          dni: '87654321'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Crear usuario de prueba
      await request(app)
        .post('/api/auth/register/estudiante')
        .send({
          email: 'login@example.com',
          password: 'password123',
          firstName: 'Login',
          lastName: 'Test',
          dni: '11111111'
        });
    });

    it('debe hacer login exitosamente', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data.user.email).toBe('login@example.com');
    });

    it('debe rechazar contraseña incorrecta', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@example.com',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });
});
```

---

## 12. Seguridad

### 12.1 Autenticación JWT

**Generación de Token**
```javascript
const jwt = require('jsonwebtoken');

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    }
  );
};
```

**Verificación de Token**
```javascript
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new Error('Token inválido o expirado');
  }
};
```

### 12.2 Middleware de Autenticación

```javascript
// middleware/authMiddlewareNew.js
const jwt = require('jsonwebtoken');
const BaseUser = require('../models/BaseUser');

exports.authenticateToken = async (req, res, next) => {
  try {
    // Extraer token del header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token no proporcionado'
      });
    }

    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Buscar usuario
    const user = await BaseUser.findById(decoded.id);

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no encontrado o inactivo'
      });
    }

    // Agregar usuario a request
    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: 'Token inválido o expirado'
    });
  }
};

exports.requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Acceso denegado. Se requieren permisos de administrador.'
    });
  }
  next();
};

exports.requireProfesor = (req, res, next) => {
  if (req.user.role !== 'profesor' && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Acceso denegado. Se requieren permisos de profesor.'
    });
  }
  next();
};
```

### 12.3 Hashing de Contraseñas

```javascript
const bcrypt = require('bcryptjs');

// En el modelo BaseUser
baseUserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

baseUserSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};
```

### 12.4 Protección contra Ataques Comunes

#### SQL Injection (NoSQL Injection)
```javascript
// Mongoose sanitiza automáticamente, pero se puede agregar:
const mongoSanitize = require('express-mongo-sanitize');
app.use(mongoSanitize());
```

#### XSS (Cross-Site Scripting)
```javascript
const xss = require('xss-clean');
app.use(xss());
```

#### Rate Limiting
```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // límite de 100 requests por IP
  message: 'Demasiadas peticiones desde esta IP'
});

app.use('/api/', limiter);
```

#### Helmet (Seguridad HTTP Headers)
```javascript
const helmet = require('helmet');
app.use(helmet());
```

### 12.5 Validación de Inputs

```javascript
const { body, param, validationResult } = require('express-validator');

const validateLogin = [
  body('email')
    .isEmail().withMessage('Email inválido')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 }).withMessage('Contraseña debe tener mínimo 6 caracteres')
];

router.post('/login', validateLogin, (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  // Procesar login...
});
```

---

## 13. Troubleshooting

### 13.1 Problemas Comunes del Backend

#### Error: "Cannot connect to MongoDB"

**Síntomas:**
```
MongooseServerSelectionError: connect ECONNREFUSED 127.0.0.1:27017
```

**Soluciones:**
1. Verificar que MongoDB esté corriendo localmente o URI de Atlas sea correcta
2. Revisar variables de entorno en `.env`:
   ```bash
   MONGODB_URI=mongodb+srv://...
   ```
3. Verificar firewall o IP whitelist en MongoDB Atlas
4. Probar conexión manual con MongoDB Compass

#### Error: "JWT token invalid or expired"

**Síntomas:**
```json
{
  "success": false,
  "message": "Token inválido o expirado"
}
```

**Soluciones:**
1. Verificar que `JWT_SECRET` sea el mismo en backend y frontend
2. Limpiar localStorage del navegador
3. Hacer login nuevamente
4. Verificar tiempo de expiración en `.env`:
   ```bash
   JWT_EXPIRES_IN=7d
   ```

#### Error: "CORS policy error"

**Síntomas:**
```
Access to XMLHttpRequest has been blocked by CORS policy
```

**Soluciones:**
1. Verificar configuración de CORS en `index.js`:
   ```javascript
   app.use(cors({
     origin: process.env.FRONTEND_URL || 'http://localhost:3000',
     credentials: true
   }));
   ```
2. Asegurar que `FRONTEND_URL` en `.env` coincida con URL del cliente

#### Error: "ValidationError" en Mongoose

**Síntomas:**
```
ValidationError: Validation failed: email: Path `email` is required.
```

**Soluciones:**
1. Revisar que todos los campos requeridos estén siendo enviados
2. Verificar formato de datos (ej: ObjectId válido para referencias)
3. Revisar schema del modelo en `/models`

### 13.2 Problemas Comunes del Frontend

#### Error: "Cannot read property of undefined"

**Síntomas:**
```javascript
TypeError: Cannot read property '_id' of undefined
```

**Soluciones:**
1. Usar optional chaining:
   ```javascript
   const id = user?._id;
   ```
2. Verificar que datos existan antes de usar:
   ```javascript
   {user && <div>{user.firstName}</div>}
   ```
3. Usar valores por defecto:
   ```javascript
   const name = user?.firstName || 'Usuario';
   ```

#### Error: "Network Error" en Axios

**Síntomas:**
```
Error: Network Error
```

**Soluciones:**
1. Verificar que backend esté corriendo
2. Revisar URL del API en `.env`:
   ```bash
   VITE_API_URL=http://localhost:5000/api
   ```
3. Verificar configuración de CORS
4. Abrir DevTools → Network para ver detalles

#### Error: "401 Unauthorized" en requests

**Síntomas:**
```json
{
  "success": false,
  "message": "Token no proporcionado"
}
```

**Soluciones:**
1. Verificar que token esté en localStorage:
   ```javascript
   console.log(localStorage.getItem('token'));
   ```
2. Revisar interceptor de Axios en `/services/api.js`
3. Hacer login nuevamente

#### Error: "Module not found" en Vite

**Síntomas:**
```
Error: Cannot find module '@/components/...'
```

**Soluciones:**
1. Verificar que el archivo exista en la ruta correcta
2. Usar rutas relativas en lugar de alias si no están configurados
3. Reiniciar servidor de desarrollo:
   ```bash
   npm run dev
   ```

### 13.3 Problemas de Performance

#### Backend lento en respuestas

**Diagnóstico:**
- Usar `morgan` para logging de requests
- Agregar logs de tiempo en controllers

**Soluciones:**
1. Optimizar queries de Mongoose:
   ```javascript
   // Usar select para traer solo campos necesarios
   Curso.find().select('nombre nivel tarifa')

   // Usar lean() para objetos planos (más rápido)
   Curso.find().lean()

   // Indexar campos frecuentes
   cursoSchema.index({ nivel: 1, estado: 1 });
   ```
2. Implementar paginación
3. Usar caché (Redis) para datos frecuentes

#### Frontend lento en renderizado

**Diagnóstico:**
- Usar React DevTools Profiler
- Verificar re-renders innecesarios

**Soluciones:**
1. Memoizar componentes:
   ```javascript
   const CourseCard = React.memo(({ curso }) => {
     // Component code
   });
   ```
2. Usar `useMemo` y `useCallback`:
   ```javascript
   const sortedCursos = useMemo(() => {
     return cursos.sort((a, b) => a.nombre.localeCompare(b.nombre));
   }, [cursos]);
   ```
3. Lazy loading de componentes:
   ```javascript
   const AdminDashboard = lazy(() => import('./pages/Dashboard/AdminDashboard'));
   ```

### 13.4 Debugging

#### Backend

**Usar console.log estratégicamente:**
```javascript
console.log('Request body:', req.body);
console.log('User ID:', req.user._id);
console.log('Query result:', cursos);
```

**Usar debugger de Node.js:**
```bash
# Iniciar con inspector
node --inspect index.js

# En Chrome, ir a: chrome://inspect
```

**Usar Postman/Thunder Client para probar endpoints:**
```
GET http://localhost:5000/api/cursos
Headers:
  Authorization: Bearer <token>
```

#### Frontend

**Usar React DevTools:**
- Inspeccionar componentes
- Ver props y state
- Profiler para performance

**Usar Network tab:**
- Ver requests HTTP
- Verificar status codes
- Revisar payloads

**Usar console.log:**
```javascript
console.log('User data:', user);
console.log('API response:', response.data);
```

---

## ANEXOS

### Anexo A: Glosario de Términos

| Término | Definición |
|---------|-----------|
| **JWT** | JSON Web Token - Estándar para autenticación basada en tokens |
| **ODM** | Object Document Mapper - Mapeo entre objetos y documentos de BD |
| **CORS** | Cross-Origin Resource Sharing - Política de recursos entre orígenes |
| **Discriminador** | Patrón de Mongoose para herencia de schemas |
| **CAE** | Código de Autorización Electrónico (facturación) |
| **Middleware** | Función intermedia que procesa requests antes de llegar al endpoint |
| **Hook** | Función especial de React para usar estado y ciclo de vida |
| **Context API** | API de React para compartir estado global |

### Anexo B: Estructura de Respuestas de API

Todas las respuestas de la API siguen esta estructura estándar:

**Respuesta Exitosa:**
```json
{
  "success": true,
  "message": "Descripción de la operación",
  "data": {
    // Datos específicos de la respuesta
  }
}
```

**Respuesta de Error:**
```json
{
  "success": false,
  "message": "Descripción del error",
  "errors": [
    // Array de errores (opcional)
  ]
}
```

### Anexo C: Códigos de Estado HTTP Utilizados

| Código | Significado | Uso |
|--------|-------------|-----|
| 200 | OK | Operación exitosa |
| 201 | Created | Recurso creado exitosamente |
| 400 | Bad Request | Datos de entrada inválidos |
| 401 | Unauthorized | No autenticado (falta token) |
| 403 | Forbidden | Autenticado pero sin permisos |
| 404 | Not Found | Recurso no encontrado |
| 500 | Internal Server Error | Error del servidor |

### Anexo D: Enlaces Útiles

- **Documentación Mongoose**: https://mongoosejs.com/docs/
- **Express.js**: https://expressjs.com/
- **React**: https://react.dev/
- **Vite**: https://vitejs.dev/
- **JWT**: https://jwt.io/
- **MongoDB Atlas**: https://www.mongodb.com/cloud/atlas

---

## CONCLUSIÓN

Este manual técnico proporciona una visión completa del proyecto PPIV Consultora de Idiomas, incluyendo arquitectura, modelos de datos, endpoints de API, componentes frontend, flujos de trabajo, configuración, desarrollo y troubleshooting.

Para soporte adicional o preguntas específicas, contactar al equipo de desarrollo.

**Versión del Manual:** 1.0
**Fecha:** Noviembre 2025
**Autor:** Equipo de Desarrollo PPIV
