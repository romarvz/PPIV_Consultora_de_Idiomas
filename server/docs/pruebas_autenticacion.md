# Guía completa de pruebas de autenticación y registro

Esta guía te ayudará a probar todos los flujos de autenticación y registro del sistema usando Thunder Client o cualquier cliente HTTP.

---

## 1. Crear el primer administrador

**Endpoint:** `POST /api/auth/create-first-admin`

**Body:**
```json
{
  "email": "admin@consultora.com",
  "password": "Admin123!",
  "firstName": "Super",
  "lastName": "Admin"
}
```
**Notas:** Solo se puede usar una vez. Si ya existe un admin, retorna error.

---

## 2. Login como administrador

**Endpoint:** `POST /api/auth/login`

**Body:**
```json
{
  "email": "admin@consultora.com",
  "password": "Admin123!"
}
```
**Respuesta:**
- Si es correcto, retorna un token JWT en `data.token`.

---

## 3. Registrar usuarios (solo admins)

**Endpoint:** `POST /api/auth/register`
**Headers:**
- `Authorization: Bearer <token_admin>`

### Registrar estudiante
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
- El campo `dni` será la contraseña temporal.
- El campo `mustChangePassword` estará en `true`.

### Registrar profesor
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
- El campo `dni` será la contraseña temporal.
- El campo `mustChangePassword` estará en `true`.

### Registrar otro admin
**Endpoint:** `POST /api/auth/register-admin`
**Body:**
```json
{
  "email": "admin2@consultora.com",
  "password": "Admin456!",
  "firstName": "Ana",
  "lastName": "Lopez",
  "role": "admin",
  "phone": "111222333"
}
```

---

## 4. Login de estudiantes/profesores con DNI

**Endpoint:** `POST /api/auth/login`
**Body:**
```json
{
  "email": "estudiante1@test.com",
  "password": "12345678"
}
```
- Si la contraseña es el DNI, la respuesta tendrá `mustChangePassword: true` y mensaje "Debe cambiar su contraseña".

---

## 5. Cambio de contraseña forzado

**Endpoint:** `PUT /api/auth/change-password-forced`
**Headers:**
- `Authorization: Bearer <token_usuario>`
**Body:**
```json
{
  "newPassword": "NuevaPassword123!"
}
```
- Si el cambio es exitoso, `mustChangePassword` será `false`.

---

## 6. Login normal después del cambio

**Endpoint:** `POST /api/auth/login`
**Body:**
```json
{
  "email": "estudiante1@test.com",
  "password": "NuevaPassword123!"
}
```
- El login será exitoso y no pedirá cambio de contraseña.

---

## 7. Otros endpoints útiles

- **GET /api/auth/profile**: Ver perfil del usuario autenticado
- **PUT /api/auth/change-password**: Cambio de contraseña normal (no forzado)
- **POST /api/auth/logout**: Cerrar sesión

---

## 8. Notas importantes
- Todos los registros requieren token de admin.
- Los estudiantes y profesores deben cambiar su contraseña en el primer login.
- El campo `dni` debe ser único y numérico (7-8 dígitos).
- Los admins pueden registrar cualquier tipo de usuario.
- Si tienes errores de validación, revisa los mensajes detallados en la respuesta.

---

## 9. Ejemplo de flujo completo (Thunder Client)
1. Crear admin → Login admin → Registrar estudiante → Login estudiante con DNI → Cambio de contraseña forzado → Login estudiante con nueva contraseña.
2. Repetir para profesor.

---

## 10. Contacto y soporte
Si tienes dudas, consulta este documento o contacta al equipo técnico.
