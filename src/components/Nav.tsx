import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Spinner } from '@/components/ui/spinner'

export const Nav = () => {
  const navigate = useNavigate()
  const { loading, user, userProfile, signOut } = useAuth()

  console.log(
    'Nav component - loading:',
    loading,
    'user:',
    user,
    'userProfile:',
    userProfile,
  )

  const handleLogout = async () => {
    await signOut()
    navigate('/login')
  }

  // if (loading) return <Spinner />

  return (
    <>
      <nav className="flex flex-row bg-primary text-light justify-between items-center p-4">
        <div
          className="flex flex-row items-center gap-2 cursor-pointer"
          onClick={() => navigate('/')}
        >
          <img src="/images/logo.png" alt="Dog Logo" className=" w-20" />
          <h1 className="text-2xl font-bold">Dog Behavior App</h1>
        </div>
        {user ? (
          <div className="flex flex-row items-center gap-2">
            <p>Welcome, {userProfile?.preferred_name ?? 'User'}!</p>
            <button
              className="bg-light text-primary px-4 py-2 rounded-lg"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        ) : (
          <button
            className="bg-light text-primary px-4 py-2 rounded-lg"
            onClick={() => navigate('/login')}
          >
            Login
          </button>
        )}
      </nav>
    </>
  )
}
