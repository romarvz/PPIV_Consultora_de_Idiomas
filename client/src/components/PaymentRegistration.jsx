import React, { useState, useEffect, useRef } from 'react';
import { mockApi } from '../services/mockApi';
import apiAdapter from '../services/apiAdapter';
import { FaCheckCircle } from 'react-icons/fa';

// --- 1. AÑADIMOS UNA PROPIEDAD 'chargeToEdit' ---
// Si esta propiedad existe, estamos en modo edición. Si no, es un registro nuevo.
const PaymentRegistration = ({ onSuccess, onCancel, chargeToEdit = null }) => {
  const [allStudents, setAllStudents] = useState([]);
  const [formData, setFormData] = useState({
    studentId: '',
    studentName: '',
    amount: '',
    concept: '',
    date: new Date().toISOString().split('T')[0],
    status: 'pagado', // El valor por defecto es 'Pagado'
    paymentMethod: 'Efectivo',
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isSuggestionsVisible, setIsSuggestionsVisible] = useState(false);
  const [pendingCharges, setPendingCharges] = useState([]);
  const [loadingCharges, setLoadingCharges] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const searchContainerRef = useRef(null);

  useEffect(() => {
    // Si estamos editando, llenamos el formulario con los datos existentes
    if (chargeToEdit) {
      setFormData({
        studentId: chargeToEdit.studentId,
        studentName: chargeToEdit.studentName,
        amount: chargeToEdit.amount,
        concept: chargeToEdit.concept,
        date: new Date(chargeToEdit.date).toISOString().split('T')[0],
        status: chargeToEdit.status,
        paymentMethod: chargeToEdit.paymentMethod,
      });
      setSearchTerm(chargeToEdit.studentName);
    }
  }, [chargeToEdit]);

  useEffect(() => {
    const fetchStudents = async () => {
      // No necesitamos buscar estudiantes si ya estamos en modo edición
      if (chargeToEdit) return;
      
      try {
        const response = await mockApi.classes.getAll({ limit: 1000 });
        if (response.data.success) {
          const studentsData = response.data.data.classes.map(c => ({ id: c.studentId, name: c.studentName }));
          const uniqueStudents = Array.from(new Map(studentsData.map(item => [item['id'], item])).values());
          setAllStudents(uniqueStudents);
        }
      } catch (err) {
        console.error("Error fetching students:", err);
        setError("No se pudieron cargar los estudiantes.");
      }
    };
    fetchStudents();
  }, [chargeToEdit]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setIsSuggestionsVisible(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setFormData(prev => ({ ...prev, studentId: '', studentName: '' }));
    setPendingCharges([]);
    
    if (value.length > 0) {
      const filtered = allStudents.filter(student =>
        student.name.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filtered);
      setIsSuggestionsVisible(true);
    } else {
      setSuggestions([]);
      setIsSuggestionsVisible(false);
    }
  };

  const handleSuggestionClick = async (student) => {
    setFormData(prev => ({ ...prev, studentId: student.id, studentName: student.name }));
    setSearchTerm(student.name);
    setIsSuggestionsVisible(false);
    setSuggestions([]);

    setLoadingCharges(true);
    try {
      const response = await apiAdapter.payments.getPendingByStudentId(student.id);
      if (response.success) {
        setPendingCharges(response.data);
      } else {
        setPendingCharges([]);
      }
    } catch (err) {
      console.error("Error fetching pending charges", err);
      setPendingCharges([]);
    } finally {
      setLoadingCharges(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleChargeSelection = (e) => {
    const chargeId = e.target.value;
    const selectedCharge = pendingCharges.find(c => c._id === chargeId);
    if (selectedCharge) {
      setFormData(prev => ({
        ...prev,
        amount: selectedCharge.amount,
        concept: selectedCharge.concept,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.studentId) {
      setError('Por favor, seleccione un estudiante de la lista.');
      return;
    }
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      const { studentName, ...dataToSubmit } = formData;
      await mockApi.payments.create(dataToSubmit);
      setSuccess('¡Pago registrado exitosamente!');
      setTimeout(() => {
        if (onSuccess) onSuccess();
      }, 1500);
    } catch (err) {
      setError(err.message || 'Ocurrió un error al registrar el pago.');
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="payment-form modal-form-background">
      {error && <div className="notification error">{error}</div>}
      {success && (
        <div className="notification success">
          <FaCheckCircle /> {success}
        </div>
      )}
      <div className="form-group full-width" ref={searchContainerRef}>
        <label htmlFor="studentSearch">Estudiante</label>
        <input
          type="text"
          id="studentSearch"
          autoComplete="off"
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="Escriba para buscar un estudiante..."
          required
          disabled={submitting || !!chargeToEdit} // Deshabilitamos si estamos editando
        />
        {isSuggestionsVisible && suggestions.length > 0 && (
          <ul className="suggestions-list">
            {suggestions.map(student => (
              <li key={student.id} onClick={() => handleSuggestionClick(student)}>
                {student.name}
              </li>
            ))}
          </ul>
        )}
      </div>

      {loadingCharges && <div className="loading-state small">Buscando deudas...</div>}
      
      {!loadingCharges && formData.studentId && !chargeToEdit && ( // Ocultamos si estamos en modo edición
        pendingCharges.length > 0 ? (
          <div className="form-group full-width pending-charges">
            <label>Conceptos Pendientes (Seleccione uno para autocompletar)</label>
            {pendingCharges.map(charge => (
              <div key={charge._id} className="charge-item">
                <input
                  type="radio"
                  id={charge._id}
                  name="pendingCharge"
                  value={charge._id}
                  onChange={handleChargeSelection}
                />
                <label htmlFor={charge._id}>
                  {charge.concept} - <strong>${charge.amount}</strong> ({charge.status})
                </label>
              </div>
            ))}
          </div>
        ) : (
          <div className="notification info">✅ Este estudiante no tiene cobros pendientes.</div>
        )
      )}
      
      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="amount">Monto</label>
          <input
            type="number"
            id="amount"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            placeholder="Ej: 15000"
            required
            disabled={submitting}
          />
        </div>
        <div className="form-group">
          <label htmlFor="date">Fecha</label>
          <input
            type="date"
            id="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
            disabled={submitting}
          />
        </div>
      </div>
      <div className="form-group full-width">
        <label htmlFor="concept">Concepto</label>
        <input
          type="text"
          id="concept"
          name="concept"
          value={formData.concept}
          onChange={handleChange}
          placeholder="Ej: Cuota mensual, Matrícula, etc."
          required
          disabled={submitting}
        />
      </div>
      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="paymentMethod">Medio de Pago</label>
          <select
            id="paymentMethod"
            name="paymentMethod"
            value={formData.paymentMethod}
            onChange={handleChange}
            disabled={submitting}
          >
            <option value="Efectivo">Efectivo</option>
            <option value="Transferencia Bancaria">Transferencia Bancaria</option>
            <option value="Tarjeta de Crédito">Tarjeta de Crédito</option>
            <option value="Tarjeta de Débito">Tarjeta de Débito</option>
            <option value="Otro">Otro</option>
          </select>
        </div>
        
        {/* --- 2. AQUÍ ESTÁ LA CONDICIÓN --- */}
        {/* Este bloque solo se mostrará si estamos en modo edición */}
        {chargeToEdit && (
          <div className="form-group">
            <label htmlFor="status">Estado</label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              disabled={submitting}
            >
              <option value="pendiente">Pendiente</option>
              <option value="pagado">Pagado</option>
              <option value="vencido">Vencido</option>
            </select>
          </div>
        )}
      </div>
      <div className="payment-form-actions">
        <button type="button" onClick={onCancel} className="btn-secondary" disabled={submitting}>
          Cancelar
        </button>
        <button type="submit" className="cta-btn" disabled={submitting}>
          {submitting ? 'Registrando...' : 'Registrar'}
        </button>
      </div>
    </form>
  );
};

export default PaymentRegistration;