import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

export default function Admin() {
  const [players, setPlayers] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [editName, setEditName] = useState('')
  const [showDeleted, setShowDeleted] = useState(false)
  const [error, setError] = useState(null)
  const [sessions, setSessions] = useState([])
  const [confirmDeleteSession, setConfirmDeleteSession] = useState(null)
  const [tab, setTab] = useState('players')

  useEffect(() => {
    fetch('/api/players?all=true')
      .then((r) => r.json())
      .then(setPlayers)
    fetch('/api/sessions')
      .then((r) => r.json())
      .then(setSessions)
  }, [])

  async function deleteSession(id) {
    const res = await fetch(`/api/sessions/${id}`, { method: 'DELETE' })
    const data = await res.json()
    if (!res.ok) return setError(data.error)
    setSessions((prev) => prev.filter((s) => s.id !== id))
    setConfirmDeleteSession(null)
  }

  const active = players.filter((p) => !p.deleted_at)
  const deleted = players.filter((p) => p.deleted_at)

  function startEdit(player) {
    setEditingId(player.id)
    setEditName(player.name)
    setError(null)
  }

  function cancelEdit() {
    setEditingId(null)
    setEditName('')
    setError(null)
  }

  async function saveEdit(id) {
    const res = await fetch(`/api/players/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: editName }),
    })
    const data = await res.json()
    if (!res.ok) return setError(data.error)
    setPlayers((prev) => prev.map((p) => (p.id === id ? data : p)))
    setEditingId(null)
    setEditName('')
  }

  async function softDelete(id) {
    const res = await fetch(`/api/players/${id}`, { method: 'DELETE' })
    const data = await res.json()
    if (!res.ok) return setError(data.error)
    setPlayers((prev) => prev.map((p) => (p.id === id ? data : p)))
  }

  async function restore(id) {
    const res = await fetch(`/api/players/${id}/restore`, { method: 'POST' })
    const data = await res.json()
    if (!res.ok) return setError(data.error)
    setPlayers((prev) => prev.map((p) => (p.id === id ? data : p)))
  }

  return (
    <div className="max-w-md mx-auto px-4 py-12 flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-mono text-retro-pink text-xs tracking-widest mb-1">ADMIN</p>
          <h2 className="font-display text-4xl tracking-wider text-retro-cream">Players</h2>
        </div>
        <Link
          to="/"
          className="font-mono text-retro-cyan/70 hover:text-retro-cyan text-xs tracking-widest transition-colors"
        >
          &larr; Back
        </Link>
      </div>

      <div className="flex border-b border-retro-cream/10">
        {['players', 'sessions'].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`font-mono text-xs tracking-widest px-4 py-2 transition-colors capitalize
              ${tab === t
                ? 'text-retro-cyan border-b-2 border-retro-cyan -mb-px'
                : 'text-retro-cream/40 hover:text-retro-cream/70'
              }`}
          >
            {t}
          </button>
        ))}
      </div>

      {error && (
        <p className="font-mono text-retro-pink text-sm" role="alert">{error}</p>
      )}

      {tab === 'players' && <section className="flex flex-col gap-2">
        <h3 className="font-mono text-retro-cyan/80 text-xs tracking-widest mb-1">
          Active — {active.length}
        </h3>
        {active.length === 0 && (
          <p className="font-mono text-retro-cream/40 text-sm">No active players.</p>
        )}
        {active.map((player) => (
          <div
            key={player.id}
            className="flex items-center gap-2 bg-retro-card border border-retro-cream/10 px-4 py-3"
          >
            {editingId === player.id ? (
              <>
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') saveEdit(player.id)
                    if (e.key === 'Escape') cancelEdit()
                  }}
                  autoFocus
                  className="flex-1 px-2 py-0.5 font-mono text-sm bg-retro-dark border border-retro-cyan/50
                    text-retro-cream focus:outline-none focus:border-retro-cyan"
                />
                <button
                  onClick={() => saveEdit(player.id)}
                  className="font-mono text-xs text-retro-green hover:text-retro-green/70 transition-colors"
                >
                  Save
                </button>
                <button
                  onClick={cancelEdit}
                  className="font-mono text-xs text-retro-cream/40 hover:text-retro-cream/70 transition-colors"
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <span className="flex-1 font-mono text-sm text-retro-cream">{player.name}</span>
                <button
                  onClick={() => startEdit(player)}
                  className="font-mono text-xs text-retro-cyan/60 hover:text-retro-cyan transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => softDelete(player.id)}
                  className="font-mono text-xs text-retro-cream/30 hover:text-retro-pink transition-colors"
                >
                  Delete
                </button>
              </>
            )}
          </div>
        ))}
      </section>}

      {tab === 'players' && deleted.length > 0 && (
        <section className="flex flex-col gap-2">
          <button
            onClick={() => setShowDeleted((v) => !v)}
            className="flex items-center gap-2 font-mono text-retro-cream/40 text-xs tracking-widest
              hover:text-retro-cream/70 transition-colors self-start"
          >
            <span>{showDeleted ? '▾' : '▸'}</span>
            Deleted — {deleted.length}
          </button>
          {showDeleted && deleted.map((player) => (
            <div
              key={player.id}
              className="flex items-center gap-2 bg-retro-card border border-retro-cream/10 px-4 py-3 opacity-50"
            >
              <span className="flex-1 font-mono text-sm text-retro-cream line-through">
                {player.name}
              </span>
              <button
                onClick={() => restore(player.id)}
                className="font-mono text-xs text-retro-green/70 hover:text-retro-green transition-colors"
              >
                Restore
              </button>
            </div>
          ))}
        </section>
      )}

      {tab === 'sessions' && (
        <section className="flex flex-col gap-2">
          {sessions.length === 0 && (
            <p className="font-mono text-retro-cream/40 text-sm">No sessions.</p>
          )}
          {sessions.map((session) => (
            <div
              key={session.id}
              className="flex items-center gap-2 bg-retro-card border border-retro-cream/10 px-4 py-3"
            >
              <div className="flex-1 min-w-0">
                <span className="font-mono text-sm text-retro-cream">
                  {new Date(session.started_at).toLocaleDateString('en-US', {
                    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
                  })}
                </span>
                <span className="font-mono text-xs text-retro-cream/40 ml-2">
                  #{session.id} &middot; {session.mode}
                  {session.ended_at ? '' : ' \u2022 active'}
                </span>
              </div>
              {confirmDeleteSession === session.id ? (
                <>
                  <span className="font-mono text-xs text-retro-pink">Delete?</span>
                  <button
                    onClick={() => deleteSession(session.id)}
                    className="font-mono text-xs text-retro-pink hover:text-retro-pink/70 transition-colors"
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => setConfirmDeleteSession(null)}
                    className="font-mono text-xs text-retro-cream/40 hover:text-retro-cream/70 transition-colors"
                  >
                    No
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setConfirmDeleteSession(session.id)}
                  className="font-mono text-xs text-retro-cream/30 hover:text-retro-pink transition-colors"
                >
                  Delete
                </button>
              )}
            </div>
          ))}
        </section>
      )}
    </div>
  )
}
