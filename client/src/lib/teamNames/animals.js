import { buildFromTemplates, normalizePlayers, pickFrom } from './shared.js'

const ADJECTIVES = [
  'Paddle', 'Dinking', 'Kitchen', 'Lobster', 'Court', 'Baseline', 'Spinning',
  'Smashing', 'Net', 'Rally', 'Poaching', 'Golden', 'Swift', 'Mighty',
]

const ANIMALS = [
  'Pandas', 'Ducks', 'Kangaroos', 'Lobbers', 'Coyotes', 'Otters', 'Badgers',
  'Falcons', 'Bears', 'Wolves', 'Foxes', 'Hawks', 'Tigers', 'Lions', 'Sharks',
]

const VERBS = [
  'Dinking', 'Smashing', 'Spinning', 'Poaching', 'Lobbing', 'Rallying',
  'Serving', 'Volleying', 'Banging', 'Flicking', 'Resetting', 'Erne-ing',
]

const NOUNS = [
  'Pandas', 'Ducks', 'Kangaroos', 'Coyotes', 'Otters', 'Badgers', 'Falcons',
  'Bears', 'Wolves', 'Foxes', 'Hawks', 'Tigers', 'Lions', 'Sharks', 'Eagles',
]

const THE_ANIMALS = [
  'Paddle Pandas', 'Dinking Ducks', 'Kitchen Kangaroos', 'Lobster Lobbers',
  'Court Coyotes', 'Net Narwhals', 'Baseline Badgers', 'Spinning Sharks',
  'Smash Squirrels', 'Rally Raccoons', 'Poach Penguins', 'Erne Emus',
]

const TEMPLATES = [
  (seed) => `${pickFrom(seed, 'a-adj', ADJECTIVES)} ${pickFrom(seed, 'a-animal', ANIMALS)}`,
  (seed) => `${pickFrom(seed, 'a-verb', VERBS)} ${pickFrom(seed, 'a-noun', NOUNS)}`,
  (seed) => `The ${pickFrom(seed, 'a-the', THE_ANIMALS)}`,
  (seed) => `${pickFrom(seed, 'a-pack', ['Pack of', 'Pride of', 'Pod of', 'Murder of'])} ${pickFrom(seed, 'a-pack-noun', NOUNS)}`,
]

export function generateAnimalsTeamName(players, sessionId) {
  const { seed } = normalizePlayers(players, sessionId)
  return buildFromTemplates(seed, TEMPLATES)
}
