# Manual de Demostración - Sistema Lingua Academy

## Información General
Este manual describe cómo navegar y probar el sistema completo de gestión de idiomas desarrollado para Lingua Academy. El sistema cuenta con diferentes roles de usuario, cada uno con su dashboard específico y funcionalidades adaptadas.

## Credenciales de Acceso

### Administrador
- **Email:** admin@consultora.com  
- **Contraseña:** Admin123!
- **Funcionalidades:** Acceso completo al sistema, gestión de estudiantes, profesores, y acceso al panel corporativo

### Estudiante
- **Email:** agustin@gmail.com
- **Contraseña:** 12345678 (DNI del estudiante)
- **Funcionalidades:** Dashboard personal con clases programadas, estado de pagos y progreso académico

### Profesor
- **Email:** profesor1@test.com
- **Contraseña:** 87654321 (DNI del profesor)
- **Funcionalidades:** Dashboard con clases del día, lista de estudiantes asignados y estadísticas de rendimiento

## Flujos de Navegación Principales

### 1. Acceso al Sistema
1. Dirigirse a http://localhost:3001/
2. Hacer clic en "Iniciar Sesión" en el menú principal
3. Ingresar las credenciales según el rol deseado
4. El sistema redirige automáticamente al dashboard correspondiente

### 2. Dashboard de Administrador
**Ubicación:** `/dashboard/admin`

**Secciones disponibles:**
- Resumen estadístico del sistema (estudiantes, profesores, especialidades)  
- Gestión de Estudiantes: permite ver, editar y gestionar información completa
- Gestión de Profesores: registro y administración de profesores y especialidades
- Acceso al Panel Corporativo: vista empresarial del sistema

**Flujo recomendado para demostración:**
1. Revisar las estadísticas generales en las cards superiores
2. Acceder a "Gestión de Estudiantes" para ver la lista completa
3. Probar filtros y búsqueda en la gestión de estudiantes
4. Acceder a "Gestión de Profesores" para ver especialidades
5. Hacer clic en "Ver Panel Corporativo" para acceder al dashboard empresarial

### 3. Dashboard de Estudiante  
**Ubicación:** `/dashboard/student`

**Información mostrada:**
- Datos personales del estudiante (email, DNI, nivel académico)
- Próximas clases programadas con detalles de profesor, horario y duración
- Estado de pagos con historial de mensualidades
- Progreso académico por idioma con barras de avance visual

**Características destacadas:**
- Datos simulados realistas para demostración
- Interfaz intuitiva con iconos explicativos
- Información actualizada del progreso por idioma

### 4. Dashboard de Profesor
**Ubicación:** `/dashboard/teacher`

**Funcionalidades implementadas:**
- Información personal y estadísticas del profesor
- Clases programadas para el día actual con estados (completada, programada, pendiente)
- Lista de estudiantes asignados con progreso individual
- Métricas de rendimiento: calificación promedio, ganancias mensuales, estudiantes activos

**Datos mostrados:**
- Clases individuales y grupales diferenciadas
- Progreso detallado de cada estudiante
- Estadísticas de rendimiento del profesor

### 5. Panel Corporativo
**Ubicación:** `/dashboard/company`
**Acceso:** A través del botón "Ver Panel Corporativo" en el dashboard de administrador

**Contenido empresarial:**
- Información general de la empresa y plan contratado
- Lista de empleados inscritos con progreso individual
- Pagos corporativos mensuales con estado de cada facturación
- Estadísticas generales de la empresa y métricas de progreso

## Características Técnicas Implementadas

### Autenticación y Seguridad
- Sistema de login seguro con validación de credenciales
- Rutas protegidas por rol de usuario
- Redirección automática según permisos
- Manejo de sesiones y logout seguro

### Interfaz de Usuario
- Diseño responsive adaptado a diferentes pantallas
- Iconos de React Icons para mejor experiencia visual
- Cards informativas con datos organizados
- Barras de progreso y elementos visuales informativos

### Datos de Demostración
- Mock data realista para todas las funcionalidades
- Información coherente entre diferentes secciones
- Datos actualizados que simulan un sistema en producción

## Notas para la Demostración

### Flujo Sugerido de Presentación
1. **Inicio:** Mostrar la página principal y proceso de login
2. **Admin:** Demostrar capacidades administrativas completas
3. **Estudiante:** Mostrar experiencia del usuario final
4. **Profesor:** Destacar herramientas para educadores  
5. **Corporativo:** Presentar solución empresarial

### Puntos Destacados
- Todos los dashboards son completamente funcionales
- Los datos mostrados son coherentes y realistas
- La navegación es intuitiva y no requiere explicación adicional
- El sistema maneja correctamente los diferentes roles y permisos

### Limitaciones Actuales
- Los datos son simulados (mock data) para propósitos de demostración
- Algunas funcionalidades avanzadas están preparadas para futura implementación
- El sistema está optimizado para demostración, no para producción final

## Contacto Técnico
Para consultas sobre la implementación técnica o modificaciones del sistema, contactar al equipo de desarrollo.

---
*Manual creado para la demostración del sistema Lingua Academy - Versión Demo*