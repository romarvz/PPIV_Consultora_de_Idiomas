import React, { useState, useEffect, useMemo } from 'react';
import { mockApi } from '../../../services/mockApi';
import { FaFileInvoiceDollar, FaCheckCircle, FaExclamationCircle, FaClock, FaEdit, FaTrash, FaPlus, FaFileExcel } from 'react-icons/fa';
import { formatDate, formatCurrency } from '../../../utils/formatting';
import Modal from '../../../components/common/Modal';
import PaymentRegistration from '../../../components/PaymentRegistration';

const StatusBadge = ({ status }) => {
  const statusConfig = {
    pagado: { icon: <FaCheckCircle />, className: 'status-badge-pagado' },
    pendiente: { icon: <FaExclamationCircle />, className: 'status-badge-pendiente' },
    vencido: { icon: <FaClock />, className: 'status-badge-vencido' },
  };

  const config = statusConfig[status] || statusConfig.pendiente;

  return (
    <span className={`status-badge ${config.className}`}>
      {config.icon}
      {status}
    </span>
  );
};

const ChargesView = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [filters, setFilters] = useState({ studentName: '', status: 'todos' });

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await mockApi.payments.getAll();
      if (response.data.success) {
        setPayments(response.data.data.payments);
      } else {
        throw new Error('Error al obtener los datos de cobros.');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleRegistrationSuccess = () => {
    setShowRegistrationModal(false);
    fetchPayments();
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const filteredPayments = useMemo(() => {
    return payments.filter(p => {
      const studentMatch = p.studentName.toLowerCase().includes(filters.studentName.toLowerCase());
      const statusMatch = filters.status === 'todos' || p.status === filters.status;
      return studentMatch && statusMatch;
    });
  }, [payments, filters]);

  const renderContent = () => {
    if (loading) {
      return <div className="loading-state">Cargando cobros...</div>;
    }

    if (error) {
      return <div className="error-state">Error: {error}</div>;
    }

    if (filteredPayments.length === 0) {
      return (
        <div className="empty-state">
          <FaFileExcel className="empty-state-icon" />
          <h3>No se encontraron cobros</h3>
          <p>No hay cobros que coincidan con los filtros actuales, o aún no se ha registrado ninguno.</p>
          <button className="cta-btn" onClick={() => setShowRegistrationModal(true)}>
            <FaPlus style={{ marginRight: '0.5rem' }} />
            Registrar Primer Cobro
          </button>
        </div>
      );
    }

    return (
      <div className="payments-table-container">
        <table className="payments-table">
          <thead>
            <tr>
              <th>Estudiante</th>
              <th>Concepto</th>
              <th>Monto</th>
              <th>Fecha</th>
              <th>Estado</th>
              <th className="col-actions">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredPayments.map((payment) => (
              <tr key={payment._id}>
                <td>{payment.studentName}</td>
                <td>{payment.concept}</td>
                <td>${formatCurrency(payment.amount)}</td>
                <td>{formatDate(payment.date)}</td>
                <td><StatusBadge status={payment.status} /></td>
                <td className="col-actions">
                  <button className="action-btn edit" title="Editar Cobro"><FaEdit /></button>
                  <button className="action-btn delete" title="Eliminar Cobro"><FaTrash /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="payments-view-container">
      <div className="payments-controls-header">
        <header className="payments-header">
          <button className="cta-btn" onClick={() => setShowRegistrationModal(true)}>
            <FaPlus style={{ marginRight: '0.5rem' }} />
            Registrar Nuevo Cobro
          </button>
        </header>

        <div className="payments-filter-bar">
          <div className="filter-group">
            <label htmlFor="studentName">Buscar por Estudiante:</label>
            <input
              type="text"
              id="studentName"
              name="studentName"
              value={filters.studentName}
              onChange={handleFilterChange}
              placeholder="Nombre del estudiante..."
            />
          </div>
          <div className="filter-group">
            <label htmlFor="status">Filtrar por Estado:</label>
            <select id="status" name="status" value={filters.status} onChange={handleFilterChange}>
              <option value="todos">Todos</option>
              <option value="pagado">Pagado</option>
              <option value="pendiente">Pendiente</option>
              <option value="vencido">Vencido</option>
            </select>
          </div>
        </div>
      </div>

      {renderContent()}

      {showRegistrationModal && (
        <Modal title="Registrar Nuevo Cobro" onClose={() => setShowRegistrationModal(false)}>
          <PaymentRegistration 
            onSuccess={handleRegistrationSuccess}
            onCancel={() => setShowRegistrationModal(false)}
          />
        </Modal>
      )}
    </div>
  );
};

export default ChargesView;
