import { Outlet, Link, useLocation } from "react-router-dom";
import { BookOpen, Camera, Home, Lamp } from "lucide-react";

const navItems = [
  { to: "/", label: "Home", icon: Home },
  { to: "/gallery", label: "Gallery", icon: Camera },
];

export default function Layout() {
  const { pathname } = useLocation();

  return (
    <div className="min-h-screen flex flex-col bg-parchment-dark">
      {/* Header */}
      <header className="bg-parchment text-carbon border-b border-parchment-dark">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-full bg-brand-blue/10 flex items-center justify-center group-hover:bg-brand-blue/20 transition">
              <Lamp className="w-5 h-5 text-brand-blue" />
            </div>
            <div>
              <h1 className="text-xl font-display font-bold tracking-wider text-carbon">
                Under the Lamp
              </h1>
              <p className="text-xs text-carbon/40 tracking-widest uppercase font-sans">
                Book Club · Bangalore
              </p>
            </div>
          </Link>

          <nav className="flex items-center gap-1">
            {navItems.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition
                  ${
                    pathname === to
                      ? "bg-brand-blue text-white"
                      : "text-carbon/60 hover:text-carbon hover:bg-parchment-dark"
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
      <footer className="bg-carbon text-parchment/40 py-8">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <BookOpen className="w-4 h-4 text-lime" />
            <span className="font-display text-parchment text-sm uppercase tracking-widest font-bold">
              Under the Lamp
            </span>
          </div>
          <p className="text-xs font-sans">
            A read-along, discussion-driven book club in Bangalore — one book,
            one lamp, one story at a time.
          </p>
        </div>
      </footer>
    </div>
  );
}
