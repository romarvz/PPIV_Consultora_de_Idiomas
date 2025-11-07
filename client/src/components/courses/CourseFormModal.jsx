// /client/src/components/courses/CourseFormModal.jsx

import React, { useState, useEffect } from 'react';
import apiAdapter from '../../services/apiAdapter'; // 'get', 'create', 'update'

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
    estado: 'planificado',
    imageUrl: '',
    requisitos: '',
    objetivos: '',
  });

  const [formData, setFormData] = useState(getInitialFormData());

  // State for dynamic schedules
  const [availableSchedules, setAvailableSchedules] = useState([]);
  const [isLoadingSchedules, setIsLoadingSchedules] = useState(false);

  // Options for <select> elements (based on backend enums)
  const idiomaOptions = ['ingles', 'frances', 'aleman', 'italiano', 'portugues', 'chino', 'japones', 'coreano'];
  const nivelOptions = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  const estadoOptions = ['planificado', 'activo', 'completado', 'cancelado'];

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
        estado: course.estado || 'planificado',
        imageUrl: course.imageUrl || '',
        requisitos: course.requisitos || '',
        objetivos: course.objetivos || '',
      });
      
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
    }
  }, [course]); // Dependency: runs if 'course' changes

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
      // Fetch new schedules with teacher ID (value)
      // If editing, exclude current course
      const cursoId = course ? (course._id || course.id) : null;
      fetchSchedules(value, cursoId);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Validate that a teacher and at least one schedule have been selected
      if (!formData.profesor) {
        alert('Por favor seleccione un profesor');
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

      let response;
      // Convert numbers and ensure data matches the model
      const dataToSave = { 
        ...formData,
        // Use horarios if available, otherwise use horario for compatibility
        horarios: horariosSeleccionados,
        horario: horariosSeleccionados.length > 0 ? horariosSeleccionados[0] : formData.horario, // Compatibility
        duracionTotal: Number(formData.duracionTotal),
        tarifa: Number(formData.tarifa),
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
                  // Normalize IDs for comparison (may come as objects or strings)
                  const horarioId = h._id ? (typeof h._id === 'object' ? h._id.toString() : h._id.toString()) : h.id;
                  const currentHorariosIds = (formData.horarios || []).map(id => id.toString());
                  const isSelected = currentHorariosIds.includes(horarioId);
                  
                  const diaCapitalizado = h.dia ? h.dia.charAt(0).toUpperCase() + h.dia.slice(1) : '';
                  const displayText = h.display || `${diaCapitalizado} ${h.horaInicio || ''}-${h.horaFin || ''}`;
                  
                  return (
                    <div
                      key={horarioId}
                      onClick={() => {
                        setFormData(prev => {
                          const currentHorarios = prev.horarios || [];
                          const currentHorariosIds = currentHorarios.map(id => id.toString());
                          const isAlreadySelected = currentHorariosIds.includes(horarioId);
                          
                          let newHorarios;
                          if (isAlreadySelected) {
                            // Remove if already selected
                            newHorarios = currentHorarios.filter(id => id.toString() !== horarioId);
                          } else {
                            // Add if not selected (max 3)
                            if (currentHorarios.length < 3) {
                              newHorarios = [...currentHorarios, horarioId];
                            } else {
                              alert('Puede seleccionar máximo 3 horarios por curso');
                              return prev;
                            }
                          }
                          
                          return {
                            ...prev,
                            horarios: newHorarios,
                            horario: newHorarios.length > 0 ? newHorarios[0] : '' // Maintain compatibility
                          };
                        });
                      }}
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
                        textAlign: 'center'
                      }}
                    >
                      {displayText}
                    </div>
                  );
                })}
              </div>
            )}
            {formData.horarios && formData.horarios.length > 0 && (
              <p style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#28a745', fontWeight: '500' }}>
                {formData.horarios.length} horario(s) seleccionado(s)
              </p>
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

          {/* --- CAMPO SOLICITADO (IMAGEN) --- */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: '600',
              color: '#495057',
              fontSize: '0.9rem'
            }}>
              URL de la Imagen
            </label>
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