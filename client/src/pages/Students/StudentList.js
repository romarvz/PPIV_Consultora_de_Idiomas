import React, { useState, useEffect } from 'react';

// Datos de ejemplo - reemplazar con API real
const mockStudents = [
  {
    id: 1,
    nombre: 'Juan',
    apellido: 'Pérez',
    email: 'juan.perez@email.com',
    telefono: '1234567890',
    dni: '12345678',
    nivelInicial: 'A2',
    condicion: 'C'
  },
  {
    id: 2,
    nombre: 'María',
    apellido: 'García',
    email: 'maria.garcia@email.com',
    telefono: '0987654321',
    dni: '87654321',
    nivelInicial: 'B1',
    condicion: 'I'
  },
  {
    id: 3,
    nombre: 'Carlos',
    apellido: 'López',
    email: 'carlos.lopez@email.com',
    telefono: '5555555555',
    dni: '11111111',
    nivelInicial: 'C1',
    condicion: 'G'
  }
];

const StudentList = ({ filter, onEditStudent }) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simular carga de datos
    setTimeout(() => {
      setStudents(mockStudents);
      setLoading(false);
    }, 1000);
  }, []);

  const getConditionLabel = (condicion) => {
    const labels = {
      'I': 'Inscripto',
      'C': 'Cursando',
      'G': 'Graduado',
      'A': 'Abandonó'
    };
    return labels[condicion] || condicion;
  };

  const getConditionBadge = (condicion) => {
    const badges = {
      'I': 'badge-warning',
      'C': 'badge-success',
      'G': 'badge-success',
      'A': 'badge-danger'
    };
    return badges[condicion] || 'badge-secondary';
  };

  const filteredStudents = filter === 'all' 
    ? students 
    : students.filter(student => student.condicion === filter);

  if (loading) {
    return <div className="loading">Cargando estudiantes...</div>;
  }

  if (filteredStudents.length === 0) {
    return (
      <div className="card">
        <div className="no-data">
          <p>No se encontraron estudiantes con el filtro seleccionado.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Email</th>
              <th>Teléfono</th>
              <th>DNI</th>
              <th>Nivel</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map(student => (
              <tr key={student.id}>
                <td>{student.nombre} {student.apellido}</td>
                <td>{student.email}</td>
                <td>{student.telefono}</td>
                <td>{student.dni}</td>
                <td>{student.nivelInicial}</td>
                <td>
                  <span className={`badge ${getConditionBadge(student.condicion)}`}>
                    {getConditionLabel(student.condicion)}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button 
                      className="btn btn-sm btn-primary"
                      onClick={() => onEditStudent(student)}
                    >
                      Editar
                    </button>
                    <button className="btn btn-sm btn-secondary">
                      Ver Detalle
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentList;