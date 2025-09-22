# GUÍA COMPLETA DE APIs - SISTEMA DE CONSULTORÍA DE IDIOMAS

## **ARQUITECTURA CON MODELOS DISCRIMINADOS**

Esta guía detalla todos los endpoints del sistema después de la migración a **modelos separados usando discriminadores de Mongoose**. Ahora tenemos `BaseUser`, `Estudiante`, `Profesor` y `Admin` como modelos independientes pero en una sola colección.

### **VENTAJAS DE LA NUEVA ARQUITECTURA:**
- **Modelos académicamente correctos** (separados por rol)
- **Validaciones específicas** por tipo de usuario
- **Mejor organización** del código
- **Compatibilidad total** con APIs existentes
- **Sin pérdida de datos** (migración automática completada)

---

## **CONFIGURACIÓN INICIAL**

### **1. Iniciar el Servidor**
```bash
cd server
npm run dev
# o alternativamente:
node index.js
```

**URL Base:** `http://localhost:5000`
**Headers básicos:** `Content-Type: application/json`

### **2. MIGRACIÓN COMPLETADA**
- **11 usuarios migrados** exitosamente
- **Campo discriminador `__t`** añadido automáticamente
- **Backup automático** creado por seguridad
- **Modelos separados** funcionando correctamente

### **3. Crear Primer Administrador (Solo si no existe)**
**Endpoint:** `POST http://localhost:5000/api/auth/create-first-admin`
**Body:**
```json
{
  "email": "admin@consultora.com",
  "password": "Admin123!",
  "firstName": "Super",
  "lastName": "Admin",
  "dni": "99999999"
}
```
**Respuesta:**
- Si ya existe un admin, retorna error.

**Credenciales del Admin Existente:**
- Email: `admin@consultora.com`
- Password: `Admin123!`

---

## **REGISTRO CON NUEVOS MODELOS DISCRIMINADOS**

### **IMPORTANTE: Solo Admins pueden registrar usuarios**
- **Estudiantes y profesores**: Password inicial = DNI (deben cambiar en primer login)
- **Admins**: Definen su propia contraseña
- **Modelos separados**: Cada rol tiene sus campos específicos
- **Validaciones específicas**: Por tipo de usuario

### **REGISTRO DE ESTUDIANTE (Solo Admin)**

**Endpoint:** `POST http://localhost:5000/api/auth/register/estudiante-admin`
**Headers:** 
```
Content-Type: application/json
Authorization: Bearer [TOKEN_DE_ADMIN]
```
**Permisos:** Solo administradores pueden registrar estudiantes

#### **Campos obligatorios:**
- `email` - Email válido y único
- `firstName` - Nombre (2-50 caracteres, solo letras)
- `lastName` - Apellido (2-50 caracteres, solo letras)
- `nivel` - **OBLIGATORIO** (A1, A2, B1, B2, C1, C2)
- `dni` - **OBLIGATORIO** (7-8 dígitos, único) - **Será la password inicial**
- `role` - Debe ser "estudiante"

#### **Campos opcionales:**
- `phone` - Teléfono (formato flexible)
- `estadoAcademico` - Por defecto "inscrito" (inscrito, en_curso, graduado, suspendido)

#### **Ejemplo:**
```json
{
  "email": "estudiante.nuevo@test.com",
  "firstName": "María",
  "lastName": "González",
  "role": "estudiante",
  "dni": "12345678",
  "nivel": "B1",
  "estadoAcademico": "inscrito",
  "phone": "+54911234567"
}
```

#### **Respuesta exitosa:**
```json
{
  "success": true,
  "message": "Usuario registrado exitosamente",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "_id": "...",
      "email": "estudiante.nuevo@test.com",
      "firstName": "María",
      "lastName": "González",
      "role": "estudiante",
      "nivel": "B1",
      "estadoAcademico": "inscrito",
      "dni": "12345678",
      "mustChangePassword": true,
      "__t": "estudiante"
    },
    "temporaryPassword": "12345678"
  }
}
```

---

### **REGISTRO DE PROFESOR (Solo Admin)**

**Endpoint:** `POST http://localhost:5000/api/auth/register/profesor`
**Headers:**
```
Content-Type: application/json
Authorization: Bearer [TOKEN_DE_ADMIN]
```
**Permisos:** Solo administradores pueden registrar profesores

#### **Campos obligatorios:**
- `email` - Email válido y único
- `firstName` - Nombre (2-50 caracteres, solo letras)
- `lastName` - Apellido (2-50 caracteres, solo letras)
- `role` - Debe ser "profesor"
- `especialidades` - **OBLIGATORIO** Array con al menos 1 especialidad
- `tarifaPorHora` - **OBLIGATORIO** Número ≥ 0
- `dni` - **OBLIGATORIO** (7-8 dígitos, único) - **Será la password inicial**

#### **Campos opcionales:**
- `phone` - Teléfono (formato flexible)
- `disponibilidad` - Horarios por día de la semana

#### **Especialidades válidas:**
`ingles`, `frances`, `aleman`, `italiano`, `portugues`, `espanol`

#### **Ejemplo:**
```json
{
  "email": "profesor.nuevo@test.com",
  "firstName": "Carlos",
  "lastName": "Rodríguez",
  "role": "profesor",
  "dni": "87654321",
  "especialidades": ["ingles", "frances"],
  "tarifaPorHora": 2500,
  "phone": "+54911234568",
  "disponibilidad": {
    "lunes": [{"inicio": "09:00", "fin": "12:00"}],
    "miercoles": [{"inicio": "14:00", "fin": "17:00"}],
    "viernes": [{"inicio": "16:00", "fin": "19:00"}]
  }
}
```

#### **Respuesta exitosa:**
```json
{
  "success": true,
  "message": "Usuario registrado exitosamente",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "_id": "...",
      "email": "profesor.nuevo@test.com",
      "firstName": "Carlos",
      "lastName": "Rodríguez",
      "role": "profesor",
      "especialidades": ["ingles", "frances"],
      "tarifaPorHora": 2500,
      "disponibilidad": { ... },
      "dni": "87654321",
      "mustChangePassword": true,
      "__t": "profesor"
    },
    "temporaryPassword": "87654321"
  }
}
```

---

### **REGISTRO DE ADMIN (Solo Admin)**

**Endpoint:** `POST http://localhost:5000/api/auth/register/admin`
**Headers:**
```
Content-Type: application/json
Authorization: Bearer [TOKEN_DE_ADMIN]
```
**Permisos:** Solo administradores pueden crear otros administradores

#### **Campos obligatorios:**
- `email` - Email válido y único
- `password` - Mínimo 6 caracteres (1 mayúscula, 1 minúscula, 1 número)
- `firstName` - Nombre (2-50 caracteres, solo letras)
- `lastName` - Apellido (2-50 caracteres, solo letras)
- `role` - Debe ser "admin"

#### **Campos opcionales:**
- `phone` - Teléfono (formato flexible)
- `dni` - DNI (7-8 dígitos, único) - Opcional para admins
- `permisos` - Array de permisos (default: ["todos"])

#### **Ejemplo:**
```json
{
  "email": "admin2@consultora.com",
  "password": "Admin123456",
  "firstName": "Ana",
  "lastName": "López",
  "role": "admin",
  "phone": "+54911234569",
  "dni": "88888888",
  "permisos": ["gestion_usuarios", "reportes"]
}
```

---

## **LOGIN (Acceso Universal)**

**Endpoint:** `POST http://localhost:5000/api/auth/login`
**Headers:** `Content-Type: application/json`
**Permisos:** Todos los roles pueden hacer login

### **Campos obligatorios:**
- `email` - Email registrado en el sistema
- `password` - Contraseña del usuario

### **PRIMER LOGIN CON DNI (Estudiantes y Profesores):**
- **Password temporal:** El DNI del usuario
- **Cambio obligatorio:** El sistema detecta `mustChangePassword: true`

### **Ejemplo de primer login:**
```json
{
  "email": "estudiante.nuevo@test.com",
  "password": "12345678"
}
```

### **Respuesta primer login (cambio de contraseña requerido):**
```json
{
  "success": true,
  "message": "Login exitoso. Debe cambiar su contraseña.",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "_id": "...",
      "email": "estudiante.nuevo@test.com",
      "firstName": "María",
      "lastName": "González",
      "role": "estudiante",
      "nivel": "B1",
      "mustChangePassword": true,
      "__t": "estudiante"
    },
    "mustChangePassword": true
  }
}
```

### **Login normal (password ya cambiada):**
```json
{
  "email": "admin@consultora.com",
  "password": "Admin123!"
}
```

### **Respuesta login normal:**
```json
{
  "success": true,
  "message": "Login exitoso",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "_id": "...",
      "email": "admin@consultora.com",
      "firstName": "Admin",
      "lastName": "Principal",
      "role": "admin",
      "permisos": ["todos"],
      "mustChangePassword": false,
      "__t": "admin"
    }
  }
}
```

**IMPORTANTE:** Guarda el `token` para usarlo en requests que requieren autenticación.

---

## **CAMBIO DE CONTRASEÑA**

**Endpoint:** `PUT http://localhost:5000/api/auth/change-password`
**Headers:**
```
Content-Type: application/json
Authorization: Bearer [TOKEN_DEL_USUARIO]
```
**Permisos:** Usuarios autenticados

### **Campos obligatorios:**
- `currentPassword` - Contraseña actual (o DNI en primer cambio)
- `newPassword` - Nueva contraseña (mínimo 6 caracteres, 1 mayúscula, 1 minúscula, 1 número)
- `confirmNewPassword` - Confirmación de nueva contraseña

### **Ejemplo:**
```json
{
  "currentPassword": "12345678",
  "newPassword": "MiNuevaPass123!",
  "confirmNewPassword": "MiNuevaPass123!"
}
```

### **Respuesta exitosa:**
```json
{
  "success": true,
  "message": "Contraseña actualizada exitosamente",
  "data": {
    "user": {
      "_id": "...",
      "email": "estudiante.nuevo@test.com",
      "firstName": "María",
      "lastName": "González",
      "role": "estudiante",
      "mustChangePassword": false,
      "__t": "estudiante"
    }
  }
}
```

---

##  **GESTIÓN DE INFORMACIÓN POR ROL**

### **CONSULTAR USUARIOS (Solo Admin)**

**Endpoint:** `GET http://localhost:5000/api/auth/users`
**Headers:**
```
Authorization: Bearer [TOKEN_DE_ADMIN]
```
**Permisos:** Solo administradores

### **Parámetros opcionales de consulta:**
- `role` - Filtrar por rol (estudiante, profesor, admin)
- `page` - Número de página (default: 1)
- `limit` - Elementos por página (default: 10)

### **Ejemplos de URLs:**
```
GET http://localhost:5000/api/auth/users
GET http://localhost:5000/api/auth/users?role=estudiante
GET http://localhost:5000/api/auth/users?role=profesor&page=1&limit=5
```

### **Respuesta exitosa:**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "_id": "...",
        "email": "estudiante.nuevo@test.com",
        "firstName": "María",
        "lastName": "González",
        "role": "estudiante",
        "nivel": "B1",
        "estadoAcademico": "inscrito",
        "dni": "12345678",
        "mustChangePassword": false,
        "__t": "estudiante",
        "createdAt": "2024-12-28T..."
      },
      {
        "_id": "...",
        "email": "profesor.nuevo@test.com",
        "firstName": "Carlos",
        "lastName": "Rodríguez",
        "role": "profesor",
        "especialidades": ["ingles", "frances"],
        "tarifaPorHora": 2500,
        "dni": "87654321",
        "__t": "profesor",
        "createdAt": "2024-12-28T..."
      }
    ],
    "pagination": {
      "current": 1,
      "pages": 2,
      "total": 11
    }
  }
}
```

---

### **VER PERFIL PROPIO**

**Endpoint:** `GET http://localhost:5000/api/auth/profile`
**Headers:**
```
Authorization: Bearer [TOKEN_DEL_USUARIO]
```
**Permisos:** Todos los usuarios autenticados

### **Respuesta estudiante:**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "...",
      "email": "estudiante.nuevo@test.com",
      "firstName": "María",
      "lastName": "González",
      "role": "estudiante",
      "nivel": "B1",
      "estadoAcademico": "inscrito",
      "dni": "12345678",
      "phone": "+54911234567",
      "mustChangePassword": false,
      "__t": "estudiante"
    }
  }
}
```

### **Respuesta profesor:**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "...",
      "email": "profesor.nuevo@test.com",
      "firstName": "Carlos",
      "lastName": "Rodríguez",
      "role": "profesor",
      "especialidades": ["ingles", "frances"],
      "tarifaPorHora": 2500,
      "disponibilidad": { ... },
      "dni": "87654321",
      "__t": "profesor"
    }
  }
}
---

## **ACTUALIZACIÓN DE INFORMACIÓN POR ROL**

### **Actualizar Información Académica (Solo Estudiantes)**

**Endpoint:** `PUT http://localhost:5000/api/auth/update-academic-info`
**Headers:**
```
Content-Type: application/json
Authorization: Bearer [TOKEN_DE_ESTUDIANTE]
```
**Permisos:** Solo el estudiante propietario de la cuenta

#### **Campos actualizables:**
- `nivel` - Cambiar nivel académico (A1, A2, B1, B2, C1, C2)
- `estadoAcademico` - Cambiar estado (inscrito, en_curso, graduado, suspendido)

#### **Ejemplo - Cambiar a en curso:**
```json
{
  "estadoAcademico": "en_curso"
}
```

#### **Ejemplo - Subir de nivel:**
```json
{
  "nivel": "B2",
  "estadoAcademico": "en_curso"
}
```

#### **Respuesta exitosa:**
```json
{
  "success": true,
  "message": "Información académica actualizada exitosamente",
  "data": {
    "user": {
      "_id": "...",
      "email": "estudiante.nuevo@test.com",
      "firstName": "María",
      "lastName": "González",
      "role": "estudiante",
      "nivel": "B2",
      "estadoAcademico": "en_curso",
      "__t": "estudiante"
    }
  }
}
```

---

### **Actualizar Información Profesional (Solo Profesores)**

**Endpoint:** `PUT http://localhost:5000/api/auth/update-professional-info`
**Headers:**
```
Content-Type: application/json
Authorization: Bearer [TOKEN_DE_PROFESOR]
```
**Permisos:** Solo el profesor propietario de la cuenta

#### **Campos actualizables:**
- `especialidades` - Array de especialidades
- `tarifaPorHora` - Tarifa por hora (número ≥ 0)
- `disponibilidad` - Horarios por día

#### **Ejemplo - Actualizar tarifa:**
```json
{
  "tarifaPorHora": 3000
}
```

#### **Ejemplo - Agregar especialidad:**
```json
{
  "especialidades": ["ingles", "frances", "aleman"]
}
```

#### **Ejemplo - Actualizar disponibilidad:**
```json
{
  "disponibilidad": {
    "lunes": [{"inicio": "09:00", "fin": "12:00"}],
    "miercoles": [{"inicio": "14:00", "fin": "17:00"}],
    "viernes": [{"inicio": "16:00", "fin": "19:00"}],
    "sabado": [{"inicio": "10:00", "fin": "13:00"}]
  }
}
```

#### **Respuesta exitosa:**
```json
{
  "success": true,
  "message": "Información profesional actualizada exitosamente",
  "data": {
    "user": {
      "_id": "...",
      "email": "profesor.nuevo@test.com",
      "firstName": "Carlos",
      "lastName": "Rodríguez",
      "role": "profesor",
      "especialidades": ["ingles", "frances", "aleman"],
      "tarifaPorHora": 3000,
      "disponibilidad": { ... },
      "__t": "profesor"
    }
  }
}
```
  "data": {
    "user": {
      "email": "sabrinaavalos@gmail.com",
      "firstName": "Sabrina",
      "nivel": "B2",
      "estadoAcademico": "en_curso"
    }
  }
}
```

---

## **ERRORES COMUNES Y SOLUCIONES**

### **Errores de Autenticación**

#### **Error: "Token no proporcionado"**
```json
{
  "success": false,
  "message": "Token no proporcionado"
}
```
**Solución:** Agregar header `Authorization: Bearer [TOKEN]`

#### **Error: "Token inválido o expirado"**
```json
{
  "success": false,
  "message": "Token inválido o expirado"
}
```
**Solución:** Hacer login nuevamente para obtener token válido

#### **Error: "Acceso denegado. Se requieren permisos de administrador"**
```json
{
  "success": false,
  "message": "Acceso denegado. Se requieren permisos de administrador"
}
```
**Solución:** Usar token de usuario admin

---

### **Errores de Validación**

#### **Error: "El email ya está registrado"**
```json
{
  "success": false,
  "message": "El email ya está registrado",
  "errors": [
    {
      "field": "email",
      "message": "El email ya está registrado"
    }
  ]
}
```

#### **Error: "Credenciales inválidas"**
```json
{
  "success": false,
  "message": "Credenciales inválidas"
}
```
**Causas:** Email no existe o contraseña incorrecta

#### **Error: "Debe cambiar su contraseña"**
```json
{
  "success": true,
  "message": "Login exitoso. Debe cambiar su contraseña.",
  "data": {
    "token": "...",
    "user": { ... },
    "mustChangePassword": true
  }
}
```
**Acción:** Usar endpoint de cambio de contraseña

---

### **Errores de Datos**

#### **Error: "Faltan campos obligatorios"**
```json
{
  "success": false,
  "message": "Error de validación",
  "errors": [
    {
      "field": "nivel",
      "message": "El nivel es obligatorio para estudiantes"
    },
    {
      "field": "especialidades",
      "message": "Las especialidades son obligatorias para profesores"
    }
  ]
}
```

#### **Error: "DNI ya está registrado"**
```json
{
  "success": false,
  "message": "Error de validación",
  "errors": [
    {
      "field": "dni",
      "message": "DNI ya está registrado"
    }
  ]
}
```
  }
}
```

---

### ** Actualizar Perfil General (Cualquier Usuario)**

**Endpoint:** `PUT http://localhost:5000/api/auth/profile`
**Headers:**
---

## **TESTING CON THUNDER CLIENT**

### **CONFIGURACIÓN INICIAL**

#### **1. Headers Base:**
Para todos los requests autenticados:
```
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### **2. Credenciales de Admin (migradas):**
```json
{
  "email": "admin@consultora.com",
  "password": "Admin123!"
}
```

#### **3. URL Base:**
```
http://localhost:5000/api/auth
```

---

### **SECUENCIA DE PRUEBAS RECOMENDADA**

#### **PASO 1: Login como Admin**
```
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "admin@consultora.com",
  "password": "Admin123!"
}
```
**Copiar el TOKEN de la respuesta para siguientes requests**

#### **PASO 2: Registrar Estudiante (Como Admin)**
```
POST http://localhost:5000/api/auth/register/estudiante-admin
Content-Type: application/json
Authorization: Bearer [TOKEN_ADMIN]

{
  "email": "test.estudiante@example.com",
  "firstName": "Test",
  "lastName": "Estudiante",
  "role": "estudiante",
  "dni": "99888777",
  "nivel": "B1",
  "estadoAcademico": "inscrito",
  "phone": "+54911999888"
}
```

#### **PASO 3: Registrar Profesor (Como Admin)**
```
POST http://localhost:5000/api/auth/register/profesor
Content-Type: application/json
Authorization: Bearer [TOKEN_ADMIN]

{
  "email": "test.profesor@example.com",
  "firstName": "Test",
  "lastName": "Profesor",
  "role": "profesor",
  "dni": "77766655",
  "especialidades": ["ingles", "frances"],
  "tarifaPorHora": 2800,
  "phone": "+54911777666"
}
```

#### **PASO 4: Login con DNI (Primer Login)**
```
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "test.estudiante@example.com",
  "password": "99888777"
}
```
**Respuesta incluirá `mustChangePassword: true`**

#### **PASO 5: Cambiar Contraseña**
```
PUT http://localhost:5000/api/auth/change-password
Content-Type: application/json
Authorization: Bearer [TOKEN_ESTUDIANTE]

{
  "currentPassword": "99888777",
  "newPassword": "NuevaPass123!",
  "confirmNewPassword": "NuevaPass123!"
}
```

#### **PASO 6: Login Normal**
```
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "test.estudiante@example.com",
  "password": "NuevaPass123!"
}
```

#### **PASO 7: Ver Usuarios (Como Admin)**
```
GET http://localhost:5000/api/auth/users
Authorization: Bearer [TOKEN_ADMIN]
```

#### **PASO 8: Ver Perfil Propio**
```
GET http://localhost:5000/api/auth/profile
Authorization: Bearer [TOKEN_ESTUDIANTE]
```

#### **PASO 9: Actualizar Info Académica (Estudiante)**
```
PUT http://localhost:5000/api/auth/update-academic-info
Content-Type: application/json
Authorization: Bearer [TOKEN_ESTUDIANTE]

{
  "nivel": "B2",
  "estadoAcademico": "en_curso"
}
```

#### **PASO 10: Actualizar Info Profesional (Profesor)**
```
PUT http://localhost:5000/api/auth/update-professional-info
Content-Type: application/json
Authorization: Bearer [TOKEN_PROFESOR]

{
  "especialidades": ["ingles", "frances", "aleman"],
  "tarifaPorHora": 3200,
  "disponibilidad": {
    "lunes": [{"inicio": "09:00", "fin": "12:00"}],
    "miercoles": [{"inicio": "14:00", "fin": "17:00"}]
  }
}
```

---

### **VALIDACIONES IMPORTANTES**

#### **Verificar Modelos Discriminados:**
Todas las respuestas deben incluir el campo `__t`:
- `"__t": "estudiante"` para estudiantes
- `"__t": "profesor"` para profesores  
- `"__t": "admin"` para administradores

#### **Verificar Autenticación:**
- Solo admin puede registrar usuarios
- Solo admin puede ver lista de usuarios
- Usuarios solo pueden ver/editar su propio perfil

#### **Verificar Validaciones:**
- Campos obligatorios por rol
- Formatos de email, DNI, especialidades
- Validaciones de contraseña

---

### **ENDPOINTS ACTUALIZADOS DISPONIBLES**

| Método | Endpoint | Descripción | Auth Requerida |
|--------|----------|-------------|----------------|
| POST | `/login` | Login universal | No |
| PUT | `/change-password` | Cambiar contraseña | Sí |
| POST | `/register/estudiante-admin` | Registrar estudiante | Admin |
| POST | `/register/profesor` | Registrar profesor | Admin |
| POST | `/register/admin` | Registrar admin | Admin |
| GET | `/users` | Lista usuarios | Admin |
| GET | `/profile` | Ver perfil propio | Sí |
| PUT | `/update-academic-info` | Info académica | Estudiante |
| PUT | `/update-professional-info` | Info profesional | Profesor |

**IMPORTANTE:** Todos los endpoints funcionan con la nueva arquitectura de modelos discriminados. Los usuarios migrados conservan sus IDs y datos originales.
        "createdAt": "2025-09-15T12:30:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 1,
      "pages": 1
    }
  }
}
```

---

### ** OBTENER PROFESORES (Solo Admin)**

**Endpoint:** `GET http://localhost:5000/api/auth/professors`
**Headers:**
```
Authorization: Bearer [TOKEN_DE_ADMIN]
```
**Permisos:** Solo administradores

#### **Query Parameters (todos opcionales):**
- `especialidad` - Filtrar por especialidad (ingles, frances, aleman, etc.)
- `page` - Número de página (default: 1)
- `limit` - Elementos por página (default: 10)

#### **Ejemplos de URLs:**
- `http://localhost:5000/api/auth/professors` (todos los profesores)
- `http://localhost:5000/api/auth/professors?especialidad=ingles` (solo inglés)
- `http://localhost:5000/api/auth/professors?especialidad=frances&page=1&limit=5`

#### **Respuesta esperada:**
```json
{
  "success": true,
  "data": {
    "professors": [
      {
        "_id": "...",
        "email": "profesor@test.com",
        "firstName": "Carlos",
        "lastName": "Rodríguez",
        "role": "profesor",
        "especialidades": ["ingles", "frances"],
        "tarifaPorHora": 2500,
        "disponibilidad": {
          "lunes": [{"inicio": "09:00", "fin": "12:00"}],
          "miercoles": [{"inicio": "14:00", "fin": "17:00"}]
        },
        "phone": "+54911234568",
        "isActive": true,
        "createdAt": "2025-09-15T12:45:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 1,
      "pages": 1
    }
  }
}
```

---

##  **OTROS ENDPOINTS IMPORTANTES**

### **👤 Ver Perfil Propio**
**Endpoint:** `GET http://localhost:5000/api/auth/profile`
**Headers:** `Authorization: Bearer [TOKEN]`
**Permisos:** Usuario autenticado

### ** Cambiar Contraseña**
**Endpoint:** `PUT http://localhost:5000/api/auth/change-password`
**Headers:**
```
Content-Type: application/json
Authorization: Bearer [TOKEN]
```
**Body:**
```json
{
  "currentPassword": "Test123456",
  "newPassword": "NuevoPassword123",
  "confirmPassword": "NuevoPassword123"
}
```

### **🚪 Logout**
**Endpoint:** `POST http://localhost:5000/api/auth/logout`
**Headers:** `Authorization: Bearer [TOKEN]`

### **✅ Verificar Token**
**Endpoint:** `GET http://localhost:5000/api/auth/verify-token`
**Headers:** `Authorization: Bearer [TOKEN]`

---

## 🧪 **FLUJOS DE PRUEBA COMPLETOS**

### **FLUJO 1: Registro y Gestión de Estudiante**
1. ✅ **Registrar estudiante** (POST /register) → Obtener token
2. ✅ **Ver perfil** (GET /profile) → Verificar datos
3. ✅ **Actualizar estado académico** (PUT /update-academic-info)
4. ✅ **Cambiar contraseña** (PUT /change-password)
5. ✅ **Logout** (POST /logout)

### **FLUJO 2: Admin gestiona profesores**
1. ✅ **Login como admin** (POST /login) → Obtener token
2. ✅ **Registrar profesor** (POST /register con token admin)
3. ✅ **Ver lista de profesores** (GET /professors)
4. ✅ **Filtrar profesores por especialidad** (GET /professors?especialidad=ingles)

### **FLUJO 3: Profesor actualiza información**
1. ✅ **Login como profesor** (POST /login) → Obtener token
2. ✅ **Ver perfil** (GET /profile)
3. ✅ **Actualizar especialidades y tarifa** (PUT /update-teaching-info)
4. ✅ **Actualizar disponibilidad** (PUT /update-teaching-info)

---

## 🔍 **CONTROL DE ACCESO DETALLADO**

| Endpoint | Público | Estudiante | Profesor | Admin |
|----------|---------|------------|----------|-------|
| POST /register (estudiante) | ✅ | ✅ | ✅ | ✅ |
| POST /register (profesor) | ❌ | ❌ | ❌ | ✅ |
| POST /register (admin) | ❌ | ❌ | ❌ | ✅ |
| POST /login | ✅ | ✅ | ✅ | ✅ |
| GET /profile | ❌ | ✅ | ✅ | ✅ |
| PUT /profile | ❌ | ✅ | ✅ | ✅ |
| PUT /update-academic-info | ❌ | ✅ | ❌ | ❌ |
| PUT /update-teaching-info | ❌ | ❌ | ✅ | ❌ |
| GET /students | ❌ | ✅ | ✅ | ✅ |
| GET /professors | ❌ | ❌ | ❌ | ✅ |
| PUT /change-password | ❌ | ✅ | ✅ | ✅ |
| POST /logout | ❌ | ✅ | ✅ | ✅ |

---

## ❌ **ERRORES COMUNES Y SOLUCIONES**

### **Error de Validación:**
```json
{
  "success": false,
  "message": "Errores de validación",
  "errors": [
    {
      "field": "nivel",
      "message": "Nivel debe ser: A1, A2, B1, B2, C1 o C2"
    }
  ]
}
```
**Solución:** Verificar que todos los campos obligatorios estén presentes y tengan el formato correcto.

### **Error de Permisos:**
```json
{
  "success": false,
  "message": "Solo los administradores pueden crear profesores",
  "code": "INSUFFICIENT_PERMISSIONS"
}
```
**Solución:** Usar el token correcto del rol apropiado.

### **Error de Autenticación:**
```json
{
  "success": false,
  "message": "Token inválido o expirado",
  "code": "INVALID_TOKEN"
}
```
**Solución:** Hacer login nuevamente para obtener un token válido.

---

---

## **RESUMEN DE MIGRACIÓN COMPLETADA**

### **ESTADO ACTUAL DEL SISTEMA**
- **Arquitectura:** Modelos discriminados con BaseUser + Estudiante/Profesor/Admin
- **Migración:** Completada exitosamente (11 usuarios migrados)
- **Backup:** Disponible en `users_backup_1758551807844`
- **Servidor:** Funcionando con nuevas rutas y modelos

### **CAMBIOS REALIZADOS**
1. **Modelos separados** con discriminadores de Mongoose
2. **Controladores específicos** por tipo de usuario
3. **Validaciones por rol** con campos obligatorios
4. **Rutas actualizadas** para registro por tipo
5. **Migración de datos** preservando IDs y información

### **CREDENCIALES DE ADMIN (ACTUALIZADAS)**
```json
{
  "email": "admin@consultora.com",
  "password": "Admin123!"
}
```

### **ENDPOINTS PRINCIPALES FUNCIONANDO**
- `POST /api/auth/login` - Login universal
- `POST /api/auth/register/estudiante-admin` - Solo admin
- `POST /api/auth/register/profesor` - Solo admin
- `POST /api/auth/register/admin` - Solo admin
- `PUT /api/auth/change-password` - Usuarios autenticados
- `GET /api/auth/users` - Solo admin
- `GET /api/auth/profile` - Usuarios autenticados

### **FLUJO RECOMENDADO PARA NUEVOS USUARIOS**
1. **Admin** registra usuario → Password = DNI
2. **Usuario** hace primer login con DNI
3. **Sistema** detecta `mustChangePassword: true`
4. **Usuario** cambia contraseña obligatoriamente
5. **Usuario** puede usar sistema normalmente

### **COMPATIBILIDAD CON THUNDER CLIENT**
Todos los endpoints están probados y funcionando correctamente. La documentación refleja el estado actual post-migración.

---

## **PARA TUS COMPAÑEROS DE EQUIPO**

### **INSTRUCCIONES SIMPLES**
1. **Hacer pull** del repositorio
2. **Instalar dependencias:** `npm install` (si hay nuevas)
3. **Iniciar servidor:** `npm start` o `npm run dev`
4. **Usar Thunder Client** con los endpoints de esta guía

### **IMPORTANTE**
- Los usuarios existentes conservan sus datos
- Las credenciales de admin han cambiado a `Admin123!`
- Todos los nuevos registros requieren DNI
- Los modelos están separados pero en la misma colección
- La funcionalidad es idéntica, solo cambió la arquitectura interna
- Admins pueden registrar otros admins, pero deben definir la contraseña y el DNI.
- Todos los endpoints requieren `Content-Type: application/json`.
- Para registrar usuarios, necesitas el token JWT de admin en el header `Authorization`.

---

## 2. Flujo completo de pruebas (Thunder Client)

### A. Crear el primer administrador

**Endpoint:** `POST /api/auth/create-first-admin`
**Body:**
```json
{
  "email": "admin@consultora.com",
  "password": "Admin123!",
  "firstName": "Super",
  "lastName": "Admin",
  "dni": "99999999"
}
```
**Respuesta:**
- Si ya existe un admin, retorna error.

---

### B. Login como administrador

**Endpoint:** `POST /api/auth/login`
**Body:**
```json
{
  "email": "admin@consultora.com",
  "password": "Admin123!"
}
```
**Respuesta:**
- Recibes un token JWT en `data.token`.

---

### C. Registrar estudiante (solo admin)

**Endpoint:** `POST /api/auth/register`
**Headers:**
- `Authorization: Bearer <token_admin>`

**Body:**
```json
{
  "email": "estudiante1@test.com",
  "firstName": "Juan",
  "lastName": "Perez",
  "role": "estudiante",
  "dni": "12345678",
  "nivel": "A1",
  "phone": "123456789"
}
```
**Notas:**
- El campo `dni` será la contraseña temporal.
- El campo `mustChangePassword` estará en `true`.

---

### D. Registrar profesor (solo admin)

**Endpoint:** `POST /api/auth/register`
**Headers:**
- `Authorization: Bearer <token_admin>`

**Body:**
```json
{
  "email": "profesor1@test.com",
  "firstName": "Maria",
  "lastName": "Garcia",
  "role": "profesor",
  "dni": "87654321",
  "especialidades": ["ingles", "frances"],
  "tarifaPorHora": 25.5,
  "phone": "987654321"
}
```
**Notas:**
- El campo `dni` será la contraseña temporal.
- El campo `mustChangePassword` estará en `true`.

---

### E. Registrar otro admin

**Endpoint:** `POST /api/auth/register-admin`
**Headers:**
- `Authorization: Bearer <token_admin>`

**Body:**
```json
{
  "email": "admin2@consultora.com",
  "password": "Admin456!",
  "firstName": "Ana",
  "lastName": "Lopez",
  "role": "admin",
  "dni": "88888888",
  "phone": "111222333"
}
```
**Notas:**
- El admin define la contraseña y el DNI.

---

### F. Login de estudiante/profesor con DNI

**Endpoint:** `POST /api/auth/login`
**Body:**
```json
{
  "email": "estudiante1@test.com",
  "password": "12345678"
}
```
**Respuesta:**
- Si la contraseña es el DNI, la respuesta tendrá `mustChangePassword: true` y mensaje "Debe cambiar su contraseña".

---

### G. Cambio de contraseña forzado

**Endpoint:** `PUT /api/auth/change-password-forced`
**Headers:**
- `Authorization: Bearer <token_usuario>`

**Body:**
```json
{
  "newPassword": "NuevaPassword123!"
}
```
**Respuesta:**
- Si el cambio es exitoso, `mustChangePassword` será `false`.

---

### H. Login normal después del cambio

**Endpoint:** `POST /api/auth/login`
**Body:**
```json
{
  "email": "estudiante1@test.com",
  "password": "NuevaPassword123!"
}
```
**Respuesta:**
- El login será exitoso y no pedirá cambio de contraseña.

---

## 3. Notas y recomendaciones

- Todos los registros requieren token de admin.
- Los estudiantes y profesores deben cambiar su contraseña en el primer login.
- El campo `dni` debe ser único y numérico (7-8 dígitos).
- Si tienes errores de validación, revisa los mensajes detallados en la respuesta.
- Puedes probar todos los flujos en Thunder Client siguiendo los ejemplos de arriba.