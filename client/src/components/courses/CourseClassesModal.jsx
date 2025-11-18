import React, { useEffect, useMemo, useState } from 'react';
import apiAdapter from '../../services/apiAdapter';
import ClassAttendanceForm from '../attendance/ClassAttendanceForm';

const modalStyles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10001,
    padding: '20px',
    overflowY: 'auto'
  },
  container: {
    width: '100%',
    maxWidth: '1100px',
    background: 'white',
    borderRadius: '12px',
    boxShadow: '0 15px 40px rgba(0,0,0,0.2)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    maxHeight: 'calc(100vh - 80px)'
  },
  header: {
    padding: '1.25rem 1.5rem',
    borderBottom: '1px solid #e9ecef',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  title: {
    margin: 0,
    fontSize: '1.1rem',
    fontWeight: '600',
    color: '#2c3e50'
  },
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: '1.5rem',
    color: '#6c757d',
    cursor: 'pointer'
  },
  content: {
    padding: '1.5rem',
    overflowY: 'auto',
    overflowX: 'hidden'
  },
  sectionTitle: {
    fontSize: '1rem',
    fontWeight: 600,
    marginBottom: '0.75rem',
    color: '#495057'
  }
};

const defaultFormData = {
  titulo: '',
  descripcion: '',
  fechaHora: '',
  duracionMinutos: 60,
  modalidad: 'presencial',
  aula: '',
  enlaceVirtual: '',
  contenido: '',
  tareas: '',
  notasProfesor: ''
};

const modalidadOptions = [
  { value: 'presencial', label: 'Presencial' },
  { value: 'virtual', label: 'Virtual / Online' }
];

const formatDateTime = (isoString) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  return date.toLocaleString(undefined, {
    dateStyle: 'short',
    timeStyle: 'short'
  });
};

const truncate = (text, maxLength = 120) => {
  if (!text) {
    return '—';
  }
  if (text.length <= maxLength) {
    return text;
  }
  return `${text.slice(0, maxLength).trim()}…`;
};

const toDateTimeLocal = (isoString) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  const tzOffset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - tzOffset * 60000);
  return localDate.toISOString().slice(0, 16);
};

const getProfessorId = (course) => {
  if (!course) return '';
  if (typeof course.profesor === 'string') return course.profesor;
  if (course.profesor && course.profesor._id) return course.profesor._id;
  return '';
};

const CourseClassesModal = ({ course, onClose, isReadOnly = false }) => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState(defaultFormData);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [selectedClaseForAttendance, setSelectedClaseForAttendance] = useState(null);
  const [showAttendanceForm, setShowAttendanceForm] = useState(false);
  const professorId = useMemo(() => getProfessorId(course), [course]);
  const isEditable = !isReadOnly;

  const loadClasses = async () => {
    try {
      setLoading(true);
      const response = await apiAdapter.classes.getAll({ curso: course._id });
      const lista = response?.data?.data || [];
      // Sort by date order regardless of status
      const sortedClasses = lista.sort((a, b) => new Date(a.fechaHora) - new Date(b.fechaHora));
      setClasses(sortedClasses);
    } catch (err) {
      console.error('Error cargando clases:', err);
      setError(err?.message || 'No se pudieron cargar las clases');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClasses();
  }, [course?._id]);

  const resetForm = () => {
    setFormData({
      ...defaultFormData,
      modalidad: course?.modalidad === 'online' ? 'virtual' : (course?.modalidad || 'presencial'),
      duracionMinutos: course?.duracionClaseMinutos || defaultFormData.duracionMinutos
    });
    setEditingId(null);
  };

  useEffect(() => {
    resetForm();
  }, [course]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditClass = (clase) => {
    if (!isEditable) {
      return;
    }

    setEditingId(clase._id);
    setError('');
    setSuccess('');

    setFormData({
      titulo: clase.titulo || '',
      descripcion: clase.descripcion || '',
      fechaHora: toDateTimeLocal(clase.fechaHora),
      duracionMinutos: clase.duracionMinutos || 60,
      modalidad: clase.modalidad || (course?.modalidad === 'online' ? 'virtual' : 'presencial'),
      aula: clase.modalidad === 'presencial' ? (clase.aula || '') : '',
      enlaceVirtual: clase.modalidad === 'virtual' ? (clase.enlaceVirtual || '') : '',
      contenido: clase.contenido || '',
      tareas: clase.tareas || '',
      notasProfesor: clase.notasProfesor || ''
    });
    
    // Scroll to form
    const formElement = document.querySelector('form');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleCancelEdit = () => {
    resetForm();
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isReadOnly) {
      return;
    }
    setError('');
    setSuccess('');

    if (!professorId) {
      setError('El curso no tiene un profesor asignado.');
      return;
    }

    if (!formData.fechaHora) {
      setError('Debes seleccionar fecha y hora.');
      return;
    }

    if (formData.modalidad === 'virtual' && !formData.enlaceVirtual) {
      setError('Para clases virtuales debes proporcionar un enlace.');
      return;
    }

    if (formData.modalidad === 'presencial' && !formData.aula) {
      setError('Para clases presenciales especificá el aula/sala.');
      return;
    }

    try {
      setSaving(true);
      const payload = {
        curso: course._id,
        profesor: professorId,
        titulo: formData.titulo || `${course.nombre} - Clase`,
        descripcion: formData.descripcion,
        fechaHora: new Date(formData.fechaHora).toISOString(),
        duracionMinutos: Number(formData.duracionMinutos) || 60,
        modalidad: formData.modalidad,
        aula: formData.modalidad === 'presencial' ? formData.aula : undefined,
        enlaceVirtual: formData.modalidad === 'virtual' ? formData.enlaceVirtual : undefined,
        contenido: formData.contenido,
        tareas: formData.tareas,
        notasProfesor: formData.notasProfesor
      };

      if (editingId) {
        await apiAdapter.classes.update(editingId, payload);
        setSuccess('Clase actualizada correctamente.');
      } else {
        await apiAdapter.classes.create(payload);
        setSuccess('Clase creada correctamente.');
      }

      resetForm();
      await loadClasses();
    } catch (err) {
      console.error('Error creando clase:', err);
      setError(err?.error || err?.message || 'No se pudo crear la clase');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelClass = async (clase) => {
    if (!isEditable) {
      return;
    }

    const classDate = clase?.fechaHora ? new Date(clase.fechaHora) : null;
    const formattedDate = classDate
      ? classDate.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })
      : '';

    const confirmed = window.confirm(
      `¿Querés cancelar la clase "${clase.titulo}"${formattedDate ? ` del ${formattedDate}` : ''}?`
    );

    if (!confirmed) {
      return;
    }

    const motivo = `Clase cancelada por el profesor el ${new Date().toLocaleDateString('es-AR')}.`;

    try {
      await apiAdapter.classes.delete(clase._id, { motivo });
      setSuccess('Clase cancelada correctamente.');
      await loadClasses();
    } catch (err) {
      console.error('Error cancelando clase:', err);
      alert(err?.error || 'No se pudo cancelar la clase.');
    }
  };

  const handleRegistrarAsistencia = (clase) => {
    setSelectedClaseForAttendance(clase);
    setShowAttendanceForm(true);
  };

  const handleCompletarClase = async (clase) => {
    if (!clase?._id) return;

    const confirmed = window.confirm(
      'Marcar esta clase como COMPLETADA actualizará el progreso de los alumnos según la asistencia registrada. ¿Querés continuar?'
    );

    if (!confirmed) return;

    try {
      await apiAdapter.classes.completarClase(clase._id);
      setSuccess('La clase fue marcada como completada y el progreso se actualizó.');
      await loadClasses();
    } catch (err) {
      console.error('Error completando clase:', err);
      const message =
        err?.response?.data?.error || err?.message || 'No se pudo completar la clase.';
      setError(message);
    }
  };

  const handleAsistenciaRegistrada = () => {
    setShowAttendanceForm(false);
    setSelectedClaseForAttendance(null);
    loadClasses(); // Recargar clases para actualizar datos
  };

  return (
    <div style={modalStyles.overlay}>
      <div style={modalStyles.container}>
        <div style={modalStyles.header}>
          <h3 style={modalStyles.title}>Clases de {course?.nombre}</h3>
          <button style={modalStyles.closeButton} onClick={onClose} aria-label="Cerrar">×</button>
        </div>

        <div style={modalStyles.content}>
          {!isReadOnly && (
          <section style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <h4 style={modalStyles.sectionTitle}>
                {editingId ? 'Editar clase programada' : 'Agendar nueva clase'}
              </h4>
              {editingId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  style={{
                    background: 'transparent',
                    border: '1px solid #ced4da',
                    borderRadius: '6px',
                    padding: '0.45rem 0.85rem',
                    fontSize: '0.8rem',
                    color: '#495057',
                    cursor: 'pointer'
                  }}
                >
                  Cancelar edición
                </button>
              )}
            </div>
            {error && (
              <div style={{ background: '#ffebee', border: '1px solid #ef9a9a', color: '#c62828', padding: '0.75rem', borderRadius: '6px', marginBottom: '1rem' }}>{error}</div>
            )}
            {success && (
              <div style={{ background: '#e8f5e9', border: '1px solid #a5d6a7', color: '#2e7d32', padding: '0.75rem', borderRadius: '6px', marginBottom: '1rem' }}>{success}</div>
            )}
            <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ fontWeight: 600, display: 'block', marginBottom: '0.35rem', color: '#495057' }}>Título *</label>
                <input
                  type="text"
                  name="titulo"
                  value={formData.titulo}
                  onChange={handleChange}
                  placeholder="Ej: Clase 1 - Introducción"
                  required
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #ced4da', borderRadius: '6px', fontSize: '0.9rem' }}
                />
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ fontWeight: 600, display: 'block', marginBottom: '0.35rem', color: '#495057' }}>Descripción</label>
                <textarea
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleChange}
                  placeholder="Descripción breve de la clase"
                  rows={3}
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #ced4da', borderRadius: '6px', fontSize: '0.9rem', resize: 'vertical' }}
                />
              </div>

              <div>
                <label style={{ fontWeight: 600, display: 'block', marginBottom: '0.35rem', color: '#495057' }}>Fecha y hora *</label>
                <input
                  type="datetime-local"
                  name="fechaHora"
                  value={formData.fechaHora}
                  onChange={handleChange}
                  required
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #ced4da', borderRadius: '6px', fontSize: '0.9rem' }}
                />
              </div>

              <div>
                <label style={{ fontWeight: 600, display: 'block', marginBottom: '0.35rem', color: '#495057' }}>Duración (min) *</label>
                <input
                  type="number"
                  name="duracionMinutos"
                  value={formData.duracionMinutos}
                  onChange={handleChange}
                  min={30}
                  max={180}
                  step={15}
                  required
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #ced4da', borderRadius: '6px', fontSize: '0.9rem' }}
                />
              </div>

              <div>
                <label style={{ fontWeight: 600, display: 'block', marginBottom: '0.35rem', color: '#495057' }}>Modalidad *</label>
                <select
                  name="modalidad"
                  value={formData.modalidad}
                  onChange={handleChange}
                  required
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #ced4da', borderRadius: '6px', fontSize: '0.9rem', background: 'white' }}
                >
                  {modalidadOptions.map(opt => (
                    <option value={opt.value} key={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              {formData.modalidad === 'presencial' && (
                <div>
                  <label style={{ fontWeight: 600, display: 'block', marginBottom: '0.35rem', color: '#495057' }}>Aula / Sala *</label>
                  <input
                    type="text"
                    name="aula"
                    value={formData.aula}
                    onChange={handleChange}
                    placeholder="Ej: Aula 302"
                    required
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #ced4da', borderRadius: '6px', fontSize: '0.9rem' }}
                  />
                </div>
              )}

              {formData.modalidad === 'virtual' && (
                <div>
                  <label style={{ fontWeight: 600, display: 'block', marginBottom: '0.35rem', color: '#495057' }}>Enlace virtual *</label>
                  <input
                    type="url"
                    name="enlaceVirtual"
                    value={formData.enlaceVirtual}
                    onChange={handleChange}
                    placeholder="https://..."
                    required
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #ced4da', borderRadius: '6px', fontSize: '0.9rem' }}
                  />
                </div>
              )}

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ fontWeight: 600, display: 'block', marginBottom: '0.35rem', color: '#495057' }}>Contenido</label>
                <textarea
                  name="contenido"
                  value={formData.contenido}
                  onChange={handleChange}
                  placeholder="Temario o contenido principal"
                  rows={2}
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #ced4da', borderRadius: '6px', fontSize: '0.9rem', resize: 'vertical' }}
                />
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ fontWeight: 600, display: 'block', marginBottom: '0.35rem', color: '#495057' }}>Tareas</label>
                <textarea
                  name="tareas"
                  value={formData.tareas}
                  onChange={handleChange}
                  placeholder="Actividades o tareas asignadas"
                  rows={2}
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #ced4da', borderRadius: '6px', fontSize: '0.9rem', resize: 'vertical' }}
                />
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ fontWeight: 600, display: 'block', marginBottom: '0.35rem', color: '#495057' }}>Observaciones</label>
                <textarea
                  name="notasProfesor"
                  value={formData.notasProfesor}
                  onChange={handleChange}
                  placeholder="Notas internas u observaciones para esta clase"
                  rows={2}
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #ced4da', borderRadius: '6px', fontSize: '0.9rem', resize: 'vertical' }}
                />
              </div>

              <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={resetForm}
                  disabled={saving}
                  style={{
                    padding: '0.65rem 1.25rem',
                    background: 'transparent',
                    border: '1px solid #ced4da',
                    borderRadius: '6px',
                    color: '#495057',
                    cursor: 'pointer'
                  }}
                >
                  Limpiar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    padding: '0.65rem 1.5rem',
                    background: '#0F5C8C',
                    border: 'none',
                    borderRadius: '6px',
                    color: '#fff',
                    fontWeight: '600',
                    cursor: saving ? 'not-allowed' : 'pointer'
                  }}
                >
                  {saving ? 'Guardando...' : editingId ? 'Guardar cambios' : 'Agregar clase'}
                </button>
              </div>
            </form>
          </section>
          )}

          <section>
            {isReadOnly && error && (
              <div style={{ background: '#ffebee', border: '1px solid #ef9a9a', color: '#c62828', padding: '0.75rem', borderRadius: '6px', marginBottom: '1rem' }}>{error}</div>
            )}
            <h4 style={modalStyles.sectionTitle}>Clases programadas</h4>
            {loading ? (
              <div style={{ padding: '1rem', textAlign: 'center', color: '#6c757d' }}>Cargando clases...</div>
            ) : classes.length === 0 ? (
              <div style={{ padding: '1rem', textAlign: 'center', color: '#6c757d', background: '#f8f9fa', borderRadius: '6px' }}>
                Todavía no hay clases programadas para este curso.
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
                  <thead>
                    <tr style={{ background: '#f8f9fa', borderBottom: '1px solid #dee2e6' }}>
                      <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 600, color: '#495057', cursor: 'pointer' }} onClick={() => setClasses([...classes].sort((a, b) => a.titulo.localeCompare(b.titulo)))}>Título ↕</th>
                      <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 600, color: '#495057', cursor: 'pointer' }} onClick={() => setClasses([...classes].sort((a, b) => new Date(a.fechaHora) - new Date(b.fechaHora)))}>Fecha ↕</th>
                      <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 600, color: '#495057', cursor: 'pointer' }} onClick={() => setClasses([...classes].sort((a, b) => a.duracionMinutos - b.duracionMinutos))}>Duración ↕</th>
                      <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 600, color: '#495057' }}>Contenido</th>
                      <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 600, color: '#495057', cursor: 'pointer' }} onClick={() => setClasses([...classes].sort((a, b) => a.modalidad.localeCompare(b.modalidad)))}>Modalidad ↕</th>
                      <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 600, color: '#495057', cursor: 'pointer' }} onClick={() => setClasses([...classes].sort((a, b) => (a.estado || 'programada').localeCompare(b.estado || 'programada')))}>Estado ↕</th>
                      <th style={{ padding: '0.75rem', textAlign: 'center', fontWeight: 600, color: '#495057' }}>Asistencia</th>
                      <th style={{ padding: '0.75rem', textAlign: 'center', fontWeight: 600, color: '#495057' }}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {classes.map(clase => (
                      <tr key={clase._id} style={{ borderBottom: '1px solid #dee2e6' }}>
                        <td style={{ padding: '0.75rem', fontWeight: 600, color: '#2c3e50' }}>{clase.titulo}</td>
                        <td style={{ padding: '0.75rem', color: '#6c757d' }}>{formatDateTime(clase.fechaHora)}</td>
                        <td style={{ padding: '0.75rem', color: '#6c757d' }}>{clase.duracionMinutos} min</td>
                        <td style={{ padding: '0.75rem', color: '#6c757d', maxWidth: '220px' }}>
                          {truncate(clase.contenido, 120)}
                        </td>
                        <td style={{ padding: '0.75rem', color: '#6c757d' }}>{clase.modalidad === 'virtual' ? 'Virtual' : 'Presencial'}</td>
                        <td style={{ padding: '0.75rem' }}>
                          <span style={{
                            display: 'inline-block',
                            minWidth: '90px',
                            padding: '0.2rem 0.6rem',
                            borderRadius: '12px',
                            textAlign: 'center',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            background: clase.estado === 'completada' ? '#d1ecf1' : clase.estado === 'cancelada' ? '#f8d7da' : '#e2e3e5',
                            color: clase.estado === 'completada' ? '#0c5460' : clase.estado === 'cancelada' ? '#721c24' : '#383d41'
                          }}>
                            {clase.estado}
                          </span>
                        </td>
                        <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                          {clase.estado === 'cancelada' ? (
                            <small style={{ color: '#6c757d' }}>—</small>
                          ) : (
                            <button
                              onClick={() => handleRegistrarAsistencia(clase)}
                              style={{
                                background: '#0F5C8C',
                                color: '#fff',
                                border: 'none',
                                padding: '0.45rem 0.75rem',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '0.8rem',
                                fontWeight: 600,
                                whiteSpace: 'nowrap'
                              }}
                              title="Registrar asistencia de estudiantes"
                            >
                              Asistencia
                            </button>
                          )}
                        </td>
                        <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                          {isEditable ? (
                            clase.estado === 'cancelada' ? (
                              <small style={{ color: '#6c757d' }}>Cancelada</small>
                            ) : (
                              <div
                                style={{
                                  display: 'flex',
                                  flexDirection: 'column',
                                  gap: '0.4rem',
                                  alignItems: 'stretch'
                                }}
                              >
                                <button
                                  onClick={() => handleEditClass(clase)}
                                  style={{
                                    background: '#2563eb',
                                    color: '#fff',
                                    border: 'none',
                                    padding: '0.45rem 0.75rem',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontSize: '0.8rem'
                                  }}
                                >
                                  Editar
                                </button>
                                <button
                                  onClick={() => handleCompletarClase(clase)}
                                  style={{
                                    background: '#1e3a8a', // azul más oscuro
                                    color: '#fff',
                                    border: 'none',
                                    padding: '0.45rem 0.75rem',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontSize: '0.8rem'
                                  }}
                                  title="Marcar esta clase como completada"
                                >
                                  Marcar completada
                                </button>
                                <button
                                  onClick={() => handleCancelClass(clase)}
                                  style={{
                                    background: '#e74c3c',
                                    color: '#fff',
                                    border: 'none',
                                    padding: '0.45rem 0.75rem',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontSize: '0.8rem'
                                  }}
                                >
                                  Cancelar
                                </button>
                              </div>
                            )
                          ) : (
                            <small style={{ color: '#6c757d' }}>Vista solo lectura</small>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </div>

      {/* Modal de registro de asistencia */}
      {showAttendanceForm && selectedClaseForAttendance && (
        <ClassAttendanceForm
          clase={selectedClaseForAttendance}
          onSuccess={handleAsistenciaRegistrada}
          onClose={() => {
            setShowAttendanceForm(false);
            setSelectedClaseForAttendance(null);
          }}
        />
      )}
    </div>
  );
};

export default CourseClassesModal;

