/**
 * Script para crear un curso de prueba con clases pasadas para probar asistencia
 * 
 * USO: node server/scripts/create-test-course-with-attendance.js
 * 
 * Este script crea:
 * - Un curso corto (1 semana, 3 horas totales)
 * - Clases en el pasado (hace 7 días)
 * - Inscripciones de estudiantes
 * - Permite registrar asistencia para probar el sistema de alertas
 */

const mongoose = require('mongoose');
const path = require('path');

// Cargar .env - primero intenta en server/, luego en la raíz
const serverPath = path.resolve(__dirname, '..');
const rootPath = path.resolve(__dirname, '../..');
const envPath = path.join(serverPath, '.env');
const rootEnvPath = path.join(rootPath, '.env');

if (require('fs').existsSync(envPath)) {
  require('dotenv').config({ path: envPath });
  console.log('✅ Cargando .env desde server/.env');
} else if (require('fs').existsSync(rootEnvPath)) {
  require('dotenv').config({ path: rootEnvPath });
  console.log('✅ Cargando .env desde raíz del proyecto');
} else {
  require('dotenv').config(); // Intenta cargar desde donde esté
  console.log('⚠️  No se encontró .env específico, usando variables de entorno del sistema');
}

const { Curso, Clase, Inscripcion, BaseUser, Horario } = require('../models');

// Conectar a la base de datos
const connectDB = async () => {
  try {
    // Intentar varias opciones de conexión
    const mongoUri = process.env.MONGODB_URI 
      || 'mongodb://127.0.0.1:27017/consultora-idiomas'
      || 'mongodb://localhost:27017/consultora-idiomas';
    
    console.log('Intentando conectar a MongoDB...');
    console.log('URI:', mongoUri.replace(/\/\/.*@/, '//***@')); // Ocultar credenciales si las hay
    
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000
    });
    console.log('✅ Conectado a MongoDB');
  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error.message);
    console.log('\n💡 Posibles soluciones:');
    console.log('1. Verifica que MongoDB esté corriendo: mongod');
    console.log('2. Verifica la URI en el archivo .env: MONGODB_URI=...');
    console.log('3. Si usas MongoDB Atlas, verifica la conexión');
    console.log('4. Si MongoDB está en otra máquina, verifica la dirección IP');
    process.exit(1);
  }
};

const createTestCourse = async () => {
  try {
    // 1. Buscar un profesor existente
    const profesor = await BaseUser.findOne({ role: 'profesor' });
    if (!profesor) {
      console.error('❌ No se encontró ningún profesor en la base de datos');
      console.log('💡 Por favor, crea un profesor primero desde la interfaz de administración');
      process.exit(1);
    }
    console.log(`✅ Profesor encontrado: ${profesor.firstName} ${profesor.lastName}`);

    // 2. Buscar un horario existente o crear uno simple
    let horario = await Horario.findOne();
    if (!horario) {
      horario = await Horario.create({
        dia: 'lunes',
        horaInicio: '10:00',
        horaFin: '11:00'
      });
      console.log('✅ Horario creado para pruebas');
    } else {
      console.log(`✅ Horario encontrado: ${horario.descripcion || horario.dia}`);
    }

    // 3. Crear curso de prueba (1 semana, 3 horas total)
    const fechaInicio = new Date();
    fechaInicio.setDate(fechaInicio.getDate() - 7); // Hace 7 días
    fechaInicio.setHours(10, 0, 0, 0);

    const fechaFin = new Date(fechaInicio);
    fechaFin.setDate(fechaFin.getDate() + 7); // 7 días después

    const curso = await Curso.create({
      nombre: 'Curso de Prueba - Asistencia',
      idioma: 'ingles',
      nivel: 'A1',
      descripcion: 'Curso creado para probar el sistema de asistencia y alertas',
      duracionTotal: 3, // 3 horas (menos del mínimo, pero válido para pruebas)
      tarifa: 5000,
      vacantesMaximas: 10,
      modalidad: 'presencial',
      type: 'Curso Grupal',
      profesor: profesor._id,
      horario: horario._id,
      fechaInicio: fechaInicio,
      fechaFin: fechaFin,
      estado: 'activo'
    });
    console.log(`✅ Curso creado: ${curso.nombre} (ID: ${curso._id})`);

    // 4. Crear clases pasadas (3 clases, una cada lunes)
    const clases = [];
    for (let i = 0; i < 3; i++) {
      const fechaClase = new Date(fechaInicio);
      fechaClase.setDate(fechaInicio.getDate() + (i * 7)); // Cada lunes
      fechaClase.setHours(10, 0, 0, 0);

      const clase = await Clase.create({
        curso: curso._id,
        profesor: profesor._id,
        titulo: `Clase ${i + 1} - ${curso.nombre}`,
        descripcion: `Clase de prueba ${i + 1} para sistema de asistencia`,
        fechaHora: fechaClase,
        duracionMinutos: 60,
        modalidad: 'presencial',
        aula: 'Aula 101',
        estado: 'completada', // Marcarlas como completadas para que cuenten en estadísticas
        estudiantes: [] // Se agregarán cuando inscribamos estudiantes
      });
      clases.push(clase);
      console.log(`✅ Clase creada: ${clase.titulo} - ${fechaClase.toLocaleDateString()}`);
    }

    // 5. Buscar estudiantes existentes
    const estudiantes = await BaseUser.find({ role: 'estudiante' }).limit(5);
    if (estudiantes.length === 0) {
      console.log('⚠️  No se encontraron estudiantes. Creando 3 estudiantes de prueba...');
      
      // Crear estudiantes de prueba
      const estudiantesPrueba = [];
      for (let i = 1; i <= 3; i++) {
        const estudiante = await BaseUser.create({
          firstName: `Estudiante${i}`,
          lastName: `Prueba`,
          email: `estudiante${i}.prueba@test.com`,
          password: '123456', // Se hasheará automáticamente
          role: 'estudiante',
          dni: `1234567${i}`,
          phone: `11-1234-567${i}`,
          condicion: 'inscrito',
          isActive: true
        });
        estudiantesPrueba.push(estudiante);
        console.log(`✅ Estudiante creado: ${estudiante.firstName} ${estudiante.lastName}`);
      }
      estudiantes.push(...estudiantesPrueba);
    } else {
      console.log(`✅ ${estudiantes.length} estudiantes encontrados`);
    }

    // 6. Inscribir estudiantes al curso
    console.log('\n📝 Inscribiendo estudiantes al curso...');
    const inscripciones = [];
    for (const estudiante of estudiantes) {
      const inscripcion = await Inscripcion.create({
        estudiante: estudiante._id,
        curso: curso._id,
        estado: 'confirmada',
        fechaInscripcion: new Date(fechaInicio.getTime() - 2 * 24 * 60 * 60 * 1000) // 2 días antes del inicio
      });

      // Agregar estudiante a todas las clases
      for (const clase of clases) {
        clase.estudiantes.push(estudiante._id);
        await clase.save();
      }

      inscripciones.push(inscripcion);
      console.log(`✅ ${estudiante.firstName} ${estudiante.lastName} inscrito`);
    }

    // 7. Registrar asistencia de prueba
    // Estudiante 0: Asiste a todas (100% - regular)
    // Estudiante 1: Asiste a 2 de 3 (66% - cerca del límite)
    // Estudiante 2: Asiste a 1 de 3 (33% - bajo)
    console.log('\n📊 Registrando asistencia de prueba...');
    
    // Iterar sobre todos los estudiantes y todas las clases
    for (let estIdx = 0; estIdx < estudiantes.length; estIdx++) {
      const estudiante = estudiantes[estIdx];
      
      for (let claseIdx = 0; claseIdx < clases.length; claseIdx++) {
        const clase = clases[claseIdx];
        
        // Determinar si el estudiante debe asistir a esta clase
        let debeAsistir = false;
        if (estIdx === 0) {
          // Estudiante 0: presente en todas las clases
          debeAsistir = true;
        } else if (estIdx === 1) {
          // Estudiante 1: presente en las primeras 2 clases
          debeAsistir = claseIdx < 2;
        } else if (estIdx === 2) {
          // Estudiante 2: presente solo en la primera clase
          debeAsistir = claseIdx === 0;
        }

        if (debeAsistir) {
          await clase.registrarAsistencia(
            estudiante._id,
            true, // presente
            0, // minutos tarde
            'Asistencia registrada por script de prueba',
            profesor._id
          );
          console.log(`✅ ${estudiante.firstName} ${estudiante.lastName} - PRESENTE en ${clase.titulo}`);
        } else {
          await clase.registrarAsistencia(
            estudiante._id,
            false, // ausente
            0,
            'Ausente - prueba de sistema de alertas',
            profesor._id
          );
          console.log(`❌ ${estudiante.firstName} ${estudiante.lastName} - AUSENTE en ${clase.titulo}`);
        }
      }
    }

    console.log('\n✨ Resumen del curso de prueba:');
    console.log(`   Curso ID: ${curso._id}`);
    console.log(`   Nombre: ${curso.nombre}`);
    console.log(`   Clases: ${clases.length} (todas marcadas como completadas)`);
    console.log(`   Estudiantes inscritos: ${inscripciones.length}`);
    console.log(`   Estado: ${curso.estado}`);
    console.log('\n💡 Estadísticas de asistencia esperadas:');
    console.log(`   - ${estudiantes[0]?.firstName}: 100% (3/3 clases) - REGULAR ✅`);
    if (estudiantes.length > 1) {
      console.log(`   - ${estudiantes[1]?.firstName}: 66.7% (2/3 clases) - Cerca del límite ⚠️`);
    }
    if (estudiantes.length > 2) {
      console.log(`   - ${estudiantes[2]?.firstName}: 33.3% (1/3 clases) - Bajo ❌`);
    }
    console.log('\n📌 Próximos pasos:');
    console.log('   1. Ve al dashboard del profesor y abre este curso');
    console.log('   2. Verás las alertas de asistencia en la parte superior');
    console.log('   3. En la lista de estudiantes, verás el porcentaje y las alertas');
    console.log(`   4. Para probar más escenarios, puedes registrar más asistencia manualmente desde la interfaz`);

    return { curso, clases, inscripciones };

  } catch (error) {
    console.error('❌ Error creando curso de prueba:', error);
    throw error;
  }
};

const main = async () => {
  await connectDB();
  try {
    await createTestCourse();
    console.log('\n✅ Script completado exitosamente');
  } catch (error) {
    console.error('❌ Error en el script:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Conexión cerrada');
    process.exit(0);
  }
};

main();

