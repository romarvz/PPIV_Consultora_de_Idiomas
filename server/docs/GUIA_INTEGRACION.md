# Guía de Integración Frontend-Backend

## Índice
1. [Configuración Inicial](#configuración-inicial)
2. [Cliente HTTP con Axios](#cliente-http-con-axios)
3. [Autenticación y Tokens](#autenticación-y-tokens)
4. [Servicios API](#servicios-api)
5. [Manejo de Errores](#manejo-de-errores)
6. [Ejemplos de Integración](#ejemplos-de-integración)
7. [Sistema Mock](#sistema-mock)
8. [Buenas Prácticas](#buenas-prácticas)

---

## Configuración Inicial

### Variables de Entorno Frontend

Crear archivo `.env` en `/client/`:

```env
VITE_API_URL=http://localhost:5000/api
VITE_NODE_ENV=development
```

### Instalación de Dependencias

```bash
cd client
npm install axios
```

### Configuración de Axios

**Archivo:** `client/src/services/api.js`

```javascript
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para agregar token automáticamente
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para manejar respuestas
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

---

## Cliente HTTP con Axios

### Estructura de Servicios

```
client/src/services/
├── api.js              # Configuración base de Axios
├── authService.js      # Servicios de autenticación
├── userService.js      # Servicios de usuarios
├── horarioService.js   # Servicios de horarios
├── claseService.js     # Servicios de clases
└── apiAdapter.js       # Adaptador mock/real
```

### authService.js

```javascript
import api from './api';

const authService = {
  // Login
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.success) {
      const { token, user } = response.data.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
    }
    return response.data;
  },

  // Logout
  logout: async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },

  // Verificar token
  verifyToken: async () => {
    const response = await api.get('/auth/verify-token');
    return response.data;
  },

  // Obtener usuario actual
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Verificar si está autenticado
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  // Cambiar contraseña
  changePassword: async (currentPassword, newPassword) => {
    const response = await api.put('/auth/change-password', {
      currentPassword,
      newPassword
    });
    return response.data;
  }
};

export default authService;
```

### userService.js

```javascript
import api from './api';

const userService = {
  // Obtener perfil
  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  // Actualizar perfil
  updateProfile: async (data) => {
    const response = await api.put('/auth/profile', data);
    return response.data;
  },

  // Listar estudiantes
  getStudents: async () => {
    const response = await api.get('/auth/students');
    return response.data;
  },

  // Listar profesores
  getProfessors: async (especialidad = null) => {
    const url = especialidad 
      ? `/auth/professors?especialidad=${especialidad}`
      : '/auth/professors';
    const response = await api.get(url);
    return response.data;
  },

  // Registrar estudiante (admin)
  registerStudent: async (data) => {
    const response = await api.post('/auth/register/estudiante-admin', data);
    return response.data;
  },

  // Registrar profesor (admin)
  registerProfessor: async (data) => {
    const response = await api.post('/auth/register/profesor', data);
    return response.data;
  },

  // Desactivar usuario (admin)
  deactivateUser: async (userId) => {
    const response = await api.put(`/auth/deactivate/${userId}`);
    return response.data;
  },

  // Reactivar usuario (admin)
  reactivateUser: async (userId) => {
    const response = await api.put(`/auth/reactivate/${userId}`);
    return response.data;
  },

  // Eliminar usuario (admin)
  deleteUser: async (userId) => {
    const response = await api.delete(`/auth/delete/${userId}`);
    return response.data;
  }
};

export default userService;
```

### horarioService.js

```javascript
import api from './api';

const horarioService = {
  // Listar horarios
  getAll: async (filtros = {}) => {
    const response = await api.get('/horarios', { params: filtros });
    return response.data;
  },

  // Obtener horario por ID
  getById: async (id) => {
    const response = await api.get(`/horarios/${id}`);
    return response.data;
  },

  // Crear horario
  create: async (data) => {
    const response = await api.post('/horarios', data);
    return response.data;
  },

  // Actualizar horario
  update: async (id, data) => {
    const response = await api.put(`/horarios/${id}`, data);
    return response.data;
  },

  // Eliminar horario
  delete: async (id) => {
    const response = await api.delete(`/horarios/${id}`);
    return response.data;
  },

  // Asignar a profesor
  assignToProfesor: async (horarioId, profesorId) => {
    const response = await api.post('/horarios/asignar-profesor', {
      horarioId,
      profesorId
    });
    return response.data;
  },

  // Verificar disponibilidad
  checkAvailability: async (dia, horaInicio, horaFin) => {
    const response = await api.get('/horarios/disponibilidad', {
      params: { dia, horaInicio, horaFin }
    });
    return response.data;
  }
};

export default horarioService;
```

---

## Autenticación y Tokens

### Hook Personalizado useAuth

**Archivo:** `client/src/hooks/useAuth.js`

```javascript
import { useState, useEffect, createContext, useContext } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (authService.isAuthenticated()) {
          const response = await authService.verifyToken();
          if (response.success) {
            setUser(authService.getCurrentUser());
          }
        }
      } catch (error) {
        console.error('Error verificando token:', error);
        authService.logout();
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const response = await authService.login(email, password);
    if (response.success) {
      setUser(response.data.user);
    }
    return response;
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isProfesor: user?.role === 'profesor',
    isEstudiante: user?.role === 'estudiante'
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};
```

### Rutas Protegidas

**Archivo:** `client/src/components/ProtectedRoute.jsx`

```javascript
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Cargando...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;
```

### Uso en App.jsx

```javascript
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AdminPanel from './pages/AdminPanel';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/admin" element={
            <ProtectedRoute requiredRole="admin">
              <AdminPanel />
            </ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
```

---

## Manejo de Errores

### Hook useApi

**Archivo:** `client/src/hooks/useApi.js`

```javascript
import { useState } from 'react';

const useApi = (apiFunc) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = async (...args) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiFunc(...args);
      setData(response.data);
      return response;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message;
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setData(null);
    setError(null);
    setLoading(false);
  };

  return { data, loading, error, execute, reset };
};

export default useApi;
```

### Uso del Hook

```javascript
import { useEffect } from 'react';
import useApi from '../hooks/useApi';
import userService from '../services/userService';

function StudentList() {
  const { data, loading, error, execute } = useApi(userService.getStudents);

  useEffect(() => {
    execute();
  }, []);

  if (loading) return <div>Cargando estudiantes...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!data) return null;

  return (
    <div>
      <h2>Estudiantes</h2>
      <ul>
        {data.students.map(student => (
          <li key={student._id}>{student.fullName}</li>
        ))}
      </ul>
    </div>
  );
}
```

---

## Ejemplos de Integración

### Componente Login

```javascript
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await login(email, password);
      if (response.success) {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Iniciar Sesión</h2>
      
      {error && <div className="error">{error}</div>}
      
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      
      <input
        type="password"
        placeholder="Contraseña"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      
      <button type="submit" disabled={loading}>
        {loading ? 'Cargando...' : 'Ingresar'}
      </button>
    </form>
  );
}

export default Login;
```

### Componente Registro de Estudiante

```javascript
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import userService from '../services/userService';

const schema = yup.object({
  email: yup.string().email('Email inválido').required('Email requerido'),
  firstName: yup.string().required('Nombre requerido'),
  lastName: yup.string().required('Apellido requerido'),
  dni: yup.string().matches(/^\d{7,8}$/, 'DNI debe tener 7-8 dígitos').required(),
  nivel: yup.string().oneOf(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']).required(),
  phone: yup.string()
});

function RegisterStudent() {
  const [message, setMessage] = useState('');
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: yupResolver(schema)
  });

  const onSubmit = async (data) => {
    try {
      const response = await userService.registerStudent({
        ...data,
        role: 'estudiante'
      });
      
      if (response.success) {
        setMessage('Estudiante registrado exitosamente');
        reset();
      }
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error al registrar');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <h2>Registrar Estudiante</h2>
      
      {message && <div className="message">{message}</div>}
      
      <input {...register('email')} placeholder="Email" />
      {errors.email && <span>{errors.email.message}</span>}
      
      <input {...register('firstName')} placeholder="Nombre" />
      {errors.firstName && <span>{errors.firstName.message}</span>}
      
      <input {...register('lastName')} placeholder="Apellido" />
      {errors.lastName && <span>{errors.lastName.message}</span>}
      
      <input {...register('dni')} placeholder="DNI" />
      {errors.dni && <span>{errors.dni.message}</span>}
      
      <select {...register('nivel')}>
        <option value="">Seleccionar nivel</option>
        <option value="A1">A1</option>
        <option value="A2">A2</option>
        <option value="B1">B1</option>
        <option value="B2">B2</option>
        <option value="C1">C1</option>
        <option value="C2">C2</option>
      </select>
      {errors.nivel && <span>{errors.nivel.message}</span>}
      
      <input {...register('phone')} placeholder="Teléfono (opcional)" />
      
      <button type="submit">Registrar</button>
    </form>
  );
}

export default RegisterStudent;
```

### Componente Lista de Profesores

```javascript
import { useState, useEffect } from 'react';
import userService from '../services/userService';

function ProfessorList() {
  const [professors, setProfessors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('');

  useEffect(() => {
    fetchProfessors();
  }, [filter]);

  const fetchProfessors = async () => {
    try {
      setLoading(true);
      const response = await userService.getProfessors(filter || null);
      if (response.success) {
        setProfessors(response.data.professors);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar profesores');
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivate = async (id) => {
    if (!confirm('¿Desactivar este profesor?')) return;
    
    try {
      await userService.deactivateUser(id);
      fetchProfessors();
    } catch (err) {
      alert('Error al desactivar profesor');
    }
  };

  if (loading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Profesores</h2>
      
      <select value={filter} onChange={(e) => setFilter(e.target.value)}>
        <option value="">Todas las especialidades</option>
        <option value="ingles">Inglés</option>
        <option value="frances">Francés</option>
        <option value="aleman">Alemán</option>
      </select>
      
      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Email</th>
            <th>Tarifa/Hora</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {professors.map(prof => (
            <tr key={prof._id}>
              <td>{prof.fullName}</td>
              <td>{prof.email}</td>
              <td>${prof.tarifaPorHora}</td>
              <td>{prof.isActive ? 'Activo' : 'Inactivo'}</td>
              <td>
                {prof.isActive && (
                  <button onClick={() => handleDeactivate(prof._id)}>
                    Desactivar
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ProfessorList;
```

---

## Sistema Mock

### Configuración del Adaptador

**Archivo:** `client/src/services/apiAdapter.js`

```javascript
import mockApi from './mockApi';
import authService from './authService';
import userService from './userService';
import horarioService from './horarioService';

const USE_MOCK = false; // Cambiar a true para usar mock

const apiAdapter = {
  auth: USE_MOCK ? mockApi.auth : authService,
  users: USE_MOCK ? mockApi.users : userService,
  horarios: USE_MOCK ? mockApi.horarios : horarioService,
  
  utils: {
    isUsingMock: () => USE_MOCK,
    resetMockData: () => USE_MOCK && mockApi.reset(),
    getStorageState: () => USE_MOCK && mockApi.getState()
  }
};

export default apiAdapter;
```

### Uso del Adaptador

```javascript
import apiAdapter from '../services/apiAdapter';

function MyComponent() {
  useEffect(() => {
    const fetchData = async () => {
      // Funciona con mock o backend real
      const response = await apiAdapter.users.getStudents();
      console.log(response.data);
    };
    
    fetchData();
  }, []);
}
```

---

## Buenas Prácticas

### 1. Manejo de Tokens

```javascript
// ✅ CORRECTO: Token en interceptor
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ❌ INCORRECTO: Token manual en cada request
api.get('/profile', {
  headers: { Authorization: `Bearer ${token}` }
});
```

### 2. Manejo de Errores

```javascript
// ✅ CORRECTO: Try-catch con mensajes específicos
try {
  const response = await userService.getProfile();
  setUser(response.data.user);
} catch (error) {
  const message = error.response?.data?.message || 'Error desconocido';
  setError(message);
}

// ❌ INCORRECTO: Sin manejo de errores
const response = await userService.getProfile();
setUser(response.data.user);
```

### 3. Estados de Carga

```javascript
// ✅ CORRECTO: Loading states
const [loading, setLoading] = useState(false);

const fetchData = async () => {
  setLoading(true);
  try {
    const response = await api.get('/data');
    setData(response.data);
  } finally {
    setLoading(false);
  }
};

if (loading) return <Spinner />;
```

### 4. Validación de Formularios

```javascript
// ✅ CORRECTO: Validación con yup + react-hook-form
const schema = yup.object({
  email: yup.string().email().required(),
  password: yup.string().min(6).required()
});

const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: yupResolver(schema)
});
```

### 5. Limpieza de Efectos

```javascript
// ✅ CORRECTO: Cleanup en useEffect
useEffect(() => {
  let cancelled = false;
  
  const fetchData = async () => {
    const response = await api.get('/data');
    if (!cancelled) {
      setData(response.data);
    }
  };
  
  fetchData();
  
  return () => {
    cancelled = true;
  };
}, []);
```

### 6. Separación de Responsabilidades

```javascript
// ✅ CORRECTO: Servicios separados
// authService.js - Solo autenticación
// userService.js - Solo usuarios
// horarioService.js - Solo horarios

// ❌ INCORRECTO: Todo en un archivo
// api.js con 500 líneas de código
```

### 7. Constantes Compartidas

```javascript
// ✅ CORRECTO: Constantes centralizadas
// constants.js
export const ROLES = {
  ADMIN: 'admin',
  PROFESOR: 'profesor',
  ESTUDIANTE: 'estudiante'
};

export const NIVELES = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

// Uso
import { ROLES, NIVELES } from './constants';
```

### 8. Respuestas Consistentes

```javascript
// ✅ CORRECTO: Verificar success antes de usar data
const response = await api.get('/data');
if (response.data.success) {
  setData(response.data.data);
} else {
  setError(response.data.message);
}
```

---

## Checklist de Integración

### Configuración Inicial
- [ ] Variables de entorno configuradas
- [ ] Axios instalado y configurado
- [ ] Interceptores implementados
- [ ] Base URL correcta

### Autenticación
- [ ] AuthContext y AuthProvider creados
- [ ] Hook useAuth implementado
- [ ] Login funcional
- [ ] Logout funcional
- [ ] Rutas protegidas configuradas
- [ ] Redirección en 401

### Servicios
- [ ] authService completo
- [ ] userService completo
- [ ] Otros servicios según necesidad
- [ ] Manejo de errores en todos los servicios

### Componentes
- [ ] Login component
- [ ] Dashboard component
- [ ] Formularios con validación
- [ ] Listas con loading states
- [ ] Manejo de errores en UI

### Testing
- [ ] Login con credenciales válidas
- [ ] Login con credenciales inválidas
- [ ] Acceso a rutas protegidas
- [ ] Refresh de página mantiene sesión
- [ ] Logout limpia datos
- [ ] Formularios validan correctamente

---

**Documentación actualizada:** Enero 2025  
**Versión:** 1.0.0  
**Estado:** Guía completa para integración frontend-backend
