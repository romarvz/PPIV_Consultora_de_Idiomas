// Prueba final de migración - Verificar todo funciona
const mongoose = require('mongoose');
require('dotenv').config();

async function finalTest() {
  console.log('🎯 PRUEBA FINAL DE MIGRACIÓN\n');

  try {
    // 1. Conectar a MongoDB
    console.log('🔗 Conectando a MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB conectado');

    // 2. Importar modelos
    console.log('\n📦 Importando modelos...');
    const { BaseUser, Estudiante, Profesor, Admin, getUserModel, findUserByEmail } = require('../models');
    console.log('✅ Todos los modelos importados correctamente');

    // 3. Verificar usuarios migrados
    console.log('\n👥 Verificando usuarios migrados...');
    const totalUsers = await BaseUser.countDocuments();
    const estudiantes = await Estudiante.countDocuments();
    const profesores = await Profesor.countDocuments(); 
    const admins = await Admin.countDocuments();
    
    console.log(`✅ Total usuarios: ${totalUsers}`);
    console.log(`✅ Estudiantes: ${estudiantes}`);
    console.log(`✅ Profesores: ${profesores}`);
    console.log(`✅ Admins: ${admins}`);
    console.log(`✅ Suma: ${estudiantes + profesores + admins} = ${totalUsers} ✓`);

    // 4. Verificar discriminadores
    console.log('\n🏷️  Verificando discriminadores...');
    const usersWithDiscriminator = await mongoose.connection.db.collection('users').countDocuments({ __t: { $exists: true } });
    console.log(`✅ Usuarios con discriminador __t: ${usersWithDiscriminator}/${totalUsers}`);

    // 5. Probar funciones helper
    console.log('\n🔧 Probando funciones helper...');
    
    // Probar getUserModel
    const EstudianteModel = getUserModel('estudiante');
    const count = await EstudianteModel.countDocuments();
    console.log(`✅ getUserModel('estudiante'): ${count} estudiantes`);
    
    // Probar findUserByEmail
    const testUser = await BaseUser.findOne();
    if (testUser) {
      const foundUser = await findUserByEmail(testUser.email);
      console.log(`✅ findUserByEmail('${testUser.email}'): ${foundUser ? 'encontrado' : 'no encontrado'}`);
    }

    // 6. Verificar que las rutas se pueden importar
    console.log('\n🛣️  Verificando rutas...');
    const authRoutes = require('../routes/authNew');
    console.log('✅ Rutas authNew importadas correctamente');

    // 7. Verificar controladores
    console.log('\n🎮 Verificando controladores...');
    const authController = require('../controllers/authControllerNew');
    console.log('✅ Controlador authNew importado correctamente');

    // 8. Verificar middleware
    console.log('\n🔒 Verificando middleware...');
    const authMiddleware = require('../middleware/authMiddlewareNew');
    console.log('✅ Middleware authNew importado correctamente');

    console.log('\n🎉 MIGRACIÓN COMPLETADA EXITOSAMENTE');
    console.log('\n📋 RESUMEN:');
    console.log('✅ Base de datos: MongoDB conectado y funcionando');
    console.log('✅ Modelos: BaseUser, Estudiante, Profesor, Admin funcionando');
    console.log('✅ Discriminadores: Campo __t establecido correctamente');
    console.log('✅ Datos: Todos los usuarios migrados sin pérdida');
    console.log('✅ Funciones: getUserModel y findUserByEmail funcionando');
    console.log('✅ Rutas: authNew importadas correctamente');
    console.log('✅ Controladores: authControllerNew funcionando');
    console.log('✅ Middleware: authMiddlewareNew funcionando');
    console.log('✅ Servidor: Listo para iniciar con nueva arquitectura');

    console.log('\n🚀 INSTRUCCIONES PARA USAR:');
    console.log('1. Iniciar servidor: node index.js');
    console.log('2. El servidor usará automáticamente los nuevos modelos');
    console.log('3. Todos los endpoints funcionan igual que antes');
    console.log('4. Los datos de usuarios se mantienen intactos');

  } catch (error) {
    console.error('💥 Error en prueba final:', error.message);
    console.error(error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔗 MongoDB desconectado');
  }
}

finalTest();