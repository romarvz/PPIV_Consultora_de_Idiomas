// Custom hook for authentication management
import { useState, useEffect, useContext, createContext } from 'react'
import { authAPI, authUtils } from '../services/api'

// Create authentication context
const AuthContext = createContext()

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Check if user is authenticated on app start
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log('🔧 Initializing auth...')
        if (authUtils.isAuthenticated()) {
          console.log('🔑 Token found, verifying...')
          // Verify token is still valid
          await authAPI.verifyToken()
          const userData = authUtils.getCurrentUser()
          console.log('✅ User data loaded:', userData)
          setUser(userData)
        } else {
          console.log('❌ No token found')
        }
      } catch (error) {
        console.error('Token verification failed:', error)
        authUtils.clearAuth()
        setUser(null)
      } finally {
        console.log('🏁 Auth initialization complete')
        setLoading(false)
      }
    }

    initializeAuth()
  }, [])

  // Login function
  const login = async (email, password) => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await authAPI.login(email, password)
      setUser(response.user)
      
      return response
    } catch (error) {
      setError(error.message || 'Error al iniciar sesión')
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Logout function
  const logout = async () => {
    try {
      setLoading(true)
      await authAPI.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setUser(null)
      setLoading(false)
    }
  }

  // Update user profile
  const updateProfile = async () => {
    try {
      const response = await authAPI.getProfile()
      setUser(response.user)
      
      // Update localStorage
      localStorage.setItem('user', JSON.stringify(response.user))
      
      return response
    } catch (error) {
      setError(error.message || 'Error al actualizar perfil')
      throw error
    }
  }

  // Force password change
  const changePasswordForced = async (newPassword) => {
    try {
      setError(null)
      const response = await authAPI.changePasswordForced(newPassword)
      
      // Update user state to reflect password change
      const updatedUser = { ...user, mustChangePassword: false }
      setUser(updatedUser)
      
      return response
    } catch (error) {
      setError(error.message || 'Error al cambiar contraseña')
      throw error
    }
  }

  // Check if user has specific role
  const hasRole = (role) => {
    return user?.role === role
  }

  // Check if user is student
  const isStudent = () => hasRole('estudiante')
  
  // Check if user is teacher
  const isTeacher = () => hasRole('profesor')
  
  // Check if user is admin
  const isAdmin = () => hasRole('admin')

  // Get redirect path based on user role
  const getRedirectPath = () => {
    console.log('🎯 getRedirectPath called - user:', user)
    console.log('🎭 User role:', user?.role)
    
    if (!user) return '/login'
    
    switch (user.role) {
      case 'admin':
        return '/dashboard/admin'
      case 'profesor':
        return '/dashboard/teacher'
      case 'estudiante':
        return '/dashboard/student'
      default:
        console.log('⚠️ Unknown role, defaulting to student dashboard')
        return '/dashboard/student'
    }
  }

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    updateProfile,
    changePasswordForced,
    hasRole,
    isStudent,
    isTeacher,
    isAdmin,
    getRedirectPath,
    isAuthenticated: !!user,
    mustChangePassword: user?.mustChangePassword || false
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// Hook for login form management
export const useLoginForm = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { login } = useAuth()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (isSubmitting) return
    
    try {
      setIsSubmitting(true)
      await login(formData.email, formData.password)
      // Navigation will be handled by the component using this hook
    } catch (error) {
      // Error will be available in auth context
      console.error('Login failed:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormData({
      email: '',
      password: ''
    })
  }

  return {
    formData,
    isSubmitting,
    handleChange,
    handleSubmit,
    resetForm
  }
}