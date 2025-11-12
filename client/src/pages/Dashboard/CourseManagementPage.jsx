// /client/src/pages/Dashboard/CourseManagementPage.jsx
// --- COPIAR Y PEGAR ESTE CÓDIGO COMPLETO ---

import React, { useState, useEffect } from 'react';
import apiAdapter from '../../services/apiAdapter';
import CourseFormModal from '../../components/courses/CourseFormModal';
import CourseClassesModal from '../../components/courses/CourseClassesModal';
import CourseEnrollmentModal from '../../components/courses/CourseEnrollmentModal';
import CourseEnrollmentSummaryModal from '../../components/courses/CourseEnrollmentSummaryModal';
import CourseStudentsModal from '../../components/courses/CourseStudentsModal';
import CalendarView from '../../components/admin/CalendarView.jsx';
import { FaCalendarAlt, FaPlus, FaEdit, FaTrash, FaUserPlus } from 'react-icons/fa';

const CourseManagementPage = () => {
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [isClassesModalOpen, setIsClassesModalOpen] = useState(false);
  const [classesCourse, setClassesCourse] = useState(null);
  const [isEnrollmentModalOpen, setIsEnrollmentModalOpen] = useState(false);
  const [enrollmentCourse, setEnrollmentCourse] = useState(null);
  const [enrollmentSummary, setEnrollmentSummary] = useState(null);
  const [studentsModalCourse, setStudentsModalCourse] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  // --- CAMBIO AQUÍ: Eliminamos filterModality (no existe en el modelo real) ---
  const [filterStatus, setFilterStatus] = useState('all'); // Este lo vamos a arreglar

  // --- CAMBIO AQUÍ: Movimos fetchData fuera del useEffect para poder reutilizarla ---
  const fetchData = async () => {
    try {
      setLoading(true);
      // --- CAMBIO AQUÍ: Llamamos a la API real de profesores y cursos en español ---
      const queryParams = {
        page: 1,
        limit: 100 // Evitamos quedarnos solo con los primeros 10 cursos por página
      };

      const [coursesResponse, teachersResponse] = await Promise.all([
        apiAdapter.cursos.getAll(queryParams), // Usamos 'cursos'
        apiAdapter.profesores.getAll({ status: 'activo' }) // Solo profesores activos
      ]);

      if (coursesResponse.data.success) {
        // El backend devuelve data como array directo de cursos
        const cursos = coursesResponse.data.data || [];
        setCourses(cursos);

        setEnrollmentCourse((prev) => {
          if (!prev) {
            return prev;
          }
          const updated = cursos.find((c) => c._id === prev._id);
          return updated || prev;
        });
      } else {
        console.warn('La respuesta de cursos no fue exitosa:', coursesResponse.data);
      }
      if (teachersResponse.data.success) {
        const profesores = teachersResponse.data.data || [];
        console.log('Profesores cargados:', profesores);
        setTeachers(profesores); // Cargamos profesores REALES
      } else {
        console.warn('La respuesta de profesores no fue exitosa:', teachersResponse.data);
      }
    } catch (error) {
      console.error("Hubo un error al cargar los datos:", error);
      console.error("Error completo:", error.response?.data || error.message);
      alert('No se pudieron cargar los datos para la gestión de cursos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(); // Llama a la función al cargar
  }, []); // Se ejecuta solo una vez

  const handleOpenModal = (course = null) => { setEditingCourse(course); setIsModalOpen(true); };
  const handleCloseModal = () => { setEditingCourse(null); setIsModalOpen(false); };
  
  // --- CAMBIO AQUÍ: Reemplazamos el reload() por fetchData() ---
  const handleSave = () => { 
    handleCloseModal(); 
    fetchData(); // Vuelve a cargar los datos sin recargar la página
  };

  const handleOpenClasses = (course) => {
    setClassesCourse(course);
    setIsClassesModalOpen(true);
  };

  const handleCloseClasses = () => {
    setClassesCourse(null);
    setIsClassesModalOpen(false);
  };

  const handleOpenEnrollment = (course) => {
    setEnrollmentSummary(null);
    setEnrollmentCourse(course);
    setIsEnrollmentModalOpen(true);
  };

  const handleCloseEnrollment = () => {
    setEnrollmentCourse(null);
    setIsEnrollmentModalOpen(false);
  };

  const handleEnrollmentSuccess = (summary) => {
    setEnrollmentSummary(summary);
    setIsEnrollmentModalOpen(false);
    fetchData();
  };

  const handleCloseSummary = () => {
    setEnrollmentSummary(null);
    setEnrollmentCourse(null);
  };

  const handleSummaryConfirm = () => {
    if (!enrollmentSummary) {
      return;
    }
    const updatedCourse =
      courses.find((c) => c._id === enrollmentSummary.courseId) ||
      enrollmentSummary.courseSnapshot ||
      enrollmentCourse;
    setEnrollmentSummary(null);
    if (updatedCourse) {
      setEnrollmentCourse(updatedCourse);
      setIsEnrollmentModalOpen(true);
    }
  };

  const handleOpenStudents = (course) => {
    setStudentsModalCourse(course);
  };

  const handleCloseStudents = () => {
    setStudentsModalCourse(null);
  };

  const handleDelete = async (courseId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este curso?')) {
      try {
        // --- CAMBIO AQUÍ: Usamos la ruta en español ---
        await apiAdapter.cursos.delete(courseId);
        setCourses(prevCourses => prevCourses.filter(c => c._id !== courseId));
      } catch (error) { alert('Error al eliminar el curso.'); }
    }
  };

  const getProfessorLabel = (course) => {
    const prof = course.profesor;
    if (!prof) return 'Sin asignar';
    if (typeof prof === 'object') {
      const first = prof.firstName ? prof.firstName.trim() : '';
      const last = prof.lastName ? prof.lastName.trim() : '';
      return last ? `${last}${first ? `, ${first.charAt(0)}.` : ''}` : (first || 'Sin asignar');
    }
    const fromList = teachers.find(t => t._id === prof);
    if (fromList) {
      const first = fromList.firstName ? fromList.firstName.trim() : '';
      const last = fromList.lastName ? fromList.lastName.trim() : '';
      return last ? `${last}${first ? `, ${first.charAt(0)}.` : ''}` : (first || 'Sin asignar');
    }
    return 'Sin asignar';
  };

  if (loading) {
    return <p className="loading-message" style={{ textAlign: 'center', padding: '2rem' }}>Cargando gestión de cursos...</p>;
  }

  // --- Lógica de filtrado corregida ---
  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.nombre.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || course.type === filterType;
    
    // --- CAMBIO AQUÍ: Filtramos por 'estado' (real) en vez de 'isActive' (mock) ---
    const matchesStatus = filterStatus === 'all' || course.estado === filterStatus;
                      
    return matchesSearch && matchesType && matchesStatus;
  });

  // Component JSX with modified table
  return (
    <div style={{ padding: '2rem', background: '#f8f9fa', minHeight: '100vh' }}>
      {/* Header */}
      <div className="dashboard-section">
        <h3 className="dashboard-section__title">Gestión de Catálogo de Cursos</h3>
      </div>
      
      {/* Calendar Section - Full Width */}
      <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', marginBottom: '2rem' }}>
        <h4 style={{ color: '#495057', marginBottom: '1rem', display: 'flex', alignItems: 'center', fontSize: '1rem', fontWeight: '600' }}>
          <FaCalendarAlt style={{ marginRight: '0.5rem', color: '#3498db' }} />
          Calendario de Clases
        </h4>
        <CalendarView />
      </div>
      
      {/* Button Section - Under Calendar */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '2rem' }}>
        <button 
          onClick={() => handleOpenModal()}
          // ... (estilos del botón sin cambios)
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
            transition: 'all 0.3s ease'
          }}
        >
          <FaPlus /> Crear Nuevo Curso
        </button>
      </div>
      
      {/* Search and Filter Section */}
      <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'stretch', flexWrap: 'wrap' }}>
          <div style={{ flex: '1', minWidth: '250px' }}>
            <input
              type="text"
              placeholder="Buscar por nombre de curso..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              // ... (estilos del input sin cambios)
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
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            // ... (estilos del select sin cambios)
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
            <option value="all">Todos los tipos</option>
            {/* --- CAMBIO AQUÍ: Usamos los datos reales de 'courses' --- */}
            {[...new Set(courses.map(course => course.type))].map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>

          {/* --- CAMBIO AQUÍ: Eliminamos el filtro de Modalidad --- */}

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            // ... (estilos del select sin cambios)
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
            {/* --- CAMBIO AQUÍ: Usamos los 'estado' reales del modelo --- */}
            <option value="all">Todos los estados</option>
            <option value="planificado">Planificado</option>
            <option value="activo">Activo</option>
            <option value="completado">Completado</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </div>
      </div>
      
      {/* Table Section */}
      <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', minWidth: '920px', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#495057' }}>Nombre del Curso</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#495057' }}>Tipo</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#495057' }}>Profesor</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#495057' }}>Vacantes</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#495057' }}>Estado</th>
                <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '600', color: '#495057' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredCourses.map((course) => {
                const inscritos = Array.isArray(course.estudiantes)
                  ? course.estudiantes.length
                  : (course.estudiantesCount || 0);
                const capacidad = course.vacantesMaximas ?? 30;
                const vacantesDisponibles = capacidad ? Math.max(capacidad - inscritos, 0) : null;

                return (
                  <tr key={course._id} style={{ borderBottom: '1px solid #dee2e6' }}>
                    <td style={{ padding: '1rem', fontWeight: '600', color: '#2c3e50' }}>{course.nombre}</td>
                    <td style={{ padding: '1rem', color: '#6c757d' }}>{course.type}</td>
                    <td style={{ padding: '1rem', color: '#6c757d' }}>{getProfessorLabel(course)}</td>
                    <td style={{ padding: '1rem', color: '#495057' }}>
                      <div style={{ fontWeight: 600 }}>
                        {inscritos}
                        {capacidad ? ` / ${capacidad}` : ''}
                      </div>
                      {capacidad && (
                        <div style={{ fontSize: '0.75rem', color: vacantesDisponibles > 0 ? '#0F5C8C' : '#c0392b' }}>
                          {vacantesDisponibles > 0 ? `${vacantesDisponibles} vacantes libres` : 'Sin vacantes disponibles'}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{
                        display: 'inline-block',
                        width: '100px',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '12px',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        textTransform: 'uppercase',
                        textAlign: 'center',
                        background: course.estado === 'activo' ? '#d4edda' :
                                   course.estado === 'planificado' ? '#fff3cd' :
                                   course.estado === 'completado' ? '#d1ecf1' : '#f8d7da',
                        color: course.estado === 'activo' ? '#155724' :
                               course.estado === 'planificado' ? '#856404' :
                               course.estado === 'completado' ? '#0c5460' : '#721c24'
                      }}>
                        {course.estado}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                      <button
                          onClick={() => handleOpenModal(course)}
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
                          onClick={() => handleOpenEnrollment(course)}
                          style={{
                            background: '#3088BF',
                            color: 'white',
                            border: 'none',
                            padding: '0.5rem 0.75rem',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '0.8rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.35rem'
                          }}
                          title="Inscribir estudiante"
                        >
                          <FaUserPlus />
                          Inscribir
                        </button>
                      <button
                          onClick={() => handleOpenClasses(course)}
                          style={{
                            background: '#0F5C8C',
                            color: 'white',
                            border: 'none',
                            padding: '0.5rem',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '0.8rem'
                          }}
                        >
                          Clases
                        </button>
                      <button
                        onClick={() => handleOpenStudents(course)}
                        style={{
                          background: '#1abc9c',
                          color: 'white',
                          border: 'none',
                          padding: '0.5rem 0.75rem',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '0.8rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.35rem'
                        }}
                        title="Ver inscritos"
                      >
                        Inscriptos
                      </button>
                        <button
                          onClick={() => handleDelete(course._id)}
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
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <CourseFormModal
            course={editingCourse}
            onClose={handleCloseModal}
            onSave={handleSave}
            teachers={teachers} // <-- ¡Ahora pasamos los profesores REALES!
          />
        </div>
      )}

      {isClassesModalOpen && classesCourse && (
        <CourseClassesModal
          course={classesCourse}
          onClose={handleCloseClasses}
          isReadOnly
        />
      )}

      {isEnrollmentModalOpen && enrollmentCourse && (
        <CourseEnrollmentModal
          course={enrollmentCourse}
          onClose={handleCloseEnrollment}
          onSuccess={handleEnrollmentSuccess}
        />
      )}

      {enrollmentSummary && (
        <CourseEnrollmentSummaryModal
          summary={enrollmentSummary}
          onClose={handleCloseSummary}
          onConfirm={handleSummaryConfirm}
        />
      )}

      {studentsModalCourse && (
        <CourseStudentsModal
          course={studentsModalCourse}
          onClose={handleCloseStudents}
        />
      )}
    </div>
  );
};

export default CourseManagementPage;