import { Link, useLocation } from 'react-router-dom'

export default function Footer() {
  const { pathname } = useLocation()
  const isHome = pathname === '/'

  return (
    <footer className="flex flex-col items-center gap-1 py-4 font-mono text-retro-cream/20 text-xs tracking-widest">
      {!isHome && (
        <Link
          to="/"
          className="text-retro-cream/30 hover:text-retro-cream/50 transition-colors tracking-[0.2em]"
        >
          Main Menu
        </Link>
      )}
      <span>@nonetheweisser 2026</span>
      <span>1.0.2</span>
    </footer>
  )
}