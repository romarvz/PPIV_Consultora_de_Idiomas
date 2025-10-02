import React from 'react'

const Contact = () => {
  return (
    <section className="section">
      <div className="container">
        <h2 className="section-title">Contacto</h2>
        <div className="contact-form">
          <form>
            <div className="form-group">
              <label htmlFor="nombre">Nombre Completo</label>
              <input type="text" id="nombre" name="nombre" required />
            </div>
            <div className="form-group">
              <label htmlFor="email">Correo Electrónico</label>
              <input type="email" id="email" name="email" required />
            </div>
            <div className="form-group">
              <label htmlFor="telefono">Teléfono</label>
              <input type="tel" id="telefono" name="telefono" />
            </div>
            <div className="form-group">
              <label htmlFor="mensaje">Mensaje</label>
              <textarea 
                id="mensaje" 
                name="mensaje" 
                placeholder="Cuéntanos sobre tus objetivos de aprendizaje..." 
                required
              ></textarea>
            </div>
            <button type="submit" className="cta-btn">Enviar Mensaje</button>
          </form>
        </div>
      </div>
    </section>
  )
}

export default Contact