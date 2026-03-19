import { Route, Routes } from 'react-router-dom'
import Login from './pages/Login'
import { RequestPage } from './pages/RequestPage'
import { RegisterDog } from './pages/RegisterDog'
import Signup from './pages/Signup'
import { Nav } from './components/Nav'
import RequireAppAccess from './routes/RequireAppAccess'
import { OnboardingName } from './pages/OnboardingName'
import { History } from './pages/History'
import { DogBreedScanner } from './pages/DogBreedScanner'

function App() {
  return (
    <>
      <Nav />
      <div className="mx-auto h-screen font-sans flex flex-col">
        <main className="flex-1 w-full overflow-y-auto mb-20">
          <div className="w-full px-8 mt-6">
            <Routes>
              {/* ── Guest access allowed ── */}
              <Route path="/" element={<RequestPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/dog-breed-scanner" element={<DogBreedScanner />} />

              {/* ── Authenticated user access ── */}
              {/* ── Only for logged-in users ── */}
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
        </main>
      </div>
    </>
  )
}

export default App
