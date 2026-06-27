import { buildFromTemplates, normalizePlayers, pickFrom } from './shared.js'

const ADJECTIVES = [
  'Spicy', 'Dill', 'Hot', 'Garlic', 'Crispy', 'Zesty', 'Smoky', 'Tangy',
  'Savory', 'Sweet', 'Sour', 'Pickled', 'Brined', 'Fermented', 'Toasted',
]

const NOUNS = [
  'Pickles', 'Chips', 'Peppers', 'Masters', 'Knots', 'Bites', 'Buns',
  'Relish', 'Brine', 'Jalapeños', 'Onions', 'Pretzels', 'Wings', 'Rolls',
]

const FOOD_PAIRS = [
  'Dill Chips', 'Garlic Knots', 'Hot Peppers', 'Spicy Pickles', 'Meatball Masters',
  'Pickle Relish', 'Brine Bros', 'Jalapeño Jacks', 'Onion Rings', 'Pretzel Pair',
  'Wing Warriors', 'Roll Squad', 'Chip Champions', 'Brine Brigade', 'Relish Rulers',
]

const THE_NOUNS = [
  'Garlic Knots', 'Spicy Pickles', 'Dill Dynasty', 'Hot Peppers', 'Pickle Parade',
  'Brine Brothers', 'Jalapeño Juggernauts', 'Onion Overlords', 'Pretzel Posse',
  'Wing Wizards', 'Roll Royalty', 'Chip Champs', 'Relish Regiment',
]

const TEMPLATES = [
  (seed) => `${pickFrom(seed, 'fo-adj', ADJECTIVES)} ${pickFrom(seed, 'fo-noun', NOUNS)}`,
  (seed) => pickFrom(seed, 'fo-pair', FOOD_PAIRS),
  (seed) => `The ${pickFrom(seed, 'fo-the', THE_NOUNS)}`,
  (seed) => `${pickFrom(seed, 'fo-chef', ['Chef', 'Master', 'Lord', 'Baron', 'Duke'])} ${pickFrom(seed, 'fo-dish', ['Pickles', 'Brine', 'Relish', 'Jalapeños', 'Garlic'])}`,
]

export function generateFoodTeamName(players, sessionId) {
  const { seed } = normalizePlayers(players, sessionId)
  return buildFromTemplates(seed, TEMPLATES)
}
