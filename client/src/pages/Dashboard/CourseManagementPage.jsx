// /client/src/pages/Dashboard/CourseManagementPage.jsx

import React, { useState, useEffect } from 'react';
import apiAdapter from '../../services/apiAdapter';
import CourseFormModal from '../../components/courses/CourseFormModal';
import CalendarView from '../../components/admin/CalendarView.jsx';
import { FaCheckCircle, FaCalendarAlt, FaPlus, FaEdit, FaTrash } from 'react-icons/fa';

const CourseManagementPage = () => {
  // Component logic
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterModality, setFilterModality] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [coursesResponse, teachersData] = await Promise.all([
          apiAdapter.courses.getAll(),
          import('../../services/mockData').then(module => module.mockTeachers)
        ]);
        if (coursesResponse.data.success) {
          setCourses(coursesResponse.data.data.courses);
        }
        setTeachers(teachersData);
      } catch (error) {
        console.error("Hubo un error al cargar los datos:", error);
        alert('No se pudieron cargar los datos para la gestión de cursos.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleOpenModal = (course = null) => { setEditingCourse(course); setIsModalOpen(true); };
  const handleCloseModal = () => { setEditingCourse(null); setIsModalOpen(false); };
  const handleSave = () => { handleCloseModal(); window.location.reload(); };
  const handleDelete = async (courseId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este curso?')) {
      try {
        await apiAdapter.courses.delete(courseId);
        setCourses(prevCourses => prevCourses.filter(c => c._id !== courseId));
      } catch (error) { alert('Error al eliminar el curso.'); }
    }
  };

  if (loading) {
    return <p className="loading-message" style={{ textAlign: 'center', padding: '2rem' }}>Cargando gestión de cursos...</p>;
  }

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
            {[...new Set(courses.map(course => course.type))].map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          <select
            value={filterModality}
            onChange={(e) => setFilterModality(e.target.value)}
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
            <option value="all">Todas las modalidades</option>
            {[...new Set(courses.map(course => course.modality))].map(modality => (
              <option key={modality} value={modality}>{modality}</option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
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
            <option value="active">Activos</option>
            <option value="inactive">Inactivos</option>
          </select>
        </div>
      </div>
      
      {/* Table Section */}
      <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', minWidth: '800px', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#495057' }}>Nombre del Curso</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#495057' }}>Tipo</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#495057' }}>Modalidad</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#495057' }}>Estado</th>
                <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '600', color: '#495057' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {courses
                .filter(course => {
                  const matchesSearch = course.name.toLowerCase().includes(searchTerm.toLowerCase());
                  const matchesType = filterType === 'all' || course.type === filterType;
                  const matchesModality = filterModality === 'all' || course.modality === filterModality;
                  const matchesStatus = filterStatus === 'all' || 
                    (filterStatus === 'active' && course.isActive) ||
                    (filterStatus === 'inactive' && !course.isActive);
                  return matchesSearch && matchesType && matchesModality && matchesStatus;
                })
                .map(course => (
                <tr key={course._id} style={{ borderBottom: '1px solid #dee2e6' }}>
                  <td style={{ padding: '1rem', fontWeight: '600', color: '#2c3e50' }}>{course.name}</td>
                  <td style={{ padding: '1rem', color: '#6c757d' }}>{course.type}</td>
                  <td style={{ padding: '1rem', color: '#6c757d' }}>{course.modality}</td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{
                      display: 'inline-block',
                      width: '80px',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '12px',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      textTransform: 'uppercase',
                      textAlign: 'center',
                      background: course.isActive ? '#d4edda' : '#f8d7da',
                      color: course.isActive ? '#155724' : '#721c24'
                    }}>
                      {course.isActive ? 'Activo' : 'Inactivo'}
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
              ))}
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
            teachers={teachers}
          />
        </div>
      )}
    </div>
  );
};

export default CourseManagementPage;