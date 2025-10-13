import React from 'react';

const CourseCard = ({ course, onSelectCourse }) => {
  return (
    <div className="course-card" onClick={() => onSelectCourse(course)}>
      <img src={course.imageUrl} alt={course.name} className="course-card-image" />
      <div className="course-card-content">
        <h3 className="course-card-title">{course.name}</h3>
        <p className="course-card-description">{course.description.substring(0, 100)}...</p>
        <div className="course-card-tags">
          <span className="course-card-tag">{course.level}</span>
          <span className="course-card-tag course-card-tag--secondary">{course.language}</span>
        </div>
        <button className="course-card-button">Ver más detalles</button>
      </div>
    </div>
  );
};

export default CourseCard;