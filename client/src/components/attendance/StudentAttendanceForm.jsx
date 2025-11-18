import React, { useState, useEffect } from 'react';
import apiAdapter from '../../services/apiAdapter';

const StudentAttendanceForm = ({ clase, onSuccess, onClose }) => {
  const [presente, setPresente] = useState(false);
  const [minutosTarde, setMinutosTarde] = useState(0);
  const [comentarios, setComentarios] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [yaRegistrado, setYaRegistrado] = useState(false);
  const [asistenciaActual, setAsistenciaActual] = useState(null);

  useEffect(() => {
    const verificarAsistencia = async () => {
      try {
        const response = await apiAdapter.classes.obtenerAsistencia(clase._id || clase.id);
        if (response?.data?.success && response.data.data?.asistencia) {
          // Buscar si el estudiante ya tiene asistencia registrada
          // Nota: necesitamos el ID del estudiante actual, que debería venir del contexto de auth
          // Por ahora, asumimos que se pasa como prop o se obtiene del contexto
        }
      } catch (err) {
        console.error('Error al verificar asistencia:', err);
      }
    };

    if (clase) {
      verificarAsistencia();
    }
  }, [clase]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const response = await apiAdapter.classes.registrarMiAsistencia(
        clase._id || clase.id,
        presente,
        minutosTarde,
        comentarios
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
        maxWidth: '500px',
        maxHeight: '90vh',
        overflow: 'auto',
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
          <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Registrar mi asistencia</h3>
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

        <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
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

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={presente}
                onChange={(e) => setPresente(e.target.checked)}
                disabled={submitting}
                style={{ width: '20px', height: '20px', cursor: 'pointer' }}
              />
              <span style={{ fontWeight: 600, fontSize: '1rem' }}>Estuve presente</span>
            </label>
          </div>

          {presente && (
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                Minutos de tardanza (opcional)
              </label>
              <input
                type="number"
                min="0"
                max="120"
                value={minutosTarde}
                onChange={(e) => setMinutosTarde(Number(e.target.value) || 0)}
                disabled={submitting}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: '1px solid #d0d7de',
                  fontSize: '0.95rem'
                }}
                placeholder="0"
              />
            </div>
          )}

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
              Comentarios (opcional)
            </label>
            <textarea
              value={comentarios}
              onChange={(e) => setComentarios(e.target.value)}
              disabled={submitting}
              rows="3"
              maxLength="200"
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '8px',
                border: '1px solid #d0d7de',
                fontSize: '0.95rem',
                fontFamily: 'inherit',
                resize: 'vertical'
              }}
              placeholder="Agregar comentarios sobre la clase..."
            />
            <small style={{ color: '#6c757d', fontSize: '0.85rem' }}>
              {comentarios.length}/200 caracteres
            </small>
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

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
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
              {submitting ? 'Registrando...' : 'Registrar asistencia'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentAttendanceForm;

