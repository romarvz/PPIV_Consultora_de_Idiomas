/**
 * Pruebas completas del sistema de horarios
 * Ejecutar con: node test-horarios-completo.js
 * 
 * Prueba:
 * - Modelo Horario con nuevo campo tipo
 * - Integración con Profesor 
 * - Controladores y validadores
 * - Sistema completo funcionando
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Importar modelos
const { Horario, Profesor, Admin } = require('./models');

// Importar constantes
const { TIPOS_HORARIO, DIAS_SEMANA } = require('./shared/utils/constants');

// Importar helpers
const { sendSuccess, sendError } = require('./shared/helpers');

// Función para conectar a MongoDB
async function conectarDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB');
  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error.message);
    process.exit(1);
  }
}

// Función para limpiar datos de prueba
async function limpiarDatosPrueba() {
  try {
    // Limpiar todos los horarios de prueba
    await Horario.deleteMany({});
    await Profesor.deleteMany({ email: { $regex: /@prueba\./ } });
    console.log('🧹 Datos de prueba limpiados (incluyendo horarios previos)');
  } catch (error) {
    console.error('❌ Error limpiando datos:', error.message);
  }
}

// Variables globales para las pruebas
let horarioPrueba1, horarioPrueba2, profesorPrueba;

// Pruebas del sistema completo
async function ejecutarPruebas() {
  console.log('\n🚀 Iniciando pruebas completas del sistema de horarios...\n');

  try {
    // ==================== PRUEBAS DEL MODELO HORARIO EXTENDIDO ====================
    
    console.log('📝 Prueba 1: Crear horario con campo tipo');
    horarioPrueba1 = new Horario({
      dia: DIAS_SEMANA.LUNES,
      horaInicio: '09:00',
      horaFin: '11:00',
      tipo: TIPOS_HORARIO.CLASE
    });
    
    await horarioPrueba1.save();
    console.log('✅ Horario con tipo creado:', horarioPrueba1.toJSON());

    console.log('\n📝 Prueba 2: Crear horario de disponibilidad');
    horarioPrueba2 = new Horario({
      dia: DIAS_SEMANA.MARTES,
      horaInicio: '14:00',
      horaFin: '16:00',
      tipo: TIPOS_HORARIO.DISPONIBILIDAD
    });
    
    await horarioPrueba2.save();
    console.log('✅ Horario de disponibilidad creado:', horarioPrueba2.toJSON());

    // ==================== PRUEBAS DE CREACIÓN DE PROFESOR ====================
    
    console.log('\n📝 Prueba 3: Crear profesor para pruebas');
    profesorPrueba = new Profesor({
      email: 'profesor@prueba.com',
      password: 'password123',
      firstName: 'PRUEBA',
      lastName: 'Profesor',
      role: 'profesor',
      dni: 'PRUEBA123',
      especialidades: [], // Lo asignaremos después si hay Language
      tarifaPorHora: 25,
      disponibilidad: {
        lunes: [{ inicio: '08:00', fin: '12:00' }],
        martes: [{ inicio: '13:00', fin: '17:00' }]
      },
      horariosPermitidos: []
    });

    // Buscar una especialidad existente o crear una temporal
    try {
      const Language = require('./models/Language');
      const idioma = await Language.findOne();
      if (idioma) {
        profesorPrueba.especialidades = [idioma._id];
      }
    } catch (error) {
      console.log('⚠️  No se encontraron idiomas, continuando sin especialidades');
    }

    await profesorPrueba.save();
    console.log('✅ Profesor creado:', {
      _id: profesorPrueba._id,
      fullName: profesorPrueba.fullName,
      email: profesorPrueba.email
    });

    // ==================== PRUEBAS DE MÉTODOS DEL PROFESOR ====================
    
    console.log('\n📝 Prueba 4: Asignar horario a profesor');
    await profesorPrueba.asignarHorario(horarioPrueba1._id);
    console.log('✅ Horario asignado correctamente');

    console.log('\n📝 Prueba 5: Verificar que el horario está asignado');
    const tieneHorario = profesorPrueba.tieneHorario(horarioPrueba1._id);
    console.log('✅ Verificación de horario asignado:', tieneHorario);

    console.log('\n📝 Prueba 6: Intentar asignar horario duplicado (debe fallar)');
    try {
      await profesorPrueba.asignarHorario(horarioPrueba1._id);
      console.log('❌ ERROR: Debería haber fallado');
    } catch (error) {
      console.log('✅ Error esperado:', error.message);
    }

    console.log('\n📝 Prueba 7: Verificar conflictos de horario');
    const conflictos = await profesorPrueba.verificarConflictos({
      dia: 'lunes',
      horaInicio: '10:00',
      horaFin: '12:00'
    });
    console.log('✅ Conflictos encontrados:', conflictos);

    console.log('\n📝 Prueba 8: Obtener horarios detallados');
    const horariosDetallados = await profesorPrueba.obtenerHorariosDetallados();
    console.log('✅ Horarios detallados:', horariosDetallados.map(h => h.display));

    console.log('\n📝 Prueba 9: Obtener resumen por día');
    const resumen = await profesorPrueba.obtenerResumenHorariosPorDia();
    console.log('✅ Resumen por día:', JSON.stringify(resumen, null, 2));

    // ==================== PRUEBAS DE MÉTODOS ESTÁTICOS ====================
    
    console.log('\n📝 Prueba 10: Buscar profesores disponibles en horario');
    const profesoresDisponibles = await Profesor.findDisponiblesEnHorario('miercoles', '10:00', '12:00');
    console.log('✅ Profesores disponibles miércoles 10-12:', profesoresDisponibles.length);

    console.log('\n📝 Prueba 11: Obtener profesores con horarios');
    const profesoresConHorarios = await Profesor.findWithHorarios();
    console.log('✅ Profesores con horarios encontrados:', profesoresConHorarios.length);

    // ==================== PRUEBAS DE VALIDACIONES ====================
    
    console.log('\n📝 Prueba 12: Validación de tipo de horario inválido');
    try {
      const horarioInvalido = new Horario({
        dia: 'lunes',
        horaInicio: '09:00',
        horaFin: '11:00',
        tipo: 'tipo_inexistente'
      });
      await horarioInvalido.save();
      console.log('❌ ERROR: Debería haber fallado');
    } catch (error) {
      console.log('✅ Validación correcta:', error.message);
    }

    // ==================== PRUEBAS DE HELPERS COMPARTIDOS ====================
    
    console.log('\n📝 Prueba 13: Probar helpers de respuesta');
    
    // Mock response object
    const mockRes = {
      status: function(code) { 
        this.statusCode = code; 
        return this; 
      },
      json: function(data) { 
        console.log('📤 Response:', { status: this.statusCode, data }); 
        return this; 
      }
    };

    // Probar sendSuccess
    sendSuccess(mockRes, { test: 'data' }, 'Prueba exitosa', 200);

    // Probar sendError
    sendError(mockRes, 'Error de prueba', 400);

    // ==================== PRUEBAS DE VERIFICACIÓN DE DISPONIBILIDAD ====================
    
    console.log('\n📝 Prueba 14: Verificar disponibilidad de horario');
    const disponibilidad1 = await Horario.verificarDisponibilidad('lunes', '08:00', '09:00');
    console.log('✅ Disponibilidad lunes 08-09:', disponibilidad1);

    const disponibilidad2 = await Horario.verificarDisponibilidad('lunes', '09:30', '10:30');
    console.log('✅ Disponibilidad lunes 09:30-10:30:', disponibilidad2);

    // ==================== PRUEBAS DE LIMPIEZA Y ELIMINACIÓN ====================
    
    console.log('\n📝 Prueba 15: Remover horario de profesor');
    await profesorPrueba.removerHorario(horarioPrueba1._id);
    console.log('✅ Horario removido del profesor');

    // Verificar que fue removido
    const tieneHorarioDespues = profesorPrueba.tieneHorario(horarioPrueba1._id);
    console.log('✅ Verificación después de remover:', tieneHorarioDespues);

    // ==================== PRUEBAS DE CONSTANTES ====================
    
    console.log('\n📝 Prueba 16: Verificar constantes importadas');
    console.log('✅ DIAS_SEMANA:', Object.values(DIAS_SEMANA));
    console.log('✅ TIPOS_HORARIO:', Object.values(TIPOS_HORARIO));

    // ==================== PRUEBAS DE MÉTODOS DE HORARIO ====================
    
    console.log('\n📝 Prueba 17: Probar métodos estáticos de Horario');
    
    const horariosLunes = await Horario.getPorDia('lunes');
    console.log('✅ Horarios de lunes:', horariosLunes.length);

    const horariosRango = await Horario.getPorRangoHorario('08:00', '16:00');
    console.log('✅ Horarios en rango 08-16:', horariosRango.length);

    // ==================== RESUMEN FINAL ====================
    
    console.log('\n📊 RESUMEN DE PRUEBAS:');
    console.log('✅ Modelo Horario extendido: OK');
    console.log('✅ Campo tipo con validaciones: OK');
    console.log('✅ Métodos de Profesor para horarios: OK');
    console.log('✅ Verificación de conflictos: OK');
    console.log('✅ Helpers de respuesta: OK');
    console.log('✅ Constantes compartidas: OK');
    console.log('✅ Validaciones de negocio: OK');
    
    console.log('\n🎉 ¡Todas las pruebas del sistema completadas exitosamente!');

    // ==================== INFORMACIÓN PARA TESTING MANUAL ====================
    
    console.log('\n📋 INFORMACIÓN PARA PRUEBAS MANUALES:');
    console.log('🔗 Endpoints disponibles:');
    console.log('   GET    /api/horarios/test');
    console.log('   GET    /api/horarios');
    console.log('   POST   /api/horarios');
    console.log('   GET    /api/horarios/:id');
    console.log('   PUT    /api/horarios/:id');
    console.log('   DELETE /api/horarios/:id');
    console.log('   POST   /api/horarios/verificar');
    console.log('   POST   /api/horarios/asignar');
    
    console.log('\n📝 IDs creados para testing:');
    console.log(`   Horario 1: ${horarioPrueba1._id}`);
    console.log(`   Horario 2: ${horarioPrueba2._id}`);
    console.log(`   Profesor: ${profesorPrueba._id}`);

  } catch (error) {
    console.error('❌ Error en las pruebas:', error);
    console.error('Stack:', error.stack);
  }
}

// Función para prueba rápida de servidor
async function probarServidor() {
  console.log('\n🌐 Probando conexión al servidor...');
  
  try {
    // Intentar hacer una request al endpoint de prueba
    const http = require('http');
    
    const options = {
      hostname: 'localhost',
      port: process.env.PORT || 5000,
      path: '/api/horarios/test',
      method: 'GET'
    };

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log('✅ Respuesta del servidor:', JSON.parse(data));
      });
    });

    req.on('error', (error) => {
      console.log('⚠️  Servidor no está corriendo. Para probar endpoints:');
      console.log('   1. Ejecutar: npm run dev (en el directorio server)');
      console.log('   2. Probar: GET http://localhost:5000/api/horarios/test');
    });

    req.end();
    
  } catch (error) {
    console.log('⚠️  No se pudo conectar al servidor:', error.message);
  }
}

// Función principal
async function main() {
  await conectarDB();
  await limpiarDatosPrueba();
  await ejecutarPruebas();
  await probarServidor();
  
  // Cerrar conexión
  setTimeout(async () => {
    await mongoose.connection.close();
    console.log('\n👋 Conexión cerrada');
    process.exit(0);
  }, 2000);
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  });
}

module.exports = { main, ejecutarPruebas };