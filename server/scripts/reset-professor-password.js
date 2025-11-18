/**
 * Script para resetear la contraseña de un profesor a su DNI
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

const { BaseUser } = require('../models');

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

const resetPassword = async (email, newPassword) => {
  try {
    const profesor = await BaseUser.findOne({ email: email.toLowerCase(), role: 'profesor' });
    
    if (!profesor) {
      console.log(`❌ No se encontró un profesor con el email: ${email}`);
      return false;
    }

    console.log(`📧 Profesor encontrado: ${profesor.firstName} ${profesor.lastName}`);
    console.log(`📧 Email: ${profesor.email}`);
    console.log(`🆔 DNI: ${profesor.dni || 'No especificado'}\n`);

    // Hashear la nueva contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Actualizar la contraseña
    profesor.password = hashedPassword;
    profesor.mustChangePassword = true; // Forzar cambio de contraseña en próximo login
    await profesor.save();

    console.log('✅ Contraseña actualizada exitosamente');
    console.log(`\n🔑 Nueva contraseña: ${newPassword}`);
    console.log('⚠️  El profesor deberá cambiar su contraseña en el próximo login\n');

    return true;
  } catch (error) {
    console.error('❌ Error actualizando contraseña:', error.message);
    return false;
  }
};

const main = async () => {
  const email = process.argv[2];
  const newPassword = process.argv[3] || null;

  if (!email) {
    console.log('❌ Uso: node reset-professor-password.js <email> [nueva_password]');
    console.log('   Si no se especifica nueva_password, se usará el DNI del profesor');
    process.exit(1);
  }

  await connectDB();
  
  try {
    let passwordToUse = newPassword;
    
    if (!passwordToUse) {
      // Si no se especificó password, buscar el DNI del profesor
      const profesor = await BaseUser.findOne({ email: email.toLowerCase(), role: 'profesor' });
      if (!profesor) {
        console.log(`❌ No se encontró un profesor con el email: ${email}`);
        process.exit(1);
      }
      passwordToUse = profesor.dni;
      if (!passwordToUse) {
        console.log('❌ El profesor no tiene DNI registrado. Debes especificar una contraseña.');
        process.exit(1);
      }
      console.log(`📝 Usando DNI como contraseña: ${passwordToUse}\n`);
    }

    const success = await resetPassword(email, passwordToUse);
    
    if (success) {
      console.log('\n✅ Proceso completado exitosamente');
      console.log(`\n📌 Credenciales para login:`);
      console.log(`   Email: ${email}`);
      console.log(`   Password: ${passwordToUse}`);
    } else {
      console.log('\n❌ No se pudo actualizar la contraseña');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error en el script:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Conexión cerrada');
    process.exit(0);
  }
};

main();

