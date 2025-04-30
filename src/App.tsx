// import React from 'react'
// import { Button } from './components/ui/button'
// import { DESTRUCTION } from 'dns'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import PublicLayout from '@/layouts/public-layout'
import HomePage from '@/routes/home'
const App = () => {
  return (
    
    <Router>
      <Routes>
        {/* Public Routes */}
      <Route element={<PublicLayout/>}>
      <Route index element={<HomePage/>}>
      {/* <Route element={<PublicLayout/>}> */}
      
      
      </Route>
      </Route>


        {/* Protected Routes */}
      </Routes>
    </Router>
  )
}

export default App