import React, { useState, useEffect } from 'react';
import { 
  FaFileInvoice, 
  FaPlus, 
  FaTrash, 
  FaSave,
  FaUser,
  FaCalendar,
  FaDollarSign,
  FaCheckCircle,
  FaEye,
  FaList,
  FaTimes,
  FaEdit
} from 'react-icons/fa';
import facturaService from '../../../services/facturaService';
import '../../../styles/auth.css';
import '../../../styles/variables.css';

const InvoicingView = () => {
  const [estudiantes, setEstudiantes] = useState([]);
  const [conceptos, setConceptos] = useState([]);
  const [facturas, setFacturas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });
  const [vistaActiva, setVistaActiva] = useState('lista');

  const [factura, setFactura] = useState({
    id: null,
    estudiante: '',
    condicionFiscal: 'Consumidor Final',
    periodoFacturado: '',
    fechaVencimiento: '',
    itemFacturaSchema: []
  });

  const [itemTemp, setItemTemp] = useState({
    descripcion: '',
    cantidad: 1,
    precioUnitario: 0,
    conceptoCobro: ''
  });

  // Estado para modal de detalle
  const [mostrarDetalle, setMostrarDetalle] = useState(false);
  const [facturaDetalle, setFacturaDetalle] = useState(null);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [estudiantesRes, conceptosRes, facturasRes] = await Promise.all([
        facturaService.listarEstudiantes(),
        facturaService.listarConceptos(),
        facturaService.listarFacturas()
      ]);
      
      setEstudiantes(estudiantesRes.data?.students || []);
      setConceptos(conceptosRes.data || []);
      setFacturas(facturasRes.data || []);
    } catch (error) {
      console.error('Error cargando datos:', error);
      mostrarMensaje('error', 'Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const mostrarMensaje = (tipo, texto) => {
    setMensaje({ tipo, texto });
    setTimeout(() => setMensaje({ tipo: '', texto: '' }), 5000);
  };

  const autorizarFactura = async (facturaId) => {
    if (!window.confirm('¿Autorizar esta factura? Una vez autorizada no podrá editarla ni eliminarla.')) {
      return;
    }

    try {
      setLoading(true);
      await facturaService.autorizarFactura(facturaId);
      mostrarMensaje('success', 'Factura autorizada exitosamente');
      cargarDatos();
    } catch (error) {
      console.error('Error autorizando factura:', error);
      mostrarMensaje('error', error.response?.data?.message || 'Error al autorizar factura');
    } finally {
      setLoading(false);
    }
  };

  const eliminarFactura = async (facturaId) => {
    if (!window.confirm('¿Eliminar esta factura?')) {
      return;
    }

    try {
      setLoading(true);
      await facturaService.eliminarFactura(facturaId);
      mostrarMensaje('success', 'Factura eliminada exitosamente');
      cargarDatos();
    } catch (error) {
      console.error('Error eliminando factura:', error);
      mostrarMensaje('error', error.response?.data?.message || 'Error al eliminar factura');
    } finally {
      setLoading(false);
    }
  };

  const editarFactura = (factura) => {
    setFactura({
      id: factura._id,
      estudiante: factura.estudiante._id,
      condicionFiscal: factura.condicionFiscal,
      periodoFacturado: factura.periodoFacturado,
      fechaVencimiento: factura.fechaVencimiento.split('T')[0],
      itemFacturaSchema: factura.itemFacturaSchema || []
    });
    setVistaActiva('nueva');
  };

  const verDetalle = (factura) => {
    setFacturaDetalle(factura);
    setMostrarDetalle(true);
  };

  const agregarItem = () => {
    if (!itemTemp.descripcion || itemTemp.cantidad <= 0 || itemTemp.precioUnitario <= 0) {
      mostrarMensaje('error', 'Complete todos los campos del item');
      return;
    }

    const subtotal = itemTemp.cantidad * itemTemp.precioUnitario;
    const nuevoItem = {
      ...itemTemp,
      subtotal
    };

    setFactura({
      ...factura,
      itemFacturaSchema: [...factura.itemFacturaSchema, nuevoItem]
    });

    setItemTemp({
      descripcion: '',
      cantidad: 1,
      precioUnitario: 0,
      conceptoCobro: ''
    });
  };

  const eliminarItem = (index) => {
    const nuevosItems = factura.itemFacturaSchema.filter((_, i) => i !== index);
    setFactura({ ...factura, itemFacturaSchema: nuevosItems });
  };

  const calcularTotal = () => {
    return factura.itemFacturaSchema.reduce((sum, item) => sum + item.subtotal, 0);
  };

  const handleConceptoChange = async (conceptoId) => {
    const concepto = conceptos.find(c => c._id === conceptoId);
    if (!concepto) return;

    let precioFinal = concepto.amount;

    // Si el concepto está vinculado a un curso, obtener tarifa actual
    if (concepto.curso) {
      try {
        const cursoResponse = await facturaService.obtenerTarifaCurso(concepto.curso);
        if (cursoResponse.success && cursoResponse.data?.tarifa) {
          precioFinal = cursoResponse.data.tarifa;
        }
      } catch (error) {
        console.warn('Error obteniendo tarifa del curso:', error);
        // Si falla, usar el amount del concepto
      }
    }

    setItemTemp({
      ...itemTemp,
      conceptoCobro: conceptoId,
      descripcion: concepto.name,
      precioUnitario: precioFinal
    });
  };

  const enviarFactura = async () => {
    if (!factura.estudiante) {
      mostrarMensaje('error', 'Seleccione un estudiante');
      return;
    }
    if (!factura.periodoFacturado) {
      mostrarMensaje('error', 'Ingrese el período facturado');
      return;
    }
    if (!factura.fechaVencimiento) {
      mostrarMensaje('error', 'Ingrese la fecha de vencimiento');
      return;
    }
    if (factura.itemFacturaSchema.length === 0) {
      mostrarMensaje('error', 'Agregue al menos un item a la factura');
      return;
    }

    try {
      setLoading(true);
      
      if (factura.id) {
        // Editar factura existente
        await facturaService.editarFactura(factura.id, {
          itemFacturaSchema: factura.itemFacturaSchema,
          fechaVencimiento: factura.fechaVencimiento,
          periodoFacturado: factura.periodoFacturado
        });
        mostrarMensaje('success', 'Factura editada exitosamente');
      } else {
        // Crear nueva factura
        await facturaService.crearFactura(factura);
        mostrarMensaje('success', 'Factura creada en borrador exitosamente');
      }
      
      setFactura({
        id: null,
        estudiante: '',
        condicionFiscal: 'Consumidor Final',
        periodoFacturado: '',
        fechaVencimiento: '',
        itemFacturaSchema: []
      });

      await cargarDatos();
      setVistaActiva('lista');
    } catch (error) {
      console.error('Error guardando factura:', error);
      mostrarMensaje('error', error.response?.data?.message || 'Error al guardar factura');
    } finally {
      setLoading(false);
    }
  };

  const getEstadoBadge = (estado) => {
    const clases = {
      'Borrador': 'status-badge',
      'Pendiente': 'status-badge status-badge--scheduled',
      'Cobrada': 'status-badge status-badge--paid',
      'Cobrada Parcialmente': 'status-badge status-badge--pending',
      'Vencida': 'status-badge'
    };
    
    return <span className={clases[estado] || 'status-badge'}>{estado}</span>;
  };

  const renderListaFacturas = () => (
    <div className="dashboard-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div className="dashboard-card__header" style={{ border: 'none', marginBottom: 0, paddingBottom: 0 }}>
          <FaList className="dashboard-card__icon" />
          <h2 className="dashboard-card__title">Facturas</h2>
        </div>
        <button
          onClick={() => setVistaActiva('nueva')}
          className="cta-btn"
          style={{
            padding: '0.75rem 1.5rem',
            borderRadius: 'var(--border-radius)',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: 'var(--font-size-sm)',
            fontWeight: 'var(--font-weight-semibold)',
            cursor: 'pointer'
          }}
        >
          <FaPlus /> Nueva Factura
        </button>
      </div>

      <div className="dashboard-card">
        {loading ? (
          <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
            Cargando facturas...
          </p>
        ) : facturas.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
            No hay facturas creadas. Haga clic en "Nueva Factura" para crear una.
          </p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                  <th style={{ padding: '1rem', textAlign: 'left', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--text-secondary)' }}>Número</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--text-secondary)' }}>Estudiante</th>
                  <th style={{ padding: '1rem', textAlign: 'center', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--text-secondary)' }}>Período</th>
                  <th style={{ padding: '1rem', textAlign: 'right', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--text-secondary)' }}>Total</th>
                  <th style={{ padding: '1rem', textAlign: 'center', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--text-secondary)' }}>Estado</th>
                  <th style={{ padding: '1rem', textAlign: 'center', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--text-secondary)' }}>CAE/CAEA</th>
                  <th style={{ padding: '1rem', textAlign: 'center', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--text-secondary)' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {facturas.map((fact) => (
                  <tr key={fact._id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '1rem', fontWeight: 'var(--font-weight-medium)' }}>{fact.numeroFactura}</td>
                    <td style={{ padding: '1rem' }}>
                      {fact.estudiante?.firstName} {fact.estudiante?.lastName}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>{fact.periodoFacturado}</td>
                    <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 'var(--font-weight-semibold)', color: 'var(--primary)' }}>
                      ${fact.total.toLocaleString()}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      {getEstadoBadge(fact.estado)}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--text-primary)' }}>
                      {fact.cae || fact.caea || '-'}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                        {fact.estado === 'Borrador' && (
                          <>
                            <button
                              onClick={() => editarFactura(fact)}
                              title="Editar"
                              style={{
                                padding: '0.5rem 0.75rem',
                                borderRadius: 'var(--border-radius-sm)',
                                border: 'none',
                                backgroundColor: 'var(--info)',
                                color: 'white',
                                cursor: 'pointer',
                                fontSize: 'var(--font-size-sm)'
                              }}
                            >
                              <FaEdit />
                            </button>
                            <button
                              onClick={() => autorizarFactura(fact._id)}
                              title="Autorizar (solicitar CAE)"
                              className="cta-btn"
                              style={{
                                padding: '0.5rem 1rem',
                                borderRadius: 'var(--border-radius-sm)',
                                border: 'none',
                                backgroundColor: 'var(--success)',
                                fontSize: 'var(--font-size-xs)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                                cursor: 'pointer'
                              }}
                            >
                              <FaCheckCircle /> Autorizar
                            </button>
                            <button
                              onClick={() => eliminarFactura(fact._id)}
                              title="Eliminar"
                              style={{
                                padding: '0.5rem 0.75rem',
                                borderRadius: 'var(--border-radius-sm)',
                                border: 'none',
                                backgroundColor: 'var(--error)',
                                color: 'white',
                                cursor: 'pointer'
                              }}
                            >
                              <FaTrash />
                            </button>
                          </>
                        )}
                        {fact.estado !== 'Borrador' && (
                          <button
                            onClick={() => verDetalle(fact)}
                            title="Ver detalle"
                            style={{
                              padding: '0.5rem 0.75rem',
                              borderRadius: 'var(--border-radius-sm)',
                              border: 'none',
                              backgroundColor: 'var(--info)',
                              color: 'white',
                              cursor: 'pointer'
                            }}
                          >
                            <FaEye />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );

  const renderNuevaFactura = () => (
    <div className="dashboard-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div className="dashboard-card__header" style={{ border: 'none', marginBottom: 0, paddingBottom: 0 }}>
          <FaFileInvoice className="dashboard-card__icon" />
          <h2 className="dashboard-card__title">{factura.id ? 'Editar Factura' : 'Nueva Factura'}</h2>
        </div>
        <button
          onClick={() => setVistaActiva('lista')}
          style={{
            padding: '0.75rem 1.5rem',
            borderRadius: 'var(--border-radius)',
            border: '1px solid var(--border-color)',
            backgroundColor: 'var(--bg-primary)',
            color: 'var(--text-primary)',
            cursor: 'pointer',
            fontSize: 'var(--font-size-sm)',
            fontWeight: 'var(--font-weight-semibold)'
          }}
        >
          ← Volver a Lista
        </button>
      </div>

      <div className="dashboard-cards-grid" style={{ gridTemplateColumns: '1fr' }}>
        <div className="dashboard-card">
          <h4 className="dashboard-card__title">
            <FaUser style={{ marginRight: '0.5rem' }} />
            Datos del Cliente
          </h4>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'var(--font-weight-medium)', fontSize: 'var(--font-size-sm)' }}>
                Estudiante *
              </label>
              <select
                value={factura.estudiante}
                onChange={(e) => setFactura({ ...factura, estudiante: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: 'var(--border-radius)',
                  border: '1px solid var(--input-border)',
                  backgroundColor: 'var(--input-bg)',
                  color: 'var(--text-primary)',
                  fontSize: 'var(--font-size-sm)'
                }}
              >
                <option value="">Seleccione estudiante</option>
                {estudiantes.map(est => (
                  <option key={est._id} value={est._id}>
                    {est.firstName} {est.lastName} - DNI: {est.dni}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'var(--font-weight-medium)', fontSize: 'var(--font-size-sm)' }}>
                Condición Fiscal *
              </label>
              <select
                value={factura.condicionFiscal}
                onChange={(e) => setFactura({ ...factura, condicionFiscal: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: 'var(--border-radius)',
                  border: '1px solid var(--input-border)',
                  backgroundColor: 'var(--input-bg)',
                  color: 'var(--text-primary)',
                  fontSize: 'var(--font-size-sm)'
                }}
              >
                <option>Consumidor Final</option>
                <option>Responsable Inscripto</option>
                <option>Monotributista</option>
                <option>Exento</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'var(--font-weight-medium)', fontSize: 'var(--font-size-sm)' }}>
                <FaCalendar style={{ marginRight: '0.25rem' }} />
                Período Facturado *
              </label>
              <input
                type="month"
                value={factura.periodoFacturado}
                onChange={(e) => setFactura({ ...factura, periodoFacturado: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: 'var(--border-radius)',
                  border: '1px solid var(--input-border)',
                  backgroundColor: 'var(--input-bg)',
                  color: 'var(--text-primary)',
                  fontSize: 'var(--font-size-sm)'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'var(--font-weight-medium)', fontSize: 'var(--font-size-sm)' }}>
                <FaCalendar style={{ marginRight: '0.25rem' }} />
                Fecha Vencimiento *
              </label>
              <input
                type="date"
                value={factura.fechaVencimiento}
                onChange={(e) => setFactura({ ...factura, fechaVencimiento: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: 'var(--border-radius)',
                  border: '1px solid var(--input-border)',
                  backgroundColor: 'var(--input-bg)',
                  color: 'var(--text-primary)',
                  fontSize: 'var(--font-size-sm)'
                }}
              />
            </div>
          </div>
        </div>

        <div className="dashboard-card">
          <h4 className="dashboard-card__title">
            <FaPlus style={{ marginRight: '0.5rem' }} />
            Agregar Item
          </h4>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: '0.75rem', marginTop: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'var(--font-weight-medium)', fontSize: 'var(--font-size-sm)' }}>
                Concepto
              </label>
              <select
                value={itemTemp.conceptoCobro}
                onChange={(e) => handleConceptoChange(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: 'var(--border-radius)',
                  border: '1px solid var(--input-border)',
                  backgroundColor: 'var(--input-bg)',
                  color: 'var(--text-primary)',
                  fontSize: 'var(--font-size-sm)'
                }}
              >
                <option value="">Seleccione concepto</option>
                {conceptos.map(concepto => (
                  <option key={concepto._id} value={concepto._id}>
                    {concepto.name} - ${concepto.amount.toLocaleString()}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'var(--font-weight-medium)', fontSize: 'var(--font-size-sm)' }}>
                Cantidad
              </label>
              <input
                type="number"
                min="1"
                value={itemTemp.cantidad}
                onChange={(e) => setItemTemp({ ...itemTemp, cantidad: parseInt(e.target.value) || 1 })}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: 'var(--border-radius)',
                  border: '1px solid var(--input-border)',
                  backgroundColor: 'var(--input-bg)',
                  color: 'var(--text-primary)',
                  fontSize: 'var(--font-size-sm)'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'var(--font-weight-medium)', fontSize: 'var(--font-size-sm)' }}>
                Precio Unit.
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={itemTemp.precioUnitario}
                onChange={(e) => setItemTemp({ ...itemTemp, precioUnitario: parseFloat(e.target.value) || 0 })}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: 'var(--border-radius)',
                  border: '1px solid var(--input-border)',
                  backgroundColor: 'var(--input-bg)',
                  color: 'var(--text-primary)',
                  fontSize: 'var(--font-size-sm)'
                }}
              />
            </div>

            <button
              onClick={agregarItem}
              className="cta-btn"
              style={{
                padding: '0.75rem 1.25rem',
                marginTop: '1.75rem',
                borderRadius: 'var(--border-radius)',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                fontSize: 'var(--font-size-sm)',
                cursor: 'pointer'
              }}
            >
              <FaPlus /> Agregar
            </button>
          </div>

          <div style={{ marginTop: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'var(--font-weight-medium)', fontSize: 'var(--font-size-sm)' }}>
              Descripción
            </label>
            <input
              type="text"
              value={itemTemp.descripcion}
              onChange={(e) => setItemTemp({ ...itemTemp, descripcion: e.target.value })}
              placeholder="Ej: Clase Particular 26/10"
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: 'var(--border-radius)',
                border: '1px solid var(--input-border)',
                backgroundColor: 'var(--input-bg)',
                color: 'var(--text-primary)',
                fontSize: 'var(--font-size-sm)'
              }}
            />
          </div>
        </div>

        {factura.itemFacturaSchema.length > 0 && (
          <div className="dashboard-card">
            <h4 className="dashboard-card__title">
              <FaDollarSign style={{ marginRight: '0.5rem' }} />
              Items de la Factura
            </h4>

            <table style={{ width: '100%', marginTop: '1rem', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)' }}>Descripción</th>
                  <th style={{ padding: '0.75rem', textAlign: 'center', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)' }}>Cantidad</th>
                  <th style={{ padding: '0.75rem', textAlign: 'right', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)' }}>Precio Unit.</th>
                  <th style={{ padding: '0.75rem', textAlign: 'right', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)' }}>Subtotal</th>
                  <th style={{ padding: '0.75rem', textAlign: 'center', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)' }}>Acción</th>
                </tr>
              </thead>
              <tbody>
                {factura.itemFacturaSchema.map((item, index) => (
                  <tr key={index} style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '0.75rem', fontSize: 'var(--font-size-sm)' }}>{item.descripcion}</td>
                    <td style={{ padding: '0.75rem', textAlign: 'center', fontSize: 'var(--font-size-sm)' }}>{item.cantidad}</td>
                    <td style={{ padding: '0.75rem', textAlign: 'right', fontSize: 'var(--font-size-sm)' }}>
                      ${item.precioUnitario.toLocaleString()}
                    </td>
                    <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 'var(--font-weight-semibold)', fontSize: 'var(--font-size-sm)' }}>
                      ${item.subtotal.toLocaleString()}
                    </td>
                    <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                      <button
                        onClick={() => eliminarItem(index)}
                        style={{
                          padding: '0.375rem 0.75rem',
                          borderRadius: 'var(--border-radius-sm)',
                          border: 'none',
                          backgroundColor: 'var(--error)',
                          color: 'white',
                          cursor: 'pointer',
                          fontSize: 'var(--font-size-sm)'
                        }}
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ borderTop: '2px solid var(--border-color)' }}>
                  <td colSpan="3" style={{ padding: '1rem', textAlign: 'right', fontWeight: 'var(--font-weight-semibold)', fontSize: 'var(--font-size-lg)' }}>
                    TOTAL:
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right', fontSize: 'var(--font-size-xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--primary)' }}>
                    ${calcularTotal().toLocaleString()}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}

        <div style={{ textAlign: 'right', marginTop: '1.5rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
          <button
            onClick={() => {
              setFactura({
                id: null,
                estudiante: '',
                condicionFiscal: 'Consumidor Final',
                periodoFacturado: '',
                fechaVencimiento: '',
                itemFacturaSchema: []
              });
              setVistaActiva('lista');
            }}
            style={{
              padding: '0.875rem 2rem',
              borderRadius: 'var(--border-radius)',
              border: '2px solid var(--gray-300)',
              backgroundColor: 'var(--bg-primary)',
              color: 'var(--text-primary)',
              fontSize: 'var(--font-size-base)',
              cursor: 'pointer',
              fontWeight: 'var(--font-weight-semibold)',
              transition: 'all var(--transition-fast)'
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = 'var(--gray-100)';
              e.target.style.borderColor = 'var(--gray-400)';
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = 'var(--bg-primary)';
              e.target.style.borderColor = 'var(--gray-300)';
            }}
          >
            Cancelar
          </button>
          <button
            onClick={enviarFactura}
            disabled={loading || factura.itemFacturaSchema.length === 0}
            className="cta-btn"
            style={{
              padding: '0.875rem 2rem',
              borderRadius: 'var(--border-radius)',
              border: 'none',
              backgroundColor: loading ? 'var(--gray-400)' : 'var(--success)',
              fontSize: 'var(--font-size-base)',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              opacity: loading || factura.itemFacturaSchema.length === 0 ? 0.6 : 1
            }}
          >
            <FaSave />
            {loading ? 'Guardando...' : (factura.id ? 'Actualizar Factura' : 'Guardar Factura')}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {mensaje.texto && (
        <div style={{ 
          padding: '1rem', 
          marginBottom: '1rem',
          borderRadius: 'var(--border-radius)',
          backgroundColor: mensaje.tipo === 'success' ? 'var(--success-light)' : 'var(--error-light)',
          color: mensaje.tipo === 'success' ? 'var(--success-dark)' : 'var(--error-dark)',
          border: `1px solid ${mensaje.tipo === 'success' ? 'var(--success)' : 'var(--error)'}`,
          position: 'fixed',
          top: '1.5rem',
          right: '1.5rem',
          zIndex: 9999,
          minWidth: '300px',
          boxShadow: 'var(--shadow-lg)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <span>{mensaje.texto}</span>
          <button
            onClick={() => setMensaje({ tipo: '', texto: '' })}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'inherit',
              fontSize: '1.25rem',
              padding: '0',
              lineHeight: 1
            }}
          >
            <FaTimes />
          </button>
        </div>
      )}
      
      {vistaActiva === 'lista' ? renderListaFacturas() : renderNuevaFactura()}

      {/* Modal: Detalle de Factura */}
      {mostrarDetalle && facturaDetalle && (
        <div style={{ 
          position: 'fixed', 
          inset: 0, 
          backgroundColor: 'rgba(0, 0, 0, 0.5)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          zIndex: 50 
        }}>
          <div style={{ 
            backgroundColor: 'var(--card-bg)', 
            borderRadius: 'var(--border-radius-lg)', 
            padding: '2rem', 
            maxWidth: '800px', 
            width: '90%', 
            maxHeight: '90vh', 
            overflowY: 'auto' 
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--primary)' }}>
                Detalle de Factura
              </h2>
              <button
                onClick={() => setMostrarDetalle(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-secondary)',
                  fontSize: '1.5rem',
                  padding: '0'
                }}
              >
                <FaTimes />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', fontWeight: 'var(--font-weight-medium)' }}>
                  Número de Factura
                </label>
                <p style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-bold)', color: 'var(--primary)' }}>
                  {facturaDetalle.numeroFactura}
                </p>
              </div>
              <div>
                <label style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', fontWeight: 'var(--font-weight-medium)' }}>
                  Estado
                </label>
                <div style={{ marginTop: '0.5rem' }}>
                  {getEstadoBadge(facturaDetalle.estado)}
                </div>
              </div>
              <div>
                <label style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', fontWeight: 'var(--font-weight-medium)' }}>
                  Estudiante
                </label>
                <p style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-semibold)' }}>
                  {facturaDetalle.estudiante?.firstName} {facturaDetalle.estudiante?.lastName}
                </p>
              </div>
              <div>
                <label style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', fontWeight: 'var(--font-weight-medium)' }}>
                  Período
                </label>
                <p style={{ fontSize: 'var(--font-size-base)' }}>
                  {facturaDetalle.periodoFacturado}
                </p>
              </div>
              <div>
                <label style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', fontWeight: 'var(--font-weight-medium)' }}>
                  Fecha Emisión
                </label>
                <p style={{ fontSize: 'var(--font-size-base)' }}>
                  {new Date(facturaDetalle.fechaEmision).toLocaleDateString()}
                </p>
              </div>
              <div>
                <label style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', fontWeight: 'var(--font-weight-medium)' }}>
                  Fecha Vencimiento
                </label>
                <p style={{ fontSize: 'var(--font-size-base)' }}>
                  {new Date(facturaDetalle.fechaVencimiento).toLocaleDateString()}
                </p>
              </div>
              {facturaDetalle.cae && (
                <>
                  <div>
                    <label style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', fontWeight: 'var(--font-weight-medium)' }}>
                      CAE
                    </label>
                    <p style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-bold)', color: 'var(--success)' }}>
                      {facturaDetalle.cae}
                    </p>
                  </div>
                  <div>
                    <label style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', fontWeight: 'var(--font-weight-medium)' }}>
                      Vto. CAE
                    </label>
                    <p style={{ fontSize: 'var(--font-size-base)' }}>
                      {new Date(facturaDetalle.fechaVencimientoCAE).toLocaleDateString()}
                    </p>
                  </div>
                </>
              )}
            </div>

            <div style={{ marginTop: '2rem' }}>
              <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-semibold)', marginBottom: '1rem', color: 'var(--primary)' }}>
                Items de la Factura
              </h3>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                    <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)' }}>
                      Descripción
                    </th>
                    <th style={{ padding: '0.75rem', textAlign: 'center', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)' }}>
                      Cantidad
                    </th>
                    <th style={{ padding: '0.75rem', textAlign: 'right', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)' }}>
                      Precio Unit.
                    </th>
                    <th style={{ padding: '0.75rem', textAlign: 'right', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)' }}>
                      Subtotal
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {facturaDetalle.itemFacturaSchema?.map((item, index) => (
                    <tr key={index} style={{ borderBottom: '1px solid var(--border-light)' }}>
                      <td style={{ padding: '0.75rem', fontSize: 'var(--font-size-sm)' }}>
                        {item.descripcion}
                      </td>
                      <td style={{ padding: '0.75rem', textAlign: 'center', fontSize: 'var(--font-size-sm)' }}>
                        {item.cantidad}
                      </td>
                      <td style={{ padding: '0.75rem', textAlign: 'right', fontSize: 'var(--font-size-sm)' }}>
                        ${item.precioUnitario.toLocaleString()}
                      </td>
                      <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 'var(--font-weight-semibold)', fontSize: 'var(--font-size-sm)' }}>
                        ${item.subtotal.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr style={{ borderTop: '2px solid var(--border-color)' }}>
                    <td colSpan="3" style={{ padding: '1rem', textAlign: 'right', fontWeight: 'var(--font-weight-semibold)', fontSize: 'var(--font-size-lg)' }}>
                      TOTAL:
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right', fontSize: 'var(--font-size-xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--primary)' }}>
                      ${facturaDetalle.total.toLocaleString()}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div style={{ marginTop: '2rem', textAlign: 'right' }}>
              <button
                onClick={() => setMostrarDetalle(false)}
                style={{
                  padding: '0.75rem 2rem',
                  borderRadius: 'var(--border-radius)',
                  border: '2px solid var(--gray-300)',
                  backgroundColor: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  fontSize: 'var(--font-size-base)',
                  cursor: 'pointer',
                  fontWeight: 'var(--font-weight-semibold)'
                }}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default InvoicingView;