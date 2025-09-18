import React, { useState, useEffect } from 'react';

const CompanyForm = ({ company, onClose }) => {
  const [formData, setFormData] = useState({
    razonSocial: '',
    cuit: '',
    domicilio: '',
    contactoPrincipal: '',
    emailContacto: '',
    telefonoContacto: '',
    coordinadorNombre: '',
    coordinadorEmail: '',
    coordinadorTelefono: '',
    tipoContrato: '',
    fechaInicio: '',
    fechaFin: ''
  });

  useEffect(() => {
    if (company) {
      setFormData(company);
    }
  }, [company]);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Guardando empresa:', formData);
    onClose();
  };

  return (
    <div className="modal">
      <div className="modal-content large">
        <div className="modal-header">
          <h2>{company ? 'Editar Empresa' : 'Registrar Nueva Empresa'}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="company-form">
          <div className="form-section">
            <h3>Datos de la Empresa</h3>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Razón Social</label>
                <input
                  type="text"
                  value={formData.razonSocial}
                  onChange={(e) => setFormData({...formData, razonSocial: e.target.value})}
                  className="form-control"
                  maxLength="40"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">CUIT</label>
                <input
                  type="text"
                  value={formData.cuit}
                  onChange={(e) => setFormData({...formData, cuit: e.target.value})}
                  className="form-control"
                  maxLength="11"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Domicilio Legal</label>
              <input
                type="text"
                value={formData.domicilio}
                onChange={(e) => setFormData({...formData, domicilio: e.target.value})}
                className="form-control"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Contacto Principal</label>
                <input
                  type="text"
                  value={formData.contactoPrincipal}
                  onChange={(e) => setFormData({...formData, contactoPrincipal: e.target.value})}
                  className="form-control"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email Contacto</label>
                <input
                  type="email"
                  value={formData.emailContacto}
                  onChange={(e) => setFormData({...formData, emailContacto: e.target.value})}
                  className="form-control"
                  required
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Datos del Coordinador</h3>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Nombre Coordinador</label>
                <input
                  type="text"
                  value={formData.coordinadorNombre}
                  onChange={(e) => setFormData({...formData, coordinadorNombre: e.target.value})}
                  className="form-control"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email Coordinador</label>
                <input
                  type="email"
                  value={formData.coordinadorEmail}
                  onChange={(e) => setFormData({...formData, coordinadorEmail: e.target.value})}
                  className="form-control"
                  required
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Condiciones Comerciales (Opcional)</h3>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Tipo de Contrato</label>
                <input
                  type="text"
                  value={formData.tipoContrato}
                  onChange={(e) => setFormData({...formData, tipoContrato: e.target.value})}
                  className="form-control"
                  maxLength="20"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Fecha Inicio</label>
                <input
                  type="date"
                  value={formData.fechaInicio}
                  onChange={(e) => setFormData({...formData, fechaInicio: e.target.value})}
                  className="form-control"
                />
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              {company ? 'Actualizar' : 'Registrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CompanyForm;