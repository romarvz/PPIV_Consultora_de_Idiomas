import React, { useState, useEffect } from 'react';

const mockCompanies = [
  {
    id: 1,
    razonSocial: 'Tech Solutions SA',
    cuit: '30123456789',
    contactoPrincipal: 'Juan Pérez',
    emailContacto: 'contacto@techsolutions.com',
    coordinadorNombre: 'María García',
    empleadosActivos: 25,
    cursosContratados: 3,
    estado: 'Activa'
  },
  {
    id: 2,
    razonSocial: 'Innovate Corp',
    cuit: '30987654321',
    contactoPrincipal: 'Ana López',
    emailContacto: 'info@innovatecorp.com',
    coordinadorNombre: 'Carlos Ruiz',
    empleadosActivos: 15,
    cursosContratados: 2,
    estado: 'Activa'
  }
];

const CompanyList = ({ onEditCompany }) => {
  const [companies, setCompanies] = useState([]);

  useEffect(() => {
    setCompanies(mockCompanies);
  }, []);

  const handleDeactivate = (companyId) => {
    if (window.confirm('¿Está seguro de dar de baja esta empresa?')) {
      console.log('Dando de baja empresa:', companyId);
    }
  };

  return (
    <div className="card">
      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th>Razón Social</th>
              <th>CUIT</th>
              <th>Contacto Principal</th>
              <th>Coordinador</th>
              <th>Empleados</th>
              <th>Cursos</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {companies.map(company => (
              <tr key={company.id}>
                <td>
                  <div>
                    <strong>{company.razonSocial}</strong>
                    <br />
                    <small className="text-muted">{company.emailContacto}</small>
                  </div>
                </td>
                <td>{company.cuit}</td>
                <td>{company.contactoPrincipal}</td>
                <td>{company.coordinadorNombre}</td>
                <td>
                  <span className="badge badge-info">
                    {company.empleadosActivos}
                  </span>
                </td>
                <td>
                  <span className="badge badge-success">
                    {company.cursosContratados}
                  </span>
                </td>
                <td>
                  <span className="badge badge-success">
                    {company.estado}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button 
                      className="btn btn-sm btn-primary"
                      onClick={() => onEditCompany(company)}
                    >
                      Editar
                    </button>
                    <button className="btn btn-sm btn-secondary">
                      Empleados
                    </button>
                    <button className="btn btn-sm btn-warning">
                      Facturación
                    </button>
                    <button 
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDeactivate(company.id)}
                    >
                      Dar de Baja
                    </button>
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

export default CompanyList;