import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { logError } from '../lib/logError.js'

export default function SessionSetup() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const mode = searchParams.get('mode') ?? 'team'
  const isDuel = mode === 'duel'
  const minPlayers = isDuel ? 2 : 4

  const [allPlayers, setAllPlayers] = useState([])
  const [selected, setSelected] = useState([])
  const [newName, setNewName] = useState('')
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch('/api/players')
      .then((r) => {
        if (!r.ok) throw new Error('Failed to load players')
        return r.json()
      })
      .then(setAllPlayers)
      .catch((err) => {
        logError(err, { component: 'SessionSetup', action: 'loadPlayers' })
        setError(err.message)
      })
  }, [])

  function togglePlayer(player) {
    setSelected((prev) => {
      if (prev.find((p) => p.id === player.id)) return prev.filter((p) => p.id !== player.id)
      if (isDuel && prev.length >= 2) return prev
      return [...prev, player]
    })
  }

  async function addNewPlayer(e) {
    e.preventDefault()
    if (!newName.trim()) return
    try {
      const res = await fetch('/api/players', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName.trim() }),
      })
      const player = await res.json()
      if (!res.ok) throw new Error(player.error ?? 'Failed to add player')
      setError(null)
      setAllPlayers((prev) => [...prev, player])
      if (!isDuel || selected.length < 2) {
        setSelected((prev) => [...prev, player])
      }
      setNewName('')
    } catch (err) {
      logError(err, { component: 'SessionSetup', action: 'addPlayer' })
      setError(err.message)
    }
  }

  async function startSession() {
    if (selected.length < minPlayers) return
    try {
      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerIds: selected.map((p) => p.id), mode }),
      })
      const session = await res.json()
      if (!res.ok) throw new Error(session.error ?? 'Failed to start session')
      navigate(`/session/${session.id}/game`)
    } catch (err) {
      logError(err, { component: 'SessionSetup', action: 'startSession' })
      setError(err.message)
    }
  }

  const needed = minPlayers - selected.length
  const ready = isDuel ? selected.length === 2 : selected.length >= 4

  return (
    <div className="max-w-md mx-auto px-4 py-12 flex flex-col gap-8">
      <Link
        to="/"
        className="font-mono text-retro-cyan/70 hover:text-retro-cyan text-xs tracking-widest self-start"
      >
        &larr; Back
      </Link>
      {error && (
        <p className="font-mono text-retro-pink text-sm" role="alert">{error}</p>
      )}
      <div>
        <p className={`font-mono text-xs tracking-widest mb-1 ${isDuel ? 'text-retro-pink' : 'text-retro-cyan'}`}>
          {isDuel ? 'HEAD TO HEAD' : 'CO-OP BATTLE'}
        </p>
        <h2 className="font-display text-4xl tracking-wider text-retro-cream">Select Players</h2>
      </div>

      <section className="bg-retro-card border border-retro-green/30 p-4">
        <h3 className="font-mono text-retro-cyan/80 text-xs tracking-widest mb-3">Create New Player</h3>
        <form onSubmit={addNewPlayer} className="flex gap-2">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Name"
            className="flex-1 px-3 py-2 font-mono bg-retro-dark border-2 border-retro-cyan/30
              text-retro-cream placeholder:text-retro-cream/40 focus:outline-none focus:border-retro-cyan"
          />
          <button
            type="submit"
            className="px-4 py-2 font-display tracking-wider bg-retro-cyan text-retro-dark
              hover:bg-retro-cyan/90 transition-colors"
          >
            Add
          </button>
        </form>
      </section>

      <section>
        <h3 className="font-mono text-retro-cyan/80 text-xs tracking-widest mb-3">
          Select Players — {selected.length}/{isDuel ? '2' : '4+'}
        </h3>
        <ul className="flex flex-col gap-2">
          {allPlayers.map((player) => {
            const isSelected = selected.find((p) => p.id === player.id)
            const isDisabled = isDuel && !isSelected && selected.length >= 2
            return (
              <li key={player.id}>
                <button
                  onClick={() => togglePlayer(player)}
                  disabled={isDisabled}
                  className={`w-full text-left px-4 py-3 font-mono border-2 transition-all ${
                    isSelected
                      ? 'bg-retro-green/15 border-retro-green text-retro-green shadow-retro-glow'
                      : isDisabled
                      ? 'bg-retro-card border-retro-cream/10 text-retro-cream/30 cursor-not-allowed'
                      : 'bg-retro-card border-retro-cream/20 text-retro-cream/80 hover:border-retro-cyan/50'
                  }`}
                >
                  {player.name}
                </button>
              </li>
            )
          })}
        </ul>
      </section>

      <button
        onClick={startSession}
        disabled={!ready}
        className="w-full py-4 font-display text-xl tracking-widest bg-retro-green text-retro-dark
          border-2 border-retro-green disabled:bg-retro-card disabled:border-retro-cream/20
          disabled:text-retro-cream/40 hover:enabled:bg-retro-dark hover:enabled:text-retro-green
          transition-all shadow-retro-glow disabled:shadow-none"
      >
        {ready ? 'Start Game' : `Need ${needed} more`}
      </button>
    </div>
  )
}
