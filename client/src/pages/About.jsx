import React, { useEffect } from 'react'

const About = () => {
  // Make section visible when component mounts
  useEffect(() => {
    const section = document.querySelector('.section')
    if (section) {
      section.classList.add('visible')
    }
  }, [])

  return (
    <section className="section visible">
      <div className="container">
        <h2 className="section-title">Nosotros</h2>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <p style={{ fontSize: '1.1rem', marginBottom: '2rem' }}>
            Somos una consultora de idiomas con más de 20 años de experiencia en la enseñanza de múltiples idiomas. 
            Nuestro equipo está conformado por profesores graduados de las mejores universidades del país que utilizan metodologías modernas 
            para garantizar un aprendizaje efectivo y personalizado.
          </p>
          <p style={{ fontSize: '1.1rem' }}>
            Nos especializamos en cursos de inglés, ofreciendo desde niveles 
            básicos hasta preparación para certificaciones internacionales. La comunicación efectiva es nuestro foco desde el día uno.
          </p>
        </div>
      </div>
    </section>
  )
}

export default About