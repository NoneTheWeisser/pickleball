import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

export default function GameInProgress() {
  const { sessionId } = useParams()
  const navigate = useNavigate()
  const [session, setSession] = useState(null)
  const [currentGame, setCurrentGame] = useState(null)
  const [score1, setScore1] = useState('')
  const [score2, setScore2] = useState('')

  useEffect(() => {
    fetch(`/api/sessions/${sessionId}`)
      .then((r) => r.json())
      .then(setSession)
  }, [sessionId])

  useEffect(() => {
    if (!session) return
    fetch(`/api/sessions/${sessionId}/current-game`)
      .then((r) => r.json())
      .then(setCurrentGame)
  }, [session, sessionId])

  async function submitScore() {
    if (!score1 || !score2) return
    await fetch(`/api/games/${currentGame.id}/score`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        score_team1: parseInt(score1),
        score_team2: parseInt(score2),
      }),
    })
    setScore1('')
    setScore2('')
  }

  async function startNextGame() {
    await submitScore()
    const res = await fetch(`/api/sessions/${sessionId}/next-game`, {
      method: 'POST',
    })
    const game = await res.json()
    setCurrentGame(game)
  }

  async function stopPlaying() {
    await submitScore()
    await fetch(`/api/sessions/${sessionId}/end`, { method: 'PATCH' })
    navigate(`/session/${sessionId}/summary`)
  }

  if (!session || !currentGame) {
    return <div className="flex items-center justify-center min-h-screen text-gray-400">Loading...</div>
  }

  const team1 = currentGame.players.filter((p) => p.team === 1)
  const team2 = currentGame.players.filter((p) => p.team === 2)
  const sitting = session.players.filter(
    (p) => !currentGame.players.find((gp) => gp.id === p.id)
  )

  return (
    <div className="max-w-md mx-auto px-4 py-12 flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Game {currentGame.game_number}</h2>
        <span className="text-sm text-gray-400">
          {new Date(currentGame.started_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>

      <section className="flex flex-col gap-4">
        <TeamCard label="Team 1" players={team1} />
        <div className="text-center text-gray-500 text-sm">vs</div>
        <TeamCard label="Team 2" players={team2} />
      </section>

      {sitting.length > 0 && (
        <section>
          <h3 className="text-sm uppercase tracking-widest text-gray-400 mb-2">Sitting Out</h3>
          <p className="text-gray-300">{sitting.map((p) => p.name).join(', ')}</p>
        </section>
      )}

      <section>
        <h3 className="text-sm uppercase tracking-widest text-gray-400 mb-3">Enter Score</h3>
        <div className="flex items-center gap-3">
          <input
            type="number"
            value={score1}
            onChange={(e) => setScore1(e.target.value)}
            placeholder="Team 1"
            min="0"
            className="flex-1 px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-center text-lg focus:outline-none focus:border-green-500"
          />
          <span className="text-gray-500">–</span>
          <input
            type="number"
            value={score2}
            onChange={(e) => setScore2(e.target.value)}
            placeholder="Team 2"
            min="0"
            className="flex-1 px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-center text-lg focus:outline-none focus:border-green-500"
          />
        </div>
      </section>

      <div className="flex flex-col gap-3">
        <button
          onClick={startNextGame}
          disabled={!score1 || !score2}
          className="w-full py-4 font-semibold bg-green-500 hover:bg-green-400 disabled:bg-gray-700 disabled:text-gray-500 rounded-xl transition-colors"
        >
          Start Next Game
        </button>
        <button
          onClick={stopPlaying}
          className="w-full py-3 font-medium text-gray-300 bg-gray-800 hover:bg-gray-700 rounded-xl transition-colors"
        >
          Stop Playing
        </button>
      </div>
    </div>
  )
}

function TeamCard({ label, players }) {
  return (
    <div className="bg-gray-800 rounded-xl p-4">
      <p className="text-xs uppercase tracking-widest text-gray-400 mb-2">{label}</p>
      <p className="text-lg font-medium">{players.map((p) => p.name).join(' & ')}</p>
    </div>
  )
}
