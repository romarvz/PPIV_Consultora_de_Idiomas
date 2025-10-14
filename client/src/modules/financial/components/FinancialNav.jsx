import React from 'react';
import { FaFileInvoiceDollar, FaMoneyBillWave, FaFileInvoice, FaChartLine, FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { routes } from '../../../utils/routes';

const FinancialNav = ({ activeView, setActiveView }) => {
  const navigate = useNavigate();
  const navItems = [
    { id: 'charges', label: 'Cobros', icon: <FaFileInvoiceDollar /> },
    { id: 'payments', label: 'Pagos', icon: <FaMoneyBillWave /> },
    { id: 'invoicing', label: 'Facturación', icon: <FaFileInvoice /> },
    { id: 'reports', label: 'Reportes', icon: <FaChartLine /> },
  ];

  return (
    <div className="financial-nav">
      <button
        className="nav-btn nav-btn--back"
        onClick={() => navigate(routes.DASHBOARD.ADMIN)}
      >
        <FaArrowLeft />
        <span>Volver</span>
      </button>
      {navItems.map(item => (
        <button
          key={item.id}
          className={`nav-btn ${activeView === item.id ? 'active' : ''}`}
          onClick={() => setActiveView(item.id)}
        >
          {item.icon}
          <span>{item.label}</span>
        </button>
      ))}
    </div>
  );
};

export default FinancialNav;
