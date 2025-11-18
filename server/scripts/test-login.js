/**
 * Script para probar el login de un usuario directamente
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

const testLogin = async (email, password) => {
  try {
    console.log(`🔍 Buscando usuario con email: ${email}`);
    
    // Buscar usuario (el email se guarda en lowercase)
    const user = await BaseUser.findOne({ 
      email: email.toLowerCase().trim()
    });

    if (!user) {
      console.log('❌ No se encontró el usuario');
      return false;
    }

    console.log(`✅ Usuario encontrado:`);
    console.log(`   Nombre: ${user.firstName} ${user.lastName}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   DNI: ${user.dni}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   isActive: ${user.isActive}`);
    console.log(`   mustChangePassword: ${user.mustChangePassword}`);
    console.log(`\n🔐 Verificando contraseña...`);
    console.log(`   Password ingresada: ${password}`);
    console.log(`   Password hasheada en DB: ${user.password.substring(0, 20)}...`);

    // Verificar contraseña
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (isMatch) {
      console.log('✅ La contraseña es CORRECTA');
      return true;
    } else {
      console.log('❌ La contraseña es INCORRECTA');
      
      // Intentar con el DNI
      if (user.dni && user.dni !== password) {
        console.log(`\n🔍 Intentando con DNI: ${user.dni}`);
        const dniMatch = await bcrypt.compare(user.dni, user.password);
        if (dniMatch) {
          console.log('✅ La contraseña correcta es el DNI');
          console.log(`\n💡 Usa esta contraseña: ${user.dni}`);
        } else {
          console.log('❌ El DNI tampoco coincide');
        }
      }
      
      return false;
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    return false;
  }
};

const resetPasswordDirectly = async (email, newPassword) => {
  try {
    const user = await BaseUser.findOne({ 
      email: email.toLowerCase().trim()
    });

    if (!user) {
      console.log('❌ No se encontró el usuario');
      return false;
    }

    console.log(`\n🔄 Reseteando contraseña...`);
    
    // Hashear la nueva contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Actualizar directamente en la base de datos
    await BaseUser.updateOne(
      { _id: user._id },
      { 
        $set: { 
          password: hashedPassword,
          mustChangePassword: true
        }
      }
    );

    console.log('✅ Contraseña actualizada directamente en la base de datos');
    console.log(`\n🔑 Nueva contraseña: ${newPassword}`);
    
    // Verificar inmediatamente
    const updatedUser = await BaseUser.findById(user._id);
    const testMatch = await bcrypt.compare(newPassword, updatedUser.password);
    
    if (testMatch) {
      console.log('✅ Verificación: La contraseña funciona correctamente');
    } else {
      console.log('❌ Verificación: ERROR - La contraseña no funciona');
    }

    return true;
  } catch (error) {
    console.error('❌ Error:', error.message);
    return false;
  }
};

const main = async () => {
  const email = process.argv[2] || 'sophie.martin@consultora.com';
  const password = process.argv[3] || '20345678';
  const reset = process.argv[4] === '--reset';

  await connectDB();
  
  try {
    if (reset) {
      console.log('🔄 Modo: RESET PASSWORD\n');
      await resetPasswordDirectly(email, password);
    } else {
      console.log('🔍 Modo: TEST LOGIN\n');
      await testLogin(email, password);
    }
  } catch (error) {
    console.error('❌ Error en el script:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Conexión cerrada');
    process.exit(0);
  }
};

main();

