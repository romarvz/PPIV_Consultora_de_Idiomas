# Refactorización según Buenas Prácticas

## Problemas Identificados

### Backend - Controllers con Lógica de Negocio

#### 1. `server/controllers/studentController.js`

**Problema:** El controller `getStudents()` construye filtros MongoDB directamente (líneas 32-61)

```javascript
// ❌ INCORRECTO - Lógica de negocio en el controller
const filters = { role: 'estudiante' };
if (search) {
  filters.$or = [
    { firstName: { $regex: search, $options: 'i' } },
    { lastName: { $regex: search, $options: 'i' } },
    // ...
  ];
}
```

**Solución:** Mover la construcción de filtros a `userService.listarEstudiantes(filtros, opciones)`

#### 2. `server/controllers/studentController.js`

**Problema:** `getStudentsStats()` tiene agregaciones MongoDB directamente (líneas 296-338)

```javascript
// ❌ INCORRECTO - Agregaciones en el controller
const levelStats = await userService.getAggregateStats([
  { $match: { role: 'estudiante', isActive: true } },
  { $group: { _id: '$nivel', count: { $sum: 1 } } },
  // ...
]);
```

**Solución:** Crear `userService.obtenerEstadisticasEstudiantes()`

#### 3. `server/controllers/teacherController.js`

**Problema:** `getTeachers()` tiene lógica de filtros compleja directamente (líneas 32-76)

```javascript
// ❌ INCORRECTO - Filtros complejos en el controller
if (status === 'activo') {
  filters.$and = filters.$and || [];
  filters.$and.push({
    $or: [
      { isActive: true },
      { condicion: 'activo' }
    ]
  });
}
```

**Solución:** Mover a `userService.listarProfesores(filtros, opciones)`

#### 4. `server/controllers/teacherController.js`

**Problema:** `getTeachersStats()` tiene agregaciones MongoDB directamente (líneas 407-468)

**Solución:** Crear `userService.obtenerEstadisticasProfesores()`

#### 5. `server/controllers/teacherController.js`

**Problema:** `deleteTeacher()` hace query directa a `Curso` (línea 309)

```javascript
// ❌ INCORRECTO - Query directa en el controller
const { Curso } = require('../models');
const cursosAsignados = await Curso.find({ profesor: id })
```

**Solución:** Mover a `cursosService.verificarCursosAsignados(profesorId)`

---

### Frontend - Componentes Monolíticos

#### 1. `client/src/pages/Dashboard/StudentDashboard.jsx` - **851 líneas**

**Problema:** Componente muy grande con múltiples responsabilidades:
- Gestión de estado de clases, cursos, pagos
- Lógica de carga de datos
- Renderizado de múltiples secciones
- Manejo de modales

**Solución:** Dividir en:
- `StudentDashboard.jsx` (componente principal, ~150 líneas)
- `StudentCoursesSection.jsx` (sección de cursos)
- `StudentClassesSection.jsx` (sección de clases)
- `StudentPaymentsSection.jsx` (sección de pagos)
- `hooks/useStudentData.js` (lógica de carga de datos)

#### 2. `client/src/components/StudentsManagement.jsx` - **1080 líneas**

**Problema:** Componente monolítico con:
- Gestión de estudiantes
- Filtros y búsqueda
- Estadísticas
- Tabla de riesgo
- Modales de edición/registro

**Solución:** Dividir en:
- `StudentsManagement.jsx` (componente principal, ~200 líneas)
- `StudentsTable.jsx` (tabla de estudiantes)
- `StudentsFilters.jsx` (filtros)
- `StudentsStats.jsx` (estadísticas)
- `RiskStudentsTable.jsx` (tabla de riesgo)
- `hooks/useStudentsData.js` (lógica de datos)

#### 3. `client/src/pages/Dashboard/ReportsDashboard.jsx` - **996 líneas**

**Problema:** Componente grande con:
- Dos tabs (académico y financiero)
- Lógica de exportación
- Filtros y ordenamiento
- Gráficos y tablas

**Solución:** Dividir en:
- `ReportsDashboard.jsx` (componente principal, ~150 líneas)
- `AcademicReportTab.jsx` (tab académico)
- `FinancialReportTab.jsx` (tab financiero)
- `ReportFilters.jsx` (filtros compartidos)
- `hooks/useReportsData.js` (lógica de datos)

---

## Plan de Refactorización

### Fase 1: Backend - Services

1. **Crear `server/services/studentService.js`**
   - `listarEstudiantes(filtros, opciones)` - Construcción de filtros
   - `obtenerEstadisticasEstudiantes()` - Agregaciones

2. **Extender `server/services/userService.js`**
   - `listarProfesores(filtros, opciones)` - Construcción de filtros
   - `obtenerEstadisticasProfesores()` - Agregaciones

3. **Extender `server/services/cursosService.js`**
   - `verificarCursosAsignados(profesorId)` - Verificación de cursos

4. **Refactorizar controllers**
   - `studentController.js` - Usar `studentService`
   - `teacherController.js` - Usar `userService` y `cursosService`

### Fase 2: Frontend - Componentes Pequeños

1. **Refactorizar `StudentDashboard`**
   - Extraer secciones a componentes
   - Crear hook personalizado para datos

2. **Refactorizar `StudentsManagement`**
   - Dividir en componentes más pequeños
   - Separar lógica de presentación

3. **Refactorizar `ReportsDashboard`**
   - Separar tabs en componentes
   - Extraer lógica de exportación

---

## Ejemplos de Código Refactorizado

### Backend - Service Pattern

```javascript
// server/services/studentService.js
const BaseUser = require('../models/BaseUser');
const userService = require('./userService');

exports.listarEstudiantes = async (filtros = {}, opciones = {}) => {
  const query = { role: 'estudiante' };
  
  // Construcción de filtros
  if (filtros.search) {
    query.$or = [
      { firstName: { $regex: filtros.search, $options: 'i' } },
      { lastName: { $regex: filtros.search, $options: 'i' } },
      { email: { $regex: filtros.search, $options: 'i' } },
      { dni: { $regex: filtros.search, $options: 'i' } }
    ];
  }
  
  if (filtros.status === 'active') {
    query.isActive = true;
  } else if (filtros.status === 'inactive') {
    query.isActive = false;
  }
  
  if (filtros.nivel) {
    query.nivel = filtros.nivel;
  }
  
  if (filtros.condicion) {
    query.condicion = filtros.condicion;
  }
  
  const defaultOptions = {
    page: 1,
    limit: 10,
    sort: { lastName: 1, firstName: 1 },
    select: '-password'
  };
  
  return await userService.findUsers(query, { ...defaultOptions, ...opciones });
};

exports.obtenerEstadisticasEstudiantes = async () => {
  const totalStudents = await userService.countUsers({ role: 'estudiante' });
  const activeStudents = await userService.countUsers({ role: 'estudiante', isActive: true });
  const inactiveStudents = await userService.countUsers({ role: 'estudiante', isActive: false });
  
  const levelStats = await userService.getAggregateStats([
    { $match: { role: 'estudiante', isActive: true } },
    { $group: { _id: '$nivel', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);
  
  const conditionStats = await userService.getAggregateStats([
    { $match: { role: 'estudiante', isActive: true } },
    { $group: { _id: '$condicion', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);
  
  return {
    overview: {
      total: totalStudents,
      active: activeStudents,
      inactive: inactiveStudents
    },
    byLevel: levelStats,
    byCondition: conditionStats
  };
};
```

```javascript
// server/controllers/studentController.js - REFACTORIZADO
const studentService = require('../services/studentService');

const getStudents = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status, nivel, condicion } = req.query;
    
    const filtros = { search, status, nivel, condicion };
    const opciones = {
      page: parseInt(page),
      limit: parseInt(limit)
    };
    
    const result = await studentService.listarEstudiantes(filtros, opciones);
    
    res.json({
      success: true,
      message: 'Estudiantes obtenidos exitosamente',
      data: {
        students: result.docs,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.totalDocs,
          pages: result.totalPages,
          hasNext: result.hasNextPage,
          hasPrev: result.hasPrevPage
        }
      }
    });
  } catch (error) {
    console.error('Error en getStudents:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      code: 'INTERNAL_ERROR'
    });
  }
};

const getStudentsStats = async (req, res) => {
  try {
    const estadisticas = await studentService.obtenerEstadisticasEstudiantes();
    
    res.json({
      success: true,
      message: 'Estadísticas de estudiantes obtenidas exitosamente',
      data: estadisticas
    });
  } catch (error) {
    console.error('Error en getStudentsStats:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      code: 'INTERNAL_ERROR'
    });
  }
};
```

### Frontend - Componente Pequeño

```javascript
// client/src/components/students/StudentsTable.jsx
import React from 'react';
import { FaEdit, FaEye } from 'react-icons/fa';

const StudentsTable = ({ 
  students, 
  onEdit, 
  onView, 
  loading 
}) => {
  if (loading) {
    return <div>Cargando...</div>;
  }
  
  return (
    <table>
      <thead>
        <tr>
          <th>Nombre</th>
          <th>Email</th>
          <th>Nivel</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {students.map(student => (
          <tr key={student._id}>
            <td>{student.firstName} {student.lastName}</td>
            <td>{student.email}</td>
            <td>{student.nivel}</td>
            <td>
              <button onClick={() => onEdit(student)}>
                <FaEdit />
              </button>
              <button onClick={() => onView(student)}>
                <FaEye />
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default StudentsTable;
```

```javascript
// client/src/components/students/StudentsFilters.jsx
import React from 'react';

const StudentsFilters = ({ filters, onFilterChange }) => {
  return (
    <div className="filters">
      <input
        type="text"
        placeholder="Buscar..."
        value={filters.search}
        onChange={(e) => onFilterChange('search', e.target.value)}
      />
      <select
        value={filters.status}
        onChange={(e) => onFilterChange('status', e.target.value)}
      >
        <option value="">Todos</option>
        <option value="active">Activos</option>
        <option value="inactive">Inactivos</option>
      </select>
      {/* Más filtros... */}
    </div>
  );
};

export default StudentsFilters;
```

```javascript
// client/src/components/StudentsManagement.jsx - REFACTORIZADO
import React, { useState, useEffect } from 'react';
import StudentsTable from './students/StudentsTable';
import StudentsFilters from './students/StudentsFilters';
import StudentsStats from './students/StudentsStats';
import RiskStudentsTable from './students/RiskStudentsTable';
import { useStudentsData } from '../hooks/useStudentsData';

const StudentsManagement = ({ onBack }) => {
  const {
    students,
    stats,
    loading,
    filters,
    pagination,
    setFilters,
    setPagination,
    fetchStudents,
    fetchStats
  } = useStudentsData();
  
  const [showRiskTable, setShowRiskTable] = useState(false);
  
  useEffect(() => {
    fetchStudents();
    fetchStats();
  }, [filters, pagination.page]);
  
  return (
    <div>
      <StudentsStats stats={stats} />
      <StudentsFilters 
        filters={filters} 
        onFilterChange={(key, value) => 
          setFilters(prev => ({ ...prev, [key]: value }))
        } 
      />
      <StudentsTable 
        students={students}
        loading={loading}
        onEdit={(student) => {/* ... */}}
      />
      <RiskStudentsTable 
        show={showRiskTable}
        onClose={() => setShowRiskTable(false)}
      />
    </div>
  );
};

export default StudentsManagement;
```

---

## Prioridades

1. **Alta:** Refactorizar `studentController.js` y `teacherController.js` (más crítico para el manual)
2. **Media:** Dividir `StudentsManagement.jsx` (componente más grande)
3. **Media:** Dividir `StudentDashboard.jsx`
4. **Baja:** Dividir `ReportsDashboard.jsx` (menos crítico)

---

## Notas

- Mantener compatibilidad con el código existente durante la refactorización
- Agregar tests unitarios para los nuevos services
- Documentar los cambios en el código
- Revisar que no se rompan funcionalidades existentes

