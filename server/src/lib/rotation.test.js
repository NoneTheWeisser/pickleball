import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { assignTeams, pickPlayers, placeArrival, seatNewArrivals } from './rotation.js'

function roster(count) {
  return Array.from({ length: count }, (_, i) => ({ id: i + 1 }))
}

function recentGames(history) {
  return history.slice(0, 2).map((ids) => ({
    players: ids.map((id) => ({ id })),
  }))
}

function satIds(players, court) {
  const onCourt = new Set(court)
  return players.map((player) => player.id).filter((id) => !onCourt.has(id))
}

function runSession(count, games, onPick) {
  const players = roster(count)
  const history = []
  for (let gameNumber = 1; gameNumber <= games; gameNumber++) {
    const court = pickPlayers(players, recentGames(history))
    onPick({ players, history, court, gameNumber })
    history.unshift(court)
  }
}

describe('rotation', { concurrency: false }, () => {
  it('returns 4 distinct players for the first game of a 5, 6, or 7 player session', () => {
    for (const count of [5, 6, 7]) {
      for (let trial = 0; trial < 10; trial++) {
        const players = roster(count)
        const court = pickPlayers(players, [])
        assert.equal(court.length, 4)
        assert.equal(new Set(court).size, 4)
        for (const id of court) {
          assert.ok(players.some((player) => player.id === id))
        }
      }
    }
  })

  it('puts whoever sat the last game on court next for 5, 6, and 7 players', () => {
    for (const count of [5, 6, 7]) {
      for (let trial = 0; trial < 20; trial++) {
        runSession(count, 4, ({ players, history, court }) => {
          if (history.length === 0) return
          const onCourt = new Set(court)
          for (const id of satIds(players, history[0])) {
            assert.ok(onCourt.has(id), `player ${id} sat the last game in a group of ${count}`)
          }
        })
      }
    }
  })

  it('with 6 players, sits the two who played the previous two games', () => {
    for (let trial = 0; trial < 20; trial++) {
      runSession(6, 3, ({ players, history, court, gameNumber }) => {
        if (gameNumber < 3) return
        const playedBoth = history[0].filter((id) => history[1].includes(id))
        const sitting = satIds(players, court)
        assert.deepEqual(
          [...sitting].sort((a, b) => a - b),
          [...playedBoth].sort((a, b) => a - b)
        )
        assert.equal(court.length, 4)
      })
    }
  })

  it('with 5 players, fills the court with someone who just played twice', () => {
    for (let trial = 0; trial < 20; trial++) {
      runSession(5, 5, ({ history, court, gameNumber }) => {
        assert.equal(new Set(court).size, 4)
        if (gameNumber < 3) return
        const playedBoth = history[0].filter((id) => history[1].includes(id))
        const onCourt = new Set(court)
        assert.ok(playedBoth.some((id) => onCourt.has(id)))
      })
    }
  })

  it('with 5 players, can sit someone twice before everyone has sat once', () => {
    const random = Math.random
    Math.random = () => 0.999999
    try {
      const counts = new Map(roster(5).map((player) => [player.id, 0]))
      const sits = []
      runSession(5, 5, ({ players, court }) => {
        const sitting = satIds(players, court)
        sits.push(sitting)
        for (const id of sitting) counts.set(id, counts.get(id) + 1)
      })
      // Identity shuffle (Math.random near 1). One real outcome of today's backfill.
      assert.deepEqual(sits, [[5], [4], [3], [5], [4]])
      assert.equal(counts.get(1), 0)
      assert.equal(counts.get(2), 0)
      assert.equal(counts.get(3), 1)
      assert.equal(counts.get(4), 2)
      assert.equal(counts.get(5), 2)
    } finally {
      Math.random = random
    }
  })

  it('with 7 players, brings back all three sitters plus one player from the last game', () => {
    for (let trial = 0; trial < 20; trial++) {
      runSession(7, 4, ({ players, history, court }) => {
        if (history.length === 0) return
        const sitting = satIds(players, history[0])
        const onCourt = new Set(court)
        assert.equal(sitting.length, 3)
        for (const id of sitting) assert.ok(onCourt.has(id))
        const fromLastGame = court.filter((id) => history[0].includes(id))
        assert.equal(fromLastGame.length, 1)
        assert.equal(court.length, 4)
      })
    }
  })

  it('treats a player with no games yet like someone who sat the last game', () => {
    const players = roster(9)
    const lastGame = { players: [1, 2, 3, 4].map((id) => ({ id })) }
    let newPlayerOnCourt = 0
    let newPlayerBenched = 0
    let sitterBenched = 0

    for (let trial = 0; trial < 200; trial++) {
      const court = pickPlayers(players, [lastGame])
      if (court.includes(9)) newPlayerOnCourt++
      else newPlayerBenched++
      if (!court.includes(5)) sitterBenched++
    }

    assert.ok(newPlayerOnCourt > 0)
    assert.ok(newPlayerBenched > 0)
    assert.ok(sitterBenched > 0)
  })

  it('fills an open slot when a late arrival joins', () => {
    const team1 = [{ id: 1 }, null]
    const team2 = [{ id: 2 }, { id: 3 }]
    const bench = [{ id: 4 }]
    const arrival = { id: 5 }
    const recentGames = [
      { players: [{ id: 1 }, { id: 2 }] },
      { players: [{ id: 1 }, { id: 3 }] },
    ]

    const lineup = placeArrival({ team1, team2, bench, arrival, recentGames })

    assert.deepEqual(lineup.team1, [{ id: 1 }, arrival])
    assert.deepEqual(lineup.team2, team2)
    assert.deepEqual(lineup.bench, bench)
    assert.deepEqual(team1, [{ id: 1 }, null])
  })

  it('bumps the player who played the last two games and leaves the other three', () => {
    const satTwice = { id: 1 }
    const playedLast = { id: 2 }
    const otherA = { id: 3 }
    const otherB = { id: 4 }
    const arrival = { id: 5 }
    const recentGames = [
      { players: [satTwice, playedLast, otherA, otherB] },
      { players: [satTwice, { id: 8 }, { id: 9 }, { id: 10 }] },
    ]

    const lineup = placeArrival({
      team1: [playedLast, otherA],
      team2: [otherB, satTwice],
      bench: [{ id: 6 }],
      arrival,
      recentGames,
    })

    assert.deepEqual(lineup.team1, [playedLast, otherA])
    assert.deepEqual(lineup.team2, [otherB, arrival])
    assert.deepEqual(lineup.bench.map((player) => player.id), [6, satTwice.id])
  })

  it('bumps exactly one player when nobody has played yet', () => {
    const court = [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }]
    const arrival = { id: 5 }
    const bumped = new Set()

    for (let trial = 0; trial < 40; trial++) {
      const lineup = placeArrival({
        team1: [court[0], court[1]],
        team2: [court[2], court[3]],
        bench: [],
        arrival,
        recentGames: [],
      })
      const slots = [...lineup.team1, ...lineup.team2]
      const moved = court.filter((player) => !slots.includes(player))
      assert.equal(moved.length, 1)
      assert.deepEqual(lineup.bench, moved)
      for (const [index, player] of court.entries()) {
        const side = index < 2 ? lineup.team1 : lineup.team2
        const slot = index % 2
        if (player === moved[0]) assert.equal(side[slot], arrival)
        else assert.equal(side[slot], player)
      }
      bumped.add(moved[0].id)
    }

    assert.ok(bumped.size > 1)
  })

  it('bumps the next-weakest player when a second arrival joins', () => {
    const playedBoth = { id: 1 }
    const playedLast = { id: 2 }
    const steadyA = { id: 3 }
    const steadyB = { id: 4 }
    const recentGames = [
      { players: [playedBoth, playedLast] },
      { players: [playedBoth] },
    ]

    const first = placeArrival({
      team1: [playedBoth, playedLast],
      team2: [steadyA, steadyB],
      bench: [],
      arrival: { id: 5 },
      recentGames,
    })
    assert.equal(first.team1[0].id, 5)
    assert.equal(first.team1[1], playedLast)
    assert.deepEqual(first.team2, [steadyA, steadyB])

    const second = placeArrival({
      ...first,
      arrival: { id: 6 },
      recentGames,
    })

    assert.equal(second.team1[0].id, 5)
    assert.equal(second.team1[1].id, 6)
    assert.deepEqual(second.team2, [steadyA, steadyB])
    assert.deepEqual(second.bench.map((player) => player.id), [playedBoth.id, playedLast.id])
  })

  it('leaves the lineup alone when nobody has played yet', () => {
    const lineup = {
      team1: [{ id: 1 }, { id: 2 }],
      team2: [{ id: 3 }, { id: 4 }],
      bench: [{ id: 5 }, { id: 6 }],
    }
    const seated = seatNewArrivals(lineup, { recentGames: [], playedIds: [] })
    assert.equal(seated, lineup)
  })

  it('seats players with no games and leaves people who have already played on the bench', () => {
    const court = [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }]
    const sat = [{ id: 5 }, { id: 6 }, { id: 7 }]
    const firstArrival = { id: 8 }
    const secondArrival = { id: 9 }
    const recentGames = [
      { players: court },
      { players: court },
    ]

    const seated = seatNewArrivals({
      team1: [court[0], court[1]],
      team2: [court[2], court[3]],
      bench: [...sat, firstArrival, secondArrival],
    }, {
      recentGames,
      playedIds: [1, 2, 3, 4, 5, 6, 7],
    })

    const onCourt = [...seated.team1, ...seated.team2].map((player) => player.id)
    assert.ok(onCourt.includes(8))
    assert.ok(onCourt.includes(9))
    for (const player of sat) assert.ok(!onCourt.includes(player.id))
    assert.equal(onCourt.length, 4)
  })

  it('leaves a head-to-head court alone and puts the arrival on the bench', () => {
    const team1 = [{ id: 1 }]
    const team2 = [{ id: 2 }]
    const bench = [{ id: 3 }]
    const lineup = placeArrival({
      team1,
      team2,
      bench,
      arrival: { id: 4 },
      recentGames: [
        { players: [{ id: 1 }, { id: 2 }] },
        { players: [{ id: 1 }, { id: 2 }] },
      ],
    })

    assert.deepEqual(lineup.team1, team1)
    assert.deepEqual(lineup.team2, team2)
    assert.deepEqual(lineup.bench.map((player) => player.id), [3, 4])
  })

  it('does not repeat a partnership from the previous game', () => {
    const previousGame = {
      players: [
        { id: 1, team: 1 },
        { id: 2, team: 1 },
        { id: 3, team: 2 },
        { id: 4, team: 2 },
      ],
    }
    const previousPairs = [new Set([1, 2]), new Set([3, 4])]

    for (let trial = 0; trial < 50; trial++) {
      const { team1, team2 } = assignTeams([1, 2, 3, 4], previousGame)
      assert.equal(team1.length, 2)
      assert.equal(team2.length, 2)
      assert.deepEqual([...team1, ...team2].sort((a, b) => a - b), [1, 2, 3, 4])

      for (const pair of previousPairs) {
        for (const team of [team1, team2]) {
          const repeats = [...pair].every((id) => team.includes(id))
          assert.equal(repeats, false)
        }
      }
    }
  })
})
