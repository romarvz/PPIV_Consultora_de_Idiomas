/**
 * Script para eliminar reportes académicos
 * 
 * Uso:
 * node server/scripts/eliminar-reportes.js [cursoId]
 * 
 * Si se proporciona cursoId, elimina solo los reportes de ese curso
 * Si no se proporciona, elimina todos los reportes
 */

require('dotenv').config({ path: '.env' });
const mongoose = require('mongoose');
const ReporteAcademico = require('../models/ReporteAcademico');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/consultora_idiomas';

async function eliminarReportes(cursoId = null) {
  try {
    // Conectar a MongoDB
    console.log('Conectando a MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado a MongoDB');

    // Construir query
    const query = cursoId ? { curso: cursoId } : {};

    // Contar reportes a eliminar
    const cantidad = await ReporteAcademico.countDocuments(query);
    console.log(`\n📊 Reportes encontrados: ${cantidad}`);

    if (cantidad === 0) {
      console.log('✅ No hay reportes para eliminar');
      await mongoose.disconnect();
      return;
    }

    // Mostrar algunos reportes antes de eliminar
    if (cursoId) {
      console.log(`\n🗑️  Eliminando reportes del curso: ${cursoId}`);
    } else {
      console.log('\n🗑️  Eliminando TODOS los reportes académicos');
    }

    // Eliminar reportes
    const resultado = await ReporteAcademico.deleteMany(query);
    
    console.log(`\n✅ Eliminados ${resultado.deletedCount} reporte(s) exitosamente`);

    // Desconectar
    await mongoose.disconnect();
    console.log('\n✅ Desconectado de MongoDB');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Obtener argumentos de línea de comandos
const cursoId = process.argv[2] || null;

if (cursoId && !mongoose.Types.ObjectId.isValid(cursoId)) {
  console.error('❌ Error: El cursoId proporcionado no es válido');
  process.exit(1);
}

// Ejecutar
eliminarReportes(cursoId);

