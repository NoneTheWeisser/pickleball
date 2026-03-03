import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { logError } from '../lib/logError.js'
import LoadingScreen from '../components/LoadingScreen'

function KpiCard({ label, name, stat, color }) {
  const colorClass = {
    gold: 'border-retro-gold text-retro-gold',
    cyan: 'border-retro-cyan text-retro-cyan',
    green: 'border-retro-green text-retro-green',
    pink: 'border-retro-pink text-retro-pink',
  }[color] ?? 'border-retro-cream text-retro-cream'

  return (
    <div className={`bg-retro-card border-2 ${colorClass} p-4 flex flex-col gap-1 min-w-0`}>
      <p className="font-mono text-retro-cream/50 text-[10px] tracking-widest uppercase">{label}</p>
      <p className={`font-display text-xl tracking-wider truncate ${colorClass.split(' ')[1]}`}>{name}</p>
      <p className="font-mono text-retro-cream/70 text-sm">{stat}</p>
    </div>
  )
}

function formatStreak(currentStreak) {
  if (currentStreak > 0) return `${currentStreak}W`
  if (currentStreak < 0) return `${Math.abs(currentStreak)}L`
  return '—'
}

const MODES = [
  { key: 'team', label: 'Co-Op Battle' },
  { key: 'duel', label: 'Head to Head' },
]

export default function Leaderboard() {
  const navigate = useNavigate()
  const [mode, setMode] = useState('team')
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    setData(null)
    setError(null)
    fetch(`/api/leaderboard?mode=${mode}`)
      .then((r) => {
        if (!r.ok) throw new Error('Failed to load leaderboard')
        return r.json()
      })
      .then(setData)
      .catch((err) => {
        logError(err, { component: 'Leaderboard', action: 'load' })
        setError(err.message)
      })
  }, [mode])

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 px-4">
        <p className="font-mono text-retro-pink text-center" role="alert">{error}</p>
        <button
          onClick={() => navigate('/')}
          className="font-mono text-retro-cyan/80 text-sm tracking-wider hover:text-retro-cyan"
        >
          ← Back
        </button>
      </div>
    )
  }

  if (!data) {
    return <LoadingScreen />
  }

  const { kpis, players } = data
  const hasData = players.length > 0

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 flex flex-col gap-8">
      <div className="flex items-start gap-4">
        <button
          onClick={() => navigate('/')}
          className="font-mono text-retro-cyan/80 text-sm tracking-wider hover:text-retro-cyan mt-1"
        >
          ←
        </button>
        <div>
          <p className="font-mono text-retro-cyan text-xs tracking-[0.3em] mb-1">ALL-TIME</p>
          <h1 className="font-display text-5xl tracking-widest text-retro-cream uppercase">
            High Scores
          </h1>
        </div>
      </div>

      <div className="flex border-b border-retro-cream/10">
        {MODES.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setMode(key)}
            className={`font-mono text-xs tracking-widest px-4 py-2 border-b-2 transition-colors ${
              mode === key
                ? 'border-retro-cyan text-retro-cyan'
                : 'border-transparent text-retro-cream/40 hover:text-retro-cream/70'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {!hasData ? (
        <p className="font-mono text-retro-cream/50 text-sm tracking-wider">
          No games played yet.
        </p>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {kpis.allTimeWinner ? (
              <KpiCard
                label="All-Time Winner"
                name={kpis.allTimeWinner.name}
                stat={`${kpis.allTimeWinner.wins} wins · ${kpis.allTimeWinner.winPct}%`}
                color="gold"
              />
            ) : null}
            {kpis.hotStreak ? (
              <KpiCard
                label="Hot Streak"
                name={kpis.hotStreak.name}
                stat={`${kpis.hotStreak.currentStreak}W streak`}
                color="cyan"
              />
            ) : null}
            {kpis.mostImproved ? (
              <KpiCard
                label="Most Improved"
                name={kpis.mostImproved.name}
                stat={`${kpis.mostImproved.improvement > 0 ? '+' : ''}${kpis.mostImproved.improvement}% recent`}
                color="green"
              />
            ) : null}
            {kpis.longestGame ? (
              <KpiCard
                label="Longest Game"
                name={`${kpis.longestGame.durationMin} min`}
                stat={`${kpis.longestGame.score} · ${kpis.longestGame.team1.join(' & ')} vs ${kpis.longestGame.team2.join(' & ')}`}
                color="pink"
              />
            ) : null}
          </div>

          {/* Table */}
          <section>
            <table className="w-full border-collapse font-mono text-sm">
              <thead>
                <tr className="bg-retro-cyan/20 text-retro-cyan text-xs tracking-widest">
                  <th className="text-left py-2 px-3">#</th>
                  <th className="text-left py-2 px-3">Player</th>
                  <th className="text-right py-2 px-3">W</th>
                  <th className="text-right py-2 px-3">L</th>
                  <th className="text-right py-2 px-3">Win%</th>
                  <th className="text-right py-2 px-3">Streak</th>
                </tr>
              </thead>
              <tbody>
                {players.map((p, i) => {
                  const isTop = i === 0
                  return (
                    <tr
                      key={p.id}
                      className={`border-b transition-colors ${
                        isTop
                          ? 'border-retro-gold/40 bg-retro-gold/10 text-retro-gold'
                          : 'border-retro-cream/10 text-retro-cream hover:bg-retro-card'
                      }`}
                    >
                      <td className="py-2 px-3 text-retro-cream/40">{i + 1}</td>
                      <td className={`py-2 px-3 font-display tracking-wide ${isTop ? 'text-retro-gold' : ''}`}>
                        {p.name}
                      </td>
                      <td className="py-2 px-3 text-right">{p.wins}</td>
                      <td className="py-2 px-3 text-right text-retro-cream/60">{p.losses}</td>
                      <td className="py-2 px-3 text-right">{p.winPct}%</td>
                      <td className={`py-2 px-3 text-right ${
                        p.currentStreak > 0 ? 'text-retro-green' : p.currentStreak < 0 ? 'text-retro-pink' : 'text-retro-cream/30'
                      }`}>
                        {formatStreak(p.currentStreak)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </section>
        </>
      )}
    </div>
  )
}
