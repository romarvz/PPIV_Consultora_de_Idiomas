# Profiles API Guide

Complete documentation for student and teacher profile management endpoints.

## Overview

The Profiles module manages extended student information including preferences, certificates, statistics, and course history. It complements the base user data with detailed academic tracking.

## Base URL

```
/api/perfiles
```

## Authentication

All endpoints require authentication via JWT token:
```
Authorization: Bearer <token>
```

## Endpoints

### 1. Get Student Profile

**GET** `/estudiante/:id`

Gets complete student profile with all related data.

**Access:** Student (own), Teacher, Admin

**Response:**
```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "usuario": "user_id",
    "cursosActivos": [],
    "historialCursos": [],
    "certificados": [],
    "preferencias": {},
    "estadisticas": {
      "horasTotales": 0,
      "asistenciaPromedio": 0,
      "cursosCompletados": 0,
      "promedioCalificaciones": 0
    }
  }
}
```

### 2. Create Student Profile

**POST** `/estudiante/:id`

Creates or initializes student profile.

**Access:** Admin only

**Response:** 201 Created

### 3. Get Preferences

**GET** `/estudiante/:id/preferencias`

Gets student scheduling and learning preferences.

**Access:** Student (own), Admin

**Response:**
```json
{
  "success": true,
  "data": {
    "horarios": [
      {
        "dia": "lunes",
        "horaInicio": "14:00",
        "horaFin": "18:00"
      }
    ],
    "modalidad": "presencial",
    "idiomasInteres": ["ingles", "frances"]
  }
}
```

### 4. Update Preferences

**PUT** `/estudiante/:id/preferencias`

Updates student preferences.

**Access:** Student (own), Admin

**Request:**
```json
{
  "horarios": [
    {
      "dia": "martes",
      "horaInicio": "10:00",
      "horaFin": "14:00"
    }
  ],
  "modalidad": "virtual",
  "idiomasInteres": ["ingles"]
}
```

### 5. Get Certificates

**GET** `/estudiante/:id/certificados`

Gets all student certificates.

**Access:** Student (own), Teacher, Admin

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "curso": "course_id",
      "idioma": "ingles",
      "nivel": "B2",
      "fechaEmision": "2025-01-15",
      "codigoVerificacion": "CERT-ABC123"
    }
  ]
}
```

### 6. Add Certificate

**POST** `/estudiante/:id/certificados`

Adds new certificate to student.

**Access:** Admin, Teacher

**Request:**
```json
{
  "cursoId": "course_id",
  "idioma": "ingles",
  "nivel": "B2"
}
```

**Response:** 201 Created

### 7. Verify Certificate

**GET** `/certificado/verificar/:codigo`

Verifies certificate authenticity by code.

**Access:** Public (no auth required)

**Response:**
```json
{
  "success": true,
  "data": {
    "valido": true,
    "estudiante": "John Doe",
    "idioma": "ingles",
    "nivel": "B2",
    "fechaEmision": "2025-01-15"
  }
}
```

### 8. Get Statistics

**GET** `/estudiante/:id/estadisticas`

Gets student performance statistics.

**Access:** Student (own), Teacher, Admin

**Response:**
```json
{
  "success": true,
  "data": {
    "horasTotales": 120,
    "asistenciaPromedio": 92.5,
    "cursosCompletados": 3,
    "promedioCalificaciones": 87.3
  }
}
```

### 9. Update Statistics

**PUT** `/estudiante/:id/estadisticas/actualizar`

Recalculates student statistics.

**Access:** Admin only

**Response:** Updated statistics

### 10. Get Course History

**GET** `/estudiante/:id/historial`

Gets complete course history.

**Access:** Student (own), Teacher, Admin

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "curso": "course_id",
      "fechaInicio": "2024-09-01",
      "fechaFin": "2024-12-15",
      "progreso": 100,
      "calificacionFinal": 88,
      "estado": "aprobado"
    }
  ]
}
```

### 11. Add Course to History

**POST** `/estudiante/:id/historial`

Adds course to student history.

**Access:** Admin only

**Request:**
```json
{
  "cursoId": "course_id",
  "fechaInicio": "2025-01-10",
  "fechaFin": "2025-06-20",
  "progreso": 100,
  "calificacionFinal": 90,
  "estado": "aprobado"
}
```

### 12. Get Teacher Profile

**GET** `/profesor/:id`

Gets teacher public profile.

**Access:** All authenticated users

**Response:**
```json
{
  "success": true,
  "data": {
    "firstName": "Jane",
    "lastName": "Smith",
    "especialidades": ["ingles", "frances"],
    "cursosActivos": []
  }
}
```

## Error Responses

```json
{
  "success": false,
  "error": "Error message"
}
```

**Common Status Codes:**
- 400: Bad Request (missing required fields)
- 403: Forbidden (insufficient permissions)
- 404: Not Found
- 500: Internal Server Error

## Integration Points

### With Lorena (Courses)
- Course history populated from Curso model
- Active courses tracked in cursosActivos array
- Certificate generation linked to course completion

### With Ayelen (Payments)
- Statistics can be used for payment verification
- Course completion triggers payment reconciliation

### With Romina (Infrastructure)
- Uses authenticateToken middleware
- Uses requireRole for access control
- Follows shared response handler pattern

## Thunder Client Examples

**Get Student Profile:**
```
GET http://localhost:5000/api/perfiles/estudiante/{{studentId}}
Authorization: Bearer {{token}}
```

**Update Preferences:**
```
PUT http://localhost:5000/api/perfiles/estudiante/{{studentId}}/preferencias
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "modalidad": "virtual",
  "idiomasInteres": ["ingles"]
}
```

**Add Certificate:**
```
POST http://localhost:5000/api/perfiles/estudiante/{{studentId}}/certificados
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "cursoId": "{{courseId}}",
  "idioma": "ingles",
  "nivel": "B2"
}
```
