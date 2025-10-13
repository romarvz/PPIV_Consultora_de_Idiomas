import React, { useState, useEffect, useMemo } from 'react';
import apiAdapter from '../../services/apiAdapter';
import CourseFormModal from '../../components/courses/CourseFormModal';
import { 
    FaBookOpen, 
    FaPen, 
    FaTrash, 
    FaCheckCircle, 
    FaTimes,
    FaTachometerAlt // Icono genérico para la primera tarjeta
} from 'react-icons/fa'; 

const CourseManagementPage = () => {
    // --- LÓGICA DEL COMPONENTE ---
    const [courses, setCourses] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCourse, setEditingCourse] = useState(null);

    // Cálculo de estadísticas derivado de 'courses'
    const { totalCourses, activeCourses, inactiveCourses } = useMemo(() => {
        const total = courses.length;
        const active = courses.filter(c => c.isActive).length;
        return {
            totalCourses: total,
            activeCourses: active,
            inactiveCourses: total - active
        };
    }, [courses]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const teachersData = (await import('../../services/mockData')).mockTeachers || [];
            const coursesResponse = await apiAdapter.courses.getAll();

            if (coursesResponse.data.success) {
                // Aseguramos que data.courses es un array
                const fetchedCourses = Array.isArray(coursesResponse.data.data.courses) ? coursesResponse.data.data.courses : [];
                setCourses(fetchedCourses);
            }
            setTeachers(teachersData);
        } catch (error) {
            console.error("Hubo un error al cargar los datos:", error);
            // Mostrar error al usuario
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleOpenModal = (course = null) => { setEditingCourse(course); setIsModalOpen(true); };
    const handleCloseModal = () => { setEditingCourse(null); setIsModalOpen(false); fetchData(); };
    const handleSave = () => { handleCloseModal(); };
    
    const handleDelete = async (courseId) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar este curso? Esta acción no se puede deshacer.')) {
            try {
                await apiAdapter.courses.delete(courseId);
                setCourses(prevCourses => prevCourses.filter(c => c._id !== courseId));
                alert('Curso eliminado exitosamente.');
            } catch (error) { 
                alert('Error al eliminar el curso. Revisa la consola para más detalles.'); 
                console.error(error);
            }
        }
    };

    const getTeacherName = (teacherId) => {
        const teacher = teachers.find(t => t._id === teacherId);
        return teacher ? `${teacher.firstName} ${teacher.lastName}` : 'Sin asignar';
    };


    if (loading) {
        return <div className="loading-state">Cargando gestión de cursos...</div>;
    }

    // --- JSX DEL COMPONENTE ---
    return (
        <div className="gestion-page-container">
            <h2 className="page-title">
                <FaBookOpen /> Gestión de Catálogo de Cursos
            </h2>

            {/* --- SECCIÓN DE KPI CARDS --- */}
            <div className="dashboard-grid kpi-cards-wrapper">
    
    {/* KPI 1: Total Cursos (Añadir la clase compacta y usar la clase de color para el texto) */}
    <div className="service-card kpi-card kpi-card--courses-total kpi-card--compact-white">
        {/* <div className="kpi-card__icon"><FaTachometerAlt /></div> <-- ¡QUITAR ESTO! */}
        <h3 className="kpi-card__value">{totalCourses}</h3>
        <p className="kpi-card__label">Total de Cursos</p>
    </div>

    {/* KPI 2: Cursos Activos */}
    <div className="service-card kpi-card kpi-card--courses-active kpi-card--compact-white">
        {/* <div className="kpi-card__icon"><FaCheckCircle /></div> <-- ¡QUITAR ESTO! */}
        <h3 className="kpi-card__value">{activeCourses}</h3>
        <p className="kpi-card__label">Cursos Activos</p>
    </div>

    {/* KPI 3: Cursos Inactivos */}
    <div className="service-card kpi-card kpi-card--courses-inactive kpi-card--compact-white">
        {/* <div className="kpi-card__icon"><FaTimes /></div> <-- ¡QUITAR ESTO! */}
        <h3 className="kpi-card__value">{inactiveCourses}</h3>
        <p className="kpi-card__label">Cursos Inactivos</p>
    </div>
</div>

            {/* --- BARRA DE ACCIONES (Búsqueda + Botón Nuevo Curso) --- */}
            <div className="table-actions-bar table-actions-bar--wide"> {/* Añadimos modificador CSS */}
                <input 
                    type="text" 
                    placeholder="Buscar por nombre, nivel o profesor..." 
                    className="form-input search-input search-input--wide" 
                />
                <button className="cta-btn new-entity-btn" onClick={() => handleOpenModal()}>
                    + Crear Nuevo Curso
                </button>
            </div>
            
            {/* --- TABLA --- */}
            <div className="table-responsive">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>Profesor</th> 
                            <th>Tipo/Mod.</th> 
                            <th>Precio</th>
                            <th>Nivel</th>
                            <th>Estado</th>
                            <th className="cell--center">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {courses.map(course => (
                            <tr key={course._id}>
                                <td>{course.name}</td>
                                <td>{getTeacherName(course.teacherId)}</td>
                                <td>{course.type} ({course.modality})</td>
                                <td>{course.currency} {course.price?.toLocaleString() || '0'}</td>
                                <td>{course.level}</td>
                                <td>
                                    <span className={`status-badge status-badge--${course.isActive ? 'activo' : 'inactivo'}`}>
                                        {course.isActive ? 'Activo' : 'Inactivo'}
                                    </span>
                                </td>
                                <td className="actions-cell">
                                    <button 
                                        className="action-btn action-btn--edit" 
                                        onClick={() => handleOpenModal(course)}
                                        title="Editar Curso"
                                    >
                                        <FaPen />
                                    </button>
                                    <button 
                                        className="action-btn action-btn--delete" 
                                        onClick={() => handleDelete(course._id)}
                                        title="Eliminar Curso"
                                    >
                                        <FaTrash />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {courses.length === 0 && !loading && <p className="no-data-message">No se encontraron cursos en el sistema.</p>}
            </div>

            {isModalOpen && (
                <CourseFormModal
                    course={editingCourse}
                    onClose={handleCloseModal}
                    onSave={handleSave}
                    teachers={teachers}
                />
            )}
        </div>
    );
};

export default CourseManagementPage;