import React, { useState, useEffect } from 'react';
import { mockApi } from '../services/mockApi';

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
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        // NOTA: La mockApi de estudiantes no existe, usamos la de clases para simular.
        // En un futuro, esto debería llamar a una función como `mockApi.students.getAll()`
        const response = await mockApi.classes.getAll({ limit: 1000 }); // Asumimos que esto nos da acceso a los estudiantes
        if(response.data.success) {
            const allStudents = response.data.data.classes.map(c => ({ id: c.studentId, name: c.studentName }));
            const uniqueStudents = Array.from(new Map(allStudents.map(item => [item['id'], item])).values());
            setStudents(uniqueStudents);
        }
      } catch (err) {
        console.error("Error fetching students:", err);
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

    try {
      await mockApi.payments.create(formData);
      alert('Pago registrado exitosamente');
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message || 'Ocurrió un error al registrar el pago.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', maxWidth: '500px', margin: 'auto' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary)', marginBottom: '1.5rem' }}>
        Registrar Nuevo Pago
      </h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="studentId" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Estudiante</label>
          <select
            id="studentId"
            name="studentId"
            value={formData.studentId}
            onChange={handleChange}
            style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #ccc' }}
            required
          >
            <option value="">Seleccione un estudiante</option>
            {students.map(student => (
              <option key={student.id} value={student.id}>{student.name}</option>
            ))}
          </select>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
          <div style={{ flex: 1 }}>
            <label htmlFor="amount" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Monto</label>
            <input
              type="number"
              id="amount"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              placeholder="Ej: 15000"
              style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #ccc' }}
              required
            />
          </div>
          <div style={{ flex: 1 }}>
            <label htmlFor="date" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Fecha</label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #ccc' }}
              required
            />
          </div>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="concept" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Concepto</label>
          <input
            type="text"
            id="concept"
            name="concept"
            value={formData.concept}
            onChange={handleChange}
            placeholder="Ej: Cuota mensual, Matrícula, etc."
            style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #ccc' }}
            required
          />
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label htmlFor="status" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Estado</label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #ccc', background: 'white' }}
          >
            <option value="pendiente">Pendiente</option>
            <option value="pagado">Pagado</option>
            <option value="vencido">Vencido</option>
          </select>
        </div>

        {error && <p style={{ color: 'red', marginBottom: '1rem' }}>{error}</p>}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
          <button type="button" onClick={onCancel} style={{ padding: '0.75rem 1.5rem', borderRadius: '4px', border: 'none', background: '#e5e7eb', cursor: 'pointer' }}>
            Cancelar
          </button>
          <button type="submit" className="cta-btn" disabled={submitting}>
            {submitting ? 'Registrando...' : 'Registrar Pago'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PaymentRegistration;
