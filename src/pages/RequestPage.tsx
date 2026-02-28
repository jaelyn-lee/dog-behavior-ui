import { useState } from 'react'
import axios from 'axios'
import { Result, BehaviorResult } from '../components/Result'

export const RequestPage = () => {
  const [behavior, setBehavior] = useState('')
  const [previousBehavior, setPreviousBehavior] = useState('')
  const [result, setResult] = useState<BehaviorResult | null>(null)
  const [loading, setLoading] = useState(false)

  const analyzeBehavior = async () => {
    if (!behavior.trim()) return

    setPreviousBehavior(behavior)
    setBehavior('')
    setLoading(true)
    setResult(null)

    try {
      const response = await axios.post('http://localhost:3001/api/analyze', {
        behavior,
      })

      const data = response.data.result
      const parsed = typeof data === 'string' ? JSON.parse(data) : data
      setResult(parsed)
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
        value={behavior}
        onChange={(e) => setBehavior(e.target.value)}
      />

      <button
        onClick={analyzeBehavior}
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
        <Result behaviourResult={result} previousBehavior={previousBehavior} />
      )}
    </>
  )
}
