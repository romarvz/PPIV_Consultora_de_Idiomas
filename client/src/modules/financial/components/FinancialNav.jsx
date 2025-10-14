import React from 'react';
import { FaFileInvoiceDollar, FaMoneyBillWave, FaFileInvoice, FaChartLine } from 'react-icons/fa';

const FinancialNav = ({ activeView, setActiveView }) => {
  const navItems = [
    { id: 'charges', label: 'Cobros', icon: <FaFileInvoiceDollar /> },
    { id: 'payments', label: 'Pagos', icon: <FaMoneyBillWave /> },
    { id: 'invoicing', label: 'Facturación', icon: <FaFileInvoice /> },
    { id: 'reports', label: 'Reportes', icon: <FaChartLine /> },
  ];

  return (
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
  );
};

export default FinancialNav;
