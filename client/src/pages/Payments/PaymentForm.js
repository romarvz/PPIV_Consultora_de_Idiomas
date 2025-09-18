import React, { useState } from 'react';

const PaymentForm = ({ onClose }) => {
  const [formData, setFormData] = useState({
    estudiante: '',
    curso: '',
    monto: '',
    tipoPago: 'efectivo',
    fecha: new Date().toISOString().split('T')[0]
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Registrando pago:', formData);
    onClose();
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Registrar Pago</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Estudiante</label>
            <select 
              value={formData.estudiante}
              onChange={(e) => setFormData({...formData, estudiante: e.target.value})}
              className="form-control"
              required
            >
              <option value="">Seleccionar estudiante</option>
              <option value="1">Juan Pérez</option>
              <option value="2">María García</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Curso</label>
            <select 
              value={formData.curso}
              onChange={(e) => setFormData({...formData, curso: e.target.value})}
              className="form-control"
              required
            >
              <option value="">Seleccionar curso</option>
              <option value="1">Inglés Básico A1</option>
              <option value="2">Inglés Intermedio B1</option>
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Monto</label>
              <input
                type="number"
                value={formData.monto}
                onChange={(e) => setFormData({...formData, monto: e.target.value})}
                className="form-control"
                step="0.01"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Tipo de Pago</label>
              <select 
                value={formData.tipoPago}
                onChange={(e) => setFormData({...formData, tipoPago: e.target.value})}
                className="form-control"
              >
                <option value="efectivo">Efectivo</option>
                <option value="online">Online</option>
              </select>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              Registrar Pago
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentForm;