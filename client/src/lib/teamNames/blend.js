import { isRealFirstName } from '../../data/firstNames.js'
import {
  hashSeed,
  firstToken,
  titleCase as toDisplayName,
  normalizePlayers,
  TEAM_NAME_MAX_LENGTH,
} from './shared.js'

/** Min/max chars for team labels in ArcadeMatchup. */
export const TEAM_NAME_MIN_LENGTH = 4
export { TEAM_NAME_MAX_LENGTH }
/** Longer cap when the mashup is a real first name (e.g. Christina). */
export const TEAM_NAME_MAX_REAL = 10

/** Weight applied to pronounceabilityScore inside blend ranking. */
const PRONOUNCEABILITY_WEIGHT = 2.5
/** Bonus when the blend exactly matches a real first name. */
const REAL_NAME_BONUS = 45

const VOWELS = new Set('aeiou')

/** Common English bigrams — higher = more natural sounding. */
const BIGRAM_SCORES = {
  th: 3, he: 3, in: 3, er: 3, an: 3, re: 3, on: 3, at: 3, en: 3, nd: 3,
  st: 3, or: 3, te: 3, es: 3, ed: 3, is: 3, it: 3, al: 3, ar: 3, le: 3,
  ou: 3, to: 3, ra: 3, ri: 3, ro: 3, li: 2, ll: 2, ma: 2, me: 2, mi: 2,
  mo: 2, na: 2, ne: 2, ni: 2, no: 2, ny: 2, ie: 2, el: 2, em: 2, ay: 2,
  ey: 2, dy: 2, ty: 2, ke: 2, br: 2, ad: 2, ch: 2, ve: 2,
  ta: 2, ob: 2, jo: 2, sa: 2, ah: 2, ly: 2,
  sr: 0, dl: 0, kl: 0, nn: 1, rr: 1, tt: 1, bb: 1, ck: 1, gh: 1,
}

/** Snappy short words / in-jokes (not always real names). */
const KNOWN_WORDS = new Set([
  'stannie', 'miley', 'toben', 'chalex', 'lick', 'mash', 'dash', 'bash',
  'rock', 'dock', 'kick', 'pick', 'sick',
])

function isVowel(c) {
  return VOWELS.has(c)
}

function scoreBigrams(combo) {
  if (combo.length < 2) return 0
  let total = 0
  for (let i = 0; i < combo.length - 1; i++) {
    total += BIGRAM_SCORES[combo.slice(i, i + 2)] ?? 1
  }
  const avg = total / (combo.length - 1)
  return Math.min(10, avg * 3.2)
}

export function pronounceabilityScore(combo) {
  let score = scoreBigrams(combo)

  let consonantRun = 0
  let maxConsonantRun = 0
  let vowelRun = 0
  let maxVowelRun = 0

  for (const c of combo) {
    if (!isVowel(c)) {
      consonantRun++
      vowelRun = 0
      maxConsonantRun = Math.max(maxConsonantRun, consonantRun)
    } else {
      vowelRun++
      consonantRun = 0
      maxVowelRun = Math.max(maxVowelRun, vowelRun)
    }
  }

  if (maxConsonantRun >= 3) score -= (maxConsonantRun - 2) * 3.5
  if (maxVowelRun >= 3) score -= (maxVowelRun - 2) * 2
  if (![...combo].some(isVowel)) score -= 10

  if (KNOWN_WORDS.has(combo) || isRealFirstName(combo)) score += 5

  return Math.max(0, Math.min(10, score))
}

function scoreCombo(combo, i, j, a, b) {
  const prefix = a.slice(0, i)
  const suffix = b.slice(j)
  const isReal = isRealFirstName(combo)
  const maxLen = isReal ? TEAM_NAME_MAX_REAL : TEAM_NAME_MAX_LENGTH
  let score = 0
  const pron = pronounceabilityScore(combo)

  if (combo.length < TEAM_NAME_MIN_LENGTH || combo.length > maxLen) return -100

  if (suffix.length === 1 && suffix !== b.slice(0, 1)) return -100

  score += 10

  if (isReal) score += REAL_NAME_BONUS

  const punchyFourLetter =
    !isReal &&
    combo.length === 4 &&
    prefix.length >= 2 &&
    suffix.length >= 2 &&
    (KNOWN_WORDS.has(combo) || pron >= 8)

  if (punchyFourLetter) score += 16
  else if (!isReal && combo.length >= 5 && combo.length <= 6) score += 3

  if (i === 1 && j === 0) score += 8
  else if (prefix.length >= 2 && suffix.length >= 3) {
    score += 15
  } else if (prefix.length >= 2 && suffix.length >= 2) {
    score += combo.length === 4 ? 10 : 6
  } else if (i === 1 && j > 0) {
    score += 4
  } else if (isReal && i === a.length && j === 0) {
    score += 12
  } else {
    score -= 12
  }

  const suffixRatio = suffix.length / b.length
  if (suffixRatio >= 0.5) score += 8
  else if (suffixRatio >= 0.35) score += 3
  else score -= 8

  score -= combo.length * (isReal ? 0.6 : 1.2)
  if (!isReal && combo.length >= 6) score -= 5

  if (prefix.length > 0 && suffix.length > 0 && prefix.at(-1) === suffix[0]) {
    score -= 5
  }

  if (j > 0 && !combo.includes(b[0])) score -= 6

  if (j === 0) score += 1
  else if (j >= 2) score -= combo.length <= 4 ? (j - 1) * 2 : (j - 1) * 5

  score += pron * PRONOUNCEABILITY_WEIGHT

  return score
}

/** Jo + Lynn → Jocelyn (not reachable via prefix+suffix slice alone). */
function scorePhoneticRealName(combo, a, b) {
  if (!isRealFirstName(combo)) return -100
  if (combo.length < TEAM_NAME_MIN_LENGTH || combo.length > TEAM_NAME_MAX_REAL) return -100

  let score = 10 + REAL_NAME_BONUS
  score += pronounceabilityScore(combo) * PRONOUNCEABILITY_WEIGHT
  return score
}

function extraRealNameCandidates(a, b) {
  const extras = []
  if (a.startsWith('jo') && b.startsWith('lyn')) {
    extras.push('jocelyn')
  }
  return extras
}

function portmanteau(nameA, nameB, seed) {
  const a = firstToken(nameA).toLowerCase()
  const b = firstToken(nameB).toLowerCase()
  const candidates = []

  for (let i = 1; i <= a.length; i++) {
    for (let j = 0; j < b.length; j++) {
      const combo = a.slice(0, i) + b.slice(j)
      const score = scoreCombo(combo, i, j, a, b)
      if (score > 0) candidates.push({ combo, score })
    }
  }

  for (const combo of extraRealNameCandidates(a, b)) {
    const score = scorePhoneticRealName(combo, a, b)
    if (score > 0) candidates.push({ combo, score })
  }

  if (candidates.length === 0) {
    return toDisplayName(`${a.slice(0, 3)}${b.slice(0, 3)}`.slice(0, TEAM_NAME_MAX_LENGTH))
  }

  candidates.sort((x, y) => y.score - x.score)
  const topScore = candidates[0].score
  const top = candidates.filter((c) => c.score >= topScore - 1)
  return toDisplayName(top[hashSeed(seed) % top.length].combo)
}

export function generateBlendTeamName(players, sessionId) {
  const normalized = normalizePlayers(players, sessionId)
  const { seed, names } = normalized
  return portmanteau(names[0], names[1], seed)
}

export function formatTeamLabel(name, maxLength = TEAM_NAME_MAX_REAL) {
  if (!name) return null
  const upper = name.toUpperCase()
  if (upper.length <= maxLength) return upper
  return `${upper.slice(0, maxLength - 1)}…`
}
