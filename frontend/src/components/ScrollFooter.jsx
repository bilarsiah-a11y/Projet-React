import React, { useState, useEffect } from 'react'
import Footer from './Footer'
import './ScrollFooter.css'

const ScrollFooter = () => {
  const [showFooter, setShowFooter] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY
      const threshold = 200 

      if (scrollPosition > threshold) setShowFooter(true)
      else setShowFooter(false)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className={`scroll-footer ${showFooter ? 'visible' : ''}`}>
      <Footer />
    </div>
  )
}

export default ScrollFooter
