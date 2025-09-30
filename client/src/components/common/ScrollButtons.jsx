import React, { useState, useEffect } from 'react'

// Reusable scroll buttons that appear on all pages
const ScrollButtons = () => {
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [showScrollBottom, setShowScrollBottom] = useState(true)

  // Monitor scroll position to show/hide buttons
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY
      const windowHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight
      
      setShowScrollTop(scrollTop > 300)
      setShowScrollBottom(scrollTop < documentHeight - windowHeight - 300)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Scroll to top of page
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Scroll to bottom of page
  const scrollToBottom = () => {
    window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' })
  }

  return (
    <>
      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button className="scroll-top-btn" onClick={scrollToTop}>
          ↑
        </button>
      )}

      {/* Scroll to Bottom Button */}
      {showScrollBottom && (
        <button className="scroll-bottom-btn" onClick={scrollToBottom}>
          ↓
        </button>
      )}
    </>
  )
}

export default ScrollButtons