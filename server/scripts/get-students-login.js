/**
 * Script para obtener datos de login de estudiantes del curso de prueba
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

const getStudentsLogin = async () => {
  try {
    // Buscar el curso de prueba
    const curso = await Curso.findOne({ nombre: 'Curso de Prueba - Asistencia' });
    
    if (!curso) {
      console.log('❌ No se encontró el curso de prueba');
      return;
    }

    console.log('📚 Curso encontrado:', curso.nombre);
    console.log(`   ID: ${curso._id}\n`);

    // Buscar inscripciones del curso
    const Inscripcion = mongoose.model('Inscripcion');
    const inscripciones = await Inscripcion.find({ 
      curso: curso._id,
      estado: 'confirmada'
    }).populate('estudiante', 'firstName lastName email dni role');

    if (inscripciones.length === 0) {
      console.log('❌ No se encontraron estudiantes inscritos en el curso');
      return;
    }

    console.log(`👥 Estudiantes encontrados: ${inscripciones.length}\n`);
    console.log('='.repeat(60));
    
    inscripciones.forEach((inscripcion, index) => {
      const estudiante = inscripcion.estudiante;
      if (!estudiante) return;
      
      console.log(`\n${index + 1}. ${estudiante.firstName} ${estudiante.lastName}`);
      console.log(`   📧 Email: ${estudiante.email}`);
      console.log(`   🆔 DNI: ${estudiante.dni || 'No especificado'}`);
      console.log(`   🔑 Password (primer login): ${estudiante.dni || 'N/A'}`);
    });

    console.log('\n' + '='.repeat(60));
    console.log('\n📌 Para probar las alertas, inicia sesión con:');
    console.log('\n   Ana Martínez o Laura López (están cerca del límite)');
    console.log('   Carlos Rodríguez (100% asistencia - no debería mostrar alerta)');

  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  }
};

const main = async () => {
  await connectDB();
  try {
    await getStudentsLogin();
  } catch (error) {
    console.error('❌ Error en el script:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Conexión cerrada');
    process.exit(0);
  }
};

main();

