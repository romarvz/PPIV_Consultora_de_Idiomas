// /client/src/components/courses/CourseFormModal.jsx

import React, { useState, useEffect } from 'react';
import apiAdapter from '../../services/apiAdapter'; // 'get', 'create', 'update'

const MAX_IMAGE_SIZE_MB = 5
const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024

const CourseFormModal = ({ course, onClose, onSave, teachers }) => {
  
  // Initial state aligned with backend model (Curso.js)
  const getInitialFormData = () => ({
    nombre: '',
    descripcion: '',
    idioma: 'ingles', // Default value
    nivel: 'A1',      // Default value
    duracionTotal: 10,
    tarifa: 0,
    fechaInicio: new Date().toISOString().split('T')[0],
    fechaFin: new Date().toISOString().split('T')[0],
    profesor: '', // Teacher ID
    horario: '',  // Schedule ID (compatibility)
    horarios: [], // Array of schedule IDs (multiple days)
    duracionClaseMinutos: 120,
    estado: 'planificado',
    modalidad: 'presencial',
    type: 'Curso Grupal',
    imageUrl: '',
    requisitos: '',
    objetivos: '',
  });

  const [formData, setFormData] = useState(getInitialFormData());

  // State for dynamic schedules
  const [availableSchedules, setAvailableSchedules] = useState([]);
  const [isLoadingSchedules, setIsLoadingSchedules] = useState(false);
  const [scheduleDurations, setScheduleDurations] = useState({});
  const [imagePreview, setImagePreview] = useState('');
  const [imageUploadStatus, setImageUploadStatus] = useState({ loading: false, error: null });

  // Options for <select> elements (based on backend enums)
  const idiomaOptions = ['ingles', 'frances', 'aleman', 'italiano', 'portugues', 'chino', 'japones', 'coreano'];
  const nivelOptions = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  const estadoOptions = ['planificado', 'activo', 'completado', 'cancelado'];
  const modalidadOptions = [
    { value: 'presencial', label: 'Presencial' },
    { value: 'online', label: 'Online' }
  ];
  const tipoOptions = [
    'Curso Grupal',
    'Clase Individual',
    'Curso Corporativo',
    'Certificacion',
    'Inmersion Cultural',
    'Otros'
  ];

  const durationOptions = [30, 45, 60, 75, 90, 105, 120, 135, 150, 165, 180];
  const formatDurationLabel = (minutes) => {
    const numeric = Number(minutes);
    if (!Number.isFinite(numeric)) {
      return `${minutes} minutos`;
    }
    const hours = Math.floor(numeric / 60);
    const mins = numeric % 60;
    if (hours === 0) {
      return `${numeric} minutos`;
    }
    if (mins === 0) {
      return `${hours} h`;
    }
    return `${hours} h ${mins} min`;
  };

  const clampDurationValue = (value, fallback = 120) => {
    const num = Number(value);
    if (!Number.isFinite(num)) {
      return fallback;
    }
    const rounded = Math.round(num / 15) * 15;
    return Math.max(30, Math.min(180, rounded));
  };

  const getMinutesFromTime = (timeString = '') => {
    const [hours = 0, minutes = 0] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const calculateScheduleDuration = (horario) => {
    if (!horario) {
      return 0;
    }
    if (Number.isFinite(horario.duracionMinutos)) {
      return Number(horario.duracionMinutos);
    }
    if (horario.horaInicio && horario.horaFin) {
      return getMinutesFromTime(horario.horaFin) - getMinutesFromTime(horario.horaInicio);
    }
    return 0;
  };

  const formatScheduleDisplay = (horario, fallbackId) => {
    if (!horario) {
      return `Horario ${fallbackId}`;
    }
    if (horario.display) {
      return horario.display;
    }
    const diaCapitalizado = horario.dia ? horario.dia.charAt(0).toUpperCase() + horario.dia.slice(1) : '';
    return `${diaCapitalizado} ${horario.horaInicio || ''} - ${horario.horaFin || ''}`.trim();
  };

  // Function to load schedules for a teacher
  const fetchSchedules = async (profesorId, excludeCursoId = null) => {
    if (!profesorId) {
      setAvailableSchedules([]);
      return;
    }
    setIsLoadingSchedules(true);
    try {
      console.log('CourseFormModal - Loading schedules for teacher:', profesorId);
      if (excludeCursoId) {
        console.log('CourseFormModal - Excluding course:', excludeCursoId);
      }
      
      // Build URL with query param if editing
      let url = `/cursos/profesor/${profesorId}/horarios-disponibles`;
      if (excludeCursoId) {
        url += `?excludeCursoId=${excludeCursoId}`;
      }
      
      // Use the correct apiAdapter method
      const response = await apiAdapter.courses.getAvailableSchedulesByTeacher(profesorId, excludeCursoId);
      
      console.log('CourseFormModal - Respuesta completa:', response);
      console.log('CourseFormModal - response.data:', response.data);
      console.log('CourseFormModal - response.data.data:', response.data?.data);
      
      if (response.data.success) {
        const horarios = response.data.data || [];
        console.log('CourseFormModal - Horarios disponibles recibidos:', horarios.length);
        console.log('CourseFormModal - Detalle de horarios:', horarios.map(h => ({ id: h._id, dia: h.dia, hora: h.horaInicio })));
        setAvailableSchedules(horarios);
      } else {
        console.warn('⚠️ CourseFormModal - La respuesta no fue exitosa:', response.data);
        setAvailableSchedules([]);
      }
    } catch (error) {
      console.error("❌ CourseFormModal - Error cargando horarios:", error);
      console.error("❌ CourseFormModal - Error completo:", error.response?.data || error.message);
      setAvailableSchedules([]);
    } finally {
      setIsLoadingSchedules(false);
    }
  };

  const resolveHorarioInfo = (horarioId) => {
    if (!horarioId) {
      return null;
    }
    const idStr = horarioId.toString();
    const fromAvailable = availableSchedules.find((horario) => {
      const candidate = horario._id ? horario._id.toString() : horario.id?.toString();
      return candidate === idStr;
    });
    if (fromAvailable) {
      return fromAvailable;
    }
    if (course) {
      if (Array.isArray(course.horarios)) {
        const match = course.horarios.find((horario) => {
          if (!horario) return false;
          const candidate = horario._id ? horario._id.toString() : horario.toString?.();
          return candidate === idStr;
        });
        if (match) {
          return match;
        }
      }
      if (course.horario && course.horario._id && course.horario._id.toString() === idStr) {
        return course.horario;
      }
    }
    return null;
  };

  useEffect(() => {
    if (course) {
      // Populate form if editing
      // Ensure we handle both IDs and populated objects
      const profesorId = course.profesor ? (typeof course.profesor === 'object' ? course.profesor._id : course.profesor) : '';
      const horarioId = course.horario ? (typeof course.horario === 'object' ? course.horario._id : course.horario) : '';
      
      // Get schedules from array if exists, otherwise use singular schedule
      let horariosIds = [];
      if (course.horarios && Array.isArray(course.horarios) && course.horarios.length > 0) {
        horariosIds = course.horarios.map(h => {
          if (typeof h === 'object' && h._id) {
            return h._id.toString();
          }
          return h.toString();
        });
      } else if (horarioId) {
        horariosIds = [horarioId.toString()];
      }
      
      console.log('CourseFormModal - Cargando curso para editar:', {
        cursoId: course._id || course.id,
        profesorId,
        horarioId,
        horariosIds,
        horariosRaw: course.horarios
      });

      const durationMap = {};
      if (Array.isArray(course.horariosDuraciones)) {
        course.horariosDuraciones.forEach((item) => {
          if (!item) {
            return;
          }
          const rawId = item.horario || item.horarioId || (item._id && item._id.horario) || item.id;
          if (!rawId) {
            return;
          }
          const key = rawId._id ? rawId._id.toString() : rawId.toString();
          durationMap[key] = clampDurationValue(item.duracionMinutos);
        });
      }

      if (Object.keys(durationMap).length === 0 && Array.isArray(course.horarios)) {
        course.horarios.forEach((horario) => {
          if (!horario) {
            return;
          }
          const key = horario._id ? horario._id.toString() : horario.toString?.();
          if (!key) {
            return;
          }
          const slotDuration = calculateScheduleDuration(horario) || course.duracionClaseMinutos;
          if (slotDuration) {
            durationMap[key] = clampDurationValue(slotDuration);
          }
        });
      }

      const initialClassDuration = clampDurationValue(
        course.duracionClaseMinutos ||
          (horariosIds.length > 0 ? durationMap[horariosIds[0]] : undefined) ||
          120
      );

      const normalizedDurationMap = { ...durationMap };
      horariosIds.forEach((id) => {
        const key = id.toString();
        if (!normalizedDurationMap[key]) {
          normalizedDurationMap[key] = initialClassDuration;
        }
      });

      setFormData({
        nombre: course.nombre || '',
        descripcion: course.descripcion || '',
        idioma: course.idioma || 'ingles',
        nivel: course.nivel || 'A1',
        duracionTotal: course.duracionTotal || 10,
        tarifa: course.tarifa || 0,
        fechaInicio: course.fechaInicio ? new Date(course.fechaInicio).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        fechaFin: course.fechaFin ? new Date(course.fechaFin).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        profesor: profesorId,
        horario: horarioId, // Compatibility
        horarios: horariosIds, // Array of schedules
        duracionClaseMinutos: initialClassDuration,
        estado: course.estado || 'planificado',
        modalidad: course.modalidad || 'presencial',
        type: course.type || 'Curso Grupal',
        imageUrl: course.imageUrl || '',
        requisitos: course.requisitos || '',
        objetivos: course.objetivos || '',
      });

      setScheduleDurations(normalizedDurationMap);
      setImagePreview(course.imageUrl || '');
      setImageUploadStatus((prev) => ({ ...prev, error: null }));
      
      // If editing a course, load its teacher's schedules
      // Exclude current course so its schedules appear as available
      if (profesorId) {
        const cursoId = course._id || course.id;
        fetchSchedules(profesorId, cursoId);
      }
    } else {
      // Reset to default values if it's a 'new course'
      setFormData(getInitialFormData());
      setAvailableSchedules([]);
      setScheduleDurations({});
      setImagePreview('');
      setImageUploadStatus({ loading: false, error: null });
    }
  }, [course]); // Dependency: runs if 'course' changes

  useEffect(() => {
    setImagePreview(formData.imageUrl || '');
  }, [formData.imageUrl]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // If the field that changed is 'profesor'...
    if (name === 'profesor') {
      // Clear previous schedule
      setFormData(prev => ({ ...prev, horario: '', horarios: [] }));
      setScheduleDurations({});
      // Fetch new schedules with teacher ID (value)
      // If editing, exclude current course
      const cursoId = course ? (course._id || course.id) : null;
      fetchSchedules(value, cursoId);
    }

    if (name === 'imageUrl') {
      setImageUploadStatus((prev) => ({ ...prev, error: null }));
    }
  };

  const handleImageFileChange = async (event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      setImageUploadStatus({
        loading: false,
        error: 'Solo se permiten archivos de imagen (JPG, PNG, WebP, etc.).'
      });
      event.target.value = '';
      return;
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      setImageUploadStatus({
        loading: false,
        error: `La imagen supera los ${MAX_IMAGE_SIZE_MB} MB permitidos. Por favor optimízala.`
      });
      event.target.value = '';
      return;
    }

    setImageUploadStatus({ loading: true, error: null });

    try {
      const formPayload = new FormData();
      formPayload.append('image', file);

      const response = await apiAdapter.uploads.uploadCourseImage(formPayload);
      const data = response.data?.data;
      const url = data?.secureUrl || data?.url;

      if (!url) {
        throw new Error('No se recibió la URL de la imagen subida.');
      }

      setFormData((prev) => ({
        ...prev,
        imageUrl: url
      }));
      setImagePreview(url);
      setImageUploadStatus({ loading: false, error: null });
    } catch (error) {
      console.error('Error al subir la imagen del curso:', error);
      const message =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        'No se pudo subir la imagen. Intente nuevamente.';
      setImageUploadStatus({ loading: false, error: message });
    } finally {
      if (event.target) {
        event.target.value = '';
      }
    }
  };

  const handleRemoveImage = () => {
    setFormData((prev) => ({
      ...prev,
      imageUrl: ''
    }));
    setImagePreview('');
    setImageUploadStatus({ loading: false, error: null });
  };

  const handleDurationSelectChange = (horarioId, value) => {
    if (!horarioId) {
      return;
    }
    const idStr = horarioId.toString();
    const horarioInfo = resolveHorarioInfo(horarioId);
    const slotDuration = clampDurationValue(
      calculateScheduleDuration(horarioInfo) || formData.duracionClaseMinutos || 120,
      formData.duracionClaseMinutos || 120
    );
    const selectedDuration = clampDurationValue(value, slotDuration || formData.duracionClaseMinutos || 120);
    const adjusted = Math.min(selectedDuration, slotDuration || selectedDuration);
    setScheduleDurations((prev) => ({
      ...prev,
      [idStr]: adjusted
    }));
  };

  const handleDefaultDurationChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      duracionClaseMinutos: clampDurationValue(value, prev.duracionClaseMinutos || 120)
    }));
  };

  const applyDefaultDurationToAll = () => {
    const defaultDuration = clampDurationValue(formData.duracionClaseMinutos || 120);
    setScheduleDurations((prev) => {
      const updated = { ...prev };
      (formData.horarios || []).forEach((horarioId) => {
        const idStr = horarioId.toString();
        const horarioInfo = resolveHorarioInfo(horarioId);
        const slotDuration = clampDurationValue(
          calculateScheduleDuration(horarioInfo) || defaultDuration,
          defaultDuration
        );
        updated[idStr] = Math.min(defaultDuration, slotDuration || defaultDuration);
      });
      return updated;
    });
  };

  const toggleSchedule = (horarioId) => {
    if (!horarioId) {
      return;
    }
    const idStr = horarioId.toString();
    const currentHorariosIds = (formData.horarios || []).map((id) => id.toString());
    const isAlreadySelected = currentHorariosIds.includes(idStr);

    if (!isAlreadySelected && currentHorariosIds.length >= 3) {
      alert('Puede seleccionar máximo 3 horarios por curso');
      return;
    }

    const horarioInfo = resolveHorarioInfo(horarioId);
    const slotDuration = clampDurationValue(
      calculateScheduleDuration(horarioInfo) || formData.duracionClaseMinutos || 120,
      formData.duracionClaseMinutos || 120
    );

    setFormData((prev) => {
      const prevIds = (prev.horarios || []).map((id) => id.toString());
      let newHorarios;
      if (isAlreadySelected) {
        newHorarios = prevIds.filter((id) => id !== idStr);
      } else {
        newHorarios = [...prevIds, idStr];
      }
      return {
        ...prev,
        horarios: newHorarios,
        horario: newHorarios.length > 0 ? newHorarios[0] : ''
      };
    });

    setScheduleDurations((prev) => {
      if (isAlreadySelected) {
        const { [idStr]: _removed, ...rest } = prev;
        return rest;
      }
      const defaultDuration = clampDurationValue(
        prev[idStr] || formData.duracionClaseMinutos || slotDuration || 120,
        slotDuration || formData.duracionClaseMinutos || 120
      );
      return {
        ...prev,
        [idStr]: Math.min(defaultDuration, slotDuration || defaultDuration)
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Validate that a teacher and at least one schedule have been selected
      if (!formData.profesor) {
        alert('Por favor seleccione un profesor');
        return;
      }
      
      if (!formData.type) {
        alert('Por favor selecciona un formato tipo de curso');
        return;
      }

      if (!formData.modalidad) {
        alert('Por favor selecciona la modalidad del curso');
        return;
      }

      const horariosSeleccionados = formData.horarios && formData.horarios.length > 0 
        ? formData.horarios 
        : (formData.horario ? [formData.horario] : []);
      
      if (horariosSeleccionados.length === 0) {
        alert('Por favor seleccione al menos un horario');
        return;
      }
      
      if (horariosSeleccionados.length > 3) {
        alert('Puede seleccionar máximo 3 horarios por curso');
        return;
      }

      const horariosDuraciones = horariosSeleccionados.map((horarioId) => {
        const idStr = horarioId.toString();
        const horarioInfo = resolveHorarioInfo(horarioId);
        const slotDuration = clampDurationValue(
          calculateScheduleDuration(horarioInfo) || formData.duracionClaseMinutos || 120,
          formData.duracionClaseMinutos || 120
        );
        const selectedDuration = clampDurationValue(
          scheduleDurations[idStr] || formData.duracionClaseMinutos || slotDuration,
          slotDuration || formData.duracionClaseMinutos || 120
        );
        const duracionMinutos = Math.min(selectedDuration, slotDuration || selectedDuration);
        return {
          horario: horarioId,
          duracionMinutos
        };
      });

      const duracionClaseMinutos = clampDurationValue(
        formData.duracionClaseMinutos || (horariosDuraciones[0]?.duracionMinutos) || 120
      );
      
      let response;
      // Convert numbers and ensure data matches the model
      const dataToSave = { 
        ...formData,
        // Use horarios if available, otherwise use horario for compatibility
        horarios: horariosSeleccionados,
        horario: horariosSeleccionados.length > 0 ? horariosSeleccionados[0] : formData.horario, // Compatibility
        duracionTotal: Number(formData.duracionTotal),
        tarifa: Number(formData.tarifa),
        duracionClaseMinutos,
        horariosDuraciones: horariosDuraciones.map((item) => ({
          horario: item.horario,
          duracionMinutos: Number(item.duracionMinutos)
        })),
        modalidad: formData.modalidad,
        type: formData.type,
        // Ensure dates are in correct format
        fechaInicio: formData.fechaInicio ? new Date(formData.fechaInicio).toISOString() : undefined,
        fechaFin: formData.fechaFin ? new Date(formData.fechaFin).toISOString() : undefined,
      };

      // Remove empty fields, undefined, or empty arrays
      Object.keys(dataToSave).forEach(key => {
        const value = dataToSave[key];
        if (value === '' || value === undefined || (Array.isArray(value) && value.length === 0)) {
          delete dataToSave[key];
        }
      });

      console.log('Datos a enviar:', dataToSave);

      if (course) {
        // Update existing course
        response = await apiAdapter.courses.update(course._id, dataToSave);
      } else {
        // Create new course
        response = await apiAdapter.courses.create(dataToSave);
      }
      
      if (response.data.success) {
        onSave(); // Calls parent refresh function and closes modal
      } else {
        // Better to show backend error if it exists
        const errorMsg = response.data.error || (response.data.errors ? response.data.errors.map(err => err.msg).join(', ') : 'Error desconocido');
        alert(`Error al guardar: ${errorMsg}`);
      }
    } catch (error) {
      console.error("Error en handleSubmit:", error);
      // Catch errors from response (e.g. validation)
      const errorMsg = error.response?.data?.message 
        || error.response?.data?.error 
        || (error.response?.data?.errors && error.response.data.errors.map(e => e.msg).join(', '))
        || error.message;
      console.error("Error completo:", error.response?.data);
      alert(`Error al enviar: ${errorMsg}`);
    }
  };

  // Ensure teachers is a valid array
  const teachersList = Array.isArray(teachers) ? teachers : [];
  
  return (
    <div style={{
      background: '#ffffff',
      borderRadius: '12px',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
      maxWidth: '700px',
      width: '90%',
      maxHeight: '90vh',
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 1001
    }}>
      <div style={{
        padding: '1.5rem',
        borderBottom: '1px solid #dee2e6',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: '#f8f9fa',
        borderRadius: '12px 12px 0 0'
      }}>
        <h3 style={{
          margin: 0,
          fontSize: '1.5rem',
          fontWeight: '600',
          color: '#2c3e50'
        }}>
          {course ? 'Editar Curso' : 'Crear Nuevo Curso'}
        </h3>
        <button 
          onClick={onClose} 
          style={{
            background: 'transparent',
            border: 'none',
            fontSize: '2rem',
            cursor: 'pointer',
            color: '#6c757d',
            padding: '0',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '4px',
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => e.target.style.background = '#e9ecef'}
          onMouseOut={(e) => e.target.style.background = 'transparent'}
        >
          ×
        </button>
      </div>
      
      <div style={{ maxHeight: 'calc(90vh - 120px)', overflowY: 'auto' }}>
        <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
          
          <div style={{ marginBottom: '1rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: '600',
              color: '#495057',
              fontSize: '0.9rem'
            }}>
              Nombre del Curso *
            </label>
            <input 
              name="nombre" 
              value={formData.nombre} 
              onChange={handleChange} 
              placeholder="Nombre del Curso" 
              required 
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ced4da',
                borderRadius: '6px',
                fontSize: '0.9rem',
                boxSizing: 'border-box'
              }} 
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontWeight: '600',
                color: '#495057',
                fontSize: '0.9rem'
              }}>
                Idioma *
              </label>
              <select 
                name="idioma" 
                value={formData.idioma} 
                onChange={handleChange} 
                required 
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ced4da',
                  borderRadius: '6px',
                  fontSize: '0.9rem',
                  boxSizing: 'border-box',
                  background: 'white'
                }}
              >
                {idiomaOptions.map(opt => <option key={opt} value={opt}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontWeight: '600',
                color: '#495057',
                fontSize: '0.9rem'
              }}>
                Nivel *
              </label>
              <select 
                name="nivel" 
                value={formData.nivel} 
                onChange={handleChange} 
                required 
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ced4da',
                  borderRadius: '6px',
                  fontSize: '0.9rem',
                  boxSizing: 'border-box',
                  background: 'white'
                }}
              >
                {nivelOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
          </div>
          
          <div style={{ marginBottom: '1rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: '600',
              color: '#495057',
              fontSize: '0.9rem'
            }}>
              Descripción
            </label>
            <textarea 
              name="descripcion" 
              value={formData.descripcion} 
              onChange={handleChange} 
              placeholder="Descripción del curso" 
              rows="3" 
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ced4da',
                borderRadius: '6px',
                fontSize: '0.9rem',
                boxSizing: 'border-box',
                fontFamily: 'inherit',
                resize: 'vertical'
              }} 
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontWeight: '600',
                color: '#495057',
                fontSize: '0.9rem'
              }}>
                Modalidad *
              </label>
              <div style={{ display: 'flex', gap: '1rem' }}>
                {modalidadOptions.map(option => (
                  <label key={option.value} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: '#495057' }}>
                    <input
                      type="radio"
                      name="modalidad"
                      value={option.value}
                      checked={formData.modalidad === option.value}
                      onChange={handleChange}
                      required
                    />
                    {option.label}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontWeight: '600',
                color: '#495057',
                fontSize: '0.9rem'
              }}>
                Formato *
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ced4da',
                  borderRadius: '6px',
                  fontSize: '0.9rem',
                  boxSizing: 'border-box',
                  background: 'white'
                }}
              >
                {tipoOptions.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
          </div>

          {/* --- CAMPO PROFESOR (MODIFICADO) --- */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: '600',
              color: '#495057',
              fontSize: '0.9rem'
            }}>
              Profesor *
            </label>
            <select 
              name="profesor"
              value={formData.profesor}
              onChange={handleChange} 
              required
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ced4da',
                borderRadius: '6px',
                fontSize: '0.9rem',
                boxSizing: 'border-box',
                background: 'white'
              }}
            >
              <option value="">Seleccionar Profesor</option>
              {teachersList.length > 0 ? (
                teachersList.map(t => (
                  <option key={t._id} value={t._id}>
                    {t.firstName} {t.lastName}
                  </option>
                ))
              ) : (
                <option value="" disabled>No hay profesores disponibles</option>
              )}
            </select>
            {teachersList.length === 0 && (
              <p style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#dc3545' }}>
                No se pudieron cargar los profesores. Por favor, recarga la página.
              </p>
            )}
          </div>
          
          {/* --- CAMPO HORARIOS (MÚLTIPLES DÍAS) --- */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: '600',
              color: '#495057',
              fontSize: '0.9rem'
            }}>
              Horarios (Seleccione 2-3 días por semana) *
            </label>
            {!formData.profesor ? (
              <p style={{ fontSize: '0.85rem', color: '#6c757d', fontStyle: 'italic' }}>
                Seleccione un profesor primero para ver los horarios disponibles
              </p>
            ) : isLoadingSchedules ? (
              <p style={{ fontSize: '0.85rem', color: '#6c757d' }}>Cargando horarios...</p>
            ) : availableSchedules.length === 0 ? (
              <p style={{ fontSize: '0.85rem', color: '#dc3545' }}>
                Este profesor no tiene horarios disponibles configurados. Por favor configure los horarios permitidos en la gestión de profesores.
              </p>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: '0.75rem',
                maxHeight: '200px',
                overflowY: 'auto',
                padding: '0.75rem',
                border: '1px solid #ced4da',
                borderRadius: '6px',
                backgroundColor: '#f8f9fa'
              }}>
                {availableSchedules.map(h => {
                  const horarioId = h._id ? (typeof h._id === 'object' ? h._id.toString() : h._id.toString()) : h.id;
                  const currentHorariosIds = (formData.horarios || []).map(id => id.toString());
                  const isSelected = currentHorariosIds.includes(horarioId);
                  
                  const diaCapitalizado = h.dia ? h.dia.charAt(0).toUpperCase() + h.dia.slice(1) : '';
                  const displayText = h.display || `${diaCapitalizado} ${h.horaInicio || ''}-${h.horaFin || ''}`;
                  const baseSlotDuration = calculateScheduleDuration(h) || formData.duracionClaseMinutos || 120;
                  const selectedDuration = clampDurationValue(
                    scheduleDurations[horarioId] || formData.duracionClaseMinutos || baseSlotDuration,
                    baseSlotDuration
                  );
                  
                  return (
                    <div
                      key={horarioId}
                      onClick={() => toggleSchedule(horarioId)}
                      style={{
                        padding: '0.75rem',
                        border: `2px solid ${isSelected ? '#3498db' : '#ced4da'}`,
                        borderRadius: '6px',
                        cursor: 'pointer',
                        backgroundColor: isSelected ? '#e3f2fd' : 'white',
                        color: '#495057',
                        fontSize: '0.85rem',
                        fontWeight: isSelected ? '600' : '400',
                        transition: 'all 0.2s ease',
                        textAlign: 'center',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.35rem'
                      }}
                    >
                      <span>{displayText}</span>
                      {isSelected && (
                        <span style={{ fontSize: '0.75rem', color: '#1d4ed8', fontWeight: 600 }}>
                          {formatDurationLabel(selectedDuration)}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
            {formData.horarios && formData.horarios.length > 0 && (
              <div style={{
                marginTop: '0.75rem',
                padding: '0.75rem',
                border: '1px dashed #ced4da',
                borderRadius: '6px',
                background: '#f9fafb',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 600, color: '#1f2937' }}>Duración predeterminada</span>
                  <select
                    value={formData.duracionClaseMinutos}
                    onChange={(e) => handleDefaultDurationChange(e.target.value)}
                    style={{
                      padding: '0.5rem 0.75rem',
                      borderRadius: '6px',
                      border: '1px solid #d1d5db',
                      background: '#fff',
                      fontSize: '0.85rem'
                    }}
                  >
                    {durationOptions.map((option) => (
                      <option key={option} value={option}>
                        {formatDurationLabel(option)}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={applyDefaultDurationToAll}
                    style={{
                      padding: '0.45rem 0.85rem',
                      borderRadius: '6px',
                      border: '1px solid #2563eb',
                      background: '#2563eb',
                      color: '#fff',
                      fontSize: '0.8rem',
                      cursor: 'pointer'
                    }}
                  >
                    Aplicar a todos
                  </button>
                  <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                    {formData.horarios.length} horario(s) seleccionado(s)
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.75rem' }}>
                  {formData.horarios.map((horarioId) => {
                    const horarioInfo = resolveHorarioInfo(horarioId);
                    const display = formatScheduleDisplay(horarioInfo, horarioId);
                    const slotDuration = clampDurationValue(calculateScheduleDuration(horarioInfo) || formData.duracionClaseMinutos || 120);
                    const value = clampDurationValue(scheduleDurations[horarioId] || formData.duracionClaseMinutos || slotDuration, slotDuration);
                    return (
                      <div
                        key={horarioId}
                        style={{
                          padding: '0.75rem',
                          background: '#fff',
                          borderRadius: '6px',
                          border: '1px solid #e5e7eb',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.5rem'
                        }}
                      >
                        <span style={{ fontWeight: 600, color: '#1f2937' }}>{display}</span>
                        <select
                          value={value}
                          onChange={(e) => handleDurationSelectChange(horarioId, e.target.value)}
                          style={{
                            padding: '0.5rem 0.75rem',
                            borderRadius: '6px',
                            border: '1px solid #d1d5db',
                            background: '#fff',
                            fontSize: '0.85rem'
                          }}
                        >
                          {durationOptions.map((option) => {
                            if (option > slotDuration) {
                              return null;
                            }
                            return (
                              <option key={option} value={option}>
                                {formatDurationLabel(option)}
                              </option>
                            );
                          })}
                        </select>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontWeight: '600',
                color: '#495057',
                fontSize: '0.9rem'
              }}>
                Duración (Horas) *
              </label>
              <input 
                name="duracionTotal" 
                type="number" 
                value={formData.duracionTotal} 
                onChange={handleChange} 
                required 
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ced4da',
                  borderRadius: '6px',
                  fontSize: '0.9rem',
                  boxSizing: 'border-box'
                }} 
              />
            </div>
            <div>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontWeight: '600',
                color: '#495057',
                fontSize: '0.9rem'
              }}>
                Tarifa (por hora) *
              </label>
              <input 
                name="tarifa" 
                type="number" 
                value={formData.tarifa} 
                onChange={handleChange} 
                required 
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ced4da',
                  borderRadius: '6px',
                  fontSize: '0.9rem',
                  boxSizing: 'border-box'
                }} 
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontWeight: '600',
                color: '#495057',
                fontSize: '0.9rem'
              }}>
                Fecha Inicio *
              </label>
              <input 
                name="fechaInicio" 
                type="date" 
                value={formData.fechaInicio} 
                onChange={handleChange} 
                required 
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ced4da',
                  borderRadius: '6px',
                  fontSize: '0.9rem',
                  boxSizing: 'border-box'
                }} 
              />
            </div>
            <div>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontWeight: '600',
                color: '#495057',
                fontSize: '0.9rem'
              }}>
                Fecha Fin *
              </label>
              <input 
                name="fechaFin" 
                type="date" 
                value={formData.fechaFin} 
                onChange={handleChange} 
                required 
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ced4da',
                  borderRadius: '6px',
                  fontSize: '0.9rem',
                  boxSizing: 'border-box'
                }} 
              />
            </div>
          </div>

          {/* --- CAMPO DE IMAGEN --- */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: '600',
              color: '#495057',
              fontSize: '0.9rem'
            }}>
              Imagen del curso
            </label>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageFileChange}
                disabled={imageUploadStatus.loading}
                style={{ fontSize: '0.85rem' }}
              />
              {formData.imageUrl && (
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  style={{
                    padding: '0.5rem 0.85rem',
                    border: '1px solid #ced4da',
                    borderRadius: '6px',
                    background: 'white',
                    color: '#495057',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                  onMouseOver={(e) => (e.target.style.background = '#f8f9fa')}
                  onMouseOut={(e) => (e.target.style.background = 'white')}
                >
                  Quitar imagen
                </button>
              )}
            </div>
            {imageUploadStatus.loading && (
              <p style={{ marginBottom: '0.5rem', color: '#1f76d3', fontSize: '0.85rem' }}>
                Subiendo imagen...
              </p>
            )}
            {imageUploadStatus.error && (
              <p style={{ marginBottom: '0.5rem', color: '#e74c3c', fontSize: '0.85rem' }}>
                {imageUploadStatus.error}
              </p>
            )}
            {imagePreview && (
              <div style={{ marginBottom: '0.75rem' }}>
                <img
                  src={imagePreview}
                  alt="Vista previa del curso"
                  style={{
                    maxWidth: '100%',
                    borderRadius: '8px',
                    border: '1px solid #dee2e6',
                    objectFit: 'cover'
                  }}
                />
              </div>
            )}
            <input 
              name="imageUrl" 
              value={formData.imageUrl} 
              onChange={handleChange} 
              placeholder="https://ejemplo.com/imagen.png" 
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ced4da',
                borderRadius: '6px',
                fontSize: '0.9rem',
                boxSizing: 'border-box'
              }} 
            />
            <p style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#6c757d' }}>
              Podés subir un archivo o pegar una URL pública (por ejemplo, de Cloudinary).
            </p>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: '600',
              color: '#495057',
              fontSize: '0.9rem'
            }}>
              Estado *
            </label>
            <select 
              name="estado" 
              value={formData.estado} 
              onChange={handleChange} 
              required 
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ced4da',
                borderRadius: '6px',
                fontSize: '0.9rem',
                boxSizing: 'border-box',
                background: 'white'
              }}
            >
              {estadoOptions.map(opt => <option key={opt} value={opt}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</option>)}
            </select>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', paddingTop: '1rem', borderTop: '1px solid #dee2e6' }}>
            <button 
              type="button" 
              onClick={onClose} 
              style={{
                padding: '0.75rem 1.5rem',
                border: '1px solid #ced4da',
                borderRadius: '6px',
                background: 'white',
                color: '#495057',
                fontSize: '0.9rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => e.target.style.background = '#f8f9fa'}
              onMouseOut={(e) => e.target.style.background = 'white'}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              disabled={isLoadingSchedules}
              style={{
                padding: '0.75rem 1.5rem',
                border: 'none',
                borderRadius: '6px',
                background: isLoadingSchedules ? '#6c757d' : 'linear-gradient(135deg, #27ae60, #229954)',
                color: 'white',
                fontSize: '0.9rem',
                fontWeight: '600',
                cursor: isLoadingSchedules ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {isLoadingSchedules ? "Cargando..." : (course ? 'Guardar Cambios' : 'Crear Curso')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CourseFormModal;