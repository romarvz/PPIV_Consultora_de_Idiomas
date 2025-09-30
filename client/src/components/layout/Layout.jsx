import React from 'react'
import { Outlet } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import ScrollButtons from '../common/ScrollButtons'
import WhatsAppButton from '../common/WhatsAppButton'
import { useTheme } from '../../hooks/useTheme'

// Main layout that wraps every page with header, footer, and floating buttons
const Layout = () => {
  const { theme, toggleTheme } = useTheme()

  return (
    <div className="App">
      {/* Navigation bar at the top */}
      <Header theme={theme} toggleTheme={toggleTheme} />
      
      {/* This is where individual pages get rendered */}
      <main className="main">
        <Outlet />
      </main>
      
      {/* Footer at the bottom */}
      <Footer />
      
      {/* Floating buttons that appear on all pages */}
      <ScrollButtons />
      <WhatsAppButton />
    </div>
  )
}

export default Layout