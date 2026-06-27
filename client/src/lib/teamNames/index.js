import { generateAnimalsTeamName } from './animals.js'
import {
  formatTeamLabel,
  generateBlendTeamName,
  pronounceabilityScore,
  TEAM_NAME_MAX_LENGTH,
  TEAM_NAME_MAX_REAL,
  TEAM_NAME_MIN_LENGTH,
} from './blend.js'
import { generateCorporateTeamName } from './corporate.js'
import { generateFantasyTeamName } from './fantasy.js'
import { generateFoodTeamName } from './food.js'
import { generateSportsTeamName } from './sports.js'
import { normalizePlayers, singlePlayerName } from './shared.js'

const STYLES = {
  blend: generateBlendTeamName,
  sports: generateSportsTeamName,
  corporate: generateCorporateTeamName,
  fantasy: generateFantasyTeamName,
  food: generateFoodTeamName,
  animals: generateAnimalsTeamName,
}

export function generateTeamName(players, style = 'blend', sessionId) {
  const normalized = normalizePlayers(players, sessionId)
  if (!normalized) return null

  const { sorted, names } = normalized
  if (sorted.length === 1) return singlePlayerName(names[0])

  const generator = STYLES[style] ?? STYLES.blend
  return generator(players, sessionId)
}

export {
  formatTeamLabel,
  pronounceabilityScore,
  TEAM_NAME_MIN_LENGTH,
  TEAM_NAME_MAX_LENGTH,
  TEAM_NAME_MAX_REAL,
}

export const TEAM_NAME_STYLES = Object.keys(STYLES)
