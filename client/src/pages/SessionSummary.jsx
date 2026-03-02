import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

export default function SessionSummary() {
  const { sessionId } = useParams()
  const navigate = useNavigate()
  const [summary, setSummary] = useState(null)

  useEffect(() => {
    fetch(`/api/sessions/${sessionId}/summary`)
      .then((r) => r.json())
      .then(setSummary)
  }, [sessionId])

  if (!summary) {
    return <div className="flex items-center justify-center min-h-screen text-gray-400">Loading...</div>
  }

  return (
    <div className="max-w-md mx-auto px-4 py-12 flex flex-col gap-8">
      <h2 className="text-2xl font-bold">Session Recap</h2>

      <section>
        <h3 className="text-sm uppercase tracking-widest text-gray-400 mb-3">Games Played</h3>
        <ul className="flex flex-col gap-3">
          {summary.games.map((game, i) => (
            <li key={game.id} className="bg-gray-800 rounded-xl p-4">
              <p className="text-xs text-gray-400 mb-1">Game {i + 1}</p>
              <p className="font-medium">
                {game.team1.map((p) => p.name).join(' & ')}
                <span className="text-gray-400 mx-2">{game.score_team1}–{game.score_team2}</span>
                {game.team2.map((p) => p.name).join(' & ')}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3 className="text-sm uppercase tracking-widest text-gray-400 mb-3">Player Stats</h3>
        <ul className="flex flex-col gap-2">
          {summary.players.map((p) => (
            <li key={p.id} className="flex justify-between items-center bg-gray-800 rounded-lg px-4 py-3">
              <span>{p.name}</span>
              <span className="text-gray-400 text-sm">{p.wins}W – {p.losses}L</span>
            </li>
          ))}
        </ul>
      </section>

      <button
        onClick={() => navigate('/')}
        className="w-full py-4 font-semibold bg-green-500 hover:bg-green-400 rounded-xl transition-colors"
      >
        Done
      </button>
    </div>
  )
}
