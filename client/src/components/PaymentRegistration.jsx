import React, { useState, useEffect } from 'react';
import { mockApi } from '../services/mockApi';
import { FaCheckCircle } from 'react-icons/fa';

const PaymentRegistration = ({ onSuccess, onCancel }) => {
  const [students, setStudents] = useState([]);
  const [formData, setFormData] = useState({
    studentId: '',
    amount: '',
    concept: '',
    date: new Date().toISOString().split('T')[0],
    status: 'pendiente',
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await mockApi.classes.getAll({ limit: 1000 });
        if (response.data.success) {
          const allStudents = response.data.data.classes.map(c => ({ id: c.studentId, name: c.studentName }));
          const uniqueStudents = Array.from(new Map(allStudents.map(item => [item['id'], item])).values());
          setStudents(uniqueStudents);
        }
      } catch (err) {
        console.error("Error fetching students:", err);
        setError("No se pudieron cargar los estudiantes. Intente de nuevo más tarde.");
      }
    };
    fetchStudents();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.studentId) {
      setError('Por favor, seleccione un estudiante.');
      return;
    }
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      await mockApi.payments.create(formData);
      setSuccess('¡Pago registrado exitosamente!');
      setTimeout(() => {
        if (onSuccess) onSuccess();
      }, 1500);
    } catch (err) {
      setError(err.message || 'Ocurrió un error al registrar el pago.');
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="payment-form modal-form-background">
      {error && <div className="notification error">{error}</div>}
      {success && (
        <div className="notification success">
          <FaCheckCircle />
          {success}
        </div>
      )}

      <div className="form-group full-width">
        <label htmlFor="studentId">Estudiante</label>
        <select
          id="studentId"
          name="studentId"
          value={formData.studentId}
          onChange={handleChange}
          required
          disabled={submitting}
        >
          <option value="">Seleccione un estudiante</option>
          {students.map(student => (
            <option key={student.id} value={student.id}>{student.name}</option>
          ))}
        </select>
      </div>
      
      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="amount">Monto</label>
          <input
            type="number"
            id="amount"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            placeholder="Ej: 15000"
            required
            disabled={submitting}
          />
        </div>
        <div className="form-group">
          <label htmlFor="date">Fecha</label>
          <input
            type="date"
            id="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
            disabled={submitting}
          />
        </div>
      </div>

      <div className="form-group full-width">
        <label htmlFor="concept">Concepto</label>
        <input
          type="text"
          id="concept"
          name="concept"
          value={formData.concept}
          onChange={handleChange}
          placeholder="Ej: Cuota mensual, Matrícula, etc."
          required
          disabled={submitting}
        />
      </div>

      <div className="form-group full-width">
        <label htmlFor="status">Estado</label>
        <select
          id="status"
          name="status"
          value={formData.status}
          onChange={handleChange}
          disabled={submitting}
        >
          <option value="pendiente">Pendiente</option>
          <option value="pagado">Pagado</option>
          <option value="vencido">Vencido</option>
        </select>
      </div>

      <div className="payment-form-actions">
        <button type="button" onClick={onCancel} className="btn-secondary" disabled={submitting}>
          Cancelar
        </button>
        <button type="submit" className="cta-btn" disabled={submitting}>
          {submitting ? 'Registrando...' : 'Registrar Pago'}
        </button>
      </div>
    </form>
  );
};

export default PaymentRegistration;
