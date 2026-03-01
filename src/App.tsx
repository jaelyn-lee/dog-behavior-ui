import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Login from './pages/Login'
import { RequestPage } from './pages/RequestPage'
import { RegisterDog } from './pages/RegisterDog'
import Signup from './pages/Signup'
import RequireAuth from './routes/RequireAuth'
import { Dashboard } from './pages/Dashboard'

function App() {
  return (
    <BrowserRouter>
      <div className="max-w-150 mx-auto min-h-screen font-sans flex flex-col gap-2 items-center justify-center">
        <Routes>
          <Route
            path="/"
            element={
              <RequireAuth>
                <Dashboard />
              </RequireAuth>
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/register-dog" element={<RegisterDog />} />
          <Route path="/request" element={<RequestPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
