// API service for backend communication
import axios from 'axios'

// Base URL for all API requests
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// Create axios instance with default configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
})

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Handle response errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      // Only redirect if not already on login page
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

// Authentication endpoints
export const authAPI = {
  // Login user
  login: async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password })
      const { token, user } = response.data.data
      
      // Store token and user data
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
      
      return response.data.data
    } catch (error) {
      throw error.response?.data || { message: 'Error de conexión' }
    }
  },

  // Logout user
  logout: async () => {
    try {
      await api.post('/auth/logout')
    } catch (error) {
      console.warn('Logout error:', error)
    } finally {
      // Clear local storage regardless of API response
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
  },

  // Get current user profile
  getProfile: async () => {
    try {
      const response = await api.get('/auth/profile')
      return response.data.data
    } catch (error) {
      throw error.response?.data || { message: 'Error al obtener perfil' }
    }
  },

  // Verify token is still valid
  verifyToken: async () => {
    try {
      const response = await api.get('/auth/verify-token')
      return response.data.data
    } catch (error) {
      throw error.response?.data || { message: 'Token inválido' }
    }
  },

  // Change password (normal)
  changePassword: async (currentPassword, newPassword) => {
    try {
      const response = await api.put('/auth/change-password', {
        currentPassword,
        newPassword
      })
      return response.data.data
    } catch (error) {
      throw error.response?.data || { message: 'Error al cambiar contraseña' }
    }
  },

  // Forced password change (first login)
  changePasswordForced: async (newPassword) => {
    try {
      const response = await api.put('/auth/change-password-forced', {
        newPassword
      })
      
      // Update user data in localStorage
      const updatedUser = { ...authUtils.getCurrentUser(), mustChangePassword: false }
      localStorage.setItem('user', JSON.stringify(updatedUser))
      
      return response.data.data
    } catch (error) {
      throw error.response?.data || { message: 'Error al cambiar contraseña' }
    }
  }
}

// Utility functions
export const authUtils = {
  // Check if user is logged in
  isAuthenticated: () => {
    const token = localStorage.getItem('token')
    const user = localStorage.getItem('user')
    return !!(token && user)
  },

  // Get current user data
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user')
    try {
      return userStr ? JSON.parse(userStr) : null
    } catch (error) {
      console.error('Error parsing user data:', error)
      return null
    }
  },

  // Get user role
  getUserRole: () => {
    const user = authUtils.getCurrentUser()
    return user?.role || null
  },

  // Check if user has specific role
  hasRole: (role) => {
    const userRole = authUtils.getUserRole()
    return userRole === role
  },

  // Clear authentication data
  clearAuth: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }
}

export default api