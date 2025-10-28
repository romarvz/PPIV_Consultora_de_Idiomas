const mongoose = require('mongoose');
require('dotenv').config();

// Función principal de migración
async function migrateUsers() {
  try {
    console.log(' Iniciando migración de usuarios...');
    
    // Conecting to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log(' Conectado a MongoDB');

    // get all users
    const usersCollection = mongoose.connection.db.collection('users');
    const oldUsers = await usersCollection.find({}).toArray();
    console.log(` Encontrados ${oldUsers.length} usuarios para migrar`);

    if (oldUsers.length === 0) {
      console.log('  No hay usuarios para migrar');
      return;
    }

    // Create backup
    const backupCollectionName = `users_backup_${Date.now()}`;
    await usersCollection.aggregate([
      { $out: backupCollectionName }
    ]).toArray();
    console.log(` Backup creado: ${backupCollectionName}`);

    let migratedCount = 0;
    let errorCount = 0;

    // migration
    for (const oldUser of oldUsers) {
      try {
        console.log(`🔄 Migrando usuario: ${oldUser.email} (${oldUser.role})`);

       
        if (!oldUser.role) {
          console.log(`  Usuario ${oldUser.email} sin rol, asignando 'estudiante'`);
          oldUser.role = 'estudiante';
        }

        
        const updateData = {
          ...oldUser,
          __t: oldUser.role
        };

      
        if (oldUser.role === 'estudiante') {
          updateData.nivel = oldUser.nivel || 'A1';
          updateData.estadoAcademico = oldUser.condicion || oldUser.estadoAcademico || 'inscrito';
       
          delete updateData.especialidades;
          delete updateData.tarifaPorHora;
          delete updateData.disponibilidad;
        }

        
        if (oldUser.role === 'profesor') {
          updateData.especialidades = oldUser.especialidades || ['ingles'];
          updateData.tarifaPorHora = oldUser.tarifaPorHora || 0;
          updateData.disponibilidad = oldUser.disponibilidad || {};
          
          delete updateData.nivel;
          delete updateData.estadoAcademico;
          delete updateData.condicion;
        }

       
        if (oldUser.role === 'admin') {
          updateData.permisos = ['todos'];
          delete updateData.nivel;
          delete updateData.estadoAcademico;
          delete updateData.condicion;
          delete updateData.especialidades;
          delete updateData.tarifaPorHora;
          delete updateData.disponibilidad;
        }

       
        await usersCollection.replaceOne(
          { _id: oldUser._id },
          updateData
        );

        migratedCount++;
        console.log(` Usuario migrado: ${oldUser.email}`);

      } catch (error) {
        console.error(` Error migrando usuario ${oldUser.email}:`, error.message);
        errorCount++;
      }
    }

    console.log('\n RESUMEN DE MIGRACIÓN:');
    console.log(` Usuarios migrados exitosamente: ${migratedCount}`);
    console.log(` Errores en migración: ${errorCount}`);
    console.log(` Backup disponible en: ${backupCollectionName}`);

    
    const newUsersCount = await usersCollection.countDocuments();
    console.log(` Usuarios después de migración: ${newUsersCount}`);

    if (newUsersCount === migratedCount && errorCount === 0) {
      console.log(' ¡Migración completada exitosamente!');
      console.log(' Ahora puedes actualizar tu aplicación para usar los nuevos modelos');
    } else {
      console.log('  La migración tuvo algunos problemas. Revisa los logs.');
    }

  } catch (error) {
    console.error(' Error general en la migración:', error);
  } finally {
    await mongoose.disconnect();
    console.log(' Desconectado de MongoDB');
  }
}


async function checkMigrationStatus() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const usersCollection = mongoose.connection.db.collection('users');
    const totalUsers = await usersCollection.countDocuments();
    const estudiantes = await usersCollection.countDocuments({ role: 'estudiante' });
    const profesores = await usersCollection.countDocuments({ role: 'profesor' });
    const admins = await usersCollection.countDocuments({ role: 'admin' });
    const withDiscriminator = await usersCollection.countDocuments({ __t: { $exists: true } });

    console.log('\n ESTADO ACTUAL:');
    console.log(` Total usuarios: ${totalUsers}`);
    console.log(` Estudiantes: ${estudiantes}`);
    console.log(` Profesores: ${profesores}`);
    console.log(` Administradores: ${admins}`);
    console.log(`  Con discriminator (__t): ${withDiscriminator}`);

    if (withDiscriminator > 0) {
      console.log(' Los usuarios ya están migrados');
    } else {
      console.log('  Los usuarios NO están migrados');
    }

  } catch (error) {
    console.error('❌ Error verificando estado:', error);
  } finally {
    await mongoose.dsconnect();
  }
}


async function restoreFromBackup(backupCollectionName) {
  try {
    console.log(` Restaurando desde backup: ${backupCollectionName}`);
    
    await mongoose.connect(process.env.MONGODB_URI);
    
    
    const collections = await mongoose.connection.db.listCollections({ name: backupCollectionName }).toArray();
    if (collections.length === 0) {
      throw new Error(`Backup ${backupCollectionName} no encontrado`);
    }


    await mongoose.connection.db.collection('users').drop();
    
  
    await mongoose.connection.db.collection(backupCollectionName).aggregate([
      { $out: 'users' }
    ]).toArray();

    console.log(' Backup restaurado exitosamente');

  } catch (error) {
    console.error(' Error restaurando backup:', error);
  } finally {
    await mongoose.disconnect();
  }
}

// CLI
if (require.main === module) {
  const command = process.argv[2];
  const argument = process.argv[3];

  switch (command) {
    case 'migrate':
      migrateUsers();
      break;
    case 'restore':
      if (!argument) {
        console.error(' Debes proporcionar el nombre del backup: node migrate-simple.js restore <backup_name>');
        process.exit(1);
      }
      restoreFromBackup(argument);
      break;
    case 'status':
      checkMigrationStatus();
      break;
    default:
      console.log(' Comandos disponibles:');
      console.log('  node migrate-simple.js migrate  - Migrar usuarios al nuevo formato');
      console.log('  node migrate-simple.js restore <backup_name>  - Restaurar desde backup');
      console.log('  node migrate-simple.js status   - Ver estado actual');
  }
}

module.exports = {
  migrateUsers,
  restoreFromBackup,
  checkMigrationStatus
};