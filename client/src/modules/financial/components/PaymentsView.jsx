import React, { useState, useEffect, useMemo } from 'react'; // <-- LÍNEA CORREGIDA: Se añaden los Hooks
import apiAdapter from '../../../services/apiAdapter';
import { FaUserGraduate, FaEdit, FaTrash, FaPlus, FaFileExcel } from 'react-icons/fa'; // Se añaden los íconos que se usan
import { formatDate, formatCurrency } from '../../../utils/formatting';
import Modal from '../../../components/common/Modal';
import TeacherPaymentModal from './TeacherPaymentModal';

const PaymentsView = () => {
  const [teacherPayments, setTeacherPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [filters, setFilters] = useState({ teacherName: '' });

  const fetchTeacherPayments = async () => {
    try {
      setLoading(true);
      const response = await apiAdapter.teacherPayments.getAll();
      
      if (response.data.success) {
        setTeacherPayments(response.data.data.payments);
      } else {
        throw new Error('Error al obtener los datos de pagos.');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeacherPayments();
  }, []);

  const handleRegistrationSuccess = () => {
    setShowRegistrationModal(false);
    fetchTeacherPayments();
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const filteredPayments = useMemo(() => {
    // Agregamos una comprobación para evitar errores si teacherPayments es nulo
    if (!teacherPayments) return []; 
    return teacherPayments.filter(p => {
      // Agregamos una comprobación para evitar errores si teacherName es nulo
      return p.teacherName && p.teacherName.toLowerCase().includes(filters.teacherName.toLowerCase());
    });
  }, [teacherPayments, filters]);

  const renderContent = () => {
    if (loading) {
      return <div className="loading-state">Cargando pagos...</div>;
    }

    if (error) {
      return <div className="error-state">Error: {error}</div>;
    }

    if (filteredPayments.length === 0) {
      return (
        <div className="empty-state">
          <FaFileExcel className="empty-state-icon" />
          <h3>No se encontraron pagos</h3>
          <p>No hay pagos que coincidan con los filtros actuales, o aún no se ha registrado ninguno.</p>
          <button className="cta-btn" onClick={() => setShowRegistrationModal(true)}>
            <FaPlus style={{ marginRight: '0.5rem' }} />
            Registrar Primer Pago
          </button>
        </div>
      );
    }

    return (
      <div className="payments-table-container">
        <table className="payments-table">
          <thead>
            <tr>
              <th>Profesor</th>
              <th>Concepto</th>
              <th>Monto</th>
              <th>Fecha de Pago</th>
              <th>Método</th>
              <th className="col-actions">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredPayments.map((payment) => (
              <tr key={payment._id}>
                <td><FaUserGraduate style={{ marginRight: '8px', color: '#555' }} />{payment.teacherName}</td>
                <td>{payment.concept}</td>
                <td>${formatCurrency(payment.amount)}</td>
                <td>{formatDate(payment.date)}</td>
                <td>{payment.paymentMethod}</td>
                <td className="col-actions">
                  <button className="action-btn edit" title="Editar Pago"><FaEdit /></button>
                  <button className="action-btn delete" title="Eliminar Pago"><FaTrash /></button>
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
            Registrar Nuevo Pago
          </button>
        </header>

        <div className="payments-filter-bar">
          <div className="filter-group">
            <label htmlFor="teacherName">Buscar por Profesor:</label>
            <input
              type="text"
              id="teacherName"
              name="teacherName"
              value={filters.teacherName}
              onChange={handleFilterChange}
              placeholder="Nombre del profesor..."
            />
          </div>
        </div>
      </div>

      {renderContent()}

      {showRegistrationModal && (
        <Modal title="Registrar Nuevo Pago a Profesor" onClose={() => setShowRegistrationModal(false)}>
          <TeacherPaymentModal 
            onSuccess={handleRegistrationSuccess}
            onCancel={() => setShowRegistrationModal(false)}
          />
        </Modal>
      )}
    </div>
  );
};

export default PaymentsView;