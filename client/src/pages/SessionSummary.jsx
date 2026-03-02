import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { logError } from '../lib/logError.js'

export default function SessionSummary() {
  const { sessionId } = useParams()
  const navigate = useNavigate()
  const [summary, setSummary] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch(`/api/sessions/${sessionId}/summary`)
      .then((r) => {
        if (!r.ok) throw new Error('Failed to load summary')
        return r.json()
      })
      .then(setSummary)
      .catch((err) => {
        logError(err, { component: 'SessionSummary', action: 'load', sessionId })
        setError(err.message)
      })
  }, [sessionId])

  if (error && !summary) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 px-4">
        <p className="font-mono text-retro-pink text-center" role="alert">{error}</p>
      </div>
    )
  }
  if (!summary) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="font-mono text-retro-cyan animate-pulse">Loading...</p>
      </div>
    )
  }

  const mvp = summary.players.length
    ? summary.players.reduce((a, b) => (b.wins > a.wins ? b : a))
    : null
  const gameCount = summary.games.length

  return (
    <div className="max-w-md mx-auto px-4 py-12 flex flex-col gap-8">
      <div>
        <p className="font-mono text-retro-gold text-xs tracking-widest mb-1">GAME OVER</p>
        <h2 className="font-display text-4xl tracking-wider text-retro-cream">Session Recap</h2>
      </div>

      {mvp && mvp.wins > 0 && (
        <section className="bg-retro-card border-2 border-retro-gold p-4">
          <p className="font-mono text-retro-gold text-xs tracking-widest mb-1">MVP</p>
          <p className="font-display text-2xl text-retro-gold">{mvp.name}</p>
          <p className="font-mono text-retro-cream/70 text-sm mt-1">{mvp.wins} wins</p>
        </section>
      )}

      <section>
        <h3 className="font-mono text-retro-cyan/80 text-xs tracking-widest mb-3">
          Games Played — {gameCount}
        </h3>
        <ul className="flex flex-col gap-3">
          {summary.games.map((game, i) => (
            <li key={game.id} className="bg-retro-card border border-retro-cream/10 p-4">
              <p className="font-mono text-retro-cyan/60 text-xs mb-1">Game {i + 1}</p>
              <p className="font-mono text-retro-cream text-sm">
                {game.team1.map((p) => p.name).join(' & ')}
                <span className="text-retro-pink mx-2 font-display">{game.score_team1}–{game.score_team2}</span>
                {game.team2.map((p) => p.name).join(' & ')}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3 className="font-mono text-retro-cyan/80 text-xs tracking-widest mb-3">Standings</h3>
        <ul className="flex flex-col gap-2">
          {summary.players.map((p) => {
            const isMvp = mvp && p.id === mvp.id
            const streakLabel = p.wins >= 2 ? 'Hot streak' : null
            return (
              <li
                key={p.id}
                className={`flex justify-between items-center px-4 py-3 border-2 transition-colors ${
                  isMvp ? 'bg-retro-gold/10 border-retro-gold' : 'bg-retro-card border-retro-cream/10'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={isMvp ? 'font-display text-retro-gold' : 'font-mono text-retro-cream'}>
                    {p.name}
                  </span>
                  {streakLabel && (
                    <span className="font-mono text-[10px] text-retro-pink/80 tracking-wider">
                      {streakLabel}
                    </span>
                  )}
                </div>
                <span className="font-mono text-retro-cyan/80 text-sm">
                  {p.wins}W – {p.losses}L
                </span>
              </li>
            )
          })}
        </ul>
      </section>

      <button
        onClick={() => navigate('/')}
        className="w-full py-4 font-display text-xl tracking-widest bg-retro-green text-retro-dark
          border-2 border-retro-green hover:bg-retro-dark hover:text-retro-green
          transition-all shadow-retro-glow"
      >
        Done
      </button>
    </div>
  )
}
