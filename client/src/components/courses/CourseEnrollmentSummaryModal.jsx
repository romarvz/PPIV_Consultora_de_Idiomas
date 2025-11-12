import React from 'react';

const overlayStyles = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1100,
  padding: '20px'
};

const modalStyles = {
  background: 'white',
  borderRadius: '12px',
  width: '100%',
  maxWidth: '520px',
  maxHeight: '90vh',
  overflow: 'hidden',
  boxShadow: '0 20px 45px rgba(15, 92, 140, 0.2)',
  display: 'flex',
  flexDirection: 'column'
};

const headerStyles = {
  padding: '1.25rem 1.5rem',
  borderBottom: '1px solid #e9ecef',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  background: '#0F5C8C',
  color: 'white'
};

const bodyStyles = {
  padding: '1.5rem',
  overflowY: 'auto',
  color: '#0F5C8C'
};

const footerStyles = {
  padding: '1.25rem 1.5rem',
  borderTop: '1px solid #e9ecef',
  display: 'flex',
  justifyContent: 'flex-end',
  gap: '0.75rem',
  background: '#f8f9fa'
};

const buttonPrimaryStyles = {
  background: '#0F5C8C',
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  padding: '0.75rem 1.5rem',
  fontWeight: 600,
  cursor: 'pointer'
};

const buttonSecondaryStyles = {
  background: 'white',
  color: '#0F5C8C',
  border: '1px solid #0F5C8C',
  borderRadius: '8px',
  padding: '0.75rem 1.5rem',
  fontWeight: 600,
  cursor: 'pointer'
};

const CourseEnrollmentSummaryModal = ({ summary, onClose, onConfirm }) => {
  if (!summary) {
    return null;
  }

  const {
    student,
    courseName,
    courseType,
    modality,
    startDate,
    scheduleList,
    enrollmentDate,
    vacantes
  } = summary;

  const capacidadTotal = vacantes?.capacidad ?? null;
  const inscritosAntes = vacantes?.inscritosAntes ?? null;
  const inscritosDespues =
    capacidadTotal !== null && vacantes?.vacantesRestantes !== null
      ? capacidadTotal - vacantes.vacantesRestantes
      : null;

  const modalityLabel = modality === 'online' ? 'Online' : 'Presencial';

  return (
    <div style={overlayStyles}>
      <div style={modalStyles}>
        <div style={headerStyles}>
          <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Inscripción registrada</h3>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'white',
              fontSize: '1.3rem',
              cursor: 'pointer',
              lineHeight: 1
            }}
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>

        <div style={bodyStyles}>
          <p style={{ marginTop: 0, marginBottom: '0.75rem', fontWeight: 600, fontSize: '1.05rem' }}>
            {student?.name}
          </p>
          <p style={{ margin: '0 0 1rem 0', color: '#134a6b' }}>{student?.email}</p>

          <div style={{ marginBottom: '0.75rem' }}>
            <strong>Curso:</strong> {courseName} {courseType ? `(${courseType})` : ''}
          </div>
          <div style={{ marginBottom: '0.5rem' }}>
            <strong>Modalidad:</strong> {modalityLabel}
          </div>
          <div style={{ marginBottom: '0.5rem' }}>
            <strong>Inicio:</strong> {startDate}
          </div>
          {scheduleList && scheduleList.length > 0 && (
            <div style={{ marginBottom: '0.5rem' }}>
              <strong>Días y horarios:</strong>
              <ul style={{ margin: '0.5rem 0 0 1rem', padding: 0 }}>
                {scheduleList.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          )}
          <div style={{ marginBottom: '0.5rem' }}>
            <strong>Registrada el:</strong> {enrollmentDate}
          </div>
          {capacidadTotal !== null && (
            <div style={{ fontSize: '0.9rem', marginTop: '0.75rem' }}>
              Cupo: {inscritosAntes !== null ? inscritosAntes : '--'} ➝ {inscritosDespues !== null ? inscritosDespues : '--'} de {capacidadTotal}
              {vacantes?.vacantesRestantes !== null && ` — ${vacantes.vacantesRestantes} lugares disponibles`}
            </div>
          )}
        </div>

        <div style={footerStyles}>
          <button
            type="button"
            onClick={onClose}
            style={buttonSecondaryStyles}
          >
            Cerrar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            style={buttonPrimaryStyles}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

export default CourseEnrollmentSummaryModal;
