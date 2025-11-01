/**
 * Migración de Horarios Estándar
 * 
 * Este script:
 * 1. Crea 36 bloques de horario estándar (lunes-sábado, 6 bloques por día)
 * 2. Asigna horarios por defecto a profesores sin horarios configurados
 * 
 * Uso:
 * - Programático: const { migrateHorarios } = require('./migrateHorarios'); await migrateHorarios();
 * - Directo: node server/migrations/migrateHorarios.js
 * 
 * Características:
 * - Idempotente: se puede ejecutar múltiples veces sin duplicar datos
 * - Seguro: no sobrescribe horarios existentes de profesores
 */

const mongoose = require('mongoose');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

// Importar modelos
const { BaseUser, Horario } = require('../models');

/**
 * Conectar a MongoDB
 */
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Conectado a MongoDB');
    return true;
  } catch (error) {
    console.error('Error conectando a MongoDB:', error.message);
    return false;
  }
}

/**
 * Desconectar de MongoDB
 */
async function disconnectDB() {
  try {
    await mongoose.connection.close();
    console.log('Desconectado de MongoDB');
  } catch (error) {
    console.error('Error desconectando:', error.message);
  }
}

/**
 * Generar horarios estándar
 */
function generarHorariosEstandar() {
  const dias = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
  const bloques = [
    { inicio: '09:00', fin: '11:00' },
    { inicio: '11:00', fin: '13:00' },
    { inicio: '14:00', fin: '16:00' },
    { inicio: '16:00', fin: '18:00' },
    { inicio: '18:00', fin: '20:00' },
    { inicio: '20:00', fin: '22:00' }
  ];

  const horarios = [];
  
  for (const dia of dias) {
    for (const bloque of bloques) {
      horarios.push({
        dia: dia,
        horaInicio: bloque.inicio,
        horaFin: bloque.fin,
        tipo: 'clase',
        descripcion: `${dia.charAt(0).toUpperCase() + dia.slice(1)} ${bloque.inicio} - ${bloque.fin}`
      });
    }
  }

  return horarios;
}

/**
 * Crear horarios estándar en la base de datos
 */
async function crearHorariosEstandar() {
  try {
    console.log('Iniciando creación de horarios estándar...');
    
    const horariosEstandar = generarHorariosEstandar();
    console.log(`Preparados ${horariosEstandar.length} horarios para insertar`);

    // Usar insertMany con ordered: false para ignorar duplicados
    const resultado = await Horario.insertMany(horariosEstandar, { 
      ordered: false,
      rawResult: true 
    });

    console.log(`Horarios insertados exitosamente: ${resultado.insertedCount}`);
    
    // Si hay errores de duplicados, los reportamos pero no fallamos
    if (resultado.writeErrors && resultado.writeErrors.length > 0) {
      const duplicados = resultado.writeErrors.filter(err => err.code === 11000);
      if (duplicados.length > 0) {
        console.log(`Horarios ya existentes (saltados): ${duplicados.length}`);
      }
      
      // Si hay otros errores que no sean duplicados, los reportamos
      const otrosErrores = resultado.writeErrors.filter(err => err.code !== 11000);
      if (otrosErrores.length > 0) {
        console.warn('Errores no relacionados con duplicados:', otrosErrores.length);
        otrosErrores.forEach(err => console.warn('Error:', err.errmsg));
      }
    }

    return true;
  } catch (error) {
    // Si el error es solo por duplicados, no es crítico
    if (error.code === 11000 || (error.writeErrors && error.writeErrors.every(e => e.code === 11000))) {
      console.log('Todos los horarios ya existen en la base de datos');
      return true;
    }
    
    console.error('Error creando horarios:', error.message);
    return false;
  }
}

/**
 * Obtener horarios por defecto para profesores (lunes-viernes, 09:00-20:00)
 */
async function obtenerHorariosPorDefecto() {
  try {
    const diasLaborables = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'];
    const horariosLaborables = ['09:00', '11:00', '14:00', '16:00', '18:00'];
    
    const horarios = await Horario.find({
      dia: { $in: diasLaborables },
      horaInicio: { $in: horariosLaborables }
    }).select('_id dia horaInicio horaFin');

    console.log(`Encontrados ${horarios.length} horarios laborables para asignación por defecto`);
    return horarios.map(h => h._id);
  } catch (error) {
    console.error('Error obteniendo horarios por defecto:', error.message);
    return [];
  }
}

/**
 * Migrar profesores existentes
 */
async function migrarProfesores() {
  try {
    console.log('Iniciando migración de profesores...');
    
    // Buscar todos los profesores
    const profesores = await BaseUser.find({ role: 'profesor' }).select('_id firstName lastName email horariosPermitidos');
    console.log(`Encontrados ${profesores.length} profesores en el sistema`);

    if (profesores.length === 0) {
      console.log('No hay profesores para migrar');
      return true;
    }

    // Obtener horarios por defecto
    const horariosDefecto = await obtenerHorariosPorDefecto();
    
    if (horariosDefecto.length === 0) {
      console.warn('No se encontraron horarios por defecto. Asegurate de que los horarios estándar fueron creados correctamente');
      return false;
    }

    let profesoresMigrados = 0;
    let profesoresSaltados = 0;

    for (const profesor of profesores) {
      try {
        // Verificar si el profesor ya tiene horarios asignados
        const tieneHorarios = profesor.horariosPermitidos && profesor.horariosPermitidos.length > 0;
        
        if (tieneHorarios) {
          console.log(`Profesor ${profesor.firstName} ${profesor.lastName} ya tiene ${profesor.horariosPermitidos.length} horarios asignados - SALTADO`);
          profesoresSaltados++;
          continue;
        }

        // Asignar horarios por defecto
        profesor.horariosPermitidos = horariosDefecto;
        await profesor.save();
        
        console.log(`Profesor ${profesor.firstName} ${profesor.lastName} migrado con ${horariosDefecto.length} horarios`);
        profesoresMigrados++;
        
      } catch (error) {
        console.error(`Error migrando profesor ${profesor.firstName} ${profesor.lastName}:`, error.message);
      }
    }

    console.log(`Migración completada: ${profesoresMigrados} migrados, ${profesoresSaltados} saltados`);
    return true;
    
  } catch (error) {
    console.error('Error en migración de profesores:', error.message);
    return false;
  }
}

/**
 * Verificar resultado de la migración
 */
async function verificarMigracion() {
  try {
    console.log('Verificando resultados de la migración...');
    
    // Contar horarios totales
    const totalHorarios = await Horario.countDocuments();
    console.log(`Total de horarios en la base de datos: ${totalHorarios}`);
    
    // Contar profesores con horarios
    const profesoresConHorarios = await BaseUser.countDocuments({
      role: 'profesor',
      horariosPermitidos: { $exists: true, $ne: [] }
    });
    
    const totalProfesores = await BaseUser.countDocuments({ role: 'profesor' });
    console.log(`Profesores con horarios asignados: ${profesoresConHorarios}/${totalProfesores}`);
    
    // Mostrar estadísticas por día
    const estadisticasPorDia = await Horario.aggregate([
      { $group: { _id: '$dia', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    
    console.log('Horarios por día:');
    estadisticasPorDia.forEach(stat => {
      console.log(`  ${stat._id}: ${stat.count} horarios`);
    });
    
    return true;
  } catch (error) {
    console.error('Error verificando migración:', error.message);
    return false;
  }
}

/**
 * Función principal de migración
 */
async function migrateHorarios() {
  console.log('=== INICIANDO MIGRACIÓN DE HORARIOS ===');
  console.log(`Fecha: ${new Date().toISOString()}`);
  console.log();

  try {
    // Paso 1: Conectar a base de datos
    const conectado = await connectDB();
    if (!conectado) {
      console.error('No se pudo conectar a la base de datos');
      return false;
    }

    // Paso 2: Crear horarios estándar
    const horariosCreados = await crearHorariosEstandar();
    if (!horariosCreados) {
      console.error('Fallo en la creación de horarios');
      await disconnectDB();
      return false;
    }

    // Paso 3: Migrar profesores
    const profesoresMigrados = await migrarProfesores();
    if (!profesoresMigrados) {
      console.error('Fallo en la migración de profesores');
      await disconnectDB();
      return false;
    }

    // Paso 4: Verificar resultados
    await verificarMigracion();

    // Paso 5: Desconectar
    await disconnectDB();

    console.log();
    console.log('=== MIGRACIÓN COMPLETADA EXITOSAMENTE ===');
    return true;

  } catch (error) {
    console.error('Error fatal en migración:', error.message);
    console.error('Stack:', error.stack);
    
    await disconnectDB();
    return false;
  }
}

/**
 * Función para limpiar horarios (útil para testing)
 */
async function limpiarHorarios() {
  console.log('=== LIMPIANDO HORARIOS (SOLO PARA TESTING) ===');
  
  try {
    const conectado = await connectDB();
    if (!conectado) return false;

    // Remover horarios de profesores
    await BaseUser.updateMany(
      { role: 'profesor' },
      { $set: { horariosPermitidos: [] } }
    );
    console.log('Horarios removidos de profesores');

    // Eliminar todos los horarios
    const resultado = await Horario.deleteMany({});
    console.log(`${resultado.deletedCount} horarios eliminados`);

    await disconnectDB();
    console.log('Limpieza completada');
    return true;

  } catch (error) {
    console.error('Error en limpieza:', error.message);
    await disconnectDB();
    return false;
  }
}

// Ejecutar directamente si el archivo es llamado como script principal
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--clean')) {
    limpiarHorarios()
      .then(exito => process.exit(exito ? 0 : 1))
      .catch(error => {
        console.error('Error:', error.message);
        process.exit(1);
      });
  } else {
    migrateHorarios()
      .then(exito => process.exit(exito ? 0 : 1))
      .catch(error => {
        console.error('Error:', error.message);
        process.exit(1);
      });
  }
}

module.exports = {
  migrateHorarios,
  limpiarHorarios,
  generarHorariosEstandar,
  crearHorariosEstandar,
  migrarProfesores,
  verificarMigracion
};