import React, { useState, useEffect } from 'react';
import { 
  FaUsers, 
  FaSearch, 
  FaEdit, 
  FaUserCheck,
  FaUserTimes,
  FaGraduationCap,
  FaEye
} from 'react-icons/fa';
import api from '../services/api';

const StudentsManagement = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    nivel: '',
    condicion: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });
  const [stats, setStats] = useState({
    overview: { total: 0, active: 0, inactive: 0 },
    byLevel: [],
    byCondition: []
  });
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  useEffect(() => {
    fetchStudents();
    fetchStats();
  }, [filters, pagination.page]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      
      // Debug: información del usuario
      const userInfo = JSON.parse(localStorage.getItem('user') || '{}');
      console.log('Usuario logueado:', userInfo);
      console.log('Rol del usuario:', userInfo.role);
      console.log('Token disponible:', localStorage.getItem('token') ? 'Sí' : 'No');
      
      const queryParams = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        ...filters
      });

      const response = await api.get(`/students?${queryParams}`);
      setStudents(response.data.data.students);
      setPagination(prev => ({
        ...prev,
        ...response.data.data.pagination
      }));
    } catch (error) {
      setError('Error al cargar estudiantes');
      console.error('❌ Error fetching students:', error);
      console.error('Error response:', error.response);
      console.error('Status code:', error.response?.status);
      console.error('Error message:', error.response?.data);
      console.error('Token disponible:', localStorage.getItem('token') ? 'Sí' : 'No');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/students/stats');
      setStats(response.data.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
      console.error('Stats error response:', error.response);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleEdit = (student) => {
    setSelectedStudent(student);
    setShowEditModal(true);
  };

  const handleDeactivate = async (studentId) => {
    if (window.confirm('¿Estás seguro de que quieres desactivar este estudiante?')) {
      try {
        await api.delete(`/students/${studentId}`);
        fetchStudents();
        fetchStats();
      } catch (error) {
        setError('Error al desactivar estudiante');
      }
    }
  };

  const handleReactivate = async (studentId) => {
    if (window.confirm('¿Estás seguro de que quieres reactivar este estudiante?')) {
      try {
        await api.patch(`/students/${studentId}/reactivate`);
        fetchStudents();
        fetchStats();
      } catch (error) {
        setError('Error al reactivar estudiante');
      }
    }
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const getStatusBadgeClass = (student) => {
    if (!student.isActive) return 'badge-inactive';
    
    // Usar condicion si existe
    if (student.condicion) {
      switch (student.condicion) {
        case 'graduado': return 'badge-graduated';
        case 'activo': return 'badge-active';
        case 'inactivo': return 'badge-inactive';
        default: return 'badge-default';
      }
    }
    
    // Mapear estadoAcademico si condicion no existe
    if (student.estadoAcademico) {
      switch (student.estadoAcademico) {
        case 'graduado': return 'badge-graduated';
        case 'en_curso': return 'badge-active';
        case 'inscrito': return 'badge-enrolled';
        case 'suspendido': return 'badge-inactive';
        default: return 'badge-default';
      }
    }
    
    return 'badge-active'; // Por defecto
  };

  const getStatusText = (student) => {
    if (!student.isActive) return 'Inactivo';
    
    // Mapear estadoAcademico a condicion si condicion no existe
    if (student.condicion) {
      return student.condicion.charAt(0).toUpperCase() + student.condicion.slice(1);
    }
    
    if (student.estadoAcademico) {
      const estadoMap = {
        'en_curso': 'Activo',
        'inscrito': 'Activo',
        'graduado': 'Graduado',
        'suspendido': 'Inactivo'
      };
      return estadoMap[student.estadoAcademico] || 'Sin definir';
    }
    
    return 'Activo'; // Por defecto
  };

  return (
    <div className="students-management" style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--primary)', fontSize: '1.8rem', fontWeight: '600' }}>
          <FaUsers />
          Gestión de Estudiantes
        </h1>
      </div>

      {/* Estadísticas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary)' }}>{stats.overview.total}</div>
          <div style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Total Estudiantes</div>
        </div>
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary)' }}>{stats.overview.active}</div>
          <div style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Activos</div>
        </div>
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary)' }}>{stats.overview.inactive}</div>
          <div style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Inactivos</div>
        </div>
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary)' }}>
            {stats.byCondition.find(c => c._id === 'graduado')?.count || 0}
          </div>
          <div style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Graduados</div>
        </div>
      </div>

      {/* Filtros */}
      <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', marginBottom: '2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', alignItems: 'end' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label style={{ marginBottom: '0.5rem', fontWeight: '500', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FaSearch /> Buscar
            </label>
            <input
              type="text"
              placeholder="Nombre, apellido o email..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              style={{ padding: '0.75rem', border: '2px solid #e1e5e9', borderRadius: '8px', fontSize: '0.9rem' }}
            />
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label style={{ marginBottom: '0.5rem', fontWeight: '500', color: 'var(--text-primary)' }}>Estado</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              style={{ padding: '0.75rem', border: '2px solid #e1e5e9', borderRadius: '8px', fontSize: '0.9rem' }}
            >
              <option value="">Todos</option>
              <option value="active">Activos</option>
              <option value="inactive">Inactivos</option>
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label style={{ marginBottom: '0.5rem', fontWeight: '500', color: 'var(--text-primary)' }}>Nivel</label>
            <select
              value={filters.nivel}
              onChange={(e) => handleFilterChange('nivel', e.target.value)}
              style={{ padding: '0.75rem', border: '2px solid #e1e5e9', borderRadius: '8px', fontSize: '0.9rem' }}
            >
              <option value="">Todos</option>
              <option value="A1">A1</option>
              <option value="A2">A2</option>
              <option value="B1">B1</option>
              <option value="B2">B2</option>
              <option value="C1">C1</option>
              <option value="C2">C2</option>
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label style={{ marginBottom: '0.5rem', fontWeight: '500', color: 'var(--text-primary)' }}>Condición</label>
            <select
              value={filters.condicion}
              onChange={(e) => handleFilterChange('condicion', e.target.value)}
              style={{ padding: '0.75rem', border: '2px solid #e1e5e9', borderRadius: '8px', fontSize: '0.9rem' }}
            >
              <option value="">Todas</option>
              <option value="inscrito">Inscrito</option>
              <option value="cursando">Cursando</option>
              <option value="graduado">Graduado</option>
              <option value="abandonado">Abandonado</option>
            </select>
          </div>
        </div>
      </div>

      {/* Mensajes de error */}
      {error && (
        <div style={{ background: '#f8d7da', color: '#721c24', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      {/* Tabla de estudiantes */}
      <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
            <FaGraduationCap size={40} />
            <p>Cargando estudiantes...</p>
          </div>
        ) : students.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
            <FaUsers size={40} />
            <p>No se encontraron estudiantes</p>
          </div>
        ) : (
          <>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ background: 'var(--primary)', color: 'white', padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Estudiante</th>
                  <th style={{ background: 'var(--primary)', color: 'white', padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Email</th>
                  <th style={{ background: 'var(--primary)', color: 'white', padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Nivel</th>
                  <th style={{ background: 'var(--primary)', color: 'white', padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Estado</th>
                  <th style={{ background: 'var(--primary)', color: 'white', padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Fecha Registro</th>
                  <th style={{ background: 'var(--primary)', color: 'white', padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student._id} style={{ ':hover': { backgroundColor: '#f8f9fa' } }}>
                    <td style={{ padding: '1rem', borderBottom: '1px solid #e1e5e9' }}>
                      <div>
                        <strong>{student.firstName} {student.lastName}</strong>
                        {student.phone && (
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                            {student.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '1rem', borderBottom: '1px solid #e1e5e9' }}>{student.email}</td>
                    <td style={{ padding: '1rem', borderBottom: '1px solid #e1e5e9' }}>
                      <span style={{ padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '500', background: '#e2e3e5', color: '#383d41' }}>
                        {student.nivel || 'No definido'}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', borderBottom: '1px solid #e1e5e9' }}>
                      <span 
                        style={{ 
                          padding: '0.25rem 0.75rem', 
                          borderRadius: '20px', 
                          fontSize: '0.8rem', 
                          fontWeight: '500',
                          ...(getStatusBadgeClass(student) === 'badge-active' ? { background: '#d4edda', color: '#155724' } :
                             getStatusBadgeClass(student) === 'badge-enrolled' ? { background: '#cce7ff', color: '#004085' } :
                             getStatusBadgeClass(student) === 'badge-graduated' ? { background: '#fff3cd', color: '#856404' } :
                             getStatusBadgeClass(student) === 'badge-inactive' ? { background: '#f8d7da', color: '#721c24' } :
                             { background: '#e2e3e5', color: '#383d41' })
                        }}
                      >
                        {getStatusText(student)}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', borderBottom: '1px solid #e1e5e9' }}>
                      {new Date(student.createdAt).toLocaleDateString('es-ES')}
                    </td>
                    <td style={{ padding: '1rem', borderBottom: '1px solid #e1e5e9' }}>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => handleEdit(student)}
                          title="Ver detalles"
                          style={{ padding: '0.4rem', border: 'none', borderRadius: '6px', cursor: 'pointer', background: '#6c757d', color: 'white' }}
                        >
                          <FaEye />
                        </button>
                        <button
                          onClick={() => handleEdit(student)}
                          title="Editar"
                          style={{ padding: '0.4rem', border: 'none', borderRadius: '6px', cursor: 'pointer', background: '#17a2b8', color: 'white' }}
                        >
                          <FaEdit />
                        </button>
                        {student.isActive ? (
                          <button
                            onClick={() => handleDeactivate(student._id)}
                            title="Desactivar"
                            style={{ padding: '0.4rem', border: 'none', borderRadius: '6px', cursor: 'pointer', background: '#dc3545', color: 'white' }}
                          >
                            <FaUserTimes />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleReactivate(student._id)}
                            title="Reactivar"
                            style={{ padding: '0.4rem', border: 'none', borderRadius: '6px', cursor: 'pointer', background: '#28a745', color: 'white' }}
                          >
                            <FaUserCheck />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Paginación */}
            {pagination.pages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '2rem', padding: '1rem' }}>
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={!pagination.hasPrev}
                  style={{ 
                    padding: '0.5rem 1rem', 
                    border: '2px solid var(--primary)', 
                    background: 'white', 
                    color: 'var(--primary)', 
                    borderRadius: '6px', 
                    cursor: pagination.hasPrev ? 'pointer' : 'not-allowed',
                    opacity: pagination.hasPrev ? 1 : 0.5
                  }}
                >
                  Anterior
                </button>
                
                <span>
                  Página {pagination.page} de {pagination.pages}
                </span>
                
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={!pagination.hasNext}
                  style={{ 
                    padding: '0.5rem 1rem', 
                    border: '2px solid var(--primary)', 
                    background: 'white', 
                    color: 'var(--primary)', 
                    borderRadius: '6px', 
                    cursor: pagination.hasNext ? 'pointer' : 'not-allowed',
                    opacity: pagination.hasNext ? 1 : 0.5
                  }}
                >
                  Siguiente
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal de Edición de Estudiante */}
      {showEditModal && selectedStudent && (
        <EditStudentModal 
          student={selectedStudent}
          onClose={() => {
            setShowEditModal(false);
            setSelectedStudent(null);
          }}
          onSave={() => {
            fetchStudents();
            fetchStats();
            setShowEditModal(false);
            setSelectedStudent(null);
          }}
        />
      )}
    </div>
  );
};

// Componente Modal de Edición de Estudiante
const EditStudentModal = ({ student, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    firstName: student?.firstName || '',
    lastName: student?.lastName || '',
    email: student?.email || '',
    phone: student?.phone || '',
    dni: student?.dni || '',
    nivel: student?.nivel || '',
    condicion: student?.condicion || 'activo'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.put(`/students/${student._id}`, formData);
      onSave();
    } catch (error) {
      console.error('Error updating student:', error);
      setError(error.response?.data?.message || 'Error al actualizar el estudiante');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        right: 0, 
        bottom: 0, 
        background: 'rgba(0,0,0,0.5)', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        zIndex: 1000
      }}
      onClick={onClose}
    >
      <div 
        style={{ 
          background: 'white', 
          padding: '2rem', 
          borderRadius: '12px', 
          maxWidth: '600px', 
          width: '90%',
          maxHeight: '90vh',
          overflow: 'auto'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ margin: 0, color: '#333' }}>
            <FaEdit style={{ marginRight: '0.5rem' }} />
            Editar Estudiante
          </h3>
          <button 
            onClick={onClose}
            style={{ 
              background: 'none', 
              border: 'none', 
              fontSize: '1.5rem', 
              cursor: 'pointer',
              color: '#666'
            }}
          >
            ×
          </button>
        </div>

        {error && (
          <div style={{ 
            background: '#ffebee', 
            color: '#c62828', 
            padding: '0.75rem', 
            borderRadius: '6px', 
            marginBottom: '1rem' 
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Nombre *
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '1rem'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Apellido *
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '1rem'
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              Email *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '1rem'
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Teléfono
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '1rem'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                DNI
              </label>
              <input
                type="text"
                name="dni"
                value={formData.dni}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '1rem'
                }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Nivel
              </label>
              <select
                name="nivel"
                value={formData.nivel}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '1rem'
                }}
              >
                <option value="">Seleccionar nivel</option>
                <option value="A1">A1 - Básico</option>
                <option value="A2">A2 - Pre-intermedio</option>
                <option value="B1">B1 - Intermedio</option>
                <option value="B2">B2 - Intermedio alto</option>
                <option value="C1">C1 - Avanzado</option>
                <option value="C2">C2 - Dominio</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Estado
              </label>
              <select
                name="condicion"
                value={formData.condicion}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '1rem'
                }}
              >
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
                <option value="graduado">Graduado</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '0.75rem 1.5rem',
                background: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '1rem'
              }}
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '0.75rem 1.5rem',
                background: loading ? '#ccc' : '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              {loading ? (
                <>
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <FaEdit />
                  Guardar Cambios
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentsManagement;