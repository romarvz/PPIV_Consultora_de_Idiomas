/**
 * Pruebas rápidas para el modelo Horario
 * Ejecutar con: node test-horario.js
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Importar el modelo
const { Horario } = require('./models');

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
    await Horario.deleteMany({});
    console.log('🧹 Datos de prueba limpiados');
  } catch (error) {
    console.error('❌ Error limpiando datos:', error.message);
  }
}

// Pruebas del modelo
async function ejecutarPruebas() {
  console.log('\n🚀 Iniciando pruebas del modelo Horario...\n');

  try {
    // Prueba 1: Crear horario válido
    console.log('📝 Prueba 1: Crear horario válido');
    const horario1 = new Horario({
      dia: 'lunes',
      horaInicio: '09:00',
      horaFin: '11:00'
    });
    
    await horario1.save();
    console.log('✅ Horario creado:', horario1.toJSON());
    console.log('   Virtual display:', horario1.display);
    console.log('   Duración:', horario1.getDuracionFormateada());

    // Prueba 2: Verificar autogeneración de descripción
    console.log('\n📝 Prueba 2: Verificar autogeneración de descripción');
    console.log('✅ Descripción autogenerada:', horario1.descripcion);

    // Prueba 3: Crear horario con formato de hora inconsistente
    console.log('\n📝 Prueba 3: Normalización de formato de hora');
    const horario2 = new Horario({
      dia: 'martes',
      horaInicio: '9:30', // Sin cero inicial
      horaFin: '10:0'     // Sin cero en minutos
    });
    
    await horario2.save();
    console.log('✅ Formato normalizado:', {
      original: { inicio: '9:30', fin: '10:0' },
      normalizado: { inicio: horario2.horaInicio, fin: horario2.horaFin }
    });

    // Prueba 4: Intentar crear horario con hora fin anterior a inicio (debe fallar)
    console.log('\n📝 Prueba 4: Validación hora fin > hora inicio');
    try {
      const horarioInvalido = new Horario({
        dia: 'miercoles',
        horaInicio: '11:00',
        horaFin: '10:00'
      });
      await horarioInvalido.save();
      console.log('❌ ERROR: Debería haber fallado');
    } catch (error) {
      console.log('✅ Validación correcta:', error.message);
    }

    // Prueba 5: Intentar crear horario solapado (debe fallar)
    console.log('\n📝 Prueba 5: Validación de solapamiento');
    try {
      const horarioSolapado = new Horario({
        dia: 'lunes',
        horaInicio: '10:00', // Se solapa con el horario1 (09:00-11:00)
        horaFin: '12:00'
      });
      await horarioSolapado.save();
      console.log('❌ ERROR: Debería haber fallado por solapamiento');
    } catch (error) {
      console.log('✅ Validación de solapamiento correcta:', error.message);
    }

    // Prueba 6: Crear horario adyacente (debe funcionar)
    console.log('\n📝 Prueba 6: Horario adyacente válido');
    const horario3 = new Horario({
      dia: 'lunes',
      horaInicio: '11:00', // Adyacente al horario1
      horaFin: '13:00'
    });
    
    await horario3.save();
    console.log('✅ Horario adyacente creado:', horario3.display);

    // Prueba 7: Métodos estáticos
    console.log('\n📝 Prueba 7: Métodos estáticos');
    
    // Obtener horarios de lunes
    const horariosLunes = await Horario.getPorDia('lunes');
    console.log('✅ Horarios de lunes:', horariosLunes.map(h => h.display));

    // Verificar disponibilidad
    const disponibilidad1 = await Horario.verificarDisponibilidad('lunes', '08:00', '09:00');
    console.log('✅ Disponibilidad 08:00-09:00 lunes:', disponibilidad1);

    const disponibilidad2 = await Horario.verificarDisponibilidad('lunes', '09:30', '10:30');
    console.log('✅ Disponibilidad 09:30-10:30 lunes:', disponibilidad2);

    // Prueba 8: Formato de hora inválido (debe fallar)
    console.log('\n📝 Prueba 8: Validación formato de hora');
    try {
      const horarioFormatoInvalido = new Horario({
        dia: 'jueves',
        horaInicio: '25:00', // Hora inválida
        horaFin: '12:00'
      });
      await horarioFormatoInvalido.save();
      console.log('❌ ERROR: Debería haber fallado por formato inválido');
    } catch (error) {
      console.log('✅ Validación de formato correcta:', error.message);
    }

    // Prueba 9: Día inválido (debe fallar)
    console.log('\n📝 Prueba 9: Validación día válido');
    try {
      const horarioDiaInvalido = new Horario({
        dia: 'lunex', // Día inválido
        horaInicio: '09:00',
        horaFin: '11:00'
      });
      await horarioDiaInvalido.save();
      console.log('❌ ERROR: Debería haber fallado por día inválido');
    } catch (error) {
      console.log('✅ Validación de día correcta:', error.message);
    }

    // Prueba 10: Obtener todos los horarios con formato JSON
    console.log('\n📝 Prueba 10: Formato JSON completo');
    const todosLosHorarios = await Horario.find();
    console.log('✅ Horarios en formato JSON:');
    todosLosHorarios.forEach(horario => {
      console.log('  -', JSON.stringify(horario.toJSON(), null, 2));
    });

    console.log('\n🎉 Todas las pruebas completadas exitosamente!');

  } catch (error) {
    console.error('❌ Error en las pruebas:', error.message);
  }
}

// Función principal
async function main() {
  await conectarDB();
  await limpiarDatosPrueba();
  await ejecutarPruebas();
  
  // Cerrar conexión
  await mongoose.connection.close();
  console.log('\n👋 Conexión cerrada');
  process.exit(0);
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  });
}

module.exports = { main, ejecutarPruebas };