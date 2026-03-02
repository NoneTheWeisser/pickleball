import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function SessionSetup() {
  const navigate = useNavigate()
  const [allPlayers, setAllPlayers] = useState([])
  const [selected, setSelected] = useState([])
  const [newName, setNewName] = useState('')

  useEffect(() => {
    fetch('/api/players')
      .then((r) => r.json())
      .then(setAllPlayers)
  }, [])

  function togglePlayer(player) {
    setSelected((prev) =>
      prev.find((p) => p.id === player.id)
        ? prev.filter((p) => p.id !== player.id)
        : [...prev, player]
    )
  }

  async function addNewPlayer(e) {
    e.preventDefault()
    if (!newName.trim()) return
    const res = await fetch('/api/players', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName.trim() }),
    })
    const player = await res.json()
    setAllPlayers((prev) => [...prev, player])
    setSelected((prev) => [...prev, player])
    setNewName('')
  }

  async function startSession() {
    if (selected.length < 4) return
    const res = await fetch('/api/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerIds: selected.map((p) => p.id) }),
    })
    const session = await res.json()
    navigate(`/session/${session.id}/game`)
  }

  return (
    <div className="max-w-md mx-auto px-4 py-12 flex flex-col gap-8">
      <h2 className="text-2xl font-bold">Session Setup</h2>

      <section>
        <h3 className="text-sm uppercase tracking-widest text-gray-400 mb-3">Add New Player</h3>
        <form onSubmit={addNewPlayer} className="flex gap-2">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Name"
            className="flex-1 px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:border-green-500"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
          >
            Add
          </button>
        </form>
      </section>

      <section>
        <h3 className="text-sm uppercase tracking-widest text-gray-400 mb-3">
          Select Players ({selected.length} selected)
        </h3>
        <ul className="flex flex-col gap-2">
          {allPlayers.map((player) => {
            const isSelected = selected.find((p) => p.id === player.id)
            return (
              <li key={player.id}>
                <button
                  onClick={() => togglePlayer(player)}
                  className={`w-full text-left px-4 py-3 rounded-lg border transition-colors ${
                    isSelected
                      ? 'bg-green-500/20 border-green-500 text-white'
                      : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-500'
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
        disabled={selected.length < 4}
        className="w-full py-4 font-semibold bg-green-500 hover:bg-green-400 disabled:bg-gray-700 disabled:text-gray-500 rounded-xl transition-colors"
      >
        Start Game{selected.length < 4 ? ` (need ${4 - selected.length} more)` : ''}
      </button>
    </div>
  )
}
