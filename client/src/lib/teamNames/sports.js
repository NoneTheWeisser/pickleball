import { buildFromTemplates, normalizePlayers, pickFrom } from './shared.js'

const ADJECTIVES = [
  'Kitchen', 'Net', 'Paddle', 'Dink', 'Baseline', 'Golden', 'Swift', 'Royal',
  'Midcourt', 'Smash', 'Spin', 'Ace', 'Rally', 'Power', 'Prime', 'Elite',
]

const NOUNS = [
  'Kings', 'Titans', 'Legends', 'Champions', 'Warriors', 'Strikers', 'Aces',
  'Rockets', 'Panthers', 'Wolves', 'Hawks', 'Storm', 'Thunder', 'Blaze', 'Force',
]

const TERMS = [
  'Drop Shot', 'Third Shot', 'Kitchen', 'Baseline', 'Net', 'Paddle', 'Dink',
  'Lob', 'Volley', 'Serve', 'Smash', 'Spin', 'Rally', 'Erne', 'Poach',
]

const GROUPS = [
  'Duo', 'Squad', 'Crew', 'Unit', 'Pair', 'Team', 'Alliance', 'Syndicate',
  'Collective', 'Brigade', 'Corps', 'Force', 'Guild', 'League', 'Club',
]

const EPITHETS = [
  'Net Ninjas', 'Paddle Pirates', 'Kitchen Kings', 'Dink Dynasty',
  'Drop Shot Demons', 'Third Shot Titans', 'Baseline Bandits', 'Smash Society',
  'Spin Syndicate', 'Rally Raiders', 'Ace Avengers', 'Poach Patrol',
]

const VERBS = [
  'Dinking', 'Smashing', 'Spinning', 'Serving', 'Volleying', 'Poaching',
  'Rallying', 'Lobbing', 'Erne-ing', 'Banging', 'Flicking', 'Resetting',
]

const TARGETS = [
  'Dynasty', 'Empire', 'Regime', 'Order', 'League', 'Circuit', 'Circuit',
  'Division', 'Federation', 'Consortium', 'Cartel', 'Syndicate', 'Monarchy',
]

const TEMPLATES = [
  (seed) => `${pickFrom(seed, 's-adj', ADJECTIVES)} ${pickFrom(seed, 's-noun', NOUNS)}`,
  (seed) => `${pickFrom(seed, 's-term', TERMS)} ${pickFrom(seed, 's-group', GROUPS)}`,
  (seed) => `The ${pickFrom(seed, 's-the', EPITHETS)}`,
  (seed) => `${pickFrom(seed, 's-verb', VERBS)} ${pickFrom(seed, 's-target', TARGETS)}`,
]

export function generateSportsTeamName(players, sessionId) {
  const { seed } = normalizePlayers(players, sessionId)
  return buildFromTemplates(seed, TEMPLATES)
}
