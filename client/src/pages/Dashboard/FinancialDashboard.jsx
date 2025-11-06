import { useState, useEffect } from 'react'
import { 
  Receipt, 
  DollarSign, 
  FileText, 
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  Search,
  Filter,
  Download
} from 'lucide-react'
import facturaAPI from '../services/facturaApi'
import cobroAPI from '../services/cobroApi'

const FinancialDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  
  // Estados para datos reales del backend
  const [facturas, setFacturas] = useState([])
  const [cobros, setCobros] = useState([])
  const [estadisticas, setEstadisticas] = useState({
    totalIngresos: 0,
    facturasPendientes: 0,
    cobrosMes: 0,
    deudaTotal: 0
  })

  // Estado para crear factura
  const [mostrarFormFactura, setMostrarFormFactura] = useState(false)
  const [facturaFormData, setFacturaFormData] = useState({
    estudiante: '',
    condicionFiscal: 'Consumidor Final',
    periodoFacturado: '',
    fechaVencimiento: '',
    itemFacturaSchema: []
  })

  // Estado para registrar cobro
  const [mostrarFormCobro, setMostrarFormCobro] = useState(false)
  const [cobroFormData, setCobroFormData] = useState({
    factura: '',
    estudiante: '',
    monto: 0,
    metodoPago: 'Efectivo',
    observaciones: ''
  })

  // Cargar datos iniciales
  useEffect(() => {
    cargarDatosIniciales()
  }, [])

  const cargarDatosIniciales = async () => {
    setLoading(true)
    setError(null)
    
    try {
      // TODO: Implementar cuando tengas endpoint para listar todas las facturas
      // Por ahora, usaremos datos de ejemplo o un estudiante específico
      
      // Ejemplo: cargar facturas de un estudiante específico
      // const resFacturas = await facturaAPI.obtenerFacturasPorEstudiante('ID_ESTUDIANTE')
      // setFacturas(resFacturas.data)
      
      // Calcular estadísticas basadas en los datos reales
      calcularEstadisticas()
      
    } catch (err) {
      console.error('Error al cargar datos:', err)
      setError(err.message || 'Error al cargar datos financieros')
    } finally {
      setLoading(false)
    }
  }

  const calcularEstadisticas = () => {
    // Calcular estadísticas basadas en facturas y cobros reales
    const pendientes = facturas.filter(f => f.estado === 'Pendiente')
    const totalDeuda = pendientes.reduce((sum, f) => sum + f.total, 0)
    const cobrosDelMes = cobros.filter(c => {
      const fecha = new Date(c.fechaCobro)
      const hoy = new Date()
      return fecha.getMonth() === hoy.getMonth() && fecha.getFullYear() === hoy.getFullYear()
    })
    const totalIngresos = cobrosDelMes.reduce((sum, c) => sum + c.monto, 0)

    setEstadisticas({
      totalIngresos,
      facturasPendientes: pendientes.length,
      cobrosMes: cobrosDelMes.length,
      deudaTotal: totalDeuda
    })
  }

  // Función para crear factura en borrador
  const handleCrearFactura = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await facturaAPI.crearFactura(facturaFormData)
      
      if (response.success) {
        alert(`Factura creada en borrador: ${response.data.numeroFactura}`)
        setMostrarFormFactura(false)
        cargarDatosIniciales()
        
        // Limpiar formulario
        setFacturaFormData({
          estudiante: '',
          condicionFiscal: 'Consumidor Final',
          periodoFacturado: '',
          fechaVencimiento: '',
          itemFacturaSchema: []
        })
      }
    } catch (err) {
      console.error('Error al crear factura:', err)
      setError(err.message || 'Error al crear factura')
    } finally {
      setLoading(false)
    }
  }

  // Función para autorizar factura
  const handleAutorizarFactura = async (facturaId) => {
    if (!confirm('¿Desea autorizar esta factura? Una vez autorizada no podrá modificarla.')) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await facturaAPI.autorizarFactura(facturaId)
      
      if (response.success) {
        alert(`Factura autorizada con CAE: ${response.data.cae}`)
        cargarDatosIniciales()
      }
    } catch (err) {
      console.error('Error al autorizar factura:', err)
      setError(err.message || 'Error al autorizar factura')
    } finally {
      setLoading(false)
    }
  }

  // Función para eliminar factura borrador
  const handleEliminarFactura = async (facturaId) => {
    if (!confirm('¿Está seguro de eliminar esta factura en borrador?')) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await facturaAPI.eliminarFactura(facturaId)
      
      if (response.success) {
        alert('Factura eliminada exitosamente')
        cargarDatosIniciales()
      }
    } catch (err) {
      console.error('Error al eliminar factura:', err)
      setError(err.message || 'Error al eliminar factura')
    } finally {
      setLoading(false)
    }
  }

  // Función para registrar cobro
  const handleRegistrarCobro = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await cobroAPI.registrarCobro(cobroFormData)
      
      if (response.success) {
        alert('Cobro registrado exitosamente')
        setMostrarFormCobro(false)
        cargarDatosIniciales()
        
        // Limpiar formulario
        setCobroFormData({
          factura: '',
          estudiante: '',
          monto: 0,
          metodoPago: 'Efectivo',
          observaciones: ''
        })
      }
    } catch (err) {
      console.error('Error al registrar cobro:', err)
      setError(err.message || 'Error al registrar cobro')
    } finally {
      setLoading(false)
    }
  }

  // Obtener badge de estado de factura
  const getEstadoBadge = (estado) => {
    const badgeClasses = {
      'Borrador': 'bg-gray-100 text-gray-800',
      'Pendiente': 'bg-yellow-100 text-yellow-800',
      'Cobrada': 'bg-green-100 text-green-800',
      'Vencida': 'bg-red-100 text-red-800'
    }

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${badgeClasses[estado] || 'bg-gray-100 text-gray-800'}`}>
        {estado}
      </span>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Financiero</h1>
          <p className="text-gray-500">Gestión de facturas y cobros</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setMostrarFormFactura(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <Plus size={20} />
            Nueva Factura
          </button>
          <button
            onClick={() => setMostrarFormCobro(true)}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            <DollarSign size={20} />
            Registrar Cobro
          </button>
        </div>
      </div>

      {/* Mensajes de error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center gap-2">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Cargando...</p>
        </div>
      )}

      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Ingresos del Mes</p>
              <p className="text-2xl font-bold text-gray-900">
                ${estadisticas.totalIngresos.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <TrendingUp className="text-green-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Facturas Pendientes</p>
              <p className="text-2xl font-bold text-gray-900">
                {estadisticas.facturasPendientes}
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Clock className="text-yellow-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Cobros del Mes</p>
              <p className="text-2xl font-bold text-gray-900">
                {estadisticas.cobrosMes}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Receipt className="text-blue-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Deuda Total</p>
              <p className="text-2xl font-bold text-gray-900">
                ${estadisticas.deudaTotal.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <DollarSign className="text-red-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Resumen
            </button>
            <button
              onClick={() => setActiveTab('facturas')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'facturas'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Facturas
            </button>
            <button
              onClick={() => setActiveTab('cobros')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'cobros'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Cobros
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* Tab: Resumen */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Últimas Facturas</h3>
              
              {facturas.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No hay facturas registradas. Cree una nueva factura para comenzar.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Número
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Estudiante
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Fecha
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Monto
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Estado
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          CAE
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {facturas.slice(0, 5).map((factura) => (
                        <tr key={factura._id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {factura.numeroFactura}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {factura.estudiante?.nombre} {factura.estudiante?.apellido}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(factura.fechaEmision).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            ${factura.total.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getEstadoBadge(factura.estado)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {factura.cae || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            {factura.estado === 'Borrador' && (
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => handleAutorizarFactura(factura._id)}
                                  className="text-blue-600 hover:text-blue-900"
                                >
                                  Autorizar
                                </button>
                                <button
                                  onClick={() => handleEliminarFactura(factura._id)}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  Eliminar
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Tab: Facturas */}
          {activeTab === 'facturas' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Todas las Facturas</h3>
                <div className="flex gap-2">
                  <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                    <Filter size={16} />
                    Filtrar
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                    <Download size={16} />
                    Exportar
                  </button>
                </div>
              </div>

              {/* Lista completa de facturas - Similar al tab resumen pero con todas */}
              <div className="text-center py-8 text-gray-500">
                Implementación completa de listado de facturas...
              </div>
            </div>
          )}

          {/* Tab: Cobros */}
          {activeTab === 'cobros' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Historial de Cobros</h3>
              
              {cobros.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No hay cobros registrados.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Fecha
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Estudiante
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Factura
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Método
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Monto
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {cobros.map((cobro) => (
                        <tr key={cobro._id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(cobro.fechaCobro).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {cobro.estudiante?.nombre} {cobro.estudiante?.apellido}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {cobro.factura?.numeroFactura}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {cobro.metodoPago}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            ${cobro.monto.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button className="text-blue-600 hover:text-blue-900">
                              Ver detalle
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal: Crear Factura */}
      {mostrarFormFactura && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Nueva Factura (Borrador)</h2>
            <form onSubmit={handleCrearFactura} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ID Estudiante
                </label>
                <input
                  type="text"
                  value={facturaFormData.estudiante}
                  onChange={(e) => setFacturaFormData({...facturaFormData, estudiante: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Condición Fiscal
                </label>
                <select
                  value={facturaFormData.condicionFiscal}
                  onChange={(e) => setFacturaFormData({...facturaFormData, condicionFiscal: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="Consumidor Final">Consumidor Final</option>
                  <option value="Responsable Inscripto">Responsable Inscripto</option>
                  <option value="Monotributista">Monotributista</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Período Facturado
                </label>
                <input
                  type="text"
                  placeholder="2025-11"
                  value={facturaFormData.periodoFacturado}
                  onChange={(e) => setFacturaFormData({...facturaFormData, periodoFacturado: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha Vencimiento
                </label>
                <input
                  type="date"
                  value={facturaFormData.fechaVencimiento}
                  onChange={(e) => setFacturaFormData({...facturaFormData, fechaVencimiento: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  required
                />
              </div>

              <div className="text-sm text-gray-500">
                Nota: Los ítems de la factura se agregarán en una versión futura
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setMostrarFormFactura(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  disabled={loading}
                >
                  {loading ? 'Creando...' : 'Crear Borrador'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Registrar Cobro */}
      {mostrarFormCobro && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
            <h2 className="text-xl font-bold mb-4">Registrar Cobro</h2>
            <form onSubmit={handleRegistrarCobro} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ID Factura
                </label>
                <input
                  type="text"
                  value={cobroFormData.factura}
                  onChange={(e) => setCobroFormData({...cobroFormData, factura: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Monto
                </label>
                <input
                  type="number"
                  value={cobroFormData.monto}
                  onChange={(e) => setCobroFormData({...cobroFormData, monto: parseFloat(e.target.value)})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  required
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Método de Pago
                </label>
                <select
                  value={cobroFormData.metodoPago}
                  onChange={(e) => setCobroFormData({...cobroFormData, metodoPago: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="Efectivo">Efectivo</option>
                  <option value="Transferencia">Transferencia</option>
                  <option value="Tarjeta">Tarjeta</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Observaciones
                </label>
                <textarea
                  value={cobroFormData.observaciones}
                  onChange={(e) => setCobroFormData({...cobroFormData, observaciones: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  rows="3"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setMostrarFormCobro(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  disabled={loading}
                >
                  {loading ? 'Registrando...' : 'Registrar Cobro'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default FinancialDashboard