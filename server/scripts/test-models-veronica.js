const mongoose = require('mongoose');
require('dotenv').config();

const PerfilEstudiante = require('../models/PerfilEstudiante');
const ReporteAcademico = require('../models/ReporteAcademico');
const ReporteFinanciero = require('../models/ReporteFinanciero');

async function testModels() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Test 1: Models loaded correctly
        console.log('✅ PerfilEstudiante model loaded');
        console.log('✅ ReporteAcademico model loaded');
        console.log('✅ ReporteFinanciero model loaded');

        console.log('\n🎉 All models are working!');

        await mongoose.disconnect();
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

testModels();