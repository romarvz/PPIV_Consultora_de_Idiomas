// /client/src/components/dashboard/CalendarView.jsx

import React, { useState, useEffect } from 'react';
import { FaChevronLeft, FaChevronRight, FaCalendarDay, FaCalendarWeek, FaCalendar } from 'react-icons/fa';
import apiAdapter from '../../services/apiAdapter';

const CalendarView = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState('month');
  const [classes, setClasses] = useState([]);
  const [hoveredEvent, setHoveredEvent] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await apiAdapter.classes.getAll();
        if (response.data.success) {
          setClasses(response.data.data.classes);
        }
      } catch (error) {
        console.error("Error al cargar las clases:", error);
      }
    };
    fetchClasses();
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

  const getClassesForDay = (day) => {
    if (!day) return [];
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return classes.filter(cls => cls.date === dateStr);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completada': return '#27ae60';
      case 'cancelada': return '#e74c3c';
      case 'programada': return '#3498db';
      default: return '#95a5a6';
    }
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

      {/* Calendar Grid */}
      <div style={{ border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden' }}>
        {/* Day Headers */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', background: 'var(--card-bg)' }}>
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
          {getDaysInMonth().map((day, index) => {
            const dayClasses = getClassesForDay(day);
            const isToday = day && 
              new Date().getDate() === day && 
              new Date().getMonth() === currentDate.getMonth() && 
              new Date().getFullYear() === currentDate.getFullYear();
            
            return (
              <div key={index} style={{
                minHeight: 'clamp(60px, 15vw, 80px)',
                padding: 'clamp(0.25rem, 1vw, 0.5rem)',
                borderRight: '1px solid var(--border-color)',
                borderBottom: '1px solid var(--border-color)',
                background: day ? (isToday ? 'var(--primary-light)' : 'var(--bg-color)') : 'var(--card-bg)',
                position: 'relative'
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
                    {dayClasses.slice(0, window.innerWidth < 768 ? 1 : 2).map((cls, idx) => (
                      <div 
                        key={idx} 
                        onMouseEnter={(e) => {
                          setHoveredEvent(cls);
                          setMousePosition({ x: e.clientX, y: e.clientY });
                        }}
                        onMouseLeave={() => setHoveredEvent(null)}
                        onMouseMove={(e) => {
                          if (hoveredEvent) {
                            setMousePosition({ x: e.clientX, y: e.clientY });
                          }
                        }}
                        style={{
                          fontSize: 'clamp(0.6rem, 1.8vw, 0.7rem)',
                          padding: 'clamp(0.1rem, 0.3vw, 0.15rem) clamp(0.2rem, 0.5vw, 0.3rem)',
                          borderRadius: '3px',
                          marginBottom: 'clamp(0.1rem, 0.3vw, 0.15rem)',
                          background: getStatusColor(cls.status),
                          color: 'white',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        {window.innerWidth < 768 ? cls.time : `${cls.time} - ${cls.courseName || cls.subject}`}
                      </div>
                    ))}
                    {dayClasses.length > (window.innerWidth < 768 ? 1 : 2) && (
                      <div style={{
                        fontSize: 'clamp(0.55rem, 1.5vw, 0.65rem)',
                        color: 'var(--text-muted)',
                        fontWeight: '500'
                      }}>
                        +{dayClasses.length - (window.innerWidth < 768 ? 1 : 2)} más
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Legend */}
      <div style={{ 
        display: 'flex', 
        gap: 'clamp(0.5rem, 2vw, 1rem)', 
        marginTop: '1rem', 
        fontSize: 'clamp(0.7rem, 2vw, 0.8rem)',
        flexWrap: 'wrap',
        justifyContent: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '2px', background: '#3498db', flexShrink: 0 }}></div>
          <span>Programada</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '2px', background: '#27ae60', flexShrink: 0 }}></div>
          <span>Completada</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '2px', background: '#e74c3c', flexShrink: 0 }}></div>
          <span>Cancelada</span>
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
            {hoveredEvent.courseName || hoveredEvent.subject}
          </div>
          <div style={{ marginBottom: '0.25rem' }}>
            <strong>Hora:</strong> {hoveredEvent.time}
          </div>
          <div style={{ marginBottom: '0.25rem' }}>
            <strong>Profesor:</strong> {hoveredEvent.teacherName || 'No asignado'}
          </div>
          <div style={{ marginBottom: '0.25rem' }}>
            <strong>Estudiantes:</strong> {hoveredEvent.studentCount || 0}
          </div>
          <div>
            <strong>Estado:</strong> <span style={{ 
              color: hoveredEvent.status === 'completada' ? '#27ae60' : 
                     hoveredEvent.status === 'cancelada' ? '#e74c3c' : '#3498db'
            }}>
              {hoveredEvent.status === 'completada' ? 'Completada' : 
               hoveredEvent.status === 'cancelada' ? 'Cancelada' : 'Programada'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarView;