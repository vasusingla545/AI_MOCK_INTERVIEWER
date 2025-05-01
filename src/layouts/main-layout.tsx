import Container from "@/components/container"
import Footer from "@/components/footer"
import Header from "@/components/header"
import { Outlet } from "react-router-dom"


const PublicLayout = () => {
    return (
       <div className="flex flex-col h-screen">
         {/* handler to store the user data (if the user is looged in or logged out like such in Firebase) */}
         
        <Header/>
        <Container>
            <main className="flex-grow">
            <Outlet/>
            </main>
        </Container>
        
        <Footer/>
        
        </div>
        
    )
}

export default PublicLayout