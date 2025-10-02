// Component to protect routes that require authentication
import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.jsx'

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, user, loading } = useAuth()
  const location = useLocation()

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '50vh',
        fontSize: '18px'
      }}>
        Cargando...
      </div>
    )
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Check if user has required role
  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    // Redirect to appropriate dashboard based on user role
    const redirectPath = getDashboardForRole(user?.role)
    return <Navigate to={redirectPath} replace />
  }

  return children
}

// Helper function to get dashboard path for user role
const getDashboardForRole = (role) => {
  switch (role) {
    case 'admin':
      return '/dashboard/admin'
    case 'profesor':
      return '/dashboard/teacher'
    case 'estudiante':
      return '/dashboard/student'
    default:
      return '/dashboard/student'
  }
}

export default ProtectedRoute