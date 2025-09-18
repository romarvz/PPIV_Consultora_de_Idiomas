import React, { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout/Layout'
import Login from './components/Auth/Login'
import LandingPage from './components/Landing/LandingPage'
import Dashboard from './components/Dashboard/Dashboard'
import StudentManagement from './components/Students/StudentManagement'
import CourseManagement from './components/Courses/CourseManagement'
import ClassScheduling from './components/Classes/ClassScheduling'
import CompanyManagement from './components/Companies/CompanyManagement'
import TeacherManagement from './components/Teachers/TeacherManagement'
import PaymentManagement from './components/Payments/PaymentManagement'
import Reports from './components/Reports/Reports'
import './App.css'

function App() {
  const [user, setUser] = useState(null)
  const [showLogin, setShowLogin] = useState(false)

  const handleLogin = (userData) => {
    setUser(userData)
    setShowLogin(false)
  }

  const handleLogout = () => {
    setUser(null)
    setShowLogin(false)
  }

  const handleShowLogin = () => {
    setShowLogin(true)
  }

  if (showLogin && !user) {
    return <Login onLogin={handleLogin} onBack={() => setShowLogin(false)} />
  }

  if (!user) {
    return <LandingPage onLogin={handleShowLogin} />
  }

  return (
    <Router>
      <Layout user={user} onLogout={handleLogout}>
        <Routes>
          <Route path="/" element={<Dashboard user={user} />} />
          <Route path="/students" element={<StudentManagement />} />
          <Route path="/courses" element={<CourseManagement />} />
          <Route path="/classes" element={<ClassScheduling />} />
          <Route path="/companies" element={<CompanyManagement />} />
          <Route path="/teachers" element={<TeacherManagement />} />
          <Route path="/payments" element={<PaymentManagement />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App