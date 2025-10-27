const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api/auth';


async function getAdminToken() {
  try {
    const response = await axios.post(`${BASE_URL}/login`, {
      email: 'admin@consultora.com',
      password: 'Admin123!'
    });
    
    if (response.data.success) {
      console.log(' Admin login exitoso');
      return response.data.data.token;
    } else {
      throw new Error('Login falló');
    }
  } catch (error) {
    console.error(' Error en login admin:', error.response?.data || error.message);
    throw error;
  }
}


async function createStudent(token, studentData) {
  try {
    const response = await axios.post(`${BASE_URL}/register/estudiante-admin`, studentData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.data.success) {
      console.log(` Estudiante creado: ${studentData.email} (Password temporal: ${studentData.dni})`);
      return response.data;
    }
  } catch (error) {
    console.error(` Error creando estudiante ${studentData.email}:`, error.response?.data || error.message);
  }
}


async function createTeacher(token, teacherData) {
  try {
    const response = await axios.post(`${BASE_URL}/register/profesor`, teacherData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.data.success) {
      console.log(` Profesor creado: ${teacherData.email} (Password temporal: ${teacherData.dni})`);
      return response.data;
    }
  } catch (error) {
    console.error(` Error creando profesor ${teacherData.email}:`, error.response?.data || error.message);
  }
}


const testStudents = [
  {
    email: "estudiante1@test.com",
    firstName: "María",
    lastName: "González",
    role: "estudiante",
    dni: "12345678",
    nivel: "B1",
    estadoAcademico: "inscrito",
    phone: "+54911234567"
  },
  {
    email: "estudiante2@test.com",
    firstName: "Juan",
    lastName: "Pérez",
    role: "estudiante",
    dni: "23456789",
    nivel: "A2",
    estadoAcademico: "en_curso",
    phone: "+54911234568"
  }
];

const testTeachers = [
  {
    email: "profesor1@test.com",
    firstName: "Carlos",
    lastName: "Rodríguez",
    role: "profesor",
    dni: "87654321",
    especialidades: ["ingles", "frances"],
    tarifaPorHora: 2500,
    phone: "+54911234569",
    disponibilidad: {
      lunes: [{"inicio": "09:00", "fin": "12:00"}],
      miercoles: [{"inicio": "14:00", "fin": "17:00"}],
      viernes: [{"inicio": "16:00", "fin": "19:00"}]
    }
  },
  {
    email: "profesor2@test.com",
    firstName: "Ana",
    lastName: "López",
    role: "profesor",
    dni: "76543210",
    especialidades: ["aleman", "italiano"],
    tarifaPorHora: 3000,
    phone: "+54911234570"
  }
];

// Principal function
async function createTestUsers() {
  console.log(' Iniciando creación de usuarios de prueba...\n');
  
  try {
    // 1. Get admin token
    const adminToken = await getAdminToken();
    console.log('');
    
    // 2. Create students
    console.log(' Creando estudiantes...');
    for (const student of testStudents) {
      await createStudent(adminToken, student);
    }
    console.log('');
    
    // 3. Create teachers
    console.log('Creando profesores...');
    for (const teacher of testTeachers) {
      await createTeacher(adminToken, teacher);
    }
    console.log('');
    
    console.log(' ¡Usuarios de prueba creados exitosamente!');
    console.log('\n CREDENCIALES PARA PROBAR:');
    console.log('\n ADMIN:');
    console.log('Email: admin@consultora.com');
    console.log('Password: Admin123!');
    
    console.log('\n ESTUDIANTES (primer login con DNI):');
    testStudents.forEach(student => {
      console.log(`Email: ${student.email} | Password temporal: ${student.dni}`);
    });
    
    console.log('\n PROFESORES (primer login con DNI):');
    testTeachers.forEach(teacher => {
      console.log(`Email: ${teacher.email} | Password temporal: ${teacher.dni}`);
    });
    
    console.log('\n IMPORTANTE: Los estudiantes y profesores deben cambiar su contraseña en el primer login.');
    
  } catch (error) {
    console.error(' Error general:', error.message);
  }
}

//  script
createTestUsers();