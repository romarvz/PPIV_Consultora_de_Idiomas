/**
 * Script de debug para ver estadísticas de asistencia de un estudiante en un curso
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

const { Clase, Curso, BaseUser } = require('../models');
const clasesService = require('../services/clasesService');

const connectDB = async () => {
  try {
    const mongoUri =
      process.env.MONGODB_URI ||
      'mongodb://127.0.0.1:27017/consultora-idiomas' ||
      'mongodb://localhost:27017/consultora-idiomas';

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

const debugAttendance = async (studentEmail, courseName) => {
  try {
    const estudiante = await BaseUser.findOne({
      email: studentEmail.toLowerCase().trim(),
      role: 'estudiante'
    });

    if (!estudiante) {
      console.log('❌ Estudiante no encontrado');
      return;
    }

    console.log('👤 Estudiante:');
    console.log(`   Nombre: ${estudiante.firstName} ${estudiante.lastName}`);
    console.log(`   ID: ${estudiante._id}`);
    console.log(`   Email: ${estudiante.email}\n`);

    const curso = await Curso.findOne({ nombre: courseName });
    if (!curso) {
      console.log('❌ Curso no encontrado:', courseName);
      return;
    }

    console.log('📚 Curso:');
    console.log(`   Nombre: ${curso.nombre}`);
    console.log(`   ID: ${curso._id}\n`);

    // Ver clases del curso y su estado
    const clases = await Clase.find({ curso: curso._id }).sort({ fechaHora: 1 });
    const completadas = clases.filter((c) => c.estado === 'completada');

    console.log(`📝 Clases del curso: ${clases.length}`);
    console.log(`   Completadas: ${completadas.length}`);
    clases.forEach((cl, idx) => {
      console.log(
        `   ${idx + 1}. ${cl.titulo} - estado=${cl.estado} - fecha=${cl.fechaHora}`
      );
    });

    console.log('\n📊 Estadísticas de asistencia (Clase.getEstadisticasAsistencia):');
    const statsRaw = await Clase.getEstadisticasAsistencia(estudiante._id, curso._id);
    console.log(statsRaw);

    console.log('\n📊 Estadísticas de asistencia enriquecidas (clasesService.getAsistenciaEstudiante):');
    const statsService = await clasesService.getAsistenciaEstudiante(
      estudiante._id,
      curso._id
    );
    console.log(statsService);
  } catch (error) {
    console.error('❌ Error en debugAttendance:', error);
  }
};

const main = async () => {
  const email = process.argv[2] || 'laura.lopez@email.com';
  const courseName = process.argv[3] || 'Inglés para viajes';

  await connectDB();
  try {
    await debugAttendance(email, courseName);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Conexión cerrada');
    process.exit(0);
  }
};

main();


