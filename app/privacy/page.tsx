"use client";

import Link from "next/link";

export default function Privacy() {
  return (
    <div className="flex flex-col min-h-screen bg-canvas text-ink">
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
        <Link
          href="/"
          className="text-xs font-semibold px-4 py-2 border border-hairline hover:bg-surface-soft text-ink rounded-md transition-all duration-150"
        >
          Back to Home
        </Link>
      </nav>

      <main className="flex-grow max-w-4xl w-full mx-auto px-6 py-12 text-left">
        <span className="text-xs font-bold uppercase tracking-wider text-primary mb-2 block">Privacy Policy</span>
        <h1 className="font-serif text-3xl md:text-4xl font-normal text-ink mb-8">
          Privacy Policy
        </h1>

        <div className="flex flex-col gap-6 text-sm leading-relaxed text-body-strong">
          <section className="bg-surface-card border border-hairline rounded-lg p-6">
            <h2 className="text-lg font-semibold text-ink mb-3">1. Information We Collect</h2>
            <p className="mb-3">
              To operate the DSA Revision Hub, we only collect minimal information necessary to deliver spaced repetition benefits:
            </p>
            <ul className="list-disc pl-5 flex flex-col gap-1.5">
              <li><strong>Account Credentials:</strong> Name, email address, and hashed passwords used strictly for authentication.</li>
              <li><strong>LeetCode Metrics:</strong> Title of problems, platform URLs, notes, and spacing intervals to schedule active recalls.</li>
            </ul>
          </section>

          <section className="bg-surface-card border border-hairline rounded-lg p-6">
            <h2 className="text-lg font-semibold text-ink mb-3">2. Data Security</h2>
            <p>
              Your data is stored securely in MongoDB with passwords protected using modern bcrypt cryptographic hashing techniques. We do not sell, rent, or distribute any user metrics or email details to third-party providers.
            </p>
          </section>

          <section className="bg-surface-card border border-hairline rounded-lg p-6">
            <h2 className="text-lg font-semibold text-ink mb-3">3. Changes to This Policy</h2>
            <p>
              We reserve the right to modify this privacy statement at any time. Changes will be posted here on this page.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
