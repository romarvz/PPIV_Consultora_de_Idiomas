// /client/src/components/courses/CourseFormModal.jsx

import React, { useState, useEffect } from 'react';
import apiAdapter from '../../services/apiAdapter'; // Asumo que este tiene 'get', 'create', 'update'

const CourseFormModal = ({ course, onClose, onSave, teachers }) => {
  
  // Estado inicial alineado con el modelo del backend (Curso.js)
  const getInitialFormData = () => ({
    nombre: '',
    descripcion: '',
    idioma: 'ingles', // Valor por defecto
    nivel: 'A1',      // Valor por defecto
    duracionTotal: 10,
    tarifa: 0,
    fechaInicio: new Date().toISOString().split('T')[0],
    fechaFin: new Date().toISOString().split('T')[0],
    profesor: '', // ID del profesor
    horario: '',  // ID del horario
    estado: 'planificado',
    imageUrl: '',
    requisitos: '',
    objetivos: '',
    // Estos campos ('type', 'modality') no estaban en tu modelo Curso.js
    // Si los agregaste, descomenta. Si no, mantenlos fuera del state.
    // type: 'Curso Grupal', 
    // modality: 'Online', 
  });

  const [formData, setFormData] = useState(getInitialFormData());

  // Estado para los horarios dinámicos
  const [availableSchedules, setAvailableSchedules] = useState([]);
  const [isLoadingSchedules, setIsLoadingSchedules] = useState(false);

  // Opciones para los <select> (basadas en los enums del backend)
  const idiomaOptions = ['ingles', 'frances', 'aleman', 'italiano', 'portugues', 'chino', 'japones', 'coreano'];
  const nivelOptions = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  const estadoOptions = ['planificado', 'activo', 'completado', 'cancelado'];

  // Función para cargar horarios de un profesor
  const fetchSchedules = async (profesorId) => {
    if (!profesorId) {
      setAvailableSchedules([]);
      return;
    }
    setIsLoadingSchedules(true);
    try {
      // Esta es la ruta que creamos en el backend
      // Asegúrate que tu apiAdapter pueda hacer un GET a esta ruta
      const response = await apiAdapter.get(`/cursos/profesor/${profesorId}/horarios-disponibles`);
      
      if (response.data.success) {
        setAvailableSchedules(response.data.data);
      } else {
        setAvailableSchedules([]);
      }
    } catch (error) {
      console.error("Error cargando horarios:", error);
      alert('Error al cargar los horarios del profesor.');
      setAvailableSchedules([]);
    } finally {
      setIsLoadingSchedules(false);
    }
  };

  useEffect(() => {
    if (course) {
      // Poblar formulario si estamos editando
      // Nos aseguramos de manejar IDs y objetos populados
      const profesorId = course.profesor ? (typeof course.profesor === 'object' ? course.profesor._id : course.profesor) : '';
      const horarioId = course.horario ? (typeof course.horario === 'object' ? course.horario._id : course.horario) : '';

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
        horario: horarioId,
        estado: course.estado || 'planificado',
        imageUrl: course.imageUrl || '',
        requisitos: course.requisitos || '',
        objetivos: course.objetivos || '',
      });
      
      // Si editamos un curso, cargar los horarios de su profesor
      if (profesorId) {
        fetchSchedules(profesorId);
      }
    } else {
      // Resetear a valores por defecto si es 'nuevo curso'
      setFormData(getInitialFormData());
      setAvailableSchedules([]);
    }
  }, [course]); // Dependencia: se ejecuta si 'course' cambia

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // --- ¡AQUÍ LA MAGIA! ---
    // Si el campo que cambió es 'profesor'...
    if (name === 'profesor') {
      // Limpiar el horario anterior
      setFormData(prev => ({ ...prev, horario: '' }));
      // Buscar los nuevos horarios con el ID del profesor (value)
      fetchSchedules(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let response;
      // Convertir números y asegurar que los datos coincidan con el modelo
      const dataToSave = { 
        ...formData, 
        duracionTotal: Number(formData.duracionTotal),
        tarifa: Number(formData.tarifa),
      };

      if (course) {
        // Asumo apiAdapter.courses.update
        response = await apiAdapter.courses.update(course._id, dataToSave);
      } else {
        // Asumo apiAdapter.courses.create
        response = await apiAdapter.courses.create(dataToSave);
      }
      
      if (response.data.success) {
        onSave(); // Llama a la función de refresco del padre y cierra el modal
      } else {
        // Mejor mostrar el error del backend si existe
        const errorMsg = response.data.error || (response.data.errors ? response.data.errors.map(err => err.msg).join(', ') : 'Error desconocido');
        alert(`Error al guardar: ${errorMsg}`);
      }
    } catch (error) {
      console.error("Error en handleSubmit:", error);
      // Capturar errores de la respuesta (ej. validación)
      const errorMsg = error.response?.data?.error || error.message;
      alert(`Error al enviar: ${errorMsg}`);
    }
  };

  // (Estilos en línea omitidos por brevedad, son los mismos que pasaste)
  // ...
  
  return (
    <div style={{ /* Estilo Modal */ }}>
      <div style={{ /* Estilo Header */ }}>
        <h3 style={{ /* Estilo Título */ }}>
          {course ? 'Editar Curso' : 'Crear Nuevo Curso'}
        </h3>
        <button onClick={onClose} style={{ /* Estilo Botón Cerrar */ }}>×</button>
      </div>
      
      <div style={{ maxHeight: 'calc(100vh - 160px)', overflowY: 'auto' }}>
        <form onSubmit={handleSubmit} style={{ padding: '0 24px 24px 24px' }}>
          
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ /* Estilo Label */ }}>Nombre del Curso *</label>
            <input name="nombre" value={formData.nombre} onChange={handleChange} placeholder="Nombre del Curso" required style={{ /* Estilo Input */ }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ /* Estilo Label */ }}>Idioma *</label>
              <select name="idioma" value={formData.idioma} onChange={handleChange} required style={{ /* Estilo Select */ }}>
                {idiomaOptions.map(opt => <option key={opt} value={opt}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label style={{ /* Estilo Label */ }}>Nivel *</label>
              <select name="nivel" value={formData.nivel} onChange={handleChange} required style={{ /* Estilo Select */ }}>
                {nivelOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
          </div>
          
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ /* Estilo Label */ }}>Descripción</label>
            <textarea name="descripcion" value={formData.descripcion} onChange={handleChange} placeholder="Descripción del curso" rows="3" style={{ /* Estilo Textarea */ }} />
          </div>

          {/* --- CAMPO PROFESOR (MODIFICADO) --- */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ /* Estilo Label */ }}>Profesor *</label>
            <select 
              name="profesor" // Alineado con el state
              value={formData.profesor} // Alineado con el state
              onChange={handleChange} 
              required
              style={{ /* Estilo Select */ }}
            >
              <option value="">Seleccionar Profesor</option>
              {teachers.map(t => <option key={t._id} value={t._id}>{t.firstName} {t.lastName}</option>)}
            </select>
          </div>
          
          {/* --- CAMPO HORARIO (NUEVO Y DINÁMICO) --- */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ /* Estilo Label */ }}>Horario *</label>
            <select 
              name="horario" // Alineado con el state
              value={formData.horario} // Alineado con el state
              onChange={handleChange} 
              required
              style={{ /* Estilo Select */ }}
              disabled={!formData.profesor || isLoadingSchedules} // Deshabilitado si no hay profesor
            >
              <option value="">
                {isLoadingSchedules 
                  ? "Cargando horarios..." 
                  : !formData.profesor 
                    ? "Seleccione un profesor primero"
                    : (availableSchedules.length > 0 ? "Seleccionar Horario" : "Profesor sin horarios disponibles")
                }
              </option>
              {availableSchedules.map(h => (
                <option key={h._id} value={h._id}>
                  {h.display} {/* Usamos el virtual 'display' del backend */}
                </option>
              ))}
            </select>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ /* Estilo Label */ }}>Duración (Horas) *</label>
              <input name="duracionTotal" type="number" value={formData.duracionTotal} onChange={handleChange} required style={{ /* Estilo Input */ }} />
            </div>
            <div>
              <label style={{ /* Estilo Label */ }}>Tarifa (por hora) *</label>
              <input name="tarifa" type="number" value={formData.tarifa} onChange={handleChange} required style={{ /* Estilo Input */ }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ /* Estilo Label */ }}>Fecha Inicio *</label>
              <input name="fechaInicio" type="date" value={formData.fechaInicio} onChange={handleChange} required style={{ /* Estilo Input */ }} />
            </div>
            <div>
              <label style={{ /* Estilo Label */ }}>Fecha Fin *</label>
              <input name="fechaFin" type="date" value={formData.fechaFin} onChange={handleChange} required style={{ /* Estilo Input */ }} />
            </div>
          </div>

          {/* --- CAMPO SOLICITADO (IMAGEN) --- */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ /* Estilo Label */ }}>URL de la Imagen</label>
            <input name="imageUrl" value={formData.imageUrl} onChange={handleChange} placeholder="https://ejemplo.com/imagen.png" style={{ /* Estilo Input */ }} />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ /* Estilo Label */ }}>Estado *</label>
            <select name="estado" value={formData.estado} onChange={handleChange} required style={{ /* Estilo Select */ }}>
              {estadoOptions.map(opt => <option key={opt} value={opt}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</option>)}
            </select>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', paddingTop: '1rem', borderTop: '1px solid #dee2e6' }}>
            <button type="button" onClick={onClose} style={{ /* Estilo Botón Cancelar */ }}>
              Cancelar
            </button>
            <button type="submit" style={{ /* Estilo Botón Guardar */ }} disabled={isLoadingSchedules}>
              {isLoadingSchedules ? "Cargando..." : (course ? 'Guardar Cambios' : 'Crear Curso')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CourseFormModal;