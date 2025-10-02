# Sistema Integral para Consultora de Idiomas

Sistema completo de gestión académica y administrativa para consultoría de idiomas, desarrollado con arquitectura moderna usando modelos discriminados de MongoDB y autenticación JWT.

## Tecnologías y Versiones

### **Backend (Server)**
- **Node.js** - Runtime JavaScript
- **Express.js** ^4.18.2 - Framework web
- **MongoDB** con **Mongoose** ^7.5.0 - Base de datos y ODM
- **JWT** (jsonwebtoken ^9.0.2) - Autenticación
- **bcryptjs** ^3.0.2 - Encriptación de contraseñas
- **express-validator** ^7.2.1 - Validaciones
- **cors** ^2.8.5 - Política de CORS
- **helmet** ^8.1.0 - Seguridad HTTP
- **morgan** ^1.10.1 - Logging de requests
- **dotenv** ^16.3.1 - Variables de entorno
- **firebase-admin** ^13.5.0 - Integración Firebase

### **Frontend (Client)**
- **React** ^18.2.0 - Biblioteca de UI
- **React DOM** ^18.2.0 - Renderizado DOM
- **Vite** ^4.4.5 - Build tool y dev server
- **React Router DOM** ^7.9.1 - Enrutamiento
- **React Hook Form** ^7.62.0 - Manejo de formularios
- **Yup** ^1.7.0 - Validación de esquemas
- **Axios** ^1.12.1 - Cliente HTTP
- **@hookform/resolvers** ^5.2.1 - Resolvers para formularios

### **Herramientas de Desarrollo**
- **Nodemon** ^3.0.1 - Auto-restart en desarrollo
- **Jest** ^29.6.2 - Framework de testing
- **@vitejs/plugin-react** ^4.0.3 - Plugin React para Vite
- **TypeScript Types** - Tipos para React (@types/react ^18.2.15)

## Estado Actual del Proyecto

### **Arquitectura Implementada**
- Backend API REST completamente funcional
- Modelos discriminados con Mongoose (BaseUser, Estudiante, Profesor, Admin)
- Autenticación JWT con roles diferenciados
- Migración de datos completada exitosamente
- Sistema de passwords con DNI para primer login
- Validaciones específicas por tipo de usuario
- Gestión completa de usuarios (CRUD + soft/hard delete)

### **Sistema de Usuarios Implementado**

#### **Administradores**
- Registro exclusivo de nuevos usuarios
- Gestión completa del sistema
- Eliminación y desactivación de usuarios
- Acceso a reportes y estadísticas

#### **Profesores**
- Gestión de especialidades e idiomas (ingles, frances, aleman, italiano, portugues, espanol)
- Control de tarifas y disponibilidad por día
- Actualización de información profesional
- Password inicial con DNI, cambio obligatorio

#### **Estudiantes**
- Gestión de niveles académicos (A1, A2, B1, B2, C1, C2)
- Control de estado académico (inscrito, en_curso, graduado, suspendido)
- Seguimiento de progreso
- Password inicial con DNI, cambio obligatorio

### **Sistema de Autenticación**

#### **Flujo de Registro (Solo Admin)**
1. Admin registra usuario con DNI
2. Password inicial = DNI del usuario
3. Primer login obliga cambio de contraseña
4. Sistema de roles con permisos específicos

#### **Credenciales de Admin**
```
Email: [Configurar en .env]
Password: [Configurar en .env]
```

## Configuración y Uso

### **Prerrequisitos**
- **Node.js** v14 o superior
- **MongoDB Atlas** cuenta configurada
- **Thunder Client** o **Postman** para testing de APIs

### **Instalación Backend**
```bash
# Clonar repositorio
git clone <repo-url>
cd PPIV_Consultora_de_Idiomas

# Instalar dependencias del servidor
cd server
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tu MONGODB_URI y JWT_SECRET
```

### **Instalación Frontend**
```bash
# Desde la raíz del proyecto
cd client
npm install
```

### **Ejecutar el Proyecto**

#### **Backend (Puerto 5000)**
```bash
# Desde la carpeta server
npm run dev        # Desarrollo con nodemon
# o
npm start         # Producción
# o  
node index.js     # Directo

# El servidor corre en http://localhost:5000
```

#### **Frontend (Puerto 3000)**
```bash
# Desde la carpeta client
npm run dev       # Desarrollo con Vite
# o
npm run build     # Build para producción
npm run preview   # Preview del build

# El cliente corre en http://localhost:3000
```

## Características Implementadas

### **Gestión Completa de Usuarios**
- Registro por roles (Admin, Profesor, Estudiante)
- Autenticación con JWT (expiración 24h)
- Sistema de permisos granular
- Cambio obligatorio de contraseña en primer login
- Desactivación de usuarios (soft delete)
- Eliminación permanente (hard delete)
- Reactivación de usuarios

### **Validaciones Específicas por Rol**
- **Estudiantes:** Nivel académico, estado, DNI único (7-8 dígitos)
- **Profesores:** Especialidades válidas, tarifa numérica, disponibilidad
- **Admins:** Permisos completos, contraseña personalizada
- **Emails:** Formato válido y único
- **Contraseñas:** Mínimo 6 caracteres, mayúscula, minúscula, número

### **Endpoints API Disponibles (Base URL: http://localhost:5000/api/auth)**

#### **Autenticación**
- `POST /login` - Login universal para todos los roles
- `POST /logout` - Cerrar sesión e invalidar token
- `GET /verify-token` - Verificar validez del token actual

#### **Registro (Solo Administradores)**
- `POST /register/estudiante-admin` - Crear nuevo estudiante
- `POST /register/profesor` - Crear nuevo profesor
- `POST /register/admin` - Crear nuevo administrador
- `POST /create-first-admin` - Crear primer admin del sistema

#### **Gestión de Perfiles**
- `GET /profile` - Ver perfil propio del usuario autenticado
- `PUT /profile` - Actualizar información general del perfil
- `PUT /update-academic-info` - Actualizar info académica (solo estudiantes)
- `PUT /update-teaching-info` - Actualizar info profesional (solo profesores)

#### **Gestión de Contraseñas**
- `PUT /change-password` - Cambiar contraseña (usuario autenticado)
- `PUT /change-password-forced` - Cambio forzado de contraseña

#### **Listados y Consultas**
- `GET /students` - Listar todos los estudiantes (cualquier usuario autenticado)
- `GET /professors` - Listar profesores (solo administradores)
- `GET /professors?especialidad=ingles` - Filtrar profesores por especialidad

#### **Gestión de Usuarios (Solo Administradores)**
- `PUT /deactivate/:id` - Desactivar usuario (soft delete)
- `PUT /reactivate/:id` - Reactivar usuario desactivado
- `DELETE /delete/:id` - Eliminar usuario permanentemente (hard delete)

#### **Utilidades**
- `GET /test` - Test de funcionamiento del servidor
- `GET /db-test` - Test de conexión a base de datos

### **Ejemplos de Uso**

#### **Login y Obtener Token**
```bash
# Login como admin
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"YourPassword"}'

# Respuesta incluye token para usar en requests autenticados
```

#### **Crear Estudiante (Con Token de Admin)**
```bash
curl -X POST http://localhost:5000/api/auth/register/estudiante-admin \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "email":"estudiante@test.com",
    "firstName":"Juan",
    "lastName":"Pérez",
    "role":"estudiante",
    "dni":"12345678",
    "nivel":"A2",
    "phone":"+54911234567"
  }'
```

#### **Verificar Sistema Funcionando**
```bash
# Test básico del servidor
curl http://localhost:5000/api/auth/test

# Test de base de datos
curl http://localhost:5000/api/auth/db-test
```

## Documentación Completa

Para documentación detallada de todos los endpoints, ejemplos de uso y casos de prueba, consultar:
- **docs/GUIA_COMPLETA_APIS_POR_ROL.md** - Guía completa con todos los endpoints
- **docs/THUNDER_CLIENT_TESTS.md** - Guía de pruebas con Thunder Client
- **docs/PRUEBAS_RAPIDAS_THUNDER.md** - Pruebas rápidas para testing

## Roadmap de Desarrollo

### **Fase 1: Backend API** COMPLETADA
- [x] Modelos discriminados con Mongoose
- [x] Autenticación JWT con roles y permisos
- [x] CRUD completo de usuarios por rol
- [x] Migración de datos exitosa (11 usuarios)
- [x] Validaciones específicas por tipo de usuario
- [x] Sistema de passwords con DNI para primer login
- [x] Gestión completa: desactivar, reactivar, eliminar usuarios
- [x] Testing automatizado de todos los endpoints
- [x] Documentación completa de APIs

### **Fase 2: Frontend React** EN DESARROLLO
- [x] Configuración inicial de Vite + React
- [x] Estructura de proyecto con React Router
- [x] Configuración de formularios con React Hook Form
- [x] Cliente HTTP con Axios
- [ ] Interfaz de login y autenticación
- [ ] Dashboard administrativo
- [ ] Gestión de estudiantes y profesores
- [ ] Perfiles de usuario

### **Fase 3: Funcionalidades Avanzadas** PENDIENTE
- [ ] Sistema de clases y horarios
- [ ] Gestión de pagos y facturación
- [ ] Reportes y estadísticas
- [ ] Notificaciones en tiempo real
- [ ] Módulo de evaluaciones y progreso
- `POST /api/auth/register/estudiante-admin` - Registro estudiante (solo admin)
- `POST /api/auth/register/profesor` - Registro profesor (solo admin)
- `POST /api/auth/register/admin` - Registro admin (solo admin)
- `PUT /api/auth/change-password` - Cambio de contraseña
- `GET /api/auth/users` - Lista usuarios (solo admin)
- `GET /api/auth/profile` - Ver perfil propio
- `PUT /api/auth/update-academic-info` - Info académica (estudiantes)
- `PUT /api/auth/update-professional-info` - Info profesional (profesores)

### **Migración de Datos**
- **11 usuarios migrados** exitosamente
- **Backup automático** de seguridad
- **Preservación de IDs** originales
- **Campo discriminador** añadido automáticamente

## Documentación

### **Guía Completa de APIs**
Ver `docs/GUIA_COMPLETA_APIS_POR_ROL.md` para:
- Ejemplos completos de cada endpoint
- Flujos de testing con Thunder Client
- Validaciones y errores comunes
- Casos de uso por rol

### **Testing Rápido**
```bash
# Verificar servidor funcionando
curl http://localhost:5000/api/auth/test

# Login como admin
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"YourPassword"}'
```

## Roadmap de Desarrollo

### **Fase 1: Backend API** COMPLETADA
- [x] Modelos discriminados con Mongoose
- [x] Autenticación JWT con roles
- [x] CRUD completo de usuarios
- [x] Migración de datos exitosa
- [x] Validaciones específicas por rol
- [x] Sistema de passwords con DNI
- [x] Testing automatizado de endpoints

### **Fase 2: Gestión Académica (Próxima)**
- [ ] Modelo de Cursos y Clases
- [ ] Sistema de inscripciones
- [ ] Calendario de clases
- [ ] Asignación profesor-estudiante
- [ ] Control de asistencia
- [ ] Evaluaciones y calificaciones

### **Fase 3: Frontend Web**
- [ ] Interfaz React/Vue.js
- [ ] Dashboard diferenciado por roles
- [ ] Gestión visual de clases
- [ ] Sistema de reservas
- [ ] Panel de administración

### **Fase 4: Funcionalidades Avanzadas**
- [ ] Sistema de pagos integrado
- [ ] Notificaciones automáticas
- [ ] Reportes y estadísticas
- [ ] Integración con calendarios
- [ ] Chat interno
### **Fase 4: Optimización y Despliegue** PENDIENTE
- [ ] Testing automatizado frontend
- [ ] CI/CD pipeline
- [ ] Despliegue en producción
- [ ] Monitoreo y logging
- [ ] Backup automático de base de datos
- [ ] Optimización de performance
- [ ] Seguridad avanzada
- [ ] Mobile responsive

## Arquitectura del Sistema

### **Backend (Implementado)**
```
server/
├── controllers/
│   ├── authControllerNew.js    # Controlador principal (ACTIVO)
│   └── authController.js       # Controlador legacy (BACKUP)
├── models/                     # Modelos discriminados Mongoose
│   ├── BaseUser.js            # Modelo base con discriminatorKey
│   ├── Estudiante.js          # Modelo específico estudiante
│   ├── Profesor.js            # Modelo específico profesor
│   ├── Admin.js               # Modelo específico admin
│   └── index.js               # Exportaciones centralizadas
├── routes/
│   ├── authNew.js             # Rutas principales (ACTIVAS)
│   └── auth.js                # Rutas legacy (BACKUP)
├── middleware/
│   ├── authMiddlewareNew.js   # Middleware principal (ACTIVO)
│   └── authMiddleware.js      # Middleware legacy (BACKUP)
├── validators/
│   ├── authValidatorsNew.js   # Validaciones principales (ACTIVAS)
│   └── authValidators.js      # Validaciones legacy (BACKUP)
├── services/
│   └── userService.js         # Servicios auxiliares
├── helpers/
│   └── authHelpers.js         # Funciones auxiliares
├── scripts/
│   ├── migrate-simple.js      # Script de migración ejecutado
│   └── final-test.js          # Script de testing
├── docs/
│   └── pruebas_autenticacion.md # Documentación de pruebas
└── index.js                   # Servidor principal
```

### **Frontend (En Desarrollo)**
```
client/
├── src/
│   ├── components/            # Componentes React reutilizables
│   ├── pages/                 # Páginas principales
│   ├── hooks/                 # Custom hooks
│   ├── utils/                 # Utilidades y helpers
│   ├── services/              # Servicios API (Axios)
│   ├── App.jsx               # Componente principal
│   └── main.jsx              # Punto de entrada
├── public/
│   └── images/
│       └── Logo.png          # Assets del proyecto
├── package.json              # Dependencias React
└── vite.config.js           # Configuración Vite
```

### **Base de Datos MongoDB (Implementada)**
- **Colección única:** `users` con discriminador `__t`
- **Tipos de documentos:**
  - `__t: "estudiante"` - Documentos de estudiantes
  - `__t: "profesor"` - Documentos de profesores  
  - `__t: "admin"` - Documentos de administradores
- **11 usuarios migrados** exitosamente del modelo legacy
- **Índices únicos** en email y DNI para integridad
- **Ventajas:** Queries eficientes, integridad referencial
- **Escalabilidad:** Preparado para millones de registros

### **Autenticación**
- **JWT Tokens** con expiración configurable
- **Roles granulares:** Admin > Profesor > Estudiante
- **Middleware de autorización** por endpoint
- **Hashing seguro** con bcryptjs

## Métricas del Proyecto

### **Estado Actual**
- **11 usuarios** migrados exitosamente
- **9 endpoints** API funcionales
- **3 tipos** de usuario implementados
- **100%** de cobertura en modelos base
- **0 errores** en testing automatizado

### **Líneas de Código**
- **Backend:** ~2000 líneas
- **Modelos:** ~500 líneas
- **Testing:** ~800 líneas
- **Documentación:** ~1500 líneas

## Para el Equipo de Desarrollo

### **Cómo Contribuir**
1. **Clonar repo:** `git clone <repo-url>`
2. **Checkout rama:** `git checkout -b feature/nueva-funcionalidad`
3. **Instalar deps:** `cd server && npm install`
4. **Configurar .env:** Copiar variables de entorno
5. **Testing:** Usar Thunder Client con guía de APIs
6. **Commit & PR:** Seguir convenciones del proyecto

### **Convenciones**
- **Commits:** `feat:`, `fix:`, `docs:`, `refactor:`
- **Branches:** `feature/`, `hotfix/`, `docs/`
- **Testing:** Probar endpoints antes de PR
- **Documentación:** Actualizar guías con cambios

### **Comandos Útiles**
```bash
# Iniciar desarrollo
cd server && npm run dev

# Testing de migración
node scripts/migrate-simple.js status

# Verificar modelos
node scripts/test-models.js

# Testing completo de APIs
node scripts/final-test.js
```

## Troubleshooting Común

### **Error: "No se puede conectar a MongoDB"**
- Verificar `MONGODB_URI` en `.env`
- Confirmar IP permitida en MongoDB Atlas
- Revisar credenciales de conexión

### **Error: "Token inválido"**
- Verificar `JWT_SECRET` en `.env`
- Usar token reciente (expiran en 24h)
- Formato header: `Bearer <token>`

### **Error: "Puerto 5000 en uso"**
```bash
# Encontrar proceso
netstat -ano | findstr :5000

# Matar proceso (reemplazar PID)
taskkill /PID <process_id> /F
```

## Soporte y Contacto

### **Recursos**
- **Documentación completa:** `docs/GUIA_COMPLETA_APIS_POR_ROL.md`
- **Testing:** Thunder Client con ejemplos
- **Issues:** GitHub Issues del repositorio
- **Preguntas:** Crear issue con label `question`

### **Mantenimiento**
- **Backup automático** antes de migraciones
- **Logs detallados** de todas las operaciones
- **Versionado semántico** en releases
- **Testing continuo** antes de deploys

---

**Proyecto funcionando al 100%! Backend completo y listo para desarrollo frontend.**

## Tecnologías

- **Frontend:** React.js + Vite
- **Backend:** Node.js
- **Base de datos:** MongoDB
- **Integración:** Firebase

## Instalación

1. Clonar el repositorio
```bash
git clone https://github.com/romarvz/PPIV_Consultora_De_Idiomas.git
```

2. Instalar dependencias
```bash
# Frontend
cd client
npm install

**Paquetes principales instalados en el frontend:**
- axios
- react-router-dom
- @hookform/resolvers
- react-hook-form
## Equipo de Desarrollo

### **Contribuir al Proyecto**
1. **Fork del repo** y crear branch feature
2. **Revisar documentación** en `/docs/`
3. **Instalar dependencias:**
   ```bash
   # Backend
   cd server && npm install
   
   # Frontend  
   cd client && npm install
   ```
4. **Configurar .env:** Copiar variables de entorno necesarias
5. **Testing:** Usar Thunder Client con guías de APIs
6. **Commit & PR:** Seguir convenciones del proyecto

### **Convenciones de Desarrollo**
- **Commits:** `feat:`, `fix:`, `docs:`, `refactor:`, `test:`
- **Branches:** `feature/nueva-funcionalidad`, `hotfix/correccion`, `docs/actualizacion`
- **Testing:** Probar todos los endpoints antes de hacer PR
- **Documentación:** Actualizar guías correspondientes con cambios

### **Comandos Útiles**

#### **Backend**
```bash
# Desarrollo con auto-restart
cd server && npm run dev

# Producción
cd server && npm start

# Testing directo
cd server && node index.js

# Verificar migración
node scripts/migrate-simple.js status

# Test de modelos
node scripts/final-test.js
```

#### **Frontend**  
```bash
# Desarrollo con hot-reload
cd client && npm run dev

# Build para producción
cd client && npm run build

# Preview del build
cd client && npm run preview
```

#### **Base de Datos**
```bash
# Test de conexión
curl http://localhost:5000/api/auth/db-test

# Login de admin
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"YourPassword"}'
```

## Variables de Entorno Requeridas

### **Backend (.env en /server/)**
```env
# Base de datos
MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/consultora_idiomas

# Autenticación
JWT_SECRET=tu_clave_secreta_muy_segura

# Servidor
PORT=5000
NODE_ENV=development

# Frontend URL para CORS
FRONTEND_URL=http://localhost:3000
```

### **Frontend (.env en /client/)**
```env
# URL del backend
VITE_API_URL=http://localhost:5000/api

# Configuración de desarrollo
VITE_NODE_ENV=development
```

## Estado de Testing

### **Backend API** COMPLETAMENTE PROBADO
- [x] Autenticación y login de todos los roles
- [x] Registro de usuarios por admin
- [x] Cambio de contraseñas obligatorio
- [x] Gestión de perfiles y actualizaciones
- [x] Listados y filtros de usuarios
- [x] Eliminación y desactivación de usuarios
- [x] Validaciones y manejo de errores
- [x] Tokens JWT y autorización

### **Frontend React** EN DESARROLLO
- [x] Configuración inicial de Vite + React
- [x] Estructura de proyecto y routing
- [x] Configuración de formularios
- [ ] Componentes de interfaz en desarrollo
- [ ] Integración con backend pendiente

## Licencia y Créditos

**Proyecto Académico** - Sistema desarrollado para PPIV (Programación de Proyectos IV)

**Tecnologías Open Source utilizadas:**
- React, Express, MongoDB, Mongoose, JWT
- Vite, Thunder Client, Postman  
- Node.js ecosystem completo
