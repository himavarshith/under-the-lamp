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
        <div className="max-w-6xl mx-auto px-4 py-2 flex items-center justify-between gap-2">
          <Link to="/" className="flex items-center group min-w-0 shrink-0">
            <img
              src="/UTL Secondary Logo.svg"
              alt="Under the Lamp"
              className="h-16 md:h-24 w-auto brightness-0 invert"
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
        <div className="max-w-6xl mx-auto px-4 text-center">
          <img
            src="/UTL Secondary Logo.svg"
            alt="Under the Lamp"
            className="h-24 w-auto mx-auto mb-4 brightness-0 invert opacity-90"
          />
          <p className="text-xs font-sans mb-5">
            A read-along, discussion-driven book club in Bangalore.
          </p>
          <div className="flex items-center justify-center gap-5">
            <a
              href="https://www.instagram.com/underthelamp_/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs font-sans text-white/50 hover:text-white transition"
            >
              <Instagram className="w-4 h-4" />
              @underthelamp_
            </a>
            <span className="text-white/20">·</span>
            <a
              href="mailto:underthelamp.contact@gmail.com"
              className="flex items-center gap-1.5 text-xs font-sans text-white/50 hover:text-white transition"
            >
              <Mail className="w-4 h-4" />
              underthelamp.contact@gmail.com
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
