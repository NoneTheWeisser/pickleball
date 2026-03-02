import { useNavigate } from 'react-router-dom'

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-8">
      <h1 className="text-4xl font-bold tracking-tight">Pickleball Night</h1>
      <button
        onClick={() => navigate('/session/new')}
        className="px-8 py-4 text-lg font-semibold bg-green-500 hover:bg-green-400 rounded-xl transition-colors"
      >
        New Game
      </button>
    </div>
  )
}
