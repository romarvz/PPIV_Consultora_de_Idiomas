/**
 * Script para comparar inscripciones vs alumnos en clases de un curso
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

const { Curso, Clase, Inscripcion } = require('../models');

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

const checkCourse = async (courseName = 'Inglés para viajes') => {
  try {
    const curso = await Curso.findOne({ nombre: courseName });
    if (!curso) {
      console.log(`❌ No se encontró el curso con nombre: ${courseName}`);
      return;
    }

    console.log('📚 Curso encontrado:');
    console.log(`   Nombre: ${curso.nombre}`);
    console.log(`   ID: ${curso._id}\n`);

    // Inscripciones
    const inscripciones = await Inscripcion.find({ curso: curso._id, estado: 'confirmada' }).populate(
      'estudiante',
      'firstName lastName email'
    );
    console.log(`👥 Inscripciones confirmadas: ${inscripciones.length}`);
    inscripciones.forEach((ins, idx) => {
      console.log(
        `   ${idx + 1}. ${ins.estudiante?.firstName} ${ins.estudiante?.lastName} - ${
          ins.estudiante?.email
        } (id ${ins.estudiante?._id})`
      );
    });

    // Clases del curso
    const clases = await Clase.find({ curso: curso._id }).populate(
      'estudiantes',
      'firstName lastName email'
    );
    console.log(`\n📝 Clases del curso: ${clases.length}`);

    clases.forEach((clase, idx) => {
      console.log(
        `\n   Clase ${idx + 1}: ${clase.titulo} - estado=${clase.estado} - fecha=${clase.fechaHora}`
      );
      console.log(`   Estudiantes en clase: ${clase.estudiantes.length}`);
      clase.estudiantes.forEach((est, i) => {
        console.log(`      ${i + 1}. ${est.firstName} ${est.lastName} - ${est.email} (${est._id})`);
      });
    });

    console.log('\n============================================================\n');
    console.log('💡 Si ves inscripciones pero 0 estudiantes en las clases, hay que sincronizar alumnos a las clases.');
  } catch (error) {
    console.error('❌ Error en checkCourse:', error);
  }
};

const main = async () => {
  const nameArg = process.argv[2];
  await connectDB();
  try {
    await checkCourse(nameArg || 'Inglés para viajes');
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Conexión cerrada');
    process.exit(0);
  }
};

main();


