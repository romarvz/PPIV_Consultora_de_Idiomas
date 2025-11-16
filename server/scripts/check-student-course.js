/**
 * Script para verificar la inscripción y clases de un estudiante
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

const checkStudentCourse = async (studentEmail) => {
  try {
    // Buscar estudiante
    const estudiante = await BaseUser.findOne({ 
      email: studentEmail.toLowerCase().trim(),
      role: 'estudiante'
    });

    if (!estudiante) {
      console.log(`❌ No se encontró el estudiante: ${studentEmail}`);
      return;
    }

    console.log(`👤 Estudiante: ${estudiante.firstName} ${estudiante.lastName}`);
    console.log(`   ID: ${estudiante._id}\n`);

    // Buscar curso de prueba
    const curso = await Curso.findOne({ nombre: 'Curso de Prueba - Asistencia' });
    if (!curso) {
      console.log('❌ No se encontró el curso de prueba');
      return;
    }

    console.log(`📚 Curso: ${curso.nombre}`);
    console.log(`   ID: ${curso._id}\n`);

    // Buscar inscripción
    const Inscripcion = mongoose.model('Inscripcion');
    const inscripcion = await Inscripcion.findOne({
      estudiante: estudiante._id,
      curso: curso._id
    });

    if (!inscripcion) {
      console.log('❌ El estudiante NO está inscrito en el curso');
      console.log('\n💡 Solución: Inscribir al estudiante al curso');
      return;
    }

    console.log('✅ El estudiante ESTÁ inscrito en el curso');
    console.log(`   Estado: ${inscripcion.estado}`);
    console.log(`   Fecha inscripción: ${inscripcion.fechaInscripcion}\n`);

    // Buscar clases del curso
    const clases = await Clase.find({ curso: curso._id });
    console.log(`📝 Clases del curso: ${clases.length}`);

    // Verificar si el estudiante está en las clases
    let clasesConEstudiante = 0;
    let clasesCompletadas = 0;
    let asistenciaRegistrada = 0;

    for (const clase of clases) {
      const estaEnClase = clase.estudiantes.some(est => 
        (est._id || est).toString() === estudiante._id.toString()
      );
      
      if (estaEnClase) {
        clasesConEstudiante++;
        console.log(`\n   ✅ Clase: ${clase.titulo}`);
        console.log(`      Estado: ${clase.estado}`);
        console.log(`      Fecha: ${clase.fechaHora}`);
        
        if (clase.estado === 'completada') {
          clasesCompletadas++;
        }

        // Verificar asistencia
        const asistencia = clase.asistencia.find(a => 
          (a.estudiante._id || a.estudiante).toString() === estudiante._id.toString()
        );
        
        if (asistencia) {
          asistenciaRegistrada++;
          console.log(`      Asistencia: ${asistencia.presente ? 'PRESENTE ✅' : 'AUSENTE ❌'}`);
        } else {
          console.log(`      Asistencia: NO REGISTRADA`);
        }
      } else {
        console.log(`\n   ❌ Clase: ${clase.titulo} - El estudiante NO está en esta clase`);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('\n📊 Resumen:');
    console.log(`   Clases totales: ${clases.length}`);
    console.log(`   Clases con estudiante: ${clasesConEstudiante}`);
    console.log(`   Clases completadas: ${clasesCompletadas}`);
    console.log(`   Asistencias registradas: ${asistenciaRegistrada}`);

    if (clasesConEstudiante === 0) {
      console.log('\n⚠️  PROBLEMA: El estudiante no está en ninguna clase');
      console.log('💡 Solución: Agregar el estudiante a las clases del curso');
    }

    if (clasesCompletadas === 0) {
      console.log('\n⚠️  PROBLEMA: No hay clases completadas');
      console.log('💡 Las estadísticas solo se calculan para clases completadas');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
    throw error;
  }
};

const main = async () => {
  const email = process.argv[2] || 'laura.lopez@email.com';

  await connectDB();
  try {
    await checkStudentCourse(email);
  } catch (error) {
    console.error('❌ Error en el script:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Conexión cerrada');
    process.exit(0);
  }
};

main();

