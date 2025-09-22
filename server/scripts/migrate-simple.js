const mongoose = require('mongoose');
require('dotenv').config();

// Función principal de migración
async function migrateUsers() {
  try {
    console.log('🚀 Iniciando migración de usuarios...');
    
    // Conectar a la base de datos
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB');

    // Obtener usuarios directamente de la colección
    const usersCollection = mongoose.connection.db.collection('users');
    const oldUsers = await usersCollection.find({}).toArray();
    console.log(`📊 Encontrados ${oldUsers.length} usuarios para migrar`);

    if (oldUsers.length === 0) {
      console.log('⚠️  No hay usuarios para migrar');
      return;
    }

    // Crear backup
    const backupCollectionName = `users_backup_${Date.now()}`;
    await usersCollection.aggregate([
      { $out: backupCollectionName }
    ]).toArray();
    console.log(`💾 Backup creado: ${backupCollectionName}`);

    let migratedCount = 0;
    let errorCount = 0;

    // Migrar cada usuario
    for (const oldUser of oldUsers) {
      try {
        console.log(`🔄 Migrando usuario: ${oldUser.email} (${oldUser.role})`);

        // Verificar que tiene todos los campos necesarios
        if (!oldUser.role) {
          console.log(`⚠️  Usuario ${oldUser.email} sin rol, asignando 'estudiante'`);
          oldUser.role = 'estudiante';
        }

        // Actualizar el usuario en la misma colección agregando el discriminator
        const updateData = {
          ...oldUser,
          __t: oldUser.role // Agregar el discriminator
        };

        // Para estudiantes, asegurar campos específicos
        if (oldUser.role === 'estudiante') {
          updateData.nivel = oldUser.nivel || 'A1';
          updateData.estadoAcademico = oldUser.condicion || oldUser.estadoAcademico || 'inscrito';
          // Limpiar campos de otros roles
          delete updateData.especialidades;
          delete updateData.tarifaPorHora;
          delete updateData.disponibilidad;
        }

        // Para profesores, asegurar campos específicos
        if (oldUser.role === 'profesor') {
          updateData.especialidades = oldUser.especialidades || ['ingles'];
          updateData.tarifaPorHora = oldUser.tarifaPorHora || 0;
          updateData.disponibilidad = oldUser.disponibilidad || {};
          // Limpiar campos de otros roles
          delete updateData.nivel;
          delete updateData.estadoAcademico;
          delete updateData.condicion;
        }

        // Para admins, limpiar campos de otros roles
        if (oldUser.role === 'admin') {
          updateData.permisos = ['todos'];
          delete updateData.nivel;
          delete updateData.estadoAcademico;
          delete updateData.condicion;
          delete updateData.especialidades;
          delete updateData.tarifaPorHora;
          delete updateData.disponibilidad;
        }

        // Actualizar en la base de datos
        await usersCollection.replaceOne(
          { _id: oldUser._id },
          updateData
        );

        migratedCount++;
        console.log(`✅ Usuario migrado: ${oldUser.email}`);

      } catch (error) {
        console.error(`❌ Error migrando usuario ${oldUser.email}:`, error.message);
        errorCount++;
      }
    }

    console.log('\n📈 RESUMEN DE MIGRACIÓN:');
    console.log(`✅ Usuarios migrados exitosamente: ${migratedCount}`);
    console.log(`❌ Errores en migración: ${errorCount}`);
    console.log(`💾 Backup disponible en: ${backupCollectionName}`);

    // Verificar que la migración fue exitosa
    const newUsersCount = await usersCollection.countDocuments();
    console.log(`🔍 Usuarios después de migración: ${newUsersCount}`);

    if (newUsersCount === migratedCount && errorCount === 0) {
      console.log('🎉 ¡Migración completada exitosamente!');
      console.log('💡 Ahora puedes actualizar tu aplicación para usar los nuevos modelos');
    } else {
      console.log('⚠️  La migración tuvo algunos problemas. Revisa los logs.');
    }

  } catch (error) {
    console.error('💥 Error general en la migración:', error);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Desconectado de MongoDB');
  }
}

// Función para verificar estado actual
async function checkMigrationStatus() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const usersCollection = mongoose.connection.db.collection('users');
    const totalUsers = await usersCollection.countDocuments();
    const estudiantes = await usersCollection.countDocuments({ role: 'estudiante' });
    const profesores = await usersCollection.countDocuments({ role: 'profesor' });
    const admins = await usersCollection.countDocuments({ role: 'admin' });
    const withDiscriminator = await usersCollection.countDocuments({ __t: { $exists: true } });

    console.log('\n📊 ESTADO ACTUAL:');
    console.log(`👥 Total usuarios: ${totalUsers}`);
    console.log(`🎓 Estudiantes: ${estudiantes}`);
    console.log(`👨‍🏫 Profesores: ${profesores}`);
    console.log(`👑 Administradores: ${admins}`);
    console.log(`🏷️  Con discriminator (__t): ${withDiscriminator}`);

    if (withDiscriminator > 0) {
      console.log('✅ Los usuarios ya están migrados');
    } else {
      console.log('⚠️  Los usuarios NO están migrados');
    }

  } catch (error) {
    console.error('❌ Error verificando estado:', error);
  } finally {
    await mongoose.disconnect();
  }
}

// Función para restaurar desde backup
async function restoreFromBackup(backupCollectionName) {
  try {
    console.log(`🔄 Restaurando desde backup: ${backupCollectionName}`);
    
    await mongoose.connect(process.env.MONGODB_URI);
    
    // Verificar que el backup existe
    const collections = await mongoose.connection.db.listCollections({ name: backupCollectionName }).toArray();
    if (collections.length === 0) {
      throw new Error(`Backup ${backupCollectionName} no encontrado`);
    }

    // Eliminar colección actual
    await mongoose.connection.db.collection('users').drop();
    
    // Restaurar desde backup
    await mongoose.connection.db.collection(backupCollectionName).aggregate([
      { $out: 'users' }
    ]).toArray();

    console.log('✅ Backup restaurado exitosamente');

  } catch (error) {
    console.error('❌ Error restaurando backup:', error);
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
        console.error('❌ Debes proporcionar el nombre del backup: node migrate-simple.js restore <backup_name>');
        process.exit(1);
      }
      restoreFromBackup(argument);
      break;
    case 'status':
      checkMigrationStatus();
      break;
    default:
      console.log('📋 Comandos disponibles:');
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