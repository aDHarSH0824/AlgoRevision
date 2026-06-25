"use client";

import { useState } from "react";
import { useAuth } from "./context/AuthContext";
import Link from "next/link";

export default function Home() {
  const { login, register, googleLogin, loading } = useAuth();
  const [isLogin, setIsLogin] = useState(true);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(name, email, password);
      }
    } catch (err: any) {
      setError(err.message || "An authentication error occurred.");
    }
  };

  const handleMockGoogleLogin = async () => {
    setError("");
    try {
      await googleLogin("mock_google_token");
    } catch (err: any) {
      setError(err.message || "Mock Google login failed.");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-canvas text-ink selection:bg-primary/20">
      {/* Top Navigation */}
      <nav className="h-16 w-full border-b border-hairline flex items-center justify-between px-6 md:px-12 bg-canvas">
        <div className="flex items-center gap-3">
          <svg
            className="w-5 h-5 text-primary"
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
          <span className="font-serif text-lg font-medium tracking-tight">
            DSA Revision Hub
          </span>
        </div>
        <div>
          <a
            href="#auth-form"
            className="text-xs font-semibold px-4 py-2 bg-primary hover:bg-primary-active text-on-primary rounded-md transition-all duration-150"
          >
            Get Started
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-grow flex flex-col">
        <section className="max-w-6xl w-full mx-auto px-6 py-12 md:py-24 grid md:grid-cols-12 gap-12 items-center">
          <div className="md:col-span-7 flex flex-col items-start text-left">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-pill bg-primary/10 text-primary text-xs font-bold tracking-wider uppercase mb-6">
              Memory Recall Optimizer
            </span>
            <h1 className="font-sans text-5xl md:text-7xl font-extrabold leading-tight tracking-tight text-ink mb-6">
              Meet your algorithms thinking partner.
            </h1>
            <p className="text-body-strong text-lg md:text-xl font-normal leading-relaxed max-w-2xl mb-8">
              DSA Revision Hub matches customized Spaced Repetition (SM-2) scheduling with deep pattern analysis. Build long-term memory visual maps for complex algorithms and solve coding interviews with confidence.
            </p>
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center gap-2 text-sm text-body-strong font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-accent-teal"></span>
                Active Recall Sessions
              </div>
              <div className="flex items-center gap-2 text-sm text-body-strong font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-accent-amber"></span>
                Pattern-Wise Analytics
              </div>
            </div>
          </div>

          {/* Hero Right Auth Card */}
          <div id="auth-form" className="md:col-span-5 w-full bg-surface-card border border-hairline rounded-lg p-6 md:p-8">
            <div className="flex justify-between border-b border-hairline mb-6">
              <button
                onClick={() => { setIsLogin(true); setError(""); }}
                className={`pb-3 text-sm font-semibold transition-all duration-150 px-2 ${
                  isLogin ? "text-ink border-b-2 border-primary" : "text-muted hover:text-ink"
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => { setIsLogin(false); setError(""); }}
                className={`pb-3 text-sm font-semibold transition-all duration-150 px-2 ${
                  !isLogin ? "text-ink border-b-2 border-primary" : "text-muted hover:text-ink"
                }`}
              >
                Create Account
              </button>
            </div>

            {error && (
              <div className="p-3 mb-4 rounded-md bg-error/10 border border-error text-error text-xs font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {!isLogin && (
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="name" className="text-xs font-semibold text-body">
                    Full Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full h-10 px-3 border border-hairline bg-canvas rounded-md text-sm text-ink focus:outline-none focus:border-primary transition-all duration-150"
                  />
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <label htmlFor="email" className="text-xs font-semibold text-body">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@email.com"
                  className="w-full h-10 px-3 border border-hairline bg-canvas rounded-md text-sm text-ink focus:outline-none focus:border-primary transition-all duration-150"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="password" className="text-xs font-semibold text-body">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-10 px-3 border border-hairline bg-canvas rounded-md text-sm text-ink focus:outline-none focus:border-primary transition-all duration-150"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-10 bg-primary hover:bg-primary-active disabled:bg-primary-disabled text-on-primary text-sm font-semibold rounded-md transition-all duration-150 flex items-center justify-center cursor-pointer mt-2"
              >
                {loading ? "Processing..." : isLogin ? "Sign In" : "Register"}
              </button>
            </form>

            <div className="relative my-6 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-hairline"></div>
              </div>
              <span className="relative px-3 bg-surface-card text-[10px] uppercase tracking-wider text-muted font-bold">
                Or Continue With
              </span>
            </div>

            <button
              onClick={handleMockGoogleLogin}
              disabled={loading}
              className="w-full h-10 bg-canvas border border-hairline hover:bg-surface-soft text-ink text-sm font-semibold rounded-md transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Sign In with Google (Mock)
            </button>
          </div>
        </section>

        {/* Feature Grid Band */}
        <section className="bg-surface-soft border-t border-b border-hairline py-20 px-6">
          <div className="max-w-6xl w-full mx-auto">
            <h2 className="font-serif text-3xl font-normal text-center tracking-tight text-ink mb-12">
              Designed around active cognitive recall.
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              {/* Feature card 1 */}
              <div className="bg-canvas border border-hairline rounded-lg p-8 flex flex-col items-start text-left">
                <div className="w-10 h-10 rounded-md bg-primary/10 text-primary flex items-center justify-center mb-6">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-3 text-body-strong">Spaced Repetition Scheduler</h3>
                <p className="text-sm text-body leading-relaxed">
                  Utilizes a SuperMemo-2 inspired memory decay formula. Adjusts intervals dynamically based on whether you forgot, struggled, or recalled a topic easily.
                </p>
              </div>

              {/* Feature card 2 */}
              <div className="bg-canvas border border-hairline rounded-lg p-8 flex flex-col items-start text-left">
                <div className="w-10 h-10 rounded-md bg-accent-teal/10 text-accent-teal flex items-center justify-center mb-6">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-3 text-body-strong">Virtual Mock Test Maker</h3>
                <p className="text-sm text-body leading-relaxed">
                  Select one or more topic patterns and instantly generate a 5-question timed mock test. Features custom external resource links and scoring breakdowns.
                </p>
              </div>


            </div>
          </div>
        </section>

        {/* Code window Showcase Section */}
        <section className="bg-canvas py-20 px-6 max-w-6xl w-full mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="font-serif text-3xl font-normal leading-tight tracking-tight text-ink mb-6">
              Algorithmic logic meets cognitive modeling.
            </h2>
            <p className="text-body text-sm leading-relaxed mb-6">
              Our scheduling algorithm evaluates your memory retention limits. Based on rating inputs, the system continuously adjusts the question ease-factor and interval constraints. Future revisions are automatically sorted so you stay focused on weak topics.
            </p>
            <div className="p-4 border-l-4 border-primary bg-surface-card rounded-r-md text-xs leading-relaxed text-body-strong italic">
              "Spaced repetition is not about studying more; it is about studying at the exact threshold where forgetting begins."
            </div>
          </div>
          
          {/* Mock Code window card matching DESIGN.md */}
          <div className="bg-surface-dark rounded-lg p-6 shadow-xl border border-surface-dark-elevated text-left">
            <div className="flex gap-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-error"></div>
              <div className="w-3 h-3 rounded-full bg-warning"></div>
              <div className="w-3 h-3 rounded-full bg-success"></div>
            </div>
            <pre className="font-mono text-xs text-on-dark-soft overflow-x-auto leading-relaxed">
              <code>
{`// srsService.calculateNextRevision()
let easeFactor = currentEaseFactor;
let interval = currentInterval;

if (rating === "Forgot") {
  easeFactor = Math.max(1.3, currentEaseFactor - 0.2);
  interval = 1; // review tomorrow
  revisionCount = 0;
} else if (rating === "Hard Recall") {
  easeFactor = Math.max(1.3, currentEaseFactor - 0.05);
  interval = Math.round(currentInterval * easeFactor * 0.8);
  revisionCount += 1;
} else {
  easeFactor = Math.min(2.5, currentEaseFactor + 0.15);
  interval = Math.round(currentInterval * easeFactor);
  revisionCount += 1;
}`}
              </code>
            </pre>
          </div>
        </section>
      </main>

      {/* Dark Footer */}
      <footer className="bg-surface-dark text-on-dark-soft py-16 px-6 border-t border-surface-dark-elevated">
        <div className="max-w-6xl w-full mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3">
            <svg
              className="w-5 h-5 text-on-dark"
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
            <span className="font-serif text-lg font-medium text-on-dark tracking-tight">
              DSA Revision Hub
            </span>
          </div>
          <div className="flex gap-8 text-xs font-medium">
            <Link href="/docs" className="hover:text-on-dark transition-colors">Documentation</Link>
            <Link href="/privacy" className="hover:text-on-dark transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-on-dark transition-colors">Terms</Link>
            <a href="#" className="opacity-50 cursor-not-allowed text-on-dark-soft">Github</a>
          </div>
          <p className="text-[11px] text-on-dark-soft">
            © 2026 DSA Revision Hub. Built on warm-canvas.
          </p>
        </div>
      </footer>
    </div>
  );
}

