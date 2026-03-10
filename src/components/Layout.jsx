import { Outlet, Link, useLocation } from 'react-router-dom'
import { BookOpen, Camera, Home, Lamp } from 'lucide-react'

const navItems = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/gallery', label: 'Gallery', icon: Camera },
]

export default function Layout() {
  const { pathname } = useLocation()

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-warm-900 text-lamp-100">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-full bg-lamp-500/20 flex items-center justify-center group-hover:bg-lamp-500/30 transition">
              <Lamp className="w-5 h-5 text-lamp-400" />
            </div>
            <div>
              <h1 className="text-xl font-serif font-bold tracking-wide text-lamp-200">
                Under the Lamp
              </h1>
              <p className="text-xs text-warm-400 tracking-widest uppercase">Book Club · Bangalore</p>
            </div>
          </Link>

          <nav className="flex items-center gap-1">
            {navItems.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition
                  ${pathname === to
                    ? 'bg-lamp-500/20 text-lamp-300'
                    : 'text-warm-300 hover:text-lamp-200 hover:bg-warm-800'
                  }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-warm-900 text-warm-400 py-8">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <BookOpen className="w-4 h-4 text-lamp-500" />
            <span className="font-serif text-lamp-200 text-sm">Under the Lamp</span>
          </div>
          <p className="text-xs">
            A read-along, discussion-driven book club in Bangalore — one book, one lamp, one story at a time.
          </p>
        </div>
      </footer>
    </div>
  )
}
