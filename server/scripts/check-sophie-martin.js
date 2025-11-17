/**
 * Script para verificar los datos de Sophie Martin
 * Ejecutar: node server/scripts/check-sophie-martin.js
 */

require('dotenv').config({ path: '.env' });
const mongoose = require('mongoose');
const { BaseUser } = require('../models');

async function checkSophieMartin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/consultora_idiomas');
    console.log('✅ Conectado a MongoDB\n');

    // Buscar Sophie Martin por email
    const sophie = await BaseUser.findOne({ 
      email: { $regex: /sophie/i } 
    }).select('-password');

    if (!sophie) {
      console.log('❌ No se encontró Sophie Martin por email');
      
      // Buscar por nombre
      const sophieByName = await BaseUser.find({
        $or: [
          { firstName: { $regex: /sophie/i } },
          { lastName: { $regex: /martin/i } }
        ]
      }).select('-password');
      
      if (sophieByName.length === 0) {
        console.log('❌ No se encontró Sophie Martin por nombre tampoco');
      } else {
        console.log(`\n📋 Encontrados ${sophieByName.length} usuarios con nombre/apellido similar:`);
        sophieByName.forEach(u => {
          console.log(`  - ${u.firstName} ${u.lastName} (${u.email}) - Role: ${u.role}, isActive: ${u.isActive}, condicion: ${u.condicion}`);
        });
      }
    } else {
      console.log('✅ Sophie Martin encontrada:');
      console.log('  - ID:', sophie._id);
      console.log('  - Nombre:', sophie.firstName, sophie.lastName);
      console.log('  - Email:', sophie.email);
      console.log('  - Role:', sophie.role);
      console.log('  - isActive:', sophie.isActive);
      console.log('  - condicion:', sophie.condicion);
      console.log('  - disponible:', sophie.disponible);
      console.log('  - especialidades:', sophie.especialidades);
      console.log('  - createdAt:', sophie.createdAt);
    }

    // Verificar cuántos profesores hay en total
    const totalProfesores = await BaseUser.countDocuments({ role: 'profesor' });
    console.log(`\n📊 Total de profesores en la BD: ${totalProfesores}`);

    // Verificar profesores activos
    const profesoresActivos = await BaseUser.countDocuments({ 
      role: 'profesor', 
      isActive: true 
    });
    console.log(`📊 Profesores activos (isActive: true): ${profesoresActivos}`);

    // Verificar profesores con condicion activo
    const profesoresCondicionActivo = await BaseUser.countDocuments({ 
      role: 'profesor', 
      condicion: 'activo' 
    });
    console.log(`📊 Profesores con condicion='activo': ${profesoresCondicionActivo}`);

    // Listar todos los profesores
    const todosProfesores = await BaseUser.find({ role: 'profesor' })
      .select('firstName lastName email isActive condicion disponible')
      .sort({ lastName: 1, firstName: 1 });
    
    console.log(`\n📋 Lista de todos los profesores (${todosProfesores.length}):`);
    todosProfesores.forEach((p, i) => {
      const marcador = (p.firstName?.toLowerCase().includes('sophie') || p.lastName?.toLowerCase().includes('martin')) ? ' ⭐' : '';
      console.log(`  ${i + 1}. ${p.firstName} ${p.lastName} (${p.email}) - isActive: ${p.isActive}, condicion: ${p.condicion || 'null'}, disponible: ${p.disponible}${marcador}`);
    });

    await mongoose.disconnect();
    console.log('\n✅ Desconectado de MongoDB');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkSophieMartin();

