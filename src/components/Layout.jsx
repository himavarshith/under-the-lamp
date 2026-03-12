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
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-2">
          <Link to="/" className="flex items-center gap-2.5 group min-w-0">
            <div className="w-10 h-10 md:w-14 md:h-14 rounded-full bg-brand-blue flex items-center justify-center shrink-0">
              <Lamp className="w-5 h-5 md:w-7 md:h-7 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm md:text-base font-display font-bold tracking-wide text-carbon uppercase leading-tight truncate">
                Under the Lamp
              </h1>
              <p className="text-[10px] md:text-xs text-carbon/40 tracking-widest uppercase font-sans truncate">
                Book Club · Bangalore
              </p>
            </div>
          </Link>

          <nav className="flex items-center gap-1 shrink-0">
            {navItems.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-2 px-3 md:px-5 py-2 rounded-full text-sm font-bold uppercase tracking-wide transition
                  ${
                    pathname === to
                      ? "bg-brand-blue text-white"
                      : "text-carbon/70 hover:text-carbon hover:bg-lime-dark"
                  }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{label}</span>
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
            A read-along, discussion-driven book club in Bangalore.
          </p>
        </div>
      </footer>
    </div>
  );
}
