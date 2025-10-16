import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { 
  FaEdit, 
  FaTrash, 
  FaPlus,
  FaUserGraduate,
  FaClock,
  FaBook,
  FaEnvelope,
  FaPhone,
  FaCalendarAlt
} from 'react-icons/fa';
import api from '../services/api';
import RegisterTeacher from './RegisterTeacher';
import AdminSectionHeader from './common/AdminSectionHeader';

// Componente SearchInput optimizado y simple
const SearchInput = memo(({ onSearch, placeholder }) => {
  const [value, setValue] = useState('');
  const [timerId, setTimerId] = useState(null);

  const handleChange = useCallback((e) => {
    const newValue = e.target.value;
    setValue(newValue);

    // Cancelar búsqueda anterior
    if (timerId) {
      clearTimeout(timerId);
    }

    // Nueva búsqueda con debounce
    const newTimerId = setTimeout(() => {
      onSearch(newValue);
    }, 300);
    
    setTimerId(newTimerId);
  }, [onSearch, timerId]);

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      if (timerId) {
        clearTimeout(timerId);
      }
    };
  }, [timerId]);

  return (
    <div style={{ position: 'relative', flex: '1', minWidth: '250px' }}>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        style={{
          width: '100%',
          padding: '0.75rem',
          border: '1px solid #ddd',
          borderRadius: '6px',
          fontSize: '0.9rem',
          height: '48px',
          boxSizing: 'border-box'
        }}
      />
    </div>
  );
});

SearchInput.displayName = 'SearchInput';

const TeachersManagement = ({ onBack }) => {
  // Estados principales
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTeachers, setTotalTeachers] = useState(0);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  // Estado para estadísticas - SOLO SE CARGA UNA VEZ
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0 });

  // Estado para idiomas dinámicos
  const [languages, setLanguages] = useState([]);
  const [languagesLoading, setLanguagesLoading] = useState(true);

  const itemsPerPage = 10;

  // Función para cargar estadísticas - SOLO UNA VEZ
  useEffect(() => {
    let isMounted = true;
    
    const loadStats = async () => {
      try {
        const response = await api.get('/teachers/stats');
        if (response.data.success && isMounted) {
          setStats({
            total: response.data.data.overview.total || 0,
            active: response.data.data.overview.active || 0,
            inactive: response.data.data.overview.inactive || 0
          });
        }
      } catch (error) {
        // Silencioso
      }
    };

    loadStats();
    
    return () => {
      isMounted = false;
    };
  }, []); // Sin dependencias - solo una vez

  // Función para cargar idiomas - SOLO UNA VEZ
  useEffect(() => {
    const loadLanguages = async () => {
      try {
        const response = await api.get('/languages');
        if (response.data.success) {
          setLanguages(response.data.data.languages.filter(lang => lang.isActive));
        }
      } catch (error) {
        console.error('Error loading languages:', error);
      } finally {
        setLanguagesLoading(false);
      }
    };

    loadLanguages();
  }, []);

  // Función para cargar profesores - SE EJECUTA CUANDO CAMBIAN LOS FILTROS
  useEffect(() => {
    let isMounted = true;
    
    const loadTeachers = async () => {
      try {
        setLoading(true);

        const params = {
          page: currentPage,
          limit: itemsPerPage,
          ...(searchTerm && { search: searchTerm }),
          ...(filterStatus !== 'all' && { status: filterStatus })
        };

        const response = await api.get('/teachers', { params });

        if (response.data.success && isMounted) {
          setTeachers(response.data.data.teachers || []);
          setTotalPages(response.data.data.totalPages || 1);
          setTotalTeachers(response.data.data.total || 0);
        } else if (isMounted) {
          setTeachers([]);
        }
      } catch (error) {
        if (isMounted) {
          setTeachers([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadTeachers();
    
    return () => {
      isMounted = false;
    };
  }, [currentPage, searchTerm, filterStatus]); // Solo estas dependencias

  // Handlers estables
  const handleSearchChange = useCallback((value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  }, []);

  const handleFilterStatusChange = useCallback((e) => {
    setFilterStatus(e.target.value);
    setCurrentPage(1);
  }, []);

  const handleEdit = useCallback((teacher) => {
    setEditingTeacher(teacher);
    setShowEditModal(true);
  }, []);

  const handleDelete = useCallback(async (teacherId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este profesor?')) {
      try {
        const response = await api.delete(`/teachers/${teacherId}`);
        if (response.data.success) {
          // Recargar lista
          setCurrentPage(1);
          setSearchTerm(''); // Reset search to reload all
        }
      } catch (error) {
        console.error('Error deleting teacher:', error);
      }
    }
  }, []);

  // Funciones para el modal de registro
  const handleNewTeacher = useCallback(() => {
    setShowRegisterModal(true);
  }, []);

  const handleRegisterSuccess = useCallback(async () => {
    setShowRegisterModal(false);
    
    // Resetear filtros para mostrar todos los profesores
    setSearchTerm('');
    setFilterStatus('all');
    setCurrentPage(1);
    
    // Forzar recarga inmediata de la lista de profesores
    try {
      setLoading(true);
      const params = {
        page: 1,
        limit: 10
      };
      
      const teachersResponse = await api.get('/teachers', { params });
      if (teachersResponse.data.success) {
        setTeachers(teachersResponse.data.data.teachers || []);
        setTotalPages(teachersResponse.data.data.totalPages || 1);
        setTotalTeachers(teachersResponse.data.data.total || 0);
      }
      
      // Recargar estadísticas
      const statsResponse = await api.get('/teachers/stats');
      if (statsResponse.data.success) {
        setStats({
          total: statsResponse.data.data.overview.total || 0,
          active: statsResponse.data.data.overview.active || 0,
          inactive: statsResponse.data.data.overview.inactive || 0
        });
      }
    } catch (error) {
      console.error('Error reloading data after registration:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleRegisterCancel = useCallback(() => {
    setShowRegisterModal(false);
  }, []);

  const handleSaveTeacher = useCallback(async (teacherData, onSuccess, onError) => {
    try {
      console.log('Saving teacher data:', teacherData);
      console.log('Teacher data especialidades:', teacherData.especialidades);
      
      // Transform data to match server expectations
      const transformedData = {
        ...teacherData,
        // Transform horarios to Spanish field names and lowercase days
        horarios: teacherData.horarios?.map(schedule => ({
          dia: (schedule.day || schedule.dia)?.toLowerCase()?.replace('é', 'e').replace('á', 'a').replace('ú', 'u'),
          horaInicio: schedule.startTime || schedule.horaInicio,
          horaFin: schedule.endTime || schedule.horaFin
        })) || [],
        // Keep especialidades as ObjectIds - no transformation needed
        especialidades: teacherData.especialidades || []
      };
      
      console.log('Transformed request payload:', JSON.stringify(transformedData, null, 2));
      
      const response = await api.put(`/teachers/${teacherData._id}`, transformedData);
      console.log('Save teacher response:', response.data);
      
      if (response.data.success) {
        // Forzar recarga de la tabla agregando un timestamp como dependency
        const timestamp = Date.now();
        setCurrentPage(prev => prev); // Trigger re-render
        
        // Recargar datos completos de la tabla
        setTimeout(async () => {
          try {
            const params = {
              page: currentPage,
              limit: 10,
              ...(searchTerm && { search: searchTerm }),
              ...(filterStatus !== 'all' && { status: filterStatus })
            };
            const teachersResponse = await api.get('/teachers', { params });
            if (teachersResponse.data.success) {
              setTeachers(teachersResponse.data.data.teachers || []);
            }
          } catch (error) {
            console.error('Error reloading teachers:', error);
          }
        }, 100);
        
        // Actualizar el profesor en edición con los nuevos datos del servidor
        if (response.data.data) {
          setEditingTeacher(response.data.data);
        }
        
        // Establecer mensaje de éxito
        setSuccessMessage('Profesor actualizado exitosamente. Los cambios se reflejan en la tabla.');
        
        // Llamar callback de éxito
        if (onSuccess) {
          onSuccess('Profesor actualizado exitosamente. Los cambios se reflejan en la tabla.');
        }
        
        // Refrescar estadísticas si cambió el estado
        const oldTeacher = teachers.find(t => t._id === teacherData._id);
        if (oldTeacher && oldTeacher.condicion !== transformedData.condicion) {
          // Recargar stats
          setTimeout(() => {
            api.get('/teachers/stats').then(statsResponse => {
              if (statsResponse.data.success) {
                setStats({
                  total: statsResponse.data.data.overview.total || 0,
                  active: statsResponse.data.data.overview.active || 0,
                  inactive: statsResponse.data.data.overview.inactive || 0
                });
              }
            }).catch(() => {});
          }, 500);
        }
      } else {
        const errorMsg = 'Error al actualizar el profesor: ' + (response.data.message || 'Error desconocido');
        setSuccessMessage(errorMsg);
        if (onError) {
          onError(errorMsg);
        }
      }
    } catch (error) {
      console.error('Error saving teacher:', error);
      console.error('Error status:', error.response?.status);
      console.error('Error statusText:', error.response?.statusText);
      
      let errorMsg = 'Error de conexión al actualizar el profesor';
      if (error.response && error.response.data) {
        console.error('Error response data:', error.response.data);
        errorMsg = error.response.data.message || error.response.data.error || 'Error al actualizar el profesor';
      }
      
      setSuccessMessage(`Error: ${errorMsg}`);
      
      if (onError) {
        onError(errorMsg);
      }
    }
  }, [editingTeacher]);

  const closeModal = useCallback(() => {
    setShowEditModal(false);
    setEditingTeacher(null);
    setSuccessMessage('');
  }, []);

  // Función para renderizar estado
  const renderStatus = useCallback((status) => {
    const statusStyles = {
      'activo': { background: '#d4edda', color: '#155724' },
      'inactivo': { background: '#f8d7da', color: '#721c24' }
    };
    
    const style = statusStyles[status] || statusStyles['activo'];
    const text = status === 'activo' ? 'Activo' : 'Inactivo';
    
    return (
      <span style={{ 
        display: 'inline-block',
        width: '80px',
        padding: '0.25rem 0.75rem', 
        borderRadius: '12px', 
        fontSize: '0.75rem', 
        fontWeight: '600', 
        textTransform: 'uppercase',
        textAlign: 'center',
        ...style 
      }}>
        {text}
      </span>
    );
  }, []);

  // Memoizar datos filtrados para optimización
  const filteredTeachers = useMemo(() => {
    return teachers;
  }, [teachers]);

  return (
    <div style={{ padding: '2rem', background: 'var(--bg-secondary)', minHeight: '100vh' }}>
      {/* Header */}
      <div className="dashboard-section">
        <h3 className="dashboard-section__title">Gestión de Profesores</h3>
      </div>

      {/* Estadísticas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ background: 'var(--card-bg)', padding: '1.5rem', borderRadius: '12px', boxShadow: 'var(--shadow-md)' }}>
          <h3 style={{ color: '#3498db', fontSize: '0.9rem', fontWeight: '600', margin: '0 0 0.5rem 0', textTransform: 'uppercase' }}>Total de Profesores</h3>
          <p style={{ fontSize: '2rem', fontWeight: '700', margin: '0', color: 'var(--text-primary)' }}>{stats.total}</p>
        </div>
        <div style={{ background: 'var(--card-bg)', padding: '1.5rem', borderRadius: '12px', boxShadow: 'var(--shadow-md)' }}>
          <h3 style={{ color: '#27ae60', fontSize: '0.9rem', fontWeight: '600', margin: '0 0 0.5rem 0', textTransform: 'uppercase' }}>Profesores Activos</h3>
          <p style={{ fontSize: '2rem', fontWeight: '700', margin: '0', color: 'var(--text-primary)' }}>{stats.active}</p>
        </div>
        <div style={{ background: 'var(--card-bg)', padding: '1.5rem', borderRadius: '12px', boxShadow: 'var(--shadow-md)' }}>
          <h3 style={{ color: '#e74c3c', fontSize: '0.9rem', fontWeight: '600', margin: '0 0 0.5rem 0', textTransform: 'uppercase' }}>Profesores Inactivos</h3>
          <p style={{ fontSize: '2rem', fontWeight: '700', margin: '0', color: 'var(--text-primary)' }}>{stats.inactive}</p>
        </div>
      </div>

      {/* Filtros y Acciones */}
      <div style={{ background: 'var(--card-bg)', padding: '1.5rem', borderRadius: '12px', boxShadow: 'var(--shadow-md)', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'stretch', flexWrap: 'wrap' }}>
          <div style={{ flex: '1', minWidth: '250px' }}>
            <SearchInput 
              onSearch={handleSearchChange} 
              placeholder="Buscar por nombre, email o especialidad..."
            />
          </div>
          <select
            value={filterStatus}
            onChange={handleFilterStatusChange}
            style={{
              padding: '0.75rem',
              border: '1px solid #ddd',
              borderRadius: '6px',
              fontSize: '0.9rem',
              minWidth: '150px',
              height: '48px',
              flexShrink: 0
            }}
          >
            <option value="all">Todos los estados</option>
            <option value="activo">Activos</option>
            <option value="inactivo">Inactivos</option>
          </select>
          <button
            onClick={handleNewTeacher}
            style={{
              background: 'linear-gradient(135deg, #27ae60, #229954)',
              color: 'white',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '6px',
              fontSize: '0.9rem',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.3s ease',
              whiteSpace: 'nowrap',
              flexShrink: 0
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-1px)';
              e.target.style.boxShadow = '0 4px 12px rgba(39, 174, 96, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
            }}
          >
            <FaPlus /> Nuevo Profesor
          </button>
        </div>
      </div>

      {/* Tabla de profesores */}
      <div style={{ background: 'var(--card-bg)', borderRadius: '12px', boxShadow: 'var(--shadow-md)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <div>Cargando profesores...</div>
          </div>
        ) : filteredTeachers.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <div>No se encontraron profesores</div>
          </div>
        ) : (
          <table style={{ width: '100%', minWidth: '800px', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--bg-tertiary)', borderBottom: '2px solid var(--border-color)' }}>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: 'var(--text-secondary)' }}>Profesor</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: 'var(--text-secondary)' }}>Contacto</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: 'var(--text-secondary)' }}>Especialidades</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: 'var(--text-secondary)' }}>Estado</th>
                <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '600', color: 'var(--text-secondary)' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredTeachers.map((teacher, index) => (
                <tr key={teacher._id} style={{ borderBottom: '1px solid var(--border-color)' }} className="table-row-hover">
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: '40px', height: '40px', minWidth: '40px', minHeight: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #3498db, #2980b9)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '600', flexShrink: 0 }}>
                        {teacher.firstName?.charAt(0)}{teacher.lastName?.charAt(0)}
                      </div>
                      <div>
                        <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>
                          {teacher.firstName} {teacher.lastName}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                        <FaEnvelope style={{ fontSize: '0.75rem' }} />
                        {teacher.email}
                      </div>
                      {teacher.phone && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <FaPhone style={{ fontSize: '0.75rem' }} />
                          {teacher.phone}
                        </div>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                      {teacher.especialidades && teacher.especialidades.length > 0 ? (
                        teacher.especialidades.map((esp, index) => (
                          <span key={index} style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            padding: '0.25rem 0.5rem',
                            background: '#e3f2fd',
                            color: '#1565c0',
                            borderRadius: '12px',
                            fontSize: '0.75rem',
                            fontWeight: '500'
                          }}>
                            <FaBook style={{ fontSize: '0.7rem' }} /> {esp.name || esp}
                          </span>
                        ))
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '0.8rem' }}>Sin especialidades</span>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    {renderStatus(teacher.condicion)}
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                      <button
                        onClick={() => handleEdit(teacher)}
                        style={{
                          background: '#3498db',
                          color: 'white',
                          border: 'none',
                          padding: '0.5rem',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '0.8rem'
                        }}
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(teacher._id)}
                        style={{
                          background: '#e74c3c',
                          color: 'white',
                          border: 'none',
                          padding: '0.5rem',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '0.8rem'
                        }}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        </div>
      </div>

      {/* Modal de edición */}
      {showEditModal && editingTeacher && (
        <EditTeacherModal
          teacher={editingTeacher}
          onSave={handleSaveTeacher}
          onCancel={closeModal}
          successMessage={successMessage}
          setSuccessMessage={setSuccessMessage}
          languages={languages}
        />
      )}

      {/* Modal de registro de nuevo profesor */}
      {showRegisterModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px',
          overflowY: 'auto',
          paddingTop: '40px',
          paddingBottom: '40px'
        }}>
          <div style={{
            width: '100%',
            maxWidth: '800px',
            maxHeight: 'calc(100vh - 80px)',
            overflowY: 'auto'
          }}>
            <RegisterTeacher
              onSuccess={handleRegisterSuccess}
              onCancel={handleRegisterCancel}
            />
          </div>
        </div>
      )}
    </div>
  );
};

// Componente Modal de Edición de Profesor
const EditTeacherModal = ({ teacher, onSave, onCancel, successMessage, setSuccessMessage, languages }) => {
  const [formData, setFormData] = useState({
    firstName: teacher.firstName || '',
    lastName: teacher.lastName || '',
    email: teacher.email || '',
    phone: teacher.phone || '',
    especialidades: teacher.especialidades ? 
      teacher.especialidades.map(esp => typeof esp === 'object' ? esp._id : esp) : [],
    horarios: teacher.horarios || [],
    condicion: teacher.condicion || 'activo'
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Actualizar formData cuando teacher cambie (después de una actualización exitosa)
  useEffect(() => {
    setFormData({
      firstName: teacher.firstName || '',
      lastName: teacher.lastName || '',
      email: teacher.email || '',
      phone: teacher.phone || '',
      especialidades: teacher.especialidades ? 
        teacher.especialidades.map(esp => typeof esp === 'object' ? esp._id : esp) : [],
      horarios: teacher.horarios || [],
      condicion: teacher.condicion || 'activo'
    });
  }, [teacher]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (isSubmitting) {
      console.log('Already submitting, preventing duplicate submission');
      return;
    }
    
    setIsSubmitting(true);
    
    // Basic validation
    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim()) {
      alert('Por favor complete los campos obligatorios (nombre, apellido, email)');
      setIsSubmitting(false);
      return;
    }

    const teacherData = {
      _id: teacher._id,
      ...formData
    };

    console.log('Submitting teacher data:', teacherData); // Debug log
    onSave(teacherData, 
      // Success callback
      (message) => {
        console.log('Success callback executed with message:', message); // Debug log
        setIsSubmitting(false); // Reset submitting state
      },
      // Error callback  
      (error) => {
        console.log('Error callback executed:', error); // Debug log
        setIsSubmitting(false); // Reset submitting state on error too
      }
    );
  };

  const dayOptions = [
    'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'
  ];

  const timeOptions = [
    '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', 
    '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'
  ];

  // Use dynamic languages instead of hardcoded options
  const specialtyOptions = languages;

  const handleSpecialtyChange = (language) => {
    console.log('Specialty change clicked:', language.name);
    console.log('Current especialidades:', formData.especialidades);
    
    setFormData(prev => {
      const languageId = language._id;
      const newEspecialidades = prev.especialidades.includes(languageId)
        ? prev.especialidades.filter(id => id !== languageId)
        : [...prev.especialidades, languageId];
      
      console.log('New especialidades:', newEspecialidades);
      
      return {
        ...prev,
        especialidades: newEspecialidades
      };
    });
  };

  const addSchedule = () => {
    setFormData(prev => ({
      ...prev,
      horarios: [...prev.horarios, { day: 'Lunes', startTime: '09:00', endTime: '10:00' }]
    }));
  };

  const removeSchedule = (index) => {
    setFormData(prev => ({
      ...prev,
      horarios: prev.horarios.filter((_, i) => i !== index)
    }));
  };

  const updateSchedule = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      horarios: prev.horarios.map((schedule, i) => 
        i === index ? { ...schedule, [field]: value } : schedule
      )
    }));
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px',
      overflowY: 'auto',
      paddingTop: '40px',
      paddingBottom: '40px'
    }}>
      <div style={{
        backgroundColor: 'var(--card-bg)',
        borderRadius: '12px',
        boxShadow: 'var(--shadow-xl)',
        width: '100%',
        maxWidth: '800px',
        maxHeight: 'calc(100vh - 80px)',
        overflow: 'hidden'
      }}>
        <div style={{
          padding: '1.5rem 1.5rem 0 1.5rem',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h3 style={{ margin: '0', color: 'var(--text-primary)', fontSize: '1.25rem', fontWeight: '600' }}>
            <FaEdit style={{ marginRight: '0.5rem', color: '#3498db' }} />
            Editar Profesor
          </h3>
          <button
            onClick={onCancel}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              padding: '0.25rem'
            }}
          >×</button>
        </div>
        
        <div style={{ maxHeight: 'calc(100vh - 160px)', overflowY: 'auto' }}>
        <form onSubmit={handleSubmit} style={{ padding: '0 24px 24px 24px' }}>
          {successMessage && (
            <div style={{
              background: '#d4edda',
              color: '#155724',
              padding: '12px',
              borderRadius: '6px',
              marginBottom: '1rem',
              border: '1px solid #c3e6cb'
            }}>
              {successMessage}
            </div>
          )}

          {/* Información Personal */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ color: 'var(--text-primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center' }}>
              <FaUserGraduate style={{ marginRight: '0.5rem', color: '#3498db' }} />
              Información Personal
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--text-primary)' }}>
                  Nombre *
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid var(--input-border)',
                    borderRadius: '6px',
                    fontSize: '0.9rem',
                    backgroundColor: 'var(--input-bg)',
                    color: 'var(--text-primary)'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--text-primary)' }}>
                  Apellido *
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid var(--input-border)',
                    borderRadius: '6px',
                    fontSize: '0.9rem',
                    backgroundColor: 'var(--input-bg)',
                    color: 'var(--text-primary)'
                  }}
                />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--text-primary)' }}>
                  <FaEnvelope style={{ marginRight: '0.5rem' }} />
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid var(--input-border)',
                    borderRadius: '6px',
                    fontSize: '0.9rem',
                    backgroundColor: 'var(--input-bg)',
                    color: 'var(--text-primary)'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--text-primary)' }}>
                  <FaPhone style={{ marginRight: '0.5rem' }} />
                  Teléfono
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid var(--input-border)',
                    borderRadius: '6px',
                    fontSize: '0.9rem',
                    backgroundColor: 'var(--input-bg)',
                    color: 'var(--text-primary)'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Estado */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <label style={{ fontWeight: '500', color: 'var(--text-primary)', margin: 0 }}>
                Estado *
              </label>
              <select
                value={formData.condicion}
                onChange={(e) => setFormData(prev => ({ ...prev, condicion: e.target.value }))}
                required
                style={{
                  padding: '0.75rem',
                  border: '1px solid var(--input-border)',
                  borderRadius: '6px',
                  fontSize: '0.9rem',
                  minWidth: '120px',
                  height: '42px',
                  backgroundColor: 'var(--input-bg)',
                  color: 'var(--text-primary)'
                }}
              >
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
              </select>
            </div>
          </div>

          {/* Especialidades */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ color: 'var(--text-primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center' }}>
              <FaBook style={{ marginRight: '0.5rem', color: '#3498db' }} />
              Especialidades
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '0.5rem' }}>
              {specialtyOptions.map(language => (
                <div 
                  key={language._id} 
                  onClick={() => handleSpecialtyChange(language)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0.75rem',
                    border: `2px solid ${formData.especialidades.includes(language._id) ? '#3498db' : 'var(--input-border)'}`,
                    borderRadius: '8px',
                    cursor: 'pointer',
                    backgroundColor: formData.especialidades.includes(language._id) ? '#e3f2fd' : 'var(--input-bg)',
                    color: 'var(--text-primary)',
                    fontSize: '0.9rem',
                    fontWeight: '500',
                    textAlign: 'center',
                    transition: 'all 0.2s ease',
                    minHeight: '48px'
                  }}
                >
                  {language.name}
                </div>
              ))}
            </div>
          </div>

          {/* Horarios */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h4 style={{ color: 'var(--text-primary)', margin: '0', display: 'flex', alignItems: 'center' }}>
                <FaCalendarAlt style={{ marginRight: '0.5rem', color: '#3498db' }} />
                Horarios
              </h4>
              <button
                type="button"
                onClick={addSchedule}
                style={{
                  background: '#28a745',
                  color: 'white',
                  border: 'none',
                  padding: '0.5rem 1rem',
                  borderRadius: '6px',
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                <FaPlus style={{ marginRight: '0.25rem' }} />
                Agregar
              </button>
            </div>
            {formData.horarios.map((schedule, index) => (
              <div key={index} style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1fr 1fr auto',
                gap: '0.5rem',
                alignItems: 'center',
                marginBottom: '0.5rem',
                padding: '0.75rem',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                backgroundColor: 'var(--bg-tertiary)'
              }}>
                <select
                  value={schedule.day}
                  onChange={(e) => updateSchedule(index, 'day', e.target.value)}
                  style={{
                    padding: '0.5rem',
                    border: '1px solid var(--input-border)',
                    borderRadius: '4px',
                    fontSize: '0.85rem',
                    backgroundColor: 'var(--input-bg)',
                    color: 'var(--text-primary)'
                  }}
                >
                  {dayOptions.map(day => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
                <select
                  value={schedule.startTime}
                  onChange={(e) => updateSchedule(index, 'startTime', e.target.value)}
                  style={{
                    padding: '0.5rem',
                    border: '1px solid var(--input-border)',
                    borderRadius: '4px',
                    fontSize: '0.85rem',
                    backgroundColor: 'var(--input-bg)',
                    color: 'var(--text-primary)'
                  }}
                >
                  {timeOptions.map(time => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
                <select
                  value={schedule.endTime}
                  onChange={(e) => updateSchedule(index, 'endTime', e.target.value)}
                  style={{
                    padding: '0.5rem',
                    border: '1px solid var(--input-border)',
                    borderRadius: '4px',
                    fontSize: '0.85rem',
                    backgroundColor: 'var(--input-bg)',
                    color: 'var(--text-primary)'
                  }}
                >
                  {timeOptions.map(time => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => removeSchedule(index)}
                  style={{
                    background: '#dc3545',
                    color: 'white',
                    border: 'none',
                    padding: '0.5rem',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '0.75rem'
                  }}
                >
                  <FaTrash />
                </button>
              </div>
            ))}
          </div>

          {/* Botones */}
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
            <button
              type="button"
              onClick={onCancel}
              style={{
                background: 'linear-gradient(135deg, #95a5a6, #7f8c8d)',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '0.95rem',
                transition: 'all 0.3s ease'
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                background: isSubmitting 
                  ? 'linear-gradient(135deg, #95a5a6, #7f8c8d)' 
                  : 'linear-gradient(135deg, #27ae60, #229954)',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                fontWeight: '600',
                fontSize: '0.95rem',
                opacity: isSubmitting ? 0.7 : 1,
                transition: 'all 0.3s ease'
              }}
            >
              {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
        </div>
      </div>
    </div>
  );
};

export default TeachersManagement;