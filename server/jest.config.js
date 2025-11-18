module.exports = {
  testEnvironment: 'node',
  coveragePathIgnorePatterns: ['/node_modules/'],
  testMatch: ['**/__tests__/**/*.test.js'],
  collectCoverageFrom: [
    'services/**/*.js',
    'controllers/**/*.js',
    '!**/node_modules/**',
    '!**/__tests__/**'
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
  },
  setupFilesAfterEnv: ['<rootDir>/__tests__/setup.js'],
  testTimeout: 10000
};
