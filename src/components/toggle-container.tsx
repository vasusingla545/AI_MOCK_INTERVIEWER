import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
  } from "@/components/ui/sheet"
import { Menu } from "lucide-react"
import NavigationRoutes from "./navigation-routes"
import { NavLink } from "react-router-dom"
import { cn } from "@/lib/utils"
import { useAuth } from "@clerk/clerk-react"
  
const ToggleContainer = () => {
  const {userId}=useAuth();
  return (
    <Sheet>
  <SheetTrigger className="block md:hidden">
    <Menu/>
  </SheetTrigger>
  <SheetContent>
    <SheetHeader>
      <SheetTitle></SheetTitle>
    <nav className=" gap-6 flex flex-xol items-start">
   
<NavigationRoutes isMobile/>
{userId && (
  <NavLink
   to={"/generate"} className={({isActive})=>
   cn("text-base text-neutral-600" , isActive && "text-neutral-900 font-semibold")}>
 Take an Interview
</NavLink>
)}
</nav>
    
    </SheetHeader>
  </SheetContent>
</Sheet>

  )
}

export default ToggleContainer