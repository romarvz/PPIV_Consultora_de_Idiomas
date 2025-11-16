/**
 * Script rápido para obtener información del profesor asignado al curso de prueba
 */

const mongoose = require('mongoose');
const path = require('path');

// Cargar .env
const serverPath = path.resolve(__dirname, '..');
const rootPath = path.resolve(__dirname, '../..');
const envPath = path.join(serverPath, '.env');
const rootEnvPath = path.join(rootPath, '.env');

if (require('fs').existsSync(envPath)) {
  require('dotenv').config({ path: envPath });
} else if (require('fs').existsSync(rootEnvPath)) {
  require('dotenv').config({ path: rootEnvPath });
} else {
  require('dotenv').config();
}

const { BaseUser, Curso } = require('../models');

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI 
      || 'mongodb://127.0.0.1:27017/consultora-idiomas'
      || 'mongodb://localhost:27017/consultora-idiomas';
    
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000
    });
    console.log('✅ Conectado a MongoDB\n');
  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error.message);
    process.exit(1);
  }
};

const getProfessorInfo = async () => {
  try {
    // Buscar el curso de prueba
    const curso = await Curso.findOne({ nombre: 'Curso de Prueba - Asistencia' });
    
    if (!curso) {
      console.log('❌ No se encontró el curso de prueba');
      return;
    }

    console.log('📚 Curso encontrado:');
    console.log(`   Nombre: ${curso.nombre}`);
    console.log(`   ID: ${curso._id}`);
    console.log(`   Profesor ID: ${curso.profesor}\n`);

    // Buscar el profesor
    const profesor = await BaseUser.findById(curso.profesor).select('firstName lastName email dni role');
    
    if (!profesor) {
      console.log('❌ No se encontró el profesor asignado');
      return;
    }

    console.log('👨‍🏫 Información del Profesor:');
    console.log(`   Nombre: ${profesor.firstName} ${profesor.lastName}`);
    console.log(`   Email: ${profesor.email}`);
    console.log(`   DNI: ${profesor.dni || 'No especificado'}`);
    console.log(`   Role: ${profesor.role}\n`);

    console.log('🔑 Credenciales para login:');
    console.log(`   Email: ${profesor.email}`);
    if (profesor.dni) {
      console.log(`   Password temporal (primer login): ${profesor.dni}`);
      console.log('   ⚠️  Si ya cambió la contraseña, necesitarás usar la contraseña actual');
    } else {
      console.log('   ⚠️  No hay DNI registrado. Necesitarás la contraseña actual del profesor.');
    }

    console.log('\n📌 Para acceder al dashboard:');
    console.log('   1. Ve a http://localhost:3001/ (o la URL de tu frontend)');
    console.log('   2. Inicia sesión con las credenciales de arriba');
    console.log('   3. Busca el curso "Curso de Prueba - Asistencia"');
    console.log('   4. Verás las alertas de asistencia en la parte superior');

  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  }
};

const main = async () => {
  await connectDB();
  try {
    await getProfessorInfo();
  } catch (error) {
    console.error('❌ Error en el script:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Conexión cerrada');
    process.exit(0);
  }
};

main();

