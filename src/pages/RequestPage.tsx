import { useState } from 'react'
import axios from 'axios'
import { Result, BehaviourResult } from '../components/Result'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

// For guest users, we can store their analysis history in localStorage under a specific key to allow them to see past analyses during the same session.
const GUEST_HISTORY_KEY = 'guest_analyses'

export const RequestPage = () => {
  const { user } = useAuth()
  const [behaviour, setBehaviour] = useState('')
  const [previousBehaviour, setPreviousBehaviour] = useState('')
  const [result, setResult] = useState<BehaviourResult | null>(null)
  const [loading, setLoading] = useState(false)

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
      JSON.stringify([entry, ...existing].slice(0, 20)), // 최대 20개
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
          'http://localhost:3001/api/analyses',
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
          'http://localhost:3001/api/analyses/guest',
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
    <>
      <h1 className="text-2xl text-center">🐶 Dog Behaviour Analyser</h1>

      <textarea
        rows={5}
        className="w-full p-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Describe your dog's behaviour..."
        value={behaviour}
        onChange={(e) => setBehaviour(e.target.value)}
      />

      <button
        onClick={analyseBehaviour}
        className="mt-2.5 px-5 py-2.5 cursor-pointer border-2 border-blue-500 text-blue-500 rounded-lg disabled:opacity-50 w-1/2 self-center"
        disabled={loading}
      >
        {loading ? 'Analysing...' : 'Analyse'}
      </button>
      {loading && (
        <img
          src="/loading.gif"
          alt="Loading..."
          className="w-1/2 self-center mt-4"
        />
      )}

      {result && (
        <Result
          behaviourResult={result}
          previousBehaviour={previousBehaviour}
        />
      )}
    </>
  )
}
