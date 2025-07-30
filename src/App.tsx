// import React from 'react'
// import { Button } from './components/ui/button'
// import { DESTRUCTION } from 'dns'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import PublicLayout from '@/layouts/public-layout'
import HomePage from '@/routes/home'
import AuthenticationLayout from './layouts/auth-layout'
// import SignIn from './routes/sign-in';
// import SignUp from './routes/sign-up';
import SignInPage from './routes/sign-in';
import SignUpPage from './routes/sign-up';
import ProtectedRoutes from './layouts/protected-routes';
import MainLayout from './layouts/main-layout';
import { Generate } from './components/generate';
import { Dashboard } from './routes/dashboard';
import { CreateEditPage } from './routes/create-edit-page';
const App = () => {
  return (
    
    <Router>
      <Routes>
        {/* Public Routes */}
      <Route element={<PublicLayout/>}>
      <Route index element={<HomePage/>}/>
      </Route>
     
      
      
      
     
{/* authentication layout */}
<Route element ={<AuthenticationLayout/>}>
<Route path="/signin/*" element ={<SignInPage/>}/>
<Route path="/signup/*" element ={<SignUpPage/>}/>

</Route>
        {/* Protected Routes */}
        <Route element={<ProtectedRoutes>
          <MainLayout/>
        </ProtectedRoutes>}>
        <Route element={<Generate />} path="/generate">
        <Route index element={<Dashboard />} />
        <Route path=":interviewId" element={<CreateEditPage />} />
        </Route>
        // </Route>
      </Routes>
    </Router>
  );
};

export default App