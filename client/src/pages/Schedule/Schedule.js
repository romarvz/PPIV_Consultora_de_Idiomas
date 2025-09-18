import React, { useState } from 'react';
import ScheduleCalendar from './ScheduleCalendar';
import ClassForm from './ClassForm';
import './Schedule.css';

const Schedule = () => {
  const [showForm, setShowForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [view, setView] = useState('week'); // week, month, day

  const handleAddClass = (date = null) => {
    setSelectedDate(date);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setSelectedDate(null);
  };

  return (
    <div className="schedule-page">
      <div className="page-header">
        <h1>Agenda de Clases</h1>
        <div className="header-actions">
          <div className="view-selector">
            <button 
              className={`btn ${view === 'day' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setView('day')}
            >
              Día
            </button>
            <button 
              className={`btn ${view === 'week' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setView('week')}
            >
              Semana
            </button>
            <button 
              className={`btn ${view === 'month' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setView('month')}
            >
              Mes
            </button>
          </div>
          <button className="btn btn-primary" onClick={() => handleAddClass()}>
            + Programar Clase
          </button>
        </div>
      </div>

      <ScheduleCalendar 
        view={view}
        onAddClass={handleAddClass}
      />

      {showForm && (
        <ClassForm
          selectedDate={selectedDate}
          onClose={handleCloseForm}
        />
      )}
    </div>
  );
};

export default Schedule;