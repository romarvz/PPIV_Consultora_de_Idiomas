/**
 * Script para inspeccionar la asistencia de una clase concreta
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

const { Clase } = require('../models');

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

const checkClass = async (claseId) => {
  try {
    const clase = await Clase.findById(claseId)
      .populate('curso', 'nombre')
      .populate('estudiantes', 'firstName lastName email')
      .populate('asistencia.estudiante', 'firstName lastName email');

    if (!clase) {
      console.log('❌ Clase no encontrada');
      return;
    }

    console.log('📚 Clase:');
    console.log(`   ID: ${clase._id}`);
    console.log(`   Título: ${clase.titulo}`);
    console.log(`   Curso: ${clase.curso?.nombre} (${clase.curso?._id})`);
    console.log(`   Estado: ${clase.estado}`);
    console.log(`   Estudiantes en clase: ${clase.estudiantes.length}`);

    clase.estudiantes.forEach((est, idx) => {
      console.log(`      ${idx + 1}. ${est.firstName} ${est.lastName} - ${est.email} (${est._id})`);
    });

    console.log('\n📝 Asistencia registrada:');
    if (!clase.asistencia || clase.asistencia.length === 0) {
      console.log('   (sin registros)');
    } else {
      clase.asistencia.forEach((a, idx) => {
        const est = a.estudiante;
        console.log(
          `   ${idx + 1}. ${est?.firstName} ${est?.lastName} - ${
            est?.email
          } (${est?._id}) -> ${a.presente ? 'PRESENTE' : 'AUSENTE'}, tarde=${a.minutosTarde} min, comentario="${a.comentarios}"`
        );
      });
    }
  } catch (error) {
    console.error('❌ Error en checkClass:', error);
  }
};

const main = async () => {
  const claseId = process.argv[2];
  if (!claseId) {
    console.log('⚠️  Uso: node scripts/check-class-attendance.js <claseId>');
    process.exit(1);
  }

  await connectDB();
  try {
    await checkClass(claseId);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Conexión cerrada');
    process.exit(0);
  }
};

main();


