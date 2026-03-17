import { Navigate, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export default function RequireAppAccess({
  children,
}: {
  children: React.ReactNode
}) {
  const location = useLocation()
  const { loading, user, userProfile, refreshProfile } = useAuth()

  const [checkingDogs, setCheckingDogs] = useState(true)
  const [hasDog, setHasDog] = useState(false)

  // 2) 프로필이 아직 없으면(트리거 지연/조회 타이밍) 1회 재시도
  useEffect(() => {
    const run = async () => {
      if (user && !userProfile) await refreshProfile()
    }
    run()
  }, [user?.id])

  // 4) 강아지 체크 (온보딩 페이지에서는 굳이 체크 안 해도 됨)
  useEffect(() => {
    const checkDogs = async () => {
      if (!user) return

      // 온보딩 중이면 강아지 체크 스킵해도 됨
      if (location.pathname === '/onboarding-name') {
        setCheckingDogs(false)
        setHasDog(false)
        return
      }

      const { data, error } = await supabase
        .from('dogs')
        .select('id')
        .eq('user_id', user.id)
        .limit(1)

      if (error) {
        console.warn('checkDogs error:', error.message)
        setHasDog(false)
      } else {
        setHasDog((data?.length ?? 0) > 0)
      }
      setCheckingDogs(false)
    }

    checkDogs()
    // location.pathname 포함: 페이지 이동 시 스킵 로직 반영
  }, [user?.id, location.pathname])

  // Allowing GUEST access for now, but this can be changed to require login if needed
  if (!loading && !user) {
    return <>{children}</>
  }
  if (loading) return <div className="p-4">Loading...</div>

  if (!userProfile) {
    return <div className="p-4">Setting up your account...</div>
  }

  // 3) preferred_name 없으면 온보딩으로 (루프 방지)
  if (!userProfile.preferred_name && location.pathname !== '/onboarding-name') {
    return <Navigate to="/onboarding-name" replace state={{ from: location }} />
  }

  if (checkingDogs) return <div className="p-4">Loading...</div>

  // 5) 강아지 없으면 등록 페이지로 (루프 방지)
  if (
    !hasDog &&
    location.pathname !== '/register-dog' &&
    location.pathname !== '/onboarding-name'
  ) {
    return <Navigate to="/register-dog" replace />
  }

  return <>{children}</>
}
