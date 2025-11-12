import React from 'react';

const FALLBACK_IMAGE = '/images/Logo.png';

const CourseCard = ({ course, onSelectCourse }) => {
  const imageSrc = course.imageUrl || FALLBACK_IMAGE;
  const description = typeof course.description === 'string' ? course.description : '';
  const name = course.name || 'Curso sin título';
  const handleImageError = (event) => {
    if (!event.target.dataset.fallbackApplied) {
      event.target.dataset.fallbackApplied = 'true';
      event.target.src = FALLBACK_IMAGE;
    }
  };

  return (
    <div className="course-card" onClick={() => onSelectCourse(course)}>
      <img
        src={imageSrc}
        alt={name}
        className="course-card-image"
        onError={handleImageError}
        loading="lazy"
      />
      <div className="course-card-content">
        <div className="course-card-header">
          <h3 className="course-card-title">{name}</h3>
          {course.status && course.status.toLowerCase() === 'planificado' && (
            <span className="course-card-badge course-card-badge--upcoming">
              Próximo lanzamiento · Inscripción abierta
            </span>
          )}
        </div>
        <p className="course-card-description">
          {description.length > 100 ? `${description.substring(0, 100)}…` : description}
        </p>
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