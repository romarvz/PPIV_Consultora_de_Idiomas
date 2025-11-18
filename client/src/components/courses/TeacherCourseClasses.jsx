import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiAdapter from '../../services/apiAdapter';
import CourseClassesModal from './CourseClassesModal';

const cardStyles = {
  container: {
    background: 'var(--card-bg, #fff)',
    borderRadius: '12px',
    boxShadow: '0 8px 24px rgba(15, 23, 42, 0.12)',
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    minHeight: '300px'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem'
  },
  title: {
    fontSize: '1.1rem',
    fontWeight: 600,
    color: '#1f2937',
    margin: 0
  },
  button: {
    background: 'var(--primary, #3498db)',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    padding: '0.55rem 1rem',
    fontSize: '0.9rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    cursor: 'pointer',
    transition: 'transform 0.2s ease'
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.85rem',
    overflowY: 'auto'
  },
  classCard: {
    border: '1px solid #e5e7eb',
    borderRadius: '10px',
    padding: '0.75rem',
    display: 'grid',
    gridTemplateColumns: '1fr auto',
    gap: '0.5rem',
    alignItems: 'center'
  },
  classTitle: {
    margin: 0,
    fontSize: '0.95rem',
    fontWeight: 600,
    color: '#111827'
  },
  classMeta: {
    fontSize: '0.85rem',
    color: '#6b7280'
  },
  emptyState: {
    padding: '2rem',
    textAlign: 'center',
    color: '#6b7280',
    background: '#f9fafb',
    borderRadius: '10px'
  }
};

const dedupeClasses = (items = []) => {
  const map = new Map();

  const score = (clase) => {
    const updated = clase.updatedAt ? new Date(clase.updatedAt).getTime() : 0;
    const lengthSum =
      (clase.descripcion ? clase.descripcion.length : 0) +
      (clase.contenido ? clase.contenido.length : 0) +
      (clase.tareas ? clase.tareas.length : 0) +
      (clase.notasProfesor ? clase.notasProfesor.length : 0);
    return updated + lengthSum;
  };

  items.forEach((clase) => {
    if (!clase || !clase.fechaHora) {
      return;
    }
    const cursoId = typeof clase.curso === 'string' ? clase.curso : clase.curso?._id || 'sin-curso';
    const key = `${cursoId}-${new Date(clase.fechaHora).toISOString()}`;
    const current = map.get(key);
    if (!current || score(clase) >= score(current)) {
      map.set(key, clase);
    }
  });

  return Array.from(map.values()).sort(
    (a, b) => new Date(a.fechaHora) - new Date(b.fechaHora)
  );
};

const TeacherCourseClasses = ({ course, refreshToken, onRefresh }) => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [studentsNearLimit, setStudentsNearLimit] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const courseId = course?._id;
  const navigate = useNavigate();

  const loadClasses = async () => {
    if (!courseId) return;
    try {
      setLoading(true);
      const response = await apiAdapter.classes.getAll({ curso: courseId });
      const lista = response?.data?.data || [];
      setClasses(dedupeClasses(lista));
    } catch (error) {
      console.error('TeacherCourseClasses: error cargando clases', error);
      setClasses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClasses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId, refreshToken]);

  useEffect(() => {
    const loadStudents = async () => {
      if (!courseId) return;
      try {
        setLoadingStudents(true);
        const response = await apiAdapter.cursos.getStudents(courseId);
        if (response?.data?.success) {
          const alumnos = response.data.data || [];
          const nearLimit = alumnos.filter((item) => item.asistencia?.estaCercaDelLimite);
          setStudentsNearLimit(nearLimit);
        } else {
          setStudentsNearLimit([]);
        }
      } catch (error) {
        console.error('Error al cargar estudiantes cerca del límite:', error);
        setStudentsNearLimit([]);
      } finally {
        setLoadingStudents(false);
      }
    };

    loadStudents();
  }, [courseId, refreshToken]);

  const handleModalClose = () => {
    setShowModal(false);
    loadClasses();
    if (typeof onRefresh === 'function') {
      onRefresh();
    }
  };

  if (!course) return null;

  return (
    <div style={cardStyles.container}>
      <div style={cardStyles.header}>
        <h3 style={cardStyles.title}>Clases de {course.nombre}</h3>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            style={cardStyles.button}
            onClick={() => setShowModal(true)}
          >
            <span style={{ fontSize: '1.2rem', lineHeight: 1 }}>＋</span>
            Gestionar clases
          </button>
          <button
            style={{
              ...cardStyles.button,
              background: '#1e3a8a'
            }}
            onClick={() => navigate(`/dashboard/teacher/curso/${courseId}/planilla`)}
          >
            Planilla académica
          </button>
        </div>
      </div>

      {studentsNearLimit.length > 0 && (
        <div
          style={{
            marginBottom: '1rem',
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            background: '#fff3cd',
            border: '1px solid #ffc107',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.2rem' }}>⚠️</span>
            <strong style={{ color: '#856404', fontSize: '0.9rem' }}>
              Alerta de Asistencia: {studentsNearLimit.length} {studentsNearLimit.length === 1 ? 'estudiante se está acercando' : 'estudiantes se están acercando'} al límite de inasistencias
            </strong>
          </div>
          <div style={{ fontSize: '0.85rem', color: '#856404' }}>
            {studentsNearLimit.map((item, index) => {
              const estudiante = item.estudiante || item;
              const nombre = `${estudiante?.firstName || ''} ${estudiante?.lastName || ''}`.trim();
              const inasistenciasRestantes = item.asistencia?.inasistenciasRestantes;
              return (
                <span key={item.estudiante?._id || item.estudiante?.id || index}>
                  {nombre}
                  {inasistenciasRestantes !== undefined && (
                    <>
                      {' '}
                      ({inasistenciasRestantes === 0
                        ? 'límite alcanzado'
                        : inasistenciasRestantes === 1
                        ? '1 falta antes del límite'
                        : `${inasistenciasRestantes} faltas antes del límite`}
                      )
                    </>
                  )}
                  {index < studentsNearLimit.length - 1 ? ', ' : ''}
                </span>
              );
            })}
          </div>
        </div>
      )}


      {loading ? (
        <div style={cardStyles.emptyState}>Cargando clases...</div>
      ) : classes.length === 0 ? (
        <div style={cardStyles.emptyState}>
          Aún no hay clases programadas para este curso.
          <br />
          Haz clic en "Gestionar clases" para agendar la primera sesión.
        </div>
      ) : (
        <div style={cardStyles.list}>
          {classes.map((clase) => (
            <div key={clase._id} style={cardStyles.classCard}>
              <div>
                <h4 style={cardStyles.classTitle}>{clase.titulo}</h4>
                <div style={cardStyles.classMeta}>
                  {new Date(clase.fechaHora).toLocaleString()} • {clase.duracionMinutos} min
                </div>
                <div style={cardStyles.classMeta}>
                  {clase.modalidad === 'virtual' ? 'Virtual' : 'Presencial'} • Estado: {clase.estado}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <CourseClassesModal
          course={course}
          onClose={handleModalClose}
        />
      )}
    </div>
  );
};

export default TeacherCourseClasses;


