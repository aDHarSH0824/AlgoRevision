"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "../components/Header";
import { api } from "../services/api";

interface Pattern {
  id: string;
  name: string;
}

interface Question {
  _id: string;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  platform: string;
  url?: string;
  notes?: string;
  patternId: {
    _id: string;
    name: string;
  };
}

export default function Revision() {
  const [patterns, setPatterns] = useState<Pattern[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState("");

  // Setup View Options
  const [sessionSize, setSessionSize] = useState(5);
  const [selectedPatterns, setSelectedPatterns] = useState<string[]>([]);
  const [selectedDiffs, setSelectedDiffs] = useState<string[]>(["Easy", "Medium", "Hard"]);
  
  // Game/Deck Flow State
  const [sessionActive, setSessionActive] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [revealNotes, setRevealNotes] = useState(false);
  const [ratingsSubmitted, setRatingsSubmitted] = useState<string[]>([]);
  const [sessionFinished, setSessionFinished] = useState(false);

  useEffect(() => {
    async function loadPatterns() {
      try {
        const res = await api.patterns.list();
        if (res.status === "success" && res.data?.patterns) {
          setPatterns(res.data.patterns);
          // Select all patterns by default
          setSelectedPatterns(res.data.patterns.map((p: any) => p.id));
        }
      } catch (err) {
        console.error("Failed to load patterns", err);
      } finally {
        setInitialLoading(false);
      }
    }
    loadPatterns();
  }, []);

  const handleTogglePattern = (id: string) => {
    setSelectedPatterns((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const handleToggleDiff = (diff: string) => {
    setSelectedDiffs((prev) =>
      prev.includes(diff) ? prev.filter((d) => d !== diff) : [...prev, diff]
    );
  };

  const handleStartSession = async () => {
    if (selectedPatterns.length === 0) {
      alert("Please select at least one pattern category.");
      return;
    }
    if (selectedDiffs.length === 0) {
      alert("Please select at least one difficulty option.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      
      const res = await api.revisions.generate({
        count: sessionSize,
        patternIds: selectedPatterns,
        difficulties: selectedDiffs,
      });

      if (res.status === "success" && res.data?.questions) {
        if (res.data.questions.length === 0) {
          setError("No revision questions due or matching these parameters. Add more solved questions to your index.");
        } else {
          setQuestions(res.data.questions);
          setSessionActive(true);
          setCurrentIndex(0);
          setRevealNotes(false);
          setRatingsSubmitted([]);
          setSessionFinished(false);
        }
      }
    } catch (err: any) {
      setError(err.message || "Failed to generate revision session.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitRating = async (rating: "Forgot" | "Hard Recall" | "Easy Recall") => {
    const activeQuestion = questions[currentIndex];
    try {
      // Optimistic transition triggers call in background
      setRatingsSubmitted((prev) => [...prev, rating]);
      
      await api.revisions.submit(activeQuestion._id, rating);
      
      if (currentIndex + 1 < questions.length) {
        setCurrentIndex((prev) => prev + 1);
        setRevealNotes(false);
      } else {
        setSessionFinished(true);
        setSessionActive(false);
      }
    } catch (err: any) {
      console.error(err);
      alert("Failed to submit rating. Check backend connectivity.");
    }
  };

  if (initialLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-canvas text-ink">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-4 border-hairline border-t-primary animate-spin"></div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-canvas text-ink">
      <Header />

      <main className="flex-grow max-w-4xl w-full mx-auto px-6 py-10 flex flex-col justify-center">
        
        {/* SETUP SCREEN */}
        {!sessionActive && !sessionFinished && (
          <section className="bg-surface-card border border-hairline rounded-lg p-6 md:p-8 flex flex-col gap-6 max-w-2xl mx-auto w-full text-left">
            <div>
              <h1 className="font-serif text-2xl font-normal text-ink">Configure Active Recall Deck</h1>
              <p className="text-body text-xs mt-1">Select topics and difficulty boundaries for your spaced repetition set.</p>
            </div>

            {error && (
              <div className="p-3 bg-error/10 border border-error text-error text-xs rounded font-medium">
                {error}
              </div>
            )}

            {/* Session Size */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-body">Session Set Size</label>
              <div className="flex gap-4">
                {[3, 5, 10, 15].map((size) => (
                  <button
                    key={size}
                    onClick={() => setSessionSize(size)}
                    className={`flex-1 h-9 rounded text-xs font-semibold border transition-all cursor-pointer ${
                      sessionSize === size
                        ? "bg-primary border-primary text-on-primary"
                        : "bg-canvas border-hairline text-muted hover:text-ink hover:bg-surface-soft"
                    }`}
                  >
                    {size} Questions
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulties */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-body">Difficulties</label>
              <div className="flex gap-4">
                {["Easy", "Medium", "Hard"].map((diff) => {
                  const isSelected = selectedDiffs.includes(diff);
                  return (
                    <button
                      key={diff}
                      onClick={() => handleToggleDiff(diff)}
                      className={`flex-1 h-9 rounded text-xs font-semibold border transition-all cursor-pointer ${
                        isSelected
                          ? "bg-primary/10 border-primary text-primary"
                          : "bg-canvas border-hairline text-muted hover:text-ink hover:bg-surface-soft"
                      }`}
                    >
                      {diff}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Categories list */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-body">Study Categories</label>
              {patterns.length > 0 ? (
                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto border border-hairline-soft p-3 bg-canvas rounded-md">
                  {patterns.map((pat) => {
                    const isSelected = selectedPatterns.includes(pat.id);
                    return (
                      <label
                        key={pat.id}
                        className="flex items-center gap-2 text-xs font-semibold text-body-strong cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleTogglePattern(pat.id)}
                          className="w-3.5 h-3.5 border-hairline text-primary focus:ring-primary rounded"
                        />
                        {pat.name}
                      </label>
                    );
                  })}
                </div>
              ) : (
                <div className="text-xs text-muted py-2">
                  No pattern categories created yet. Add patterns under the Patterns tab.
                </div>
              )}
            </div>

            <button
              onClick={handleStartSession}
              disabled={loading || patterns.length === 0}
              className="w-full h-11 bg-primary hover:bg-primary-active text-on-primary text-sm font-semibold rounded-md transition-colors mt-2 flex items-center justify-center cursor-pointer disabled:bg-primary-disabled"
            >
              {loading ? "Generating Set..." : "Launch Session"}
            </button>
          </section>
        )}

        {/* ACTIVE DECK SESSION SCREEN */}
        {sessionActive && questions.length > 0 && (
          <section className="flex flex-col gap-6 max-w-xl mx-auto w-full">
            {/* Progress tracker */}
            <div className="flex flex-col gap-2.5">
              <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-muted">
                <span>ACTIVE SESSION</span>
                <span>
                  Card {currentIndex + 1} of {questions.length}
                </span>
              </div>
              <div className="w-full h-1.5 bg-surface-card border border-hairline rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-300 ease-out"
                  style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Flashcard container */}
            <div className="bg-surface-card card-dotted-grid border border-hairline rounded-lg p-6 md:p-8 flex flex-col justify-between min-h-[380px] shadow-xs hover:shadow-md transition-all duration-300 relative overflow-hidden text-left">
              
              {/* Question metadata */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] uppercase font-bold tracking-wider text-muted flex items-center gap-1.5 bg-canvas/80 px-2 py-1 rounded border border-hairline-soft">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent-teal"></span>
                  {questions[currentIndex].patternId?.name || "General"}
                </span>
                
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-pill ${
                  questions[currentIndex].difficulty === "Easy" ? "bg-success/15 text-success" :
                  questions[currentIndex].difficulty === "Medium" ? "bg-accent-amber/15 text-accent-amber" :
                  "bg-error/15 text-error"
                }`}>
                  {questions[currentIndex].difficulty}
                </span>
              </div>

              {/* Title block */}
              <div className="flex-grow flex flex-col justify-center items-center text-center my-6 bg-canvas/40 backdrop-blur-xs p-6 rounded-lg border border-hairline-soft/40">
                <h2 className="font-serif text-2xl md:text-3xl font-normal text-ink leading-tight">
                  {questions[currentIndex].title}
                </h2>
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-soft block mt-2">
                  {questions[currentIndex].platform}
                </span>
                
                {questions[currentIndex].url && (
                  <a
                    href={questions[currentIndex].url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 px-3.5 py-1.5 text-[11px] font-semibold border border-hairline bg-canvas hover:bg-surface-soft text-muted hover:text-ink rounded-md flex items-center gap-1.5 transition-all duration-150"
                  >
                    Open Platform Practice Link
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                )}
              </div>

              {/* Reveal Notes button or actual text */}
              <div className="border-t border-hairline pt-4 mt-auto">
                {!revealNotes ? (
                  <button
                    onClick={() => setRevealNotes(true)}
                    className="w-full py-2.5 border border-dashed border-hairline text-muted hover:text-ink text-xs font-semibold rounded hover:bg-canvas/90 transition-all duration-150 cursor-pointer"
                  >
                    Reveal Recall Notes & Approach
                  </button>
                ) : (
                  <div className="bg-canvas/95 backdrop-blur-xs border border-hairline-soft rounded-lg p-4 max-h-[140px] overflow-y-auto text-xs text-body leading-relaxed shadow-inner">
                    <div className="font-semibold text-body-strong mb-1">Solved Notes / Approach:</div>
                    <p className="whitespace-pre-wrap">{questions[currentIndex].notes || "No notes logged for this problem. Document your approach during solve tracking."}</p>
                  </div>
                )}
              </div>
            </div>

            {/* SRS Rating Actions Row */}
            <div className="flex gap-3">
              <button
                onClick={() => handleSubmitRating("Forgot")}
                className="flex-1 h-14 rounded-lg bg-error/10 hover:bg-error/20 border border-error/30 text-error text-xs font-semibold transition-all duration-200 flex flex-col items-center justify-center gap-0.5 cursor-pointer hover:-translate-y-0.5 active:translate-y-0 shadow-xs"
              >
                <span className="font-bold">Forgot</span>
                <span className="text-[9px] opacity-80 font-normal">Next: 1 Day</span>
              </button>

              <button
                onClick={() => handleSubmitRating("Hard Recall")}
                className="flex-1 h-14 rounded-lg bg-accent-amber/10 hover:bg-accent-amber/20 border border-accent-amber/30 text-accent-amber text-xs font-semibold transition-all duration-200 flex flex-col items-center justify-center gap-0.5 cursor-pointer hover:-translate-y-0.5 active:translate-y-0 shadow-xs"
              >
                <span className="font-bold">Hard Recall</span>
                <span className="text-[9px] opacity-80 font-normal">Slightly shorter gap</span>
              </button>

              <button
                onClick={() => handleSubmitRating("Easy Recall")}
                className="flex-1 h-14 rounded-lg bg-success/10 hover:bg-success/20 border border-success/30 text-success text-xs font-semibold transition-all duration-200 flex flex-col items-center justify-center gap-0.5 cursor-pointer hover:-translate-y-0.5 active:translate-y-0 shadow-xs"
              >
                <span className="font-bold">Easy Recall</span>
                <span className="text-[9px] opacity-80 font-normal">Increase interval</span>
              </button>
            </div>

            {/* Cancel trigger */}
            <button
              onClick={() => {
                if(confirm("Exit revision session? Progress will be saved for rated cards.")) {
                  setSessionActive(false);
                  setSessionFinished(false);
                }
              }}
              className="text-muted hover:text-ink text-xs font-semibold transition-colors mt-2"
            >
              Exit Session
            </button>
          </section>
        )}

        {/* FINISHED SCREEN SUMMARY */}
        {sessionFinished && (
          <section className="bg-surface-card border border-hairline rounded-lg p-6 md:p-8 flex flex-col gap-6 max-w-md mx-auto w-full text-center items-center">
            <div className="w-12 h-12 rounded-full bg-success/15 text-success flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>

            <div>
              <h1 className="font-serif text-2xl font-normal text-ink">Recall Session Complete</h1>
              <p className="text-body text-xs mt-1">SuperMemo interval values updated in your spaced Repetition database.</p>
            </div>

            {/* Performance breakdown card */}
            <div className="bg-canvas border border-hairline-soft rounded-md p-4 w-full flex flex-col gap-3 text-left">
              <div className="text-[10px] font-bold text-muted uppercase tracking-wider">Set Performance</div>
              <div className="flex justify-between items-center text-xs font-semibold">
                <span className="text-body">Total Reviewed:</span>
                <span className="text-body-strong font-bold">{questions.length} questions</span>
              </div>
              <div className="flex justify-between items-center text-xs font-semibold text-success">
                <span>Easy Recalls:</span>
                <span className="font-bold">{ratingsSubmitted.filter(r => r === "Easy Recall").length}</span>
              </div>
              <div className="flex justify-between items-center text-xs font-semibold text-accent-amber">
                <span>Hard Recalls:</span>
                <span className="font-bold">{ratingsSubmitted.filter(r => r === "Hard Recall").length}</span>
              </div>
              <div className="flex justify-between items-center text-xs font-semibold text-error">
                <span>Forgot / Rescheduled:</span>
                <span className="font-bold">{ratingsSubmitted.filter(r => r === "Forgot").length}</span>
              </div>
            </div>

            <div className="flex gap-3 w-full mt-2">
              <Link
                href="/dashboard"
                className="flex-1 h-10 bg-canvas border border-hairline hover:bg-surface-soft text-ink text-xs font-semibold rounded-md transition-all duration-150 flex items-center justify-center cursor-pointer"
              >
                Dashboard
              </Link>
              <button
                onClick={() => setSessionFinished(false)}
                className="flex-1 h-10 bg-primary hover:bg-primary-active text-on-primary text-xs font-semibold rounded-md transition-all duration-150 cursor-pointer"
              >
                Start New Session
              </button>
            </div>
          </section>
        )}

      </main>
    </div>
  );
}
