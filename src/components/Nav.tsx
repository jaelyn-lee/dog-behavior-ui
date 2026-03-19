import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export const Nav = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { loading, user, userProfile, signOut } = useAuth()

  const handleLogout = async () => {
    await signOut()
    navigate('/') // 로그아웃 후 홈(분석 페이지)으로 — guest로 계속 사용 가능
  }

  const isActive = (path: string) =>
    location.pathname === path ? 'underline underline-offset-4 font-bold' : ''

  return (
    <>
      <nav className="flex flex-col items-end bg-light text-primary sm:flex-row sm:justify-between sm:items-center p-4">
        <div
          className="flex flex-row items-center gap-2 cursor-pointer"
          onClick={() => navigate('/')}
        >
          <img src="/images/logo.png" alt="Dog Logo" className=" w-20" />
          <h1 className="text-2xl font-bold">Analyse your pups</h1>
        </div>
        <div className="flex flex-row items-center gap-6">
          <div className="flex flex-row items-center gap-6">
            <button
              className={`hover:underline underline-offset-4 ${isActive('/')}`}
              onClick={() => navigate('/')}
            >
              Analyse
            </button>
            <button
              className={`hover:underline underline-offset-4 ${isActive('/dog-breed-scanner')}`}
              onClick={() => navigate('/dog-breed-scanner')}
            >
              Scan Breed
            </button>
            {user && (
              <button
                className={`hover:underline underline-offset-4 ${isActive('/history')}`}
                onClick={() => navigate('/history')}
              >
                History
              </button>
            )}
          </div>

          {loading ? (
            <div className="w-24" />
          ) : user ? (
            <div className="flex flex-row items-center gap-3">
              <p className="text-sm">
                Hi,{' '}
                <span className="font-bold">
                  {userProfile?.preferred_name ?? 'User'}
                </span>
                !
              </p>
              <button
                className="bg-light text-primary px-4 py-2 rounded-lg hover:opacity-90"
                onClick={handleLogout}
              >
                Sign Out
              </button>
            </div>
          ) : (
            <button
              className="px-4 py-2 rounded-lg hover:underline"
              onClick={() => navigate('/login')}
            >
              Log in
            </button>
          )}
        </div>
      </nav>
    </>
  )
}
