import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout/Layout';
import Login from './pages/Auth/Login';
import Dashboard from './pages/Dashboard/Dashboard';
import Students from './pages/Students/Students';
import Courses from './pages/Courses/Courses';
import Schedule from './pages/Schedule/Schedule';
import Payments from './pages/Payments/Payments';
import Reports from './pages/Reports/Reports';
import Teachers from './pages/Teachers/Teachers';
import Companies from './pages/Companies/Companies';
import './styles/global.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="estudiantes" element={<Students />} />
            <Route path="cursos" element={<Courses />} />
            <Route path="agenda" element={<Schedule />} />
            <Route path="pagos" element={<Payments />} />
            <Route path="reportes" element={<Reports />} />
            <Route path="profesores" element={<Teachers />} />
            <Route path="empresas" element={<Companies />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;