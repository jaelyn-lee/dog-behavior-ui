import { useNavigate } from 'react-router-dom'
import { Button } from '../components/Button'

export const Dashboard = () => {
  const navigate = useNavigate()
  return (
    <div className="flex flex-col gap-4 max-w-150 mx-auto border-2 border-white bg-white rounded-lg shadow-md p-6 w-3/4 h-auto">
      <h1 className="text-2xl font-bold text-center">Dashboard</h1>
      <Button onClick={() => navigate('/request')}>Go to Request page</Button>
    </div>
  )
}
