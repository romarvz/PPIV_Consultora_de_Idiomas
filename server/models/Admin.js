const mongoose = require('mongoose');
const BaseUser = require('./BaseUser');

// Specific Schema for Admin
const adminSchema = new mongoose.Schema({
  // Admins only have the base fields, without specific additional fields
  // But we could add fields like permissions, management area, etc.
  permissions: [{
    type: String,
    enum: ['gestion_usuarios', 'reportes', 'configuracion', 'todos'],
    default: ['todos']
  }]
});

// Create the Admin model using discriminator
const Admin = BaseUser.discriminator('admin', adminSchema);

module.exports = Admin;