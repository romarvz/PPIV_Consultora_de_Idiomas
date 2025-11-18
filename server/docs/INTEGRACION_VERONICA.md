# Integration Guide - Verónica's Modules

Guide for team members to integrate with Profiles and Reports modules.

## Overview

This guide explains how to integrate with the Profiles and Reports services from other modules.

## Module Structure

```
Verónica's Modules:
├── Profiles (perfilesService.js)
├── Academic Reports (reportesAcademicosService.js)
└── Financial Reports (reportesFinancierosService.js)
```

## Integration with Lorena (Courses & Classes)

### From Your Code to Verónica's Services

**Update Student Profile After Course Completion:**

```javascript
const perfilesService = require('./perfilesService');

// When student completes a course
await perfilesService.agregarCursoHistorial(estudianteId, {
  cursoId: curso._id,
  fechaInicio: curso.fechaInicio,
  fechaFin: new Date(),
  progreso: 100,
  calificacionFinal: notaFinal,
  estado: 'aprobado'
});

// Update statistics
await perfilesService.actualizarEstadisticas(estudianteId);
```

**Generate Certificate:**

```javascript
// After course approval
await perfilesService.agregarCertificado(estudianteId, {
  cursoId: curso._id,
  idioma: curso.idioma,
  nivel: curso.nivel
});
```

### From Verónica's Code to Your Services

**In reportesAcademicosService.js, replace TODO comments:**

```javascript
// Current (TODO):
// const progreso = await cursosService.calcularProgresoCurso(cursoId, estudianteId);

// Replace with your actual service:
const cursosService = require('./cursosService');
const clasesService = require('./clasesService');

const progreso = await cursosService.calcularProgresoCurso(cursoId, estudianteId);
const asistencia = await clasesService.getAsistenciaEstudiante(estudianteId, cursoId);
const horasTotales = await clasesService.getHorasTotalesCurso(cursoId);
```

**Expected Function Signatures:**

```javascript
// cursosService.js
exports.calcularProgresoCurso = async (cursoId, estudianteId) => {
  // Returns: { progreso: Number (0-100) }
};

// clasesService.js
exports.getAsistenciaEstudiante = async (estudianteId, cursoId) => {
  // Returns: { clasesAsistidas: Number, clasesTotales: Number }
};

exports.getHorasTotalesCurso = async (cursoId) => {
  // Returns: Number (total hours)
};
```

## Integration with Ayelen (Payments & Invoices)

### From Your Code to Verónica's Services

**Update Financial Report with Payment Data:**

```javascript
const reportesFinancierosService = require('./reportesFinancierosService');

// After processing payments
const periodo = '2025-Q1';
await reportesFinancierosService.actualizarReporte(periodo, {
  totalIngresos: totalIngresos,
  ingresosPorConcepto: {
    matriculas: ingresosMatriculas,
    mensualidades: ingresosMensualidades,
    materiales: ingresosMateriales
  }
});
```

**Add Student with Debt:**

```javascript
// When detecting overdue payment
await reportesFinancierosService.agregarEstudianteConDeuda(
  periodo,
  estudianteId,
  montoDeuda,
  diasVencido
);
```

### From Verónica's Code to Your Services

**In reportesFinancierosService.js, replace TODO comments:**

```javascript
// Current (TODO):
// const ingresos = await pagosService.calcularIngresosPorConcepto(fechaInicio, fechaFin);

// Replace with your actual service:
const pagosService = require('./pagosService');
const facturasService = require('./facturasService');

const ingresos = await pagosService.calcularIngresosPorConcepto(fechaInicio, fechaFin);
const deudas = await pagosService.obtenerEstudiantesConDeuda();
const saldoPendiente = await pagosService.obtenerSaldoPendiente();
```

**Expected Function Signatures:**

```javascript
// pagosService.js
exports.calcularIngresosPorConcepto = async (fechaInicio, fechaFin) => {
  // Returns: { matriculas: Number, mensualidades: Number, materiales: Number, otros: Number }
};

exports.obtenerEstudiantesConDeuda = async () => {
  // Returns: [{ estudiante: ObjectId, montoDeuda: Number, mesesAtrasados: Number }]
};

exports.obtenerSaldoPendiente = async () => {
  // Returns: Number (total pending balance)
};

// facturasService.js
exports.generarFacturaMensual = async (estudianteId, mes) => {
  // Returns: Factura object
};
```

## Integration with Romina (Infrastructure)

### Already Integrated

The following are already using Romina's infrastructure:

**Authentication Middleware:**
```javascript
const { authenticateToken, requireRole } = require('../middleware/authMiddlewareNew');

// In routes
router.use(authenticateToken);
router.post('/endpoint', requireRole(['admin']), controller.method);
```

**Response Handlers:**
```javascript
// Currently using temporary helpers
// TODO: Replace with Romina's when available
const { sendSuccess, sendError } = require('../shared/helpers/responseHandler');
```

### What Romina Needs to Do

**Uncomment Routes in index.js:**

```javascript
// Current (commented):
// const perfilesRoutes = require('./routes/perfiles');
// app.use('/api/perfiles', perfilesRoutes);

// Uncomment these lines:
const perfilesRoutes = require('./routes/perfiles');
const reportesAcademicosRoutes = require('./routes/reportes-academicos');
const reportesFinancierosRoutes = require('./routes/reportes-financieros');

app.use('/api/perfiles', perfilesRoutes);
app.use('/api/reportes-academicos', reportesAcademicosRoutes);
app.use('/api/reportes-financieros', reportesFinancierosRoutes);
```

## Service Function Reference

### perfilesService.js

```javascript
// Get or create profile
obtenerOCrearPerfil(estudianteId)

// Get complete profile with populated data
obtenerPerfilCompleto(estudianteId)

// Update preferences
actualizarPreferencias(estudianteId, preferencias)

// Add certificate
agregarCertificado(estudianteId, { cursoId, idioma, nivel })

// Update statistics
actualizarEstadisticas(estudianteId, estadisticas)

// Add course to history
agregarCursoHistorial(estudianteId, cursoData)

// Get teacher profile
obtenerPerfilProfesor(profesorId)
```

### reportesAcademicosService.js

```javascript
// Generate report
generarReporteAcademico({
  estudianteId,
  cursoId,
  periodo,
  horasAsistidas,
  horasTotales,
  generadoPorId
})

// Get report by ID
obtenerReportePorId(reporteId)

// Get student reports
obtenerReportesPorEstudiante(estudianteId, filters)

// Add evaluation
agregarEvaluacion(reporteId, evaluacion)

// Get student statistics
obtenerEstadisticasEstudiante(estudianteId)
```

### reportesFinancierosService.js

```javascript
// Generate report
generarReporteFinanciero({
  periodo,
  fechaInicio,
  fechaFin,
  totalIngresos,
  totalGastos,
  generadoPorId
})

// Get report by period
obtenerReportePorPeriodo(periodo)

// Compare periods
compararPeriodos(periodo1, periodo2)

// Calculate trends
calcularTendencias(cantidad)

// Add student with debt
agregarEstudianteConDeuda(periodo, estudianteId, montoDeuda, diasVencido)
```

## Error Handling

All services throw errors that should be caught:

```javascript
try {
  const perfil = await perfilesService.obtenerPerfilCompleto(estudianteId);
} catch (error) {
  console.error('Error getting profile:', error);
  // Handle error appropriately
}
```

## Data Formats

### Dates
Use ISO 8601 format: `YYYY-MM-DD` or JavaScript Date objects

### Periods
- Quarterly: `YYYY-Q1`, `YYYY-Q2`, `YYYY-Q3`, `YYYY-Q4`
- Monthly: `YYYY-MM`

### Languages
Valid values: `ingles`, `frances`, `aleman`, `italiano`, `portugues`, `espanol`

### Levels
Valid values: `A1`, `A2`, `B1`, `B2`, `C1`, `C2`

### Course States
Valid values: `en_curso`, `aprobado`, `reprobado`, `abandonado`

## Testing Integration

After integration, test these scenarios:

1. **Course Completion Flow:**
   - Student completes course
   - Profile history updated
   - Certificate generated
   - Statistics recalculated

2. **Report Generation Flow:**
   - Academic report generated with real course data
   - Attendance calculated from classes
   - Grades populated from evaluations

3. **Financial Flow:**
   - Payments processed
   - Financial report updated
   - Delinquency tracked
   - Projections calculated

## Contact

For questions about integration, refer to:
- API Documentation: `docs/GUIA_*.md`
- Module Summary: `VERONICA-MODULE-SUMMARY.md`
- Test Examples: `__tests__/`
