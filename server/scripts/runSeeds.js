/**
 /**
 * Script to run all seeds
 * 
 * Usage:
 * node scripts * 
 */

const mongoose = require('mongoose')
require('dotenv').config()

// Import seeds
const seedEmpresa = require('../seeds/empresaSeed')

const runSeeds = async () => {
  try {
    console.log('Iniciando proceso de seeds...\n')
    
    // Conect to MongoDB
    console.log('Conectando a MongoDB...')
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('MongoDB conectado\n')
    
    // Execute seeds sequentially
    console.log('--- SEED 1: EMPRESA ---')
    await seedEmpresa()
    console.log('')
    
    // Aquí agregar más seeds cuando estén disponibles
    // console.log('--- SEED 2: USUARIOS ---')
    // await seedUsuarios()
    
    console.log('Todos los seeds completados exitosamente')
    
  } catch (error) {
    console.error('Error ejecutando seeds:', error.message)
    process.exit(1)
  } finally {
    await mongoose.connection.close()
    console.log('\nConexión a MongoDB cerrada')
    process.exit(0)
  }
}

// Execute the seeds
runSeeds()