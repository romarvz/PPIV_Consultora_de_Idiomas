# Guía Completa de APIs por Rol

## Índice
1. [Introducción](#introducción)
2. [APIs Públicas](#apis-públicas)
3. [APIs para Administradores](#apis-para-administradores)
4. [APIs para Profesores](#apis-para-profesores)
5. [APIs para Estudiantes](#apis-para-estudiantes)
6. [APIs Compartidas](#apis-compartidas)
7. [Ejemplos de Testing](#ejemplos-de-testing)
8. [Códigos de Error](#códigos-de-error)

---

## Introducción

Esta guía organiza todos los endpoints de la API según el rol de usuario que puede acceder a ellos. Cada endpoint incluye:
- Método HTTP
- URL completa
- Permisos requeridos
- Body de ejemplo
- Respuesta esperada

**Base URL:** `http://localhost:5000/api`

**Autenticación:** La mayoría de endpoints requieren token JWT en el header:
```
Authorization: Bearer <token>
```

---

## APIs Públicas

Endpoints accesibles sin autenticación.

### 1. Login
```http
POST /auth/login
```

**Body:**
```json
{
  "email": "usuario@example.com",
  "password": "Password123"
}
```

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "message": "Login exitoso",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "email": "usuario@example.com",
      "firstName": "Juan",
      "lastName": "Pérez",
      "role": "estudiante",
      "fullName": "Juan Pérez",
      "mustChangePassword": false
    }
  }
}
```

### 2. Crear Primer Admin
```http
POST /auth/create-first-admin
```

**Body:**
```json
{
  "email": "admin@example.com",
  "password": "AdminPass123",
  "firstName": "Admin",
  "lastName": "Principal",
  "dni": "12345678",
  "phone": "+54911234567"
}
```

**Respuesta exitosa (201):**
```json
{
  "success": true,
  "message": "Primer administrador creado exitosamente",
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "email": "admin@example.com",
      "role": "admin",
      "fullName": "Admin Principal"
    }
  }
}
```

### 3. Test de Servidor
```http
GET /auth/test
```

**Respuesta (200):**
```json
{
  "success": true,
  "message": "Servidor funcionando correctamente"
}
```

### 4. Test de Base de Datos
```http
GET /auth/db-test
```

**Respuesta (200):**
```json
{
  "success": true,
  "message": "Conexión a base de datos exitosa"
}
```

---

## APIs para Administradores

Endpoints exclusivos para usuarios con rol `admin`.

### Gestión de Usuarios

#### 1. Registrar Estudiante
```http
POST /auth/register/estudiante-admin
Authorization: Bearer <admin_token>
```

**Body:**
```json
{
  "email": "estudiante@test.com",
  "firstName": "María",
  "lastName": "González",
  "role": "estudiante",
  "dni": "87654321",
  "nivel": "B1",
  "phone": "+54911234567"
}
```

**Respuesta (201):**
```json
{
  "success": true,
  "message": "Estudiante registrado exitosamente. Password inicial: 87654321",
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439012",
      "email": "estudiante@test.com",
      "fullName": "María González",
      "role": "estudiante",
      "nivel": "B1",
      "mustChangePassword": true
    }
  }
}
```

#### 2. Registrar Profesor
```http
POST /auth/register/profesor
Authorization: Bearer <admin_token>
```

**Body:**
```json
{
  "email": "profesor@test.com",
  "firstName": "Carlos",
  "lastName": "Rodríguez",
  "role": "profesor",
  "dni": "11223344",
  "especialidades": ["507f1f77bcf86cd799439013"],
  "tarifaPorHora": 2500,
  "disponibilidad": {
    "lunes": [{ "inicio": "09:00", "fin": "13:00" }],
    "miercoles": [{ "inicio": "14:00", "fin": "18:00" }]
  },
  "phone": "+54911234567"
}
```

**Respuesta (201):**
```json
{
  "success": true,
  "message": "Profesor registrado exitosamente. Password inicial: 11223344",
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439014",
      "email": "profesor@test.com",
      "fullName": "Carlos Rodríguez",
      "role": "profesor",
      "tarifaPorHora": 2500,
      "mustChangePassword": true
    }
  }
}
```

#### 3. Registrar Admin
```http
POST /auth/register/admin
Authorization: Bearer <admin_token>
```

**Body:**
```json
{
  "email": "admin2@test.com",
  "password": "SecurePass123",
  "firstName": "Ana",
  "lastName": "Martínez",
  "role": "admin",
  "dni": "99887766",
  "phone": "+54911234567"
}
```

**Respuesta (201):**
```json
{
  "success": true,
  "message": "Administrador registrado exitosamente",
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439015",
      "email": "admin2@test.com",
      "fullName": "Ana Martínez",
      "role": "admin"
    }
  }
}
```

#### 4. Listar Profesores
```http
GET /auth/professors
GET /auth/professors?especialidad=ingles
Authorization: Bearer <admin_token>
```

**Respuesta (200):**
```json
{
  "success": true,
  "data": {
    "professors": [
      {
        "_id": "507f1f77bcf86cd799439014",
        "fullName": "Carlos Rodríguez",
        "email": "profesor@test.com",
        "tarifaPorHora": 2500,
        "especialidades": ["Inglés", "Francés"],
        "isActive": true
      }
    ],
    "total": 1
  }
}
```

#### 5. Desactivar Usuario
```http
PUT /auth/deactivate/:userId
Authorization: Bearer <admin_token>
```

**Respuesta (200):**
```json
{
  "success": true,
  "message": "Usuario desactivado exitosamente",
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439012",
      "fullName": "María González",
      "isActive": false
    }
  }
}
```

#### 6. Reactivar Usuario
```http
PUT /auth/reactivate/:userId
Authorization: Bearer <admin_token>
```

**Respuesta (200):**
```json
{
  "success": true,
  "message": "Usuario reactivado exitosamente",
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439012",
      "fullName": "María González",
      "isActive": true
    }
  }
}
```

#### 7. Eliminar Usuario Permanentemente
```http
DELETE /auth/delete/:userId
Authorization: Bearer <admin_token>
```

**Respuesta (200):**
```json
{
  "success": true,
  "message": "Usuario eliminado permanentemente"
}
```

### Gestión de Horarios

#### 8. Crear Horario
```http
POST /horarios
Authorization: Bearer <admin_token>
```

**Body:**
```json
{
  "dia": "lunes",
  "horaInicio": "09:00",
  "horaFin": "11:00",
  "tipo": "clase"
}
```

**Respuesta (201):**
```json
{
  "success": true,
  "message": "Horario creado exitosamente",
  "data": {
    "horario": {
      "_id": "507f1f77bcf86cd799439016",
      "dia": "lunes",
      "horaInicio": "09:00",
      "horaFin": "11:00",
      "tipo": "clase"
    }
  }
}
```

#### 9. Asignar Horario a Profesor
```http
POST /horarios/asignar-profesor
Authorization: Bearer <admin_token>
```

**Body:**
```json
{
  "horarioId": "507f1f77bcf86cd799439016",
  "profesorId": "507f1f77bcf86cd799439014"
}
```

**Respuesta (200):**
```json
{
  "success": true,
  "message": "Horario asignado al profesor exitosamente",
  "data": {
    "profesor": {
      "_id": "507f1f77bcf86cd799439014",
      "fullName": "Carlos Rodríguez",
      "horariosPermitidos": ["507f1f77bcf86cd799439016"]
    }
  }
}
```

### Gestión de Cursos

#### 10. Crear Curso
```http
POST /cursos
Authorization: Bearer <admin_token>
```

**Body:**
```json
{
  "nombre": "Inglés Intermedio B1",
  "idioma": "507f1f77bcf86cd799439013",
  "nivel": "B1",
  "duracion": 120,
  "precio": 15000,
  "cupoMaximo": 15
}
```

**Respuesta (201):**
```json
{
  "success": true,
  "message": "Curso creado exitosamente",
  "data": {
    "curso": {
      "_id": "507f1f77bcf86cd799439017",
      "nombre": "Inglés Intermedio B1",
      "nivel": "B1",
      "precio": 15000,
      "cupoMaximo": 15
    }
  }
}
```

### Gestión de Idiomas

#### 11. Crear Idioma
```http
POST /languages
Authorization: Bearer <admin_token>
```

**Body:**
```json
{
  "nombre": "Inglés",
  "codigo": "en",
  "niveles": ["A1", "A2", "B1", "B2", "C1", "C2"]
}
```

**Respuesta (201):**
```json
{
  "success": true,
  "message": "Idioma creado exitosamente",
  "data": {
    "language": {
      "_id": "507f1f77bcf86cd799439013",
      "nombre": "Inglés",
      "codigo": "en",
      "niveles": ["A1", "A2", "B1", "B2", "C1", "C2"]
    }
  }
}
```

### Dashboard y Estadísticas

#### 12. Obtener Estadísticas Generales
```http
GET /dashboard/stats
Authorization: Bearer <admin_token>
```

**Respuesta (200):**
```json
{
  "success": true,
  "data": {
    "totalEstudiantes": 45,
    "totalProfesores": 12,
    "totalCursos": 8,
    "clasesHoy": 15,
    "ingresosDelMes": 125000
  }
}
```

### Sistema Financiero

#### 13. Crear Cobro
```http
POST /cobros
Authorization: Bearer <admin_token>
```

**Body:**
```json
{
  "estudiante": "507f1f77bcf86cd799439012",
  "concepto": "507f1f77bcf86cd799439018",
  "monto": 5000,
  "fechaVencimiento": "2025-02-15",
  "metodoPago": "transferencia"
}
```

**Respuesta (201):**
```json
{
  "success": true,
  "message": "Cobro creado exitosamente",
  "data": {
    "cobro": {
      "_id": "507f1f77bcf86cd799439019",
      "estudiante": "María González",
      "monto": 5000,
      "estado": "pendiente"
    }
  }
}
```

#### 14. Crear Factura
```http
POST /facturas
Authorization: Bearer <admin_token>
```

**Body:**
```json
{
  "cliente": "507f1f77bcf86cd799439012",
  "items": [
    {
      "concepto": "Matrícula",
      "cantidad": 1,
      "precioUnitario": 5000
    }
  ]
}
```

**Respuesta (201):**
```json
{
  "success": true,
  "message": "Factura creada exitosamente",
  "data": {
    "factura": {
      "_id": "507f1f77bcf86cd799439020",
      "numero": "0001-00000001",
      "total": 5000,
      "estado": "emitida"
    }
  }
}
```

---

## APIs para Profesores

Endpoints accesibles para usuarios con rol `profesor`.

### Gestión de Perfil

#### 1. Ver Perfil Propio
```http
GET /auth/profile
Authorization: Bearer <profesor_token>
```

**Respuesta (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439014",
      "email": "profesor@test.com",
      "fullName": "Carlos Rodríguez",
      "role": "profesor",
      "tarifaPorHora": 2500,
      "especialidades": ["Inglés", "Francés"],
      "disponibilidad": {
        "lunes": [{ "inicio": "09:00", "fin": "13:00" }]
      }
    }
  }
}
```

#### 2. Actualizar Información Profesional
```http
PUT /auth/update-teaching-info
Authorization: Bearer <profesor_token>
```

**Body:**
```json
{
  "tarifaPorHora": 2800,
  "disponibilidad": {
    "lunes": [{ "inicio": "08:00", "fin": "12:00" }],
    "martes": [{ "inicio": "14:00", "fin": "18:00" }]
  }
}
```

**Respuesta (200):**
```json
{
  "success": true,
  "message": "Información profesional actualizada exitosamente",
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439014",
      "tarifaPorHora": 2800,
      "disponibilidad": {
        "lunes": [{ "inicio": "08:00", "fin": "12:00" }],
        "martes": [{ "inicio": "14:00", "fin": "18:00" }]
      }
    }
  }
}
```

### Gestión de Horarios

#### 3. Ver Mis Horarios
```http
GET /horarios/profesor/:profesorId
Authorization: Bearer <profesor_token>
```

**Respuesta (200):**
```json
{
  "success": true,
  "data": {
    "horarios": [
      {
        "_id": "507f1f77bcf86cd799439016",
        "dia": "lunes",
        "horaInicio": "09:00",
        "horaFin": "11:00",
        "tipo": "clase"
      }
    ]
  }
}
```

#### 4. Verificar Disponibilidad
```http
GET /horarios/disponibilidad?dia=lunes&horaInicio=09:00&horaFin=11:00
Authorization: Bearer <profesor_token>
```

**Respuesta (200):**
```json
{
  "success": true,
  "data": {
    "disponible": false,
    "conflictos": [
      {
        "dia": "lunes",
        "horaInicio": "09:00",
        "horaFin": "11:00"
      }
    ]
  }
}
```

---

## APIs para Estudiantes

Endpoints accesibles para usuarios con rol `estudiante`.

### Gestión de Perfil

#### 1. Ver Perfil Propio
```http
GET /auth/profile
Authorization: Bearer <estudiante_token>
```

**Respuesta (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439012",
      "email": "estudiante@test.com",
      "fullName": "María González",
      "role": "estudiante",
      "nivel": "B1",
      "estado": "en_curso",
      "fechaInscripcion": "2025-01-15T00:00:00.000Z"
    }
  }
}
```

#### 2. Actualizar Información Académica
```http
PUT /auth/update-academic-info
Authorization: Bearer <estudiante_token>
```

**Body:**
```json
{
  "nivel": "B2",
  "estado": "en_curso"
}
```

**Respuesta (200):**
```json
{
  "success": true,
  "message": "Información académica actualizada exitosamente",
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439012",
      "nivel": "B2",
      "estado": "en_curso"
    }
  }
}
```

### Consultas

#### 3. Ver Cursos Disponibles
```http
GET /cursos
Authorization: Bearer <estudiante_token>
```

**Respuesta (200):**
```json
{
  "success": true,
  "data": {
    "cursos": [
      {
        "_id": "507f1f77bcf86cd799439017",
        "nombre": "Inglés Intermedio B1",
        "nivel": "B1",
        "precio": 15000,
        "cupoMaximo": 15,
        "inscriptos": 8
      }
    ]
  }
}
```

#### 4. Ver Mis Cobros
```http
GET /cobros?estudiante=507f1f77bcf86cd799439012
Authorization: Bearer <estudiante_token>
```

**Respuesta (200):**
```json
{
  "success": true,
  "data": {
    "cobros": [
      {
        "_id": "507f1f77bcf86cd799439019",
        "concepto": "Matrícula",
        "monto": 5000,
        "estado": "pendiente",
        "fechaVencimiento": "2025-02-15"
      }
    ]
  }
}
```

---

## APIs Compartidas

Endpoints accesibles para todos los usuarios autenticados.

### 1. Cambiar Contraseña
```http
PUT /auth/change-password
Authorization: Bearer <token>
```

**Body:**
```json
{
  "currentPassword": "Password123",
  "newPassword": "NewPassword456"
}
```

**Respuesta (200):**
```json
{
  "success": true,
  "message": "Contraseña actualizada exitosamente"
}
```

### 2. Actualizar Perfil General
```http
PUT /auth/profile
Authorization: Bearer <token>
```

**Body:**
```json
{
  "firstName": "Juan Carlos",
  "phone": "+54911999888"
}
```

**Respuesta (200):**
```json
{
  "success": true,
  "message": "Perfil actualizado exitosamente",
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439012",
      "fullName": "Juan Carlos González",
      "phone": "+54911999888"
    }
  }
}
```

### 3. Logout
```http
POST /auth/logout
Authorization: Bearer <token>
```

**Respuesta (200):**
```json
{
  "success": true,
  "message": "Sesión cerrada exitosamente"
}
```

### 4. Verificar Token
```http
GET /auth/verify-token
Authorization: Bearer <token>
```

**Respuesta (200):**
```json
{
  "success": true,
  "data": {
    "valid": true,
    "user": {
      "_id": "507f1f77bcf86cd799439012",
      "role": "estudiante"
    }
  }
}
```

### 5. Listar Estudiantes
```http
GET /auth/students
Authorization: Bearer <token>
```

**Respuesta (200):**
```json
{
  "success": true,
  "data": {
    "students": [
      {
        "_id": "507f1f77bcf86cd799439012",
        "fullName": "María González",
        "email": "estudiante@test.com",
        "nivel": "B1",
        "estado": "en_curso"
      }
    ],
    "total": 1
  }
}
```

### 6. Listar Idiomas
```http
GET /languages
Authorization: Bearer <token>
```

**Respuesta (200):**
```json
{
  "success": true,
  "data": {
    "languages": [
      {
        "_id": "507f1f77bcf86cd799439013",
        "nombre": "Inglés",
        "codigo": "en",
        "niveles": ["A1", "A2", "B1", "B2", "C1", "C2"]
      }
    ]
  }
}
```

---

## Ejemplos de Testing

### Flujo Completo con Thunder Client

#### 1. Login como Admin
```
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "AdminPass123"
}
```

**Guardar el token de la respuesta**

#### 2. Crear Estudiante
```
POST http://localhost:5000/api/auth/register/estudiante-admin
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "email": "nuevo@estudiante.com",
  "firstName": "Pedro",
  "lastName": "López",
  "role": "estudiante",
  "dni": "55667788",
  "nivel": "A2",
  "phone": "+54911555666"
}
```

#### 3. Login como Estudiante (primer login)
```
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "nuevo@estudiante.com",
  "password": "55667788"
}
```

**Nota:** `mustChangePassword` será `true`

#### 4. Cambiar Contraseña Obligatoria
```
PUT http://localhost:5000/api/auth/change-password
Authorization: Bearer <estudiante_token>
Content-Type: application/json

{
  "currentPassword": "55667788",
  "newPassword": "MiPassword123"
}
```

#### 5. Ver Perfil
```
GET http://localhost:5000/api/auth/profile
Authorization: Bearer <estudiante_token>
```

---

## Códigos de Error

### Errores de Autenticación
- **401 Unauthorized:** Token inválido o expirado
- **403 Forbidden:** Sin permisos para acceder al recurso

### Errores de Validación
- **400 Bad Request:** Datos inválidos o faltantes
- **409 Conflict:** Email o DNI duplicado

### Errores del Servidor
- **500 Internal Server Error:** Error interno del servidor

### Ejemplos de Respuestas de Error

**401 - Token Inválido:**
```json
{
  "success": false,
  "message": "Token inválido o expirado"
}
```

**400 - Validación:**
```json
{
  "success": false,
  "message": "Errores de validación",
  "errors": [
    {
      "field": "email",
      "message": "Email inválido"
    },
    {
      "field": "dni",
      "message": "DNI debe tener 7-8 dígitos"
    }
  ]
}
```

**409 - Conflicto:**
```json
{
  "success": false,
  "message": "El email ya está registrado"
}
```

---

**Documentación actualizada:** Enero 2025  
**Versión:** 1.0.0  
**Estado:** Guía completa de APIs por rol de usuario
