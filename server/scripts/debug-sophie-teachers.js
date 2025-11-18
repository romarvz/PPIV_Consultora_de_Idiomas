/**
 * Script para depurar por qué Sophie Martin no aparece en el listado de profesores
 * Ejecutar: node server/scripts/debug-sophie-teachers.js
 */

require('dotenv').config({ path: '.env' });
const mongoose = require('mongoose');
const { BaseUser } = require('../models');

async function debugSophieTeachers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/consultora_idiomas');
    console.log('✅ Conectado a MongoDB\n');

    // Buscar Sophie Martin
    const sophie = await BaseUser.findOne({ 
      $or: [
        { email: { $regex: /sophie/i } },
        { firstName: { $regex: /sophie/i } },
        { lastName: { $regex: /martin/i } }
      ]
    }).select('-password');

    if (!sophie) {
      console.log('❌ Sophie Martin NO encontrada en la base de datos');
      await mongoose.disconnect();
      return;
    }

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
    console.log('  - __t (discriminator):', sophie.__t || 'BaseUser (no discriminador)');
    console.log('');

    // Verificar filtros del endpoint /teachers
    console.log('🔍 Verificando filtros del endpoint /teachers:');
    
    const filterAll = { role: 'profesor' };
    const countAll = await BaseUser.countDocuments(filterAll);
    console.log(`  - Total profesores (role='profesor'): ${countAll}`);

    const filterActivo = {
      role: 'profesor',
      $and: [{
        $or: [
          { isActive: true },
          { condicion: 'activo' }
        ]
      }]
    };
    const countActivo = await BaseUser.countDocuments(filterActivo);
    console.log(`  - Profesores activos (isActive=true OR condicion='activo'): ${countActivo}`);

    const filterInactivo = {
      role: 'profesor',
      $and: [{
        $and: [
          { isActive: false },
          { $or: [{ condicion: 'inactivo' }, { condicion: { $exists: false } }] }
        ]
      }]
    };
    const countInactivo = await BaseUser.countDocuments(filterInactivo);
    console.log(`  - Profesores inactivos: ${countInactivo}`);

    // Verificar si Sophie cumple con los filtros
    console.log('\n🔍 Verificando si Sophie cumple con los filtros:');
    const sophieMatchesAll = await BaseUser.countDocuments({ _id: sophie._id, ...filterAll });
    console.log(`  - ¿Aparece en filtro 'all'? ${sophieMatchesAll > 0 ? '✅ SÍ' : '❌ NO'}`);
    
    const sophieMatchesActivo = await BaseUser.countDocuments({ _id: sophie._id, ...filterActivo });
    console.log(`  - ¿Aparece en filtro 'activo'? ${sophieMatchesActivo > 0 ? '✅ SÍ' : '❌ NO'}`);
    
    const sophieMatchesInactivo = await BaseUser.countDocuments({ _id: sophie._id, ...filterInactivo });
    console.log(`  - ¿Aparece en filtro 'inactivo'? ${sophieMatchesInactivo > 0 ? '✅ SÍ' : '❌ NO'}`);

    // Listar todos los profesores para comparar
    console.log('\n📋 Lista de todos los profesores:');
    const allTeachers = await BaseUser.find({ role: 'profesor' })
      .select('firstName lastName email isActive condicion disponible __t')
      .sort({ lastName: 1, firstName: 1 });
    
    allTeachers.forEach((p, i) => {
      const marcador = (p._id.toString() === sophie._id.toString()) ? ' ⭐ SOPHIE' : '';
      const discriminator = p.__t || 'BaseUser';
      console.log(`  ${i + 1}. ${p.firstName} ${p.lastName} (${p.email}) - isActive: ${p.isActive}, condicion: ${p.condicion || 'null'}, disponible: ${p.disponible}, tipo: ${discriminator}${marcador}`);
    });

    await mongoose.disconnect();
    console.log('\n✅ Desconectado de MongoDB');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

debugSophieTeachers();

