import React, { useEffect, useMemo, useState } from 'react';
import { FaCalendarCheck, FaChalkboardTeacher, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth.jsx';
import AuthNavbar from '../../components/common/AuthNavbar';
import TeacherCourseClasses from '../../components/courses/TeacherCourseClasses';
import apiAdapter from '../../services/apiAdapter';
import '../../styles/variables.css';
import '../../styles/auth.css';
import '../../styles/charts.css';

const summaryCardStyle = {
  borderRadius: '12px',
  border: '1px solid var(--border-color, #e5e7eb)',
  padding: '1rem',
  background: 'var(--card-bg, #fff)',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.35rem',
  boxShadow: '0 6px 18px rgba(15, 23, 42, 0.08)'
};

const infoLabelStyle = {
  fontSize: '0.9rem',
  color: 'var(--text-secondary, #6b7280)'
};

const infoValueStyle = {
  fontSize: '1rem',
  fontWeight: 600,
  color: 'var(--text-primary, #111827)'
};

const calendarGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(7, 1fr)',
  gap: '1px',
  backgroundColor: '#e5e7eb',
  borderRadius: '8px',
  overflow: 'hidden'
};

const calendarDayCardStyle = {
  padding: '0.5rem',
  background: '#fff',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.25rem',
  minHeight: '100px',
  position: 'relative'
};

const calendarDayHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  color: 'var(--text-primary, #111827)',
  fontWeight: 600,
  fontSize: '0.95rem'
};

const calendarClassCardStyle = {
  borderRadius: '10px',
  border: '1px solid #e5e7eb',
  padding: '0.55rem 0.65rem',
  background: 'linear-gradient(135deg, #f8fafc, #edf2f7)',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.35rem'
};

const normalizeToArray = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (payload && Array.isArray(payload.data)) return payload.data;
  if (payload && Array.isArray(payload.items)) return payload.items;
  if (payload && Array.isArray(payload.results)) return payload.results;
  if (payload && Array.isArray(payload.cursos)) return payload.cursos;
  if (payload && Array.isArray(payload.clases)) return payload.clases;
  return [];
};

const isSameDay = (dateA, dateB) => {
  return (
    dateA.getFullYear() === dateB.getFullYear() &&
    dateA.getMonth() === dateB.getMonth() &&
    dateA.getDate() === dateB.getDate()
  );
};

const buildCalendarDays = (classes, weekOffset = 0) => {
  const today = new Date();
  
  // Calculate start of current week (Sunday)
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  
  // Apply week offset
  startOfWeek.setDate(startOfWeek.getDate() + (weekOffset * 7));
  
  // Build 4 weeks (28 days)
  const days = [];
  for (let i = 0; i < 28; i++) {
    const day = new Date(startOfWeek);
    day.setDate(startOfWeek.getDate() + i);
    
    const dayClasses = classes.filter((clase) => {
      if (!clase?.fechaHora) return false;
      const classDate = new Date(clase.fechaHora);
      return isSameDay(classDate, day);
    });
    
    const isPast = day < today;
    
    days.push({
      date: day,
      classes: dayClasses.sort((a, b) => new Date(a.fechaHora) - new Date(b.fechaHora)),
      isPast
    });
  }
  
  return days;
};

const dedupeBySchedule = (items = []) => {
  const map = new Map();

  const score = (clase) => {
    const updated = clase.updatedAt ? new Date(clase.updatedAt).getTime() : 0;
    const lengthSum =
      (clase.descripcion ? clase.descripcion.length : 0) +
      (clase.contenido ? clase.contenido.length : 0) +
      (clase.tareas ? clase.tareas.length : 0) +
      (clase.notasProfesor ? clase.notasProfesor.length : 0);
    return updated + lengthSum;
  };

  items.forEach((clase) => {
    if (!clase || !clase.fechaHora) {
      return;
    }
    const cursoId = typeof clase.curso === 'string' ? clase.curso : clase.curso?._id || 'sin-curso';
    const key = `${cursoId}-${new Date(clase.fechaHora).toISOString()}`;
    const current = map.get(key);
    if (!current || score(clase) >= score(current)) {
      map.set(key, clase);
    }
  });

  return Array.from(map.values()).sort(
    (a, b) => new Date(a.fechaHora) - new Date(b.fechaHora)
  );
};

const TeacherDashboard = () => {
  const { user, logout } = useAuth();
  const [courses, setCourses] = useState([]);
  const [upcomingClasses, setUpcomingClasses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [error, setError] = useState(null);
  const [refreshToken, setRefreshToken] = useState(Date.now());
  const [weekOffset, setWeekOffset] = useState(0);

  useEffect(() => {
    if (!user) {
      return;
    }

    const fetchCourses = async () => {
      try {
        setLoadingCourses(true);
        const response = await apiAdapter.cursos.getMine();
        console.log('TeacherDashboard: cursos response', response?.data);
        const rawData = response?.data?.data;
        const normalized = normalizeToArray(rawData);
        if (!Array.isArray(normalized)) {
          console.warn('TeacherDashboard: formato de cursos inesperado', rawData);
        }
        setCourses(normalized || []);
        setError(null);
      } catch (err) {
        console.error('TeacherDashboard: error cargando cursos', err);
        const message = err.response?.data?.error || 'Error al cargar tus cursos.';
        setError(message);
        setCourses([]);
      } finally {
        setLoadingCourses(false);
      }
    };

    fetchCourses();
  }, [user, refreshToken]);

  useEffect(() => {
    if (!user) {
      return;
    }

    const fetchClasses = async () => {
      try {
        setLoadingClasses(true);
        const nowIso = new Date().toISOString();
        const response = await apiAdapter.classes.getMine({
          fechaInicio: nowIso,
          limit: 100
        });
        console.log('TeacherDashboard: clases response', response?.data);
        const rawData = response?.data?.data;
        const normalized = normalizeToArray(rawData);
        if (!Array.isArray(normalized)) {
          console.warn('TeacherDashboard: formato de clases inesperado', rawData);
        }
        setUpcomingClasses(dedupeBySchedule(normalized || []));
      } catch (err) {
        console.error('TeacherDashboard: error cargando clases', err);
        setUpcomingClasses([]);
      } finally {
        setLoadingClasses(false);
      }
    };

    fetchClasses();
  }, [user, refreshToken]);

  const upcomingList = useMemo(() => {
    const now = new Date();
    return upcomingClasses
      .filter((clase) => clase?.fechaHora && new Date(clase.fechaHora) >= now)
      .sort((a, b) => new Date(a.fechaHora) - new Date(b.fechaHora));
  }, [upcomingClasses]);

  const calendarDays = useMemo(() => buildCalendarDays(upcomingClasses, weekOffset), [upcomingClasses, weekOffset]);
  const monthYearFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat('es-AR', {
        month: 'long',
        year: 'numeric'
      }),
    []
  );
  
  const currentDisplayDate = useMemo(() => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + (weekOffset * 7));
    return startOfWeek;
  }, [weekOffset]);
  const timeFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat([], {
        hour: '2-digit',
        minute: '2-digit'
      }),
    []
  );

  const totalCourses = courses.length;
  const upcomingCount = upcomingClasses.length;

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const triggerRefresh = () => setRefreshToken(Date.now());

  return (
    <div className="dashboard-container">
      <AuthNavbar user={user} onLogout={handleLogout} showBackButton={false} />

      <div className="dashboard-info-card">
        <h3 className="dashboard-info-card__title">Resumen de tu actividad</h3>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1rem'
          }}
        >
          <div style={summaryCardStyle}>
            <span style={infoLabelStyle}>Correo</span>
            <span style={infoValueStyle}>{user?.email || 'Sin datos'}</span>
            <span style={infoLabelStyle}>DNI</span>
            <span style={infoValueStyle}>{user?.dni || 'Sin datos'}</span>
          </div>

          <div style={summaryCardStyle}>
            <span style={{ ...infoLabelStyle, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FaChalkboardTeacher color="#2563eb" />
              Cursos asignados
            </span>
            <span style={{ ...infoValueStyle, fontSize: '1.3rem' }}>{totalCourses}</span>
            <span style={infoLabelStyle}>Cursos publicados para ti</span>
          </div>

          <div style={summaryCardStyle}>
            <span style={{ ...infoLabelStyle, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FaCalendarCheck color="#16a34a" />
              Clases próximas
            </span>
            <span style={{ ...infoValueStyle, fontSize: '1.3rem' }}>{upcomingCount}</span>
            <span style={infoLabelStyle}>Incluye clases confirmadas y pendientes</span>
          </div>
        </div>

        {error && (
          <div
            style={{
              marginTop: '1rem',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              border: '1px solid #fecaca',
              background: '#fef2f2',
              color: '#b91c1c'
            }}
          >
            {error}
          </div>
        )}
      </div>

      <div className="dashboard-card" style={{ marginTop: '1.5rem' }}>
        <div className="dashboard-card__header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FaCalendarCheck className="dashboard-card__icon" />
            <h4 className="dashboard-card__title">Calendario - {monthYearFormatter.format(currentDisplayDate)}</h4>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => setWeekOffset(weekOffset - 1)}
              style={{
                padding: '0.5rem',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                background: '#fff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <FaChevronLeft size={14} />
            </button>
            <button
              onClick={() => setWeekOffset(weekOffset + 1)}
              style={{
                padding: '0.5rem',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                background: '#fff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <FaChevronRight size={14} />
            </button>
          </div>
        </div>

        {loadingClasses ? (
          <p style={{ color: 'var(--text-secondary)' }}>Cargando tus clases...</p>
        ) : calendarDays.every((day) => day.classes.length === 0) ? (
          <p style={{ color: 'var(--text-secondary)' }}>
            No tenés clases agendadas. Podés programarlas o ajustarlas desde la sección de cada curso.
          </p>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1px', marginBottom: '1rem', backgroundColor: '#f3f4f6', borderRadius: '4px', overflow: 'hidden' }}>
              {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
                <div key={day} style={{ padding: '0.75rem', textAlign: 'center', fontWeight: '600', color: '#374151', backgroundColor: '#f9fafb' }}>
                  {day}
                </div>
              ))}
            </div>
            
            <div style={calendarGridStyle}>
              {calendarDays.map(({ date, classes, isPast }) => {
                const today = new Date();
                const isToday = isSameDay(date, today);
                return (
                  <div key={date.toISOString()} style={{
                    ...calendarDayCardStyle,
                    backgroundColor: isPast ? '#f3f4f6' : '#fff',
                    border: isToday ? '2px solid #0F5C8C' : '1px solid #e5e7eb'
                  }}>
                    <div style={{ 
                      fontSize: '0.875rem', 
                      fontWeight: isToday ? '700' : '500', 
                      color: isToday ? '#0F5C8C' : '#111827', 
                      marginBottom: '0.25rem' 
                    }}>
                      {date.getDate()}
                    </div>
                    {classes.map((clase) => {
                      const isCompleted = isPast || clase.estado === 'completada';
                      const courseName = typeof clase.curso === 'string' ? clase.curso : clase.curso?.nombre || 'Curso';
                      return (
                        <div key={clase._id} style={{
                          padding: '0.4rem',
                          borderRadius: '6px',
                          fontSize: '0.7rem',
                          backgroundColor: isCompleted ? '#0F5C8C' : '#27ae60',
                          color: 'white',
                          marginBottom: '0.25rem',
                          lineHeight: '1.2'
                        }}>
                          <div style={{ fontWeight: '600', marginBottom: '0.1rem' }}>
                            {timeFormatter.format(new Date(clase.fechaHora))}
                          </div>
                          <div style={{ opacity: 0.9, fontSize: '0.65rem' }}>
                            {courseName}
                          </div>
                          {clase.tema && (
                            <div style={{ opacity: 0.8, fontSize: '0.6rem', marginTop: '0.1rem' }}>
                              {clase.tema.length > 15 ? `${clase.tema.substring(0, 15)}...` : clase.tema}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      <section style={{ marginTop: '2rem' }}>
        <h3 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>Mis cursos</h3>
        {loadingCourses ? (
          <p style={{ color: 'var(--text-secondary)' }}>Cargando tus cursos...</p>
        ) : courses.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)' }}>
            Aún no tenés cursos asignados. Cuando la administración te asigne uno, aparecerá aquí.
          </p>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '1.5rem'
            }}
          >
            {courses.map((course) => (
              <TeacherCourseClasses
                key={course._id}
                course={course}
                refreshToken={refreshToken}
                onRefresh={triggerRefresh}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default TeacherDashboard;


