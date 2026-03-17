import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useNavigate, useLocation } from 'react-router-dom'
import { Icon } from '@mui/material'
import PersonIcon from '@mui/icons-material/Person'
import LockIcon from '@mui/icons-material/Lock'
import { Button } from '../components/Button'

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e?: React.FormEvent) => {
    e?.preventDefault()
    setLoading(true)
    const { error, data } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    console.log('Login response:', { error, data })

    setLoading(false)

    if (error) {
      alert(error.message)
      return
    }

    if (data.session) {
      const from = (location.state as any)?.from?.pathname ?? '/dashboard'
      navigate(from, { replace: true })
    }
  }

  return (
    <div className="flex flex-col gap-4 max-w-150 mx-auto border-2 border-white bg-white rounded-lg shadow-md p-6 w-3/4 h-auto">
      <h1 className="text-2xl font-bold text-center">Login</h1>
      <form onSubmit={handleLogin} className="flex flex-col gap-4">
        <div className="border-2 border-gray-300 rounded-lg flex flex-row items-center justify-around gap-2 py-2">
          <input
            placeholder="Email"
            className="w-3/4"
            onChange={(e) => setEmail(e.target.value)}
          />
          <Icon component={PersonIcon} />
        </div>
        <div className="border-2 border-gray-300 rounded-lg flex flex-row items-center justify-around gap-2 py-2">
          <input
            placeholder="Password"
            type="password"
            className="w-3/4"
            onChange={(e) => setPassword(e.target.value)}
          />
          <Icon component={LockIcon} />
        </div>
        <Button type="submit">{loading ? 'Logging in...' : 'Login'}</Button>
      </form>
      <p className="text-sm text-center cursor-pointer">
        Don't have an account?{' '}
        <button
          onClick={() => navigate('/signup')}
          className="text-blue-500 hover:underline"
        >
          Sign up
        </button>
      </p>
    </div>
  )
}
