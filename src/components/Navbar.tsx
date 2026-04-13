import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, Compass } from 'lucide-react'

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/careers', label: 'Explore Careers' },
  { to: '/quiz', label: 'Career Quiz' },
  { to: '/pathways', label: 'Pathways' },
  { to: '/about', label: 'About' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2 text-primary-700 font-bold text-xl">
          <Compass className="h-7 w-7" />
          <span>CareerPathway</span>
        </Link>

        {/* Desktop nav */}
        <ul className="hidden md:flex items-center gap-1">
          {navLinks.map(({ to, label }) => (
            <li key={to}>
              <Link
                to={to}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors
                  ${pathname === to
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>

        <Link
          to="/quiz"
          className="hidden md:inline-flex rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-700 transition-colors"
        >
          Take Free Quiz
        </Link>

        {/* Mobile toggle */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden rounded-lg p-2 text-gray-600 hover:bg-gray-100"
          aria-label="Toggle menu"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 pb-4">
          <ul className="space-y-1 pt-2">
            {navLinks.map(({ to, label }) => (
              <li key={to}>
                <Link
                  to={to}
                  onClick={() => setOpen(false)}
                  className={`block rounded-lg px-4 py-2.5 text-sm font-medium transition-colors
                    ${pathname === to
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-600 hover:bg-gray-50'
                    }`}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
          <Link
            to="/quiz"
            onClick={() => setOpen(false)}
            className="mt-3 block rounded-lg bg-primary-600 px-5 py-2.5 text-center text-sm font-semibold text-white shadow-sm hover:bg-primary-700 transition-colors"
          >
            Take Free Quiz
          </Link>
        </div>
      )}
    </header>
  )
}
