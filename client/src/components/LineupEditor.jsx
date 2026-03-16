import { useState } from 'react'
import { logError } from '../lib/logError.js'
import AvatarPicker from './AvatarPicker'
import AvatarDisplay from './AvatarDisplay'
import ArcadeMatchup from './ArcadeMatchup'
import PlayerCard from './PlayerCard'
import { AVATAR_GALLERY } from '../data/avatars'

/**
 * Props:
 *   lineup: { team1: [player, player], team2: [player, player], bench: [player, ...] }
 *   sessionId: string
 *   onStart: (team1Ids, team2Ids) => void
 *   onAddPlayer: (player) => void  — called after late arrival is added to session
 */
function safePlayers(arr) {
  return Array.isArray(arr) ? arr.filter((p) => p != null) : []
}

export default function LineupEditor({ lineup, sessionId, onStart, onAddPlayer }) {
  const [team1, setTeam1] = useState(() => safePlayers(lineup?.team1))
  const [team2, setTeam2] = useState(() => safePlayers(lineup?.team2))
  const [bench, setBench] = useState(() => safePlayers(lineup?.bench))
  const [selected, setSelected] = useState(null) // { player, slot: 'team1'|'team2'|'bench' }

  const [showAddPlayer, setShowAddPlayer] = useState(false)
  const [allPlayers, setAllPlayers] = useState(null)
  const [newName, setNewName] = useState('')
  const [newAvatarId, setNewAvatarId] = useState(AVATAR_GALLERY[0]?.id ?? 'avatar_02')
  const [error, setError] = useState(null)

  function handleTap(player, slot) {
    if (!selected) {
      setSelected({ player, slot })
      return
    }

    // Tapping same player deselects
    if (selected.player.id === player.id) {
      setSelected(null)
      return
    }

    // Swap selected player with tapped player
    swap(selected.player, selected.slot, player, slot)
    setSelected(null)
  }

  function swap(playerA, slotA, playerB, slotB) {
    if (!playerA?.id || !playerB?.id) return
    const lists = { team1: [...team1], team2: [...team2], bench: [...bench] }

    const idxA = lists[slotA].findIndex((p) => p?.id === playerA.id)
    const idxB = lists[slotB].findIndex((p) => p?.id === playerB.id)
    if (idxA < 0 || idxB < 0) return

    lists[slotA][idxA] = playerB
    lists[slotB][idxB] = playerA

    setTeam1(lists.team1)
    setTeam2(lists.team2)
    setBench(lists.bench)
  }

  async function openAddPlayer() {
    if (!allPlayers) {
      try {
        const res = await fetch('/api/players')
        const players = await res.json()
        if (!res.ok) throw new Error(players.error ?? 'Failed to load players')
        // Filter out anyone already in the current lineup
        const inSession = new Set([...team1, ...team2, ...bench].filter((p) => p?.id).map((p) => p.id))
        setAllPlayers(players.filter((p) => !inSession.has(p.id)))
      } catch (err) {
        logError(err, { component: 'LineupEditor', action: 'openAddPlayer' })
        setError(err.message)
        return
      }
    }
    setShowAddPlayer(true)
  }

  async function addExistingPlayer(player) {
    try {
      const res = await fetch(`/api/sessions/${sessionId}/players`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId: player.id }),
      })
      const added = await res.json()
      if (!res.ok) throw new Error(added.error ?? 'Failed to add player')
      setError(null)
      setBench((prev) => [...prev, added])
      setAllPlayers((prev) => prev.filter((p) => p.id !== player.id))
      onAddPlayer(added)
    } catch (err) {
      logError(err, { component: 'LineupEditor', action: 'addExistingPlayer', sessionId })
      setError(err.message)
    }
  }

  async function addNewPlayer(e) {
    e.preventDefault()
    if (!newName.trim()) return

    try {
      // Create player
      const res1 = await fetch('/api/players', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName.trim(), avatar_id: newAvatarId }),
      })
      const player = await res1.json()
      if (!res1.ok) throw new Error(player.error ?? 'Failed to create player')

      // Add to session
      const res2 = await fetch(`/api/sessions/${sessionId}/players`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId: player.id }),
      })
      const added = await res2.json()
      if (!res2.ok) throw new Error(added.error ?? 'Failed to add player to session')

      setError(null)
      setBench((prev) => [...prev, player])
      setNewName('')
      setNewAvatarId(AVATAR_GALLERY[0]?.id ?? 'avatar_02')
      setShowAddPlayer(false)
      onAddPlayer(player)
    } catch (err) {
      logError(err, { component: 'LineupEditor', action: 'addNewPlayer', sessionId })
      setError(err.message)
    }
  }

  const isSelected = (player) => selected?.player.id === player.id
  const [expectedTeamSize] = useState(lineup.team1.length)
  const courtFull = team1.length === expectedTeamSize && team2.length === expectedTeamSize

  return (
    <div className="flex flex-col gap-6">
      <p className="font-mono text-retro-cream/50 text-xs tracking-widest">
        Tap a player to select, tap another to swap.
      </p>
      {error && (
        <p className="font-mono text-retro-pink text-sm" role="alert">{error}</p>
      )}

      <ArcadeMatchup
        team1={team1}
        team2={team2}
        onPlayerTap={handleTap}
        selectedPlayerId={selected?.player?.id}
      />

      {(bench.length > 0 || true) && (
        <div>
          <h3 className="font-mono text-retro-cream/50 text-xs tracking-widest mb-2">Bench</h3>
          <div className="flex flex-wrap gap-2">
            {bench.map((player) => (
              <PlayerChip
                key={player.id}
                player={player}
                slot="bench"
                isSelected={isSelected(player)}
                onTap={handleTap}
                accent="cream"
              />
            ))}
            <button
              onClick={openAddPlayer}
              className="px-3 py-1.5 font-mono text-xs text-retro-cyan/60 border border-retro-cyan/20
                hover:border-retro-cyan/50 hover:text-retro-cyan transition-colors"
            >
              + Add Player
            </button>
          </div>
        </div>
      )}

      {showAddPlayer && (
        <div className="bg-retro-card border border-retro-cyan/30 p-4 flex flex-col gap-3">
          <h3 className="font-mono text-retro-cyan text-xs tracking-widest">Create Player</h3>

          <form onSubmit={addNewPlayer} className="flex flex-col gap-3">
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="New player name"
              className="w-full px-3 py-1.5 font-mono text-sm bg-retro-dark border border-retro-cyan/30
                text-retro-cream placeholder:text-retro-cream/30 focus:outline-none focus:border-retro-cyan"
            />
            <div>
              <p className="font-mono text-retro-cream/40 text-xs mb-1">Pick avatar</p>
              <AvatarPicker selectedId={newAvatarId} onSelect={setNewAvatarId} />
            </div>
            <button
              type="submit"
              className="px-3 py-1.5 font-mono text-xs bg-retro-cyan text-retro-dark hover:bg-retro-cyan/80 transition-colors self-start"
            >
              Add
            </button>
          </form>

          {allPlayers && allPlayers.length > 0 && (
            <div>
              <p className="font-mono text-retro-cream/40 text-xs mb-2">Or pick existing:</p>
              <div className="flex flex-col gap-1 max-h-40 overflow-y-auto">
                {allPlayers.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => addExistingPlayer(p)}
                    className="flex items-center gap-2 text-left px-3 py-1.5 font-mono text-sm text-retro-cream/80
                      hover:text-retro-cream hover:bg-retro-cream/5 transition-colors"
                  >
                    <AvatarDisplay player={p} size={24} />
                    {p.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={() => setShowAddPlayer(false)}
            className="font-mono text-retro-cream/40 text-xs hover:text-retro-cream/70 self-start transition-colors"
          >
            Cancel
          </button>
        </div>
      )}

      <button
        onClick={() => onStart(team1.map((p) => p.id), team2.map((p) => p.id))}
        disabled={!courtFull}
        className="w-full py-4 font-display text-xl tracking-widest bg-retro-green text-retro-dark
          border-2 border-retro-green disabled:bg-retro-card disabled:border-retro-cream/20
          disabled:text-retro-cream/40 hover:enabled:bg-retro-dark hover:enabled:text-retro-green
          transition-all shadow-retro-glow disabled:shadow-none"
      >
        Start Game
      </button>
    </div>
  )
}

function PlayerChip({ player, slot, isSelected, onTap, accent }) {
  if (!player?.id) return null
  const base = 'w-20 h-20 p-0 border-2 transition-all cursor-pointer overflow-hidden rounded flex-shrink-0'
  const styles = {
    green: isSelected
      ? 'border-retro-green shadow-retro-glow ring-2 ring-retro-green'
      : 'border-retro-green/50 hover:border-retro-green bg-retro-card',
    cyan: isSelected
      ? 'border-retro-cyan ring-2 ring-retro-cyan'
      : 'border-retro-cyan/50 hover:border-retro-cyan bg-retro-card',
    cream: isSelected
      ? 'border-retro-cream ring-2 ring-retro-cream'
      : 'border-retro-cream/30 hover:border-retro-cream/50 bg-retro-card',
  }

  return (
    <button className={`${base} ${styles[accent]}`} onClick={() => onTap(player, slot)}>
      <PlayerCard player={player} className="w-full h-full" />
    </button>
  )
}
