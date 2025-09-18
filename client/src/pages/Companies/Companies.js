import React, { useState } from 'react';
import CompanyForm from './CompanyForm';
import CompanyList from './CompanyList';
import './Companies.css';

const Companies = () => {
  const [showForm, setShowForm] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);

  const handleAddCompany = () => {
    setSelectedCompany(null);
    setShowForm(true);
  };

  const handleEditCompany = (company) => {
    setSelectedCompany(company);
    setShowForm(true);
  };

  return (
    <div className="companies-page">
      <div className="page-header">
        <h1>Gestión de Empresas</h1>
        <button className="btn btn-primary" onClick={handleAddCompany}>
          + Registrar Empresa
        </button>
      </div>

      <CompanyList onEditCompany={handleEditCompany} />

      {showForm && (
        <CompanyForm
          company={selectedCompany}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  );
};

export default Companies;