import { Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { ReactNode } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Session } from '@supabase/supabase-js'

export default function RequireAuth({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState<Session | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })
  }, [])

  if (loading) return <div>Loading...</div>

  if (!session) return <Navigate to="/login" replace />

  return <>{children}</>
}
