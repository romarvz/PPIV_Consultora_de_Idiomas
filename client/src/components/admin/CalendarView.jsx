// /client/src/components/dashboard/CalendarView.jsx

import React, { useState, useEffect } from 'react';
import { FaChevronLeft, FaChevronRight, FaCalendarDay, FaCalendarWeek, FaCalendar } from 'react-icons/fa';
import apiAdapter from '../../services/apiAdapter';

const DAY_NAME_TO_INDEX = {
  domingo: 0,
  lunes: 1,
  martes: 2,
  miercoles: 3,
  jueves: 4,
  viernes: 5,
  sabado: 6
};

const STATUS_LABELS = {
  planificado: 'Planificado',
  activo: 'Activo',
  completado: 'Completado',
  cancelado: 'Cancelado'
};

const normalizeString = (value = '') =>
  value
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

const formatScheduleDisplay = (schedule) => {
  if (!schedule) {
    return 'Horario sin definir';
  }
  if (schedule.display) {
    return schedule.display;
  }
  const rawDay = schedule.dia ? schedule.dia.charAt(0).toUpperCase() + schedule.dia.slice(1) : 'Día';
  const start = schedule.horaInicio ? schedule.horaInicio.slice(0, 5) : '--:--';
  const end = schedule.horaFin ? schedule.horaFin.slice(0, 5) : '';
  return `${rawDay} ${start}${end ? ` - ${end}` : ''}`.trim();
};

const parseScheduleDayIndex = (schedule) => {
  if (!schedule) {
    return null;
  }
  const rawDay =
    schedule.dia ||
    (schedule.display && schedule.display.split(' ')[0]) ||
    schedule.day ||
    schedule.dayOfWeek;
  if (!rawDay) {
    return null;
  }
  const key = normalizeString(rawDay);
  return Object.prototype.hasOwnProperty.call(DAY_NAME_TO_INDEX, key)
    ? DAY_NAME_TO_INDEX[key]
    : null;
};

const minutesBetweenTimes = (start, end) => {
  if (!start || !end) {
    return null;
  }
  const [startH = 0, startM = 0] = start.split(':').map(Number);
  const [endH = 0, endM = 0] = end.split(':').map(Number);
  const diff = endH * 60 + endM - (startH * 60 + startM);
  return diff > 0 ? diff : null;
};

const addMinutesToTimeString = (start, minutes) => {
  if (!start || !Number.isFinite(minutes)) {
    return null;
  }
  const [hours = 0, mins = 0] = start.split(':').map(Number);
  const total = hours * 60 + mins + minutes;
  const normalized = ((total % (24 * 60)) + (24 * 60)) % (24 * 60);
  const endHours = Math.floor(normalized / 60);
  const endMinutes = normalized % 60;
  return `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;
};

const toDateOnly = (value) => {
  if (!value) {
    return null;
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  date.setHours(0, 0, 0, 0);
  return date;
};

const formatTeacherName = (profesor) => {
  if (!profesor) {
    return 'Sin asignar';
  }
  if (typeof profesor === 'string') {
    return 'Asignación pendiente';
  }
  const first = profesor.firstName || '';
  const last = profesor.lastName || '';
  const fullName = `${first} ${last}`.trim();
  return fullName || profesor.email || 'Sin asignar';
};

const formatModality = (modality) => {
  if (!modality) {
    return 'No especificada';
  }
  const normalized = normalizeString(modality);
  if (normalized === 'online' || normalized === 'virtual') {
    return 'Online';
  }
  if (normalized === 'presencial') {
    return 'Presencial';
  }
  return modality;
};

const getSchedulesForCourse = (course) => {
  if (!course) {
    return [];
  }
  const seen = new Set();
  const schedules = [];
  const pushUnique = (item) => {
    if (!item) {
      return;
    }
    const keySource = item._id || item.id || item;
    const key =
      keySource && typeof keySource === 'object' && keySource.toString
        ? keySource.toString()
        : String(keySource || '');
    if (!key || seen.has(key)) {
      return;
    }
    seen.add(key);
    schedules.push(item);
  };

  if (Array.isArray(course.horarios)) {
    course.horarios.forEach(pushUnique);
  }
  if (course.horario) {
    pushUnique(course.horario);
  }

  return schedules;
};

const getStatusColor = (status) => {
  const normalized = normalizeString(status);
  switch (normalized) {
    case 'activo':
      return '#27ae60';
    case 'planificado':
      return '#f1c40f';
    case 'completado':
      return '#2980b9';
    case 'cancelado':
      return '#e74c3c';
    default:
      return '#95a5a6';
  }
};

const getStatusLabel = (status) => STATUS_LABELS[normalizeString(status)] || status || 'Sin estado';

const CalendarView = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState('month');
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hoveredEvent, setHoveredEvent] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [selectedDayData, setSelectedDayData] = useState(null);

  const eventBackgroundColor = '#0F5C8C';

  const columnMinWidth = 140;
  const minCalendarWidth = `${columnMinWidth * 7}px`;
  const columnTemplate = `repeat(7, minmax(${columnMinWidth}px, 1fr))`;

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const response = await apiAdapter.cursos.getAll({
          page: 1,
          limit: 100
        });
        if (response?.data?.success) {
          const cursos = Array.isArray(response.data.data) ? response.data.data : [];
          setCourses(cursos);
        } else {
          setCourses([]);
        }
      } catch (error) {
        console.error('Error al cargar los cursos para el calendario:', error);
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    
    return days;
  };

  const getCoursesForDay = (day) => {
    if (!day || !Array.isArray(courses)) {
      return [];
    }

    const targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    targetDate.setHours(0, 0, 0, 0);
    const targetDayIndex = targetDate.getDay();
    const isoDate = targetDate.toISOString().split('T')[0];

    const events = [];

    courses.forEach((course) => {
      if (!course) {
        return;
      }

      const courseStart = toDateOnly(course.fechaInicio);
      const courseEnd = toDateOnly(course.fechaFin) || courseStart;

      if (courseStart && targetDate < courseStart) {
        return;
      }
      if (courseEnd && targetDate > courseEnd) {
        return;
      }

      const schedules = getSchedulesForCourse(course);
      if (schedules.length === 0) {
        return;
      }

      schedules.forEach((schedule) => {
        const scheduleDayIndex = parseScheduleDayIndex(schedule);
        if (scheduleDayIndex === null || scheduleDayIndex !== targetDayIndex) {
          return;
        }

        const rawStart = schedule.horaInicio ? schedule.horaInicio.slice(0, 5) : null;
        const duration =
          Number.isFinite(Number(schedule.duracionMinutos)) && Number(schedule.duracionMinutos) > 0
            ? Number(schedule.duracionMinutos)
            : minutesBetweenTimes(schedule.horaInicio, schedule.horaFin) ||
              Number(course.duracionClaseMinutos) ||
              null;
        const endTime = rawStart && duration ? addMinutesToTimeString(rawStart, duration) : null;

        const keySource = schedule._id || schedule.id || schedule;
        const scheduleKey =
          keySource && typeof keySource === 'object' && keySource.toString
            ? keySource.toString()
            : String(keySource || '');

        events.push({
          id: `${course._id || course.id}-${scheduleKey}-${isoDate}`,
          courseId: course._id || course.id,
          date: isoDate,
          time: rawStart || '--:--',
          endTime,
          courseName: course.nombre || 'Curso sin nombre',
          teacherName: formatTeacherName(course.profesor),
          status: course.estado || 'planificado',
          modality: course.modalidad || 'presencial',
          type: course.type || 'Curso',
          scheduleDisplay: formatScheduleDisplay(schedule),
          studentCount: Array.isArray(course.estudiantes) ? course.estudiantes.length : null,
          durationMinutes: duration,
          schedule
        });
      });
    });

    return events.sort((a, b) => (a.time || '').localeCompare(b.time || ''));
  };

  const handleDayClick = (day) => {
    if (!day) {
      return;
    }
    const dayEvents = getCoursesForDay(day);
    if (!dayEvents.length) {
      return;
    }
    const selectedDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day
    );
    setSelectedDayData({
      date: selectedDate,
      events: dayEvents
    });
  };

  return (
    <div style={{ fontFamily: 'Montserrat, sans-serif' }}>
      {/* Calendar Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '1rem',
        flexWrap: 'wrap',
        gap: '0.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            onClick={() => navigateMonth(-1)}
            style={{
              background: 'none',
              border: '1px solid #ddd',
              borderRadius: '6px',
              padding: '0.5rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              color: '#495057',
              minWidth: '40px',
              justifyContent: 'center'
            }}
          >
            <FaChevronLeft />
          </button>
          <h3 style={{ 
            margin: 0, 
            color: '#2c3e50', 
            fontSize: 'clamp(0.9rem, 2.5vw, 1.1rem)', 
            fontWeight: '600',
            whiteSpace: 'nowrap'
          }}>
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h3>
          <button
            onClick={() => navigateMonth(1)}
            style={{
              background: 'none',
              border: '1px solid #ddd',
              borderRadius: '6px',
              padding: '0.5rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              color: '#495057',
              minWidth: '40px',
              justifyContent: 'center'
            }}
          >
            <FaChevronRight />
          </button>
        </div>
        
        <button
          onClick={() => setCurrentDate(new Date())}
          style={{
            background: 'linear-gradient(135deg, #3498db, #2980b9)',
            color: 'white',
            border: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '0.85rem',
            fontWeight: '500',
            flexShrink: 0
          }}
        >
          Hoy
        </button>
      </div>

      {loading && (
        <div
          style={{
            padding: '0.5rem 0',
            color: 'var(--text-muted)',
            fontSize: '0.85rem',
            fontStyle: 'italic'
          }}
        >
          Cargando cursos del calendario...
        </div>
      )}

      {/* Calendar Grid */}
      <div
        style={{
          border: '1px solid var(--border-color)',
          borderRadius: '8px',
          overflow: 'hidden'
        }}
      >
        <div
          style={{
            overflowX: 'auto',
            width: '100%',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          {/* Day Headers */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: columnTemplate,
              background: 'var(--card-bg)',
              minWidth: minCalendarWidth
            }}
          >
          {dayNames.map(day => (
            <div key={day} style={{
              padding: 'clamp(0.25rem, 1.5vw, 0.75rem)',
              textAlign: 'center',
              fontWeight: '600',
              color: 'var(--text-color)',
              fontSize: 'clamp(0.7rem, 2vw, 0.85rem)',
              borderRight: '1px solid var(--border-color)'
            }}>
              {day}
            </div>
          ))}
          </div>
          
          {/* Calendar Days */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: columnTemplate,
              minWidth: minCalendarWidth
            }}
          >
          {getDaysInMonth().map((day, index) => {
            const dayEvents = getCoursesForDay(day);
            const isToday = day && 
              new Date().getDate() === day && 
              new Date().getMonth() === currentDate.getMonth() && 
              new Date().getFullYear() === currentDate.getFullYear();
            
            return (
              <div
                key={index}
                onClick={() => handleDayClick(day)}
                style={{
                minHeight: 'clamp(60px, 15vw, 80px)',
                padding: 'clamp(0.25rem, 1vw, 0.5rem)',
                borderRight: '1px solid var(--border-color)',
                borderBottom: '1px solid var(--border-color)',
                background: day ? (isToday ? 'var(--primary-light)' : 'var(--bg-color)') : 'var(--card-bg)',
                position: 'relative',
                cursor: dayEvents.length ? 'pointer' : 'default'
              }}>
                {day && (
                  <>
                    <div style={{
                      fontSize: 'clamp(0.75rem, 2.5vw, 0.9rem)',
                      fontWeight: isToday ? '600' : '500',
                      color: isToday ? 'var(--primary-color)' : 'var(--text-color)',
                      marginBottom: 'clamp(0.1rem, 0.5vw, 0.25rem)'
                    }}>
                      {day}
                    </div>
                    {dayEvents.slice(0, window.innerWidth < 768 ? 1 : 2).map((event, idx) => (
                      <div 
                        key={idx} 
                        onMouseEnter={(e) => {
                          setHoveredEvent(event);
                          setMousePosition({ x: e.clientX, y: e.clientY });
                        }}
                        onMouseLeave={() => setHoveredEvent(null)}
                        onMouseMove={(e) => {
                          if (hoveredEvent) {
                            setMousePosition({ x: e.clientX, y: e.clientY });
                          }
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (hoveredEvent && hoveredEvent.id === event.id) {
                            setHoveredEvent(null);
                            return;
                          }
                          const rect = e.currentTarget.getBoundingClientRect();
                          setHoveredEvent(event);
                          setMousePosition({
                            x: rect.left + rect.width / 2,
                            y: rect.top + rect.height
                          });
                        }}
                        style={{
                          padding: 'clamp(0.2rem, 0.5vw, 0.35rem) clamp(0.3rem, 0.7vw, 0.5rem)',
                          borderRadius: '4px',
                          marginBottom: 'clamp(0.15rem, 0.4vw, 0.25rem)',
                          background: eventBackgroundColor,
                          color: 'white',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '2px',
                          boxShadow: '0 1px 2px rgba(0,0,0,0.18)',
                          minHeight: 'clamp(36px, 6vw, 44px)'
                        }}
                      >
                        <span
                          style={{
                            fontWeight: 600,
                            fontSize: 'clamp(0.62rem, 1.8vw, 0.78rem)',
                            lineHeight: 1.1
                          }}
                        >
                          {event.courseName}
                        </span>
                        <span
                          style={{
                            fontSize: 'clamp(0.55rem, 1.6vw, 0.68rem)',
                            opacity: 0.9,
                            lineHeight: 1.1
                          }}
                        >
                          {event.time}
                          {event.endTime ? ` - ${event.endTime}` : ''}
                        </span>
                        {!!event.teacherName && (
                          <span
                            style={{
                              fontSize: 'clamp(0.52rem, 1.5vw, 0.64rem)',
                              opacity: 0.85,
                              lineHeight: 1.1
                            }}
                          >
                            {event.teacherName}
                          </span>
                        )}
                      </div>
                    ))}
                    {dayEvents.length > (window.innerWidth < 768 ? 1 : 2) && (
                      <div style={{
                        fontSize: 'clamp(0.55rem, 1.5vw, 0.65rem)',
                        color: 'var(--text-muted)',
                        fontWeight: '500'
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDayClick(day);
                      }}>
                        +{dayEvents.length - (window.innerWidth < 768 ? 1 : 2)} más
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
          </div>
        </div>
      </div>
      
      {/* Hover Tooltip */}
      {hoveredEvent && (
        <div style={{
          position: 'fixed',
          left: mousePosition.x + 10,
          top: mousePosition.y - 10,
          background: 'var(--tooltip-bg)',
          color: 'var(--tooltip-text)',
          padding: '0.75rem',
          borderRadius: '8px',
          fontSize: '0.8rem',
          zIndex: 1000,
          pointerEvents: 'none',
          maxWidth: '250px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
          border: '1px solid var(--border-color)'
        }}>
          <div style={{ fontWeight: '600', marginBottom: '0.5rem', color: 'var(--tooltip-text)' }}>
            {hoveredEvent.courseName}
          </div>
          <div style={{ marginBottom: '0.25rem' }}>
            <strong>Horario:</strong> {hoveredEvent.scheduleDisplay}
          </div>
          <div style={{ marginBottom: '0.25rem' }}>
            <strong>Profesor:</strong> {hoveredEvent.teacherName || 'No asignado'}
          </div>
          <div style={{ marginBottom: '0.25rem' }}>
            <strong>Modalidad:</strong> {formatModality(hoveredEvent.modality)}
          </div>
          {hoveredEvent.type && (
            <div style={{ marginBottom: '0.25rem' }}>
              <strong>Tipo:</strong> {hoveredEvent.type}
            </div>
          )}
          {Number.isFinite(hoveredEvent.durationMinutes) && (
            <div style={{ marginBottom: '0.25rem' }}>
              <strong>Duración:</strong> {hoveredEvent.durationMinutes} min
            </div>
          )}
          {Number.isFinite(hoveredEvent.studentCount) && (
            <div style={{ marginBottom: '0.25rem' }}>
              <strong>Estudiantes:</strong> {hoveredEvent.studentCount}
            </div>
          )}
          <div>
            <strong>Estado:</strong>{' '}
            <span style={{ color: getStatusColor(hoveredEvent.status) }}>
              {getStatusLabel(hoveredEvent.status)}
            </span>
          </div>
        </div>
      )}

      {selectedDayData && (
        <div
          onClick={() => setSelectedDayData(null)}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.45)',
            zIndex: 1100
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'absolute',
              top: '30rem',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'white',
              borderRadius: '12px',
              maxWidth: '700px',
              width: 'calc(100% - 2rem)',
              maxHeight: 'calc(100vh - 7rem)',
              overflowY: 'auto',
              boxShadow: '0 20px 50px rgba(0,0,0,0.2)',
              padding: '1.5rem',
              fontFamily: 'inherit'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h4 style={{ margin: 0, color: '#2c3e50', fontSize: '1.1rem' }}>
                {selectedDayData.date.toLocaleDateString('es-ES', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </h4>
              <button
                onClick={() => setSelectedDayData(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.25rem',
                  cursor: 'pointer',
                  color: '#6c757d'
                }}
                aria-label="Cerrar detalle del día"
              >
                ×
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {selectedDayData.events.map((event) => (
                <div
                  key={event.id}
                  style={{
                    border: `1px solid ${getStatusColor(event.status)}`,
                    borderRadius: '10px',
                    padding: '0.85rem 1rem',
                    background: '#fdfefe',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.4rem'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                    <strong style={{ fontSize: '1rem', color: '#2c3e50' }}>{event.courseName}</strong>
                    <span
                      style={{
                        background: getStatusColor(event.status),
                        color: 'white',
                        borderRadius: '999px',
                        padding: '0.2rem 0.6rem',
                        fontSize: '0.7rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}
                    >
                      {getStatusLabel(event.status)}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.9rem', color: '#34495e' }}>
                    <strong>Horario:</strong> {event.time}
                    {event.endTime ? ` - ${event.endTime}` : ''}
                  </div>

                  {event.teacherName && (
                    <div style={{ fontSize: '0.9rem', color: '#34495e' }}>
                      <strong>Profesor:</strong> {event.teacherName}
                    </div>
                  )}

                  <div style={{ fontSize: '0.9rem', color: '#34495e' }}>
                    <strong>Modalidad:</strong> {formatModality(event.modality)}
                  </div>

                  {event.type && (
                    <div style={{ fontSize: '0.9rem', color: '#34495e' }}>
                      <strong>Tipo:</strong> {event.type}
                    </div>
                  )}

                  {Number.isFinite(event.studentCount) && (
                    <div style={{ fontSize: '0.9rem', color: '#34495e' }}>
                      <strong>Estudiantes:</strong> {event.studentCount}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarView;