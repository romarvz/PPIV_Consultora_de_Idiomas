import React, { useState, useEffect, useMemo } from 'react';
import facturaAPI from '../../../services/facturaApi';
import { FaFileInvoice, FaCheckCircle, FaExclamationCircle, FaClock, FaEdit, FaTrash, FaPlus, FaFileExcel, FaCheck } from 'react-icons/fa';
import { formatDate, formatCurrency } from '../../../utils/formatting';
import Modal from '../../../components/common/Modal';

const StatusBadge = ({ status }) => {
  const statusConfig = {
    'Borrador': { icon: <FaEdit />, className: 'status-badge-pendiente' },
    'Pendiente': { icon: <FaExclamationCircle />, className: 'status-badge-vencido' },
    'Cobrada': { icon: <FaCheckCircle />, className: 'status-badge-pagado' },
    'Cobrada Parcialmente': { icon: <FaClock />, className: 'status-badge-pendiente' },
    'Vencida': { icon: <FaClock />, className: 'status-badge-vencido' },
  };

  const config = statusConfig[status] || statusConfig['Pendiente'];

  return (
    <span className={`status-badge ${config.className}`}>
      {config.icon}
      {status}
    </span>
  );
};

const InvoicingView = () => {
  const [facturas, setFacturas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filters, setFilters] = useState({ search: '', status: 'todos' });
  
  const [formData, setFormData] = useState({
    estudiante: '',
    condicionFiscal: 'Consumidor Final',
    periodoFacturado: '',
    fechaVencimiento: '',
    items: [
      {
        descripcion: '',
        cantidad: 1,
        precioUnitario: 0,
        subtotal: 0
      }
    ]
  });

  const fetchFacturas = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // TODO: Implementar endpoint para obtener TODAS las facturas
      // Por ahora mostramos mensaje
      setFacturas([]);
      
    } catch (err) {
      console.error('Error al cargar facturas:', err);
      setError(err.message || 'Error al cargar facturas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFacturas();
  }, []);

  const handleCreateFactura = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);

      const itemFacturaSchema = formData.items.map(item => ({
        descripcion: item.descripcion,
        cantidad: parseInt(item.cantidad),
        precioUnitario: parseFloat(item.precioUnitario),
        subtotal: parseFloat(item.subtotal)
      }));

      const datosFactura = {
        estudiante: formData.estudiante,
        condicionFiscal: formData.condicionFiscal,
        periodoFacturado: formData.periodoFacturado,
        fechaVencimiento: formData.fechaVencimiento,
        itemFacturaSchema: itemFacturaSchema
      };

      const response = await facturaAPI.crearFactura(datosFactura);

      if (response.success) {
        alert(response.message);
        setShowCreateModal(false);
        resetForm();
        fetchFacturas();
      }
    } catch (err) {
      console.error('Error al crear factura:', err);
      setError(err.message || 'Error al crear factura');
      alert('Error: ' + (err.message || 'No se pudo crear la factura'));
    } finally {
      setLoading(false);
    }
  };

  const handleAutorizarFactura = async (facturaId) => {
    if (!window.confirm('¿Desea autorizar esta factura? Una vez autorizada no podrá modificarla.')) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await facturaAPI.autorizarFactura(facturaId);

      if (response.success) {
        alert(`Factura autorizada con CAE: ${response.data.cae}`);
        fetchFacturas();
      }
    } catch (err) {
      console.error('Error al autorizar factura:', err);
      alert('Error: ' + (err.message || 'No se pudo autorizar la factura'));
    } finally {
      setLoading(false);
    }
  };

  const handleEliminarFactura = async (facturaId) => {
    if (!window.confirm('¿Está seguro de eliminar esta factura en borrador?')) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await facturaAPI.eliminarFactura(facturaId);

      if (response.success) {
        alert('Factura eliminada exitosamente');
        fetchFacturas();
      }
    } catch (err) {
      console.error('Error al eliminar factura:', err);
      alert('Error: ' + (err.message || 'No se pudo eliminar la factura'));
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    
    if (field === 'cantidad' || field === 'precioUnitario') {
      const cantidad = parseFloat(newItems[index].cantidad) || 0;
      const precio = parseFloat(newItems[index].precioUnitario) || 0;
      newItems[index].subtotal = cantidad * precio;
    }
    
    setFormData(prev => ({ ...prev, items: newItems }));
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { descripcion: '', cantidad: 1, precioUnitario: 0, subtotal: 0 }]
    }));
  };

  const removeItem = (index) => {
    if (formData.items.length > 1) {
      setFormData(prev => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== index)
      }));
    }
  };

  const resetForm = () => {
    setFormData({
      estudiante: '',
      condicionFiscal: 'Consumidor Final',
      periodoFacturado: '',
      fechaVencimiento: '',
      items: [{ descripcion: '', cantidad: 1, precioUnitario: 0, subtotal: 0 }]
    });
  };

  const calcularTotal = () => {
    return formData.items.reduce((sum, item) => sum + (item.subtotal || 0), 0);
  };

  const filteredFacturas = useMemo(() => {
    return facturas.filter(f => {
      const searchMatch = 
        f.numeroFactura?.toLowerCase().includes(filters.search.toLowerCase()) ||
        f.estudiante?.nombre?.toLowerCase().includes(filters.search.toLowerCase());
      const statusMatch = filters.status === 'todos' || f.estado === filters.status;
      return searchMatch && statusMatch;
    });
  }, [facturas, filters]);

  const renderContent = () => {
    if (loading && facturas.length === 0) {
      return <div className="loading-state">Cargando facturas...</div>;
    }

    if (error && facturas.length === 0) {
      return <div className="error-state">Error: {error}</div>;
    }

    if (filteredFacturas.length === 0) {
      return (
        <div className="empty-state">
          <FaFileExcel className="empty-state-icon" />
          <h3>No se encontraron facturas</h3>
          <p>No hay facturas registradas. Cree una nueva factura para comenzar.</p>
          <button className="cta-btn" onClick={() => setShowCreateModal(true)}>
            <FaPlus style={{ marginRight: '0.5rem' }} />
            Crear Primera Factura
          </button>
        </div>
      );
    }

    return (
      <div className="payments-table-container">
        <table className="payments-table">
          <thead>
            <tr>
              <th>Número</th>
              <th>Estudiante</th>
              <th>Fecha</th>
              <th>Período</th>
              <th>Monto</th>
              <th>Estado</th>
              <th>CAE/CAEA</th>
              <th className="col-actions">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredFacturas.map((factura) => (
              <tr key={factura._id}>
                <td>{factura.numeroFactura}</td>
                <td>{factura.estudiante?.nombre} {factura.estudiante?.apellido}</td>
                <td>{formatDate(factura.fechaEmision)}</td>
                <td>{factura.periodoFacturado}</td>
                <td>${formatCurrency(factura.total)}</td>
                <td><StatusBadge status={factura.estado} /></td>
                <td className="text-small">{factura.cae || factura.caea || '-'}</td>
                <td className="col-actions">
                  {factura.estado === 'Borrador' && (
                    <>
                      <button 
                        className="action-btn edit" 
                        title="Autorizar Factura"
                        onClick={() => handleAutorizarFactura(factura._id)}
                      >
                        <FaCheck />
                      </button>
                      <button 
                        className="action-btn delete" 
                        title="Eliminar Borrador"
                        onClick={() => handleEliminarFactura(factura._id)}
                      >
                        <FaTrash />
                      </button>
                    </>
                  )}
                  {factura.estado !== 'Borrador' && (
                    <span className="text-muted">-</span>
                  )}
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
          <button className="cta-btn" onClick={() => setShowCreateModal(true)}>
            <FaPlus style={{ marginRight: '0.5rem' }} />
            Nueva Factura
          </button>
        </header>

        <div className="payments-filter-bar">
          <div className="filter-group">
            <label htmlFor="search">Buscar:</label>
            <input
              type="text"
              id="search"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Número de factura o estudiante..."
            />
          </div>
          <div className="filter-group">
            <label htmlFor="status">Filtrar por Estado:</label>
            <select id="status" name="status" value={filters.status} onChange={handleFilterChange}>
              <option value="todos">Todos</option>
              <option value="Borrador">Borrador</option>
              <option value="Pendiente">Pendiente</option>
              <option value="Cobrada">Cobrada</option>
              <option value="Vencida">Vencida</option>
            </select>
          </div>
        </div>
      </div>

      {renderContent()}

      {showCreateModal && (
        <Modal title="Nueva Factura (Borrador)" onClose={() => { setShowCreateModal(false); resetForm(); }}>
          <form onSubmit={handleCreateFactura} className="payment-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="estudiante">ID Estudiante *</label>
                <input
                  type="text"
                  id="estudiante"
                  name="estudiante"
                  value={formData.estudiante}
                  onChange={handleFormChange}
                  placeholder="ID del estudiante"
                  required
                />
                <small className="form-help">Ingrese el ID del estudiante de la base de datos</small>
              </div>

              <div className="form-group">
                <label htmlFor="condicionFiscal">Condición Fiscal *</label>
                <select
                  id="condicionFiscal"
                  name="condicionFiscal"
                  value={formData.condicionFiscal}
                  onChange={handleFormChange}
                  required
                >
                  <option value="Consumidor Final">Consumidor Final</option>
                  <option value="Responsable Inscripto">Responsable Inscripto</option>
                  <option value="Monotributista">Monotributista</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="periodoFacturado">Período Facturado *</label>
                <input
                  type="text"
                  id="periodoFacturado"
                  name="periodoFacturado"
                  value={formData.periodoFacturado}
                  onChange={handleFormChange}
                  placeholder="2025-11"
                  required
                />
                <small className="form-help">Formato: YYYY-MM</small>
              </div>

              <div className="form-group">
                <label htmlFor="fechaVencimiento">Fecha Vencimiento *</label>
                <input
                  type="date"
                  id="fechaVencimiento"
                  name="fechaVencimiento"
                  value={formData.fechaVencimiento}
                  onChange={handleFormChange}
                  required
                />
              </div>
            </div>

            <div className="form-section">
              <div className="form-section-header">
                <h4>Ítems de la Factura</h4>
                <button type="button" className="btn-link" onClick={addItem}>
                  <FaPlus /> Agregar ítem
                </button>
              </div>

              {formData.items.map((item, index) => (
                <div key={index} className="item-row">
                  <div className="form-row">
                    <div className="form-group" style={{ flex: 2 }}>
                      <label>Descripción *</label>
                      <input
                        type="text"
                        value={item.descripcion}
                        onChange={(e) => handleItemChange(index, 'descripcion', e.target.value)}
                        placeholder="Ej: Curso Inglés A2 - Noviembre"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Cantidad *</label>
                      <input
                        type="number"
                        value={item.cantidad}
                        onChange={(e) => handleItemChange(index, 'cantidad', e.target.value)}
                        min="1"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Precio Unit. *</label>
                      <input
                        type="number"
                        value={item.precioUnitario}
                        onChange={(e) => handleItemChange(index, 'precioUnitario', e.target.value)}
                        min="0"
                        step="0.01"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Subtotal</label>
                      <input
                        type="number"
                        value={item.subtotal}
                        disabled
                        className="input-readonly"
                      />
                    </div>

                    {formData.items.length > 1 && (
                      <button
                        type="button"
                        className="action-btn delete"
                        onClick={() => removeItem(index)}
                        style={{ marginTop: '1.5rem' }}
                      >
                        <FaTrash />
                      </button>
                    )}
                  </div>
                </div>
              ))}

              <div className="form-total">
                <strong>Total: ${formatCurrency(calcularTotal())}</strong>
              </div>
            </div>

            {error && (
              <div className="error-message" style={{ marginTop: '1rem' }}>
                {error}
              </div>
            )}

            <div className="form-actions">
              <button 
                type="button" 
                className="btn-secondary" 
                onClick={() => { setShowCreateModal(false); resetForm(); }}
                disabled={loading}
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                className="cta-btn" 
                disabled={loading}
              >
                {loading ? 'Creando...' : 'Crear Borrador'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default InvoicingView;