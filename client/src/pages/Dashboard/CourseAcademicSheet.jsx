import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaArrowLeft, FaSave } from 'react-icons/fa';
import apiAdapter from '../../services/apiAdapter';
import { routes } from '../../utils/routes';

const containerStyle = {
  minHeight: '100vh',
  background: 'var(--bg-main, #f3f4f6)',
  padding: '1.5rem'
};

const cardStyle = {
  background: 'white',
  borderRadius: '12px',
  boxShadow: '0 10px 30px rgba(15, 23, 42, 0.15)',
  padding: '1.5rem',
  maxWidth: '1200px',
  margin: '0 auto'
};

const headerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '1.5rem'
};

const CourseAcademicSheet = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState('all'); // all | atRisk

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError('');

        const [courseRes, studentsRes] = await Promise.all([
          apiAdapter.cursos.getById(courseId),
          apiAdapter.cursos.getStudents(courseId)
        ]);

        if (courseRes?.data?.success) {
          setCourse(courseRes.data.data);
        }

        if (studentsRes?.data?.success) {
          const lista = (studentsRes.data.data || []).map((item) => ({
            ...item,
            localNotas: item.notasAdicionales || '',
            localTp1: item.tp1 ?? '',
            localTp2: item.tp2 ?? '',
            localParcial1: item.parcial1 ?? '',
            localParcial2: item.parcial2 ?? '',
            localExamenFinal: item.examenFinal ?? ''
          }));
          setStudents(lista);
        } else {
          setStudents([]);
        }
      } catch (err) {
        console.error('Error cargando planilla académica:', err);
        setError('No se pudo cargar la planilla académica.');
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      loadData();
    }
  }, [courseId]);

  const handleNotasChange = (index, value) => {
    setStudents((prev) => {
      const next = [...prev];
      next[index] = {
        ...next[index],
        localNotas: value
      };
      return next;
    });
  };

  const handleNotaFieldChange = (index, field, value) => {
    setStudents((prev) => {
      const next = [...prev];
      next[index] = {
        ...next[index],
        [field]: value
      };
      return next;
    });
  };

  const calcularPromedioLocal = (student) => {
    const rawValues = [
      student.localTp1,
      student.localTp2,
      student.localParcial1,
      student.localParcial2,
      student.localExamenFinal
    ];

    const numeros = rawValues
      .map((v) => {
        if (v === null || v === undefined || v === '') return null;
        const num = Number(v);
        return Number.isFinite(num) ? num : null;
      })
      .filter((v) => v !== null);

    if (numeros.length === 0) return '';

    const suma = numeros.reduce((acc, v) => acc + v, 0);
    const promedio = suma / numeros.length;

    return promedio.toFixed(1);
  };

  const handleSaveRow = async (student, index) => {
    if (!courseId || !student.inscripcionId) return;
    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const payload = {
        notasAdicionales: student.localNotas || '',
        tp1: student.localTp1,
        tp2: student.localTp2,
        parcial1: student.localParcial1,
        parcial2: student.localParcial2,
        examenFinal: student.localExamenFinal
      };

      await apiAdapter.courses.updateEnrollmentNotes(courseId, student.inscripcionId, payload);

      setSuccess('Notas guardadas correctamente.');
    } catch (err) {
      console.error('Error guardando notas:', err);
      const message =
        err?.response?.data?.error ||
        err?.message ||
        'No se pudieron guardar las notas.';
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const getAttendanceBadge = (asistencia = {}) => {
    const pct = asistencia.porcentajeAsistencia ?? 0;
    if (pct >= 85) return { text: 'Regular', color: '#16a34a', bg: '#dcfce7' };
    if (pct >= 70) return { text: 'En riesgo', color: '#ea580c', bg: '#ffedd5' };
    return { text: 'Bajo', color: '#b91c1c', bg: '#fee2e2' };
  };

  const handleBack = () => {
    navigate(routes.DASHBOARD.TEACHER);
  };

  const filterStudents = () => {
    const term = (searchTerm || '').toLowerCase().trim();

    return students.filter((item) => {
      const estudiante = item.estudiante || {};
      const asistencia = item.asistencia || {};

      // Filtro por búsqueda (nombre/email)
      if (term) {
        const fullName = `${estudiante.firstName || ''} ${estudiante.lastName || ''}`
          .toLowerCase()
          .trim();
        const email = (estudiante.email || '').toLowerCase().trim();
        if (!fullName.includes(term) && !email.includes(term)) {
          return false;
        }
      }

      // Filtro por riesgo
      if (riskFilter === 'atRisk') {
        const pct = asistencia.porcentajeAsistencia ?? 0;
        const estaCercaDelLimite = asistencia.estaCercaDelLimite;
        const bajo = pct < 70;
        if (!estaCercaDelLimite && !bajo) {
          return false;
        }
      }

      return true;
    });
  };

  const visibleStudents = filterStudents();

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <div style={headerStyle}>
          <button
            onClick={handleBack}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.4rem 0.8rem',
              borderRadius: '999px',
              border: '1px solid #d1d5db',
              background: '#f9fafb',
              cursor: 'pointer',
              fontSize: '0.85rem'
            }}
          >
            <FaArrowLeft /> Volver al dashboard
          </button>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#111827' }}>
              Planilla académica
            </h2>
            <p style={{ margin: '0.25rem 0', color: '#6b7280', fontSize: '0.9rem' }}>
              Curso: {course?.nombre || '—'}
            </p>
          </div>
        </div>

        {error && (
          <div
            style={{
              marginBottom: '1rem',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              border: '1px solid #fecaca',
              background: '#fef2f2',
              color: '#b91c1c'
            }}
          >
            {error}
          </div>
        )}

        {success && (
          <div
            style={{
              marginBottom: '1rem',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              border: '1px solid #bbf7d0',
              background: '#ecfdf3',
              color: '#166534'
            }}
          >
            {success}
          </div>
        )}

        {loading ? (
          <p style={{ color: '#6b7280' }}>Cargando planilla...</p>
        ) : students.length === 0 ? (
          <p style={{ color: '#6b7280' }}>
            Aún no hay estudiantes inscriptos en este curso.
          </p>
        ) : (
          <>
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '0.75rem',
                marginBottom: '1rem'
              }}
            >
              <div style={{ flex: '1 1 220px' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.8rem',
                    color: '#6b7280',
                    marginBottom: '0.25rem'
                  }}
                >
                  Buscar por nombre o email
                </label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Ej: Laura, laura@example.com"
                  style={{
                    width: '100%',
                    padding: '0.4rem 0.6rem',
                    borderRadius: '6px',
                    border: '1px solid #d1d5db',
                    fontSize: '0.85rem'
                  }}
                />
              </div>
              <div style={{ width: '180px' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.8rem',
                    color: '#6b7280',
                    marginBottom: '0.25rem'
                  }}
                >
                  Filtrar por riesgo
                </label>
                <select
                  value={riskFilter}
                  onChange={(e) => setRiskFilter(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.4rem 0.6rem',
                    borderRadius: '6px',
                    border: '1px solid #d1d5db',
                    fontSize: '0.85rem',
                    background: 'white'
                  }}
                >
                  <option value="all">Todos los estudiantes</option>
                  <option value="atRisk">Solo en riesgo / bajo</option>
                </select>
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontSize: '0.9rem'
                }}
              >
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', padding: '0.75rem', borderBottom: '1px solid #e5e7eb' }}>Alumno</th>
                    <th style={{ textAlign: 'left', padding: '0.75rem', borderBottom: '1px solid #e5e7eb' }}>Email</th>
                    <th style={{ textAlign: 'center', padding: '0.75rem', borderBottom: '1px solid #e5e7eb' }}>Asistencia</th>
                    <th style={{ textAlign: 'center', padding: '0.75rem', borderBottom: '1px solid #e5e7eb' }}>Faltas / límite</th>
                    <th style={{ textAlign: 'center', padding: '0.75rem', borderBottom: '1px solid #e5e7eb' }}>TP1</th>
                    <th style={{ textAlign: 'center', padding: '0.75rem', borderBottom: '1px solid #e5e7eb' }}>TP2</th>
                    <th style={{ textAlign: 'center', padding: '0.75rem', borderBottom: '1px solid #e5e7eb' }}>Parcial 1</th>
                    <th style={{ textAlign: 'center', padding: '0.75rem', borderBottom: '1px solid #e5e7eb' }}>Parcial 2</th>
                    <th style={{ textAlign: 'center', padding: '0.75rem', borderBottom: '1px solid #e5e7eb' }}>Examen final</th>
                    <th style={{ textAlign: 'center', padding: '0.75rem', borderBottom: '1px solid #e5e7eb' }}>Promedio</th>
                    <th style={{ textAlign: 'left', padding: '0.75rem', borderBottom: '1px solid #e5e7eb' }}>Notas / observaciones</th>
                    <th style={{ padding: '0.75rem', borderBottom: '1px solid #e5e7eb' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {visibleStudents.map((item, index) => {
                    const estudiante = item.estudiante || {};
                    const asistencia = item.asistencia || {};
                    const badge = getAttendanceBadge(asistencia);
                    const faltas = asistencia.clasesFaltadas ?? 0;
                    const limite = asistencia.limiteMaximoInasistencias ?? 0;

                    return (
                      <tr key={item.inscripcionId || estudiante._id || index}>
                        <td style={{ padding: '0.75rem', borderBottom: '1px solid #f3f4f6' }}>
                          <div style={{ fontWeight: 600, color: '#111827' }}>
                            {(estudiante.firstName || '') + ' ' + (estudiante.lastName || '')}
                          </div>
                        </td>
                        <td style={{ padding: '0.75rem', borderBottom: '1px solid #f3f4f6', color: '#4b5563' }}>
                          {estudiante.email || '—'}
                        </td>
                        <td style={{ padding: '0.75rem', borderBottom: '1px solid #f3f4f6', textAlign: 'center' }}>
                          <div style={{ marginBottom: '0.25rem', fontWeight: 600 }}>
                            {typeof asistencia.porcentajeAsistencia === 'number'
                              ? `${asistencia.porcentajeAsistencia.toFixed(1)}%`
                              : '—'}
                          </div>
                          <span
                            style={{
                              display: 'inline-block',
                              padding: '0.15rem 0.6rem',
                              borderRadius: '999px',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              background: badge.bg,
                              color: badge.color
                            }}
                          >
                            {badge.text}
                          </span>
                        </td>
                        <td style={{ padding: '0.75rem', borderBottom: '1px solid #f3f4f6', textAlign: 'center', color: '#4b5563' }}>
                          {limite > 0 ? `${faltas} / ${limite}` : '—'}
                        </td>
                        {['localTp1', 'localTp2', 'localParcial1', 'localParcial2', 'localExamenFinal'].map(
                          (fieldKey) => (
                            <td
                              key={fieldKey}
                              style={{
                                padding: '0.75rem',
                                borderBottom: '1px solid #f3f4f6',
                                textAlign: 'center'
                              }}
                            >
                              <input
                                type="number"
                                min="0"
                                max="10"
                                step="0.1"
                                value={item[fieldKey]}
                                onChange={(e) => handleNotaFieldChange(index, fieldKey, e.target.value)}
                                style={{
                                  width: '4rem',
                                  padding: '0.25rem 0.35rem',
                                  borderRadius: '6px',
                                  border: '1px solid #d1d5db',
                                  fontSize: '0.8rem',
                                  textAlign: 'center'
                                }}
                              />
                            </td>
                          )
                        )}
                        <td
                          style={{
                            padding: '0.75rem',
                            borderBottom: '1px solid #f3f4f6',
                            textAlign: 'center',
                            color: '#111827',
                            fontWeight: 600
                          }}
                        >
                          {calcularPromedioLocal(item) || '—'}
                        </td>
                        <td style={{ padding: '0.75rem', borderBottom: '1px solid #f3f4f6' }}>
                          <textarea
                            value={item.localNotas}
                            onChange={(e) => handleNotasChange(index, e.target.value)}
                            rows={2}
                            placeholder="Notas internas, observaciones de seguimiento..."
                            style={{
                              width: '100%',
                              padding: '0.5rem',
                              borderRadius: '6px',
                              border: '1px solid #d1d5db',
                              fontSize: '0.85rem',
                              resize: 'vertical'
                            }}
                          />
                        </td>
                        <td style={{ padding: '0.75rem', borderBottom: '1px solid #f3f4f6', textAlign: 'center' }}>
                          <button
                            onClick={() => handleSaveRow(item, index)}
                            disabled={saving}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.3rem',
                              padding: '0.35rem 0.8rem',
                              borderRadius: '999px',
                              border: 'none',
                              background: '#2563eb',
                              color: 'white',
                              fontSize: '0.8rem',
                              cursor: saving ? 'not-allowed' : 'pointer',
                              opacity: saving ? 0.7 : 1
                            }}
                          >
                            <FaSave /> Guardar
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CourseAcademicSheet;


