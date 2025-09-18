import React, { useState } from 'react';
import CourseForm from './CourseForm';
import CourseList from './CourseList';
import './Courses.css';

const Courses = () => {
  const [showForm, setShowForm] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);

  const handleAddCourse = () => {
    setSelectedCourse(null);
    setShowForm(true);
  };

  const handleEditCourse = (course) => {
    setSelectedCourse(course);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setSelectedCourse(null);
  };

  return (
    <div className="courses-page">
      <div className="page-header">
        <h1>Gestión de Cursos</h1>
        <button className="btn btn-primary" onClick={handleAddCourse}>
          + Crear Curso
        </button>
      </div>

      <CourseList onEditCourse={handleEditCourse} />

      {showForm && (
        <CourseForm
          course={selectedCourse}
          onClose={handleCloseForm}
        />
      )}
    </div>
  );
};

export default Courses;