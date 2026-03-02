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
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="font-mono text-retro-cyan animate-pulse">Loading...</p>
      </div>
    )
  }

  const team1 = currentGame.players.filter((p) => p.team === 1)
  const team2 = currentGame.players.filter((p) => p.team === 2)
  const sitting = session.players.filter(
    (p) => !currentGame.players.find((gp) => gp.id === p.id)
  )

  return (
    <div className="max-w-md mx-auto px-4 py-12 flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-mono text-retro-cyan text-xs tracking-widest">LIVE</p>
          <h2 className="font-display text-4xl tracking-wider text-retro-cream">
            Game {currentGame.game_number}
          </h2>
        </div>
        <span className="font-mono text-retro-cyan/80 text-sm">
          {new Date(currentGame.started_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>

      <section className="flex flex-col gap-4">
        <TeamCard label="Team 1" players={team1} accent="green" />
        <div className="text-center font-mono text-retro-pink text-sm tracking-widest">vs</div>
        <TeamCard label="Team 2" players={team2} accent="cyan" />
      </section>

      {sitting.length > 0 && (
        <section className="bg-retro-card border border-retro-cream/10 p-3">
          <h3 className="font-mono text-retro-cream/50 text-xs tracking-widest mb-1">Bench</h3>
          <p className="font-mono text-retro-cream/80 text-sm">{sitting.map((p) => p.name).join(', ')}</p>
        </section>
      )}

      <section className="bg-retro-card border-2 border-retro-green/40 p-3">
        <h3 className="font-mono text-retro-green text-xs tracking-widest mb-1">Enter Score</h3>
        <div className="flex items-center justify-center gap-1">
          <input
            type="number"
            value={score1}
            onChange={(e) => setScore1(e.target.value)}
            placeholder="0"
            min="0"
            className="w-10 px-1 py-0.5 font-mono text-sm text-center bg-retro-dark border 
              border-retro-green/50 text-retro-cream focus:outline-none focus:border-retro-green"
          />
          <span className="font-mono text-retro-pink text-xs">–</span>
          <input
            type="number"
            value={score2}
            onChange={(e) => setScore2(e.target.value)}
            placeholder="0"
            min="0"
            className="w-10 px-1 py-0.5 font-mono text-sm text-center bg-retro-dark border 
              border-retro-cyan/50 text-retro-cream focus:outline-none focus:border-retro-cyan"
          />
        </div>
      </section>

      <div className="flex flex-col gap-3">
        <button
          onClick={startNextGame}
          disabled={!score1 || !score2}
          className="w-full py-4 font-display text-xl tracking-widest bg-retro-green text-retro-dark
            border-2 border-retro-green disabled:bg-retro-card disabled:border-retro-cream/20
            disabled:text-retro-cream/40 hover:enabled:bg-retro-dark hover:enabled:text-retro-green
            transition-all shadow-retro-glow disabled:shadow-none"
        >
          Next Game
        </button>
        <button
          onClick={stopPlaying}
          className="w-full py-3 font-mono text-retro-cream/70 bg-retro-card border border-retro-cream/20
            hover:border-retro-pink/50 hover:text-retro-pink transition-colors"
        >
          Stop Playing
        </button>
      </div>
    </div>
  )
}

function TeamCard({ label, players, accent = 'green' }) {
  const borderColor = accent === 'cyan' ? 'border-retro-cyan/40' : 'border-retro-green/40'
  const textColor = accent === 'cyan' ? 'text-retro-cyan' : 'text-retro-green'
  return (
    <div className={`bg-retro-card border-2 ${borderColor} p-4`}>
      <p className={`font-mono text-xs tracking-widest ${textColor} mb-2`}>{label}</p>
      <p className="font-display text-xl tracking-wide text-retro-cream">
        {players.map((p) => p.name).join(' & ')}
      </p>
    </div>
  )
}
