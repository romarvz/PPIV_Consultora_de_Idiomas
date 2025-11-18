# Testing Suite - Verónica's Modules

## Overview
Comprehensive test suite for Profiles & Reports modules with unit and integration tests.

## Test Structure

```
__tests__/
├── models/
│   ├── PerfilEstudiante.test.js       # Model validations & methods
│   ├── ReporteAcademico.test.js       # Academic report model tests
│   └── ReporteFinanciero.test.js      # Financial report model tests
├── services/
│   ├── perfilesService.test.js        # Profile business logic tests
│   ├── reportesAcademicosService.test.js  # Academic service tests
│   └── reportesFinancierosService.test.js # Financial service tests
└── integration/
    ├── perfiles.test.js               # Profile API endpoint tests
    └── reportes.test.js               # Reports API endpoint tests
```

## Running Tests

### All Tests
```bash
npm test
```

### Watch Mode (auto-rerun on changes)
```bash
npm run test:watch
```

### Coverage Report
```bash
npm run test:coverage
```

### Verónica's Tests Only
```bash
npm run test:veronica
```

## Test Coverage

### Models
- ✅ PerfilEstudiante: Validations, certificados, estadísticas, historial
- ✅ ReporteAcademico: Auto-calculations, evaluaciones, attendance
- ✅ ReporteFinanciero: Financial calculations, deuda tracking

### Services
- ✅ perfilesService: CRUD operations, preferencias, certificados
- ✅ reportesAcademicosService: Report generation, statistics
- ✅ reportesFinancierosService: Financial reports, comparisons, trends

### Integration
- ✅ Profile endpoints: GET, PUT, POST operations
- ✅ Report endpoints: Generate, retrieve, update, export

## Test Database

Tests use `mongodb-memory-server` for isolated in-memory MongoDB instances:
- No external database required
- Fast execution
- Clean state for each test
- Automatic cleanup

## Coverage Goals

- **Target:** 80% minimum coverage
- **Current:** ~75% (15/47 tests passing)
- **Focus Areas:**
  - Model validations
  - Service business logic
  - API endpoint responses
  - Error handling

## Known Issues

Some integration tests fail due to:
1. Field mapping differences (totalIngresos vs ingresosTotales)
2. Missing populate() calls in services
3. Temporary auth middleware limitations

These will be resolved during team integration phase.

## Writing New Tests

### Model Test Template
```javascript
test('should validate field', async () => {
  const model = new Model({ field: 'value' });
  const saved = await model.save();
  expect(saved.field).toBe('value');
});
```

### Service Test Template
```javascript
test('should perform operation', async () => {
  const result = await service.operation(params);
  expect(result).toBeDefined();
  expect(result.field).toBe(expected);
});
```

### Integration Test Template
```javascript
test('should call endpoint', async () => {
  const response = await request(app)
    .post('/api/endpoint')
    .send(data)
    .expect(201);
  
  expect(response.body.success).toBe(true);
});
```

## Best Practices

1. **Isolation:** Each test should be independent
2. **Cleanup:** Use afterEach() to clear test data
3. **Descriptive:** Test names should explain what they test
4. **Assertions:** Use specific matchers (toBe, toEqual, toBeDefined)
5. **Coverage:** Test both success and error cases

## Dependencies

- `jest`: Test framework
- `supertest`: HTTP endpoint testing
- `mongodb-memory-server`: In-memory MongoDB for tests

## Next Steps

1. Fix field mapping issues in services
2. Add populate() calls for related data
3. Increase coverage to 80%+
4. Add error case tests
5. Integration with real auth middleware
