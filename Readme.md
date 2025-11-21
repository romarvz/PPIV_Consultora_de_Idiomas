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
- **cloudinary** ^2.8.0 - Gestión de imágenes
- **multer** ^2.0.2 - Upload de archivos
- **pdfkit** ^0.17.2 - Generación de PDFs
- **xlsx** ^0.18.5 - Exportación Excel

### **Frontend (Client)**
- **React** ^18.2.0 - Biblioteca de UI
- **React DOM** ^18.2.0 - Renderizado DOM
- **Vite** ^4.4.5 - Build tool y dev server
- **React Router DOM** ^7.9.1 - Enrutamiento
- **React Hook Form** ^7.62.0 - Manejo de formularios
- **Yup** ^1.7.0 - Validación de esquemas
- **Axios** ^1.12.1 - Cliente HTTP
- **@hookform/resolvers** ^5.2.1 - Resolvers para formularios
- **React Icons** ^5.5.0 - Biblioteca de iconos
- **Recharts** ^3.2.1 - Gráficos y visualizaciones
- **React Big Calendar** ^1.19.4 - Calendario interactivo
- **Date-fns** ^4.1.0 - Utilidades de fechas
- **jsPDF** ^3.0.3 - Generación de PDFs
- **Lucide React** ^0.552.0 - Iconos modernos

### **Herramientas de Desarrollo**
- **Nodemon** ^3.0.1 - Auto-restart en desarrollo
- **Jest** ^29.6.2 - Framework de testing
- **supertest** ^6.3.3 - Testing de APIs
- **mongodb-memory-server** ^9.1.3 - BD en memoria para tests
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

### **Endpoints API Disponibles**

#### **Autenticación** (Base: `/api/auth`)
- `POST /login` - Login universal para todos los roles
- `POST /logout` - Cerrar sesión e invalidar token
- `GET /verify-token` - Verificar validez del token actual
- `POST /register/estudiante-admin` - Crear nuevo estudiante (admin)
- `POST /register/profesor` - Crear nuevo profesor (admin)
- `POST /register/admin` - Crear nuevo administrador (admin)
- `POST /create-first-admin` - Crear primer admin del sistema
- `GET /profile` - Ver perfil propio del usuario autenticado
- `PUT /profile` - Actualizar información general del perfil
- `PUT /update-academic-info` - Actualizar info académica (estudiantes)
- `PUT /update-teaching-info` - Actualizar info profesional (profesores)
- `PUT /change-password` - Cambiar contraseña
- `PUT /change-password-forced` - Cambio forzado de contraseña
- `GET /students` - Listar todos los estudiantes
- `GET /professors` - Listar profesores
- `PUT /deactivate/:id` - Desactivar usuario (admin)
- `PUT /reactivate/:id` - Reactivar usuario (admin)
- `DELETE /delete/:id` - Eliminar usuario permanentemente (admin)

#### **Estudiantes** (Base: `/api/students`)
- `GET /` - Listar estudiantes con filtros y paginación
- `GET /:id` - Obtener estudiante por ID
- `PUT /:id` - Actualizar estudiante
- `DELETE /:id` - Eliminar estudiante

#### **Profesores** (Base: `/api/teachers`)
- `GET /` - Listar profesores con filtros
- `GET /:id` - Obtener profesor por ID
- `PUT /:id` - Actualizar profesor
- `DELETE /:id` - Eliminar profesor

#### **Horarios** (Base: `/api/horarios`)
- `POST /` - Crear nuevo horario
- `GET /` - Listar horarios con filtros
- `GET /:id` - Obtener horario por ID
- `PUT /:id` - Actualizar horario
- `DELETE /:id` - Eliminar horario
- `POST /asignar-profesor` - Asignar horario a profesor
- `GET /disponibilidad` - Verificar disponibilidad
- `GET /profesor/:profesorId` - Horarios de un profesor

#### **Cursos** (Base: `/api/cursos`)
- `POST /` - Crear curso
- `GET /` - Listar cursos
- `GET /:id` - Obtener curso por ID
- `PUT /:id` - Actualizar curso
- `DELETE /:id` - Eliminar curso
- `POST /:id/inscribir` - Inscribir estudiante
- `DELETE /:id/desinscribir/:estudianteId` - Desinscribir estudiante

#### **Idiomas** (Base: `/api/languages`)
- `POST /` - Crear idioma
- `GET /` - Listar idiomas
- `GET /:id` - Obtener idioma por ID
- `PUT /:id` - Actualizar idioma
- `DELETE /:id` - Eliminar idioma

#### **Dashboard** (Base: `/api/dashboard`)
- `GET /stats` - Estadísticas generales
- `GET /recent-activity` - Actividad reciente
- `GET /financial-summary` - Resumen financiero
- `GET /academic-progress` - Progreso académico

#### **Auditoría** (Base: `/api/auditoria`)
- `GET /logs` - Obtener logs de auditoría
- `GET /logs/:id` - Obtener log específico
- `GET /user/:userId` - Logs de un usuario
- `GET /action/:action` - Logs por tipo de acción

#### **Perfiles de Estudiantes** (Base: `/api/perfiles`)
- `GET /estudiante/:id` - Obtener perfil de estudiante
- `POST /estudiante/:id` - Crear/actualizar perfil
- `GET /estudiante/:id/preferencias` - Obtener preferencias
- `PUT /estudiante/:id/preferencias` - Actualizar preferencias
- `GET /estudiante/:id/certificados` - Obtener certificados
- `POST /estudiante/:id/certificados` - Agregar certificado
- `GET /certificado/verificar/:codigo` - Verificar certificado
- `GET /estudiante/:id/estadisticas` - Estadísticas del estudiante
- `PUT /estudiante/:id/estadisticas/actualizar` - Actualizar estadísticas
- `GET /estudiante/:id/historial` - Historial académico
- `POST /estudiante/:id/historial` - Agregar entrada al historial
- `GET /profesor/:id` - Obtener perfil de profesor

#### **Reportes Académicos** (Base: `/api/reportes-academicos`)
- `POST /generar` - Generar reporte académico
- `POST /generar-automatico/:cursoId` - Generar reporte automático
- `GET /:id` - Obtener reporte por ID
- `GET /estudiante/:estudianteId` - Reportes de un estudiante
- `GET /curso/:cursoId` - Reportes de un curso
- `GET /periodo/:periodo` - Reportes por período
- `PUT /:id` - Actualizar reporte
- `POST /:id/evaluacion` - Agregar evaluación
- `GET /estudiante/:estudianteId/estadisticas` - Estadísticas académicas
- `GET /curso/:cursoId/resumen` - Resumen del curso
- `GET /:id/exportar-pdf` - Exportar reporte a PDF
- `GET /:id/exportar-excel` - Exportar reporte a Excel

#### **Reportes Financieros** (Base: `/api/reportes-financieros`)
- `POST /generar` - Generar reporte financiero
- `POST /generar-automatico` - Generar reporte automático
- `GET /periodo/:periodo` - Reporte por período
- `GET /recientes` - Reportes recientes
- `GET /` - Listar todos los reportes
- `PUT /periodo/:periodo` - Actualizar reporte
- `POST /periodo/:periodo/deuda` - Registrar deuda
- `GET /comparar/:periodo1/:periodo2` - Comparar períodos
- `GET /tendencias` - Análisis de tendencias
- `GET /morosidad` - Reporte de morosidad
- `GET /proyeccion` - Proyecciones financieras
- `GET /periodo/:periodo/exportar-pdf` - Exportar a PDF
- `GET /periodo/:periodo/exportar-excel` - Exportar a Excel

#### **Clases** (Base: `/api/clases`)
- `POST /` - Crear nueva clase
- `GET /` - Listar clases con filtros
- `GET /:id` - Obtener clase por ID
- `PUT /:id` - Actualizar clase
- `DELETE /:id` - Eliminar clase
- `POST /:id/asistencia` - Registrar asistencia
- `GET /:id/asistencia` - Obtener asistencia de clase
- `PUT /:id/estado` - Cambiar estado de clase
- `GET /curso/:cursoId` - Clases de un curso
- `GET /profesor/:profesorId` - Clases de un profesor

#### **Uploads** (Base: `/api/uploads`)
- `POST /image` - Subir imagen a Cloudinary
- `DELETE /image/:publicId` - Eliminar imagen
- `GET /images` - Listar imágenes subidas

#### **Sistema Financiero**

**Cobros** (Base: `/api/cobros`)
- `POST /` - Crear cobro
- `GET /` - Listar cobros
- `GET /:id` - Obtener cobro por ID
- `PUT /:id` - Actualizar cobro
- `DELETE /:id` - Eliminar cobro
- `PUT /:id/estado` - Cambiar estado de cobro

**Facturas** (Base: `/api/facturas`)
- `POST /` - Crear factura
- `GET /` - Listar facturas
- `GET /:id` - Obtener factura por ID
- `PUT /:id` - Actualizar factura
- `DELETE /:id` - Anular factura
- `GET /:id/pdf` - Generar PDF de factura

**Conceptos de Cobro** (Base: `/api/conceptos-cobros`)
- `POST /` - Crear concepto
- `GET /` - Listar conceptos
- `GET /:id` - Obtener concepto por ID
- `PUT /:id` - Actualizar concepto
- `DELETE /:id` - Eliminar concepto

**Categorías de Conceptos** (Base: `/api/concept-categories`)
- `POST /` - Crear categoría
- `GET /` - Listar categorías
- `GET /:id` - Obtener categoría por ID
- `PUT /:id` - Actualizar categoría
- `DELETE /:id` - Eliminar categoría

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
- **server/docs/ARQUITECTURA_BACKEND.md** - Arquitectura completa del backend
- **server/docs/GUIA_COMPLETA_APIS_POR_ROL.md** - Guía completa de APIs organizadas por rol
- **server/docs/GUIA_INTEGRACION.md** - Guía de integración frontend-backend
- **server/docs/GUIA_DASHBOARD.md** - Documentación del sistema de dashboard
- **server/docs/pruebas_autenticacion.md** - Pruebas de autenticación
- **server/models/README-Horario.md** - Documentación del modelo de horarios

## Roadmap de Desarrollo

### **Fase 1: Backend API** COMPLETADA ✅
- [x] Modelos discriminados con Mongoose
- [x] Autenticación JWT con roles y permisos
- [x] CRUD completo de usuarios por rol
- [x] Migración de datos exitosa (11 usuarios)
- [x] Validaciones específicas por tipo de usuario
- [x] Sistema de passwords con DNI para primer login
- [x] Gestión completa: desactivar, reactivar, eliminar usuarios
- [x] Testing automatizado de todos los endpoints
- [x] Documentación completa de APIs
- [x] Sistema de horarios completo
- [x] Gestión de cursos e inscripciones
- [x] Sistema de idiomas (Languages)
- [x] Módulo de auditoría y logs
- [x] Dashboard con estadísticas
- [x] Sistema financiero (cobros, facturas, conceptos)
- [x] Calendario de eventos
- [x] Seeds y migraciones automatizadas

### **Fase 2: Frontend React** COMPLETADO ✅
- [x] Configuración inicial de Vite + React
- [x] Estructura de proyecto con React Router
- [x] Sistema de autenticación completo (useAuth hook)
- [x] Cliente HTTP con Axios
- [x] Sistema Mock para desarrollo independiente
- [x] Guía de integración completa
- [x] Interfaz de login y autenticación
- [x] Rutas protegidas por rol
- [x] Dashboard administrativo (AdminDashboard)
- [x] Dashboard de estudiantes (StudentDashboard)
- [x] Dashboard de profesores (TeacherDashboard)
- [x] Dashboard de empresa (CompanyDashboard)
- [x] Dashboard financiero (FinancialDashboard)
- [x] Gestión de estudiantes (StudentsManagement)
- [x] Gestión de profesores (TeachersManagement)
- [x] Registro de estudiantes (RegisterStudent)
- [x] Registro de profesores (RegisterTeacher)
- [x] Gestión de cursos (CourseManagementPage)
- [x] Sistema de horarios (ClassScheduler)
- [x] Registro de pagos (PaymentRegistration)
- [x] Componentes de gráficos (SystemOverviewCharts)
- [x] Vista de calendario (CalendarView)
- [x] Layout con Header y Footer
- [x] Páginas públicas (Home, About, Services, Courses, Contact)
- [x] Integración completa con backend real
- [x] Sistema de notificaciones en tiempo real
- [x] Reportes avanzados con exportación

## Sistema Mock para Desarrollo Frontend

### **Archivos del Sistema Mock**
El sistema mock está compuesto por tres archivos principales que trabajan en conjunto:

#### **1. mockData.js**
Contiene datos estáticos de ejemplo incluyendo:
- 10 estudiantes con perfiles detallados
- 5 profesores con especialidades y horarios
- 10 clases de ejemplo con diferentes estados
- 10 registros de pagos
- 5 idiomas soportados
- 1 empresa de ejemplo

#### **2. mockApi.js**
Implementa una API simulada completa con:
- Operaciones CRUD para clases y pagos
- Generación de reportes (académicos, financieros)
- Acceso a datos de empresas
- Almacenamiento en sesión para persistencia de datos
- Simulación de retardo de red

#### **3. apiAdapter.js**
Adaptador inteligente que:
- Alterna entre mock y backend real usando la bandera USE_MOCK
- Proporciona una interfaz de API consistente para todos los servicios
- Maneja casos de error y formateo de datos
- Facilita la transición al backend real

### **Cómo Usar**

```javascript
// En tus componentes
import apiAdapter from '../services/apiAdapter'

// Ejemplo de uso
const fetchClasses = async () => {
  try {
    const response = await apiAdapter.classes.getAll({
      status: 'programada',
      page: 1,
      limit: 10
    })
    
    if (response.data.success) {
      setClasses(response.data.data.classes)
    }
  } catch (error) {
    console.error('Error:', error)
  }
}
```

### **Cambiar entre Mock y Backend Real**

#### **Modo Mock (desarrollo)**
```javascript
// En apiAdapter.js
const USE_MOCK = true // Usa datos simulados
```

#### **Modo Real (producción)**
```javascript
// En apiAdapter.js
const USE_MOCK = false // Usa backend real
```

### **Datos Mock Disponibles**

#### **Estudiantes**
- 10 estudiantes (IDs: mock-student-1 a mock-student-10)
- Niveles: A1, A2, B1, B2, C1, C2
- Estados: activo, inactivo, graduado

#### **Profesores**
- 5 profesores (IDs: mock-teacher-1 a mock-teacher-5)
- Especialidades: Inglés, Francés, Alemán, Italiano, Portugués
- Tarifas: $2400 - $3000/hora

#### **Clases**
- 10 clases con diferentes estados
- Estados: programada, completada, cancelada
- Fechas: Octubre 2025
- Duraciones: 60-90 minutos

#### **Pagos**
- 10 registros de pagos
- Estados: pagado, pendiente, vencido
- Montos: $4000 - $7000
- Métodos: transferencia, efectivo, tarjeta

#### **Empresas**
- 1 empresa de ejemplo (Tech Solutions SA)
- 2 empleados asociados

### **Utilidades**

```javascript
// Verificar si está usando mock
const isMock = apiAdapter.utils.isUsingMock()

// Resetear datos mock
apiAdapter.utils.resetMockData()

// Ver estado del almacenamiento
const state = apiAdapter.utils.getStorageState()
```

### **Importante**
- No modificar las funcionalidades existentes que ya usan api.js directamente
- Usar apiAdapter solo para nuevas funcionalidades
- Manejar errores con try/catch
- Verificar response.data.success antes de usar los datos
- Mostrar estados de carga y mensajes de error al usuario

Este sistema permite desarrollar el frontend de forma independiente mientras el backend está en desarrollo, asegurando una integración sencilla posteriormente.

### **Fase 3: Funcionalidades Avanzadas** COMPLETADO ✅
- [x] Sistema de clases y horarios
- [x] Gestión de pagos y facturación
- [x] Reportes y estadísticas (Dashboard)
- [x] Sistema de auditoría
- [x] Módulo de evaluaciones y progreso
- [x] Sistema de calificaciones
- [x] Reportes avanzados en PDF y Excel
- [x] Sistema de perfiles de estudiantes
- [x] Reportes académicos automatizados
- [x] Reportes financieros con tendencias
- [x] Sistema de asistencia a clases
- [x] Integración con Cloudinary
- [x] Exportación de datos
- [x] Testing exhaustivo (71 tests)
- [ ] Integración con calendarios externos
- [ ] Sistema de notificaciones por email
- [ ] Notificaciones push en tiempo real

### **Fase 4: Optimización y Despliegue** EN PROGRESO 🔄
- [x] Testing automatizado backend (71 tests)
- [x] Documentación técnica completa
- [x] Manual de demostración
- [x] Guías de despliegue
- [x] Mobile responsive
- [x] Seguridad implementada (JWT, bcrypt, validaciones)
- [ ] Testing automatizado frontend
- [ ] CI/CD pipeline
- [ ] Despliegue en producción
- [ ] Monitoreo y logging avanzado
- [ ] Backup automático de base de datos
- [ ] Optimización de performance

## Arquitectura del Sistema

### **Backend (Implementado)**
```
server/
├── __tests__/                  # Tests automatizados
│   ├── auditoria.test.js
│   ├── dashboard.test.js
│   └── models.test.js
├── controllers/                # Controladores de lógica de negocio
│   ├── authControllerNew.js   # Autenticación y usuarios
│   ├── auditoriaController.js # Sistema de auditoría
│   ├── cobros.controller.js   # Gestión de cobros
│   ├── conceptCategory.controller.js
│   ├── conceptosCobros.controller.js
│   ├── cursoController.js     # Gestión de cursos
│   ├── dashboardcontroller.js # Dashboard y estadísticas
│   ├── facturas.controller.js # Sistema de facturación
│   ├── horarioController.js   # Gestión de horarios
│   ├── languageController.js  # Gestión de idiomas
│   ├── studentController.js   # Gestión de estudiantes
│   └── teacherController.js   # Gestión de profesores
├── models/                     # Modelos de datos Mongoose
│   ├── BaseUser.js            # Modelo base con discriminador
│   ├── Estudiante.js          # Modelo estudiante
│   ├── Profesor.js            # Modelo profesor
│   ├── Admin.js               # Modelo administrador
│   ├── Horario.js             # Modelo horarios
│   ├── Curso.js               # Modelo cursos
│   ├── Clase.js               # Modelo clases
│   ├── Inscripcion.js         # Modelo inscripciones
│   ├── Language.js            # Modelo idiomas
│   ├── Empresa.js             # Modelo empresa
│   ├── EventoCalendario.js    # Modelo eventos
│   ├── AuditoriaLog.js        # Modelo logs de auditoría
│   ├── cobros.model.js        # Modelo cobros
│   ├── factura.model.js       # Modelo facturas
│   ├── concept.model.js       # Modelo conceptos
│   ├── conceptCategory.model.js
│   ├── contador.model.js      # Contador de facturas
│   └── index.js               # Exportaciones centralizadas
├── routes/                     # Definición de rutas API
│   ├── authNew.js             # Rutas autenticación
│   ├── auditoria.js           # Rutas auditoría
│   ├── cobros.routes.js       # Rutas cobros
│   ├── conceptCategory.routes.js
│   ├── conceptosCobros.routes.js
│   ├── cursoRoutes.js         # Rutas cursos
│   ├── dashboard.js           # Rutas dashboard
│   ├── facturas.routes.js     # Rutas facturas
│   ├── horarios.js            # Rutas horarios
│   ├── languages.js           # Rutas idiomas
│   ├── studentRoutes.js       # Rutas estudiantes
│   └── teacherRoutes.js       # Rutas profesores
├── middleware/                 # Middleware personalizado
│   ├── authMiddlewareNew.js   # Autenticación y autorización
│   └── financiero.validation.js # Validaciones financieras
├── validators/                 # Validadores express-validator
│   ├── authValidatorsNew.js   # Validaciones auth
│   ├── clasesValidators.js    # Validaciones clases
│   └── horarioValidators.js   # Validaciones horarios
├── services/                   # Servicios de lógica de negocio
│   ├── userService.js         # Servicios usuarios
│   ├── auditoriaService.js    # Servicios auditoría
│   ├── cobro.service.js       # Servicios cobros
│   ├── conceptCategory.services.js
│   ├── contador.service.js    # Servicios contador
│   ├── cursosService.js       # Servicios cursos
│   ├── dashboardService.js    # Servicios dashboard
│   └── factura.service.js     # Servicios facturas
├── shared/                     # Código compartido
│   ├── helpers/               # Funciones auxiliares
│   │   ├── index.js
│   │   └── responseHandler.js
│   ├── middleware/            # Middleware compartido
│   │   ├── errorHandler.js
│   │   ├── index.js
│   │   └── paginationMiddleware.js
│   └── utils/                 # Utilidades
│       └── constants.js       # Constantes del sistema
├── scripts/                    # Scripts de mantenimiento
│   ├── migrate-simple.js      # Migración de datos
│   ├── create-test-users.js   # Crear usuarios de prueba
│   ├── runSeeds.js            # Ejecutar seeds
│   └── seedLanguages.js       # Seed de idiomas
├── seeds/                      # Seeds de datos iniciales
│   └── empresaSeed.js         # Seed de empresa
├── migrations/                 # Migraciones de base de datos
│   └── migrateHorarios.js     # Migración de horarios
├── docs/                       # Documentación
│   ├── ARQUITECTURA_BACKEND.md
│   ├── GUIA_COMPLETA_APIS_POR_ROL.md
│   ├── GUIA_INTEGRACION.md
│   ├── GUIA_DASHBOARD.md
│   └── pruebas_autenticacion.md
├── .env                        # Variables de entorno
├── .env.example                # Ejemplo de variables
├── package.json                # Dependencias
└── index.js                    # Servidor principal                        # Variables de entorno
├── .env.example                # Ejemplo de variables
├── package.json                # Dependencias
└── index.js                    # Servidor principal
```

### **Frontend (Implementado)**
```
client/
├── src/
│   ├── components/            # Componentes React reutilizables
│   │   ├── admin/             # Componentes de administración
│   │   │   └── CalendarView.jsx
│   │   ├── charts/            # Componentes de gráficos
│   │   │   └── SystemOverviewCharts.jsx
│   │   ├── common/            # Componentes comunes
│   │   │   ├── AdminSectionHeader.jsx
│   │   │   ├── AuthNavbar.jsx
│   │   │   ├── ForcePasswordChange.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   ├── ScrollButtons.jsx
│   │   │   └── WhatsAppButton.jsx
│   │   ├── courses/           # Componentes de cursos
│   │   │   ├── CourseCard.jsx
│   │   │   ├── CourseDetailModal.jsx
│   │   │   └── CourseFormModal.jsx
│   │   ├── layout/            # Layout principal
│   │   │   ├── Footer.jsx
│   │   │   ├── Header.jsx
│   │   │   └── Layout.jsx
│   │   ├── ClassScheduler.jsx
│   │   ├── PaymentRegistration.jsx
│   │   ├── RegisterStudent.jsx
│   │   ├── RegisterTeacher.jsx
│   │   ├── StudentsManagement.jsx
│   │   └── TeachersManagement.jsx
│   ├── pages/                 # Páginas principales
│   │   ├── Dashboard/         # Dashboards por rol
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── CompanyDashboard.jsx
│   │   │   ├── CourseManagementPage.jsx
│   │   │   ├── FinancialDashboard.jsx
│   │   │   ├── ReportsDashboard.jsx
│   │   │   ├── StudentDashboard.jsx
│   │   │   └── TeacherDashboard.jsx
│   │   ├── About.jsx
│   │   ├── Clients.jsx
│   │   ├── Contact.jsx
│   │   ├── CoursesPage.jsx
│   │   ├── Demo.jsx
│   │   ├── Home.jsx
│   │   ├── Login.jsx
│   │   └── Services.jsx
│   ├── hooks/                 # Custom hooks
│   │   ├── useAuth.jsx        # Hook de autenticación
│   │   └── useTheme.js        # Hook de temas
│   ├── services/              # Servicios API
│   │   ├── api.js             # Cliente Axios
│   │   ├── apiAdapter.js      # Adaptador mock/real
│   │   ├── mockApi.js         # API simulada
│   │   └── mockData.js        # Datos de prueba
│   ├── styles/                # Estilos CSS
│   │   ├── auth.css
│   │   ├── charts.css
│   │   ├── courseCards.css
│   │   ├── courseForm.css
│   │   ├── courseManagement.css
│   │   ├── courseModals.css
│   │   └── variables.css
│   ├── utils/                 # Utilidades
│   │   ├── formatting.js      # Formateo de datos
│   │   └── routes.js          # Rutas centralizadas
│   ├── assets/                # Assets estáticos
│   │   └── images/            # Imágenes
│   ├── App.jsx               # Componente principal
│   ├── App.css               # Estilos globales
│   └── main.jsx              # Punto de entrada
├── public/
│   └── images/
│       └── Logo.png          # Logo del proyecto
├── index.html                # HTML principal
├── package.json              # Dependencias React
├── vite.config.js           # Configuración Vite
└── MANUAL_DEMO.md           # Manual de demostración
```

### **Base de Datos MongoDB (Implementada)**

**Colecciones principales:**
- **users** - Usuarios con discriminador `__t` (estudiante, profesor, admin)
- **horarios** - Horarios de clases y disponibilidad
- **cursos** - Cursos ofrecidos
- **clases** - Clases programadas
- **inscripciones** - Inscripciones de estudiantes
- **languages** - Idiomas disponibles
- **empresas** - Información de la empresa
- **eventoscalendarios** - Eventos del calendario
- **auditoriaslogs** - Logs de auditoría del sistema
- **cobros** - Registros de cobros
- **facturas** - Facturas generadas
- **concepts** - Conceptos de cobro
- **conceptcategories** - Categorías de conceptos
- **contadores** - Contadores para numeración automática

**Características:**
- **Índices únicos** en email y DNI para integridad
- **Modelos discriminados** para herencia de usuarios
- **Relaciones** entre colecciones con referencias
- **Validaciones** a nivel de esquema
- **Timestamps** automáticos (createdAt, updatedAt)
- **Soft delete** en usuarios
- **Escalabilidad** preparada para millones de registros

### **Autenticación**
- **JWT Tokens** con expiración configurable
- **Roles granulares:** Admin > Profesor > Estudiante
- **Middleware de autorización** por endpoint
- **Hashing seguro** con bcryptjs

## Métricas del Proyecto

### **Estado Actual**
- **20+ modelos** de datos implementados
- **80+ endpoints** API funcionales
- **18 controladores** de lógica de negocio
- **16 rutas** organizadas por módulo
- **15 servicios** de lógica reutilizable
- **3 tipos** de usuario con discriminadores
- **Sistema completo** de auditoría
- **Dashboard** con estadísticas en tiempo real
- **Sistema financiero** completo (cobros, facturas, conceptos)
- **Sistema de reportes** académicos y financieros
- **Sistema de perfiles** de estudiantes
- **Sistema de clases** y asistencia
- **Testing automatizado** con Jest (71 tests)
- **Integración con Cloudinary** para uploads
- **Exportación PDF/Excel** de reportes

### **Líneas de Código**
- **Backend:** ~12000+ líneas
- **Frontend:** ~8000+ líneas
- **Modelos:** ~3000+ líneas
- **Controladores:** ~4000+ líneas
- **Servicios:** ~2500+ líneas
- **Testing:** ~2000+ líneas (71 tests)
- **Documentación:** ~5000+ líneas

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

# Crear usuarios de prueba
node scripts/create-test-users.js

# Ejecutar seeds
node scripts/runSeeds.js

# Seed de idiomas
node scripts/seedLanguages.js

# Migrar horarios
node migrations/migrateHorarios.js

# Testing automatizado
npm test

# Testing de horarios
node test-horarios-completo.js
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

**Proyecto funcionando al 100%! Backend y Frontend completados con funcionalidades avanzadas.**

## Nuevas Funcionalidades Implementadas

### **Módulo de Reportes**
- **Perfiles de Estudiantes**: Sistema completo de perfiles con preferencias, certificados y estadísticas
- **Reportes Académicos**: Generación automática de reportes con cálculos de asistencia y calificaciones
- **Reportes Financieros**: Análisis financiero con tendencias, morosidad y proyecciones
- **Exportación**: PDF y Excel para todos los reportes
- **Testing Exhaustivo**: 71 tests automatizados (unitarios e integración)

### **Sistema de Clases y Asistencia**
- **Gestión de Clases**: CRUD completo con estados y seguimiento
- **Registro de Asistencia**: Sistema de asistencia por clase y estudiante
- **Integración con Cursos**: Conexión completa entre cursos, clases y estudiantes

### **Integración con Cloudinary**
- **Upload de Imágenes**: Subida segura de archivos
- **Gestión de Assets**: Organización y eliminación de imágenes
- **Optimización**: Compresión y redimensionado automático

### **Manual de Demostración**
- **Credenciales de Acceso**: Usuarios de prueba para cada rol
- **Flujos de Navegación**: Guías paso a paso
- **Casos de Uso**: Escenarios reales de demostración
- **Datos Mock**: Información realista para presentaciones

## Tecnologías

- **Frontend:** React.js + Vite
- **Backend:** Node.js
- **Base de datos:** MongoDB
- **Integración:** Firebase  preparado para futuras funcionalidades como notificaciones push

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

### **Frontend React** COMPLETO
- [x] Configuración inicial de Vite + React
- [x] Estructura de proyecto y routing
- [x] Configuración de formularios
- [x] Componentes de interfaz 
- [x] Integración con backend 

## Licencia y Créditos

**Proyecto Académico** - Sistema desarrollado para PPIV (Programación de Proyectos IV)

**Equipo de Desarrollo:**
- **Backend Core**: Romina (Arquitectura, Autenticación, APIs base)
- **Autenticación y Usuarios**: Daniela (Login, registro, tokens JWT, CRUD de usuarios, perfiles)
- **Módulo Financiero**: Ayelén (Facturas, Cobros, Conceptos)
- **Módulo Académico**: Lorena (Cursos, Clases, Horarios)
- **Módulo Reportes**: Verónica (Reportes, Perfiles, Testing)
- **Frontend**: Equipo completo (React, Dashboards, UX/UI)

**Tecnologías Open Source utilizadas:**
- React, Express, MongoDB, Mongoose, JWT
- Vite, Jest, Supertest, Cloudinary
- PDFKit, XLSX, React Icons, Recharts
- Node.js ecosystem completo

**Estadísticas Finales:**
- **20,000+ líneas** de código
- **80+ endpoints** API funcionales
- **71 tests** automatizados
- **20+ modelos** de datos
- **15+ servicios** de lógica de negocio
- **100% funcional** y listo para producción
