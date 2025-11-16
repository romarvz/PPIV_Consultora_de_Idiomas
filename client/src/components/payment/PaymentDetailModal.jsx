import React, { useState, useEffect } from 'react'
import cobroAPI from '../../services/cobroApi'
import { FaTimes, FaFileInvoice, FaCalendarAlt, FaMoneyBillWave, FaReceipt } from 'react-icons/fa'
import '../../styles/modal.css'

const PaymentDetailModal = ({ cobroId, onClose }) => {
  const [cobro, setCobro] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    cargarCobro()
  }, [cobroId])

  const cargarCobro = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await cobroAPI.obtenerCobroPorId(cobroId)

      if (response?.success && response?.data) {
        setCobro(response.data)
      }
    } catch (error) {
      console.error('Error cargando cobro:', error)
      setError(error.message || 'Error al cargar el detalle del pago')
    } finally {
      setLoading(false)
    }
  }

  const formatFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-AR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '700px' }}>
        <div className="modal-header">
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
            <FaReceipt />
            Detalle del Pago
          </h2>
          <button className="modal-close" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="modal-body">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              Cargando detalle del pago...
            </div>
          ) : error ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#dc3545' }}>
              {error}
            </div>
          ) : cobro ? (
            <div>
              {/* Información del Recibo */}
              <div style={{
                background: '#f8f9fa',
                padding: '1.5rem',
                borderRadius: '8px',
                marginBottom: '1.5rem',
                border: '2px solid #0F5C8C'
              }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <div style={{ fontSize: '0.85rem', color: '#6c757d', marginBottom: '0.25rem' }}>
                      Número de Recibo
                    </div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0F5C8C' }}>
                      {cobro.numeroRecibo}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.85rem', color: '#6c757d', marginBottom: '0.25rem' }}>
                      Monto Total
                    </div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#28a745' }}>
                      ${cobro.montoTotal.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.85rem', color: '#6c757d', marginBottom: '0.25rem' }}>
                      Fecha de Pago
                    </div>
                    <div style={{ fontSize: '1rem', fontWeight: 600 }}>
                      {formatFecha(cobro.fechaCobro)}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.85rem', color: '#6c757d', marginBottom: '0.25rem' }}>
                      Método de Pago
                    </div>
                    <div style={{ fontSize: '1rem', fontWeight: 600 }}>
                      {cobro.metodoCobro}
                    </div>
                  </div>
                </div>
              </div>

              {/* Datos del Estudiante */}
              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.75rem', color: '#2c3e50' }}>
                  Datos del Estudiante
                </h3>
                <div style={{
                  background: 'white',
                  border: '1px solid #e1e5e9',
                  borderRadius: '6px',
                  padding: '1rem'
                }}>
                  <div style={{ marginBottom: '0.5rem' }}>
                    <strong>Nombre:</strong> {cobro.estudiante?.firstName} {cobro.estudiante?.lastName}
                  </div>
                  {cobro.estudiante?.email && (
                    <div style={{ marginBottom: '0.5rem' }}>
                      <strong>Email:</strong> {cobro.estudiante.email}
                    </div>
                  )}
                  {cobro.estudiante?.dni && (
                    <div>
                      <strong>DNI:</strong> {cobro.estudiante.dni}
                    </div>
                  )}
                </div>
              </div>

              {/* Facturas Pagadas */}
              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.75rem', color: '#2c3e50', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FaFileInvoice />
                  Facturas Pagadas
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {cobro.facturas && cobro.facturas.length > 0 ? (
                    cobro.facturas.map((factura, index) => (
                      <div
                        key={index}
                        style={{
                          background: 'white',
                          border: '1px solid #e1e5e9',
                          borderRadius: '6px',
                          padding: '1rem',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>
                            Factura {factura.facturaId?.numeroFactura || 'N/A'}
                          </div>
                          {factura.facturaId?.periodoFacturado && (
                            <div style={{ fontSize: '0.85rem', color: '#6c757d' }}>
                              {factura.facturaId.periodoFacturado}
                            </div>
                          )}
                          {factura.facturaId?.estado && (
                            <div style={{ marginTop: '0.25rem' }}>
                              <span style={{
                                display: 'inline-block',
                                padding: '0.25rem 0.5rem',
                                borderRadius: '12px',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                background: factura.facturaId.estado === 'Cobrada' ? '#d4edda' :
                                           factura.facturaId.estado === 'Cobrada Parcialmente' ? '#fff3cd' : '#d1ecf1',
                                color: factura.facturaId.estado === 'Cobrada' ? '#155724' :
                                       factura.facturaId.estado === 'Cobrada Parcialmente' ? '#856404' : '#0c5460'
                              }}>
                                {factura.facturaId.estado}
                              </span>
                            </div>
                          )}
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '0.85rem', color: '#6c757d', marginBottom: '0.25rem' }}>
                            Monto Pagado
                          </div>
                          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#28a745' }}>
                            ${factura.montoCobrado.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{ textAlign: 'center', padding: '1rem', color: '#6c757d' }}>
                      No hay facturas asociadas
                    </div>
                  )}
                </div>
              </div>

              {/* Notas */}
              {cobro.notas && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '0.75rem', color: '#2c3e50' }}>
                    Notas
                  </h3>
                  <div style={{
                    background: 'white',
                    border: '1px solid #e1e5e9',
                    borderRadius: '6px',
                    padding: '1rem',
                    whiteSpace: 'pre-wrap'
                  }}>
                    {cobro.notas}
                  </div>
                </div>
              )}

              {/* Botón Cerrar */}
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  onClick={onClose}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: '#0F5C8C',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '1rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Cerrar
                </button>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#6c757d' }}>
              No se encontró el cobro
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default PaymentDetailModal
