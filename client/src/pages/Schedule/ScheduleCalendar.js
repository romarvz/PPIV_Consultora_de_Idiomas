import React, { useState, useEffect } from 'react';

const mockClasses = [
  {
    id: 1,
    title: 'Inglés Básico A1',
    teacher: 'Prof. García',
    date: new Date(2024, 0, 15, 9, 0),
    duration: 90,
    students: ['Juan Pérez', 'María López']
  },
  {
    id: 2,
    title: 'Inglés Intermedio B1',
    teacher: 'Prof. Martínez',
    date: new Date(2024, 0, 15, 14, 30),
    duration: 120,
    students: ['Carlos Ruiz', 'Ana Silva']
  }
];

const ScheduleCalendar = ({ view, onAddClass }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [classes, setClasses] = useState([]);

  useEffect(() => {
    setClasses(mockClasses);
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getEndTime = (startDate, duration) => {
    const endDate = new Date(startDate.getTime() + duration * 60000);
    return formatTime(endDate);
  };

  const navigateDate = (direction) => {
    const newDate = new Date(currentDate);
    
    if (view === 'day') {
      newDate.setDate(newDate.getDate() + direction);
    } else if (view === 'week') {
      newDate.setDate(newDate.getDate() + (direction * 7));
    } else if (view === 'month') {
      newDate.setMonth(newDate.getMonth() + direction);
    }
    
    setCurrentDate(newDate);
  };

  const getDateRange = () => {
    if (view === 'day') {
      return currentDate.toLocaleDateString('es-ES', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } else if (view === 'week') {
      const startOfWeek = new Date(currentDate);
      startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      
      return `${startOfWeek.toLocaleDateString('es-ES')} - ${endOfWeek.toLocaleDateString('es-ES')}`;
    } else {
      return currentDate.toLocaleDateString('es-ES', { 
        year: 'numeric', 
        month: 'long' 
      });
    }
  };

  const renderDayView = () => {
    const dayClasses = classes.filter(cls => 
      cls.date.toDateString() === currentDate.toDateString()
    );

    return (
      <div className="day-view">
        <div className="time-slots">
          {Array.from({ length: 12 }, (_, i) => {
            const hour = i + 8; // 8 AM to 8 PM
            const timeSlot = `${hour.toString().padStart(2, '0')}:00`;
            const slotClasses = dayClasses.filter(cls => 
              cls.date.getHours() === hour
            );

            return (
              <div key={hour} className="time-slot">
                <div className="time-label">{timeSlot}</div>
                <div className="slot-content">
                  {slotClasses.map(cls => (
                    <div key={cls.id} className="class-item">
                      <div className="class-title">{cls.title}</div>
                      <div className="class-teacher">{cls.teacher}</div>
                      <div className="class-time">
                        {formatTime(cls.date)} - {getEndTime(cls.date, cls.duration)}
                      </div>
                    </div>
                  ))}
                  <button 
                    className="add-class-btn"
                    onClick={() => onAddClass(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), hour))}
                  >
                    +
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderWeekView = () => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    
    const weekDays = Array.from({ length: 7 }, (_, i) => {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      return day;
    });

    return (
      <div className="week-view">
        <div className="week-header">
          {weekDays.map(day => (
            <div key={day.toDateString()} className="day-header">
              <div className="day-name">
                {day.toLocaleDateString('es-ES', { weekday: 'short' })}
              </div>
              <div className="day-number">{day.getDate()}</div>
            </div>
          ))}
        </div>
        <div className="week-content">
          {weekDays.map(day => {
            const dayClasses = classes.filter(cls => 
              cls.date.toDateString() === day.toDateString()
            );
            
            return (
              <div key={day.toDateString()} className="day-column">
                {dayClasses.map(cls => (
                  <div key={cls.id} className="class-item small">
                    <div className="class-title">{cls.title}</div>
                    <div className="class-time">{formatTime(cls.date)}</div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="schedule-calendar">
      <div className="calendar-header">
        <button className="btn btn-secondary" onClick={() => navigateDate(-1)}>
          ←
        </button>
        <h2>{getDateRange()}</h2>
        <button className="btn btn-secondary" onClick={() => navigateDate(1)}>
          →
        </button>
      </div>

      <div className="calendar-content">
        {view === 'day' && renderDayView()}
        {view === 'week' && renderWeekView()}
        {view === 'month' && (
          <div className="month-view">
            <p>Vista mensual - En desarrollo</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScheduleCalendar;