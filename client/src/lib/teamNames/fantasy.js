import { buildFromTemplates, normalizePlayers, pickFrom } from './shared.js'

const ADJECTIVES = [
  'Court', 'Dill', 'Paddle', 'Kitchen', 'Net', 'Baseline', 'Spinning', 'Golden',
  'Shadow', 'Crystal', 'Iron', 'Storm', 'Mystic', 'Ancient', 'Radiant',
]

const NOUNS = [
  'Wizards', 'Dragons', 'Paladins', 'Knights', 'Guardians', 'Rangers', 'Mages',
  'Sentinels', 'Champions', 'Warlocks', 'Sorcerers', 'Enchanters', 'Heroes',
  'Legends', 'Seekers',
]

const THE_NOUNS = [
  'Net Guardians', 'Kitchen Knights', 'Paddle Paladins', 'Court Wizards',
  'Dill Dragons', 'Baseline Bards', 'Spin Sorcerers', 'Smash Sentinels',
  'Rally Rangers', 'Dink Defenders', 'Lob Legion', 'Erne Enchanters',
]

const ORDERS = [
  'Order', 'Brotherhood', 'Covenant', 'Circle', 'Guild', 'Alliance',
  'Conclave', 'Assembly', 'Legion', 'Fellowship', 'Syndicate', 'Collective',
]

const TEMPLATES = [
  (seed) => `${pickFrom(seed, 'f-adj', ADJECTIVES)} ${pickFrom(seed, 'f-noun', NOUNS)}`,
  (seed) => `The ${pickFrom(seed, 'f-the', THE_NOUNS)}`,
  (seed) => `${pickFrom(seed, 'f-order-noun', NOUNS)} ${pickFrom(seed, 'f-order', ORDERS)}`,
  (seed) => `${pickFrom(seed, 'f-prefix', ['The', 'Order of the', 'Keepers of the'])} ${pickFrom(seed, 'f-epic', ['Sacred Paddle', 'Golden Kitchen', 'Eternal Net', 'Dill Crown', 'Third Shot'])}`,
]

export function generateFantasyTeamName(players, sessionId) {
  const { seed } = normalizePlayers(players, sessionId)
  return buildFromTemplates(seed, TEMPLATES)
}
