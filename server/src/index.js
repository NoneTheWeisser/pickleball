import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import playersRouter from './routes/players.js'
import sessionsRouter from './routes/sessions.js'
import gamesRouter from './routes/games.js'

const app = express()
const PORT = process.env.PORT ?? 3001

app.use(cors())
app.use(express.json())

app.use('/api/players', playersRouter)
app.use('/api/sessions', sessionsRouter)
app.use('/api/games', gamesRouter)

app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).json({ error: 'Internal server error' })
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
