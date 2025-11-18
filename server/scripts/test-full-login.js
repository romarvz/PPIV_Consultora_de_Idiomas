/**
 * Script para probar el login completo simulando el endpoint
 */

const mongoose = require('mongoose');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

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

const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET || 'mi_clave_secreta',
    { expiresIn: '24h' }
  );
};

const testFullLogin = async (email, password) => {
  try {
    console.log(`🔍 Probando login completo para: ${email}\n`);
    
    // 1. Normalizar email
    const normalizedEmail = email ? email.toLowerCase().trim() : email;
    console.log(`📧 Email normalizado: ${normalizedEmail}`);
    
    // 2. Buscar usuario
    const user = await BaseUser.findOne({ email: normalizedEmail });
    if (!user) {
      console.log('❌ Usuario no encontrado');
      return false;
    }
    console.log(`✅ Usuario encontrado: ${user.firstName} ${user.lastName}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   isActive: ${user.isActive}`);
    
    // 3. Verificar si está activo
    if (!user.isActive) {
      console.log('❌ Cuenta desactivada');
      return false;
    }
    
    // 4. Verificar contraseña
    console.log('\n🔐 Verificando contraseña...');
    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      console.log('❌ Contraseña incorrecta');
      return false;
    }
    console.log('✅ Contraseña correcta');
    
    // 5. Actualizar lastLogin
    console.log('\n📝 Actualizando lastLogin...');
    try {
      await BaseUser.updateOne(
        { _id: user._id },
        { $set: { lastLogin: new Date() } }
      );
      console.log('✅ lastLogin actualizado');
    } catch (error) {
      console.error('❌ Error actualizando lastLogin:', error.message);
      throw error;
    }
    
    // 6. Generar token
    console.log('\n🎫 Generando token...');
    try {
      const token = generateToken(user._id);
      console.log(`✅ Token generado: ${token.substring(0, 20)}...`);
    } catch (error) {
      console.error('❌ Error generando token:', error.message);
      throw error;
    }
    
    // 7. Convertir a JSON
    console.log('\n📄 Convirtiendo usuario a JSON...');
    try {
      const userJSON = user.toJSON();
      console.log('✅ Usuario convertido a JSON');
      console.log(`   Campos: ${Object.keys(userJSON).join(', ')}`);
    } catch (error) {
      console.error('❌ Error convirtiendo a JSON:', error.message);
      throw error;
    }
    
    console.log('\n✅ Login completo exitoso');
    return true;
    
  } catch (error) {
    console.error('\n❌ Error en login completo:');
    console.error('   Mensaje:', error.message);
    console.error('   Stack:', error.stack);
    return false;
  }
};

const main = async () => {
  const email = process.argv[2] || 'laura.lopez@email.com';
  const password = process.argv[3] || '30456789';

  await connectDB();
  
  try {
    const success = await testFullLogin(email, password);
    if (!success) {
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

