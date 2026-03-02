import { useState, useEffect, useRef } from 'react'

const SCORE_RE = /^\d+$/

function validateScore(s1, s2) {
  const a = parseInt(s1)
  const b = parseInt(s2)
  if (isNaN(a) || isNaN(b)) return 'Enter both scores'
  if (a < 0 || b < 0) return 'Scores must be positive'
  if (a === b) return 'Scores cannot be tied'
  const winner = Math.max(a, b)
  const loser = Math.min(a, b)
  if (winner < 11) return 'Winning score must be at least 11'
  if (winner - loser < 2) return 'Must win by 2'
  return null
}

export function formatSessionDate(dateStr) {
  const date = new Date(dateStr)
  const month = date.toLocaleDateString('en-US', { month: 'long', timeZone: 'UTC' })
  const day = date.getUTCDate()
  const suffix =
    day >= 11 && day <= 13 ? 'th'
    : day % 10 === 1 ? 'st'
    : day % 10 === 2 ? 'nd'
    : day % 10 === 3 ? 'rd'
    : 'th'
  return `${month} ${day}${suffix} Games`
}

export default function SessionPanel({ sessionId, sessionDate, open, onClose, onScoreEdited }) {
  const [games, setGames] = useState([])
  const panelRef = useRef(null)

  useEffect(() => {
    if (!open) return
    fetch(`/api/sessions/${sessionId}/games`)
      .then((r) => r.json())
      .then(setGames)
  }, [open, sessionId])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    function onKey(e) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  // Refresh when opened
  function refresh() {
    fetch(`/api/sessions/${sessionId}/games`)
      .then((r) => r.json())
      .then(setGames)
  }

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-retro-dark/60 z-40"
          onClick={onClose}
        />
      )}

      {/* Panel */}
      <div
        ref={panelRef}
        className={`fixed top-0 right-0 h-full w-full sm:w-80 bg-retro-card border-l-2 border-retro-cyan/30
          z-50 flex flex-col transition-transform duration-300 ease-in-out
          ${open ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-retro-cream/10">
          <div>
            <p className="font-mono text-retro-cyan text-xs tracking-widest">
              {sessionDate ? formatSessionDate(sessionDate) : 'This Session'}
            </p>
            <p className="font-mono text-retro-cream/50 text-xs">{games.length} game{games.length !== 1 ? 's' : ''}</p>
          </div>
          <button
            onClick={onClose}
            className="font-mono text-retro-cream/40 hover:text-retro-cream transition-colors text-sm"
          >
            [ × ]
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3">
          {games.length === 0 && (
            <p className="font-mono text-retro-cream/30 text-xs">No games yet.</p>
          )}
          {games.map((game) => (
            <GameRow
              key={game.id}
              game={game}
              onSaved={() => {
                refresh()
                onScoreEdited?.()
              }}
            />
          ))}
        </div>
      </div>
    </>
  )
}

function GameRow({ game, onSaved }) {
  const [editing, setEditing] = useState(false)
  const [s1, setS1] = useState('')
  const [s2, setS2] = useState('')
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)

  const isLive = !game.ended_at
  const team1 = game.players.filter((p) => p.team === 1)
  const team2 = game.players.filter((p) => p.team === 2)

  function startEdit() {
    setS1(game.score_team1 ?? '')
    setS2(game.score_team2 ?? '')
    setError(null)
    setEditing(true)
  }

  function cancelEdit() {
    setEditing(false)
    setError(null)
  }

  async function saveEdit() {
    const err = validateScore(s1, s2)
    if (err) return setError(err)
    setSaving(true)
    const res = await fetch(`/api/games/${game.id}/score`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ score_team1: parseInt(s1), score_team2: parseInt(s2) }),
    })
    const data = await res.json()
    setSaving(false)
    if (!res.ok) return setError(data.error)
    setEditing(false)
    setError(null)
    onSaved()
  }

  return (
    <div className={`border p-3 flex flex-col gap-2 ${isLive ? 'border-retro-green/40 bg-retro-green/5' : 'border-retro-cream/10 bg-retro-dark/40'}`}>
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs text-retro-cream/50">Game {game.game_number}</span>
        {isLive ? (
          <span className="font-mono text-xs text-retro-green tracking-widest animate-pulse">LIVE</span>
        ) : (
          !editing && (
            <button
              onClick={startEdit}
              className="font-mono text-xs text-retro-cyan/50 hover:text-retro-cyan transition-colors"
            >
              Edit
            </button>
          )
        )}
      </div>

      <div className="flex flex-col gap-1">
        <TeamLine players={team1} accent="green" />
        <TeamLine players={team2} accent="cyan" />
      </div>

      {editing ? (
        <div className="flex flex-col gap-2 pt-1 border-t border-retro-cream/10">
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={s1}
              onChange={(e) => setS1(e.target.value)}
              placeholder="T1"
              min="0"
              className="w-12 px-1 py-0.5 font-mono text-xs text-center bg-retro-dark border
                border-retro-green/50 text-retro-cream focus:outline-none focus:border-retro-green"
            />
            <span className="font-mono text-retro-pink text-xs">–</span>
            <input
              type="number"
              value={s2}
              onChange={(e) => setS2(e.target.value)}
              placeholder="T2"
              min="0"
              className="w-12 px-1 py-0.5 font-mono text-xs text-center bg-retro-dark border
                border-retro-cyan/50 text-retro-cream focus:outline-none focus:border-retro-cyan"
            />
            <button
              onClick={saveEdit}
              disabled={saving}
              className="font-mono text-xs text-retro-green hover:text-retro-green/70 transition-colors ml-1"
            >
              {saving ? '...' : 'Save'}
            </button>
            <button
              onClick={cancelEdit}
              className="font-mono text-xs text-retro-cream/30 hover:text-retro-cream/60 transition-colors"
            >
              Cancel
            </button>
          </div>
          {error && <p className="font-mono text-retro-pink text-xs">{error}</p>}
        </div>
      ) : (
        !isLive && (
          <p className="font-mono text-retro-cream text-sm font-medium">
            {game.score_team1}
            <span className="text-retro-pink mx-1">–</span>
            {game.score_team2}
          </p>
        )
      )}
    </div>
  )
}

function TeamLine({ players, accent }) {
  const color = accent === 'cyan' ? 'text-retro-cyan/70' : 'text-retro-green/70'
  return (
    <p className={`font-mono text-xs ${color}`}>
      {players.map((p) => p.name).join(' & ')}
    </p>
  )
}
