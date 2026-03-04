import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { logError } from '../lib/logError.js'
import AvatarPicker from '../components/AvatarPicker'
import PlayerCard from '../components/PlayerCard'
import VsPreview from '../components/VsPreview'
import { AVATAR_GALLERY } from '../data/avatars'

export default function SessionSetup() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const mode = searchParams.get('mode') ?? 'team'
  const isDuel = mode === 'duel'
  const minPlayers = isDuel ? 2 : 4

  const [allPlayers, setAllPlayers] = useState([])
  const [selected, setSelected] = useState([])
  const [newName, setNewName] = useState('')
  const [newAvatarId, setNewAvatarId] = useState(AVATAR_GALLERY[0]?.id ?? 'avatar_02')
  const [error, setError] = useState(null)
  const [showCreateModal, setShowCreateModal] = useState(false)

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

  useEffect(() => {
    if (!showCreateModal) return
    function onKey(e) {
      if (e.key === 'Escape') setShowCreateModal(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [showCreateModal])

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
        body: JSON.stringify({ name: newName.trim(), avatar_id: newAvatarId }),
      })
      const player = await res.json()
      if (!res.ok) throw new Error(player.error ?? 'Failed to add player')
      setError(null)
      setAllPlayers((prev) => [...prev, player])
      if (!isDuel || selected.length < 2) {
        setSelected((prev) => [...prev, player])
      }
      setNewName('')
      setNewAvatarId(AVATAR_GALLERY[0]?.id ?? 'avatar_02')
      setShowCreateModal(false)
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
        &larr; Main Menu
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

      <section>
        <div className="flex items-center justify-between gap-3 mb-3">
          <h3 className="font-mono text-retro-cyan/80 text-xs tracking-widest">
            Select Players — {selected.length}/{isDuel ? '2' : '4+'}
          </h3>
          <div className="shrink-0">
            {selected.length > 0 ? (
              <button
                type="button"
                onClick={() => setSelected([])}
                className="font-mono text-xs tracking-widest text-retro-cyan/80 hover:text-retro-cyan transition-colors"
              >
                Clear
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setSelected(isDuel ? allPlayers.slice(0, 2) : [...allPlayers])}
                disabled={allPlayers.length === 0}
                className="font-mono text-xs tracking-widest text-retro-cyan/80 hover:text-retro-cyan
                  disabled:text-retro-cream/30 disabled:cursor-not-allowed transition-colors"
              >
                Select All
              </button>
            )}
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="flex flex-col items-center justify-center gap-2 p-3 border-2 border-dashed
              border-retro-cream/30 text-retro-cream/60 hover:border-retro-cyan/50 hover:text-retro-cyan
              transition-all rounded aspect-square"
          >
            <span className="text-2xl">+</span>
            <span className="font-mono text-xs">New Player</span>
          </button>
          {allPlayers.map((player) => {
            const isSelected = selected.find((p) => p.id === player.id)
            const isDisabled = isDuel && !isSelected && selected.length >= 2
            return (
              <button
                key={player.id}
                onClick={() => !isDisabled && togglePlayer(player)}
                disabled={isDisabled}
                className={`p-0 border-2 transition-all rounded overflow-hidden aspect-square ${
                  isSelected
                    ? 'bg-retro-green/15 border-retro-green shadow-retro-glow'
                    : isDisabled
                    ? 'bg-retro-card border-retro-cream/10 cursor-not-allowed opacity-60'
                    : 'bg-retro-card border-retro-cream/20 hover:border-retro-cyan/50'
                }`}
              >
                <PlayerCard player={player} />
              </button>
            )
          })}
        </div>
        {ready && selected.length > 0 && (
          <VsPreview selected={selected} isDuel={isDuel} className="mt-6" />
        )}
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

      {showCreateModal && (
        <div
          className="fixed inset-0 bg-retro-dark/90 flex items-center justify-center px-4 z-50"
          onClick={() => setShowCreateModal(false)}
        >
          <div
            className="w-full max-w-md bg-retro-card border-2 border-retro-cyan/30 p-6 flex flex-col gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-mono text-retro-cyan/80 text-xs tracking-widest">Create New Player</h3>
            <form onSubmit={addNewPlayer} className="flex flex-col gap-4">
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Name"
                className="w-full px-3 py-2 font-mono bg-retro-dark border-2 border-retro-cyan/30
                  text-retro-cream placeholder:text-retro-cream/40 focus:outline-none focus:border-retro-cyan"
              />
              <div>
                <p className="font-mono text-retro-cream/40 text-xs tracking-widest mb-2">Pick avatar</p>
                <AvatarPicker selectedId={newAvatarId} onSelect={setNewAvatarId} />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="px-4 py-2 font-display tracking-wider bg-retro-cyan text-retro-dark
                    hover:bg-retro-cyan/90 transition-colors"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 font-mono text-retro-cream/60 hover:text-retro-cream text-xs tracking-widest"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
