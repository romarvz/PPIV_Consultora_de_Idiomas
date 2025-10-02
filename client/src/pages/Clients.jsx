import React from 'react'

const Clients = () => {
  return (
    <section className="section">
      <div className="container">
        <h2 className="section-title">Nuestros Clientes</h2>
        <div className="clients-grid">
          <div className="client-card">
            <h4>Empresas Multinacionales</h4>
            <p>Capacitación en idiomas para equipos internacionales</p>
          </div>
          <div className="client-card">
            <h4>Estudiantes Universitarios</h4>
            <p>Preparación para intercambios y certificaciones</p>
          </div>
          <div className="client-card">
            <h4>Profesionales</h4>
            <p>Desarrollo de habilidades lingüísticas para crecimiento profesional</p>
          </div>
          <div className="client-card">
            <h4>Instituciones Educativas</h4>
            <p>Programas complementarios para colegios y universidades</p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Clients