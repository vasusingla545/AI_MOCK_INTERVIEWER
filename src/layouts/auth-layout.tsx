
import { Outlet } from 'react-router-dom'

const AuthenticationLayout = () => {
  return (
    <div className="w-screen h-screen overflow-hidden flex items-center justify-center relative">
    {/* handler to store the user data (if the user is looged in or logged out like such in Firebase) */}
    <img src="/assets/img/bg.png" className="absolute w-full h-full object-cover opacity-20" alt=""/>
   <Outlet/>
   </div>
  )
}

export default AuthenticationLayout