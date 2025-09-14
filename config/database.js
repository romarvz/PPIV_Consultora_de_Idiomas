const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    console.log(`MongoDB connected successfully to: ${mongoose.connection.host}`);
    
    // Esperar un poco más para asegurar que la conexión esté realmente lista
    await new Promise(resolve => setTimeout(resolve, 2000));
    
  } catch (error) {
    console.error('Database connection error:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;