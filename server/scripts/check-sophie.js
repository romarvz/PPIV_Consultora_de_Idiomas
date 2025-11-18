require('dotenv').config({ path: '.env' });
const mongoose = require('mongoose');
const { BaseUser } = require('../models');

async function check() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Conectado\n');

    // Buscar Sophie
    const sophie = await BaseUser.findOne({ 
      $or: [
        { email: /sophie/i },
        { firstName: /sophie/i },
        { lastName: /martin/i }
      ]
    }).select('-password');

    if (sophie) {
      console.log('✅ Sophie encontrada:');
      console.log('  ID:', sophie._id);
      console.log('  Nombre:', sophie.firstName, sophie.lastName);
      console.log('  Email:', sophie.email);
      console.log('  Role:', sophie.role);
      console.log('  isActive:', sophie.isActive);
      console.log('  condicion:', sophie.condicion);
      console.log('  createdAt:', sophie.createdAt);
    } else {
      console.log('❌ Sophie NO encontrada');
    }

    // Contar profesores
    const total = await BaseUser.countDocuments({ role: 'profesor' });
    console.log(`\nTotal profesores: ${total}`);

    // Listar todos ordenados por createdAt (como en el backend)
    const todos = await BaseUser.find({ role: 'profesor' })
      .select('firstName lastName email isActive condicion createdAt')
      .sort({ createdAt: -1 });
    
    console.log(`\nProfesores ordenados por createdAt (más recientes primero):`);
    todos.forEach((p, i) => {
      const marcador = (p.firstName?.toLowerCase().includes('sophie') || p.lastName?.toLowerCase().includes('martin')) ? ' ⭐' : '';
      console.log(`  ${i + 1}. ${p.firstName} ${p.lastName} - isActive: ${p.isActive}, condicion: ${p.condicion || 'null'}${marcador}`);
    });

    await mongoose.disconnect();
    console.log('\n✅ Listo');
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

check();

