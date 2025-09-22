const mongoose = require('mongoose');
const BaseUser = require('./BaseUser');

// Schema específico para administradores
const adminSchema = new mongoose.Schema({
  // Los admins solo tienen los campos base, sin campos adicionales específicos
  // Pero podríamos agregar campos como permisos, área de gestión, etc.
  permisos: [{
    type: String,
    enum: ['gestion_usuarios', 'reportes', 'configuracion', 'todos'],
    default: ['todos']
  }]
});

// Crear el modelo Admin usando discriminator
const Admin = BaseUser.discriminator('admin', adminSchema);

module.exports = Admin;