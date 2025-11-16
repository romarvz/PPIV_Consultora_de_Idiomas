/**
 * Script para corregir las asistencias del curso de prueba
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

const { BaseUser, Curso, Clase } = require('../models');

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

const fixAttendance = async () => {
  try {
    // Buscar curso de prueba
    const curso = await Curso.findOne({ nombre: 'Curso de Prueba - Asistencia' });
    if (!curso) {
      console.log('❌ No se encontró el curso de prueba');
      return;
    }

    console.log(`📚 Curso: ${curso.nombre}\n`);

    // Buscar profesor
    const profesor = await BaseUser.findById(curso.profesor);
    if (!profesor) {
      console.log('❌ No se encontró el profesor');
      return;
    }

    // Buscar inscripciones
    const Inscripcion = mongoose.model('Inscripcion');
    const inscripciones = await Inscripcion.find({
      curso: curso._id,
      estado: 'confirmada'
    }).populate('estudiante', 'firstName lastName email dni');

    if (inscripciones.length === 0) {
      console.log('❌ No se encontraron inscripciones');
      return;
    }

    console.log(`👥 Estudiantes encontrados: ${inscripciones.length}\n`);

    // Buscar clases del curso ordenadas por fecha
    const clases = await Clase.find({ curso: curso._id })
      .sort({ fechaHora: 1 });

    console.log(`📝 Clases encontradas: ${clases.length}\n`);

    // Registrar asistencia según el plan:
    // Estudiante 0 (Carlos): presente en todas (100%)
    // Estudiante 1 (Ana): presente en primeras 2 (66%)
    // Estudiante 2 (Laura): presente solo en primera (33%)
    // Estudiante 3 (Diego): ausente en todas (0%)
    // Estudiante 4 (Sofía): ausente en todas (0%)

    for (let estIdx = 0; estIdx < inscripciones.length; estIdx++) {
      const inscripcion = inscripciones[estIdx];
      const estudiante = inscripcion.estudiante;

      console.log(`\n👤 ${estudiante.firstName} ${estudiante.lastName} (índice ${estIdx}):`);

      for (let claseIdx = 0; claseIdx < clases.length; claseIdx++) {
        const clase = clases[claseIdx];

        // Determinar si debe asistir
        let debeAsistir = false;
        if (estIdx === 0) {
          // Carlos: presente en todas
          debeAsistir = true;
        } else if (estIdx === 1) {
          // Ana: presente en primeras 2
          debeAsistir = claseIdx < 2;
        } else if (estIdx === 2) {
          // Laura: presente solo en primera
          debeAsistir = claseIdx === 0;
        }
        // Diego y Sofía: ausentes en todas (debeAsistir = false)

        // Verificar si ya existe asistencia
        const asistenciaExistente = clase.asistencia.find(a => 
          (a.estudiante._id || a.estudiante).toString() === estudiante._id.toString()
        );

        if (asistenciaExistente) {
          // Actualizar asistencia existente
          asistenciaExistente.presente = debeAsistir;
          asistenciaExistente.fechaRegistro = new Date();
          asistenciaExistente.registradoPor = profesor._id;
          await clase.save();
          console.log(`   ✅ Clase ${claseIdx + 1}: ${debeAsistir ? 'PRESENTE' : 'AUSENTE'} (actualizada)`);
        } else {
          // Registrar nueva asistencia
          await clase.registrarAsistencia(
            estudiante._id,
            debeAsistir,
            0,
            'Asistencia corregida por script',
            profesor._id
          );
          console.log(`   ✅ Clase ${claseIdx + 1}: ${debeAsistir ? 'PRESENTE' : 'AUSENTE'} (registrada)`);
        }
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('\n✅ Asistencias corregidas exitosamente');
    console.log('\n📊 Estadísticas esperadas:');
    console.log('   Carlos Rodríguez: 100% (3/3 clases) - REGULAR ✅');
    console.log('   Ana Martínez: 66.7% (2/3 clases) - Cerca del límite ⚠️');
    console.log('   Laura López: 33.3% (1/3 clases) - Bajo ❌');
    console.log('   Diego González: 0% (0/3 clases) - Muy bajo ❌');
    console.log('   Sofía Pérez: 0% (0/3 clases) - Muy bajo ❌');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
    throw error;
  }
};

const main = async () => {
  await connectDB();
  try {
    await fixAttendance();
  } catch (error) {
    console.error('❌ Error en el script:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Conexión cerrada');
    process.exit(0);
  }
};

main();

