"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "../components/Header";
import { api } from "../services/api";

interface Pattern {
  id: string;
  name: string;
  solvedCount: number;
}

interface TestQuestion {
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  platform: string;
  url: string;
  completed: boolean;
}

const DEFAULT_PATTERN_QUESTIONS: { [patternName: string]: Array<{ title: string; difficulty: "Easy" | "Medium" | "Hard"; platform: string; url: string }> } = {
  "sliding window": [
    { title: "Leetcode 3: Longest Substring Without Repeating Characters", difficulty: "Medium", platform: "LeetCode", url: "https://leetcode.com/problems/longest-substring-without-repeating-characters/" },
    { title: "Leetcode 209: Minimum Size Subarray Sum", difficulty: "Medium", platform: "LeetCode", url: "https://leetcode.com/problems/minimum-size-subarray-sum/" },
    { title: "Leetcode 76: Minimum Window Substring", difficulty: "Hard", platform: "LeetCode", url: "https://leetcode.com/problems/minimum-window-substring/" },
    { title: "Leetcode 438: Find All Anagrams in a String", difficulty: "Medium", platform: "LeetCode", url: "https://leetcode.com/problems/find-all-anagrams-in-a-string/" },
    { title: "Leetcode 567: Permutation in String", difficulty: "Medium", platform: "LeetCode", url: "https://leetcode.com/problems/permutation-in-string/" }
  ],
  "two pointers": [
    { title: "Leetcode 125: Valid Palindrome", difficulty: "Easy", platform: "LeetCode", url: "https://leetcode.com/problems/valid-palindrome/" },
    { title: "Leetcode 167: Two Sum II - Input Array Is Sorted", difficulty: "Medium", platform: "LeetCode", url: "https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/" },
    { title: "Leetcode 15: 3Sum", difficulty: "Medium", platform: "LeetCode", url: "https://leetcode.com/problems/3sum/" },
    { title: "Leetcode 11: Container With Most Water", difficulty: "Medium", platform: "LeetCode", url: "https://leetcode.com/problems/container-with-most-water/" },
    { title: "Leetcode 42: Trapping Rain Water", difficulty: "Hard", platform: "LeetCode", url: "https://leetcode.com/problems/trapping-rain-water/" }
  ],
  "fast & slow pointers": [
    { title: "Leetcode 141: Linked List Cycle", difficulty: "Easy", platform: "LeetCode", url: "https://leetcode.com/problems/linked-list-cycle/" },
    { title: "Leetcode 142: Linked List Cycle II", difficulty: "Medium", platform: "LeetCode", url: "https://leetcode.com/problems/linked-list-cycle-ii/" },
    { title: "Leetcode 202: Happy Number", difficulty: "Easy", platform: "LeetCode", url: "https://leetcode.com/problems/happy-number/" },
    { title: "Leetcode 876: Middle of the Linked List", difficulty: "Easy", platform: "LeetCode", url: "https://leetcode.com/problems/middle-of-the-linked-list/" },
    { title: "Leetcode 234: Palindrome Linked List", difficulty: "Easy", platform: "LeetCode", url: "https://leetcode.com/problems/palindrome-linked-list/" }
  ]
};

const getFallbackQuestions = (patternName: string): Array<{ title: string; difficulty: "Easy" | "Medium" | "Hard"; platform: string; url: string }> => {
  const norm = patternName.toLowerCase().trim();
  for (const k of Object.keys(DEFAULT_PATTERN_QUESTIONS)) {
    if (norm.includes(k) || k.includes(norm)) {
      return DEFAULT_PATTERN_QUESTIONS[k];
    }
  }
  return [
    { title: `Leetcode 101: Basic ${patternName} Pattern Analysis`, difficulty: "Easy", platform: "LeetCode", url: "https://leetcode.com/" },
    { title: `Leetcode 202: Intermediate ${patternName} Array Challenge`, difficulty: "Medium", platform: "LeetCode", url: "https://leetcode.com/" },
    { title: `Leetcode 303: Advanced ${patternName} Optimization`, difficulty: "Hard", platform: "LeetCode", url: "https://leetcode.com/" },
    { title: `Leetcode 404: Complex ${patternName} Substructure Search`, difficulty: "Medium", platform: "LeetCode", url: "https://leetcode.com/" },
    { title: `Leetcode 505: ${patternName} Edge-Case Validation`, difficulty: "Hard", platform: "LeetCode", url: "https://leetcode.com/" }
  ];
};

export default function TestMaker() {
  const [patterns, setPatterns] = useState<Pattern[]>([]);
  const [selectedPatternIds, setSelectedPatternIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Test Running States
  const [testActive, setTestActive] = useState(false);
  const [testQuestions, setTestQuestions] = useState<TestQuestion[]>([]);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [timerIntervalId, setTimerIntervalId] = useState<NodeJS.Timeout | null>(null);

  // Test Result States
  const [showResults, setShowResults] = useState(false);
  const [finalTime, setFinalTime] = useState(0);
  const [score, setScore] = useState(0);

  const fetchPatterns = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await api.patterns.list();
      if (res.status === "success" && res.data?.patterns) {
        setPatterns(res.data.patterns);
      }
    } catch (err: any) {
      console.error(err);
      setError("Failed to fetch study patterns. Verify that the backend is active.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatterns();
  }, []);

  // Timer runner
  useEffect(() => {
    if (testActive && !showResults) {
      const id = setInterval(() => {
        setTimeElapsed((prev) => prev + 1);
      }, 1000);
      setTimerIntervalId(id);
      return () => clearInterval(id);
    } else {
      if (timerIntervalId) clearInterval(timerIntervalId);
    }
  }, [testActive, showResults]);

  const handleTogglePattern = (id: string) => {
    setSelectedPatternIds((prev) =>
      prev.includes(id) ? prev.filter((pId) => pId !== id) : [...prev, id]
    );
  };

  const handleGenerateTest = async () => {
    if (selectedPatternIds.length === 0) {
      alert("Please select at least one pattern to generate questions.");
      return;
    }

    try {
      setError("");
      setLoading(true);

      // 1. Fetch user's logged questions under the selected patterns
      const promises = selectedPatternIds.map((patternId) =>
        api.questions.list({ patternId })
      );
      const responses = await Promise.all(promises);

      let pool: Array<{ title: string; difficulty: "Easy" | "Medium" | "Hard"; platform: string; url: string }> = [];

      responses.forEach((res, index) => {
        if (res.status === "success" && res.data?.questions) {
          const userQuestions = res.data.questions.map((q: any) => ({
            title: q.title,
            difficulty: q.difficulty as "Easy" | "Medium" | "Hard",
            platform: q.platform,
            url: q.url || "https://leetcode.com/",
          }));
          pool = [...pool, ...userQuestions];
        }

        // If not enough questions logged in this pattern, supplement with standard practice pool questions
        const patternName = patterns.find((p) => p.id === selectedPatternIds[index])?.name || "";
        const fallbackSet = getFallbackQuestions(patternName);
        pool = [...pool, ...fallbackSet];
      });

      // Remove duplicate questions based on title
      const uniquePool: typeof pool = [];
      const seenTitles = new Set<string>();
      pool.forEach((q) => {
        const cleanTitle = q.title.toLowerCase().trim();
        if (!seenTitles.has(cleanTitle)) {
          seenTitles.add(cleanTitle);
          uniquePool.push(q);
        }
      });

      // 2. Select 5 random questions from the unique pool
      const shuffled = [...uniquePool].sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, 5).map((q) => ({
        ...q,
        completed: false,
      }));

      setTestQuestions(selected);
      setTimeElapsed(0);
      setTestActive(true);
      setShowResults(false);
    } catch (err: any) {
      console.error(err);
      setError("Failed to assemble mock test. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleQuestionComplete = (index: number) => {
    setTestQuestions((prev) =>
      prev.map((q, idx) => (idx === index ? { ...q, completed: !q.completed } : q))
    );
  };

  const handleSubmitTest = () => {
    const finalScore = testQuestions.filter((q) => q.completed).length;
    setScore(finalScore);
    setFinalTime(timeElapsed);
    setShowResults(true);
  };

  const handleResetTest = () => {
    setTestActive(false);
    setShowResults(false);
    setTimeElapsed(0);
    setTestQuestions([]);
  };

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return [
      hrs.toString().padStart(2, "0"),
      mins.toString().padStart(2, "0"),
      secs.toString().padStart(2, "0"),
    ].join(":");
  };

  return (
    <div className="flex flex-col min-h-screen bg-canvas text-ink">
      <Header />

      <main className="flex-grow max-w-4xl w-full mx-auto px-6 py-10 flex flex-col gap-8">
        <div>
          <h1 className="font-serif text-3xl font-normal tracking-tight text-ink">Virtual Mock Test Maker</h1>
          <p className="text-body text-sm mt-1">Select your study topics and test your knowledge under pressure.</p>
        </div>

        {error && (
          <div className="p-4 rounded-md bg-error/10 border border-error text-error text-sm font-medium">
            {error}
          </div>
        )}

        {loading && !testActive ? (
          <div className="py-20 text-center text-muted text-sm font-semibold uppercase tracking-wider">
            Fetching practice categories...
          </div>
        ) : !testActive ? (
          /* Selection Screen */
          <section className="bg-surface-card border border-hairline rounded-lg p-6 flex flex-col gap-6 text-left">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-muted mb-2">Step 1: Select Patterns</h2>
              <p className="text-xs text-body">Choose one or more study topics. We will compose a 5-question test containing random questions from these patterns.</p>
            </div>

            {patterns.length > 0 ? (
              <div className="grid sm:grid-cols-2 gap-4">
                {patterns.map((pat) => {
                  const isSelected = selectedPatternIds.includes(pat.id);
                  return (
                    <div
                      key={pat.id}
                      onClick={() => handleTogglePattern(pat.id)}
                      className={`p-4 border rounded-md cursor-pointer transition-all flex items-center justify-between ${
                        isSelected
                          ? "bg-primary/5 border-primary"
                          : "bg-canvas border-hairline hover:bg-surface-soft"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          readOnly
                          className="w-4 h-4 rounded border-hairline text-primary focus:ring-primary cursor-pointer"
                        />
                        <span className="text-sm font-semibold text-body-strong">{pat.name}</span>
                      </div>
                      <span className="text-[10px] bg-surface-soft border border-hairline-soft px-2 py-0.5 rounded text-muted font-bold">
                        {pat.solvedCount} Solved
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-10 border border-dashed border-hairline rounded text-center text-muted text-xs">
                No patterns logged yet. Please create a pattern category first under the Patterns tab.
              </div>
            )}

            <div className="border-t border-hairline-soft pt-4 flex justify-end">
              <button
                onClick={handleGenerateTest}
                disabled={patterns.length === 0 || selectedPatternIds.length === 0}
                className="px-6 py-2.5 bg-primary hover:bg-primary-active text-on-primary disabled:bg-primary-disabled text-sm font-semibold rounded-md shadow-sm transition-all duration-150 cursor-pointer"
              >
                Generate 5-Question Test
              </button>
            </div>
          </section>
        ) : (
          /* Live Test Screen */
          <section className="flex flex-col gap-6 text-left">
            {/* Timer and Controls Header */}
            <div className="bg-surface-card border border-hairline rounded-lg p-5 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-error animate-ping"></span>
                <span className="text-xs font-bold uppercase tracking-wider text-muted">Test in Progress</span>
              </div>

              <div className="flex items-center gap-6">
                <div className="flex flex-col items-center sm:items-end">
                  <span className="text-[10px] text-muted font-bold uppercase tracking-wider">Elapsed Time</span>
                  <span className="font-mono text-2xl font-bold text-ink tracking-wide mt-0.5">
                    {formatTime(timeElapsed)}
                  </span>
                </div>

                <button
                  onClick={handleResetTest}
                  className="px-4 py-2 border border-hairline hover:bg-surface-soft hover:text-ink text-muted text-xs font-semibold rounded transition-all cursor-pointer"
                >
                  Quit Test
                </button>
              </div>
            </div>

            {/* Questions Grid */}
            <div className="flex flex-col gap-4">
              {testQuestions.map((q, idx) => (
                <div
                  key={idx}
                  className={`bg-surface-card border rounded-lg p-5 flex items-center justify-between gap-4 transition-all ${
                    q.completed ? "border-success/35 bg-success/5 opacity-80" : "border-hairline"
                  }`}
                >
                  <div className="flex items-center gap-4 truncate">
                    {/* Status Checkbox */}
                    <input
                      type="checkbox"
                      checked={q.completed}
                      disabled={showResults}
                      onChange={() => handleToggleQuestionComplete(idx)}
                      className="w-5 h-5 rounded border-hairline text-success focus:ring-success cursor-pointer"
                      title="Mark as completed"
                    />

                    <div className="truncate text-left">
                      <h3 className={`text-sm font-semibold truncate ${q.completed ? "line-through text-muted" : "text-body-strong"}`}>
                        {idx + 1}. {q.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                          q.difficulty === "Easy" ? "bg-success/15 text-success" :
                          q.difficulty === "Medium" ? "bg-accent-amber/15 text-accent-amber" :
                          "bg-error/15 text-error"
                        }`}>
                          {q.difficulty}
                        </span>
                        <span className="text-[10px] text-muted font-semibold uppercase tracking-wider">
                          {q.platform}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Open Question Link */}
                  <a
                    href={q.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 border border-hairline hover:bg-surface-soft rounded text-muted hover:text-ink text-xs font-semibold transition-all flex items-center gap-1.5 flex-shrink-0"
                  >
                    Solve ↗
                  </a>
                </div>
              ))}
            </div>

            {/* Bottom Actions */}
            {!showResults && (
              <div className="flex justify-end mt-4">
                <button
                  onClick={handleSubmitTest}
                  className="px-6 py-3 bg-success hover:bg-success/90 text-white text-sm font-semibold rounded-md shadow-sm transition-all duration-150 cursor-pointer"
                >
                  Submit Test
                </button>
              </div>
            )}

            {/* Results Overlay Card */}
            {showResults && (
              <div className="bg-surface-card border-2 border-primary rounded-lg p-6 flex flex-col gap-5 text-center items-center mt-6 shadow-xl animate-fade-in">
                <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-1">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>

                <div>
                  <h2 className="font-serif text-2xl font-normal text-ink">Test Complete!</h2>
                  <p className="text-body text-xs mt-1">Here is your virtual mock test report breakdown.</p>
                </div>

                <div className="grid grid-cols-2 gap-8 py-3 px-8 bg-canvas border border-hairline rounded-md w-full max-w-md">
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-muted font-bold block">Final Score</span>
                    <span className="text-3xl font-bold text-ink mt-1 block">{score} / 5</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-muted font-bold block">Total Time Taken</span>
                    <span className="text-2xl font-mono font-bold text-ink mt-1.5 block">{formatTime(finalTime)}</span>
                  </div>
                </div>

                <p className="text-xs text-body max-w-sm leading-relaxed mt-1">
                  {score === 5 ? "Perfect score! Outstanding coding performance." :
                   score >= 3 ? "Great job! Keep practicing to resolve edge cases." :
                   "Good attempt. Use active recall revision to solidify your understanding."}
                </p>

                <div className="flex gap-3 justify-center mt-3">
                  <button
                    onClick={handleResetTest}
                    className="px-5 py-2.5 bg-primary hover:bg-primary-active text-on-primary text-xs font-semibold rounded shadow transition-all cursor-pointer"
                  >
                    Finish & Exit
                  </button>
                  <button
                    onClick={handleGenerateTest}
                    className="px-5 py-2.5 bg-canvas border border-hairline hover:bg-surface-soft text-ink text-xs font-semibold rounded shadow transition-all cursor-pointer"
                  >
                    Retake Test
                  </button>
                </div>
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
