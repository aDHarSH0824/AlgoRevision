"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "../context/AuthContext";

export default function Header() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  if (!user) return null;

  const navItems = [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Patterns", path: "/patterns" },
    { name: "Questions", path: "/questions" },
    { name: "Virtual Test", path: "/test" },
  ];

  return (
    <header className="sticky top-0 z-50 h-16 w-full bg-canvas border-b border-hairline flex items-center justify-between px-6 md:px-12">
      {/* Brand logo block */}
      <div className="flex items-center gap-3">
        {/* Signature 4-spoke brand asterisk mark */}
        <svg
          className="w-5 h-5 text-primary animate-pulse"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        >
          <line x1="12" y1="3" x2="12" y2="21" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="5.64" y1="5.64" x2="18.36" y2="18.36" />
          <line x1="5.64" y1="18.36" x2="18.36" y2="5.64" />
        </svg>
        <span className="font-serif text-lg md:text-xl font-medium tracking-tight text-ink">
          DSA Revision Hub
        </span>
      </div>

      {/* Navigation center cluster */}
      <nav className="hidden md:flex items-center gap-8">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`text-sm font-medium transition-colors duration-150 py-1 ${
                isActive
                  ? "text-ink border-b-2 border-primary"
                  : "text-muted hover:text-ink"
              }`}
            >
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Profile & controls right cluster */}
      <div className="flex items-center gap-4 md:gap-6">
        {/* Mobile menu toggle button or link */}
        <div className="md:hidden flex items-center gap-4">
          <Link
            href="/dashboard"
            className={`text-xs font-semibold ${pathname === "/dashboard" ? "text-primary" : "text-muted"}`}
          >
            Dashboard
          </Link>
          <Link
            href="/patterns"
            className={`text-xs font-semibold ${pathname === "/patterns" ? "text-primary" : "text-muted"}`}
          >
            Patterns
          </Link>
          <Link
            href="/questions"
            className={`text-xs font-semibold ${pathname === "/questions" ? "text-primary" : "text-muted"}`}
          >
            Questions
          </Link>
          <Link
            href="/test"
            className={`text-xs font-semibold ${pathname === "/test" ? "text-primary" : "text-muted"}`}
          >
            Test
          </Link>

        </div>

        <div className="hidden sm:flex flex-col items-end text-right">
          <span className="text-xs font-semibold text-body-strong">{user.name}</span>
          <span className="text-[10px] text-muted uppercase tracking-wider">{user.role}</span>
        </div>
        
        <button
          onClick={logout}
          className="text-xs font-medium px-3 py-1.5 rounded-md border border-hairline text-muted hover:text-ink hover:bg-surface-card transition-all duration-150"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
