import React, { useEffect, useState } from 'react';
import apiAdapter from '../../services/apiAdapter';

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
  padding: '24px'
};

const modalStyles = {
  background: '#fff',
  borderRadius: '12px',
  width: '100%',
  maxWidth: '720px',
  maxHeight: '90vh',
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
  boxShadow: '0 20px 45px rgba(15, 92, 140, 0.2)'
};

const headerStyles = {
  padding: '1.25rem 1.5rem',
  borderBottom: '1px solid #e9ecef',
  background: '#0F5C8C',
  color: '#fff',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center'
};

const bodyStyles = {
  padding: '1.5rem',
  overflowY: 'auto'
};

const footerStyles = {
  padding: '1.25rem 1.5rem',
  borderTop: '1px solid #e9ecef',
  background: '#f8f9fa',
  display: 'flex',
  justifyContent: 'flex-end'
};

const buttonStyles = {
  background: '#0F5C8C',
  color: '#fff',
  border: 'none',
  borderRadius: '8px',
  padding: '0.6rem 1.4rem',
  fontWeight: 600,
  cursor: 'pointer'
};

const tableStyles = {
  width: '100%',
  borderCollapse: 'collapse'
};

const thStyles = {
  textAlign: 'left',
  fontWeight: 600,
  padding: '0.75rem',
  borderBottom: '1px solid #dee2e6',
  background: '#f8f9fa'
};

const tdStyles = {
  padding: '0.75rem',
  borderBottom: '1px solid #f0f0f0',
  fontSize: '0.95rem',
  color: '#36454f'
};

const emptyStyles = {
  padding: '2rem',
  textAlign: 'center',
  color: '#6c757d'
};

const CourseStudentsModal = ({ course, onClose, onStudentRemoved }) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [removing, setRemoving] = useState(false);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await apiAdapter.cursos.getStudents(course._id || course.id);
        if (response?.data?.success) {
          setStudents(response.data.data || []);
        } else {
          setStudents([]);
        }
      } catch (err) {
        console.error('Error al cargar los estudiantes del curso:', err);
        const message = err?.response?.data?.error
          || err?.response?.data?.message
          || err.message
          || 'No se pudieron cargar los estudiantes.';
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [course?._id, course?.id]);

  const formatProgress = (progreso = {}) => {
    const porcentaje = progreso?.porcentaje ?? 0;
    const horas = progreso?.horasCompletadas ?? 0;
    return `${porcentaje}% (${horas} h)`;
  };

  const formatDate = (isoDate) => {
    if (!isoDate) return '—';
    const value = new Date(isoDate);
    if (Number.isNaN(value.getTime())) {
      return '—';
    }
    return value.toLocaleDateString('es-AR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const handleRemove = async (studentItem) => {
    const estudiante = studentItem.estudiante || studentItem;
    const estudianteId = estudiante?._id || estudiante?.id;
    if (!estudianteId) {
      return;
    }
    const confirmMessage = `¿Querés desinscribir a ${estudiante.firstName || ''} ${estudiante.lastName || ''}?`;
    if (!window.confirm(confirmMessage)) {
      return;
    }
    try {
      setRemoving(true);
      setFeedback('');
      await apiAdapter.cursos.removeStudent(course._id || course.id, estudianteId);
      setStudents((prev) =>
        prev.filter((item) => {
          const est = item.estudiante || item;
          const id = est?._id || est?.id;
          return id !== estudianteId;
        })
      );
      setFeedback('Estudiante desinscripto correctamente.');
      // Notificar al componente padre que se borró un estudiante
      if (onStudentRemoved) {
        onStudentRemoved();
      }
    } catch (err) {
      console.error('Error al desinscribir estudiante:', err);
      const message = err?.response?.data?.error
        || err?.response?.data?.message
        || err.message
        || 'No se pudo desinscribir al estudiante.';
      setFeedback(message);
    } finally {
      setRemoving(false);
    }
  };

  return (
    <div style={overlayStyles}>
      <div style={modalStyles}>
        <div style={headerStyles}>
          <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Estudiantes – {course?.nombre}</h3>
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
          {loading ? (
            <div style={emptyStyles}>Cargando estudiantes...</div>
          ) : error ? (
            <div style={emptyStyles}>
              <strong>Error:</strong> {error}
            </div>
          ) : students.length === 0 ? (
            <div style={emptyStyles}>Todavía no hay estudiantes inscriptos en este curso.</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={tableStyles}>
                <thead>
                  <tr>
                    <th style={thStyles}>Estudiante</th>
                    <th style={thStyles}>DNI</th>
                    <th style={thStyles}>Email</th>
                    <th style={thStyles}>Inscripto el</th>
                    <th style={thStyles}>Progreso</th>
                    <th style={thStyles}>Asistencia</th>
                    <th style={thStyles}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((item) => {
                    const estudiante = item.estudiante || item;
                    const key =
                      estudiante?._id ||
                      estudiante?.id ||
                      item.estudianteId ||
                      `${estudiante?.email || 'student'}-${item.fechaInscripcion || Math.random()}`;
                    
                    const asistencia = item.asistencia;
                    const estaCercaDelLimite = asistencia?.estaCercaDelLimite;
                    const porcentajeAsistencia = asistencia?.porcentajeAsistencia || 0;
                    const inasistenciasRestantes = asistencia?.inasistenciasRestantes;
                    const totalClases = asistencia?.totalClases || 0;

                    return (
                      <tr key={key}>
                        <td style={tdStyles}>
                          {`${estudiante?.firstName || ''} ${estudiante?.lastName || ''}`.trim() || '—'}
                        </td>
                        <td style={{ ...tdStyles, fontFamily: 'monospace', fontWeight: '500' }}>
                          {estudiante?.dni || 'Sin DNI'}
                        </td>
                        <td style={tdStyles}>{estudiante?.email || item.email || '—'}</td>
                        <td style={tdStyles}>{formatDate(item.fechaInscripcion)}</td>
                        <td style={tdStyles}>{formatProgress(item.progreso)}</td>
                        <td style={tdStyles}>
                          {totalClases > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={{ fontWeight: 600, color: porcentajeAsistencia >= 85 ? '#16a34a' : porcentajeAsistencia >= 70 ? '#f59e0b' : '#e74c3c' }}>
                                  {porcentajeAsistencia.toFixed(1)}%
                                </span>
                                {estaCercaDelLimite && (
                                  <span
                                    style={{
                                      display: 'inline-block',
                                      padding: '0.15rem 0.5rem',
                                      borderRadius: '4px',
                                      fontSize: '0.75rem',
                                      fontWeight: 600,
                                      background: '#fff3cd',
                                      color: '#856404',
                                      border: '1px solid #ffc107'
                                    }}
                                  >
                                    ⚠️ Alerta
                                  </span>
                                )}
                              </div>
                              {estaCercaDelLimite && (
                                <span style={{ fontSize: '0.75rem', color: '#856404' }}>
                                  {inasistenciasRestantes === 0
                                    ? 'Límite alcanzado'
                                    : inasistenciasRestantes === 1
                                    ? '1 falta antes del límite'
                                    : `${inasistenciasRestantes} faltas antes del límite`}
                                </span>
                              )}
                              <span style={{ fontSize: '0.75rem', color: '#6c757d' }}>
                                {asistencia?.clasesAsistidas || 0}/{totalClases} clases
                              </span>
                            </div>
                          ) : (
                            <span style={{ color: '#6c757d', fontSize: '0.85rem' }}>Sin clases completadas</span>
                          )}
                        </td>
                        <td style={{ ...tdStyles, textAlign: 'right' }}>
                          <button
                            type="button"
                            onClick={() => handleRemove(item)}
                            style={{
                              background: '#e74c3c',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '6px',
                              padding: '0.4rem 0.8rem',
                              fontSize: '0.85rem',
                              cursor: 'pointer'
                            }}
                            disabled={removing}
                          >
                            Quitar
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {feedback && (
                <div style={{ marginTop: '1rem', color: feedback.includes('No se pudo') ? '#c0392b' : '#0F5C8C' }}>
                  {feedback}
                </div>
              )}
            </div>
          )}
        </div>

        <div style={footerStyles}>
          <button type="button" onClick={onClose} style={buttonStyles}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default CourseStudentsModal;
