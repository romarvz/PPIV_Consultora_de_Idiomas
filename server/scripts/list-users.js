const mongoose = require('mongoose');
require('dotenv').config();

// Importar modelos
const Admin = require('../models/Admin');
const Estudiante = require('../models/Estudiante');
const Profesor = require('../models/Profesor');

async function listUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB\n');

    // Listar Admins
    const admins = await Admin.find({}, 'firstName lastName email role isActive');
    console.log('👑 ADMINS:');
    admins.forEach(admin => {
      console.log(`- ${admin.firstName} ${admin.lastName} (${admin.email}) - ${admin.isActive ? 'Activo' : 'Inactivo'}`);
    });

    // Listar Estudiantes
    const students = await Estudiante.find({}, 'firstName lastName email role isActive');
    console.log('\n🎓 ESTUDIANTES:');
    students.forEach(student => {
      console.log(`- ${student.firstName} ${student.lastName} (${student.email}) - ${student.isActive ? 'Activo' : 'Inactivo'}`);
    });

    // Listar Profesores
    const teachers = await Profesor.find({}, 'firstName lastName email role isActive');
    console.log('\n👨‍🏫 PROFESORES:');
    teachers.forEach(teacher => {
      console.log(`- ${teacher.firstName} ${teacher.lastName} (${teacher.email}) - ${teacher.isActive ? 'Activo' : 'Inactivo'}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

listUsers();