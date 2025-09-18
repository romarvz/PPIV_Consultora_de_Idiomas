import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import PaymentForm from './PaymentForm';
import PaymentList from './PaymentList';
import './Payments.css';

const Payments = () => {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState('all');

  const isAdmin = user?.role === 'admin';
  const isStudent = user?.role === 'student';
  const isCompany = user?.role === 'company';

  return (
    <div className="payments-page">
      <div className="page-header">
        <h1>
          {isAdmin && 'Gestión de Pagos'}
          {isStudent && 'Mis Pagos'}
          {isCompany && 'Pagos de la Empresa'}
        </h1>
        {isAdmin && (
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            + Registrar Pago
          </button>
        )}
      </div>

      {(isAdmin || isCompany) && (
        <div className="filters-section">
          <div className="filter-group">
            <label>Estado:</label>
            <select 
              value={filter} 
              onChange={(e) => setFilter(e.target.value)}
              className="form-control filter-select"
            >
              <option value="all">Todos</option>
              <option value="pending">Pendientes</option>
              <option value="paid">Pagados</option>
              <option value="overdue">Vencidos</option>
            </select>
          </div>
        </div>
      )}

      <PaymentList filter={filter} userRole={user?.role} />

      {showForm && (
        <PaymentForm onClose={() => setShowForm(false)} />
      )}
    </div>
  );
};

export default Payments;