const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Importar modelos
const Admin = require('../models/Admin');
const Estudiante = require('../models/Estudiante');
const Profesor = require('../models/Profesor');

async function createUsers() {
  try {
    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB');

    // Crear Admin
    const adminExists = await Admin.findOne({ email: 'admin@consultora.com' });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('Admin123!', 12);
      const admin = new Admin({
        firstName: 'Admin',
        lastName: 'Sistema',
        email: 'admin@consultora.com',
        password: hashedPassword,
        role: 'admin',
        isActive: true,
        mustChangePassword: false
      });
      await admin.save();
      console.log('✅ Admin creado: admin@consultora.com / Admin123!');
    } else {
      console.log('ℹ️ Admin ya existe');
    }

    // Crear Estudiante
    const studentExists = await Estudiante.findOne({ email: 'estudiante1@test.com' });
    if (!studentExists) {
      const hashedPassword = await bcrypt.hash('12345678', 12);
      const student = new Estudiante({
        firstName: 'María',
        lastName: 'González',
        email: 'estudiante1@test.com',
        password: hashedPassword,
        role: 'estudiante',
        dni: '12345678',
        nivel: 'B1',
        estadoAcademico: 'inscrito',
        phone: '+54911234567',
        isActive: true,
        mustChangePassword: false
      });
      await student.save();
      console.log('✅ Estudiante creado: estudiante1@test.com / 12345678');
    } else {
      console.log('ℹ️ Estudiante ya existe');
    }

    // Crear Profesor
    const teacherExists = await Profesor.findOne({ email: 'profesor1@test.com' });
    if (!teacherExists) {
      const hashedPassword = await bcrypt.hash('87654321', 12);
      const teacher = new Profesor({
        firstName: 'Carlos',
        lastName: 'Rodríguez',
        email: 'profesor1@test.com',
        password: hashedPassword,
        role: 'profesor',
        dni: '87654321',
        especialidades: ['ingles', 'frances'],
        tarifaPorHora: 2500,
        phone: '+54911234569',
        isActive: true,
        mustChangePassword: false
      });
      await teacher.save();
      console.log('✅ Profesor creado: profesor1@test.com / 87654321');
    } else {
      console.log('ℹ️ Profesor ya existe');
    }

    console.log('\n🎉 Usuarios de prueba creados exitosamente!');
    console.log('\n📋 CREDENCIALES PARA TESTS:');
    console.log('Admin: admin@consultora.com / Admin123!');
    console.log('Estudiante: estudiante1@test.com / 12345678');
    console.log('Profesor: profesor1@test.com / 87654321');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconectado de MongoDB');
  }
}

createUsers();