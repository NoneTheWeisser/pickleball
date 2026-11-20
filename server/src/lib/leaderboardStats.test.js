import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { computePlayerStats } from './leaderboardStats.js'

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
