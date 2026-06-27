/** Max chars for solo team labels (truncated first name). */
export const TEAM_NAME_MAX_LENGTH = 7

export function hashSeed(str) {
  let h = 0
  for (let i = 0; i < str.length; i++) {
    h = (h * 31 + str.charCodeAt(i)) >>> 0
  }
  return h
}

export function firstToken(name) {
  return (name ?? '').trim().split(/\s+/)[0] || 'Player'
}

export function titleCase(str) {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

export function buildTeamSeed(sorted, sessionId) {
  const playerKey = sorted.map((p) => p.id).join('-')
  return sessionId != null ? `${sessionId}:${playerKey}` : playerKey
}

export function normalizePlayers(players, sessionId) {
  const roster = (players ?? []).filter(Boolean)
  if (roster.length === 0) return null

  const sorted = [...roster].sort((a, b) => a.id - b.id)
  return {
    sorted,
    seed: buildTeamSeed(sorted, sessionId),
    names: sorted.map((p) => p.name),
  }
}

export function pickFrom(seed, salt, items) {
  return items[hashSeed(`${seed}:${salt}`) % items.length]
}

export function buildFromTemplates(seed, templates) {
  return pickFrom(seed, 'template', templates)(seed)
}

export function singlePlayerName(name) {
  return titleCase(firstToken(name).slice(0, TEAM_NAME_MAX_LENGTH))
}
