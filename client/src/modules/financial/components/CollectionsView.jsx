import React, { useState, useEffect } from 'react';
import {
  FaDollarSign,
  FaCalendar,
  FaCheckCircle,
  FaTimes,
  FaExclamationTriangle,
  FaSearch,
  FaPlus,
  FaUser,
  FaReceipt,
  FaSyncAlt
} from 'react-icons/fa';
import cobroAPI from '../../../services/cobroApi';
import facturaService from '../../../services/facturaService';
import '../../../styles/auth.css';
import '../../../styles/variables.css';

const CollectionsView = () => {
  // Estados principales
  const [facturasPendientes, setFacturasPendientes] = useState([]);
  const [estudiantes, setEstudiantes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });

  // Estados para filtros
  const [filtros, setFiltros] = useState({
    numero: '',
    estudiante: '',
    periodo: ''
  });

  // Estados para modal de cobro individual
  const [mostrarModalCobroIndividual, setMostrarModalCobroIndividual] = useState(false);
  const [facturaSeleccionadaIndividual, setFacturaSeleccionadaIndividual] = useState(null);

  // Estados para modal de cobro múltiple (Nuevo Cobro)
  const [mostrarModalCobroMultiple, setMostrarModalCobroMultiple] = useState(false);
  const [estudianteBuscado, setEstudianteBuscado] = useState('');
  const [estudianteSeleccionado, setEstudianteSeleccionado] = useState(null);
  const [facturasEstudiante, setFacturasEstudiante] = useState([]);
  const [facturasSeleccionadasMultiple, setFacturasSeleccionadasMultiple] = useState([]);

  // Estados para selección múltiple en la tabla
  const [facturasSeleccionadasTabla, setFacturasSeleccionadasTabla] = useState([]);

  // Estados para datos de cobro
  const [datosCobro, setDatosCobro] = useState({
    metodoCobro: 'Efectivo',
    fechaCobro: new Date().toISOString().split('T')[0],
    notas: '',
    montoCobrar: 0
  });

  // Estado para montos individuales en cobro múltiple
  const [montosFacturas, setMontosFacturas] = useState({});

  // Estado para modal de error
  const [mostrarModalError, setMostrarModalError] = useState(false);
  const [errorModal, setErrorModal] = useState({ titulo: '', mensaje: '' });

  useEffect(() => {
    cargarFacturasPendientes();
    cargarEstudiantes();
  }, []);

  const cargarFacturasPendientes = async () => {
    try {
      setLoading(true);
      const response = await facturaService.listarFacturas();

      // Filtrar solo facturas pendientes o parcialmente cobradas
      const pendientes = (response.data || []).filter(
        f => f.estado === 'Pendiente' || f.estado === 'Cobrada Parcialmente'
      );

      setFacturasPendientes(pendientes);
    } catch (error) {
      console.error('Error cargando facturas:', error);
      mostrarMensaje('error', 'Error al cargar facturas pendientes');
    } finally {
      setLoading(false);
    }
  };

  const cargarEstudiantes = async () => {
    try {
      const response = await facturaService.listarEstudiantes();
      setEstudiantes(response.data || []);
    } catch (error) {
      console.error('Error cargando estudiantes:', error);
    }
  };

  const handleFiltroChange = (campo, valor) => {
    setFiltros({ ...filtros, [campo]: valor });
  };

  const limpiarFiltros = () => {
    setFiltros({
      numero: '',
      estudiante: '',
      periodo: ''
    });
  };

  const facturasFiltradas = facturasPendientes.filter(factura => {
    const cumpleNumero = !filtros.numero || 
      factura.numeroFactura.toLowerCase().includes(filtros.numero.toLowerCase());
    
    const cumpleEstudiante = !filtros.estudiante || 
      `${factura.estudiante?.firstName} ${factura.estudiante?.lastName}`.toLowerCase().includes(filtros.estudiante.toLowerCase());
    
    const cumplePeriodo = !filtros.periodo || 
      factura.periodoFacturado?.includes(filtros.periodo);

    return cumpleNumero && cumpleEstudiante && cumplePeriodo;
  });

  // ========================================
  // COBRO INDIVIDUAL
  // ========================================

  const abrirModalCobroIndividual = async (factura) => {
    setFacturaSeleccionadaIndividual(factura);
    setMostrarModalCobroIndividual(true);

    // Calcular saldo pendiente
    let saldoPendiente = factura.total;
    let totalCobrado = 0;

    try {
      const response = await cobroAPI.obtenerCobrosPorFactura(factura._id);
      const cobros = response.data || [];

      console.log('Cobros encontrados para factura:', factura.numeroFactura, cobros);

      totalCobrado = cobros.reduce((sum, cobro) => {
        const facturaEnCobro = cobro.facturas.find(f => {
          const facturaIdEnCobro = typeof f.facturaId === 'object' ? f.facturaId._id : f.facturaId;
          return facturaIdEnCobro === factura._id;
        });

        if (facturaEnCobro) {
          console.log('Monto cobrado en recibo', cobro.numeroRecibo, ':', facturaEnCobro.montoCobrado);
          return sum + facturaEnCobro.montoCobrado;
        }
        return sum;
      }, 0);

      saldoPendiente = factura.total - totalCobrado;
      console.log('Total factura:', factura.total, 'Total cobrado:', totalCobrado, 'Saldo pendiente:', saldoPendiente);
    } catch (error) {
      console.error('Error calculando saldo:', error);
    }

    setDatosCobro({
      metodoCobro: 'Efectivo',
      fechaCobro: new Date().toISOString().split('T')[0],
      notas: '',
      montoCobrar: saldoPendiente
    });
  };

  const registrarCobroIndividual = async () => {
    try {
      // Validar monto
      if (!datosCobro.montoCobrar || datosCobro.montoCobrar <= 0) {
        mostrarError('Error de Validación', 'El monto a cobrar debe ser mayor a cero');
        return;
      }

      setLoading(true);

      const estudianteId = facturaSeleccionadaIndividual.estudiante._id || facturaSeleccionadaIndividual.estudiante;

      const cobro = {
        estudiante: estudianteId,
        facturas: [{
          facturaId: facturaSeleccionadaIndividual._id,
          montoCobrado: parseFloat(datosCobro.montoCobrar)
        }],
        metodoCobro: datosCobro.metodoCobro,
        fechaCobro: datosCobro.fechaCobro,
        notas: datosCobro.notas
      };

      const resultado = await cobroAPI.registrarCobro(cobro);

      mostrarMensaje('success', resultado.message || 'Cobro registrado exitosamente');

      setMostrarModalCobroIndividual(false);
      setFacturaSeleccionadaIndividual(null);

      cargarFacturasPendientes();

    } catch (error) {
      console.error('Error registrando cobro:', error);
      const mensajeError = error.message || 'Error al registrar cobro';
      mostrarError('Error al Registrar Cobro', mensajeError);
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // COBRO MÚLTIPLE EN TABLA
  // ========================================

  const toggleFacturaTabla = (facturaId) => {
    setFacturasSeleccionadasTabla(prev => {
      if (prev.includes(facturaId)) {
        return prev.filter(id => id !== facturaId);
      } else {
        return [...prev, facturaId];
      }
    });
  };

  const seleccionarTodasFacturasTabla = () => {
    if (facturasSeleccionadasTabla.length === facturasFiltradas.length) {
      setFacturasSeleccionadasTabla([]);
    } else {
      setFacturasSeleccionadasTabla(facturasFiltradas.map(f => f._id));
    }
  };

  const cobrarSeleccionadas = () => {
    if (facturasSeleccionadasTabla.length === 0) {
      mostrarMensaje('error', 'Seleccione al menos una factura');
      return;
    }

    // Verificar que todas las facturas seleccionadas sean del mismo estudiante
    const facturasAcobrar = facturasPendientes.filter(f => facturasSeleccionadasTabla.includes(f._id));
    const estudiantesIds = [...new Set(facturasAcobrar.map(f => f.estudiante._id || f.estudiante))];

    if (estudiantesIds.length > 1) {
      mostrarMensaje('error', 'Solo puede cobrar facturas del mismo estudiante a la vez');
      return;
    }

    // Abrir modal de cobro con las facturas seleccionadas
    abrirModalCobroMultipleDesdeTabla(facturasAcobrar);
  };

  const abrirModalCobroMultipleDesdeTabla = async (facturas) => {
    // Obtener el estudiante de las facturas seleccionadas
    const estudiante = facturas[0].estudiante;

    setEstudianteSeleccionado(estudiante);
    setFacturasEstudiante(facturas);
    setFacturasSeleccionadasMultiple(facturas.map(f => f._id));
    setMostrarModalCobroMultiple(true);

    // Calcular saldos pendientes para cada factura
    const montosIniciales = {};
    for (const factura of facturas) {
      let saldoPendiente = factura.total;

      try {
        const response = await cobroAPI.obtenerCobrosPorFactura(factura._id);
        const cobros = response.data || [];

        const totalCobrado = cobros.reduce((sum, cobro) => {
          const facturaEnCobro = cobro.facturas.find(f => {
            const facturaIdEnCobro = typeof f.facturaId === 'object' ? f.facturaId._id : f.facturaId;
            return facturaIdEnCobro === factura._id;
          });

          return sum + (facturaEnCobro ? facturaEnCobro.montoCobrado : 0);
        }, 0);

        saldoPendiente = factura.total - totalCobrado;
      } catch (error) {
        console.error('Error calculando saldo para factura', factura.numeroFactura, ':', error);
      }

      montosIniciales[factura._id] = saldoPendiente;
    }

    setMontosFacturas(montosIniciales);
    setDatosCobro({
      metodoCobro: 'Efectivo',
      fechaCobro: new Date().toISOString().split('T')[0],
      notas: ''
    });
  };

  // ========================================
  // COBRO MÚLTIPLE (Nuevo Cobro)
  // ========================================

  const abrirModalCobroMultiple = () => {
    setMostrarModalCobroMultiple(true);
    setEstudianteBuscado('');
    setEstudianteSeleccionado(null);
    setFacturasEstudiante([]);
    setFacturasSeleccionadasMultiple([]);
    setMontosFacturas({});
    setDatosCobro({
      metodoCobro: 'Efectivo',
      fechaCobro: new Date().toISOString().split('T')[0],
      notas: ''
    });
  };

  const buscarEstudiante = () => {
    if (!estudianteBuscado.trim()) {
      mostrarMensaje('error', 'Ingrese un nombre de estudiante');
      return;
    }

    const estudiantesEncontrados = estudiantes.filter(est => 
      `${est.firstName} ${est.lastName}`.toLowerCase().includes(estudianteBuscado.toLowerCase())
    );

    if (estudiantesEncontrados.length === 0) {
      mostrarMensaje('error', 'No se encontraron estudiantes');
      return;
    }

    // Si hay un solo estudiante, seleccionarlo automáticamente
    if (estudiantesEncontrados.length === 1) {
      seleccionarEstudiante(estudiantesEncontrados[0]);
    } else {
      // Mostrar lista de estudiantes encontrados (simplificado: selecciona el primero)
      seleccionarEstudiante(estudiantesEncontrados[0]);
    }
  };

  const seleccionarEstudiante = async (estudiante) => {
    setEstudianteSeleccionado(estudiante);

    // Filtrar facturas pendientes de este estudiante
    const facturasEst = facturasPendientes.filter(f => {
      const estId = f.estudiante._id || f.estudiante;
      return estId === estudiante._id;
    });

    setFacturasEstudiante(facturasEst);
    setFacturasSeleccionadasMultiple([]);

    // Calcular saldos pendientes para cada factura
    const montosIniciales = {};
    for (const factura of facturasEst) {
      let saldoPendiente = factura.total;

      try {
        const response = await cobroAPI.obtenerCobrosPorFactura(factura._id);
        const cobros = response.data || [];

        const totalCobrado = cobros.reduce((sum, cobro) => {
          const facturaEnCobro = cobro.facturas.find(f => {
            const facturaIdEnCobro = typeof f.facturaId === 'object' ? f.facturaId._id : f.facturaId;
            return facturaIdEnCobro === factura._id;
          });

          return sum + (facturaEnCobro ? facturaEnCobro.montoCobrado : 0);
        }, 0);

        saldoPendiente = factura.total - totalCobrado;
      } catch (error) {
        console.error('Error calculando saldo para factura', factura.numeroFactura, ':', error);
      }

      montosIniciales[factura._id] = saldoPendiente;
    }

    setMontosFacturas(montosIniciales);
  };

  const toggleFacturaMultiple = (facturaId) => {
    setFacturasSeleccionadasMultiple(prev => {
      if (prev.includes(facturaId)) {
        return prev.filter(id => id !== facturaId);
      } else {
        return [...prev, facturaId];
      }
    });
  };

  const seleccionarTodasFacturasEstudiante = () => {
    if (facturasSeleccionadasMultiple.length === facturasEstudiante.length) {
      setFacturasSeleccionadasMultiple([]);
    } else {
      setFacturasSeleccionadasMultiple(facturasEstudiante.map(f => f._id));
    }
  };

  const calcularTotalAdeudado = () => {
    return facturasEstudiante.reduce((sum, f) => sum + f.total, 0);
  };

  const calcularTotalSeleccionadoMultiple = () => {
    return facturasEstudiante
      .filter(f => facturasSeleccionadasMultiple.includes(f._id))
      .reduce((sum, f) => sum + (montosFacturas[f._id] || 0), 0);
  };

  const actualizarMontoFactura = (facturaId, nuevoMonto) => {
    setMontosFacturas(prev => ({
      ...prev,
      [facturaId]: parseFloat(nuevoMonto) || 0
    }));
  };

  const registrarCobroMultiple = async () => {
    try {
      if (facturasSeleccionadasMultiple.length === 0) {
        mostrarMensaje('error', 'Seleccione al menos una factura');
        return;
      }

      // Validar que todos los montos sean mayores a cero
      const montosInvalidos = facturasSeleccionadasMultiple.filter(
        facturaId => !montosFacturas[facturaId] || montosFacturas[facturaId] <= 0
      );

      if (montosInvalidos.length > 0) {
        mostrarError('Error de Validación', 'Todos los montos a cobrar deben ser mayores a cero');
        return;
      }

      setLoading(true);

      const facturasConMontos = facturasSeleccionadasMultiple.map((facturaId) => {
        return {
          facturaId: facturaId,
          montoCobrado: parseFloat(montosFacturas[facturaId])
        };
      });

      const cobro = {
        estudiante: estudianteSeleccionado._id,
        facturas: facturasConMontos,
        metodoCobro: datosCobro.metodoCobro,
        fechaCobro: datosCobro.fechaCobro,
        notas: datosCobro.notas
      };

      const resultado = await cobroAPI.registrarCobro(cobro);

      mostrarMensaje('success', resultado.message || 'Cobro registrado exitosamente');

      setMostrarModalCobroMultiple(false);
      setFacturasSeleccionadasTabla([]); // Limpiar selección de tabla

      cargarFacturasPendientes();

    } catch (error) {
      console.error('Error registrando cobro:', error);
      const mensajeError = error.message || 'Error al registrar cobro';
      mostrarError('Error al Registrar Cobro', mensajeError);
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // UTILIDADES
  // ========================================

  const mostrarMensaje = (tipo, texto) => {
    setMensaje({ tipo, texto });
    setTimeout(() => setMensaje({ tipo: '', texto: '' }), 5000);
  };

  const mostrarError = (titulo, mensaje) => {
    setErrorModal({ titulo, mensaje });
    setMostrarModalError(true);
  };

  const getEstadoBadge = (estado) => {
    const clases = {
      'Pendiente': 'status-badge status-badge--scheduled',
      'Cobrada Parcialmente': 'status-badge status-badge--pending'
    };
    
    return <span className={clases[estado] || 'status-badge'}>{estado}</span>;
  };

  // ========================================
  // RENDER
  // ========================================

  return (
    <>
      {/* Mensaje de notificación */}
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
          boxShadow: 'var(--shadow-lg)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {mensaje.tipo === 'success' ? <FaCheckCircle /> : <FaExclamationTriangle />}
            <span>{mensaje.texto}</span>
          </div>
        </div>
      )}

      {/* Card principal */}
      <div className="dashboard-card">
        {/* Header con botones */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <h4 className="dashboard-card__title" style={{ margin: 0 }}>
            <FaReceipt style={{ marginRight: '0.5rem' }} />
            Facturas Pendientes de Cobro
          </h4>

          <button
            onClick={cargarFacturasPendientes}
            disabled={loading}
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: 'var(--border-radius)',
              border: '2px solid var(--primary)',
              backgroundColor: 'var(--bg-primary)',
              color: 'var(--primary)',
              fontSize: 'var(--font-size-sm)',
              fontWeight: 'var(--font-weight-semibold)',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              opacity: loading ? 0.6 : 1,
              transition: 'all var(--transition-fast)'
            }}
          >
            <FaSyncAlt />
            Actualizar
          </button>
        </div>

        {/* Filtros de búsqueda */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '1.5rem',
          padding: '1.5rem',
          backgroundColor: 'var(--bg-secondary)',
          borderRadius: 'var(--border-radius)',
          border: '1px solid var(--border-color)'
        }}>
          <div>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontSize: 'var(--font-size-sm)',
              fontWeight: 'var(--font-weight-medium)',
              color: 'var(--text-secondary)'
            }}>
              Número
            </label>
            <input
              type="text"
              placeholder="Buscar por número..."
              value={filtros.numero}
              onChange={(e) => handleFiltroChange('numero', e.target.value)}
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
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontSize: 'var(--font-size-sm)',
              fontWeight: 'var(--font-weight-medium)',
              color: 'var(--text-secondary)'
            }}>
              Estudiante
            </label>
            <input
              type="text"
              placeholder="Buscar por estudiante..."
              value={filtros.estudiante}
              onChange={(e) => handleFiltroChange('estudiante', e.target.value)}
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
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontSize: 'var(--font-size-sm)',
              fontWeight: 'var(--font-weight-medium)',
              color: 'var(--text-secondary)'
            }}>
              Período
            </label>
            <input
              type="text"
              placeholder="Ej: 2025-11"
              value={filtros.periodo}
              onChange={(e) => handleFiltroChange('periodo', e.target.value)}
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

          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button
              onClick={limpiarFiltros}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: 'var(--border-radius)',
                border: '1px solid var(--gray-300)',
                backgroundColor: 'var(--bg-primary)',
                color: 'var(--text-secondary)',
                fontSize: 'var(--font-size-sm)',
                cursor: 'pointer',
                fontWeight: 'var(--font-weight-medium)',
                transition: 'all var(--transition-fast)'
              }}
            >
              <FaTimes style={{ marginRight: '0.25rem' }} />
              Limpiar
            </button>
          </div>
        </div>

        {/* Tabla de facturas */}
        <div style={{ overflowX: 'auto' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <p style={{ color: 'var(--text-secondary)' }}>Cargando facturas...</p>
            </div>
          ) : facturasFiltradas.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <FaReceipt style={{ fontSize: '3rem', color: 'var(--text-secondary)', marginBottom: '1rem' }} />
              <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
                No hay facturas pendientes de cobro
              </p>
            </div>
          ) : (
            <>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: 'var(--font-size-sm)'
              }}>
                <thead>
                  <tr style={{
                    backgroundColor: 'var(--bg-secondary)',
                    borderBottom: '2px solid var(--border-color)'
                  }}>
                    <th style={{ padding: '1rem', textAlign: 'center', fontWeight: 'var(--font-weight-semibold)', width: '50px' }}>
                      <input
                        type="checkbox"
                        checked={facturasSeleccionadasTabla.length === facturasFiltradas.length && facturasFiltradas.length > 0}
                        onChange={seleccionarTodasFacturasTabla}
                        style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                      />
                    </th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 'var(--font-weight-semibold)' }}>Número</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 'var(--font-weight-semibold)' }}>Estudiante</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 'var(--font-weight-semibold)' }}>Período</th>
                    <th style={{ padding: '1rem', textAlign: 'right', fontWeight: 'var(--font-weight-semibold)' }}>Total</th>
                    <th style={{ padding: '1rem', textAlign: 'center', fontWeight: 'var(--font-weight-semibold)' }}>Estado</th>
                    <th style={{ padding: '1rem', textAlign: 'center', fontWeight: 'var(--font-weight-semibold)' }}>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {facturasFiltradas.map((factura) => (
                    <tr
                      key={factura._id}
                      style={{
                        borderBottom: '1px solid var(--border-color)',
                        backgroundColor: facturasSeleccionadasTabla.includes(factura._id) ? 'var(--success-light)' : 'transparent',
                        transition: 'background-color var(--transition-fast)'
                      }}
                    >
                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                        <input
                          type="checkbox"
                          checked={facturasSeleccionadasTabla.includes(factura._id)}
                          onChange={() => toggleFacturaTabla(factura._id)}
                          style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                        />
                      </td>
                      <td style={{ padding: '1rem', fontFamily: 'monospace' }}>{factura.numeroFactura}</td>
                      <td style={{ padding: '1rem' }}>
                        {factura.estudiante?.firstName} {factura.estudiante?.lastName}
                      </td>
                      <td style={{ padding: '1rem' }}>{factura.periodoFacturado || '-'}</td>
                      <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 'var(--font-weight-semibold)' }}>
                        ${factura.total.toLocaleString()}
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                        {getEstadoBadge(factura.estado)}
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                        <button
                          onClick={() => abrirModalCobroIndividual(factura)}
                          disabled={loading}
                          style={{
                            padding: '0.5rem 1rem',
                            borderRadius: 'var(--border-radius)',
                            border: 'none',
                            backgroundColor: 'var(--success)',
                            color: 'white',
                            fontSize: 'var(--font-size-sm)',
                            fontWeight: 'var(--font-weight-semibold)',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            opacity: loading ? 0.6 : 1,
                            transition: 'all var(--transition-fast)'
                          }}
                        >
                          <FaDollarSign />
                          Cobrar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Botón de cobrar seleccionadas */}
              {facturasSeleccionadasTabla.length > 0 && (
                <div style={{ marginTop: '1.5rem', textAlign: 'right' }}>
                  <button
                    onClick={cobrarSeleccionadas}
                    disabled={loading}
                    className="cta-btn"
                    style={{
                      padding: '0.75rem 1.5rem',
                      borderRadius: 'var(--border-radius)',
                      border: 'none',
                      backgroundColor: 'var(--success)',
                      color: 'white',
                      fontSize: 'var(--font-size-sm)',
                      fontWeight: 'var(--font-weight-semibold)',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      opacity: loading ? 0.6 : 1
                    }}
                  >
                    <FaDollarSign />
                    Cobrar Seleccionadas ({facturasSeleccionadasTabla.length})
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ========================================
          MODAL: COBRO INDIVIDUAL
          ======================================== */}
      {mostrarModalCobroIndividual && facturaSeleccionadaIndividual && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <div style={{
            backgroundColor: 'var(--card-bg)',
            borderRadius: 'var(--border-radius-lg)',
            padding: '2rem',
            maxWidth: '500px',
            width: '90%',
            boxShadow: 'var(--shadow-xl)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: 'var(--success-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <FaDollarSign style={{ fontSize: '1.5rem', color: 'var(--success)' }} />
              </div>
              <h2 style={{
                fontSize: 'var(--font-size-xl)',
                fontWeight: 'var(--font-weight-bold)',
                color: 'var(--primary)',
                margin: 0
              }}>
                Cobrar Factura
              </h2>
            </div>

            <div style={{
              padding: '1rem',
              backgroundColor: 'var(--info-light)',
              borderRadius: 'var(--border-radius)',
              marginBottom: '1.5rem',
              border: '1px solid var(--info)'
            }}>
              <p style={{ margin: '0 0 0.5rem 0', fontSize: 'var(--font-size-sm)', color: 'var(--text-primary)' }}>
                <strong>Factura:</strong> {facturaSeleccionadaIndividual.numeroFactura}
              </p>
              <p style={{ margin: '0 0 0.5rem 0', fontSize: 'var(--font-size-sm)', color: 'var(--text-primary)' }}>
                <strong>Estudiante:</strong> {facturaSeleccionadaIndividual.estudiante?.firstName} {facturaSeleccionadaIndividual.estudiante?.lastName}
              </p>
              <p style={{ margin: '0.5rem 0 0 0', fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--text-primary)' }}>
                <strong>Total Factura:</strong> ${facturaSeleccionadaIndividual.total.toLocaleString()}
              </p>
              {facturaSeleccionadaIndividual.estado === 'Cobrada Parcialmente' && (
                <p style={{ margin: '0.5rem 0 0 0', fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--error)' }}>
                  <strong>Saldo Pendiente:</strong> ${datosCobro.montoCobrar.toLocaleString()}
                </p>
              )}
            </div>

            <div style={{ display: 'grid', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)' }}>
                  <FaDollarSign style={{ marginRight: '0.25rem' }} />
                  Monto a Cobrar *
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={datosCobro.montoCobrar}
                  onChange={(e) => setDatosCobro({ ...datosCobro, montoCobrar: parseFloat(e.target.value) || 0 })}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: 'var(--border-radius)',
                    border: '1px solid var(--input-border)',
                    backgroundColor: 'var(--input-bg)',
                    color: 'var(--text-primary)',
                    fontSize: 'var(--font-size-base)',
                    fontWeight: 'var(--font-weight-semibold)'
                  }}
                />
                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                  Puede cobrar parcialmente. Máximo: ${facturaSeleccionadaIndividual.total.toLocaleString()}
                </p>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)' }}>
                  Método de Cobro *
                </label>
                <select
                  value={datosCobro.metodoCobro}
                  onChange={(e) => setDatosCobro({ ...datosCobro, metodoCobro: e.target.value })}
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
                  <option value="Efectivo">Efectivo</option>
                  <option value="Tarjeta">Tarjeta</option>
                  <option value="Transferencia">Transferencia</option>
                  <option value="Mercado Pago">Mercado Pago</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)' }}>
                  <FaCalendar style={{ marginRight: '0.25rem' }} />
                  Fecha de Cobro *
                </label>
                <input
                  type="date"
                  value={datosCobro.fechaCobro}
                  onChange={(e) => setDatosCobro({ ...datosCobro, fechaCobro: e.target.value })}
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
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)' }}>
                  Notas (opcional)
                </label>
                <textarea
                  value={datosCobro.notas}
                  onChange={(e) => setDatosCobro({ ...datosCobro, notas: e.target.value })}
                  placeholder="Observaciones adicionales..."
                  rows="3"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: 'var(--border-radius)',
                    border: '1px solid var(--input-border)',
                    backgroundColor: 'var(--input-bg)',
                    color: 'var(--text-primary)',
                    fontSize: 'var(--font-size-sm)',
                    resize: 'vertical'
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setMostrarModalCobroIndividual(false)}
                disabled={loading}
                style={{
                  padding: '0.75rem 2rem',
                  borderRadius: 'var(--border-radius)',
                  border: '2px solid var(--gray-300)',
                  backgroundColor: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  fontSize: 'var(--font-size-base)',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontWeight: 'var(--font-weight-semibold)',
                  opacity: loading ? 0.6 : 1
                }}
              >
                Cancelar
              </button>
              <button
                onClick={registrarCobroIndividual}
                disabled={loading}
                className="cta-btn"
                style={{
                  padding: '0.75rem 2rem',
                  borderRadius: 'var(--border-radius)',
                  border: 'none',
                  backgroundColor: loading ? 'var(--gray-400)' : 'var(--success)',
                  color: 'white',
                  fontSize: 'var(--font-size-base)',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontWeight: 'var(--font-weight-semibold)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  opacity: loading ? 0.6 : 1
                }}
              >
                <FaCheckCircle />
                {loading ? 'Registrando...' : 'Confirmar Cobro'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================
          MODAL: COBRO MÚLTIPLE (NUEVO COBRO)
          ======================================== */}
      {mostrarModalCobroMultiple && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1rem',
          overflowY: 'auto'
        }}>
          <div style={{
            backgroundColor: 'var(--card-bg)',
            borderRadius: 'var(--border-radius-lg)',
            padding: '2rem',
            maxWidth: '800px',
            width: '100%',
            boxShadow: 'var(--shadow-xl)',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: 'var(--success-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <FaPlus style={{ fontSize: '1.5rem', color: 'var(--success)' }} />
              </div>
              <h2 style={{
                fontSize: 'var(--font-size-xl)',
                fontWeight: 'var(--font-weight-bold)',
                color: 'var(--primary)',
                margin: 0
              }}>
                Registrar Nuevo Cobro
              </h2>
            </div>

            {/* Buscar estudiante */}
            {!estudianteSeleccionado && (
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)' }}>
                  <FaUser style={{ marginRight: '0.25rem' }} />
                  Buscar Estudiante
                </label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="text"
                    placeholder="Nombre del estudiante..."
                    value={estudianteBuscado}
                    onChange={(e) => setEstudianteBuscado(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && buscarEstudiante()}
                    style={{
                      flex: 1,
                      padding: '0.75rem',
                      borderRadius: 'var(--border-radius)',
                      border: '1px solid var(--input-border)',
                      backgroundColor: 'var(--input-bg)',
                      color: 'var(--text-primary)',
                      fontSize: 'var(--font-size-sm)'
                    }}
                  />
                  <button
                    onClick={buscarEstudiante}
                    style={{
                      padding: '0.75rem 1.5rem',
                      borderRadius: 'var(--border-radius)',
                      border: 'none',
                      backgroundColor: 'var(--primary)',
                      color: 'white',
                      fontSize: 'var(--font-size-sm)',
                      fontWeight: 'var(--font-weight-semibold)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    <FaSearch />
                    Buscar
                  </button>
                </div>
              </div>
            )}

            {/* Estudiante seleccionado y sus facturas */}
            {estudianteSeleccionado && (
              <>
                <div style={{
                  padding: '1rem',
                  backgroundColor: 'var(--info-light)',
                  borderRadius: 'var(--border-radius)',
                  marginBottom: '1.5rem',
                  border: '1px solid var(--info)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <p style={{ margin: 0, fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-semibold)' }}>
                      {estudianteSeleccionado.firstName} {estudianteSeleccionado.lastName}
                    </p>
                    <button
                      onClick={() => {
                        setEstudianteSeleccionado(null);
                        setFacturasEstudiante([]);
                        setFacturasSeleccionadasMultiple([]);
                      }}
                      style={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: 'var(--border-radius)',
                        border: 'none',
                        backgroundColor: 'var(--gray-300)',
                        color: 'var(--text-primary)',
                        fontSize: 'var(--font-size-xs)',
                        cursor: 'pointer'
                      }}
                    >
                      Cambiar
                    </button>
                  </div>
                  <p style={{ margin: '0.5rem 0 0 0', fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-bold)', color: 'var(--error)' }}>
                    Total Adeudado: ${calcularTotalAdeudado().toLocaleString()}
                  </p>
                </div>

                {facturasEstudiante.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2rem' }}>
                    <p style={{ color: 'var(--text-secondary)' }}>
                      Este estudiante no tiene facturas pendientes
                    </p>
                  </div>
                ) : (
                  <>
                    <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h3 style={{ margin: 0, fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-semibold)' }}>
                        Facturas Pendientes ({facturasEstudiante.length})
                      </h3>
                      <button
                        onClick={seleccionarTodasFacturasEstudiante}
                        style={{
                          padding: '0.5rem 1rem',
                          borderRadius: 'var(--border-radius)',
                          border: '1px solid var(--primary)',
                          backgroundColor: 'transparent',
                          color: 'var(--primary)',
                          fontSize: 'var(--font-size-xs)',
                          cursor: 'pointer',
                          fontWeight: 'var(--font-weight-medium)'
                        }}
                      >
                        {facturasSeleccionadasMultiple.length === facturasEstudiante.length ? 'Deseleccionar Todas' : 'Seleccionar Todas'}
                      </button>
                    </div>

                    <div style={{
                      maxHeight: '400px',
                      overflowY: 'auto',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--border-radius)',
                      marginBottom: '1.5rem'
                    }}>
                      {facturasEstudiante.map((factura) => (
                        <div
                          key={factura._id}
                          style={{
                            padding: '1rem',
                            borderBottom: '1px solid var(--border-color)',
                            backgroundColor: facturasSeleccionadasMultiple.includes(factura._id) ? 'var(--success-light)' : 'transparent',
                            transition: 'background-color var(--transition-fast)'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
                            <input
                              type="checkbox"
                              checked={facturasSeleccionadasMultiple.includes(factura._id)}
                              onChange={() => toggleFacturaMultiple(factura._id)}
                              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                            />
                            <div style={{ flex: 1 }}>
                              <p style={{ margin: 0, fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)' }}>
                                {factura.numeroFactura}
                              </p>
                              <p style={{ margin: '0.25rem 0 0 0', fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>
                                Período: {factura.periodoFacturado || 'N/A'} | Total: ${factura.total.toLocaleString()}
                              </p>
                            </div>
                          </div>
                          {facturasSeleccionadasMultiple.includes(factura._id) && (
                            <div style={{ marginLeft: '2rem', marginTop: '0.5rem' }}>
                              <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-medium)', color: 'var(--text-secondary)' }}>
                                Monto a Cobrar:
                              </label>
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={montosFacturas[factura._id] || 0}
                                onChange={(e) => actualizarMontoFactura(factura._id, e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                                style={{
                                  width: '100%',
                                  padding: '0.5rem',
                                  borderRadius: 'var(--border-radius)',
                                  border: '1px solid var(--input-border)',
                                  backgroundColor: 'var(--input-bg)',
                                  color: 'var(--text-primary)',
                                  fontSize: 'var(--font-size-sm)',
                                  fontWeight: 'var(--font-weight-semibold)'
                                }}
                              />
                              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', marginTop: '0.25rem', marginBottom: 0 }}>
                                Máximo: ${factura.total.toLocaleString()}
                                {factura.estado === 'Cobrada Parcialmente' && ' (saldo pendiente)'}
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {facturasSeleccionadasMultiple.length > 0 && (
                      <div style={{
                        padding: '1rem',
                        backgroundColor: 'var(--success-light)',
                        borderRadius: 'var(--border-radius)',
                        marginBottom: '1.5rem',
                        border: '1px solid var(--success)'
                      }}>
                        <p style={{ margin: 0, fontSize: 'var(--font-size-sm)', color: 'var(--text-primary)' }}>
                          <strong>{facturasSeleccionadasMultiple.length}</strong> factura(s) seleccionada(s)
                        </p>
                        <p style={{ margin: '0.5rem 0 0 0', fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-bold)', color: 'var(--success-dark)' }}>
                          Total a cobrar: ${calcularTotalSeleccionadoMultiple().toLocaleString()}
                        </p>
                      </div>
                    )}

                    <div style={{ display: 'grid', gap: '1rem', marginBottom: '1.5rem' }}>
                      <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)' }}>
                          Método de Cobro *
                        </label>
                        <select
                          value={datosCobro.metodoCobro}
                          onChange={(e) => setDatosCobro({ ...datosCobro, metodoCobro: e.target.value })}
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
                          <option value="Efectivo">Efectivo</option>
                          <option value="Tarjeta">Tarjeta</option>
                          <option value="Transferencia">Transferencia</option>
                          <option value="Mercado Pago">Mercado Pago</option>
                          <option value="Otro">Otro</option>
                        </select>
                      </div>

                      <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)' }}>
                          <FaCalendar style={{ marginRight: '0.25rem' }} />
                          Fecha de Cobro *
                        </label>
                        <input
                          type="date"
                          value={datosCobro.fechaCobro}
                          onChange={(e) => setDatosCobro({ ...datosCobro, fechaCobro: e.target.value })}
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
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)' }}>
                          Notas (opcional)
                        </label>
                        <textarea
                          value={datosCobro.notas}
                          onChange={(e) => setDatosCobro({ ...datosCobro, notas: e.target.value })}
                          placeholder="Observaciones adicionales..."
                          rows="3"
                          style={{
                            width: '100%',
                            padding: '0.75rem',
                            borderRadius: 'var(--border-radius)',
                            border: '1px solid var(--input-border)',
                            backgroundColor: 'var(--input-bg)',
                            color: 'var(--text-primary)',
                            fontSize: 'var(--font-size-sm)',
                            resize: 'vertical'
                          }}
                        />
                      </div>
                    </div>
                  </>
                )}
              </>
            )}

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setMostrarModalCobroMultiple(false)}
                disabled={loading}
                style={{
                  padding: '0.75rem 2rem',
                  borderRadius: 'var(--border-radius)',
                  border: '2px solid var(--gray-300)',
                  backgroundColor: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  fontSize: 'var(--font-size-base)',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontWeight: 'var(--font-weight-semibold)',
                  opacity: loading ? 0.6 : 1
                }}
              >
                Cancelar
              </button>
              {estudianteSeleccionado && facturasSeleccionadasMultiple.length > 0 && (
                <button
                  onClick={registrarCobroMultiple}
                  disabled={loading}
                  className="cta-btn"
                  style={{
                    padding: '0.75rem 2rem',
                    borderRadius: 'var(--border-radius)',
                    border: 'none',
                    backgroundColor: loading ? 'var(--gray-400)' : 'var(--success)',
                    color: 'white',
                    fontSize: 'var(--font-size-base)',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontWeight: 'var(--font-weight-semibold)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    opacity: loading ? 0.6 : 1
                  }}
                >
                  <FaCheckCircle />
                  {loading ? 'Registrando...' : 'Confirmar Cobro'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================
          MODAL: ERROR
          ======================================== */}
      {mostrarModalError && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000
        }}>
          <div style={{
            backgroundColor: 'var(--card-bg)',
            borderRadius: 'var(--border-radius-lg)',
            padding: '2rem',
            maxWidth: '500px',
            width: '90%',
            boxShadow: 'var(--shadow-xl)',
            border: '2px solid var(--error)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: 'var(--error-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <FaExclamationTriangle style={{ fontSize: '1.5rem', color: 'var(--error)' }} />
              </div>
              <h2 style={{
                fontSize: 'var(--font-size-xl)',
                fontWeight: 'var(--font-weight-bold)',
                color: 'var(--error)',
                margin: 0
              }}>
                {errorModal.titulo}
              </h2>
            </div>

            <div style={{
              padding: '1.5rem',
              backgroundColor: 'var(--error-light)',
              borderRadius: 'var(--border-radius)',
              marginBottom: '1.5rem',
              border: '1px solid var(--error)'
            }}>
              <p style={{
                fontSize: 'var(--font-size-base)',
                color: 'var(--text-primary)',
                lineHeight: 1.6,
                margin: 0
              }}>
                {errorModal.mensaje}
              </p>
            </div>

            <div style={{ textAlign: 'right' }}>
              <button
                onClick={() => setMostrarModalError(false)}
                className="cta-btn"
                style={{
                  padding: '0.75rem 2rem',
                  borderRadius: 'var(--border-radius)',
                  border: 'none',
                  backgroundColor: 'var(--error)',
                  color: 'white',
                  fontSize: 'var(--font-size-base)',
                  cursor: 'pointer',
                  fontWeight: 'var(--font-weight-semibold)'
                }}
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CollectionsView;