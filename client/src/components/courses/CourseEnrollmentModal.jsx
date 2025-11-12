import React, { useEffect, useMemo, useState } from 'react';
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
  overflowY: 'auto'
};

const footerStyles = {
  padding: '1.25rem 1.5rem',
  borderTop: '1px solid #e9ecef',
  display: 'flex',
  justifyContent: 'flex-end',
  gap: '0.75rem',
  background: '#f8f9fa'
};

const inputStyles = {
  width: '100%',
  padding: '0.75rem',
  borderRadius: '8px',
  border: '1px solid #d0d7de',
  fontSize: '0.95rem',
  transition: 'border-color 0.2s ease'
};

const buttonPrimaryStyles = {
  background: '#0F5C8C',
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  padding: '0.75rem 1.5rem',
  fontWeight: 600,
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.4rem'
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

const CourseEnrollmentModal = ({ course, onClose, onSuccess }) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const capacidad = Number(course?.vacantesMaximas ?? 30);
  const inscritos = Array.isArray(course?.estudiantes)
    ? course.estudiantes.length
    : (course?.estudiantesCount || 0);
  const vacantesRestantes = Number.isFinite(capacidad)
    ? Math.max(capacidad - inscritos, 0)
    : null;
  const cursoLleno = vacantesRestantes !== null && vacantesRestantes <= 0;

  useEffect(() => {
    setSelectedStudent('');
    setSearchTerm('');
    setError('');
  }, [course?._id]);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const response = await apiAdapter.students.getAll({
          limit: 100,
          status: 'active'
        });

        if (response?.data?.success) {
          const list = response.data.data?.students || response.data.data || [];
          setStudents(list);
        } else {
          setError('No se pudieron cargar los estudiantes.');
        }
      } catch (err) {
        console.error('Error al cargar estudiantes:', err);
        const message = err?.response?.data?.message || err.message || 'Error al cargar estudiantes.';
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [course?._id]);

  const filteredStudents = useMemo(() => {
    if (!searchTerm) {
      return students;
    }
    const term = searchTerm.toLowerCase();
    return students.filter((student) => {
      const fullName = `${student.firstName || ''} ${student.lastName || ''}`.toLowerCase();
      const email = (student.email || '').toLowerCase();
      return fullName.includes(term) || email.includes(term);
    });
  }, [students, searchTerm]);

  const formatDate = (isoDate) => {
    if (!isoDate) return 'No especificada';
    const date = new Date(isoDate);
    if (Number.isNaN(date.getTime())) {
      return 'No especificada';
    }

    const localDate = new Date(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate()
    );

    return localDate.toLocaleDateString('es-AR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const obtenerHorarios = () => {
    if (Array.isArray(course?.horarios) && course.horarios.length > 0) {
      return course.horarios
        .map((horario) => {
          if (!horario) return null;
          const dia = horario.dia ? horario.dia.charAt(0).toUpperCase() + horario.dia.slice(1) : (horario.display?.split(' ')[0] || 'Día');
          const inicio = horario.horaInicio || horario.display?.match(/\d{2}:\d{2}/)?.[0] || '--:--';
          const finMatch = horario.horaFin
            ? horario.horaFin
            : horario.display?.match(/ - (\d{2}:\d{2})/);
          const fin = Array.isArray(finMatch) ? finMatch[1] : finMatch || '';
          return `${dia} ${inicio}${fin ? ` - ${fin}` : ''}`;
        })
        .filter(Boolean);
    }
    if (course?.horario && (course.horario.display || course.horario.dia)) {
      const horario = course.horario;
      const dia = horario.dia ? horario.dia.charAt(0).toUpperCase() + horario.dia.slice(1) : (horario.display?.split(' ')[0] || 'Día');
      const inicio = horario.horaInicio || horario.display?.match(/\d{2}:\d{2}/)?.[0] || '--:--';
      const finMatch = horario.horaFin
        ? horario.horaFin
        : horario.display?.match(/ - (\d{2}:\d{2})/);
      const fin = Array.isArray(finMatch) ? finMatch[1] : finMatch || '';
      return [`${dia} ${inicio}${fin ? ` - ${fin}` : ''}`];
    }
    return [];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStudent) {
      setError('Seleccioná un estudiante para inscribir.');
      return;
    }
    if (cursoLleno) {
      setError('Este curso ya no tiene vacantes disponibles.');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      const response = await apiAdapter.cursos.enroll(course._id || course.id, selectedStudent);
      const selectedInfo = students.find((student) => (student._id || student.id) === selectedStudent);
      const inscripcion = response?.data?.data || {};
      const fechaInscripcion = inscripcion?.fechaInscripcion || new Date().toISOString();

      let totalInscritosDespues = null;
      try {
        const inscritosResponse = await apiAdapter.cursos.getStudents(course._id || course.id);
        if (inscritosResponse?.data?.success) {
          totalInscritosDespues = (inscritosResponse.data.data || []).length;
        }
      } catch (fetchError) {
        console.warn('No se pudieron refrescar los estudiantes del curso:', fetchError);
      }

      const inscritosAntes = Number.isFinite(totalInscritosDespues)
        ? Math.max(totalInscritosDespues - 1, 0)
        : inscritos;

      const summary = {
        courseId: course?._id || course?.id,
        courseName: course?.nombre || course?.name || 'Curso',
        courseType: course?.type,
        modality: course?.modalidad,
        startDate: formatDate(course?.fechaInicio),
        scheduleList: obtenerHorarios(),
        student: {
          id: selectedInfo?._id || selectedInfo?.id || selectedStudent,
          name: `${selectedInfo?.firstName || ''} ${selectedInfo?.lastName || ''}`.trim() || 'Estudiante',
          email: selectedInfo?.email
        },
        enrollmentDate: formatDate(fechaInscripcion),
        vacantes: {
          capacidad,
          inscritosAntes,
          vacantesRestantes: Number.isFinite(capacidad)
            ? Math.max(capacidad - (Number.isFinite(totalInscritosDespues) ? totalInscritosDespues : (inscritos + 1)), 0)
            : null
        },
        courseSnapshot: course
      };

      if (onSuccess) {
        onSuccess(summary);
      }

      setSelectedStudent('');
      setSearchTerm('');
      setError('');
      onClose?.();
    } catch (err) {
      console.error('Error al inscribir estudiante:', err);
      const message = err?.response?.data?.error
        || err?.response?.data?.message
        || err.message
        || 'No se pudo inscribir al estudiante.';
      setError(message);
      setSubmitting(false);
      return;
    }
    setSubmitting(false);
  };

  return (
    <div style={overlayStyles}>
      <div style={modalStyles}>
        <div style={headerStyles}>
          <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Inscribir estudiante</h3>
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
            aria-label="Cerrar modal"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <div style={bodyStyles}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.25rem', color: '#0F5C8C' }}>
                Curso seleccionado
              </label>
              <div style={{ padding: '0.75rem', background: '#f0f6fb', borderRadius: '8px', color: '#0F5C8C', fontWeight: 600 }}>
                {course?.nombre || course?.name}
              </div>
              {Number.isFinite(capacidad) && (
                <div style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: cursoLleno ? '#c0392b' : '#0F5C8C' }}>
                  Vacantes: {Math.max(inscritos, 0)} / {capacidad} {vacantesRestantes !== null && `– ${vacantesRestantes} disponibles`}
                </div>
              )}
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.35rem' }}>Buscar estudiante</label>
              <input
                type="text"
                placeholder="Ingresá nombre, apellido o email"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={inputStyles}
                disabled={loading || cursoLleno}
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.35rem' }}>Estudiante</label>
              <select
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value)}
                style={inputStyles}
                disabled={loading || submitting || cursoLleno}
              >
                <option value="">Seleccioná un estudiante</option>
                {filteredStudents.map((student) => (
                  <option key={student._id || student.id} value={student._id || student.id}>
                    {`${student.firstName || ''} ${student.lastName || ''}`.trim()} — {student.email}
                  </option>
                ))}
              </select>
              {filteredStudents.length === 0 && !loading && (
                <small style={{ display: 'block', marginTop: '0.5rem', color: '#6c757d' }}>
                  No se encontraron estudiantes con ese criterio.
                </small>
              )}
              {cursoLleno && (
                <small style={{ display: 'block', marginTop: '0.5rem', color: '#c0392b' }}>
                  Este curso ya alcanzó el cupo máximo de vacantes.
                </small>
              )}
            </div>

            {error && (
              <div
                style={{
                  background: '#fdecea',
                  color: '#b71c1c',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  marginBottom: '1rem'
                }}
              >
                {error}
              </div>
            )}

            {loading && (
              <div style={{ color: '#0F5C8C', fontWeight: 500 }}>Cargando estudiantes...</div>
            )}
          </div>

          <div style={footerStyles}>
            <button
              type="button"
              onClick={onClose}
              style={buttonSecondaryStyles}
              disabled={submitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              style={{ ...buttonPrimaryStyles, opacity: submitting || cursoLleno ? 0.7 : 1 }}
              disabled={submitting || loading || cursoLleno}
            >
              {submitting ? 'Inscribiendo...' : 'Inscribir'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CourseEnrollmentModal;

