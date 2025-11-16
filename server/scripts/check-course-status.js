/**
 * Script para verificar el estado del curso y por qué no aparece
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

const checkCourseStatus = async () => {
  try {
    // Buscar curso de prueba
    const curso = await Curso.findOne({ nombre: 'Curso de Prueba - Asistencia' });
    if (!curso) {
      console.log('❌ No se encontró el curso de prueba');
      return;
    }

    console.log('📚 Información del Curso:');
    console.log(`   Nombre: ${curso.nombre}`);
    console.log(`   ID: ${curso._id}`);
    console.log(`   Estado: ${curso.estado}`);
    console.log(`   Fecha inicio: ${curso.fechaInicio}`);
    console.log(`   Fecha fin: ${curso.fechaFin}`);
    console.log(`   Profesor: ${curso.profesor}`);
    console.log(`   Modalidad: ${curso.modalidad || 'No especificada'}`);
    console.log(`   Horario: ${curso.horario || 'No especificado'}`);
    console.log(`   Horarios: ${curso.horarios?.length || 0} horarios\n`);

    // Buscar estudiante
    const estudiante = await BaseUser.findOne({ 
      email: 'laura.lopez@email.com',
      role: 'estudiante'
    });

    if (!estudiante) {
      console.log('❌ No se encontró el estudiante');
      return;
    }

    console.log(`👤 Estudiante: ${estudiante.firstName} ${estudiante.lastName}`);
    console.log(`   ID: ${estudiante._id}\n`);

    // Simular la función getCursosByEstudiante
    const Inscripcion = mongoose.model('Inscripcion');
    const inscripciones = await Inscripcion.findActivasByEstudiante(estudiante._id.toString());
    
    console.log(`📝 Inscripciones activas encontradas: ${inscripciones.length}`);
    
    inscripciones.forEach((ins, index) => {
      console.log(`\n   ${index + 1}. Inscripción ID: ${ins._id}`);
      console.log(`      Curso ID: ${ins.curso?._id || ins.curso}`);
      console.log(`      Curso nombre: ${ins.curso?.nombre || 'No populado'}`);
      console.log(`      Estado: ${ins.estado}`);
      console.log(`      ¿Coincide con curso de prueba? ${(ins.curso?._id || ins.curso)?.toString() === curso._id.toString()}`);
    });

    // Verificar directamente
    const inscripcionDirecta = await Inscripcion.findOne({
      estudiante: estudiante._id,
      curso: curso._id,
      estado: 'confirmada'
    });

    console.log('\n' + '='.repeat(60));
    if (inscripcionDirecta) {
      console.log('✅ Inscripción directa encontrada');
      console.log(`   Estado: ${inscripcionDirecta.estado}`);
    } else {
      console.log('❌ No se encontró inscripción directa con estado "confirmada"');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
    throw error;
  }
};

const main = async () => {
  await connectDB();
  try {
    await checkCourseStatus();
  } catch (error) {
    console.error('❌ Error en el script:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Conexión cerrada');
    process.exit(0);
  }
};

main();

