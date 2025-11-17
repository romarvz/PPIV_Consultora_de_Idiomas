# Guía de Testing - Módulo Financiero

## Descripción

Este directorio contiene las pruebas unitarias y de integración del módulo financiero del sistema PPIV Consultora de Idiomas.

## Estructura de Pruebas

```
__tests__/
├── setup.js                           # Configuración global de tests
├── unit/                             # Pruebas unitarias
│   ├── contador.service.test.js      # Tests del servicio de contadores
│   ├── factura.service.test.js       # Tests del servicio de facturas
│   └── cobro.service.test.js         # Tests del servicio de cobros
└── integration/                      # Pruebas de integración
    ├── facturas.controller.test.js   # Tests de endpoints de facturas
    └── cobros.controller.test.js     # Tests de endpoints de cobros
```

## Tecnologías Utilizadas

- **Jest**: Framework de testing
- **Supertest**: Testing de APIs HTTP
- **MongoDB Memory Server**: Base de datos en memoria para testing

## Instalación de Dependencias

```bash
cd server
npm install --save-dev jest supertest mongodb-memory-server
```

## Comandos de Testing

### Ejecutar todas las pruebas
```bash
npm test
```

### Ejecutar pruebas con watch mode
```bash
npm test -- --watch
```

### Ejecutar pruebas con coverage
```bash
npm test -- --coverage
```

### Ejecutar solo pruebas unitarias
```bash
npm test -- __tests__/unit
```

### Ejecutar solo pruebas de integración
```bash
npm test -- __tests__/integration
```

### Ejecutar un archivo específico
```bash
npm test -- contador.service.test.js
```

## Cobertura de Código

El proyecto tiene configurados umbrales mínimos de cobertura:

- **Branches**: 70%
- **Functions**: 70%
- **Lines**: 70%
- **Statements**: 70%

## Pruebas Unitarias

### Contador Service (15 tests)

**Ubicación:** `__tests__/unit/contador.service.test.js`

Pruebas:
- Generación de números secuenciales para facturas
- Generación de números secuenciales para recibos
- Formato correcto de números (F-00001, RC-00001-00000001)
- Incremento secuencial
- Validación de tipo de documento
- Creación automática de contadores (upsert)
- Operaciones atómicas (prueba de concurrencia)
- Reseteo de contadores

### Factura Service (17 tests)

**Ubicación:** `__tests__/unit/factura.service.test.js`

Pruebas:
- Creación de facturas válidas
- Generación de número de factura tipo B (Consumidor Final)
- Generación de número de factura tipo A (Responsable Inscripto)
- Cálculo de subtotales con múltiples ítems
- Validación de datos requeridos
- Validación de existencia del estudiante
- Validación de ítems (precio y cantidad)
- Números de factura únicos y secuenciales
- Obtención de facturas por estudiante
- Ordenamiento por fecha de emisión
- Cálculo de deuda total
- Separación de facturas pendientes y pagadas

### Cobro Service (18 tests)

**Ubicación:** `__tests__/unit/cobro.service.test.js`

Pruebas:
- Registro de cobro completo
- Registro de cobro parcial
- Múltiples cobros parciales hasta completar total
- Validación de monto (mayor a cero)
- Validación de existencia de factura
- Validación de estado de factura (no cobrada)
- Validación de pertenencia de factura al estudiante
- Validación de que el cobro no exceda el saldo
- Validación de suma de cobros parciales
- Transacciones ACID (rollback en caso de error)
- Generación de número de recibo único
- Actualización de estado de factura
- Obtención de cobros por estudiante
- Ordenamiento por fecha de cobro

## Pruebas de Integración

### Facturas Controller (9 tests)

**Ubicación:** `__tests__/integration/facturas.controller.test.js`

Pruebas de endpoints:
- POST /api/facturas - Crear factura (6 tests)
  - Creación exitosa con status 201
  - Error 400 por datos faltantes
  - Error 400 por estudiante inexistente
  - Cálculo correcto con múltiples ítems
  - Tipo de factura B para Consumidor Final
  - Tipo de factura A para Responsable Inscripto

- GET /api/facturas/estudiante/:id - Obtener facturas (2 tests)
  - Retorno exitoso con status 200
  - Error 404 si no hay facturas

- GET /api/facturas/estudiante/:id/deuda - Obtener deuda (1 test)
  - Cálculo correcto de deuda total

### Cobros Controller (12 tests)

**Ubicación:** `__tests__/integration/cobros.controller.test.js`

Pruebas de endpoints:
- POST /api/cobros - Registrar cobro (9 tests)
  - Registro exitoso con status 201
  - Cobro parcial y actualización de estado
  - Múltiples cobros parciales
  - Error 400 por monto inválido
  - Error 400 por factura inexistente
  - Error 400 por factura ya cobrada
  - Error 400 por cobro excedente
  - Error 400 por factura no perteneciente
  - Generación de número de recibo único

- GET /api/cobros/estudiante/:id - Obtener cobros (2 tests)
  - Retorno exitoso con status 200
  - Error 404 si no hay cobros

- Escenario completo (1 test)
  - Factura con múltiples cobros end-to-end

## Configuración

### jest.config.js

```javascript
module.exports = {
  testEnvironment: 'node',
  coveragePathIgnorePatterns: ['/node_modules/'],
  testMatch: ['**/__tests__/**/*.test.js'],
  collectCoverageFrom: [
    'services/**/*.js',
    'controllers/**/*.js',
    '!**/node_modules/**',
    '!**/__tests__/**'
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },
  setupFilesAfterEnv: ['<rootDir>/__tests__/setup.js'],
  testTimeout: 10000
};
```

### setup.js

Configuración global que:
- Inicia MongoDB Memory Server antes de todos los tests
- Conecta Mongoose a la base de datos en memoria
- Limpia todas las colecciones después de cada test
- Desconecta y cierra el servidor después de todos los tests

## Buenas Prácticas

1. **Aislamiento de Tests**: Cada test es independiente y no depende del estado de otros
2. **Cleanup**: Se limpian todas las colecciones después de cada test
3. **Datos de Prueba**: Se crean datos frescos en cada test usando `beforeEach`
4. **Assertions Claras**: Se usan expects descriptivos y completos
5. **Nombres Descriptivos**: Los nombres de tests describen exactamente qué se está probando
6. **Coverage**: Se apunta a una cobertura mínima del 70%

## Estadísticas

- **Total de Tests**: 61
  - Unitarias: 50 tests
  - Integración: 11 tests
- **Servicios Testeados**: 3
- **Controllers Testeados**: 2
- **Cobertura Esperada**: >70%

## Mantenimiento

Para agregar nuevas pruebas:

1. Crear archivo en `__tests__/unit/` o `__tests__/integration/`
2. Importar módulos necesarios
3. Usar `describe` para agrupar tests relacionados
4. Usar `beforeEach` para setup de datos
5. Usar `test` o `it` para cada caso de prueba
6. Ejecutar `npm test` para verificar

## Troubleshooting

### Error: Cannot find module

Verificar que las rutas de importación sean correctas y relativas a la ubicación del test.

### Timeout Error

Aumentar el timeout en jest.config.js:
```javascript
testTimeout: 15000
```

### MongoDB Connection Error

Verificar que no haya otra instancia de MongoDB corriendo en el mismo puerto.

### Tests que fallan intermitentemente

Posible problema de estado compartido. Verificar que se esté limpiando correctamente en `afterEach`.

## Próximos Pasos

- Agregar tests de auditoría
- Agregar tests de conceptos de cobro
- Implementar tests E2E completos
- Agregar tests de performance
- Configurar CI/CD para ejecutar tests automáticamente
