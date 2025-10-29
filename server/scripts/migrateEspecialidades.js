const mongoose = require('mongoose');
require('dotenv').config();

// Conexión directa a la base de datos
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('📦 MongoDB conectado para migración');
  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error);
    process.exit(1);
  }
}

// Mapping de especialidades hardcodeadas a códigos de idiomas
const ESPECIALIDADES_MAPPING = {
  'ingles': 'en',
  'frances': 'fr', 
  'aleman': 'de',
  'italiano': 'it',
  'portugues': 'pt',
  'espanol': 'es'
};

async function migrateEspecialidades() {
  try {
    await connectDB();
    
    // Importar modelos después de la conexión
    const Language = require('../models/Language');
    const BaseUser = require('../models/BaseUser');
    
    console.log('🔄 Iniciando migración de especialidades...');
    
    // Obtener todos los idiomas disponibles
    const languages = await Language.find({});
    const languageMap = {};
    languages.forEach(lang => {
      languageMap[lang.code] = lang._id;
    });
    
    console.log('📚 Idiomas disponibles:', Object.keys(languageMap));
    
    // Obtener todos los profesores
    const profesores = await BaseUser.find({ role: 'profesor' });
    console.log(`👨‍🏫 Profesores encontrados: ${profesores.length}`);
    
    let migratedCount = 0;
    let errorCount = 0;
    
    for (const profesor of profesores) {
      try {
        console.log(`\n🔍 Procesando profesor: ${profesor.firstName} ${profesor.lastName}`);
        console.log(`   Especialidades actuales:`, profesor.especialidades);
        
        // Si ya son ObjectIds, saltar
        if (profesor.especialidades && profesor.especialidades.length > 0 && 
            mongoose.Types.ObjectId.isValid(profesor.especialidades[0])) {
          console.log('   ✅ Ya migrado, saltando...');
          continue;
        }
        
        // Convertir especialidades de strings a ObjectIds
        const newEspecialidades = [];
        
        if (profesor.especialidades && profesor.especialidades.length > 0) {
          for (const especialidad of profesor.especialidades) {
            const languageCode = ESPECIALIDADES_MAPPING[especialidad];
            if (languageCode && languageMap[languageCode]) {
              newEspecialidades.push(languageMap[languageCode]);
              console.log(`   🔄 ${especialidad} → ${languageCode} (${languageMap[languageCode]})`);
            } else {
              console.log(`   ⚠️  Especialidad no encontrada: ${especialidad}`);
            }
          }
        }
        
        // Si no hay especialidades válidas, asignar inglés por defecto
        if (newEspecialidades.length === 0 && languageMap['en']) {
          newEspecialidades.push(languageMap['en']);
          console.log('   📝 Asignando inglés por defecto');
        }
        
        if (newEspecialidades.length > 0) {
          // Actualizar usando findByIdAndUpdate para evitar triggers
          await BaseUser.findByIdAndUpdate(
            profesor._id,
            { especialidades: newEspecialidades },
            { runValidators: false }
          );
          
          migratedCount++;
          console.log('   ✅ Migrado exitosamente');
        } else {
          console.log('   ❌ No se pudieron migrar las especialidades');
          errorCount++;
        }
        
      } catch (error) {
        console.error(`   ❌ Error migrando profesor ${profesor._id}:`, error.message);
        errorCount++;
      }
    }
    
    console.log('\n📊 Resumen de migración:');
    console.log(`✅ Profesores migrados: ${migratedCount}`);
    console.log(`❌ Errores: ${errorCount}`);
    console.log(`📝 Total procesados: ${profesores.length}`);
    
    // Verificar migración
    console.log('\n🔍 Verificando migración...');
    const profesoresMigrados = await BaseUser.find({ role: 'profesor' })
      .populate('especialidades', 'code name');
    
    for (const profesor of profesoresMigrados.slice(0, 3)) { // Mostrar solo los primeros 3
      console.log(`👨‍🏫 ${profesor.firstName} ${profesor.lastName}:`);
      profesor.especialidades.forEach(lang => {
        console.log(`   - ${lang.name} (${lang.code})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error en migración:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Conexión cerrada');
    process.exit(0);
  }
}

// Ejecutar migración si es llamado directamente
if (require.main === module) {
  migrateEspecialidades();
}

module.exports = { migrateEspecialidades };