import React from 'react'

const Services = () => {
  return (
    <section className="section">
      <div className="container">
        <h2 className="section-title">Servicios</h2>
        <div className="services-grid">
          <div className="service-card">
            <h3>Clases Individuales</h3>
            <p>Atención personalizada con horarios flexibles adaptados a tus necesidades específicas.</p>
          </div>
          <div className="service-card">
            <h3>Clases Grupales</h3>
            <p>Aprende en grupos reducidos con metodología interactiva y ambiente colaborativo.</p>
          </div>
          <div className="service-card">
            <h3>Cursos Corporativos</h3>
            <p>Programas especializados para empresas con enfoque en comunicación profesional.</p>
          </div>
          <div className="service-card">
            <h3>Preparación Certificaciones</h3>
            <p>Cursos de preparación para FCE, CAE, CPE, TOEFL, TOEIC, y otras certificaciones internacionales.</p>
          </div>
          <div className="service-card">
            <h3>Modalidad Online</h3>
            <p>Clases virtuales con plataforma interactiva propia y recursos multimedia avanzados.</p>
          </div>
          <div className="service-card">
            <h3>Inmersión Cultural</h3>
            <p>Programas que combinan idioma con cultura para una experiencia de aprendizaje integral.</p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Services