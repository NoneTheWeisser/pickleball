import { buildFromTemplates, normalizePlayers, pickFrom } from './shared.js'

const TERMS = [
  'Paddle', 'Court', 'Kitchen', 'Dink', 'Net', 'Pickle', 'Baseline', 'Rally',
  'Serve', 'Volley', 'Smash', 'Spin', 'Lob', 'Erne', 'Poach',
]

const SUFFIXES = [
  'Consulting', 'Logistics', 'Solutions', 'Enterprises', 'Management',
  'Partners', 'Associates', 'Holdings', 'Group', 'Systems', 'Services',
  'Industries', 'Ventures', 'Advisors', 'Resources',
]

const DEPARTMENTS = [
  'Operations', 'Strategy', 'Analytics', 'Compliance', 'Procurement',
  'Integration', 'Optimization', 'Enablement', 'Governance', 'Outreach',
  'Development', 'Innovation', 'Performance', 'Excellence', 'Alignment',
]

const LLC_SUFFIX = ['', ' LLC']

const TEMPLATES = [
  (seed) => `${pickFrom(seed, 'c-term', TERMS)} ${pickFrom(seed, 'c-suffix', SUFFIXES)}`,
  (seed) => `${pickFrom(seed, 'c-term2', TERMS)} ${pickFrom(seed, 'c-dept', DEPARTMENTS)}`,
  (seed) =>
    `${pickFrom(seed, 'c-term3', TERMS)} ${pickFrom(seed, 'c-partner', ['Partners', 'Associates', 'Holdings'])}${pickFrom(seed, 'c-llc', LLC_SUFFIX)}`,
  (seed) => `${pickFrom(seed, 'c-term4', TERMS)} & ${pickFrom(seed, 'c-term5', TERMS)} ${pickFrom(seed, 'c-co', ['Co.', 'Inc.', 'Ltd.'])}`,
]

export function generateCorporateTeamName(players, sessionId) {
  const { seed } = normalizePlayers(players, sessionId)
  return buildFromTemplates(seed, TEMPLATES)
}
