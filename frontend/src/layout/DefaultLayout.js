import React from 'react'
import { AppContent, AppFooter, AppHeader } from '../components/layout/index'

// Create a functional component named 'DefaultLayout'.
const DefaultLayout = () => {
  // Render the layout structure.
  return (
    <div>
      <div className="wrapper d-flex flex-column min-vh-100 bg-light">
        <AppHeader />
        <div className="body flex-grow-1">
          <AppContent />
        </div>
        <AppFooter />
      </div>
    </div>
  )
}

export default DefaultLayout
