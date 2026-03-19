import { useEffect, useState } from 'react'
import axios from 'axios'
import { Result, BehaviourResult } from '../components/Result'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { Spinner } from '../components/ui/spinner'

// For guest users, we can store their analysis history in localStorage under a specific key to allow them to see past analyses during the same session.
const GUEST_HISTORY_KEY = 'guest_analyses'

export const RequestPage = () => {
  const { user } = useAuth()
  const [behaviour, setBehaviour] = useState('')
  const [previousBehaviour, setPreviousBehaviour] = useState('')
  const [result, setResult] = useState<BehaviourResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState('Analysing...')
  const [focused, setFocused] = useState(false)

  const isEmpty = !behaviour.trim()

  useEffect(() => {
    if (loading) {
      const messages = [
        'Analysing...',
        'Consulting the doggos...',
        'Sniffing the data...',
        'Hold tight...',
        'Nearly there...',
      ]
      const interval = setInterval(() => {
        setLoadingMessage(messages[Math.floor(Math.random() * messages.length)])
      }, 2000)
      return () => clearInterval(interval)
    }
  }, [loading])

  const saveToLocalStorage = (behaviour: string, analysis: BehaviourResult) => {
    const existing = JSON.parse(localStorage.getItem(GUEST_HISTORY_KEY) || '[]')
    const entry = {
      id: crypto.randomUUID(),
      behaviour_input: behaviour,
      ...analysis,
      created_at: new Date().toISOString(),
    }
    localStorage.setItem(
      GUEST_HISTORY_KEY,
      JSON.stringify([entry, ...existing].slice(0, 20)),
    )
  }

  const analyseBehaviour = async () => {
    if (!behaviour.trim()) return

    setPreviousBehaviour(behaviour)
    setBehaviour('')
    setLoading(true)
    setResult(null)

    try {
      if (user) {
        // Get JWT token from Supabase session
        const { data: sessionData } = await supabase.auth.getSession()
        const token = sessionData.session?.access_token

        if (!token) {
          console.error(
            'No access token found. User might not be authenticated.',
          )
          setLoading(false)
          return
        }

        const response = await axios.post(
          `${process.env.REACT_APP_RENDER_API_URL}/api/analyses`,
          {
            behaviour,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        )

        setResult(response.data.result)
      } else {
        // Guest user flow - save to localStorage
        const response = await axios.post(
          `${process.env.REACT_APP_RENDER_API_URL}/api/analyses/guest`,
          { behaviour },
        )
        setResult(response.data.result)
        saveToLocalStorage(behaviour, response.data.result)
      }
    } catch (error) {
      console.error('Error analysing behaviour.', error)
    }

    setLoading(false)
  }

  return (
    <div className="flex flex-col gap-4 max-w-150 mx-auto mt-10 mb-20">
      <div className="text-center">
        <div className="text-4xl mb-2.5 leading-none">🐶</div>
        <h1 className="text-dark m-0 font-extrabold text-[clamp(20px,4vw,32px)] tracking-[-0.02em]">
          Dog Behaviour <span className="text-primary">Analyser</span>
        </h1>
        <p className="text-dark text-sm mt-1.5 tracking-[0.03em]">
          Describe what your pup is doing and we'll decode it
        </p>
      </div>

      <div
        className={`rounded-[20px] bg-white overflow-hidden border-2 transition-all duration-200 ${
          focused
            ? 'border-dark shadow-[0_6px_24px_#F28F7928]'
            : 'border-dark/10 shadow-[0_2px_12px_#59280B10]'
        }`}
      >
        <textarea
          rows={5}
          className="w-full text-dark text-sm py-4 px-[18px] border-0 outline-none resize-none leading-[1.65] bg-transparent font-[inherit] box-border"
          placeholder="e.g. My dog keeps spinning in circles before lying down..."
          value={behaviour}
          onChange={(e) => setBehaviour(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        <div className="flex items-center justify-between px-4 py-[10px] border-t border-t-dark/10 bg-light/50">
          <span className="text-xs text-dark/30">
            {behaviour.length > 0
              ? `${behaviour.length} characters`
              : 'Start typing...'}
          </span>
          <span className="text-lg">🐾</span>
        </div>
      </div>

      <button
        onClick={analyseBehaviour}
        disabled={loading || isEmpty}
        className={`flex items-center justify-center gap-2 mx-auto min-w-[160px] py-[13px] px-8 rounded-[14px] border-0 font-bold text-[15px] font-[inherit] transition-all duration-200 ${
          loading || isEmpty
            ? 'cursor-not-allowed bg-dark/10 text-dark/40 shadow-none'
            : 'cursor-pointer bg-primary text-white shadow-[0_4px_16px_#F28F7950]'
        }`}
      >
        {loading ? (
          <span>
            {loadingMessage}
            <Spinner size={16} className="inline-block ml-2" />
          </span>
        ) : (
          'Analyse 🔍'
        )}
      </button>

      {loading && (
        <div className="flex items-center justify-center gap-1.5 pt-3 pb-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-primary opacity-70"
              style={{
                animation: `bounce 1.2s ${i * 0.2}s infinite ease-in-out`,
              }}
            />
          ))}
          <style>{`
            @keyframes bounce {
              0%, 80%, 100% { transform: scale(0.7); opacity: 0.4; }
              40%            { transform: scale(1.2); opacity: 1; }
            }
          `}</style>
        </div>
      )}

      {result && (
        <Result
          behaviourResult={result}
          previousBehaviour={previousBehaviour}
        />
      )}
    </div>
  )
}
