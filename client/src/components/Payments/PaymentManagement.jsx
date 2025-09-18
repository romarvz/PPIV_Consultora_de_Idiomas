import React, { useState } from 'react'
import { Plus, CreditCard, DollarSign, FileText, AlertCircle, CheckCircle } from 'lucide-react'

const PaymentManagement = () => {
  const [payments, setPayments] = useState([
    { id: 1, student: 'Ana Martínez', course: 'Inglés Básico A1', amount: 15000, status: 'Pagado', date: '2024-01-10', method: 'Efectivo' },
    { id: 2, student: 'Carlos López', course: 'Business English', amount: 25000, status: 'Pendiente', date: '2024-01-15', method: 'Online' },
    { id: 3, student: 'María García', course: 'Inglés Intermedio B1', amount: 18000, status: 'Vencido', date: '2024-01-05', method: 'Efectivo' }
  ])

  const [teacherPayments, setTeacherPayments] = useState([
    { id: 1, teacher: 'Prof. García', period: 'Enero 2024', hours: 40, rate: 2500, amount: 100000, status: 'Pagado', date: '2024-01-31' },
    { id: 2, teacher: 'Prof. Smith', period: 'Enero 2024', hours: 32, rate: 3000, amount: 96000, status: 'Pendiente', date: null }
  ])

  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [showTeacherPaymentForm, setShowTeacherPaymentForm] = useState(false)
  const [paymentFormData, setPaymentFormData] = useState({
    student: '', course: '', amount: '', method: 'Efectivo'
  })

  const students = ['Ana Martínez', 'Carlos López', 'María García', 'Juan Pérez']
  const courses = ['Inglés Básico A1', 'Inglés Intermedio B1', 'Business English']
  const teachers = ['Prof. García', 'Prof. Smith', 'Prof. López']

  const handlePaymentSubmit = (e) => {
    e.preventDefault()
    
    const newPayment = {
      id: Date.now(),
      ...paymentFormData,
      amount: parseFloat(paymentFormData.amount),
      status: 'Pagado',
      date: new Date().toISOString().split('T')[0]
    }
    
    setPayments([...payments, newPayment])
    setPaymentFormData({ student: '', course: '', amount: '', method: 'Efectivo' })
    setShowPaymentForm(false)
    alert('Cobro registrado exitosamente')
  }

  const handleTeacherPayment = (teacherId) => {
    const updatedPayments = teacherPayments.map(payment => {
      if (payment.id === teacherId) {
        return { 
          ...payment, 
          status: 'Pagado', 
          date: new Date().toISOString().split('T')[0] 
        }
      }
      return payment
    })
    setTeacherPayments(updatedPayments)
    alert('Pago a profesor registrado exitosamente')
  }

  const generateInvoice = (studentName, amount) => {
    alert(`Factura generada para ${studentName} por $${amount.toLocaleString()}. Se enviará por email.`)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pagado': return 'status-active'
      case 'Pendiente': return 'status-pending'
      case 'Vencido': return 'status-inactive'
      default: return 'status-pending'
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-lg font-semibold">Gestión de Pagos</h1>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowPaymentForm(true)}
            className="btn btn-primary"
          >
            <Plus size={16} />
            Registrar Cobro
          </button>
          <button 
            onClick={() => setShowTeacherPaymentForm(true)}
            className="btn btn-secondary"
          >
            <DollarSign size={16} />
            Pagar Profesores
          </button>
        </div>
      </div>

      {showPaymentForm && (
        <div className="card mb-4">
          <div className="card-header">
            <h3 className="card-title">Registrar Nuevo Cobro</h3>
          </div>
          <form onSubmit={handlePaymentSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Estudiante *</label>
                <select
                  value={paymentFormData.student}
                  onChange={(e) => setPaymentFormData({...paymentFormData, student: e.target.value})}
                  className="form-select"
                  required
                >
                  <option value="">Seleccionar estudiante</option>
                  {students.map(student => (
                    <option key={student} value={student}>{student}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Curso *</label>
                <select
                  value={paymentFormData.course}
                  onChange={(e) => setPaymentFormData({...paymentFormData, course: e.target.value})}
                  className="form-select"
                  required
                >
                  <option value="">Seleccionar curso</option>
                  {courses.map(course => (
                    <option key={course} value={course}>{course}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Monto *</label>
                <input
                  type="number"
                  step="0.01"
                  value={paymentFormData.amount}
                  onChange={(e) => setPaymentFormData({...paymentFormData, amount: e.target.value})}
                  className="form-input"
                  min="0"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Método de Pago *</label>
                <select
                  value={paymentFormData.method}
                  onChange={(e) => setPaymentFormData({...paymentFormData, method: e.target.value})}
                  className="form-select"
                  required
                >
                  <option value="Efectivo">Efectivo</option>
                  <option value="Online">Online</option>
                  <option value="Transferencia">Transferencia</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button type="submit" className="btn btn-primary">Registrar Cobro</button>
              <button 
                type="button" 
                onClick={() => setShowPaymentForm(false)}
                className="btn btn-secondary"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card mb-4">
        <div className="card-header">
          <h3 className="card-title">
            <CreditCard size={20} />
            Cobros de Estudiantes
          </h3>
        </div>
        
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Estudiante</th>
                <th>Curso</th>
                <th>Monto</th>
                <th>Fecha</th>
                <th>Método</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {payments.map(payment => (
                <tr key={payment.id}>
                  <td>{payment.student}</td>
                  <td>{payment.course}</td>
                  <td>${payment.amount.toLocaleString()}</td>
                  <td>{payment.date}</td>
                  <td>{payment.method}</td>
                  <td>
                    <span className={`status-badge ${getStatusColor(payment.status)}`}>
                      {payment.status}
                    </span>
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => generateInvoice(payment.student, payment.amount)}
                        className="btn btn-secondary" 
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                      >
                        <FileText size={12} />
                        Factura
                      </button>
                      {payment.status === 'Vencido' && (
                        <button 
                          className="btn btn-warning" 
                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                        >
                          <AlertCircle size={12} />
                          Recordar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            <DollarSign size={20} />
            Pagos a Profesores
          </h3>
        </div>
        
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Profesor</th>
                <th>Período</th>
                <th>Horas</th>
                <th>Tarifa/Hora</th>
                <th>Monto Total</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {teacherPayments.map(payment => (
                <tr key={payment.id}>
                  <td>{payment.teacher}</td>
                  <td>{payment.period}</td>
                  <td>{payment.hours}h</td>
                  <td>${payment.rate.toLocaleString()}</td>
                  <td>${payment.amount.toLocaleString()}</td>
                  <td>
                    <span className={`status-badge ${getStatusColor(payment.status)}`}>
                      {payment.status}
                    </span>
                  </td>
                  <td>
                    {payment.status === 'Pendiente' ? (
                      <button 
                        onClick={() => handleTeacherPayment(payment.id)}
                        className="btn btn-success" 
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                      >
                        <CheckCircle size={12} />
                        Pagar
                      </button>
                    ) : (
                      <button 
                        className="btn btn-secondary" 
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                      >
                        <FileText size={12} />
                        Recibo
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default PaymentManagement