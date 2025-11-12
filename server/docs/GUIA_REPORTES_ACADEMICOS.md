# Academic Reports API Guide

Complete documentation for academic report generation and management endpoints.

## Overview

The Academic Reports module generates and manages student performance reports including attendance, evaluations, grades, and progress tracking.

## Base URL

```
/api/reportes-academicos
```

## Authentication

All endpoints require authentication via JWT token.

## Endpoints

### 1. Generate Report

**POST** `/generar`

Generates new academic report for a student.

**Access:** Teacher, Admin

**Request:**
```json
{
  "estudianteId": "student_id",
  "cursoId": "course_id",
  "periodo": "2025-Q1",
  "horasAsistidas": 40,
  "horasTotales": 50,
  "progreso": 80,
  "evaluaciones": [
    {
      "tipo": "examen",
      "nombre": "Midterm",
      "nota": 85,
      "fecha": "2025-02-15"
    }
  ],
  "comentariosProfesor": "Excellent progress",
  "fortalezas": ["Speaking", "Listening"],
  "areasAMejorar": ["Writing"]
}
```

**Response:** 201 Created

### 2. Generate Automatic Reports

**POST** `/generar-automatico/:cursoId`

Generates reports for all students in a course.

**Access:** Admin only

**Response:** Array of created reports

### 3. Get Report by ID

**GET** `/:id`

Gets specific report with all details.

**Access:** Student (own), Teacher, Admin

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "report_id",
    "estudiante": {
      "firstName": "John",
      "lastName": "Doe"
    },
    "curso": {
      "nombre": "English B2"
    },
    "periodo": "2025-Q1",
    "clasesTotales": 50,
    "clasesAsistidas": 45,
    "porcentajeAsistencia": 90,
    "evaluaciones": [],
    "promedioGeneral": 87.5,
    "fechaGeneracion": "2025-03-31"
  }
}
```

### 4. Get Student Reports

**GET** `/estudiante/:estudianteId`

Gets all reports for a student.

**Access:** Student (own), Teacher, Admin

**Query Params:**
- `periodo` (optional): Filter by period
- `estado` (optional): Filter by status
- `cursoId` (optional): Filter by course

**Response:** Array of reports

### 5. Get Course Reports

**GET** `/curso/:cursoId`

Gets all reports for a course.

**Access:** Teacher, Admin

**Query Params:**
- `periodo` (optional)
- `estado` (optional)

**Response:** Array of reports

### 6. Get Period Reports

**GET** `/periodo/:periodo`

Gets all reports for a specific period.

**Access:** Admin only

**Example:** `/periodo/2025-Q1`

**Response:** Array of reports

### 7. Update Report

**PUT** `/:id`

Updates existing report.

**Access:** Teacher, Admin

**Request:**
```json
{
  "progreso": 90,
  "comentariosProfesor": "Great improvement",
  "observaciones": "Student shows dedication"
}
```

**Response:** Updated report

### 8. Add Evaluation

**POST** `/:id/evaluacion`

Adds evaluation to report.

**Access:** Teacher, Admin

**Request:**
```json
{
  "tipo": "examen",
  "nota": 92,
  "fecha": "2025-03-15",
  "comentarios": "Excellent performance"
}
```

**Response:** 201 Created

### 9. Get Student Statistics

**GET** `/estudiante/:estudianteId/estadisticas`

Gets general statistics based on all student reports.

**Access:** Student (own), Teacher, Admin

**Response:**
```json
{
  "success": true,
  "data": {
    "totalReportes": 5,
    "promedioAsistencia": 92.3,
    "promedioCalificaciones": 87.8,
    "cursosAprobados": 4,
    "cursosReprobados": 0
  }
}
```

### 10. Get Course Summary

**GET** `/curso/:cursoId/resumen`

Gets summary with all students in course.

**Access:** Teacher, Admin

**Response:**
```json
{
  "success": true,
  "data": {
    "totalEstudiantes": 25,
    "promedioAsistencia": 88.5,
    "promedioCalificaciones": 85.2,
    "estudiantesAprobados": 23,
    "estudiantesReprobados": 2
  }
}
```

### 11. Export to PDF

**GET** `/:id/exportar-pdf`

Exports report to PDF format.

**Access:** Student (own), Teacher, Admin

**Response:** PDF file download

### 12. Export to Excel

**GET** `/:id/exportar-excel`

Exports report to Excel format.

**Access:** Student (own), Teacher, Admin

**Response:** Excel file download

## Auto-Calculations

The system automatically calculates:
- **Attendance Percentage:** `(clasesAsistidas / clasesTotales) * 100`
- **Average Grade:** Sum of all evaluation grades / number of evaluations

## Error Responses

```json
{
  "success": false,
  "error": "Error message"
}
```

## Integration Points

### With Lorena (Courses & Classes)
```javascript
// TODO: Replace with actual service calls
const progreso = await cursosService.calcularProgresoCurso(cursoId, estudianteId);
const asistencia = await clasesService.getAsistenciaEstudiante(estudianteId, cursoId);
```

### With Romina (Infrastructure)
- Uses authenticateToken middleware
- Uses requireRole for access control

## Thunder Client Examples

**Generate Report:**
```
POST http://localhost:5000/api/reportes-academicos/generar
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "estudianteId": "{{studentId}}",
  "cursoId": "{{courseId}}",
  "periodo": "2025-Q1",
  "horasAsistidas": 40,
  "horasTotales": 50
}
```

**Get Student Reports:**
```
GET http://localhost:5000/api/reportes-academicos/estudiante/{{studentId}}?periodo=2025-Q1
Authorization: Bearer {{token}}
```

**Export to PDF:**
```
GET http://localhost:5000/api/reportes-academicos/{{reportId}}/exportar-pdf
Authorization: Bearer {{token}}
```

**Add Evaluation:**
```
POST http://localhost:5000/api/reportes-academicos/{{reportId}}/evaluacion
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "tipo": "examen",
  "nota": 90,
  "fecha": "2025-03-15"
}
```
