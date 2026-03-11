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
      <header className="bg-lime text-carbon">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-14 h-14 rounded-full bg-brand-blue flex items-center shrink-0">
              <Lamp className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-base font-display font-bold tracking-wide text-carbon uppercase leading-tight">
                Under theLamp
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
                className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-bold uppercase tracking-wide transition
                  ${
                    pathname === to
                      ? "bg-brand-blue text-white"
                      : "text-carbon/70 hover:text-carbon hover:bg-lime-dark"
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
