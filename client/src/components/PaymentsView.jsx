import React, { useState, useEffect } from 'react';
import { mockApi } from '../services/mockApi';
import { FaFileInvoiceDollar, FaCheckCircle, FaExclamationCircle, FaClock } from 'react-icons/fa';

// Componente para mostrar un badge de estado de pago
const StatusBadge = ({ status }) => {
  const statusStyles = {
    pagado: {
      backgroundColor: 'rgba(34, 197, 94, 0.1)',
      color: '#16a34a',
      icon: <FaCheckCircle />,
    },
    pendiente: {
      backgroundColor: 'rgba(249, 115, 22, 0.1)',
      color: '#f97316',
      icon: <FaExclamationCircle />,
    },
    vencido: {
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
      color: '#ef4444',
      icon: <FaClock />,
    },
  };

  const style = statusStyles[status] || statusStyles.pendiente;

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.25rem 0.75rem',
      borderRadius: '9999px',
      fontSize: '0.875rem',
      fontWeight: '500',
      ...style
    }}>
      {style.icon}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

const PaymentsView = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true);
        const response = await mockApi.payments.getAll();
        if (response.data.success) {
          setPayments(response.data.data.payments);
        } else {
          throw new Error('Error al obtener los datos de pagos.');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '2rem' }}>Cargando pagos...</div>;
  }

  if (error) {
    return <div style={{ textAlign: 'center', padding: '2rem', color: 'red' }}>Error: {error}</div>;
  }

  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary)' }}>
          <FaFileInvoiceDollar style={{ marginRight: '1rem' }} />
          Gestión de Pagos
        </h1>
        <button className="cta-btn">Registrar Nuevo Pago</button>
      </header>

      {/* Aquí irían los filtros */}
      
      <div style={{ background: 'white', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
              <th style={{ padding: '1rem' }}>Estudiante</th>
              <th style={{ padding: '1rem' }}>Concepto</th>
              <th style={{ padding: '1rem' }}>Monto</th>
              <th style={{ padding: '1rem' }}>Fecha</th>
              <th style={{ padding: '1rem' }}>Estado</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((payment) => (
              <tr key={payment._id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                <td style={{ padding: '1rem' }}>{payment.studentName}</td>
                <td style={{ padding: '1rem' }}>{payment.concept}</td>
                <td style={{ padding: '1rem' }}>${payment.amount.toFixed(2)}</td>
                <td style={{ padding: '1rem' }}>{new Date(payment.date).toLocaleDateString()}</td>
                <td style={{ padding: '1rem' }}><StatusBadge status={payment.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Aquí iría la paginación */}

    </div>
  );
};

export default PaymentsView;
