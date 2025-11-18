# Financial Reports API Guide

Complete documentation for financial report generation and analysis endpoints.

## Overview

The Financial Reports module generates and manages financial reports including income, expenses, profit margins, delinquency tracking, and financial projections.

## Base URL

```
/api/reportes-financieros
```

## Authentication

All endpoints require Admin authentication.

## Endpoints

### 1. Generate Report

**POST** `/generar`

Generates new financial report for a period.

**Access:** Admin only

**Request:**
```json
{
  "periodo": "2025-Q1",
  "fechaInicio": "2025-01-01",
  "fechaFin": "2025-03-31",
  "totalIngresos": 100000,
  "totalGastos": 60000,
  "saldoPendiente": 15000,
  "pagosPendientes": 5,
  "pagosVencidos": 2,
  "ingresosPorConcepto": {
    "matriculas": 30000,
    "mensualidades": 50000,
    "materiales": 20000
  },
  "estudiantesConDeuda": [
    {
      "estudiante": "student_id",
      "montoDeuda": 5000,
      "mesesAtrasados": 2
    }
  ]
}
```

**Response:** 201 Created

### 2. Generate Automatic Report

**POST** `/generar-automatico`

Generates automatic report for current period.

**Access:** Admin only

**Response:** Created report with calculated values

### 3. Get Report by Period

**GET** `/periodo/:periodo`

Gets specific report by period.

**Access:** Admin only

**Example:** `/periodo/2025-Q1` or `/periodo/2025-01`

**Response:**
```json
{
  "success": true,
  "data": {
    "periodo": "2025-Q1",
    "tipoPeriodo": "trimestral",
    "fechaInicio": "2025-01-01",
    "fechaFin": "2025-03-31",
    "ingresosTotales": 100000,
    "gastosTotales": 60000,
    "gananciaNeta": 40000,
    "margenGanancia": 40,
    "deudaTotal": 15000,
    "porcentajeMorosidad": 15,
    "estudiantesConDeuda": []
  }
}
```

### 4. Get Recent Reports

**GET** `/recientes`

Gets most recent reports.

**Access:** Admin only

**Query Params:**
- `limite` (optional, default: 5): Number of reports

**Response:** Array of recent reports

### 5. Get All Reports

**GET** `/`

Gets all reports with optional filters.

**Access:** Admin only

**Query Params:**
- `desde` (optional): Start date
- `hasta` (optional): End date

**Response:** Array of reports

### 6. Update Report

**PUT** `/periodo/:periodo`

Updates existing report.

**Access:** Admin only

**Request:**
```json
{
  "totalIngresos": 105000,
  "totalGastos": 62000,
  "notas": "Updated with final numbers"
}
```

**Response:** Updated report

### 7. Add Student with Debt

**POST** `/periodo/:periodo/deuda`

Adds student with debt to report.

**Access:** Admin only

**Request:**
```json
{
  "estudianteId": "student_id",
  "montoDeuda": 5000,
  "diasVencido": 30
}
```

**Response:** Updated report

### 8. Compare Periods

**GET** `/comparar/:periodo1/:periodo2`

Compares two financial periods.

**Access:** Admin only

**Example:** `/comparar/2025-Q1/2025-Q2`

**Response:**
```json
{
  "success": true,
  "data": {
    "periodo1": {
      "periodo": "2025-Q1",
      "ingresosTotales": 100000,
      "gananciaNeta": 40000
    },
    "periodo2": {
      "periodo": "2025-Q2",
      "ingresosTotales": 120000,
      "gananciaNeta": 50000
    },
    "diferencias": {
      "ingresos": 20000,
      "porcentajeCrecimiento": 20,
      "ganancia": 10000
    }
  }
}
```

### 9. Get Trends

**GET** `/tendencias`

Gets financial trends from recent periods.

**Access:** Admin only

**Query Params:**
- `cantidad` (optional, default: 4): Number of periods

**Response:**
```json
{
  "success": true,
  "data": {
    "periodos": ["2024-Q4", "2025-Q1", "2025-Q2"],
    "ingresos": [90000, 100000, 120000],
    "gastos": [55000, 60000, 70000],
    "tendencia": "creciente"
  }
}
```

### 10. Get Delinquency Statistics

**GET** `/morosidad`

Gets delinquency statistics.

**Access:** Admin only

**Response:**
```json
{
  "success": true,
  "data": {
    "totalEstudiantesConDeuda": 8,
    "deudaTotal": 45000,
    "promedioDeuda": 5625,
    "porcentajeMorosidad": 12.5,
    "estudiantesMasAtrasados": []
  }
}
```

### 11. Calculate Projection

**GET** `/proyeccion`

Calculates income projection for next period.

**Access:** Admin only

**Response:**
```json
{
  "success": true,
  "data": {
    "proyeccionIngresos": 125000,
    "basadoEn": "promedio últimos 3 períodos",
    "confianza": "alta"
  }
}
```

### 12. Export to PDF

**GET** `/periodo/:periodo/exportar-pdf`

Exports financial report to PDF.

**Access:** Admin only

**Response:** PDF file download

### 13. Export to Excel

**GET** `/periodo/:periodo/exportar-excel`

Exports financial report to Excel.

**Access:** Admin only

**Response:** Excel file with multiple sheets

## Auto-Calculations

The system automatically calculates:
- **Net Profit:** `ingresosTotales - gastosTotales`
- **Profit Margin:** `(gananciaNeta / ingresosTotales) * 100`
- **Delinquency Rate:** `(deudaTotal / ingresosTotales) * 100`

## Period Formats

- **Quarterly:** `YYYY-Q1`, `YYYY-Q2`, `YYYY-Q3`, `YYYY-Q4`
- **Monthly:** `YYYY-MM` (e.g., `2025-01`)

## Error Responses

```json
{
  "success": false,
  "error": "Error message"
}
```

## Integration Points

### With Ayelen (Payments & Invoices)
```javascript
// TODO: Replace with actual service calls
const ingresos = await pagosService.calcularIngresosPorConcepto(fechaInicio, fechaFin);
const deudas = await pagosService.obtenerEstudiantesConDeuda();
const facturas = await facturasService.generarFacturaMensual();
```

### With Romina (Infrastructure)
- Uses authenticateToken middleware
- Uses requireRole(['admin']) for all endpoints

## Thunder Client Examples

**Generate Report:**
```
POST http://localhost:5000/api/reportes-financieros/generar
Authorization: Bearer {{adminToken}}
Content-Type: application/json

{
  "periodo": "2025-Q1",
  "fechaInicio": "2025-01-01",
  "fechaFin": "2025-03-31",
  "totalIngresos": 100000,
  "totalGastos": 60000
}
```

**Get Report:**
```
GET http://localhost:5000/api/reportes-financieros/periodo/2025-Q1
Authorization: Bearer {{adminToken}}
```

**Compare Periods:**
```
GET http://localhost:5000/api/reportes-financieros/comparar/2025-Q1/2025-Q2
Authorization: Bearer {{adminToken}}
```

**Get Trends:**
```
GET http://localhost:5000/api/reportes-financieros/tendencias?cantidad=6
Authorization: Bearer {{adminToken}}
```

**Export to PDF:**
```
GET http://localhost:5000/api/reportes-financieros/periodo/2025-Q1/exportar-pdf
Authorization: Bearer {{adminToken}}
```
