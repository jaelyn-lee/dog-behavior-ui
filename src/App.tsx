import { Route, Routes } from 'react-router-dom'
import Login from './pages/Login'
import { RequestPage } from './pages/RequestPage'
import { RegisterDog } from './pages/RegisterDog'
import Signup from './pages/Signup'
import { Nav } from './components/Nav'
import RequireAppAccess from './routes/RequireAppAccess'
import { OnboardingName } from './pages/OnboardingName'
import { History } from './pages/History'

function App() {
  return (
    <>
      <Nav />
      <div className="max-w-150 mx-auto min-h-screen font-sans flex flex-col gap-2 items-center justify-center">
        <Routes>
          {/* ── Guest access allowed ── */}
          <Route path="/" element={<RequestPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* ── Authenticated user access ── */}
          {/* ── 로그인 유저만 ── */}
          <Route
            path="/history"
            element={
              <RequireAppAccess>
                <History />
              </RequireAppAccess>
            }
          />
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
        </Routes>
      </div>
    </>
  )
}

export default App
