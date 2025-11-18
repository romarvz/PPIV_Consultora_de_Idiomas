import React, { useState, useEffect } from 'react';
import apiAdapter from '../../services/apiAdapter';

const ClassAttendanceForm = ({ clase, onSuccess, onClose }) => {
  const [estudiantes, setEstudiantes] = useState([]);
  const [asistencias, setAsistencias] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true);
        const claseCompleta = await apiAdapter.classes.getById(clase._id || clase.id);
        
        if (claseCompleta?.data?.success) {
          const claseData = claseCompleta.data.data;
          const estudiantesList = claseData.estudiantes || [];
          
          setEstudiantes(estudiantesList);
          
          // Cargar asistencia existente
          const asistenciaResponse = await apiAdapter.classes.obtenerAsistencia(clase._id || clase.id);
          if (asistenciaResponse?.data?.success && asistenciaResponse.data.data?.asistencia) {
            const asistenciaMap = {};
            asistenciaResponse.data.data.asistencia.forEach((a) => {
              const estudianteId = (a.estudiante?._id || a.estudiante || a.estudianteId)?.toString();
              if (estudianteId) {
                asistenciaMap[estudianteId] = {
                  presente: a.presente || false,
                  minutosTarde: a.minutosTarde || 0,
                  comentarios: a.comentarios || ''
                };
              }
            });
            setAsistencias(asistenciaMap);
          } else {
            // Inicializar todos como ausentes
            const inicial = {};
            estudiantesList.forEach((est) => {
              const id = (est._id || est.id || est).toString();
              inicial[id] = { presente: false, minutosTarde: 0, comentarios: '' };
            });
            setAsistencias(inicial);
          }
        }
      } catch (err) {
        console.error('Error al cargar datos:', err);
        setError('No se pudieron cargar los datos de la clase');
      } finally {
        setLoading(false);
      }
    };

    if (clase) {
      cargarDatos();
    }
  }, [clase]);

  const handleToggleAsistencia = (estudianteId) => {
    setAsistencias((prev) => ({
      ...prev,
      [estudianteId]: {
        ...prev[estudianteId],
        presente: !prev[estudianteId]?.presente
      }
    }));
  };

  const handleMinutosTarde = (estudianteId, minutos) => {
    setAsistencias((prev) => ({
      ...prev,
      [estudianteId]: {
        ...prev[estudianteId],
        minutosTarde: Math.max(0, Math.min(120, Number(minutos) || 0))
      }
    }));
  };

  const handleComentarios = (estudianteId, comentarios) => {
    setAsistencias((prev) => ({
      ...prev,
      [estudianteId]: {
        ...prev[estudianteId],
        comentarios: comentarios.substring(0, 200)
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const asistenciasArray = Object.entries(asistencias).map(([estudianteId, datos]) => ({
        estudiante: estudianteId,
        presente: datos.presente || false,
        minutosTarde: datos.minutosTarde || 0,
        comentarios: datos.comentarios || ''
      }));

      const response = await apiAdapter.classes.registrarAsistenciaMultiple(
        clase._id || clase.id,
        asistenciasArray
      );

      if (response?.data?.success) {
        if (onSuccess) {
          onSuccess(response.data);
        }
        if (onClose) {
          onClose();
        }
      } else {
        setError(response?.data?.error || 'No se pudo registrar la asistencia');
      }
    } catch (err) {
      console.error('Error al registrar asistencia:', err);
      const message = err?.response?.data?.error 
        || err?.response?.data?.message 
        || err.message 
        || 'No se pudo registrar la asistencia';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-AR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEstudianteNombre = (estudiante) => {
    if (typeof estudiante === 'string') return estudiante;
    return `${estudiante.firstName || ''} ${estudiante.lastName || ''}`.trim() || 'Estudiante';
  };

  if (loading) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1100
      }}>
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '2rem',
          textAlign: 'center'
        }}>
          <p>Cargando estudiantes...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
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
    }}>
      <div style={{
        background: 'white',
        borderRadius: '12px',
        width: '100%',
        maxWidth: '800px',
        maxHeight: '90vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 20px 45px rgba(15, 92, 140, 0.2)'
      }}>
        <div style={{
          padding: '1.5rem',
          borderBottom: '1px solid #e9ecef',
          background: '#0F5C8C',
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Registrar asistencia</h3>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'white',
              fontSize: '1.5rem',
              cursor: 'pointer',
              lineHeight: 1
            }}
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>

        <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ margin: '0 0 0.5rem 0', color: '#0F5C8C' }}>Clase</h4>
            <p style={{ margin: '0.25rem 0', fontWeight: 600 }}>
              {clase?.titulo || clase?.title || 'Clase'}
            </p>
            {clase?.curso && (
              <p style={{ margin: '0.25rem 0', color: '#6c757d' }}>
                Curso: {clase.curso.nombre || clase.curso.name || 'N/A'}
              </p>
            )}
            {clase?.fechaHora && (
              <p style={{ margin: '0.25rem 0', color: '#6c757d' }}>
                {formatDate(clase.fechaHora)}
              </p>
            )}
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1rem' }}>
              <h4 style={{ margin: '0 0 1rem 0', color: '#0F5C8C' }}>
                Estudiantes ({estudiantes.length})
              </h4>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {estudiantes.map((estudiante) => {
                  const estudianteId = (estudiante._id || estudiante.id || estudiante).toString();
                  const asistencia = asistencias[estudianteId] || { presente: false, minutosTarde: 0, comentarios: '' };
                  
                  return (
                    <div
                      key={estudianteId}
                      style={{
                        border: '1px solid #e9ecef',
                        borderRadius: '8px',
                        padding: '1rem',
                        background: asistencia.presente ? '#f0f9ff' : '#fff'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
                        <input
                          type="checkbox"
                          checked={asistencia.presente}
                          onChange={() => handleToggleAsistencia(estudianteId)}
                          disabled={submitting}
                          style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                        />
                        <span style={{ fontWeight: 600, flex: 1 }}>
                          {getEstudianteNombre(estudiante)}
                        </span>
                      </div>

                      {asistencia.presente && (
                        <div style={{ marginLeft: '2rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                          <div>
                            <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.9rem', color: '#6c757d' }}>
                              Minutos de tardanza
                            </label>
                            <input
                              type="number"
                              min="0"
                              max="120"
                              value={asistencia.minutosTarde}
                              onChange={(e) => handleMinutosTarde(estudianteId, e.target.value)}
                              disabled={submitting}
                              style={{
                                width: '100px',
                                padding: '0.5rem',
                                borderRadius: '6px',
                                border: '1px solid #d0d7de',
                                fontSize: '0.9rem'
                              }}
                            />
                          </div>
                          <div>
                            <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.9rem', color: '#6c757d' }}>
                              Comentarios
                            </label>
                            <textarea
                              value={asistencia.comentarios}
                              onChange={(e) => handleComentarios(estudianteId, e.target.value)}
                              disabled={submitting}
                              rows="2"
                              maxLength="200"
                              style={{
                                width: '100%',
                                padding: '0.5rem',
                                borderRadius: '6px',
                                border: '1px solid #d0d7de',
                                fontSize: '0.9rem',
                                fontFamily: 'inherit',
                                resize: 'vertical'
                              }}
                              placeholder="Comentarios..."
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {error && (
              <div style={{
                background: '#fdecea',
                color: '#b71c1c',
                padding: '0.75rem',
                borderRadius: '8px',
                marginBottom: '1rem'
              }}>
                {error}
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', paddingTop: '1rem', borderTop: '1px solid #e9ecef' }}>
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                style={{
                  background: 'white',
                  color: '#0F5C8C',
                  border: '1px solid #0F5C8C',
                  borderRadius: '8px',
                  padding: '0.75rem 1.5rem',
                  fontWeight: 600,
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  opacity: submitting ? 0.6 : 1
                }}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={submitting}
                style={{
                  background: '#0F5C8C',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.75rem 1.5rem',
                  fontWeight: 600,
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  opacity: submitting ? 0.7 : 1
                }}
              >
                {submitting ? 'Guardando...' : 'Guardar asistencia'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ClassAttendanceForm;

