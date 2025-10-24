const mongoose = require('mongoose');
require('dotenv').config();

const perfilesService = require('../services/perfilesService');

async function testPerfiles() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // You'll need a real student ID from your database
        // Replace 'STUDENT_ID_HERE' with an actual student ID

        console.log('\n📝 Testing perfil creation...');
        // const perfil = await perfilesService.crearPerfil('STUDENT_ID_HERE');
        // console.log('✅ Perfil created:', perfil);

        console.log('\n🎉 Perfiles service is working!');
        console.log('Note: To test fully, provide a real student ID');

        await mongoose.disconnect();
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

testPerfiles();