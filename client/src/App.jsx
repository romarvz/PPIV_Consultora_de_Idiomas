import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

// Main layout wrapper that includes header and footer
import Layout from './components/layout/Layout'

// Public pages that visitors can access
import Home from './pages/Home'
import About from './pages/About'
import Services from './pages/Services'
import Clients from './pages/Clients'
import Demo from './pages/Demo'
import Contact from './pages/Contact'
import Login from './pages/Login'

// Protected dashboard pages for different user types
import AdminDashboard from './pages/Dashboard/AdminDashboard'
import StudentDashboard from './pages/Dashboard/StudentDashboard'
import TeacherDashboard from './pages/Dashboard/TeacherDashboard'
import CompanyDashboard from './pages/Dashboard/CompanyDashboard'

// Centralized route paths to avoid typos and make changes easier
import { routes } from './utils/routes'
import './App.css'

function App() {
  return (
    // Router wrapper enables navigation between pages
    <Router>
      <Routes>
        {/* Layout wraps all pages with header/footer */}
        <Route path="/" element={<Layout />}>
          {/* Home page loads when someone visits the root URL */}
          <Route index element={<Home />} />
          
          {/* Public information pages */}
          <Route path={routes.ABOUT} element={<About />} />
          <Route path={routes.SERVICES} element={<Services />} />
          <Route path={routes.CLIENTS} element={<Clients />} />
          <Route path={routes.DEMO} element={<Demo />} />
          <Route path={routes.CONTACT} element={<Contact />} />
          
          {/* Authentication page */}
          <Route path={routes.LOGIN} element={<Login />} />
          
          {/* User dashboards - will need protection later */}
          <Route path={routes.DASHBOARD.ADMIN} element={<AdminDashboard />} />
          <Route path={routes.DASHBOARD.STUDENT} element={<StudentDashboard />} />
          <Route path={routes.DASHBOARD.TEACHER} element={<TeacherDashboard />} />
          <Route path={routes.DASHBOARD.COMPANY} element={<CompanyDashboard />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App