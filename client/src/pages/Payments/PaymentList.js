import React, { useState, useEffect } from 'react';

const mockPayments = [
  {
    id: 1,
    student: 'Juan Pérez',
    course: 'Inglés Básico A1',
    amount: 1500,
    status: 'paid',
    date: '2024-01-15',
    type: 'efectivo'
  },
  {
    id: 2,
    student: 'María García',
    course: 'Inglés Intermedio B1',
    amount: 2200,
    status: 'pending',
    date: '2024-01-20',
    type: 'online'
  },
  {
    id: 3,
    student: 'Carlos López',
    course: 'Inglés Avanzado C1',
    amount: 3000,
    status: 'overdue',
    date: '2024-01-10',
    type: 'efectivo'
  }
];

const PaymentList = ({ filter, userRole }) => {
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    setPayments(mockPayments);
  }, []);

  const getStatusBadge = (status) => {
    const badges = {
      paid: 'badge-success',
      pending: 'badge-warning',
      overdue: 'badge-danger'
    };
    return badges[status] || 'badge-secondary';
  };

  const getStatusLabel = (status) => {
    const labels = {
      paid: 'Pagado',
      pending: 'Pendiente',
      overdue: 'Vencido'
    };
    return labels[status] || status;
  };

  const filteredPayments = filter === 'all' 
    ? payments 
    : payments.filter(payment => payment.status === filter);

  return (
    <div className="card">
      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              {userRole === 'admin' && <th>Estudiante</th>}
              <th>Curso</th>
              <th>Monto</th>
              <th>Fecha</th>
              <th>Tipo</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredPayments.map(payment => (
              <tr key={payment.id}>
                {userRole === 'admin' && <td>{payment.student}</td>}
                <td>{payment.course}</td>
                <td>${payment.amount}</td>
                <td>{payment.date}</td>
                <td className="text-capitalize">{payment.type}</td>
                <td>
                  <span className={`badge ${getStatusBadge(payment.status)}`}>
                    {getStatusLabel(payment.status)}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button className="btn btn-sm btn-secondary">
                      Ver Detalle
                    </button>
                    {payment.status === 'pending' && userRole !== 'student' && (
                      <button className="btn btn-sm btn-success">
                        Pagar
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PaymentList;