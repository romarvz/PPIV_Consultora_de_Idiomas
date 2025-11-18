# Script de Prueba para Sistema de Asistencia

Este script permite crear un curso de prueba con clases pasadas para probar el sistema de alertas de asistencia sin cambiar la fecha del sistema.

## 🚀 Uso Rápido

### Opción 1: Usar el Script Automático (Recomendado)

```bash
node server/scripts/create-test-course-with-attendance.js
```

Este script:
- Crea un curso de 1 semana (3 horas totales)
- Crea 3 clases en el pasado (hace 7 días)
- Inscribe estudiantes existentes o crea estudiantes de prueba
- Registra asistencia de prueba con diferentes escenarios:
  - Estudiante 1: 100% asistencia (regular ✅)
  - Estudiante 2: 66.7% asistencia (cerca del límite ⚠️)
  - Estudiante 3: 33.3% asistencia (bajo ❌)

### Opción 2: Crear Manualmente desde la Interfaz

Si prefieres crear el curso manualmente desde la interfaz, primero configura las variables de entorno para relajar las validaciones:

#### Windows (PowerShell)
```powershell
$env:ALLOW_PAST_CLASSES="true"
$env:ALLOW_SHORT_COURSES="true"
$env:ALLOW_MORE_SCHEDULES="true"
npm start
```

#### Windows (CMD)
```cmd
set ALLOW_PAST_CLASSES=true
set ALLOW_SHORT_COURSES=true
set ALLOW_MORE_SCHEDULES=true
npm start
```

#### Linux/Mac
```bash
export ALLOW_PAST_CLASSES=true
export ALLOW_SHORT_COURSES=true
export ALLOW_MORE_SCHEDULES=true
npm start
```

#### O crear un archivo `.env` en la raíz del proyecto:
```env
ALLOW_PAST_CLASSES=true
ALLOW_SHORT_COURSES=true
ALLOW_MORE_SCHEDULES=true
```

Luego reinicia el servidor.

## 📋 Variables de Entorno para Pruebas

| Variable | Descripción | Valores |
|----------|-------------|---------|
| `ALLOW_PAST_CLASSES` | Permite crear clases con fechas pasadas | `true` / `false` |
| `ALLOW_SHORT_COURSES` | Permite cursos con menos de 10 horas | `true` / `false` |
| `ALLOW_MORE_SCHEDULES` | Permite más de 3 horarios por curso (hasta 10) | `true` / `false` |

⚠️ **IMPORTANTE**: Estas variables solo deben usarse en desarrollo. **NO** las configures en producción.

## ✅ Qué Probar Después de Ejecutar el Script

1. **Dashboard del Profesor:**
   - Ir al dashboard del profesor
   - Buscar el curso "Curso de Prueba - Asistencia"
   - Verás una alerta amarilla en la parte superior mostrando estudiantes cerca del límite

2. **Lista de Estudiantes:**
   - En la gestión de cursos, hacer clic en "Estudiantes" para ese curso
   - Verás la columna "Asistencia" con:
     - Porcentaje de asistencia con colores
     - Badge de alerta para estudiantes cerca del límite
     - Faltas restantes antes del límite

3. **Registrar Más Asistencia:**
   - Puedes abrir el modal de clases del curso
   - Registrar asistencia adicional para probar diferentes escenarios

## 🧹 Limpiar Datos de Prueba

Si quieres eliminar el curso de prueba creado:

```bash
# Conectarse a MongoDB y ejecutar:
db.cursos.deleteMany({ nombre: "Curso de Prueba - Asistencia" })
db.clases.deleteMany({ curso: ObjectId("ID_DEL_CURSO") })
db.inscripciones.deleteMany({ curso: ObjectId("ID_DEL_CURSO") })
```

O simplemente eliminarlo desde la interfaz de administración.

## 🔍 Problemas Comunes

### "No se encontró ningún profesor"
Solución: Primero crea un profesor desde la interfaz de administración.

### "No se encontraron estudiantes"
Solución: El script creará automáticamente 3 estudiantes de prueba. O puedes crear estudiantes primero desde la interfaz.

### "Error conectando a MongoDB"
Solución: Verifica que MongoDB esté corriendo y que la variable `MONGODB_URI` en `.env` sea correcta.

## 📝 Notas

- El script crea clases marcadas como "completadas" para que cuenten en las estadísticas
- Las fechas se establecen 7 días en el pasado para simular un curso que ya pasó
- El curso se crea con estado "activo" para que aparezca en los dashboards

