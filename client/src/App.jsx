import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import SessionSetup from './pages/SessionSetup'
import GameInProgress from './pages/GameInProgress'
import SessionSummary from './pages/SessionSummary'
import Leaderboard from './pages/Leaderboard'
import Admin from './pages/Admin'
import Options from './pages/Options'
import Footer from './components/Footer'

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-retro-dark text-retro-cream retro-scanlines">
        <div className="flex-1">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/session/new" element={<SessionSetup />} />
            <Route path="/session/:sessionId/game" element={<GameInProgress />} />
            <Route path="/session/:sessionId/summary" element={<SessionSummary />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/options" element={<Options />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </BrowserRouter>
  )
}
