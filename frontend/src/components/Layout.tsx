import { useState, useCallback } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { PlayerBar } from "./player/PlayerBar";

function NavItem({
  to,
  end,
  children,
  onClick,
}: {
  to: string;
  end?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      className={({ isActive }) =>
        isActive ? "text-white" : "text-muted hover:text-white"
      }
    >
      {children}
    </NavLink>
  );
}

export function Layout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = useCallback(() => setMenuOpen(false), []);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between border-b border-border px-6 py-4">
        <NavLink to="/" className="text-xl font-bold tracking-tight">
          MoodRead
        </NavLink>

        {/* Desktop nav */}
        <nav className="hidden gap-6 text-sm sm:flex">
          <NavItem to="/" end>Upload</NavItem>
          <NavItem to="/library">Library</NavItem>
        </nav>

        {/* Mobile hamburger */}
        <button
          className="text-muted hover:text-white sm:hidden"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          {menuOpen ? (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9h16.5m-16.5 6.75h16.5" />
            </svg>
          )}
        </button>
      </header>

      {/* Mobile menu dropdown */}
      {menuOpen && (
        <nav className="flex flex-col gap-3 border-b border-border bg-surface-alt px-6 py-4 text-sm sm:hidden">
          <NavItem to="/" end onClick={closeMenu}>Upload</NavItem>
          <NavItem to="/library" onClick={closeMenu}>Library</NavItem>
        </nav>
      )}

      <main className="flex flex-1 flex-col pb-20">
        <Outlet />
      </main>

      <PlayerBar />
    </div>
  );
}
