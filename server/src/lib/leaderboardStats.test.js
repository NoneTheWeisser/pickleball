import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { computePlayerStats, winningestPairs } from './leaderboardStats.js'

function game({ wasWinner, team, scoreTeam1, scoreTeam2 }) {
  return { wasWinner, team, scoreTeam1, scoreTeam2 }
}

describe('computePlayerStats', () => {
  it('counts team 1 points for as score_team1 and points against as score_team2', () => {
    const stats = computePlayerStats([
      game({ wasWinner: true, team: 1, scoreTeam1: 11, scoreTeam2: 7 }),
    ])
    assert.equal(stats.pointsFor, 11)
    assert.equal(stats.pointsAgainst, 7)
  })

  it('reverses the two scores for team 2', () => {
    const stats = computePlayerStats([
      game({ wasWinner: false, team: 2, scoreTeam1: 11, scoreTeam2: 9 }),
    ])
    assert.equal(stats.pointsFor, 9)
    assert.equal(stats.pointsAgainst, 11)
  })

  it('sums points across games', () => {
    const stats = computePlayerStats([
      game({ wasWinner: true, team: 1, scoreTeam1: 11, scoreTeam2: 7 }),
      game({ wasWinner: true, team: 2, scoreTeam1: 9, scoreTeam2: 11 }),
    ])
    assert.equal(stats.pointsFor, 22)
    assert.equal(stats.pointsAgainst, 16)
    assert.equal(stats.totalGames, 2)
    assert.equal(stats.wins, 2)
    assert.equal(stats.losses, 0)
  })

  it('sets plus-minus to points for minus points against, including a negative result', () => {
    const stats = computePlayerStats([
      game({ wasWinner: false, team: 2, scoreTeam1: 11, scoreTeam2: 3 }),
    ])
    assert.equal(stats.pointsFor, 3)
    assert.equal(stats.pointsAgainst, 11)
    assert.equal(stats.plusMinus, -8)
  })

  it('walks the current streak backward from the latest game and stops at a different outcome', () => {
    const stats = computePlayerStats([
      game({ wasWinner: true, team: 1, scoreTeam1: 11, scoreTeam2: 5 }),
      game({ wasWinner: false, team: 1, scoreTeam1: 8, scoreTeam2: 11 }),
      game({ wasWinner: false, team: 2, scoreTeam1: 11, scoreTeam2: 6 }),
      game({ wasWinner: false, team: 1, scoreTeam1: 9, scoreTeam2: 11 }),
    ])
    assert.equal(stats.currentStreak, -3)
    assert.equal(stats.wins, 1)
    assert.equal(stats.losses, 3)
    assert.equal(stats.winPct, 25)
  })

  it('leaves improvement null under 5 games', () => {
    const stats = computePlayerStats([
      game({ wasWinner: true, team: 1, scoreTeam1: 11, scoreTeam2: 0 }),
      game({ wasWinner: true, team: 1, scoreTeam1: 11, scoreTeam2: 0 }),
      game({ wasWinner: false, team: 1, scoreTeam1: 0, scoreTeam2: 11 }),
      game({ wasWinner: true, team: 1, scoreTeam1: 11, scoreTeam2: 0 }),
    ])
    assert.equal(stats.improvement, null)
  })

  it('sets improvement to the recent-5 win rate minus the overall win rate, in rounded percentage points', () => {
    const games = [
      game({ wasWinner: false, team: 1, scoreTeam1: 5, scoreTeam2: 11 }),
      game({ wasWinner: false, team: 1, scoreTeam1: 5, scoreTeam2: 11 }),
      game({ wasWinner: false, team: 1, scoreTeam1: 5, scoreTeam2: 11 }),
      game({ wasWinner: true, team: 1, scoreTeam1: 11, scoreTeam2: 5 }),
      game({ wasWinner: true, team: 1, scoreTeam1: 11, scoreTeam2: 5 }),
      game({ wasWinner: true, team: 1, scoreTeam1: 11, scoreTeam2: 5 }),
      game({ wasWinner: true, team: 1, scoreTeam1: 11, scoreTeam2: 5 }),
      game({ wasWinner: true, team: 1, scoreTeam1: 11, scoreTeam2: 5 }),
    ]
    const stats = computePlayerStats(games)
    assert.equal(stats.totalGames, 8)
    assert.equal(stats.wins, 5)
    assert.equal(stats.improvement, 38)
  })

  function outcomes(flags) {
    return flags.map((wasWinner) => game({
      wasWinner,
      team: 1,
      scoreTeam1: wasWinner ? 11 : 5,
      scoreTeam2: wasWinner ? 5 : 11,
    }))
  }

  it('keeps the longer later win run as both the best and the current streak', () => {
    const stats = computePlayerStats(outcomes([true, true, false, true, true, true]))
    assert.equal(stats.bestStreak, 3)
    assert.equal(stats.currentStreak, 3)
  })

  it('sets the best streak equal to the current streak when every game is a win', () => {
    const stats = computePlayerStats(outcomes([true, true, true, true]))
    assert.equal(stats.bestStreak, 4)
    assert.equal(stats.currentStreak, 4)
  })

  it('keeps an earlier win run when the latest games are losses', () => {
    const stats = computePlayerStats(outcomes([true, true, true, false, false]))
    assert.equal(stats.bestStreak, 3)
    assert.equal(stats.currentStreak, -2)
  })

  it('sets the best streak to 0 when the player has no wins', () => {
    const stats = computePlayerStats(outcomes([false, false, false]))
    assert.equal(stats.bestStreak, 0)
    assert.equal(stats.currentStreak, -3)
  })
})

function person(id, name = `Player ${id}`) {
  return { id, name }
}

function match(team1, team2, scoreTeam1, scoreTeam2) {
  return { team1, team2, scoreTeam1, scoreTeam2 }
}

function played(pair, wins, losses, startId) {
  const games = []
  let id = startId
  for (let i = 0; i < wins + losses; i++) {
    const won = i < wins
    games.push(match(
      pair,
      [person(id++), person(id++)],
      won ? 11 : 5,
      won ? 5 : 11,
    ))
  }
  return games
}

describe('winningestPairs', () => {
  it('accumulates games shared by the same two players into one pair', () => {
    const alice = person(1, 'Alice')
    const bob = person(2, 'Bob')
    const pairs = winningestPairs([
      match([alice, bob], [person(3), person(4)], 11, 7),
      match([alice, bob], [person(5), person(6)], 11, 4),
      match([alice, bob], [person(7), person(8)], 11, 9),
    ])
    assert.equal(pairs.length, 1)
    assert.deepEqual(pairs[0].ids, [1, 2])
    assert.equal(pairs[0].gamesTogether, 3)
    assert.equal(pairs[0].wins, 3)
    assert.equal(pairs[0].losses, 0)
    assert.equal(pairs[0].pointsFor, 33)
    assert.equal(pairs[0].pointsAgainst, 20)
    assert.equal(pairs[0].plusMinus, 13)
    assert.equal(pairs[0].winPct, 100)
  })

  it('treats either id order as the same pair', () => {
    const alice = person(1, 'Alice')
    const bob = person(2, 'Bob')
    const pairs = winningestPairs([
      match([alice, bob], [person(3), person(4)], 11, 7),
      match([bob, alice], [person(5), person(6)], 11, 4),
      match([person(7), person(8)], [alice, bob], 3, 11),
    ])
    assert.equal(pairs.length, 1)
    assert.deepEqual(pairs[0].ids, [1, 2])
    assert.deepEqual(pairs[0].names, ['Alice', 'Bob'])
    assert.equal(pairs[0].gamesTogether, 3)
    assert.equal(pairs[0].wins, 3)
  })

  it('does not pair the two opponents in a game', () => {
    const pairs = winningestPairs([
      match([person(1, 'A'), person(2, 'B')], [person(3, 'C'), person(4, 'D')], 11, 5),
    ], { minGames: 1 })
    assert.deepEqual(
      pairs.map((pair) => pair.ids.join('-')).sort(),
      ['1-2', '3-4'],
    )
  })

  it('skips a side that does not have exactly two players', () => {
    const games = [0, 1, 2].map(() => match(
      [person(1, 'Solo')],
      [person(2, 'Ada'), person(3, 'Bea')],
      5,
      11,
    ))
    const pairs = winningestPairs(games)
    assert.equal(pairs.length, 1)
    assert.deepEqual(pairs[0].ids, [2, 3])
    assert.equal(pairs[0].wins, 3)
  })

  it('excludes a pair with 2 games and includes a pair with 3', () => {
    const pairs = winningestPairs([
      ...played([person(1, 'Short'), person(2, 'Stay')], 2, 0, 100),
      ...played([person(3, 'Long'), person(4, 'Stay')], 3, 0, 200),
    ])
    assert.equal(pairs.length, 1)
    assert.deepEqual(pairs[0].ids, [3, 4])
    assert.equal(pairs[0].gamesTogether, 3)
  })

  it('ranks more wins above a higher win percentage', () => {
    const pairs = winningestPairs([
      ...played([person(3, 'Few'), person(4, 'Perfect')], 3, 0, 2000),
      ...played([person(1, 'Many'), person(2, 'Wins')], 12, 4, 1000),
    ])
    assert.deepEqual(pairs.map((pair) => pair.ids), [[1, 2], [3, 4]])
    assert.equal(pairs[0].wins, 12)
    assert.equal(pairs[0].losses, 4)
    assert.equal(pairs[0].winPct, 75)
    assert.equal(pairs[1].winPct, 100)
  })

  it('breaks a tie on wins with the higher win percentage', () => {
    const pairs = winningestPairs([
      ...played([person(3, 'C'), person(4, 'D')], 6, 4, 200),
      ...played([person(1, 'A'), person(2, 'B')], 6, 0, 100),
    ])
    assert.equal(pairs[0].wins, pairs[1].wins)
    assert.deepEqual(pairs.map((pair) => pair.ids[0]), [1, 3])
    assert.equal(pairs[0].winPct, 100)
    assert.equal(pairs[1].winPct, 60)
  })

  it('breaks a tie on wins and win percentage with more games together', () => {
    const pairs = winningestPairs([
      ...played([person(3, 'C'), person(4, 'D')], 1, 11, 200),
      ...played([person(1, 'A'), person(2, 'B')], 1, 12, 100),
    ])
    assert.equal(pairs[0].wins, pairs[1].wins)
    assert.equal(pairs[0].winPct, pairs[1].winPct)
    assert.equal(pairs[0].gamesTogether, 13)
    assert.equal(pairs[1].gamesTogether, 12)
  })

  it('stops the list at 5', () => {
    const games = []
    for (let i = 0; i < 6; i++) {
      games.push(...played(
        [person(i * 2 + 1), person(i * 2 + 2)],
        8 - i,
        0,
        1000 + i * 50,
      ))
    }
    const pairs = winningestPairs(games)
    assert.equal(pairs.length, 5)
    assert.deepEqual(pairs.map((pair) => pair.wins), [8, 7, 6, 5, 4])
  })
})
