import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { fileURLToPath } from 'url'
import path from 'path'
import { logError } from './lib/logger.js'
import playersRouter from './routes/players.js'
import sessionsRouter from './routes/sessions.js'
import gamesRouter from './routes/games.js'
import clientErrorsRouter from './routes/clientErrors.js'
import leaderboardRouter from './routes/leaderboard.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = process.env.PORT ?? 3001

app.use(cors())
app.use(express.json())

app.use('/api/players', playersRouter)
app.use('/api/sessions', sessionsRouter)
app.use('/api/games', gamesRouter)
app.use('/api/client-errors', clientErrorsRouter)
app.use('/api', leaderboardRouter)

const clientDist = path.join(__dirname, '../../client/dist')
app.use(express.static(clientDist))
app.get('*', (req, res) => res.sendFile(path.join(clientDist, 'index.html')))

app.use((err, req, res, next) => {
  logError(err, { method: req.method, path: req.path, body: req.body })
  res.status(500).json({ error: 'Internal server error' })
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
