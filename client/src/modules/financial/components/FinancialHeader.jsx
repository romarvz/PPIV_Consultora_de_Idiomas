import React from 'react';
import { FaFileInvoiceDollar, FaMoneyBillWave, FaFileInvoice, FaChartLine, FaArrowLeft } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { routes } from '../../../utils/routes';

const FinancialHeader = ({ activeView, setActiveView }) => {
  const navItems = [
    { id: 'charges', label: 'Cobros', icon: <FaFileInvoiceDollar /> },
    { id: 'payments', label: 'Pagos', icon: <FaMoneyBillWave /> },
    { id: 'invoicing', label: 'Facturación', icon: <FaFileInvoice /> },
    { id: 'reports', label: 'Reportes', icon: <FaChartLine /> },
  ];

  return (
    <div className="financial-header">
      <div className="financial-nav">
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

      <Link to={routes.DASHBOARD.ADMIN} className="cta-btn">
        <FaArrowLeft style={{ marginRight: '0.5rem' }} />
        Volver al Dashboard
      </Link>
    </div>
  );
};

export default FinancialHeader;
