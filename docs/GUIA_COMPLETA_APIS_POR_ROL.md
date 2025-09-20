#  GUÍA COMPLETA DE APIs - SISTEMA DE CONSULTORÍA DE IDIOMAS

##  **FUNCIONALIDADES EXTENDIDAS POR ROL**

Esta guía detalla todos los endpoints del sistema, incluyendo las nuevas funcionalidades específicas por rol (estudiantes y profesores) con ejemplos completos para Thunder Client.

---

## 🔧 **CONFIGURACIÓN INICIAL**

### **1. Iniciar el Servidor**
```bash
cd server
npm run dev
# o alternativamente:
node index.js
```

**URL Base:** `http://localhost:5000`
**Headers básicos:** `Content-Type: application/json`

### **2. Crear Primer Administrador (Solo primera vez)**
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

**Credenciales del Admin:**
- Email: `admin@consultora.com`
- Password: `Admin123456`

---

##  **REGISTRO DE USUARIOS POR ROL**

### **🎓 REGISTRO DE ESTUDIANTE (Acceso Público)**

**Endpoint:** `POST http://localhost:5000/api/auth/register`
**Headers:** `Content-Type: application/json`
**Permisos:** Cualquier persona puede registrarse como estudiante

#### **Campos obligatorios:**
- `email` - Email válido y único
- `password` - Mínimo 6 caracteres (1 mayúscula, 1 minúscula, 1 número)
- `confirmPassword` - Debe coincidir con password
- `firstName` - Nombre (2-50 caracteres, solo letras)
- `lastName` - Apellido (2-50 caracteres, solo letras)
- `nivel` - **OBLIGATORIO** (A1, A2, B1, B2, C1, C2)
- `dni` - **OBLIGATORIO** (7-8 dígitos, único)

#### **Campos opcionales:**
- `role` - Por defecto "estudiante"
- `phone` - Teléfono (formato flexible)
- `estadoAcademico` - Por defecto "inscrito" (inscrito, en_curso, graduado, suspendido)

#### **Ejemplo mínimo:**
```json
{
  "email": "estudiante@test.com",
  "password": "Test123456",
  "confirmPassword": "Test123456",
  "firstName": "María",
  "lastName": "González",
  "nivel": "B1",
  "dni": "12345678"
}
```

#### **Ejemplo completo:**
```json
{
  "email": "sabrinaavalos@gmail.com",
  "password": "Test123456",
  "confirmPassword": "Test123456",
  "firstName": "Sabrina",
  "lastName": "Ávalos",
  "role": "estudiante",
  "phone": "+54911234567",
  "nivel": "B1",
  "estadoAcademico": "inscrito",
  "dni": "87654321"
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
      "email": "sabrinaavalos@gmail.com",
      "firstName": "Sabrina",
      "lastName": "Ávalos",
      "role": "estudiante",
      "nivel": "B1",
      "estadoAcademico": "inscrito"
    }
  }
}
```

---

### ** REGISTRO DE PROFESOR (Solo Admin)**

**Endpoint:** `POST http://localhost:5000/api/auth/register`
**Headers:**
```
Content-Type: application/json
- `confirmPassword` - Debe coincidir con password
- `firstName` - Nombre (2-50 caracteres, solo letras)
- `tarifaPorHora` - **OBLIGATORIO** Número ≥ 0
- `dni` - **OBLIGATORIO** (7-8 dígitos, único)

#### **Campos opcionales:**
- `phone` - Teléfono (formato flexible)
- `disponibilidad` - Horarios por día de la semana

#### **Especialidades válidas:**
`ingles`, `frances`, `aleman`, `italiano`, `portugues`, `espanol`

#### **Ejemplo completo:**
```json
{
  "email": "profesor@test.com",
  "password": "Password123",
  "confirmPassword": "Password123",
  "firstName": "Carlos",
  "lastName": "Rodríguez",
  "role": "profesor",
  "phone": "+54911234568",
  "especialidades": ["ingles", "frances"],
  "tarifaPorHora": 2500,
  "disponibilidad": {
    "lunes": [{"inicio": "09:00", "fin": "12:00"}],
    "miercoles": [{"inicio": "14:00", "fin": "17:00"}],
    "viernes": [{"inicio": "16:00", "fin": "19:00"}]
  },
  "dni": "12345678"
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
      "email": "profesor@test.com",
      "firstName": "Carlos",
      "lastName": "Rodríguez",
      "role": "profesor",
      "especialidades": ["ingles", "frances"],
      "tarifaPorHora": 2500,
      "disponibilidad": { ... }
    }
  }
}
```

---

### ** REGISTRO DE ADMIN (Solo Admin)**

**Endpoint:** `POST http://localhost:5000/api/auth/register`
**Headers:**
```
Content-Type: application/json
Authorization: Bearer [TOKEN_DE_ADMIN]
```
**Permisos:** Solo administradores pueden crear otros administradores

#### **Campos obligatorios:**
- `email` - Email válido y único
- `password` - Mínimo 6 caracteres (1 mayúscula, 1 minúscula, 1 número)
- `confirmPassword` - Debe coincidir con password
- `firstName` - Nombre (2-50 caracteres, solo letras)
- `lastName` - Apellido (2-50 caracteres, solo letras)
- `role` - Debe ser "admin"
- `phone` - Teléfono (formato flexible)
- `dni` - **OBLIGATORIO** (7-8 dígitos, único)

#### **Ejemplo:**
```json
{
  "email": "admin2@consultora.com",
  "password": "Admin123456",
  "confirmPassword": "Admin123456",
  "firstName": "Ana",
  "lastName": "López",
  "role": "admin",
  "phone": "+54911234569",
  "dni": "88888888"
}
```

---

##  **LOGIN POR ROL**

### **Login Universal (Cualquier Usuario)**
**Endpoint:** `POST http://localhost:5000/api/auth/login`
**Headers:** `Content-Type: application/json`
**Permisos:** Público

#### **Login como Estudiante:**
```json
{
  "email": "sabrinaavalos@gmail.com",
  "password": "Test123456"
}
```

#### **Login como Profesor:**
```json
{
  "email": "profesor@test.com",
  "password": "Password123"
}
```

#### **Login como Admin:**
```json
{
  "email": "admin@consultora.com",
  "password": "Admin123456"
}
```

#### **Respuesta exitosa (cualquier rol):**
```json
{
  "success": true,
  "message": "Login exitoso",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "email": "usuario@test.com",
      "firstName": "Nombre",
      "lastName": "Apellido",
      "role": "estudiante|profesor|admin",
      "nivel": "B1",  // solo estudiantes
      "especialidades": ["ingles"],  // solo profesores
      "tarifaPorHora": 2500  // solo profesores
    }
  }
}
```

** IMPORTANTE:** Guarda el `token` para usarlo en requests que requieren autenticación.

---

##  **ACTUALIZACIÓN DE INFORMACIÓN POR ROL**

### ** Actualizar Información Académica (Solo Estudiantes)**

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
      "email": "sabrinaavalos@gmail.com",
      "firstName": "Sabrina",
      "nivel": "B2",
      "estadoAcademico": "en_curso"
    }
  }
}
```

---

### ** Actualizar Información de Enseñanza (Solo Profesores)**

**Endpoint:** `PUT http://localhost:5000/api/auth/update-teaching-info`
**Headers:**
```
Content-Type: application/json
Authorization: Bearer [TOKEN_DE_PROFESOR]
```
**Permisos:** Solo el profesor propietario de la cuenta

#### **Campos actualizables:**
- `especialidades` - Cambiar idiomas que enseña
- `tarifaPorHora` - Actualizar tarifa
- `disponibilidad` - Modificar horarios disponibles

#### **Ejemplo - Agregar especialidad y cambiar tarifa:**
```json
{
  "especialidades": ["ingles", "frances", "aleman"],
  "tarifaPorHora": 3000
}
```

#### **Ejemplo - Actualizar disponibilidad:**
```json
{
  "disponibilidad": {
    "lunes": [{"inicio": "09:00", "fin": "12:00"}],
    "martes": [{"inicio": "14:00", "fin": "18:00"}],
    "jueves": [{"inicio": "10:00", "fin": "15:00"}],
    "viernes": [{"inicio": "16:00", "fin": "19:00"}]
  }
}
```

#### **Respuesta exitosa:**
```json
{
  "success": true,
  "message": "Información de enseñanza actualizada exitosamente",
  "data": {
    "user": {
      "email": "profesor@test.com",
      "firstName": "Carlos",
      "especialidades": ["ingles", "frances", "aleman"],
      "tarifaPorHora": 3000,
      "disponibilidad": { ... }
    }
  }
}
```

---

### ** Actualizar Perfil General (Cualquier Usuario)**

**Endpoint:** `PUT http://localhost:5000/api/auth/profile`
**Headers:**
```
Content-Type: application/json
Authorization: Bearer [TOKEN_DEL_USUARIO]
```
**Permisos:** Cualquier usuario autenticado

#### **Campos actualizables:**
- `firstName` - Cambiar nombre
- `lastName` - Cambiar apellido
- `phone` - Actualizar teléfono

#### **Ejemplo:**
```json
{
  "firstName": "María José",
  "lastName": "González Silva",
  "phone": "+54911987654"
}
```

---

## 📋 **ENDPOINTS DE CONSULTA CON FILTROS**

### ** OBTENER ESTUDIANTES (Usuarios Autenticados)**

**Endpoint:** `GET http://localhost:5000/api/auth/students`
**Headers:**
```
Authorization: Bearer [TOKEN_CUALQUIER_USUARIO]
```
**Permisos:** Cualquier usuario autenticado

#### **Query Parameters (todos opcionales):**
- `nivel` - Filtrar por nivel (A1, A2, B1, B2, C1, C2)
- `estadoAcademico` - Filtrar por estado (inscrito, en_curso, graduado, suspendido)
- `page` - Número de página (default: 1)
- `limit` - Elementos por página (default: 10)

#### **Ejemplos de URLs:**
- `http://localhost:5000/api/auth/students` (todos los estudiantes)
- `http://localhost:5000/api/auth/students?nivel=B1` (solo nivel B1)
- `http://localhost:5000/api/auth/students?estadoAcademico=en_curso` (solo en curso)
- `http://localhost:5000/api/auth/students?nivel=A2&estadoAcademico=inscrito&page=1&limit=5`

#### **Respuesta esperada:**
```json
{
  "success": true,
  "data": {
    "students": [
      {
        "_id": "...",
        "email": "sabrinaavalos@gmail.com",
        "firstName": "Sabrina",
        "lastName": "Ávalos",
        "role": "estudiante",
        "nivel": "B1",
        "estadoAcademico": "inscrito",
        "phone": "+54911234567",
        "isActive": true,
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

# GUÍA ACTUALIZADA DE AUTENTICACIÓN Y REGISTRO

## 1. Registro y autenticación: conceptos clave

- Solo los administradores pueden registrar usuarios (estudiantes, profesores, otros admins).
- Para estudiantes y profesores, la contraseña inicial es el DNI (campo obligatorio y único).
- Al primer login, el sistema obliga a cambiar la contraseña (`mustChangePassword: true`).
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