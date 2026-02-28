import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Login from './pages/Login'
import { RequestPage } from './pages/RequestPage'
import { RegisterDog } from './pages/RegisterDog'

function App() {
  return (
    <BrowserRouter>
      <div className="max-w-150 mx-auto mt-12 font-sans flex flex-col gap-2 items-center">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register-dog" element={<RegisterDog />} />
          <Route path="/request" element={<RequestPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
