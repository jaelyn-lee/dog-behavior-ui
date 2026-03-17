import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

interface UserProfile {
  id: string
  email: string | null
  preferred_name: string | null
}

interface AuthContextValue {
  loading: boolean
  session: Session | null
  user: User | null
  userProfile: UserProfile | null
  refreshProfile: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('id,email,preferred_name')
      .eq('id', userId)
      .single()

    if (error) {
      console.warn('fetchProfile error:', error.message)
      setUserProfile(null)
      return
    }

    setUserProfile(data)
  }

  const refreshProfile = async () => {
    const userId = supabase.auth.getUser
      ? (await supabase.auth.getUser()).data.user?.id
      : user?.id
    if (!userId) {
      setUserProfile(null)
      return
    }
    await fetchProfile(userId)
  }

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      console.log('Initial session on mount:', data.session?.access_token)
      const currentSession = data.session ?? null
      console.log('Initial session:', currentSession)
      setSession(currentSession)
      setUser(currentSession?.user ?? null)

      if (currentSession?.user?.id) {
        await fetchProfile(currentSession.user.id)
      } else {
        setUserProfile(null)
      }

      setLoading(false)
    })

    // Listen for auth state changes (login, logout, token refresh)
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        console.log('Auth state changed:', newSession)
        setSession(newSession)
        setUser(newSession?.user ?? null)

        if (newSession?.user?.id) {
          await fetchProfile(newSession.user.id)
        } else {
          setUserProfile(null)
        }

        setLoading(false)
      },
    )

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  const value = useMemo<AuthContextValue>(
    () => ({
      loading,
      session,
      user,
      userProfile,
      refreshProfile,
      signOut,
    }),
    [loading, session, user, userProfile],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
