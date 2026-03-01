import { Button } from '@mui/material'
import { FormEvent } from 'react'

export const OnboardingName = () => {
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    // save it to supabase in profiles table, then navigate to register-dog page
  }
  return (
    <div className="flex flex-col gap-4 max-w-150 mx-auto border-2 border-white bg-white rounded-lg shadow-md p-6 w-3/4 h-auto">
      <form action="submit" onSubmit={handleSubmit}>
        <h1 className="text-2xl font-bold text-center">What is your name?</h1>
        <input
          type="text"
          placeholder="Enter your name"
          className="border-2 border-gray-300 rounded-lg p-2 w-full"
        />
        <Button type="submit">Next</Button>
      </form>
    </div>
  )
}
