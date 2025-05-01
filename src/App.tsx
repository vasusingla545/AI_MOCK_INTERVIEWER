import React from 'react'
import { Button } from './components/ui/button'
import { DESTRUCTION } from 'dns'

const App = () => {
  return (
    <div className='text-blue-500'><Button variant={"destructive"} size={"icon"}>Click here</Button></div>
  )
}

export default App