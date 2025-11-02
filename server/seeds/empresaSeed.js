/**
 * Initial seed data for Company
 * Creates the default company if * 
 */

const Empresa = require('../models/Empresa')

const seedEmpresa = async () => {
  try {
    console.log('Iniciando seed de Empresa...')
    
    // Verify if an active company already exists
    const existeEmpresa = await Empresa.findOne({ activa: true })
    
    if (existeEmpresa) {
      console.log('Ya existe una empresa activa:', existeEmpresa.nombre)
      return existeEmpresa
    }
    
    // Create default company
    const empresa = await Empresa.create({
      nombre: 'Academia de Idiomas Global',
      ruc: '20-12345678-9',
      direccion: {
        calle: 'Av. Corrientes 1234',
        ciudad: 'Buenos Aires',
        provincia: 'Buenos Aires',
        codigoPostal: 'C1043',
        pais: 'Argentina'
      },
      contacto: {
        telefono: '+54 11 4567-8900',
        email: 'info@academiaglobal.com.ar',
        sitioWeb: 'www.academiaglobal.com.ar'
      },
      logo: null,
      configuracion: {
        horasMinimas: 1,
        horasMaximas: 4,
        diasAnticipacionCancelacion: 2,
        porcentajePenalizacion: 50
      },
      estadisticas: {
        totalEstudiantes: 0,
        totalProfesores: 0,
        totalCursos: 0,
        totalClases: 0,
        ingresosTotal: 0
      },
      activa: true
    })
    
    console.log('Empresa creada exitosamente:', empresa.nombre)
    console.log('   Email:', empresa.contacto.email)
    console.log('   Ciudad:', empresa.direccion.ciudad)
    
    return empresa
  } catch (error) {
    console.error('Error al crear empresa:', error.message)
    throw error
  }
}

// If it is run directly, execute the seed
if (require.main === module) {
  const mongoose = require('mongoose')
  require('dotenv').config()
  
  mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
      console.log('MongoDB conectado')
      await seedEmpresa()
      console.log('Seed completado')
      process.exit(0)
    })
    .catch(err => {
      console.error('Error:', err)
      process.exit(1)
    })
}

module.exports = seedEmpresa