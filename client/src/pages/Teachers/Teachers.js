import React, { useState } from 'react';
import TeacherForm from './TeacherForm';
import TeacherList from './TeacherList';
import './Teachers.css';

const Teachers = () => {
  const [showForm, setShowForm] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);

  const handleAddTeacher = () => {
    setSelectedTeacher(null);
    setShowForm(true);
  };

  const handleEditTeacher = (teacher) => {
    setSelectedTeacher(teacher);
    setShowForm(true);
  };

  return (
    <div className="teachers-page">
      <div className="page-header">
        <h1>Gestión de Profesores</h1>
        <button className="btn btn-primary" onClick={handleAddTeacher}>
          + Registrar Profesor
        </button>
      </div>

      <TeacherList onEditTeacher={handleEditTeacher} />

      {showForm && (
        <TeacherForm
          teacher={selectedTeacher}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  );
};

export default Teachers;