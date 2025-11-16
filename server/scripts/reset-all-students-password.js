/**
 * Script para resetear las contraseñas de todos los estudiantes del curso de prueba
 */

const mongoose = require('mongoose');
const path = require('path');
const bcrypt = require('bcryptjs');

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

const resetStudentsPasswords = async () => {
  try {
    // Buscar el curso de prueba
    const curso = await Curso.findOne({ nombre: 'Curso de Prueba - Asistencia' });
    
    if (!curso) {
      console.log('❌ No se encontró el curso de prueba');
      return;
    }

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

    console.log(`🔄 Reseteando contraseñas de ${inscripciones.length} estudiantes...\n`);

    for (const inscripcion of inscripciones) {
      const estudiante = inscripcion.estudiante;
      if (!estudiante || !estudiante.dni) {
        console.log(`⚠️  Saltando ${estudiante?.firstName || 'estudiante'} - sin DNI`);
        continue;
      }

      try {
        // Hashear la contraseña (DNI)
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(estudiante.dni, salt);

        // Actualizar directamente en la base de datos
        await BaseUser.updateOne(
          { _id: estudiante._id },
          { 
            $set: { 
              password: hashedPassword,
              mustChangePassword: true
            }
          }
        );

        // Verificar inmediatamente
        const updatedUser = await BaseUser.findById(estudiante._id);
        const testMatch = await bcrypt.compare(estudiante.dni, updatedUser.password);
        
        if (testMatch) {
          console.log(`✅ ${estudiante.firstName} ${estudiante.lastName}`);
          console.log(`   Email: ${estudiante.email}`);
          console.log(`   Password: ${estudiante.dni}`);
        } else {
          console.log(`❌ ERROR - ${estudiante.firstName} ${estudiante.lastName} - La contraseña no funciona`);
        }
      } catch (error) {
        console.error(`❌ Error reseteando ${estudiante.firstName} ${estudiante.lastName}:`, error.message);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('\n✅ Proceso completado');
    console.log('\n📌 Credenciales actualizadas:');
    inscripciones.forEach((inscripcion) => {
      const estudiante = inscripcion.estudiante;
      if (estudiante && estudiante.dni) {
        console.log(`\n   ${estudiante.firstName} ${estudiante.lastName}:`);
        console.log(`   Email: ${estudiante.email}`);
        console.log(`   Password: ${estudiante.dni}`);

      }
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  }
};

const main = async () => {
  await connectDB();
  try {
    await resetStudentsPasswords();
  } catch (error) {
    console.error('❌ Error en el script:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Conexión cerrada');
    process.exit(0);
  }
};

main();

