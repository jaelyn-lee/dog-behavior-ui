import { Route, Routes } from 'react-router-dom'
import Login from './pages/Login'
import { RequestPage } from './pages/RequestPage'
import { RegisterDog } from './pages/RegisterDog'
import Signup from './pages/Signup'
import { Dashboard } from './pages/Dashboard'
import { Nav } from './components/Nav'
import RequireAppAccess from './routes/RequireAppAccess'
import { OnboardingName } from './pages/OnboardingName'

function App() {
  return (
    <>
      <Nav />
      <div className="max-w-150 mx-auto min-h-screen font-sans flex flex-col gap-2 items-center justify-center">
        <Routes>
          <Route
            path="/"
            element={
              <RequireAppAccess>
                <Dashboard />
              </RequireAppAccess>
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/onboarding-name"
            element={
              <RequireAppAccess>
                <OnboardingName />
              </RequireAppAccess>
            }
          />
          <Route
            path="/register-dog"
            element={
              <RequireAppAccess>
                <RegisterDog />
              </RequireAppAccess>
            }
          />
          <Route
            path="/request"
            element={
              <RequireAppAccess>
                <RequestPage />
              </RequireAppAccess>
            }
          />
        </Routes>
      </div>
    </>
  )
}

export default App
