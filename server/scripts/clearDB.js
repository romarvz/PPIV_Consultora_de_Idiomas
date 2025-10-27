// scripts/clearDB.js
// Script para limpiar la base de datos

require('dotenv').config();
const mongoose = require('mongoose');
const BaseUser = require('../models/BaseUser');
const Curso = require('../models/Curso');
const Inscripcion = require('../models/Inscripcion');
const Clase = require('../models/Clase');
const EventoCalendario = require('../models/EventoCalendario');

const clearDatabase = async () => {
  try {
    console.log('🔄 Conectando a MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado');

    console.log('\n🗑️  Limpiando colecciones...');
    
    await BaseUser.deleteMany({});
    console.log('   ✓ Usuarios eliminados');
    
    await Curso.deleteMany({});
    console.log('   ✓ Cursos eliminados');
    
    await Inscripcion.deleteMany({});
    console.log('   ✓ Inscripciones eliminadas');
    
    await Clase.deleteMany({});
    console.log('   ✓ Clases eliminadas');
    
    await EventoCalendario.deleteMany({});
    console.log('   ✓ Eventos eliminados');

    console.log('\n✅ Base de datos limpiada exitosamente');
    
    await mongoose.connection.close();
    console.log('👋 Conexión cerrada\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

clearDatabase();