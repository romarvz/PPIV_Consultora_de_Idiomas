# Arquitectura del Backend - Sistema Consultora de Idiomas

## Índice
1. [Visión General](#visión-general)
2. [Estructura de Directorios](#estructura-de-directorios)
3. [Modelos de Datos](#modelos-de-datos)
4. [Controladores](#controladores)
5. [Rutas y Endpoints](#rutas-y-endpoints)
6. [Middleware](#middleware)
7. [Validadores](#validadores)
8. [Servicios](#servicios)
9. [Helpers y Utilidades](#helpers-y-utilidades)
10. [Autenticación y Autorización](#autenticación-y-autorización)
11. [Base de Datos](#base-de-datos)
12. [Flujos de Datos](#flujos-de-datos)

---

## Visión General

Sistema backend desarrollado con **Node.js + Express + MongoDB** que implementa una arquitectura modular basada en el patrón **MVC (Model-View-Controller)** con capas adicionales de servicios y validación.

### Tecnologías Core
- **Runtime:** Node.js v14+
- **Framework:** Express.js ^4.18.2
- **Base de Datos:** MongoDB con Mongoose ^7.5.0
- **Autenticación:** JWT (jsonwebtoken ^9.0.2)
- **Seguridad:** bcryptjs ^3.0.2, helmet ^8.1.0
- **Validación:** express-validator ^7.2.1

### Principios de Diseño
- **Separación de responsabilidades** por capas
- **Modelos discriminados** para herencia de usuarios
- **Middleware reutilizable** para autenticación y validación
- **Respuestas estandarizadas** con helpers compartidos
- **Validaciones centralizadas** por tipo de entidad

---

## Estructura de Directorios

```
server/
├── controllers/           # Lógica de negocio y manejo de requests
│   ├── authControllerNew.js      # Autenticación y usuarios (ACTIVO)
│   ├── authController.js         # Legacy (BACKUP)
│   ├── horarioController.js      # Gestión de horarios
│   └── claseController.js        # Gestión de clases
│
├── models/               # Modelos de datos Mongoose
│   ├── BaseUser.js              # Modelo base con discriminador
│   ├── Estudiante.js            # Modelo estudiante
│   ├── Profesor.js              # Modelo profesor
│   ├── Admin.js                 # Modelo administrador
│   ├── Horario.js               # Modelo horarios
│   ├── Clase.js                 # Modelo clases
│   ├── Language.js              # Modelo idiomas
│   └── index.js                 # Exportaciones centralizadas
│
├── routes/               # Definición de rutas API
│   ├── authNew.js               # Rutas autenticación (ACTIVAS)
│   ├── auth.js                  # Legacy (BACKUP)
│   ├── horarios.js              # Rutas horarios
│   └── clases.js                # Rutas clases
│
├── middleware/           # Middleware personalizado
│   ├── authMiddlewareNew.js     # Auth y autorización (ACTIVO)
│   ├── authMiddleware.js        # Legacy (BACKUP)
│   └── errorHandler.js          # Manejo global de errores
│
├── validators/           # Validaciones con express-validator
│   ├── authValidatorsNew.js     # Validaciones auth (ACTIVAS)
│   ├── authValidators.js        # Legacy (BACKUP)
│   └── horarioValidators.js     # Validaciones horarios
│
├── services/             # Lógica de negocio reutilizable
│   ├── userService.js           # Servicios de usuarios
│   └── horarioService.js        # Servicios de horarios
│
├── shared/               # Código compartido
│   ├── helpers/                 # Funciones auxiliares
│   │   ├── authHelpers.js       # Helpers autenticación
│   │   └── index.js             # Helpers respuestas HTTP
│   └── utils/                   # Utilidades
│       └── constants.js         # Constantes del sistema
│
├── scripts/              # Scripts de mantenimiento
│   ├── migrate-simple.js        # Migración de datos
│   └── final-test.js            # Testing automatizado
│
├── docs/                 # Documentación
│   ├── ARQUITECTURA_BACKEND.md  # Este archivo
│   ├── GUIA_COMPLETA_APIS_POR_ROL.md
│   └── pruebas_autenticacion.md
│
├── .env                  # Variables de entorno
├── .gitignore           # Archivos ignorados por Git
├── package.json         # Dependencias y scripts
└── index.js             # Punto de entrada del servidor
```

---

## Modelos de Datos

### Arquitectura de Modelos Discriminados

El sistema utiliza **discriminadores de Mongoose** para implementar herencia de usuarios, permitiendo una colección única `users` con diferentes tipos de documentos.

#### BaseUser (Modelo Base)

**Archivo:** `models/BaseUser.js`

```javascript
const BaseUserSchema = new Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  role: { type: String, enum: ['estudiante', 'profesor', 'admin'], required: true },
  dni: { type: String, required: true, unique: true },
  phone: String,
  isActive: { type: Boolean, default: true },
  mustChangePassword: { type: Boolean, default: true }
}, { 
  discriminatorKey: '__t',
  timestamps: true 
});
```

**Características:**
- Campo `__t` como discriminador automático
- Validaciones base para todos los usuarios
- Métodos virtuales: `fullName`
- Métodos de instancia: `comparePassword()`, `generateAuthToken()`
- Timestamps automáticos (createdAt, updatedAt)

#### Estudiante (Modelo Discriminado)

**Archivo:** `models/Estudiante.js`

```javascript
const estudianteSchema = new Schema({
  nivel: { 
    type: String, 
    enum: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'],
    required: true 
  },
  estado: { 
    type: String, 
    enum: ['inscrito', 'en_curso', 'graduado', 'suspendido'],
    default: 'inscrito' 
  },
  fechaInscripcion: { type: Date, default: Date.now },
  idiomas: [{ type: Schema.Types.ObjectId, ref: 'Language' }]
});
```

**Características:**
- Hereda todos los campos de BaseUser
- Niveles académicos según MCER
- Estados de progreso académico
- Relación con idiomas estudiados

#### Profesor (Modelo Discriminado)

**Archivo:** `models/Profesor.js`

```javascript
const profesorSchema = new Schema({
  especialidades: [{ type: Schema.Types.ObjectId, ref: 'Language', required: true }],
  tarifaPorHora: { type: Number, required: true },
  disponibilidad: {
    lunes: [{ inicio: String, fin: String }],
    martes: [{ inicio: String, fin: String }],
    // ... otros días
  },
  horariosPermitidos: [{ type: Schema.Types.ObjectId, ref: 'Horario' }]
});
```

**Características:**
- Especialidades en idiomas
- Sistema de tarifas
- Disponibilidad por día de semana
- Relación con horarios asignados
- Métodos: `asignarHorario()`, `verificarConflictos()`, `obtenerHorariosDetallados()`

#### Admin (Modelo Discriminado)

**Archivo:** `models/Admin.js`

```javascript
const adminSchema = new Schema({
  permisos: {
    gestionUsuarios: { type: Boolean, default: true },
    gestionClases: { type: Boolean, default: true },
    gestionPagos: { type: Boolean, default: true },
    reportes: { type: Boolean, default: true }
  }
});
```

**Características:**
- Permisos granulares por módulo
- Control total del sistema
- Sin password inicial con DNI (se configura manualmente)

### Otros Modelos

#### Horario

**Archivo:** `models/Horario.js`

```javascript
const horarioSchema = new Schema({
  dia: { type: String, enum: DIAS_SEMANA, required: true },
  horaInicio: { type: String, required: true },
  horaFin: { type: String, required: true },
  tipo: { type: String, enum: ['clase', 'disponibilidad'], default: 'clase' },
  profesor: { type: Schema.Types.ObjectId, ref: 'Profesor' },
  clase: { type: Schema.Types.ObjectId, ref: 'Clase' }
});
```

#### Clase

**Archivo:** `models/Clase.js`

```javascript
const claseSchema = new Schema({
  profesor: { type: Schema.Types.ObjectId, ref: 'Profesor', required: true },
  estudiantes: [{ type: Schema.Types.ObjectId, ref: 'Estudiante' }],
  idioma: { type: Schema.Types.ObjectId, ref: 'Language', required: true },
  horario: { type: Schema.Types.ObjectId, ref: 'Horario', required: true },
  estado: { type: String, enum: ['programada', 'en_curso', 'completada', 'cancelada'] },
  duracion: { type: Number, required: true }
});
```

#### Language

**Archivo:** `models/Language.js`

```javascript
const languageSchema = new Schema({
  nombre: { type: String, required: true, unique: true },
  codigo: { type: String, required: true, unique: true },
  niveles: [{ type: String, enum: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] }]
});
```

---

## Controladores

Los controladores manejan la lógica de negocio y procesan las requests HTTP.

### authControllerNew.js (Principal)

**Responsabilidades:**
- Autenticación de usuarios (login/logout)
- Registro de usuarios por rol (solo admin)
- Gestión de perfiles
- Cambio de contraseñas
- Listados y consultas de usuarios
- Activación/desactivación de usuarios
- Eliminación de usuarios

**Métodos principales:**

```javascript
// Autenticación
login(req, res)                    // Login universal
logout(req, res)                   // Cerrar sesión
verifyToken(req, res)              // Verificar token JWT

// Registro (solo admin)
registerEstudianteByAdmin(req, res)
registerProfesor(req, res)
registerAdmin(req, res)
createFirstAdmin(req, res)

// Perfiles
getProfile(req, res)               // Ver perfil propio
updateProfile(req, res)            // Actualizar perfil
updateAcademicInfo(req, res)       // Info académica (estudiantes)
updateTeachingInfo(req, res)       // Info profesional (profesores)

// Contraseñas
changePassword(req, res)           // Cambio normal
changePasswordForced(req, res)     // Cambio forzado

// Gestión (admin)
getStudents(req, res)              // Listar estudiantes
getProfessors(req, res)            // Listar profesores
deactivateUser(req, res)           // Desactivar (soft delete)
reactivateUser(req, res)           // Reactivar
deleteUser(req, res)               // Eliminar (hard delete)
```

### horarioController.js

**Responsabilidades:**
- CRUD de horarios
- Asignación a profesores
- Verificación de conflictos
- Consultas por día/rango

**Métodos principales:**

```javascript
crearHorario(req, res)             // Crear nuevo horario
obtenerHorarios(req, res)          // Listar horarios
obtenerHorarioPorId(req, res)      // Detalle de horario
actualizarHorario(req, res)        // Actualizar horario
eliminarHorario(req, res)          // Eliminar horario
asignarHorarioProfesor(req, res)   // Asignar a profesor
verificarDisponibilidad(req, res)  // Verificar conflictos
```

---

## Rutas y Endpoints

### Rutas de Autenticación (authNew.js)

**Base URL:** `/api/auth`

#### Públicas
```javascript
POST   /login                      // Login universal
POST   /create-first-admin         // Crear primer admin
GET    /test                       // Test servidor
GET    /db-test                    // Test base de datos
```

#### Protegidas (requieren token)
```javascript
// Perfil
GET    /profile                    // Ver perfil propio
PUT    /profile                    // Actualizar perfil
GET    /verify-token               // Verificar token

// Contraseñas
PUT    /change-password            // Cambiar contraseña
PUT    /change-password-forced     // Cambio forzado

// Listados
GET    /students                   // Listar estudiantes
GET    /professors                 // Listar profesores
GET    /professors?especialidad=X  // Filtrar por especialidad
```

#### Solo Administradores
```javascript
// Registro
POST   /register/estudiante-admin  // Crear estudiante
POST   /register/profesor          // Crear profesor
POST   /register/admin             // Crear admin

// Gestión
PUT    /deactivate/:id             // Desactivar usuario
PUT    /reactivate/:id             // Reactivar usuario
DELETE /delete/:id                 // Eliminar permanente

// Actualizaciones específicas
PUT    /update-academic-info       // Info académica
PUT    /update-teaching-info       // Info profesional
```

### Rutas de Horarios (horarios.js)

**Base URL:** `/api/horarios`

```javascript
POST   /                           // Crear horario
GET    /                           // Listar horarios
GET    /:id                        // Detalle horario
PUT    /:id                        // Actualizar horario
DELETE /:id                        // Eliminar horario
POST   /asignar-profesor           // Asignar a profesor
GET    /disponibilidad             // Verificar disponibilidad
```

---

## Middleware

### authMiddlewareNew.js

**Funciones principales:**

#### verifyToken
```javascript
// Verifica JWT en header Authorization
// Decodifica y adjunta usuario a req.user
// Maneja tokens expirados o inválidos
```

#### isAdmin
```javascript
// Verifica que req.user.role === 'admin'
// Requiere verifyToken previo
```

#### isProfesor
```javascript
// Verifica que req.user.role === 'profesor'
// Requiere verifyToken previo
```

#### isEstudiante
```javascript
// Verifica que req.user.role === 'estudiante'
// Requiere verifyToken previo
```

#### isAdminOrProfesor
```javascript
// Permite admin O profesor
// Requiere verifyToken previo
```

**Uso en rutas:**
```javascript
router.get('/profile', verifyToken, getProfile);
router.post('/register/admin', verifyToken, isAdmin, registerAdmin);
router.get('/professors', verifyToken, isAdmin, getProfessors);
```

### errorHandler.js

Middleware global para manejo de errores no capturados.

```javascript
function errorHandler(err, req, res, next) {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
}
```

---

## Validadores

Utilizan **express-validator** para validación de datos de entrada.

### authValidatorsNew.js

**Validadores disponibles:**

```javascript
validateRegisterEstudiante        // Validar registro estudiante
validateRegisterProfesor          // Validar registro profesor
validateRegisterAdmin             // Validar registro admin
validateLogin                     // Validar login
validateChangePassword            // Validar cambio contraseña
validateUpdateProfile             // Validar actualización perfil
validateUpdateAcademicInfo        // Validar info académica
validateUpdateTeachingInfo        // Validar info profesional
```

**Ejemplo de validador:**

```javascript
const validateRegisterEstudiante = [
  body('email').isEmail().withMessage('Email inválido'),
  body('firstName').notEmpty().withMessage('Nombre requerido'),
  body('dni').isLength({ min: 7, max: 8 }).withMessage('DNI debe tener 7-8 dígitos'),
  body('nivel').isIn(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']),
  handleValidationErrors
];
```

### horarioValidators.js

```javascript
validateCrearHorario              // Validar creación horario
validateActualizarHorario         // Validar actualización
validateAsignarProfesor           // Validar asignación
```

---

## Servicios

Capa de lógica de negocio reutilizable.

### userService.js

```javascript
// Búsquedas
findUserByEmail(email)
findUserById(id)
findUsersByRole(role)

// Operaciones
createUser(userData)
updateUser(id, updateData)
deleteUser(id)
deactivateUser(id)
reactivateUser(id)

// Validaciones
checkEmailExists(email)
checkDniExists(dni)
```

### horarioService.js

```javascript
// CRUD
crearHorario(horarioData)
obtenerHorarios(filtros)
actualizarHorario(id, updateData)
eliminarHorario(id)

// Lógica de negocio
verificarConflictos(profesorId, dia, horaInicio, horaFin)
asignarAProfesor(horarioId, profesorId)
obtenerHorariosPorProfesor(profesorId)
```

---

## Helpers y Utilidades

### shared/helpers/index.js

**Helpers de respuesta HTTP:**

```javascript
sendSuccess(res, data, message, statusCode = 200)
sendError(res, message, statusCode = 400)
sendValidationError(res, errors)
sendUnauthorized(res, message = 'No autorizado')
sendForbidden(res, message = 'Acceso denegado')
sendNotFound(res, message = 'Recurso no encontrado')
```

**Uso:**
```javascript
return sendSuccess(res, { user }, 'Usuario creado exitosamente', 201);
return sendError(res, 'Email ya existe', 400);
```

### shared/helpers/authHelpers.js

```javascript
generateToken(userId, role)       // Generar JWT
hashPassword(password)             // Hash con bcrypt
comparePassword(plain, hashed)    // Comparar passwords
generateRandomPassword()           // Password aleatorio
```

### shared/utils/constants.js

```javascript
const DIAS_SEMANA = {
  LUNES: 'lunes',
  MARTES: 'martes',
  MIERCOLES: 'miercoles',
  JUEVES: 'jueves',
  VIERNES: 'viernes',
  SABADO: 'sabado',
  DOMINGO: 'domingo'
};

const TIPOS_HORARIO = {
  CLASE: 'clase',
  DISPONIBILIDAD: 'disponibilidad'
};

const NIVELES_IDIOMA = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

const ESTADOS_CLASE = ['programada', 'en_curso', 'completada', 'cancelada'];
```

---

## Autenticación y Autorización

### Flujo de Autenticación

1. **Login:**
   - Usuario envía email + password
   - Sistema valida credenciales
   - Genera JWT con userId y role
   - Retorna token (expira en 24h)

2. **Requests Protegidos:**
   - Cliente envía token en header: `Authorization: Bearer <token>`
   - Middleware `verifyToken` valida y decodifica
   - Adjunta `req.user` con datos del usuario
   - Continúa a siguiente middleware/controlador

3. **Autorización por Rol:**
   - Middleware específico verifica `req.user.role`
   - Permite o deniega acceso según permisos
   - Retorna 403 si no autorizado

### Sistema de Passwords

**Primer Login:**
- Password inicial = DNI del usuario
- Flag `mustChangePassword = true`
- Sistema obliga cambio en primer login

**Cambio de Contraseña:**
- Requiere password actual
- Valida nueva contraseña (mínimo 6 caracteres, mayúscula, minúscula, número)
- Hash con bcrypt (10 rounds)
- Actualiza `mustChangePassword = false`

### Tokens JWT

**Payload:**
```javascript
{
  userId: '507f1f77bcf86cd799439011',
  role: 'admin',
  iat: 1234567890,
  exp: 1234654290
}
```

**Configuración:**
- Secret: Variable de entorno `JWT_SECRET`
- Expiración: 24 horas
- Algoritmo: HS256

---

## Base de Datos

### MongoDB Atlas

**Conexión:**
```javascript
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
```

### Colecciones

#### users
- Colección única con discriminador `__t`
- Tipos: estudiante, profesor, admin
- Índices: email (unique), dni (unique)
- 11 documentos migrados

#### horarios
- Horarios de clases y disponibilidad
- Relación con profesores
- Índices: dia, tipo

#### clases
- Clases programadas
- Relación con profesores, estudiantes, horarios
- Índices: estado, fecha

#### languages
- Idiomas disponibles
- Códigos ISO
- Niveles MCER

### Ventajas del Modelo Discriminado

1. **Queries eficientes:** Una sola colección
2. **Integridad referencial:** Relaciones simples
3. **Herencia clara:** Campos compartidos + específicos
4. **Escalabilidad:** Millones de registros sin problema
5. **Mantenimiento:** Cambios en BaseUser afectan a todos

---

## Flujos de Datos

### Flujo de Registro de Estudiante

```
Cliente → POST /api/auth/register/estudiante-admin
    ↓
authNew.js (router)
    ↓
verifyToken (middleware) → Valida JWT
    ↓
isAdmin (middleware) → Verifica rol admin
    ↓
validateRegisterEstudiante (validator) → Valida datos
    ↓
registerEstudianteByAdmin (controller)
    ↓
userService.checkEmailExists() → Verifica email único
    ↓
new Estudiante({ ...data, password: dni })
    ↓
estudiante.save() → MongoDB
    ↓
sendSuccess(res, { user }, 'Estudiante creado', 201)
    ↓
Cliente ← { success: true, data: { user }, message: '...' }
```

### Flujo de Login

```
Cliente → POST /api/auth/login { email, password }
    ↓
authNew.js (router)
    ↓
validateLogin (validator) → Valida formato
    ↓
login (controller)
    ↓
BaseUser.findOne({ email })
    ↓
user.comparePassword(password) → bcrypt.compare()
    ↓
generateToken(user._id, user.role) → JWT
    ↓
sendSuccess(res, { user, token })
    ↓
Cliente ← { success: true, data: { user, token } }
```

### Flujo de Asignación de Horario

```
Cliente → POST /api/horarios/asignar-profesor { horarioId, profesorId }
    ↓
horarios.js (router)
    ↓
verifyToken (middleware)
    ↓
isAdmin (middleware)
    ↓
validateAsignarProfesor (validator)
    ↓
asignarHorarioProfesor (controller)
    ↓
Profesor.findById(profesorId)
    ↓
profesor.verificarConflictos(horario)
    ↓
profesor.asignarHorario(horarioId)
    ↓
profesor.save()
    ↓
sendSuccess(res, { profesor })
    ↓
Cliente ← { success: true, data: { profesor } }
```

---

## Configuración y Variables de Entorno

### .env

```env
# Base de datos
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/consultora_idiomas

# Autenticación
JWT_SECRET=""
# Servidor
PORT=5000
NODE_ENV=development

# CORS
FRONTEND_URL=http://localhost:3000

# Admin inicial (opcional)
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=SecurePassword123
```

---

## Scripts de Mantenimiento

### migrate-simple.js

Migración de datos del modelo legacy al discriminado.

```bash
node scripts/migrate-simple.js status    # Ver estado
node scripts/migrate-simple.js migrate   # Ejecutar migración
node scripts/migrate-simple.js rollback  # Revertir
```

### final-test.js

Testing automatizado de todos los endpoints.

```bash
node scripts/final-test.js
```

---

## Mejores Prácticas Implementadas

1. **Separación de responsabilidades:** Cada capa tiene un propósito claro
2. **Validación en múltiples niveles:** Schema + Validator + Controller
3. **Respuestas estandarizadas:** Helpers compartidos
4. **Manejo de errores centralizado:** Try-catch + errorHandler
5. **Seguridad:** Helmet, CORS, bcrypt, JWT
6. **Logging:** Morgan para requests HTTP
7. **Variables de entorno:** Configuración sensible en .env
8. **Código reutilizable:** Services y helpers compartidos
9. **Documentación:** Comentarios y archivos MD
10. **Testing:** Scripts automatizados

---

## Próximos Pasos

### Fase 2: Gestión Académica
- [ ] Sistema completo de clases
- [ ] Inscripciones y matrículas
- [ ] Control de asistencia
- [ ] Evaluaciones y calificaciones

### Fase 3: Pagos y Facturación
- [ ] Modelo de Pagos
- [ ] Integración con pasarelas
- [ ] Generación de facturas
- [ ] Reportes financieros

### Fase 4: Optimización
- [ ] Caché con Redis
- [ ] Rate limiting
- [ ] Compresión de respuestas
- [ ] Optimización de queries
- [ ] Testing unitario con Jest
- [ ] CI/CD pipeline

---

**Documentación actualizada:** Enero 2025  
**Versión del sistema:** 1.0.0  
**Estado:** Backend completamente funcional y en producción
