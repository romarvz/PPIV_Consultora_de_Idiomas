import { useState, useEffect } from 'react'

// Custom hook to manage light/dark theme switching
export const useTheme = () => {
  const [theme, setTheme] = useState('light')

  // Apply theme to the entire document when it changes
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  // Switch between light and dark themes
  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light')
  }

  return { theme, toggleTheme }
}