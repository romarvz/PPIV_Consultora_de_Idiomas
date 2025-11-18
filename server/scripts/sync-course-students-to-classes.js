/**
 * Script para sincronizar alumnos inscriptos -> clases de un curso
 * Útil cuando las clases tienen 0 estudiantes pero sí hay inscripciones.
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

const syncCourse = async (courseName = 'Inglés para viajes') => {
  try {
    const curso = await Curso.findOne({ nombre: courseName });
    if (!curso) {
      console.log(`❌ No se encontró el curso con nombre: ${courseName}`);
      return;
    }

    console.log('📚 Curso encontrado:');
    console.log(`   Nombre: ${curso.nombre}`);
    console.log(`   ID: ${curso._id}\n`);

    const inscripciones = await Inscripcion.find({
      curso: curso._id,
      estado: 'confirmada'
    }).populate('estudiante', 'firstName lastName email');

    if (inscripciones.length === 0) {
      console.log('❌ No hay inscripciones confirmadas para este curso.');
      return;
    }

    console.log(`👥 Inscripciones confirmadas: ${inscripciones.length}`);
    const estudianteIds = inscripciones
      .map((ins) => ins.estudiante && ins.estudiante._id)
      .filter(Boolean);

    estudianteIds.forEach((id, idx) => {
      const est = inscripciones[idx].estudiante;
      console.log(`   ${idx + 1}. ${est.firstName} ${est.lastName} - ${est.email} (${id})`);
    });

    const clases = await Clase.find({ curso: curso._id });
    console.log(`\n📝 Clases encontradas: ${clases.length}`);

    for (const clase of clases) {
      const actuales = (clase.estudiantes || []).map((e) =>
        e._id ? e._id.toString() : e.toString()
      );

      const nuevos = estudianteIds.filter((id) => !actuales.includes(id.toString()));

      if (nuevos.length === 0) {
        console.log(
          `   - Clase "${clase.titulo}" (${clase._id}): ya tiene ${actuales.length} estudiantes, nada que agregar.`
        );
        continue;
      }

      clase.estudiantes = [...clase.estudiantes, ...nuevos];
      await clase.save();

      console.log(
        `   ✅ Clase "${clase.titulo}" (${clase._id}): se agregaron ${nuevos.length} estudiantes (total ahora ${clase.estudiantes.length}).`
      );
    }

    console.log('\n✅ Sincronización completada.');
    console.log(
      '💡 Ahora, en las clases de este curso, deberían aparecer los alumnos y podés registrar asistencia.'
    );
  } catch (error) {
    console.error('❌ Error en syncCourse:', error);
  }
};

const main = async () => {
  const nameArg = process.argv[2];
  await connectDB();
  try {
    await syncCourse(nameArg || 'Inglés para viajes');
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Conexión cerrada');
    process.exit(0);
  }
};

main();


