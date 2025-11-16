/**
 * Script para probar el registro de asistencia en un curso/profesor específicos
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

const mainLogic = async () => {
  // Por defecto probamos con "Inglés para viajes"
  const courseName = process.argv[2] || 'Inglés para viajes';

  const curso = await Curso.findOne({ nombre: courseName });
  if (!curso) {
    console.log(`❌ No se encontró el curso: ${courseName}`);
    return;
  }
  console.log(`📚 Curso: ${curso.nombre} (${curso._id})`);

  const clases = await Clase.find({ curso: curso._id })
    .sort({ fechaHora: 1 })
    .populate('estudiantes', 'firstName lastName email');

  if (clases.length === 0) {
    console.log('❌ El curso no tiene clases.');
    return;
  }

  const clase = clases[0];
  console.log(
    `\n📝 Probando en clase: ${clase.titulo} (${clase._id}) - estado=${clase.estado} fecha=${clase.fechaHora}`
  );
  console.log(`   Estudiantes en clase: ${clase.estudiantes.length}`);

  if (clase.estudiantes.length === 0) {
    console.log('❌ La clase no tiene estudiantes asociados. No se puede probar asistencia.');
    return;
  }

  const estudiante = clase.estudiantes[0];
  console.log(
    `\n👤 Estudiante seleccionado: ${estudiante.firstName} ${estudiante.lastName} (${estudiante._id})`
  );

  console.log('\n📊 Asistencia ANTES:');
  console.log(
    clase.asistencia
      .filter((a) => a.estudiante.toString() === estudiante._id.toString())
      .map((a) => ({
        presente: a.presente,
        fechaRegistro: a.fechaRegistro
      })) || '   (sin registros)'
  );

  console.log('\n🔄 Registrando asistencia PRESENTE...');
  await clase.registrarAsistencia(
    estudiante._id,
    true,
    0,
    'Asistencia testeada por script',
    curso.profesor
  );

  const claseActualizada = await Clase.findById(clase._id);
  console.log('\n📊 Asistencia DESPUÉS:');
  const registros = claseActualizada.asistencia.filter(
    (a) => a.estudiante.toString() === estudiante._id.toString()
  );
  console.log(
    registros.length > 0
      ? registros.map((a) => ({
          presente: a.presente,
          fechaRegistro: a.fechaRegistro
        }))
      : '   (sin registros)'
  );
};

const main = async () => {
  await connectDB();
  try {
    await mainLogic();
  } catch (err) {
    console.error('❌ Error en el script:', err);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Conexión cerrada');
    process.exit(0);
  }
};

main();


