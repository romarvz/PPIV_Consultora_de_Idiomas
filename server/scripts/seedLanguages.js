const mongoose = require('mongoose');
const { Language } = require('../models');
require('dotenv').config();


const initialLanguages = [
  {
    code: 'en',
    name: 'Inglés',
    nativeName: 'English',
    description: 'Idioma internacional más hablado, ideal para negocios y comunicación global',
    level: 'basico',
    demandLevel: 'alto',
    isActive: true
  },
  {
    code: 'es',
    name: 'Español',
    nativeName: 'Español',
    description: 'Segundo idioma más hablado en el mundo, importante para comunicación en América Latina',
    level: 'nativo',
    demandLevel: 'alto',
    isActive: true
  },
  {
    code: 'fr',
    name: 'Francés',
    nativeName: 'Français',
    description: 'Idioma de la diplomacia y cultura, importante en Europa y África',
    level: 'intermedio',
    demandLevel: 'medio',
    isActive: true
  },
  {
    code: 'de',
    name: 'Alemán',
    nativeName: 'Deutsch',
    description: 'Idioma principal de Europa Central, importante para negocios y tecnología',
    level: 'avanzado',
    demandLevel: 'medio',
    isActive: true
  },
  {
    code: 'it',
    name: 'Italiano',
    nativeName: 'Italiano',
    description: 'Idioma romance con rica cultura gastronómica y artística',
    level: 'intermedio',
    demandLevel: 'medio',
    isActive: true
  },
  {
    code: 'pt',
    name: 'Portugués',
    nativeName: 'Português',
    description: 'Importante para comunicación en Brasil y países lusófonos',
    level: 'intermedio',
    demandLevel: 'medio',
    isActive: true
  },
  {
    code: 'zh',
    name: 'Chino',
    nativeName: '中文',
    description: 'Idioma más hablado del mundo, clave para negocios en Asia',
    level: 'avanzado',
    demandLevel: 'alto',
    isActive: false 
  },
  {
    code: 'ja',
    name: 'Japonés',
    nativeName: '日本語',
    description: 'Importante para tecnología, anime y cultura pop',
    level: 'avanzado',
    demandLevel: 'medio',
    isActive: false 
  },
  {
    code: 'ko',
    name: 'Coreano',
    nativeName: '한국어',
    description: 'Creciente demanda por K-pop, K-dramas y tecnología',
    level: 'avanzado',
    demandLevel: 'medio',
    isActive: false 
  },
  {
    code: 'ru',
    name: 'Ruso',
    nativeName: 'Русский',
    description: 'Importante en Europa del Este y Asia Central',
    level: 'avanzado',
    demandLevel: 'bajo',
    isActive: false 
  }
];


const seedLanguages = async () => {
  try {
    console.log(' Iniciando seed de idiomas...');
    
   
    await mongoose.connect(process.env.MONGODB_URI);
    console.log(' Conectado a MongoDB');

    //
    const existingCount = await Language.countDocuments();
    if (existingCount > 0) {
      console.log(`  Encontrados ${existingCount} idiomas existentes`);
      console.log(' Para evitar duplicados, solo se agregarán idiomas nuevos');
    }

    
    let insertedCount = 0;
    let skippedCount = 0;

    for (const langData of initialLanguages) {
      try {
      
        const existingLang = await Language.findOne({ code: langData.code });
        
        if (existingLang) {
          console.log(`  Saltando ${langData.name} (${langData.code}) - ya existe`);
          skippedCount++;
        } else {
      
          const language = new Language(langData);
          await language.save();
          console.log(` Creado: ${langData.name} (${langData.code})`);
          insertedCount++;
        }
      } catch (error) {
        console.error(` Error creando ${langData.name}:`, error.message);
      }
    }


    console.log('\n RESUMEN DEL SEED:');
    console.log(` Idiomas insertados: ${insertedCount}`);
    console.log(`⏭  Idiomas saltados: ${skippedCount}`);
    console.log(` Total en BD: ${await Language.countDocuments()}`);
    
  
    const activeLanguages = await Language.find({ isActive: true }).sort({ name: 1 });
    console.log('\n Idiomas ACTIVOS:');
    activeLanguages.forEach(lang => {
      console.log(`    ${lang.name} (${lang.code}) - Demanda: ${lang.demandLevel}`);
    });

   
    const inactiveLanguages = await Language.find({ isActive: false }).sort({ name: 1 });
    if (inactiveLanguages.length > 0) {
      console.log('\n Idiomas INACTIVOS (listos para activar cuando tengas profesores):');
      inactiveLanguages.forEach(lang => {
        console.log(`   • ${lang.name} (${lang.code}) - Demanda: ${lang.demandLevel}`);
      });
    }

  } catch (error) {
    console.error(' Error en el seed:', error);
  } finally {
    
    await mongoose.connection.close();
    console.log('\n Conexión a MongoDB cerrada');
    console.log(' Seed completado!');
  }
};


const clearLanguages = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const deleteResult = await Language.deleteMany({});
    console.log(`  Eliminados ${deleteResult.deletedCount} idiomas`);
    await mongoose.connection.close();
  } catch (error) {
    console.error(' Error limpiando idiomas:', error);
  }
};


if (require.main === module) {
  const command = process.argv[2];
  
  switch (command) {
    case 'clear':
      console.log('  LIMPIANDO TODOS LOS IDIOMAS...');
      clearLanguages();
      break;
    case 'seed':
    default:
      seedLanguages();
      break;
  }
}

module.exports = {
  seedLanguages,
  clearLanguages,
  initialLanguages
};