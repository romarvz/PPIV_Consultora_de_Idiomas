// /client/src/components/dashboard/CalendarView.jsx

import React, { useState, useEffect } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import es from 'date-fns/locale/es'; // Para traducir el calendario al español
import 'react-big-calendar/lib/css/react-big-calendar.css'; // Estilos de la librería
import apiAdapter from '../../services/apiAdapter';

// Configuración inicial para que el calendario entienda español
const locales = { 'es': es };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

const CalendarView = () => {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await apiAdapter.classes.getAll();
        if (response.data.success) {
          // Transformamos nuestras clases al formato que el calendario necesita
          const formattedEvents = response.data.data.classes.map(cls => ({
            title: `${cls.subject} - ${cls.studentName}`,
            start: new Date(`${cls.date}T${cls.time}`),
            end: new Date(new Date(`${cls.date}T${cls.time}`).getTime() + cls.duration * 60000),
            resource: { status: cls.status } // Guardamos el estado para darle color
          }));
          setEvents(formattedEvents);
        }
      } catch (error) {
        console.error("Error al cargar las clases para el calendario:", error);
      }
    };
    fetchClasses();
  }, []);

  // Función para aplicar colores según el estado de la clase
  const eventStyleGetter = (event) => {
    let backgroundColor = '#007bff'; // Azul para 'programada' (nuestro primario)
    if (event.resource.status === 'completada') backgroundColor = '#28a745'; // Verde
    if (event.resource.status === 'cancelada') backgroundColor = '#dc3545'; // Rojo
    
    return { 
      style: { 
        backgroundColor, 
        color: 'white', 
        borderRadius: '4px', 
        border: 'none',
        opacity: 0.8
      } 
    };
  };

  return (
    // El calendario necesita un contenedor con altura definida para funcionar
    <div style={{ height: '75vh' }}>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        culture="es"
        defaultView="week" // Vista por defecto: Semana
        messages={{
          next: "Siguiente",
          previous: "Anterior",
          today: "Hoy",
          month: "Mes",
          week: "Semana",
          day: "Día"
        }}
        eventPropGetter={eventStyleGetter} // Aplica nuestros estilos de color
      />
    </div>
  );
};

export default CalendarView;