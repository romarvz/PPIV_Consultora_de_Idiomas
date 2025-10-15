import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSectionHeader from '../../components/common/AdminSectionHeader';
import FinancialNav from '../../modules/financial/components/FinancialNav';
import ChargesView from '../../modules/financial/components/ChargesView';
import PaymentsView from '../../modules/financial/components/PaymentsView';
import InvoicingView from '../../modules/financial/components/InvoicingView';
import ReportsView from '../../modules/financial/components/ReportsView';
import { routes } from '../../utils/routes';

const FinancialDashboard = () => {
  const [activeView, setActiveView] = useState('charges');
  const navigate = useNavigate();

  const renderView = () => {
    switch (activeView) {
      case 'charges':
        return <ChargesView />;
      case 'payments':
        return <PaymentsView />;
      case 'invoicing':
        return <InvoicingView />;
      case 'reports':
        return <ReportsView />;
      default:
        return <ChargesView />;
    }
  };

  return (
    <section className="section visible">
      <div className="container">
        <AdminSectionHeader title="Gestión Financiera" onBack={() => navigate(routes.adminDashboard)} />
        <FinancialNav activeView={activeView} setActiveView={setActiveView} />
        <div className="financial-content">
          {renderView()}
        </div>
      </div>
    </section>
  );
};

export default FinancialDashboard;
