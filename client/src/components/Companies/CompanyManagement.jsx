import React, { useState } from 'react'
import { Plus, Building2, Users, CreditCard, FileText, UserPlus, UserMinus } from 'lucide-react'

const CompanyManagement = () => {
  const [companies, setCompanies] = useState([
    { 
      id: 1, 
      name: 'Tech Solutions SA', 
      cuit: '30123456789', 
      address: 'Av. Corrientes 1234', 
      contact: 'Juan Pérez', 
      email: 'juan@techsolutions.com', 
      phone: '1234567890',
      status: 'Activa',
      employees: [
        { id: 1, name: 'Ana García', email: 'ana@techsolutions.com', dni: '12345678', status: 'Activo' },
        { id: 2, name: 'Carlos López', email: 'carlos@techsolutions.com', dni: '87654321', status: 'Activo' }
      ]
    }
  ])

  const [showCompanyForm, setShowCompanyForm] = useState(false)
  const [showEmployeeForm, setShowEmployeeForm] = useState(false)
  const [selectedCompany, setSelectedCompany] = useState(null)
  const [companyFormData, setCompanyFormData] = useState({
    name: '', cuit: '', address: '', contact: '', email: '', phone: ''
  })
  const [employeeFormData, setEmployeeFormData] = useState({
    name: '', email: '', dni: '', phone: ''
  })

  const handleCompanySubmit = (e) => {
    e.preventDefault()
    
    if (companies.some(c => c.cuit === companyFormData.cuit)) {
      alert('El CUIT ya existe en el sistema')
      return
    }

    const newCompany = {
      id: Date.now(),
      ...companyFormData,
      status: 'Activa',
      employees: []
    }
    
    setCompanies([...companies, newCompany])
    setCompanyFormData({ name: '', cuit: '', address: '', contact: '', email: '', phone: '' })
    setShowCompanyForm(false)
    alert('Empresa registrada exitosamente. Se enviaron las credenciales al coordinador.')
  }

  const handleEmployeeSubmit = (e) => {
    e.preventDefault()
    
    const updatedCompanies = companies.map(company => {
      if (company.id === selectedCompany.id) {
        const newEmployee = {
          id: Date.now(),
          ...employeeFormData,
          status: 'Activo'
        }
        return {
          ...company,
          employees: [...company.employees, newEmployee]
        }
      }
      return company
    })
    
    setCompanies(updatedCompanies)
    setEmployeeFormData({ name: '', email: '', dni: '', phone: '' })
    setShowEmployeeForm(false)
    alert('Empleado registrado exitosamente')
  }

  const deactivateCompany = (companyId, reason) => {
    const updatedCompanies = companies.map(company => {
      if (company.id === companyId) {
        return { ...company, status: 'Inactiva', deactivationReason: reason }
      }
      return company
    })
    setCompanies(updatedCompanies)
    alert('Empresa dada de baja exitosamente')
  }

  const deactivateEmployee = (companyId, employeeId, reason) => {
    const updatedCompanies = companies.map(company => {
      if (company.id === companyId) {
        const updatedEmployees = company.employees.map(employee => {
          if (employee.id === employeeId) {
            return { ...employee, status: 'Inactivo', deactivationReason: reason }
          }
          return employee
        })
        return { ...company, employees: updatedEmployees }
      }
      return company
    })
    setCompanies(updatedCompanies)
    alert('Empleado dado de baja exitosamente')
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-lg font-semibold">Gestión de Empresas</h1>
        <button 
          onClick={() => setShowCompanyForm(true)}
          className="btn btn-primary"
        >
          <Plus size={16} />
          Registrar Empresa
        </button>
      </div>

      {showCompanyForm && (
        <div className="card mb-4">
          <div className="card-header">
            <h3 className="card-title">Registrar Nueva Empresa</h3>
          </div>
          <form onSubmit={handleCompanySubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Razón Social *</label>
                <input
                  type="text"
                  value={companyFormData.name}
                  onChange={(e) => setCompanyFormData({...companyFormData, name: e.target.value})}
                  className="form-input"
                  maxLength="40"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">CUIT *</label>
                <input
                  type="text"
                  value={companyFormData.cuit}
                  onChange={(e) => setCompanyFormData({...companyFormData, cuit: e.target.value})}
                  className="form-input"
                  maxLength="11"
                  pattern="[0-9]{11}"
                  required
                />
              </div>
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label className="form-label">Domicilio Legal *</label>
                <input
                  type="text"
                  value={companyFormData.address}
                  onChange={(e) => setCompanyFormData({...companyFormData, address: e.target.value})}
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Coordinador *</label>
                <input
                  type="text"
                  value={companyFormData.contact}
                  onChange={(e) => setCompanyFormData({...companyFormData, contact: e.target.value})}
                  className="form-input"
                  maxLength="40"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email Coordinador *</label>
                <input
                  type="email"
                  value={companyFormData.email}
                  onChange={(e) => setCompanyFormData({...companyFormData, email: e.target.value})}
                  className="form-input"
                  maxLength="40"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Teléfono *</label>
                <input
                  type="tel"
                  value={companyFormData.phone}
                  onChange={(e) => setCompanyFormData({...companyFormData, phone: e.target.value})}
                  className="form-input"
                  maxLength="10"
                  pattern="[0-9]{10}"
                  required
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button type="submit" className="btn btn-primary">Registrar Empresa</button>
              <button 
                type="button" 
                onClick={() => setShowCompanyForm(false)}
                className="btn btn-secondary"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {showEmployeeForm && selectedCompany && (
        <div className="card mb-4">
          <div className="card-header">
            <h3 className="card-title">Registrar Empleado - {selectedCompany.name}</h3>
          </div>
          <form onSubmit={handleEmployeeSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Nombre Completo *</label>
                <input
                  type="text"
                  value={employeeFormData.name}
                  onChange={(e) => setEmployeeFormData({...employeeFormData, name: e.target.value})}
                  className="form-input"
                  maxLength="40"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email *</label>
                <input
                  type="email"
                  value={employeeFormData.email}
                  onChange={(e) => setEmployeeFormData({...employeeFormData, email: e.target.value})}
                  className="form-input"
                  maxLength="50"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">DNI *</label>
                <input
                  type="text"
                  value={employeeFormData.dni}
                  onChange={(e) => setEmployeeFormData({...employeeFormData, dni: e.target.value})}
                  className="form-input"
                  maxLength="10"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Teléfono</label>
                <input
                  type="tel"
                  value={employeeFormData.phone}
                  onChange={(e) => setEmployeeFormData({...employeeFormData, phone: e.target.value})}
                  className="form-input"
                  maxLength="10"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button type="submit" className="btn btn-primary">Registrar Empleado</button>
              <button 
                type="button" 
                onClick={() => setShowEmployeeForm(false)}
                className="btn btn-secondary"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            <Building2 size={20} />
            Empresas Registradas
          </h3>
        </div>
        
        {companies.map(company => (
          <div key={company.id} className="card" style={{ margin: '1rem 0' }}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 style={{ fontWeight: '600', color: 'var(--gray-900)', marginBottom: '0.5rem' }}>
                  {company.name}
                </h4>
                <div style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>
                  <p>CUIT: {company.cuit}</p>
                  <p>Coordinador: {company.contact} ({company.email})</p>
                  <p>Teléfono: {company.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`status-badge ${company.status === 'Activa' ? 'status-active' : 'status-inactive'}`}>
                  {company.status}
                </span>
                {company.status === 'Activa' && (
                  <button 
                    onClick={() => {
                      const reason = prompt('Motivo de la baja:', 'Fin de contrato')
                      if (reason) deactivateCompany(company.id, reason)
                    }}
                    className="btn btn-error"
                    style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                  >
                    Dar de Baja
                  </button>
                )}
              </div>
            </div>

            <div className="flex justify-between items-center mb-3">
              <h5 style={{ fontWeight: '500', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Users size={16} />
                Empleados ({company.employees.length})
              </h5>
              {company.status === 'Activa' && (
                <button 
                  onClick={() => {
                    setSelectedCompany(company)
                    setShowEmployeeForm(true)
                  }}
                  className="btn btn-secondary"
                  style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                >
                  <UserPlus size={14} />
                  Agregar Empleado
                </button>
              )}
            </div>

            {company.employees.length > 0 ? (
              <div className="table-container">
                <table className="table" style={{ fontSize: '0.875rem' }}>
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>Email</th>
                      <th>DNI</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {company.employees.map(employee => (
                      <tr key={employee.id}>
                        <td>{employee.name}</td>
                        <td>{employee.email}</td>
                        <td>{employee.dni}</td>
                        <td>
                          <span className={`status-badge ${employee.status === 'Activo' ? 'status-active' : 'status-inactive'}`}>
                            {employee.status}
                          </span>
                        </td>
                        <td>
                          {employee.status === 'Activo' && (
                            <button 
                              onClick={() => {
                                const reason = prompt('Motivo de la baja:', 'Renuncia/despido del empleo')
                                if (reason) deactivateEmployee(company.id, employee.id, reason)
                              }}
                              className="btn btn-error"
                              style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                            >
                              <UserMinus size={12} />
                              Dar de Baja
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p style={{ textAlign: 'center', color: 'var(--gray-600)', padding: '1rem' }}>
                No hay empleados registrados
              </p>
            )}

            <div className="flex gap-2 mt-3">
              <button className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}>
                <CreditCard size={14} />
                Ver Pagos
              </button>
              <button className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}>
                <FileText size={14} />
                Reportes
              </button>
            </div>
          </div>
        ))}
        
        {companies.length === 0 && (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--gray-600)' }}>
            No hay empresas registradas
          </div>
        )}
      </div>
    </div>
  )
}

export default CompanyManagement