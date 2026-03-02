import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import LineupEditor from '../components/LineupEditor'
import { logError } from '../lib/logError.js'

function validateScore(s1, s2) {
  const a = parseInt(s1)
  const b = parseInt(s2)
  if (isNaN(a) || isNaN(b) || s1 === '' || s2 === '') return null // not ready yet, no error shown
  if (a < 0 || b < 0) return 'Scores must be positive'
  if (a === b) return 'Scores cannot be tied'
  const winner = Math.max(a, b)
  const loser = Math.min(a, b)
  if (winner < 11) return 'Winning score must be at least 11'
  if (winner - loser < 2) return 'Must win by 2'
  return null
}

export default function GameInProgress() {
  const { sessionId } = useParams()
  const navigate = useNavigate()
  const [session, setSession] = useState(null)
  const [currentGame, setCurrentGame] = useState(null)
  const [score1, setScore1] = useState('')
  const [score2, setScore2] = useState('')

  // 'playing' | 'between'
  const [phase, setPhase] = useState('playing')
  const [proposedLineup, setProposedLineup] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadSession = fetch(`/api/sessions/${sessionId}`).then((r) => {
      if (!r.ok) throw new Error('Failed to load session')
      return r.json()
    })

    const loadGame = fetch(`/api/sessions/${sessionId}/current-game`).then((r) => {
      if (r.status === 404) return null // no game yet — first game of session
      if (!r.ok) throw new Error('Failed to load game')
      return r.json()
    })

    Promise.all([loadSession, loadGame])
      .then(async ([s, g]) => {
        setSession(s)
        setCurrentGame(g)
        if (!g) {
          // No game started yet — go straight to lineup editor for game 1
          const res = await fetch(`/api/sessions/${sessionId}/proposed-rotation`)
          const lineup = await res.json()
          if (!res.ok) throw new Error(lineup.error ?? 'Failed to load lineup')
          setProposedLineup(lineup)
          setPhase('between')
        }
        setError(null)
      })
      .catch((err) => {
        logError(err, { component: 'GameInProgress', action: 'load', sessionId })
        setError(err.message)
      })
  }, [sessionId])

  /** @returns {Promise<boolean>} true if saved or nothing to save, false on failure */
  async function submitScore() {
    if (!score1 || !score2) return true // nothing to save, not an error
    try {
      const res = await fetch(`/api/games/${currentGame.id}/score`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          score_team1: parseInt(score1),
          score_team2: parseInt(score2),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to save score')
      return true
    } catch (err) {
      logError(err, { component: 'GameInProgress', action: 'submitScore', gameId: currentGame?.id })
      setError(err.message)
      return false
    }
  }

  async function goToLineupEditor() {
    const saved = await submitScore()
    if (!saved) return
    try {
      const res = await fetch(`/api/sessions/${sessionId}/proposed-rotation`)
      const lineup = await res.json()
      if (!res.ok) throw new Error(lineup.error ?? 'Failed to load lineup')
      setError(null)
      setProposedLineup(lineup)
      setScore1('')
      setScore2('')
      setPhase('between')
    } catch (err) {
      logError(err, { component: 'GameInProgress', action: 'loadProposedRotation', sessionId })
      setError(err.message)
    }
  }

  async function startNextGame(team1Ids, team2Ids) {
    try {
      const res = await fetch(`/api/sessions/${sessionId}/next-game`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ team1: team1Ids, team2: team2Ids }),
      })
      const game = await res.json()
      if (!res.ok) throw new Error(game.error ?? 'Failed to start next game')
      setCurrentGame(game)

      // Refresh session to pick up any late arrivals added during lineup edit
      const updatedRes = await fetch(`/api/sessions/${sessionId}`)
      const updatedSession = await updatedRes.json()
      if (!updatedRes.ok) throw new Error(updatedSession.error ?? 'Failed to refresh session')
      setSession(updatedSession)

      setError(null)
      setProposedLineup(null)
      setPhase('playing')
    } catch (err) {
      logError(err, { component: 'GameInProgress', action: 'startNextGame', sessionId })
      setError(err.message)
    }
  }

  async function stopPlaying() {
    const saved = await submitScore()
    if (!saved) return
    try {
      const res = await fetch(`/api/sessions/${sessionId}/end`, { method: 'PATCH' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to end session')
      navigate(`/session/${sessionId}/summary`)
    } catch (err) {
      logError(err, { component: 'GameInProgress', action: 'stopPlaying', sessionId })
      setError(err.message)
    }
  }

  if (!session) {
    return error ? (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 px-4">
        <p className="font-mono text-retro-pink text-center" role="alert">{error}</p>
      </div>
    ) : (
      <div className="flex items-center justify-center min-h-screen">
        <p className="font-mono text-retro-cyan animate-pulse">Loading...</p>
      </div>
    )
  }

  if (phase === 'between' && proposedLineup) {
    const nextGameNumber = currentGame ? currentGame.game_number + 1 : 1
    return (
      <div className="max-w-md mx-auto px-4 py-12 flex flex-col gap-8">
        <div>
          <p className="font-mono text-retro-cyan text-xs tracking-widest mb-1">UP NEXT</p>
          <h2 className="font-display text-4xl tracking-wider text-retro-cream">
            Game {nextGameNumber}
          </h2>
        </div>
        <LineupEditor
          lineup={proposedLineup}
          sessionId={sessionId}
          onStart={startNextGame}
          onAddPlayer={(player) =>
            setSession((prev) => ({ ...prev, players: [...prev.players, player] }))
          }
        />
      </div>
    )
  }

  if (!currentGame) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="font-mono text-retro-cyan animate-pulse">Loading...</p>
      </div>
    )
  }

  const scoreError = validateScore(score1, score2)
  const scoreValid = score1 !== '' && score2 !== '' && scoreError === null

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

      {error && (
        <p className="font-mono text-retro-pink text-sm" role="alert">{error}</p>
      )}
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
        <h3 className="font-mono text-retro-green text-xs tracking-widest mb-2">Enter Score</h3>
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
        {scoreError && (
          <p className="font-mono text-retro-pink text-xs mt-2 text-center">{scoreError}</p>
        )}
      </section>

      <div className="flex flex-col gap-3">
        <button
          onClick={goToLineupEditor}
          disabled={!scoreValid}
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
