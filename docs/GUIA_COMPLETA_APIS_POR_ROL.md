# 📚 GUÍA COMPLETA DE APIs - SISTEMA DE CONSULTORÍA DE IDIOMAS

## 🚀 **FUNCIONALIDADES EXTENDIDAS POR ROL**

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
**Body:** Vacío
**Respuesta esperada:**
```json
{
  "success": true,
  "message": "Primer administrador creado exitosamente",
  "data": {
    "email": "admin@consultora.com",
    "role": "admin"
  }
}
```

**Credenciales del Admin:**
- Email: `admin@consultora.com`
- Password: `Admin123456`

---

## 👥 **REGISTRO DE USUARIOS POR ROL**

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
  "nivel": "B1"
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
  "estadoAcademico": "inscrito"
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

### **👨‍🏫 REGISTRO DE PROFESOR (Solo Admin)**

**Endpoint:** `POST http://localhost:5000/api/auth/register`
**Headers:**
```
Content-Type: application/json
Authorization: Bearer [TOKEN_DE_ADMIN]
```
**Permisos:** Solo administradores pueden registrar profesores

#### **Campos obligatorios:**
- `email` - Email válido y único
- `password` - Mínimo 6 caracteres (1 mayúscula, 1 minúscula, 1 número)
- `confirmPassword` - Debe coincidir con password
- `firstName` - Nombre (2-50 caracteres, solo letras)
- `lastName` - Apellido (2-50 caracteres, solo letras)
- `role` - Debe ser "profesor"
- `especialidades` - **OBLIGATORIO** Array con al menos 1 idioma
- `tarifaPorHora` - **OBLIGATORIO** Número ≥ 0

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

### **👑 REGISTRO DE ADMIN (Solo Admin)**

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

#### **Campos opcionales:**
- `phone` - Teléfono (formato flexible)

#### **Ejemplo:**
```json
{
  "email": "admin2@consultora.com",
  "password": "Admin123456",
  "confirmPassword": "Admin123456",
  "firstName": "Ana",
  "lastName": "López",
  "role": "admin",
  "phone": "+54911234569"
}
```

---

## 🔐 **LOGIN POR ROL**

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

**⚠️ IMPORTANTE:** Guarda el `token` para usarlo en requests que requieren autenticación.

---

## ✏️ **ACTUALIZACIÓN DE INFORMACIÓN POR ROL**

### **🎓 Actualizar Información Académica (Solo Estudiantes)**

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

### **👨‍🏫 Actualizar Información de Enseñanza (Solo Profesores)**

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

### **🔄 Actualizar Perfil General (Cualquier Usuario)**

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

### **📚 OBTENER ESTUDIANTES (Usuarios Autenticados)**

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

### **👨‍🏫 OBTENER PROFESORES (Solo Admin)**

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

## 🔒 **OTROS ENDPOINTS IMPORTANTES**

### **👤 Ver Perfil Propio**
**Endpoint:** `GET http://localhost:5000/api/auth/profile`
**Headers:** `Authorization: Bearer [TOKEN]`
**Permisos:** Usuario autenticado

### **🔐 Cambiar Contraseña**
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

## 🎯 **PASOS PARA THUNDER CLIENT**

### **Para cada prueba:**
1. **Crear nueva request**
2. **Seleccionar método** (GET, POST, PUT)
3. **Copiar la URL** del endpoint
4. **Ir a pestaña Headers** y agregar:
   - `Content-Type: application/json` (siempre)
   - `Authorization: Bearer [TOKEN]` (si requiere autenticación)
5. **Si es POST/PUT:** Ir a pestaña Body, seleccionar JSON y pegar el JSON
6. **Hacer clic en Send**
7. **Revisar la respuesta** y copiar tokens si es necesario

---

**🎉 ¡Con esta guía puedes probar todas las funcionalidades del sistema por rol!**

**💡 TIP:** Guarda los tokens en un archivo aparte para reutilizarlos en múltiples requests.