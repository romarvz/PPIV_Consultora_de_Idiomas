import React, { useState, useEffect } from 'react'

// Login page for user authentication
const Login = () => {
  // Form data state to track email and password inputs
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

  // Make section visible when component mounts
  useEffect(() => {
    const section = document.querySelector('.section')
    if (section) {
      section.classList.add('visible')
    }
  }, [])

  // Update form data when user types in input fields
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  // Handle form submission when user clicks login button
  const handleSubmit = (e) => {
    e.preventDefault()
    // TODO: Connect this to the backend authentication system
    console.log('Login attempt:', formData)
  }

  return (
    <section className="section visible">
      <div className="container">
        <div style={{ maxWidth: '400px', margin: '0 auto' }}>
          <h2 className="section-title">Iniciar Sesión</h2>
          
          {/* Login form */}
          <div className="contact-form">
            <form onSubmit={handleSubmit}>
              {/* Email input field */}
              <div className="form-group">
                <label htmlFor="email">Correo Electrónico</label>
                <input 
                  type="email" 
                  id="email" 
                  name="email" 
                  value={formData.email}
                  onChange={handleChange}
                  required 
                />
              </div>
              
              {/* Password input field */}
              <div className="form-group">
                <label htmlFor="password">Contraseña</label>
                <input 
                  type="password" 
                  id="password" 
                  name="password" 
                  value={formData.password}
                  onChange={handleChange}
                  required 
                />
              </div>
              
              {/* Submit button */}
              <button type="submit" className="cta-btn">Ingresar</button>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Login