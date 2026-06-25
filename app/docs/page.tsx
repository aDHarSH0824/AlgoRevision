"use client";

import Link from "next/link";

export default function Docs() {
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
        <span className="text-xs font-bold uppercase tracking-wider text-primary mb-2 block">Documentation</span>
        <h1 className="font-serif text-3xl md:text-4xl font-normal text-ink mb-8">
          Developer & Algorithm Manual
        </h1>

        <div className="flex flex-col gap-8 text-sm leading-relaxed text-body-strong">
          <section className="bg-surface-card border border-hairline rounded-lg p-6">
            <h2 className="text-lg font-semibold text-ink mb-3">1. Spaced Repetition (SM-2 Algorithm)</h2>
            <p className="mb-4">
              DSA Revision Hub uses a customized implementation of the SuperMemo-2 (SM-2) memory decay formula. It calculates the optimal next revision interval based on your rating inputs:
            </p>
            <ul className="list-disc pl-5 flex flex-col gap-2 mb-4">
              <li><strong>Forgot (Rating: 1):</strong> The question interval is reset to 1 day. The topic is flagged for review tomorrow, and the ease factor is reduced.</li>
              <li><strong>Hard Recall (Rating: 2):</strong> The ease factor is reduced slightly. The interval increases at a slower rate.</li>
              <li><strong>Easy Recall (Rating: 3):</strong> The ease factor increases, allowing the interval to expand rapidly, pushing the next review further into the future.</li>
            </ul>
            <div className="bg-surface-soft p-4 rounded font-mono text-xs text-ink">
              Next Interval = Current Interval * Ease Factor
            </div>
          </section>

          <section className="bg-surface-card border border-hairline rounded-lg p-6">
            <h2 className="text-lg font-semibold text-ink mb-3">2. Pattern Classification</h2>
            <p>
              By dividing LeetCode problems into key algorithmic categories (such as <em>Sliding Window</em>, <em>Two Pointers</em>, <em>Fast and Slow Pointers</em>, <em>Tree DFS/BFS</em>), the revision hub allows you to build targeted spatial recognition skills. The integrated AI Classifier automatically parses your question title and notes to suggest the most appropriate pattern structure.
            </p>
          </section>

          <section className="bg-surface-card border border-hairline rounded-lg p-6">
            <h2 className="text-lg font-semibold text-ink mb-3">3. How to Revise</h2>
            <ol className="list-decimal pl-5 flex flex-col gap-2">
              <li>Log your solved questions, choosing their algorithmic patterns and difficulty levels.</li>
              <li>Visit the <strong>Dashboard</strong> daily to view questions scheduled for active recall.</li>
              <li>Click <strong>Start Revision</strong> to test yourself in the interactive card deck.</li>
              <li>Grade your performance honestly using the rating buttons to update the decay model.</li>
            </ol>
          </section>
        </div>
      </main>
    </div>
  );
}
