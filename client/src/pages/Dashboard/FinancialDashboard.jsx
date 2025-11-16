import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import AuthNavbar from '../../components/common/AuthNavbar';
import Footer from '../../components/layout/Footer';
import InvoicingView from '../../modules/financial/components/InvoicingView';
import CollectionsView from '../../modules/financial/components/CollectionsView';
import '../../styles/variables.css';
import '../../styles/auth.css';

const FinancialDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('facturas');

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="dashboard-container">
      <AuthNavbar user={user} onLogout={handleLogout} showBackButton={true} />

      <div className="dashboard-info-card">
        <h3 className="dashboard-info-card__title">Finanzas</h3>
        <p className="dashboard-info-card__text">Gestión de facturas y cobros</p>
      </div>

      <div style={{ 
        display: 'flex', 
        gap: '1rem', 
        marginBottom: '2rem',
        borderBottom: '2px solid var(--border-color)',
        padding: '0 1rem'
      }}>
        <button
          onClick={() => setActiveTab('facturas')}
          style={{
            padding: '1rem 2rem',
            border: 'none',
            borderBottom: activeTab === 'facturas' ? '3px solid var(--primary)' : 'none',
            backgroundColor: 'transparent',
            color: activeTab === 'facturas' ? 'var(--primary)' : 'var(--text-secondary)',
            fontSize: 'var(--font-size-base)',
            fontWeight: activeTab === 'facturas' ? 'var(--font-weight-semibold)' : 'var(--font-weight-normal)',
            cursor: 'pointer',
            transition: 'all var(--transition-fast)'
          }}
        >
          Facturas
        </button>
        <button
          onClick={() => setActiveTab('cobros')}
          style={{
            padding: '1rem 2rem',
            border: 'none',
            borderBottom: activeTab === 'cobros' ? '3px solid var(--primary)' : 'none',
            backgroundColor: 'transparent',
            color: activeTab === 'cobros' ? 'var(--primary)' : 'var(--text-secondary)',
            fontSize: 'var(--font-size-base)',
            fontWeight: activeTab === 'cobros' ? 'var(--font-weight-semibold)' : 'var(--font-weight-normal)',
            cursor: 'pointer',
            transition: 'all var(--transition-fast)'
          }}
        >
          Cobros
        </button>
      </div>

      {activeTab === 'facturas' && <InvoicingView />}
      {activeTab === 'cobros' && <CollectionsView />}

      <Footer />
    </div>
  );
};

export default FinancialDashboard;