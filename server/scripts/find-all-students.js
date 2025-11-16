/**
 * Script para encontrar todos los estudiantes en la base de datos
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

const { BaseUser } = require('../models');

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

const findAllStudents = async () => {
  try {
    const estudiantes = await BaseUser.find({ role: 'estudiante' })
      .select('firstName lastName email dni')
      .sort({ firstName: 1 });

    if (estudiantes.length === 0) {
      console.log('❌ No se encontraron estudiantes en la base de datos');
      return;
    }

    console.log(`👥 Estudiantes encontrados: ${estudiantes.length}\n`);
    console.log('='.repeat(70));
    
    estudiantes.forEach((estudiante, index) => {
      console.log(`\n${index + 1}. ${estudiante.firstName} ${estudiante.lastName}`);
      console.log(`   📧 Email: ${estudiante.email}`);
      console.log(`   🆔 DNI: ${estudiante.dni || 'No especificado'}`);
    });

    console.log('\n' + '='.repeat(70));

  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  }
};

const main = async () => {
  await connectDB();
  try {
    await findAllStudents();
  } catch (error) {
    console.error('❌ Error en el script:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Conexión cerrada');
    process.exit(0);
  }
};

main();

