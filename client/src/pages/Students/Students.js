import React, { useState } from 'react';
import StudentForm from './StudentForm';
import StudentList from './StudentList';
import './Students.css';

const Students = () => {
  const [showForm, setShowForm] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [filter, setFilter] = useState('all');

  const handleAddStudent = () => {
    setSelectedStudent(null);
    setShowForm(true);
  };

  const handleEditStudent = (student) => {
    setSelectedStudent(student);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setSelectedStudent(null);
  };

  return (
    <div className="students-page">
      <div className="page-header">
        <h1>Gestión de Estudiantes</h1>
        <button className="btn btn-primary" onClick={handleAddStudent}>
          + Registrar Estudiante
        </button>
      </div>

      <div className="filters-section">
        <div className="filter-group">
          <label>Filtrar por estado:</label>
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="form-control filter-select"
          >
            <option value="all">Todos</option>
            <option value="I">Inscriptos</option>
            <option value="C">Cursando</option>
            <option value="G">Graduados</option>
            <option value="A">Abandonaron</option>
          </select>
        </div>
      </div>

      <StudentList 
        filter={filter}
        onEditStudent={handleEditStudent}
      />

      {showForm && (
        <StudentForm
          student={selectedStudent}
          onClose={handleCloseForm}
        />
      )}
    </div>
  );
};

export default Students;