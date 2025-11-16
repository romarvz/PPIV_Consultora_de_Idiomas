import React, { useState, useEffect } from 'react'
import facturaAPI from '../../services/facturaApi'
import cobroAPI from '../../services/cobroApi'
import { FaTimes, FaDollarSign, FaFileInvoice, FaCheckCircle } from 'react-icons/fa'
import '../../styles/modal.css'

const StudentPaymentModal = ({ onClose, onSuccess }) => {
  const [facturas, setFacturas] = useState([])
  const [loading, setLoading] = useState(true)
  const [procesando, setProcesando] = useState(false)
  const [error, setError] = useState(null)
  const [metodoCobro, setMetodoCobro] = useState('Mercado Pago')
  const [notas, setNotas] = useState('')

  // Estado para manejar las facturas seleccionadas y sus montos
  const [facturasSeleccionadas, setFacturasSeleccionadas] = useState({})
  // { facturaId: { seleccionada: true, montoParcial: null, pagoCompleto: true } }

  useEffect(() => {
    cargarFacturas()
  }, [])

  const cargarFacturas = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await facturaAPI.getMisFacturas()

      if (response?.success && response?.data) {
        // Filtrar solo facturas pendientes o parcialmente cobradas
        const facturasPendientes = response.data.filter(f =>
          f.estado === 'Pendiente' ||
          f.estado === 'Cobrada Parcialmente' ||
          f.estado === 'Vencida'
        )
        setFacturas(facturasPendientes)
      }
    } catch (error) {
      console.error('Error cargando facturas:', error)
      setError(error.message || 'Error al cargar facturas')
    } finally {
      setLoading(false)
    }
  }

  const toggleFactura = (facturaId, facturaTotal) => {
    setFacturasSeleccionadas(prev => {
      const nueva = { ...prev }
      if (nueva[facturaId]) {
        // Si ya está seleccionada, la deseleccionamos
        delete nueva[facturaId]
      } else {
        // Si no está seleccionada, la seleccionamos con pago completo por defecto
        nueva[facturaId] = {
          seleccionada: true,
          pagoCompleto: true,
          montoParcial: facturaTotal,
          montoTotal: facturaTotal
        }
      }
      return nueva
    })
  }

  const togglePagoCompleto = (facturaId, facturaTotal) => {
    setFacturasSeleccionadas(prev => ({
      ...prev,
      [facturaId]: {
        ...prev[facturaId],
        pagoCompleto: !prev[facturaId].pagoCompleto,
        montoParcial: !prev[facturaId].pagoCompleto ? facturaTotal : prev[facturaId].montoParcial
      }
    }))
  }

  const actualizarMontoParcial = (facturaId, monto) => {
    const montoNumerico = parseFloat(monto) || 0
    setFacturasSeleccionadas(prev => ({
      ...prev,
      [facturaId]: {
        ...prev[facturaId],
        montoParcial: montoNumerico
      }
    }))
  }

  const calcularTotal = () => {
    return Object.entries(facturasSeleccionadas).reduce((total, [facturaId, datos]) => {
      if (datos.seleccionada) {
        return total + (datos.pagoCompleto ? datos.montoTotal : datos.montoParcial)
      }
      return total
    }, 0)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validaciones
    const seleccionadas = Object.entries(facturasSeleccionadas).filter(([_, datos]) => datos.seleccionada)

    if (seleccionadas.length === 0) {
      setError('Debes seleccionar al menos una factura')
      return
    }

    // Validar que los montos parciales sean válidos
    for (const [facturaId, datos] of seleccionadas) {
      if (!datos.pagoCompleto) {
        if (!datos.montoParcial || datos.montoParcial <= 0) {
          setError('El monto parcial debe ser mayor a 0')
          return
        }
        if (datos.montoParcial > datos.montoTotal) {
          setError('El monto parcial no puede ser mayor al total de la factura')
          return
        }
      }
    }

    try {
      setProcesando(true)
      setError(null)

      // Preparar datos para el cobro
      const facturasParaCobro = seleccionadas.map(([facturaId, datos]) => ({
        facturaId,
        montoCobrado: datos.pagoCompleto ? datos.montoTotal : datos.montoParcial
      }))

      const datosCobro = {
        facturas: facturasParaCobro,
        metodoCobro,
        fechaCobro: new Date().toISOString(),
        notas: notas.trim() || undefined
      }

      console.log('Registrando pago:', datosCobro)
      const resultado = await cobroAPI.registrarMiPago(datosCobro)

      console.log('Pago registrado:', resultado)

      if (resultado.success) {
        onSuccess && onSuccess()
        onClose()
      } else {
        setError(resultado.message || 'Error al procesar el pago')
      }
    } catch (error) {
      console.error('Error procesando pago:', error)
      setError(error.message || 'Error al procesar el pago')
    } finally {
      setProcesando(false)
    }
  }

  const formatFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '800px', maxHeight: '90vh', overflow: 'auto' }}>
        <div className="modal-header">
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
            <FaDollarSign />
            Realizar Pago
          </h2>
          <button className="modal-close" onClick={onClose} disabled={procesando}>
            <FaTimes />
          </button>
        </div>

        <div className="modal-body">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              Cargando facturas...
            </div>
          ) : error && facturas.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#dc3545' }}>
              {error}
            </div>
          ) : facturas.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#6c757d' }}>
              <FaCheckCircle style={{ fontSize: '3rem', marginBottom: '1rem', color: '#28a745' }} />
              <p>No tienes facturas pendientes de pago</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {/* Lista de facturas */}
              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: '#2c3e50' }}>
                  Selecciona las facturas a pagar
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {facturas.map(factura => {
                    const seleccionada = facturasSeleccionadas[factura._id]
                    const estaSeleccionada = seleccionada?.seleccionada
                    const pagoCompleto = seleccionada?.pagoCompleto ?? true

                    return (
                      <div
                        key={factura._id}
                        style={{
                          border: estaSeleccionada ? '2px solid #0F5C8C' : '1px solid #e1e5e9',
                          borderRadius: '8px',
                          padding: '1rem',
                          background: estaSeleccionada ? '#f0f8ff' : 'white',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                      >
                        {/* Checkbox y datos principales */}
                        <div
                          style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: estaSeleccionada ? '1rem' : 0 }}
                          onClick={() => toggleFactura(factura._id, factura.total)}
                        >
                          <input
                            type="checkbox"
                            checked={estaSeleccionada || false}
                            onChange={() => {}}
                            style={{ marginTop: '0.25rem', width: '18px', height: '18px', cursor: 'pointer' }}
                          />

                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                              <div>
                                <div style={{ fontWeight: 600, fontSize: '1rem', color: '#2c3e50', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                  <FaFileInvoice />
                                  Factura {factura.numeroFactura}
                                </div>
                                <div style={{ fontSize: '0.85rem', color: '#6c757d', marginTop: '0.25rem' }}>
                                  {factura.periodoFacturado}
                                </div>
                              </div>

                              <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0F5C8C' }}>
                                  ${factura.total.toLocaleString()}
                                </div>
                                <div style={{
                                  fontSize: '0.75rem',
                                  fontWeight: 600,
                                  color: factura.estado === 'Vencida' ? '#dc3545' :
                                         factura.estado === 'Cobrada Parcialmente' ? '#ffc107' : '#17a2b8',
                                  marginTop: '0.25rem'
                                }}>
                                  {factura.estado}
                                </div>
                              </div>
                            </div>

                            <div style={{ fontSize: '0.85rem', color: '#6c757d' }}>
                              <div>Emisión: {formatFecha(factura.fechaEmision)}</div>
                              <div>Vencimiento: {formatFecha(factura.fechaVencimiento)}</div>
                            </div>
                          </div>
                        </div>

                        {/* Opciones de pago (solo si está seleccionada) */}
                        {estaSeleccionada && (
                          <div
                            style={{
                              marginTop: '1rem',
                              paddingTop: '1rem',
                              borderTop: '1px solid #dee2e6',
                              background: 'white',
                              padding: '1rem',
                              borderRadius: '6px'
                            }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div style={{ marginBottom: '0.75rem' }}>
                              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                <input
                                  type="radio"
                                  name={`tipo-pago-${factura._id}`}
                                  checked={pagoCompleto}
                                  onChange={() => togglePagoCompleto(factura._id, factura.total)}
                                  style={{ cursor: 'pointer' }}
                                />
                                <span style={{ fontWeight: 500 }}>Pago completo: ${factura.total.toLocaleString()}</span>
                              </label>
                            </div>

                            <div>
                              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', marginBottom: '0.5rem' }}>
                                <input
                                  type="radio"
                                  name={`tipo-pago-${factura._id}`}
                                  checked={!pagoCompleto}
                                  onChange={() => togglePagoCompleto(factura._id, factura.total)}
                                  style={{ cursor: 'pointer' }}
                                />
                                <span style={{ fontWeight: 500 }}>Pago parcial:</span>
                              </label>

                              {!pagoCompleto && (
                                <div style={{ marginLeft: '1.75rem' }}>
                                  <input
                                    type="number"
                                    min="0"
                                    max={factura.total}
                                    step="0.01"
                                    value={seleccionada.montoParcial || ''}
                                    onChange={(e) => actualizarMontoParcial(factura._id, e.target.value)}
                                    placeholder="Ingresa el monto"
                                    style={{
                                      width: '100%',
                                      padding: '0.5rem',
                                      border: '1px solid #ced4da',
                                      borderRadius: '4px',
                                      fontSize: '1rem'
                                    }}
                                  />
                                  <div style={{ fontSize: '0.75rem', color: '#6c757d', marginTop: '0.25rem' }}>
                                    Máximo: ${factura.total.toLocaleString()}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Método de pago */}
              {Object.values(facturasSeleccionadas).some(f => f.seleccionada) && (
                <>
                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#2c3e50' }}>
                      Método de pago *
                    </label>
                    <select
                      value={metodoCobro}
                      onChange={(e) => setMetodoCobro(e.target.value)}
                      required
                      disabled={procesando}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #ced4da',
                        borderRadius: '6px',
                        fontSize: '1rem'
                      }}
                    >
                      <option value="Mercado Pago">Mercado Pago</option>
                      <option value="Efectivo">Efectivo</option>
                      <option value="Tarjeta">Tarjeta</option>
                      <option value="Transferencia">Transferencia</option>
                      <option value="Otro">Otro</option>
                    </select>
                  </div>

                  {/* Notas */}
                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#2c3e50' }}>
                      Notas (opcional)
                    </label>
                    <textarea
                      value={notas}
                      onChange={(e) => setNotas(e.target.value)}
                      disabled={procesando}
                      placeholder="Agrega cualquier comentario adicional..."
                      rows={3}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #ced4da',
                        borderRadius: '6px',
                        fontSize: '1rem',
                        resize: 'vertical'
                      }}
                    />
                  </div>

                  {/* Total a pagar */}
                  <div style={{
                    padding: '1rem',
                    background: '#f8f9fa',
                    borderRadius: '8px',
                    marginBottom: '1.5rem',
                    border: '2px solid #0F5C8C'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '1.1rem', fontWeight: 600, color: '#2c3e50' }}>
                        Total a pagar:
                      </span>
                      <span style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0F5C8C' }}>
                        ${calcularTotal().toLocaleString()}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#6c757d', marginTop: '0.5rem' }}>
                      {Object.values(facturasSeleccionadas).filter(f => f.seleccionada).length} factura(s) seleccionada(s)
                    </div>
                  </div>
                </>
              )}

              {/* Error */}
              {error && (
                <div style={{
                  padding: '1rem',
                  background: '#f8d7da',
                  color: '#721c24',
                  borderRadius: '6px',
                  marginBottom: '1rem',
                  border: '1px solid #f5c6cb'
                }}>
                  {error}
                </div>
              )}

              {/* Botones */}
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={onClose}
                  disabled={procesando}
                  style={{
                    padding: '0.75rem 1.5rem',
                    border: '1px solid #6c757d',
                    background: 'white',
                    color: '#6c757d',
                    borderRadius: '6px',
                    fontSize: '1rem',
                    fontWeight: 600,
                    cursor: procesando ? 'not-allowed' : 'pointer',
                    opacity: procesando ? 0.5 : 1
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={procesando || Object.values(facturasSeleccionadas).filter(f => f.seleccionada).length === 0}
                  style={{
                    padding: '0.75rem 1.5rem',
                    border: 'none',
                    background: '#0F5C8C',
                    color: 'white',
                    borderRadius: '6px',
                    fontSize: '1rem',
                    fontWeight: 600,
                    cursor: procesando || Object.values(facturasSeleccionadas).filter(f => f.seleccionada).length === 0 ? 'not-allowed' : 'pointer',
                    opacity: procesando || Object.values(facturasSeleccionadas).filter(f => f.seleccionada).length === 0 ? 0.5 : 1
                  }}
                >
                  {procesando ? 'Procesando...' : 'Confirmar Pago'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

export default StudentPaymentModal
