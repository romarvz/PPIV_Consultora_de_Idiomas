import React, { useState } from 'react'
import { LogIn } from 'lucide-react'
import './Login.css'

const Login = ({ onLogin, onBack }) => {
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Mock authentication - in real app, this would call an API
    const mockUsers = {
      'admin@linguaacademy.com': { name: 'Administrador', role: 'Administrador' },
      'profesor@linguaacademy.com': { name: 'Juan Pérez', role: 'Profesor' },
      'estudiante@linguaacademy.com': { name: 'María García', role: 'Estudiante' },
      'empresa@linguaacademy.com': { name: 'Coordinador Corp', role: 'Coordinador' }
    }

    const user = mockUsers[credentials.email]
    if (user && credentials.password === '123456') {
      onLogin(user)
    } else {
      alert('Usuario o contraseña incorrectos')
    }
  }

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          {onBack && (
            <button onClick={onBack} className="back-button">
              ← Volver
            </button>
          )}
          <h1 className="login-title">Lingua Academy</h1>
          <p className="login-subtitle">Sistema de Gestión de Idiomas</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              name="email"
              value={credentials.email}
              onChange={handleChange}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Contraseña</label>
            <input
              type="password"
              name="password"
              value={credentials.password}
              onChange={handleChange}
              className="form-input"
              required
            />
          </div>

          <button type="submit" className="btn btn-primary login-btn">
            <LogIn size={16} />
            Iniciar Sesión
          </button>
        </form>

        <div className="login-demo">
          <p className="demo-title">Usuarios de prueba:</p>
          <div className="demo-users">
            <div>Admin: admin@linguaacademy.com</div>
            <div>Profesor: profesor@linguaacademy.com</div>
            <div>Estudiante: estudiante@linguaacademy.com</div>
            <div>Empresa: empresa@linguaacademy.com</div>
            <div>Contraseña: 123456</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login