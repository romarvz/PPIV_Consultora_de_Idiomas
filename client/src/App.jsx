import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'


// Authentication provider and protected route component
import { AuthProvider } from './hooks/useAuth.jsx'
import ProtectedRoute from './components/common/ProtectedRoute'

// Main layout wrapper that includes header and footer
import Layout from './components/layout/Layout'

// Public pages that visitors can access
import Home from './pages/Home'
import About from './pages/About'
import Services from './pages/Services'
import CoursesPage from './pages/CoursesPage'; 
import Clients from './pages/Clients'
import Demo from './pages/Demo'
import Contact from './pages/Contact'
import Login from './pages/Login'

// Protected dashboard pages for different user types
import AdminDashboard from './pages/Dashboard/AdminDashboard'
import StudentDashboard from './pages/Dashboard/StudentDashboard'
import TeacherDashboard from './pages/Dashboard/TeacherDashboard'
import CourseAcademicSheet from './pages/Dashboard/CourseAcademicSheet'
import CompanyDashboard from './pages/Dashboard/CompanyDashboard'
import FinancialDashboard from './pages/Dashboard/FinancialDashboard'

// Centralized route paths to avoid typos and make changes easier
import { routes } from './utils/routes'
import './App.css'

function App() {
  return (
    // Auth provider wraps entire app to provide authentication context
    <AuthProvider>
      {/* Router wrapper enables navigation between pages */}
      <Router>
        <Routes>
          {/* Layout wraps public pages with header/footer */}
          <Route path="/" element={<Layout />}>
            {/* Home page loads when someone visits the root URL */}
            <Route index element={<Home />} />
            
            {/* Public information pages */}
            <Route path={routes.ABOUT} element={<About />} />
            <Route path={routes.SERVICES} element={<Services />} />
            <Route path={routes.COURSES} element={<CoursesPage />} />
            <Route path={routes.CLIENTS} element={<Clients />} />
            <Route path={routes.DEMO} element={<Demo />} />
            <Route path={routes.CONTACT} element={<Contact />} />
            
            {/* Authentication page */}
            <Route path={routes.LOGIN} element={<Login />} />
            

          {/* End of public routes */}  
          </Route>
          
          {/* Protected dashboard pages WITHOUT layout (no header/footer) */}
          <Route 
            path={routes.DASHBOARD.ADMIN} 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path={routes.DASHBOARD.STUDENT} 
            element={
              <ProtectedRoute allowedRoles={['estudiante']}>
                <StudentDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path={routes.DASHBOARD.TEACHER} 
            element={
              <ProtectedRoute allowedRoles={['profesor']}>
                <TeacherDashboard />
              </ProtectedRoute>
            } 
          />
          <Route
            path="/dashboard/teacher/curso/:courseId/planilla"
            element={
              <ProtectedRoute allowedRoles={['profesor']}>
                <CourseAcademicSheet />
              </ProtectedRoute>
            }
          />
          <Route 
            path={routes.DASHBOARD.COMPANY} 
            element={
              <ProtectedRoute allowedRoles={['admin', 'empresa']}>
                <CompanyDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path={routes.DASHBOARD.FINANCIAL} 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <FinancialDashboard />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App