import React, { useState, useEffect } from 'react';
import { 
  FaUsers, 
  FaSearch, 
  FaEdit, 
  FaUserCheck,
  FaUserTimes,
  FaGraduationCap,
  FaEye,
  FaUserPlus,
  FaChartLine
} from 'react-icons/fa';
import api from '../services/api';
import apiAdapter from '../services/apiAdapter';
import { mockStudents } from '../services/mockData';
import RegisterStudent from './RegisterStudent';
import { capitalizeUserNames } from '../utils/stringHelpers';

const StudentsManagement = ({ onBack }) => {
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
  const [showAddModal, setShowAddModal] = useState(false);
  const [attendanceStats, setAttendanceStats] = useState({}); // { studentId: { porcentaje, esRegular } }
  const [riskStudents, setRiskStudents] = useState([]);
  const [loadingRisk, setLoadingRisk] = useState(false);
  const [showRiskTable, setShowRiskTable] = useState(false);

  useEffect(() => {
    fetchStudents();
    fetchStats();
  }, [filters, pagination.page, pagination.limit]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      
      const queryParams = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        ...(filters.search && { search: filters.search }),
        ...(filters.status && { status: filters.status }),
        ...(filters.nivel && { nivel: filters.nivel }),
        ...(filters.condicion && { condicion: filters.condicion })
      });
      
      const response = await api.get(`/students?${queryParams}`);
      
      if (response.data.success) {
        // Ordenar estudiantes por apellido (y luego por nombre si hay apellidos iguales)
        // IMPORTANTE: Ordenar siempre, incluso si el backend ya ordenó, para asegurar consistencia
        const estudiantesRaw = response.data.data.students || [];
        
        const estudiantesOrdenados = [...estudiantesRaw].sort((a, b) => {
          // Normalizar y limpiar apellidos - asegurarse de que sean strings
          const apellidoA = String(a.lastName || '').trim().toLowerCase();
          const apellidoB = String(b.lastName || '').trim().toLowerCase();
          
          // Comparar apellidos directamente (case-insensitive)
          if (apellidoA && apellidoB) {
            if (apellidoA < apellidoB) return -1;
            if (apellidoA > apellidoB) return 1;
          } else if (!apellidoA && apellidoB) {
            return 1; // Sin apellido va al final
          } else if (apellidoA && !apellidoB) {
            return -1; // Con apellido va primero
          }
          
          // Si los apellidos son iguales (o ambos vacíos), ordenar por nombre
          const nombreA = String(a.firstName || '').trim().toLowerCase();
          const nombreB = String(b.firstName || '').trim().toLowerCase();
          if (nombreA < nombreB) return -1;
          if (nombreA > nombreB) return 1;
          return 0;
        });
        
        setStudents(estudiantesOrdenados);
        setPagination(prev => ({
          ...prev,
          total: response.data.data.pagination.total,
          pages: response.data.data.pagination.pages,
          hasPrev: response.data.data.pagination.hasPrev,
          hasNext: response.data.data.pagination.hasNext
        }));
        
        // Cargar estadísticas de asistencia para los estudiantes de esta página
        cargarEstadisticasAsistencia(estudiantesOrdenados);
      } else {
        setError('Error al cargar estudiantes');
      }
    } catch (error) {
      setError('Error al cargar estudiantes');
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/students/stats');
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchRiskStudents = async () => {
    try {
      setLoadingRisk(true);
      const response = await apiAdapter.reports.studentsAtRiskByAttendance();
      if (response?.data?.success) {
        const data = response.data.data || [];
        setRiskStudents(data);
      } else {
        setRiskStudents([]);
      }
    } catch (error) {
      console.error('Error fetching risk students:', error);
      setRiskStudents([]);
    } finally {
      setLoadingRisk(false);
    }
  };

  const cargarEstadisticasAsistencia = async (estudiantes) => {
    try {
      // Cargar estadísticas de asistencia para cada estudiante (sin curso específico)
      const statsPromises = estudiantes.map(async (estudiante) => {
        const estudianteId = estudiante._id || estudiante.id;
        try {
          const response = await apiAdapter.classes.obtenerEstadisticasAsistencia(estudianteId, null);
          if (response?.data?.success && response.data.data) {
            return {
              estudianteId,
              stats: response.data.data
            };
          }
        } catch (error) {
          console.error(`Error cargando estadísticas para estudiante ${estudianteId}:`, error);
        }
        return null;
      });

      const results = await Promise.all(statsPromises);
      const statsMap = {};
      results.forEach(result => {
        if (result) {
          statsMap[result.estudianteId] = {
            porcentaje: result.stats.porcentajeAsistencia || 0,
            esRegular: result.stats.esAlumnoRegular || false,
            totalClases: result.stats.totalClases || 0,
            clasesAsistidas: result.stats.clasesAsistidas || 0
          };
        }
      });
      setAttendanceStats(statsMap);
    } catch (error) {
      console.error('Error cargando estadísticas de asistencia:', error);
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
    
    // Usar estadoAcademico como fuente principal
    if (student.estadoAcademico) {
      switch (student.estadoAcademico) {
        case 'graduado': return 'badge-graduated';
        case 'en_curso': return 'badge-active';
        case 'inscrito': return 'badge-enrolled';
        case 'suspendido': return 'badge-inactive';
        default: return 'badge-default';
      }
    }
    
    // Fallback a condicion si existe
    if (student.condicion) {
      switch (student.condicion) {
        case 'graduado': return 'badge-graduated';
        case 'activo': return 'badge-active';
        case 'inactivo': return 'badge-inactive';
        default: return 'badge-default';
      }
    }
    
    return 'badge-active'; // Por defecto
  };

  const getStatusText = (student) => {
    if (!student.isActive) return 'Inactivo';
    
    // Usar estadoAcademico como fuente principal
    if (student.estadoAcademico) {
      const estadoMap = {
        'en_curso': 'Activo',
        'inscrito': 'Inscripto', 
        'graduado': 'Graduado',
        'suspendido': 'Suspendido'
      };
      return estadoMap[student.estadoAcademico] || student.estadoAcademico;
    }
    
    // Fallback a condicion si existe
    if (student.condicion) {
      return student.condicion.charAt(0).toUpperCase() + student.condicion.slice(1);
    }
    
    return 'Activo'; // Por defecto
  };

  return (
    <div className="students-management" style={{ padding: '1rem', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div className="dashboard-section" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h3 className="dashboard-section__title" style={{ margin: 0 }}>Gestión de Estudiantes</h3>
        <button
          onClick={() => setShowAddModal(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.5rem',
            background: 'var(--primary)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: '600',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            transition: 'all 0.2s ease'
          }}
        >
          <FaUserPlus />
          Agregar Estudiante
        </button>
      </div>
      
      {/* Estadísticas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <h3 style={{ color: '#3498db', fontSize: '0.9rem', fontWeight: '600', margin: '0 0 0.5rem 0', textTransform: 'uppercase' }}>Total de Estudiantes</h3>
          <p style={{ fontSize: '2rem', fontWeight: '700', margin: '0', color: '#2c3e50' }}>{stats.overview.total}</p>
        </div>
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <h3 style={{ color: '#27ae60', fontSize: '0.9rem', fontWeight: '600', margin: '0 0 0.5rem 0', textTransform: 'uppercase' }}>Estudiantes Activos</h3>
          <p style={{ fontSize: '2rem', fontWeight: '700', margin: '0', color: '#2c3e50' }}>{stats.overview.active}</p>
        </div>
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <h3 style={{ color: '#e74c3c', fontSize: '0.9rem', fontWeight: '600', margin: '0 0 0.5rem 0', textTransform: 'uppercase' }}>Estudiantes Inactivos</h3>
          <p style={{ fontSize: '2rem', fontWeight: '700', margin: '0', color: '#2c3e50' }}>{stats.overview.inactive}</p>
        </div>
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <h3 style={{ color: '#f39c12', fontSize: '0.9rem', fontWeight: '600', margin: '0 0 0.5rem 0', textTransform: 'uppercase' }}>Estudiantes Graduados</h3>
          <p style={{ fontSize: '2rem', fontWeight: '700', margin: '0', color: '#2c3e50' }}>
            {stats.byCondition.find(c => c._id === 'graduado')?.count || 0}
          </p>
        </div>
      </div>

      {/* Tarjeta de estudiantes en riesgo, centrada horizontalmente */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
        <div
          onClick={async () => {
            setShowRiskTable(prev => !prev);
            if (!showRiskTable && riskStudents.length === 0 && !loadingRisk) {
              await fetchRiskStudents();
            }
          }}
          style={{
            background: 'white',
            padding: '1.5rem',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            cursor: 'pointer',
            transition: 'box-shadow 0.2s ease, transform 0.1s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <h3 style={{ color: '#e67e22', fontSize: '0.9rem', fontWeight: '600', margin: '0 0 0.5rem 0', textTransform: 'uppercase' }}>
            Estudiantes en riesgo
          </h3>
          {/* Truco: guion del mismo color que el fondo para mantener altura sin sugerir “0” */}
          <p style={{ fontSize: '2rem', fontWeight: '700', margin: '0', color: 'white' }}>—</p>
          <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.8rem', color: '#6b7280' }}>
            Ver listado
          </p>
        </div>
      </div>

      {/* Listado de estudiantes en riesgo por inasistencias */}
      {showRiskTable && (
        <div
          style={{
            background: 'white',
            padding: '1.5rem',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            marginBottom: '2rem'
          }}
        >
          <h4 style={{ margin: '0 0 1rem 0', color: '#111827', fontSize: '1rem', fontWeight: 600 }}>
            Estudiantes en riesgo por inasistencias
          </h4>
          {loadingRisk ? (
            <div style={{ padding: '1rem', color: '#6b7280' }}>Cargando listado...</div>
          ) : riskStudents.length === 0 ? (
            <div style={{ padding: '1rem', color: '#6b7280', fontSize: '0.9rem' }}>
              No hay estudiantes en riesgo por inasistencias en este momento.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontSize: '0.9rem',
                  minWidth: '900px'
                }}
              >
                <thead>
                  <tr>
                    <th style={{ padding: '0.75rem', borderBottom: '1px solid #e5e7eb', textAlign: 'left' }}>Alumno</th>
                    <th style={{ padding: '0.75rem', borderBottom: '1px solid #e5e7eb', textAlign: 'left' }}>Email</th>
                    <th style={{ padding: '0.75rem', borderBottom: '1px solid #e5e7eb', textAlign: 'left' }}>Curso</th>
                    <th style={{ padding: '0.75rem', borderBottom: '1px solid #e5e7eb', textAlign: 'left' }}>Profesor</th>
                    <th style={{ padding: '0.75rem', borderBottom: '1px solid #e5e7eb', textAlign: 'center' }}>Asistencia</th>
                    <th style={{ padding: '0.75rem', borderBottom: '1px solid #e5e7eb', textAlign: 'center' }}>Faltas / límite</th>
                    <th style={{ padding: '0.75rem', borderBottom: '1px solid #e5e7eb', textAlign: 'center' }}>Faltas antes del límite</th>
                  </tr>
                </thead>
                <tbody>
                  {riskStudents.map((item, index) => (
                    <tr key={`${item.estudianteId}-${item.cursoId}-${index}`}>
                      <td style={{ padding: '0.75rem', borderBottom: '1px solid #f3f4f6' }}>
                        <div style={{ fontWeight: 600, color: '#111827' }}>{item.estudianteNombre || '—'}</div>
                      </td>
                      <td style={{ padding: '0.75rem', borderBottom: '1px solid #f3f4f6', color: '#4b5563' }}>
                        {item.estudianteEmail || '—'}
                      </td>
                      <td style={{ padding: '0.75rem', borderBottom: '1px solid #f3f4f6' }}>
                        <div style={{ fontWeight: 500, color: '#111827' }}>{item.cursoNombre || '—'}</div>
                        <div style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '0.1rem' }}>
                          {item.idioma && item.nivel ? `${item.idioma.toUpperCase()} - ${item.nivel}` : ''}
                        </div>
                      </td>
                      <td style={{ padding: '0.75rem', borderBottom: '1px solid #f3f4f6', color: '#4b5563' }}>
                        {item.profesorNombre || '—'}
                      </td>
                      <td style={{ padding: '0.75rem', borderBottom: '1px solid #f3f4f6', textAlign: 'center' }}>
                        {typeof item.porcentajeAsistencia === 'number'
                          ? `${item.porcentajeAsistencia.toFixed(1)}%`
                          : '—'}
                      </td>
                      <td style={{ padding: '0.75rem', borderBottom: '1px solid #f3f4f6', textAlign: 'center' }}>
                        {item.limiteMaximoInasistencias > 0
                          ? `${item.clasesFaltadas} / ${item.limiteMaximoInasistencias}`
                          : '—'}
                      </td>
                      <td style={{ padding: '0.75rem', borderBottom: '1px solid #f3f4f6', textAlign: 'center' }}>
                        {item.inasistenciasRestantes != null
                          ? item.inasistenciasRestantes === 0
                            ? 'Límite alcanzado'
                            : item.inasistenciasRestantes < 0
                            ? 'Límite superado'
                            : item.inasistenciasRestantes === 1
                            ? '1 falta'
                            : `${item.inasistenciasRestantes} faltas`
                          : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Filtros */}
      <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', marginBottom: '2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', alignItems: 'end' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label style={{ marginBottom: '0.5rem', fontWeight: '500', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FaSearch /> Buscar
            </label>
            <input
              type="text"
              placeholder="Nombre, apellido o email..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              style={{ padding: '0.75rem', border: '2px solid #e1e5e9', borderRadius: '8px', fontSize: '0.9rem', height: '48px', boxSizing: 'border-box' }}
            />
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label style={{ marginBottom: '0.5rem', fontWeight: '500', color: 'var(--text-primary)' }}>Estado</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              style={{ padding: '0.75rem', border: '2px solid #e1e5e9', borderRadius: '8px', fontSize: '0.9rem', height: '48px', boxSizing: 'border-box' }}
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
              style={{ padding: '0.75rem', border: '2px solid #e1e5e9', borderRadius: '8px', fontSize: '0.9rem', height: '48px', boxSizing: 'border-box' }}
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
              style={{ padding: '0.75rem', border: '2px solid #e1e5e9', borderRadius: '8px', fontSize: '0.9rem', height: '48px', boxSizing: 'border-box' }}
            >
              <option value="">Todas</option>
              <option value="inscrito">Inscripto</option>
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
              <option value="graduado">Graduado</option>
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
            <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
                <thead>
                  <tr>
                    <th style={{ background: 'var(--primary)', color: 'white', padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Estudiante</th>
                    <th style={{ background: 'var(--primary)', color: 'white', padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Email</th>
                    <th style={{ background: 'var(--primary)', color: 'white', padding: '1rem', textAlign: 'center', fontWeight: '600' }}>Nivel</th>
                    <th style={{ background: 'var(--primary)', color: 'white', padding: '1rem', textAlign: 'center', fontWeight: '600' }}>Estado</th>
                    <th style={{ background: 'var(--primary)', color: 'white', padding: '1rem', textAlign: 'center', fontWeight: '600' }}>Asistencia</th>
                    <th style={{ background: 'var(--primary)', color: 'white', padding: '1rem', textAlign: 'center', fontWeight: '600' }}>Fecha Registro</th>
                    <th style={{ background: 'var(--primary)', color: 'white', padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr key={student._id} style={{ ':hover': { backgroundColor: '#f8f9fa' } }}>
                      <td style={{ padding: '1rem', borderBottom: '1px solid #e1e5e9' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #3498db, #2980b9)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '600', flexShrink: 0 }}>
                            {student.firstName?.charAt(0)}{student.lastName?.charAt(0)}
                          </div>
                          <div>
                            <div style={{ fontWeight: '600', color: '#2c3e50' }}>
                              {student.firstName} {student.lastName}
                            </div>
                            {student.phone && (
                              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                {student.phone}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '1rem', borderBottom: '1px solid #e1e5e9' }}>{student.email}</td>
                      <td style={{ padding: '1rem', borderBottom: '1px solid #e1e5e9', textAlign: 'center' }}>
                        <span style={{ padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '500', background: '#e2e3e5', color: '#383d41' }}>
                          {student.nivel || 'No definido'}
                        </span>
                      </td>
                      <td style={{ padding: '1rem', borderBottom: '1px solid #e1e5e9', textAlign: 'center' }}>
                        <span 
                          style={{ 
                            padding: '0.25rem 0.75rem', 
                            borderRadius: '20px', 
                            fontSize: '0.8rem', 
                            fontWeight: '500',
                            minWidth: '80px',
                            display: 'inline-block',
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
                      <td style={{ padding: '1rem', borderBottom: '1px solid #e1e5e9', textAlign: 'center' }}>
                        {(() => {
                          const estudianteId = student._id || student.id;
                          const stats = attendanceStats[estudianteId];
                          if (!stats || stats.totalClases === 0) {
                            return (
                              <span style={{ color: '#6c757d', fontSize: '0.85rem' }}>
                                Sin datos
                              </span>
                            );
                          }
                          const porcentaje = stats.porcentaje;
                          const esRegular = stats.esRegular;
                          const color = esRegular ? '#28a745' : porcentaje >= 70 ? '#ffc107' : '#dc3545';
                          return (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
                              <span style={{ 
                                fontWeight: '600', 
                                color,
                                fontSize: '0.9rem'
                              }}>
                                {porcentaje.toFixed(1)}%
                              </span>
                              <div style={{ 
                                width: '60px', 
                                height: '6px', 
                                background: '#e9ecef', 
                                borderRadius: '3px',
                                overflow: 'hidden'
                              }}>
                                <div style={{ 
                                  width: `${Math.min(100, porcentaje)}%`, 
                                  height: '100%', 
                                  background: color,
                                  transition: 'width 0.3s ease'
                                }}></div>
                              </div>
                              {esRegular && (
                                <span style={{ fontSize: '0.7rem', color: '#28a745' }}>
                                  Regular
                                </span>
                              )}
                            </div>
                          );
                        })()}
                      </td>
                      <td style={{ padding: '1rem', borderBottom: '1px solid #e1e5e9', textAlign: 'center' }}>
                        {new Date(student.createdAt).toLocaleDateString('es-ES')}
                      </td>
                      <td style={{ padding: '1rem', borderBottom: '1px solid #e1e5e9' }}>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
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
            </div>

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

      {/* Modal de Registro de Estudiante */}
      {showAddModal && (
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
            zIndex: 10000
          }}
          onClick={() => setShowAddModal(false)}
        >
          <div onClick={(e) => e.stopPropagation()}>
            <RegisterStudent 
              onSuccess={() => {
                setShowAddModal(false);
                fetchStudents();
                fetchStats();
              }}
              onCancel={() => setShowAddModal(false)}
            />
          </div>
        </div>
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
    condicion: student?.condicion || 'inscrito'
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
      // Capitalizar nombres y apellidos antes de enviar
      const capitalizedData = capitalizeUserNames({
        firstName: formData.firstName,
        lastName: formData.lastName
      });
      
      const dataToSend = {
        ...formData,
        firstName: capitalizedData.firstName,
        lastName: capitalizedData.lastName
      };
      
      await api.put(`/students/${student._id}`, dataToSend);
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
                <option value="inscrito">Inscripto</option>
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