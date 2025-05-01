import Footer from "@/components/footer"
import Header from "@/components/header"
import { Outlet } from "react-router-dom"


const PublicLayout = () => {
    return (
       <div>
         {/* handler to store the user data (if the user is looged in or logged out like such in Firebase) */}
        <Header/>
        <Outlet/>
        <Footer/>
        </div>
        
    )
}

export default PublicLayout