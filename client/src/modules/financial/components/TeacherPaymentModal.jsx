import React, { useState } from 'react';
import { FaCheckCircle } from 'react-icons/fa';
import apiAdapter from '../../../services/apiAdapter';
import { mockTeachers } from '../../../services/mockData'; 


const SuccessNotification = () => (
  <div className="success-notification">
    <FaCheckCircle size={50} color="var(--color-success)" />
    <h2>¡Pago Registrado!</h2>
    <p>El pago al profesor ha sido registrado exitosamente.</p>
  </div>
);

const TeacherPaymentModal = ({ onSuccess, onClose }) => {
  const [formData, setFormData] = useState({
    teacherId: mockTeachers.find(t => t.isActive)?._id || '',
    amount: '',
    concept: '',
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'Transferencia',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await apiAdapter.teacherPayments.create(formData);
      
      setShowSuccess(true);

      setTimeout(() => {
        onSuccess();
      }, 2000);

    } catch (err) {
      setError(err.message || "Ocurrió un error al registrar el pago.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        {!isSubmitting && <button onClick={onClose} className="modal-close-btn">&times;</button>}
        
        {showSuccess ? (
          <SuccessNotification />
        ) : (
          <>
            <h2 className="modal-title">Registrar Pago a Profesor</h2>
            <form onSubmit={handleSubmit} className="modal-form">
              {error && <div className="notification error">{error}</div>}

              <div className="form-group">
                <label htmlFor="teacherId">Profesor</label>
                <select id="teacherId" name="teacherId" value={formData.teacherId} onChange={handleChange} required>
                  {mockTeachers.filter(t => t.isActive).map(teacher => (
                    <option key={teacher._id} value={teacher._id}>
                      {teacher.firstName} {teacher.lastName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="amount">Monto</label>
                  <input type="number" id="amount" name="amount" value={formData.amount} onChange={handleChange} placeholder="Ej: 25000" required />
                </div>
                <div className="form-group">
                  <label htmlFor="date">Fecha de Pago</label>
                  <input type="date" id="date" name="date" value={formData.date} onChange={handleChange} required />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="concept">Concepto</label>
                <input type="text" id="concept" name="concept" value={formData.concept} onChange={handleChange} placeholder="Ej: Pago de horas de Octubre" required />
              </div>
              
              <div className="form-group">
                <label htmlFor="paymentMethod">Método de Pago</label>
                <select id="paymentMethod" name="paymentMethod" value={formData.paymentMethod} onChange={handleChange} required>
                    <option value="Transferencia">Transferencia</option>
                    <option value="Efectivo">Efectivo</option>
                </select>
              </div>

              <div className="modal-actions">
                <button type="button" onClick={onClose} className="btn-secondary" disabled={isSubmitting}>
                  Cancelar
                </button>
                <button type="submit" className="cta-btn" disabled={isSubmitting}>
                  {isSubmitting ? 'Registrando...' : 'Registrar Pago'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default TeacherPaymentModal;