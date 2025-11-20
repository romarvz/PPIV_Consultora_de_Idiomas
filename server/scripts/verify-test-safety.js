#!/usr/bin/env node

/**
 * Script de Verificación de Seguridad para Testing
 * Ejecuta verificaciones antes de permitir que se ejecuten los tests
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔒 Iniciando verificaciones de seguridad para testing...\n');

// Verificar que estamos en entorno de test
function verificarEntorno() {
  console.log('1️⃣ Verificando entorno...');
  
  if (process.env.NODE_ENV !== 'test') {
    console.log('⚠️  NODE_ENV no está configurado como "test"');
    console.log('   Configurando automáticamente...');
    process.env.NODE_ENV = 'test';
  }
  
  console.log('✅ Entorno configurado correctamente\n');
}

// Verificar configuración de MongoDB
function verificarMongoDB() {
  console.log('2️⃣ Verificando configuración de MongoDB...');
  
  const mongoUri = process.env.MONGO_TEST_URI;
  
  if (!mongoUri) {
    console.error('❌ MONGO_TEST_URI no está configurada');
    console.error('   Crea un archivo .env.test con:');
    console.error('   MONGO_TEST_URI=mongodb://127.0.0.1:27017/idiomas_test');
    process.exit(1);
  }
  
  if (!mongoUri.includes('test')) {
    console.error('❌ PELIGRO: La URI no contiene "test"');
    console.error('   URI actual:', mongoUri.replace(/\/\/.*@/, '//***@'));
    console.error('   Debe contener "test" para seguridad');
    process.exit(1);
  }
  
  // Verificar que no apunte a puertos de producción comunes
  const productionPorts = ['27017', '3001', '5432', '3306'];
  const hasProductionPort = productionPorts.some(port => 
    mongoUri.includes(`:${port}/`) && !mongoUri.includes('test')
  );
  
  if (hasProductionPort && !mongoUri.includes('127.0.0.1') && !mongoUri.includes('localhost')) {
    console.error('❌ PELIGRO: Posible conexión a base de datos de producción');
    console.error('   Verifica que sea realmente una base de datos de test');
    process.exit(1);
  }
  
  console.log('✅ Configuración de MongoDB es segura');
  console.log('   URI:', mongoUri.replace(/\/\/.*@/, '//***@'), '\n');
}

// Verificar archivos de test
function verificarArchivosTest() {
  console.log('3️⃣ Verificando archivos de test...');
  
  const testFiles = [];
  
  function buscarTests(dir) {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const fullPath = path.join(dir, file);
      
      if (fs.statSync(fullPath).isDirectory()) {
        buscarTests(fullPath);
      } else if (file.endsWith('.test.js') || file.endsWith('.spec.js')) {
        testFiles.push(fullPath);
      }
    }
  }
  
  buscarTests(__dirname);
  
  let peligrosEncontrados = 0;
  
  for (const testFile of testFiles) {
    const contenido = fs.readFileSync(testFile, 'utf8');
    
    // Buscar operaciones peligrosas
    if (contenido.includes('dropDatabase()')) {
      console.warn(`⚠️  ${testFile} contiene dropDatabase()`);
      
      // Verificar si tiene protecciones
      if (!contenido.includes('isTestEnvironment') || !contenido.includes('test')) {
        console.error(`❌ ${testFile} no tiene protecciones de seguridad`);
        peligrosEncontrados++;
      }
    }
    
    if (contenido.includes('mongoose.connection.db.dropDatabase')) {
      console.error(`❌ ${testFile} contiene operación de eliminación directa`);
      peligrosEncontrados++;
    }
  }
  
  if (peligrosEncontrados > 0) {
    console.error(`\n❌ Encontradas ${peligrosEncontrados} operaciones peligrosas`);
    console.error('   Revisa y corrige antes de ejecutar tests');
    process.exit(1);
  }
  
  console.log(`✅ ${testFiles.length} archivos de test verificados\n`);
}

// Verificar dependencias
function verificarDependencias() {
  console.log('4️⃣ Verificando dependencias...');
  
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    
    const dependenciasTest = ['jest', 'supertest'];
    const faltantes = [];
    
    for (const dep of dependenciasTest) {
      if (!packageJson.devDependencies[dep] && !packageJson.dependencies[dep]) {
        faltantes.push(dep);
      }
    }
    
    if (faltantes.length > 0) {
      console.warn('⚠️  Dependencias faltantes:', faltantes.join(', '));
      console.log('   Instala con: npm install --save-dev', faltantes.join(' '));
    }
    
    console.log('✅ Dependencias verificadas\n');
    
  } catch (error) {
    console.warn('⚠️  No se pudo verificar package.json');
  }
}

// Ejecutar todas las verificaciones
function main() {
  try {
    verificarEntorno();
    verificarMongoDB();
    verificarArchivosTest();
    verificarDependencias();
    
    console.log('🎉 ¡Todas las verificaciones pasaron!');
    console.log('🚀 Es seguro ejecutar los tests');
    console.log('\nComandos seguros:');
    console.log('   npm run test:safe');
    console.log('   npm run test:watch');
    
  } catch (error) {
    console.error('💥 Error en verificación:', error.message);
    process.exit(1);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  main();
}

module.exports = {
  verificarEntorno,
  verificarMongoDB,
  verificarArchivosTest,
  verificarDependencias
};