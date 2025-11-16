import React, { useState, useEffect } from 'react'
import facturaAPI from '../../services/facturaApi'
import cobroAPI from '../../services/cobroApi'
import { FaTimes, FaFileInvoice, FaCalendarAlt, FaMoneyBillWave, FaReceipt, FaDollarSign } from 'react-icons/fa'
import '../../styles/modal.css'

const FacturaDetailModal = ({ facturaId, onClose }) => {
  const [factura, setFactura] = useState(null)
  const [cobros, setCobros] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    cargarFactura()
  }, [facturaId])

  const cargarFactura = async () => {
    try {
      setLoading(true)
      setError(null)

      // Cargar la factura
      const facturaResponse = await facturaAPI.obtenerFacturaPorId(facturaId)
      if (facturaResponse?.success && facturaResponse?.data) {
        setFactura(facturaResponse.data)
      }

      // Cargar los cobros de la factura
      const cobrosResponse = await cobroAPI.getMisCobros()
      if (cobrosResponse?.success && cobrosResponse?.data) {
        // Filtrar solo los cobros que incluyen esta factura
        const cobrosDeFactura = cobrosResponse.data.filter(cobro =>
          cobro.facturas?.some(f => {
            const fId = f.facturaId?._id || f.facturaId
            return fId === facturaId || fId.toString() === facturaId
          })
        ).map(cobro => {
          // Para cada cobro, extraer solo el monto que corresponde a esta factura
          const facturaEnCobro = cobro.facturas.find(f => {
            const fId = f.facturaId?._id || f.facturaId
            return fId === facturaId || fId.toString() === facturaId
          })

          return {
            _id: cobro._id,
            numeroRecibo: cobro.numeroRecibo,
            fechaCobro: cobro.fechaCobro,
            metodoCobro: cobro.metodoCobro,
            montoCobrado: facturaEnCobro?.montoCobrado || 0,
            notas: cobro.notas
          }
        })

        setCobros(cobrosDeFactura)
      }
    } catch (error) {
      console.error('Error cargando factura:', error)
      setError(error.message || 'Error al cargar el detalle de la factura')
    } finally {
      setLoading(false)
    }
  }

  const formatFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const totalCobrado = cobros.reduce((sum, cobro) => sum + cobro.montoCobrado, 0)
  const saldoPendiente = factura ? factura.total - totalCobrado : 0

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto' }}>
        <div className="modal-header">
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
            <FaFileInvoice />
            Detalle de Factura
          </h2>
          <button className="modal-close" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="modal-body">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              Cargando detalle de la factura...
            </div>
          ) : error ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#dc3545' }}>
              {error}
            </div>
          ) : factura ? (
            <div>
              {/* Información de la Factura */}
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
                      Número de Factura
                    </div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0F5C8C' }}>
                      {factura.numeroFactura}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.85rem', color: '#6c757d', marginBottom: '0.25rem' }}>
                      Estado
                    </div>
                    <div style={{
                      display: 'inline-block',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '12px',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      marginTop: '0.25rem',
                      background: factura.estado === 'Cobrada' ? '#d4edda' :
                                 factura.estado === 'Cobrada Parcialmente' ? '#fff3cd' : '#d1ecf1',
                      color: factura.estado === 'Cobrada' ? '#155724' :
                             factura.estado === 'Cobrada Parcialmente' ? '#856404' : '#0c5460',
                      border: factura.estado === 'Cobrada Parcialmente' ? '2px solid #ff9800' : ''
                    }}>
                      {factura.estado}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.85rem', color: '#6c757d', marginBottom: '0.25rem' }}>
                      Total Factura
                    </div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0F5C8C' }}>
                      ${factura.total.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.85rem', color: '#6c757d', marginBottom: '0.25rem' }}>
                      Período
                    </div>
                    <div style={{ fontSize: '1rem', fontWeight: 600 }}>
                      {factura.periodoFacturado}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.85rem', color: '#6c757d', marginBottom: '0.25rem' }}>
                      Fecha Emisión
                    </div>
                    <div style={{ fontSize: '0.9rem' }}>
                      {formatFecha(factura.fechaEmision)}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.85rem', color: '#6c757d', marginBottom: '0.25rem' }}>
                      Fecha Vencimiento
                    </div>
                    <div style={{ fontSize: '0.9rem' }}>
                      {formatFecha(factura.fechaVencimiento)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Items de la Factura */}
              {factura.itemFacturaSchema && factura.itemFacturaSchema.length > 0 && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '0.75rem', color: '#2c3e50' }}>
                    Items de la Factura
                  </h3>
                  <div style={{
                    background: 'white',
                    border: '1px solid #e1e5e9',
                    borderRadius: '6px',
                    overflow: 'hidden'
                  }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #e1e5e9' }}>
                          <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.85rem', fontWeight: 600 }}>
                            Descripción
                          </th>
                          <th style={{ padding: '0.75rem', textAlign: 'center', fontSize: '0.85rem', fontWeight: 600 }}>
                            Cantidad
                          </th>
                          <th style={{ padding: '0.75rem', textAlign: 'right', fontSize: '0.85rem', fontWeight: 600 }}>
                            Precio Unit.
                          </th>
                          <th style={{ padding: '0.75rem', textAlign: 'right', fontSize: '0.85rem', fontWeight: 600 }}>
                            Subtotal
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {factura.itemFacturaSchema.map((item, index) => (
                          <tr key={index} style={{ borderBottom: '1px solid #f1f1f1' }}>
                            <td style={{ padding: '0.75rem', fontSize: '0.9rem' }}>{item.descripcion}</td>
                            <td style={{ padding: '0.75rem', textAlign: 'center', fontSize: '0.9rem' }}>{item.cantidad}</td>
                            <td style={{ padding: '0.75rem', textAlign: 'right', fontSize: '0.9rem' }}>
                              ${item.precioUnitario.toLocaleString()}
                            </td>
                            <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 600, fontSize: '0.9rem' }}>
                              ${item.subtotal.toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Cobros Registrados */}
              {cobros.length > 0 && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '0.75rem', color: '#2c3e50', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <FaReceipt />
                    Cobros Registrados
                  </h3>
                  <div style={{
                    background: 'white',
                    border: '1px solid #e1e5e9',
                    borderRadius: '6px',
                    overflow: 'hidden'
                  }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #e1e5e9' }}>
                          <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.85rem', fontWeight: 600 }}>
                            Recibo
                          </th>
                          <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.85rem', fontWeight: 600 }}>
                            Fecha
                          </th>
                          <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.85rem', fontWeight: 600 }}>
                            Método
                          </th>
                          <th style={{ padding: '0.75rem', textAlign: 'right', fontSize: '0.85rem', fontWeight: 600 }}>
                            Monto
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {cobros.map((cobro) => (
                          <tr key={cobro._id} style={{ borderBottom: '1px solid #f1f1f1' }}>
                            <td style={{ padding: '0.75rem', fontSize: '0.9rem', fontWeight: 500 }}>
                              {cobro.numeroRecibo}
                            </td>
                            <td style={{ padding: '0.75rem', fontSize: '0.9rem' }}>
                              {formatFecha(cobro.fechaCobro)}
                            </td>
                            <td style={{ padding: '0.75rem', fontSize: '0.9rem' }}>
                              <span style={{
                                padding: '0.25rem 0.5rem',
                                borderRadius: '6px',
                                background: '#e7f3ff',
                                color: '#0F5C8C',
                                fontSize: '0.85rem',
                                fontWeight: 600
                              }}>
                                {cobro.metodoCobro}
                              </span>
                            </td>
                            <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 700, fontSize: '1rem', color: '#28a745' }}>
                              ${cobro.montoCobrado.toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr style={{ background: '#f8f9fa', borderTop: '2px solid #0F5C8C' }}>
                          <td colSpan="3" style={{ padding: '1rem', textAlign: 'right', fontWeight: 700, fontSize: '1rem' }}>
                            TOTAL COBRADO:
                          </td>
                          <td style={{ padding: '1rem', textAlign: 'right', fontSize: '1.25rem', fontWeight: 700, color: '#28a745' }}>
                            ${totalCobrado.toLocaleString()}
                          </td>
                        </tr>
                        {factura.estado === 'Cobrada Parcialmente' && saldoPendiente > 0 && (
                          <tr style={{ background: '#fff5f5' }}>
                            <td colSpan="3" style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 700, fontSize: '1rem', color: '#dc3545' }}>
                              SALDO PENDIENTE:
                            </td>
                            <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontSize: '1.25rem', fontWeight: 700, color: '#dc3545' }}>
                              ${saldoPendiente.toLocaleString()}
                            </td>
                          </tr>
                        )}
                      </tfoot>
                    </table>
                  </div>
                </div>
              )}

              {/* Botón Cerrar */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
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
              No se encontró la factura
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default FacturaDetailModal
