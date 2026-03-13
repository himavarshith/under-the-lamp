import { Outlet, Link, useLocation } from "react-router-dom";
import { Camera, Home, Instagram, Mail, Users } from "lucide-react";

const navItems = [
  { to: "/", label: "Home", icon: Home },
  { to: "/gallery", label: "Gallery", icon: Camera },
  { to: "/join", label: "Waitlist", icon: Users },
];

export default function Layout() {
  const { pathname } = useLocation();

  return (
    <div className="min-h-screen flex flex-col bg-parchment-dark">
      {/* Header */}
      <header className="bg-brand-blue text-white">
        <div className="max-w-6xl mx-auto px-4 py-1 flex items-center justify-between gap-2">
          <Link to="/" className="flex items-center group min-w-0 shrink-0">
            <img
              src="/UTL Secondary Logo.svg"
              alt="Under the Lamp"
              className="h-14 md:h-20 w-auto brightness-0 invert"
            />
          </Link>

          <nav className="flex items-center gap-1 shrink-0">
            {navItems.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-2 px-3 md:px-5 py-2 rounded-full text-sm font-bold uppercase tracking-wide transition
                  ${
                    pathname === to
                      ? "bg-lime text-carbon"
                      : "text-white/80 hover:text-white hover:bg-white/10"
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
      <footer className="bg-carbon text-white/50 py-10">
        <div className="max-w-6xl mx-auto px-8 md:px-16 flex flex-row items-start justify-between gap-8">
          {/* Left: details */}
          <div className="flex flex-col gap-3">
            <p className="text-xs font-sans">
              A read-along, discussion-driven book club in Bangalore.
            </p>
            <div className="w-8 border-t border-white/20" />
            <a
              href="https://www.instagram.com/underthelamp_/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs font-sans text-white/50 hover:text-white transition"
            >
              <Instagram className="w-4 h-4" />
              @underthelamp_
            </a>
            <p className="text-xs font-sans">
              Write to us:{" "}
              <a
                href="mailto:underthelamp.contact@gmail.com"
                className="hover:text-white transition"
              >
                underthelamp.contact@gmail.com
              </a>
            </p>
          </div>
          {/* Right: logo */}
          <img
            src="/UTL Secondary Logo.svg"
            alt="Under the Lamp"
            className="h-24 w-auto brightness-0 invert opacity-90 shrink-0"
          />
        </div>
      </footer>
    </div>
  );
}
