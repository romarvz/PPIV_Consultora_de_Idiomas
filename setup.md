# Configuración del Sistema Lingua Academy

## Instalación y Configuración

### 1. Instalar dependencias del frontend
```bash
cd client
npm install
```

### 2. Iniciar la aplicación
```bash
cd client
npm run dev
```

## Usuarios de Prueba

El sistema incluye usuarios de prueba para cada rol:

- **Administrador**: admin@linguaacademy.com / 123456
- **Profesor**: profesor@linguaacademy.com / 123456  
- **Estudiante**: estudiante@linguaacademy.com / 123456
- **Coordinador Empresa**: empresa@linguaacademy.com / 123456

## Funcionalidades Implementadas

### Gestión de Estudiantes (CU-EST-01, CU-EST-02)
- ✅ Registro de estudiantes con validaciones
- ✅ Filtrado por estado (Inscripto, Cursando, Abandonado, Graduado)
- ✅ Búsqueda por nombre, apellido o email
- ✅ Validación de email único y campos obligatorios

### Gestión de Cursos (CU-CUR-01, CU-CUR-02)
- ✅ Creación de cursos con código, nombre, modalidad, duración y costo
- ✅ Catálogo visual de cursos disponibles
- ✅ Validación de nombre obligatorio

### Programación de Clases (CU-AGE-01)
- ✅ Programación de clases con fecha, hora, duración y profesor
- ✅ Detección de conflictos de horarios
- ✅ Información sobre recordatorios automáticos por email

### Gestión de Empresas (CU-CIA-01, CU-CIA-02, CU-CIA-03, CU-CIA-04)
- ✅ Registro de empresas con datos completos
- ✅ Gestión de coordinadores
- ✅ Registro de empleados asociados a empresas
- ✅ Baja de empresas y empleados con motivos
- ✅ Validación de CUIT único

### Gestión de Profesores (CU-PROF-01, CU-PROF-02, CU-PROF-03)
- ✅ Registro de profesores con especialidades
- ✅ Actualización de disponibilidad horaria
- ✅ Registro de ausencias con notificaciones
- ✅ Visualización de cursos asignados

### Gestión de Pagos (CU-COB-01, CU-COB-02, CU-PAG-01)
- ✅ Registro de cobros a estudiantes
- ✅ Gestión de pagos a profesores
- ✅ Estados de pago (Pagado, Pendiente, Vencido)
- ✅ Generación de facturas y recibos

### Reportes (CU-REP-01, CU-REP-02, CU-CIA-06, CU-CIA-07, CU-CIA-08)
- ✅ Reporte de progreso académico
- ✅ Reporte de ingresos
- ✅ Reporte de asistencias
- ✅ Cuenta corriente de empresas
- ✅ Desempeño de empleados
- ✅ Exportación en PDF, Excel y CSV

### Autenticación y Seguridad (CU-SEG-01)
- ✅ Sistema de login con roles diferenciados
- ✅ Interfaz adaptada según el tipo de usuario

## Características del Diseño

- **Paleta de colores profesional**: Tonos azules y grises
- **Diseño minimalista y limpio**: Espacios amplios y tipografía clara
- **Iconografía consistente**: Iconos de Lucide React
- **Responsive**: Adaptable a diferentes tamaños de pantalla
- **Navegación intuitiva**: Sidebar con menú claro

## Próximos Pasos

Para completar el sistema se recomienda:

1. Implementar backend con Node.js y MongoDB
2. Integrar autenticación real con JWT
3. Conectar con servicios de email para notificaciones
4. Implementar pasarelas de pago reales
5. Agregar validaciones del lado del servidor
6. Implementar sistema de roles más granular