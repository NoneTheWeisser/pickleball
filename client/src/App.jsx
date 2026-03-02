import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import SessionSetup from './pages/SessionSetup'
import GameInProgress from './pages/GameInProgress'
import SessionSummary from './pages/SessionSummary'

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-retro-dark text-retro-cream retro-scanlines">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/session/new" element={<SessionSetup />} />
          <Route path="/session/:sessionId/game" element={<GameInProgress />} />
          <Route path="/session/:sessionId/summary" element={<SessionSummary />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}
