module.exports = {
  testEnvironment: 'node',
  coveragePathIgnorePatterns: ['/node_modules/'],
  testMatch: ['**/__tests__/**/*.test.js'],
  collectCoverageFrom: [
    'models/PerfilEstudiante.js',
    'models/ReporteAcademico.js',
    'models/ReporteFinanciero.js',
    'services/perfilesService.js',
    'services/reportesAcademicosService.js',
    'services/reportesFinancierosService.js',
    'controllers/perfilesController.js',
    'controllers/reportesAcademicosController.js',
    'controllers/reportesFinancierosController.js'
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  }
};
