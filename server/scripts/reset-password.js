const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const Admin = require('../models/Admin');

async function resetAdminPassword() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB');

    const hashedPassword = await bcrypt.hash('Admin123!', 12);
    
    const result = await Admin.updateOne(
      { email: 'admin@consultora.com' },
      { 
        password: hashedPassword,
        mustChangePassword: false 
      }
    );

    if (result.modifiedCount > 0) {
      console.log('✅ Contraseña del admin actualizada');
      console.log('📧 Email: admin@consultora.com');
      console.log('🔑 Password: Admin123!');
    } else {
      console.log('❌ No se encontró el admin o no se pudo actualizar');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

resetAdminPassword();