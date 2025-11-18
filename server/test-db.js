const mongoose = require('mongoose');
require('dotenv').config();

async function testDatabase() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Import models
    require('./models');
    const { BaseUser } = require('./models');

    // Count all users
    const totalUsers = await BaseUser.countDocuments();
    console.log(`📊 Total users in database: ${totalUsers}`);

    // Count by role
    const students = await BaseUser.countDocuments({ role: 'estudiante' });
    const teachers = await BaseUser.countDocuments({ role: 'profesor' });
    const admins = await BaseUser.countDocuments({ role: 'admin' });

    console.log(`👨‍🎓 Students: ${students}`);
    console.log(`👨‍🏫 Teachers: ${teachers}`);
    console.log(`👨‍💼 Admins: ${admins}`);

    // Get sample data
    const sampleStudent = await BaseUser.findOne({ role: 'estudiante' }).select('firstName lastName email role');
    const sampleTeacher = await BaseUser.findOne({ role: 'profesor' }).select('firstName lastName email role');

    console.log('📝 Sample student:', sampleStudent);
    console.log('📝 Sample teacher:', sampleTeacher);

    process.exit(0);
  } catch (error) {
    console.error('❌ Database test failed:', error);
    process.exit(1);
  }
}

testDatabase();