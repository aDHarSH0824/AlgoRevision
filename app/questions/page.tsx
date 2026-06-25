"use client";

import { useEffect, useState } from "react";
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
  patternId: Pattern;
  nextRevisionAt: string;
  revisionCount: number;
}

export default function Questions() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [patterns, setPatterns] = useState<Pattern[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Filter States
  const [search, setSearch] = useState("");
  const [filterPattern, setFilterPattern] = useState("");
  const [filterDifficulty, setFilterDifficulty] = useState("");

  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState("");
  const [difficulty, setDifficulty] = useState("Easy");
  const [platform, setPlatform] = useState("LeetCode");
  const [url, setUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [patternId, setPatternId] = useState("");
  
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      
      // Fetch patterns first to populate filters and dropdowns
      const patternsRes = await api.patterns.list();
      if (patternsRes.status === "success" && patternsRes.data?.patterns) {
        setPatterns(patternsRes.data.patterns);
      }

      // Fetch questions list matching filters
      const questionsRes = await api.questions.list({
        search: search || undefined,
        patternId: filterPattern || undefined,
        difficulty: filterDifficulty || undefined,
      });

      if (questionsRes.status === "success" && questionsRes.data?.questions) {
        setQuestions(questionsRes.data.questions);
      }
    } catch (err: any) {
      console.error(err);
      setError("Failed to load questions data from backend.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [search, filterPattern, filterDifficulty]);



  const handleCreateQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !patternId) {
      alert("Please fill in the title and select an active category pattern.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      setSuccessMsg("");
      
      const res = await api.questions.create({
        title,
        difficulty,
        platform,
        url: url.trim() || undefined,
        notes: notes.trim() || undefined,
        patternId,
      });

      if (res.status === "success") {
        setSuccessMsg(`Question "${title}" created and added to Spaced Repetition queue!`);
        setTitle("");
        setUrl("");
        setNotes("");
        setPatternId("");
        setShowAddModal(false);
        loadData();
      }
    } catch (err: any) {
      setError(err.message || "Failed to create coding question.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteQuestion = async (id: string, qTitle: string) => {
    const confirmed = window.confirm(`Delete question "${qTitle}"?`);
    if (!confirmed) return;

    try {
      setError("");
      const res = await api.questions.delete(id);
      if (res.status === "success") {
        loadData();
      }
    } catch (err: any) {
      setError(err.message || "Failed to delete question.");
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    today.setHours(0,0,0,0);
    const dateCheck = new Date(dateStr);
    dateCheck.setHours(0,0,0,0);

    if (dateCheck <= today) {
      return "Due Now";
    }
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  return (
    <div className="flex flex-col min-h-screen bg-canvas text-ink">
      <Header />

      <main className="flex-grow max-w-6xl w-full mx-auto px-6 py-10 flex flex-col gap-8">
        
        {/* Title Block */}
        <section className="flex justify-between items-center">
          <div>
            <h1 className="font-serif text-3xl font-normal tracking-tight">Questions Index</h1>
            <p className="text-body text-sm mt-1">Review solved code cards, search by patterns, and trigger active recall checks.</p>
          </div>
          
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-primary hover:bg-primary-active text-on-primary text-xs font-semibold rounded-md transition-all duration-150 cursor-pointer"
          >
            Add Question
          </button>
        </section>

        {error && (
          <div className="p-4 rounded-md bg-error/10 border border-error text-error text-sm font-medium">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="p-4 rounded-md bg-success/10 border border-success text-success text-sm font-medium">
            {successMsg}
          </div>
        )}

        {/* Filter Controls Row */}
        <section className="bg-surface-card border border-hairline rounded-lg p-5 grid sm:grid-cols-3 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-muted uppercase tracking-wider">Search</label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by problem title..."
              className="h-10 px-3 border border-hairline bg-canvas rounded-md text-xs text-ink focus:outline-none focus:border-primary"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-muted uppercase tracking-wider">Pattern</label>
            <select
              value={filterPattern}
              onChange={(e) => setFilterPattern(e.target.value)}
              className="h-10 px-3 border border-hairline bg-canvas rounded-md text-xs text-ink focus:outline-none focus:border-primary"
            >
              <option value="">All Patterns</option>
              {patterns.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-muted uppercase tracking-wider">Difficulty</label>
            <select
              value={filterDifficulty}
              onChange={(e) => setFilterDifficulty(e.target.value)}
              className="h-10 px-3 border border-hairline bg-canvas rounded-md text-xs text-ink focus:outline-none focus:border-primary"
            >
              <option value="">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>
        </section>

        {/* Add Question Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-ink/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <div className="bg-canvas border border-hairline rounded-lg p-6 max-w-lg w-full shadow-xl flex flex-col gap-4 text-left">
              <div className="flex justify-between items-center border-b border-hairline pb-3">
                <h2 className="font-serif text-xl font-normal">Add Solved Question</h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-muted hover:text-ink text-sm cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateQuestion} className="flex flex-col gap-3.5">
                <div className="flex flex-col gap-1">
                  <label htmlFor="modal-title" className="text-xs font-semibold text-body">
                    Problem Title
                  </label>
                  <input
                    id="modal-title"
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Longest Substring Without Repeating Characters"
                    className="w-full h-10 px-3 border border-hairline bg-canvas rounded-md text-xs focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label htmlFor="modal-diff" className="text-xs font-semibold text-body">
                      Difficulty
                    </label>
                    <select
                      id="modal-diff"
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value)}
                      className="h-10 px-3 border border-hairline bg-canvas rounded-md text-xs focus:outline-none focus:border-primary"
                    >
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label htmlFor="modal-plat" className="text-xs font-semibold text-body">
                      Coding Platform
                    </label>
                    <select
                      id="modal-plat"
                      value={platform}
                      onChange={(e) => setPlatform(e.target.value)}
                      className="h-10 px-3 border border-hairline bg-canvas rounded-md text-xs focus:outline-none focus:border-primary"
                    >
                      <option value="LeetCode">LeetCode</option>
                      <option value="HackerRank">HackerRank</option>
                      <option value="GeeksforGeeks">GeeksforGeeks</option>
                      <option value="Codeforces">Codeforces</option>
                      <option value="Custom">Custom / Offline</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label htmlFor="modal-pat" className="text-xs font-semibold text-body">
                      Pattern Category
                    </label>
                    <select
                      id="modal-pat"
                      required
                      value={patternId}
                      onChange={(e) => setPatternId(e.target.value)}
                      className="h-10 px-3 border border-hairline bg-canvas rounded-md text-xs focus:outline-none focus:border-primary"
                    >
                      <option value="">Select Category...</option>
                      {patterns.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label htmlFor="modal-url" className="text-xs font-semibold text-body">
                      Problem Link (URL)
                    </label>
                    <input
                      id="modal-url"
                      type="url"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="https://leetcode.com/problems/..."
                      className="h-10 px-3 border border-hairline bg-canvas rounded-md text-xs focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label htmlFor="modal-notes" className="text-xs font-semibold text-body">
                    Analysis Notes
                  </label>
                  <textarea
                    id="modal-notes"
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Document your solved approach details, visual states, complexity constraints..."
                    className="p-3 border border-hairline bg-canvas rounded-md text-xs focus:outline-none focus:border-primary resize-y"
                  />
                </div>

                <div className="flex justify-end gap-3 mt-3 border-t border-hairline pt-3">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 border border-hairline text-muted hover:text-ink text-xs font-semibold rounded-md cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 bg-primary hover:bg-primary-active text-on-primary text-xs font-semibold rounded-md cursor-pointer"
                  >
                    {submitting ? "Saving..." : "Add to Queue"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Questions Data Table */}
        <section className="bg-surface-card border border-hairline rounded-lg overflow-hidden">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-canvas border-b border-hairline text-muted font-bold uppercase tracking-wider text-[10px]">
                  <th className="p-4 pl-6">Title</th>
                  <th className="p-4">Pattern</th>
                  <th className="p-4">Difficulty</th>
                  <th className="p-4">Platform</th>
                  <th className="p-4">Next Revision</th>
                  <th className="p-4 text-right pr-6">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline-soft">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="p-12 text-center text-muted font-semibold">
                      Refreshing questions list...
                    </td>
                  </tr>
                ) : questions.length > 0 ? (
                  questions.map((q) => (
                    <tr key={q._id} className="hover:bg-canvas/50 transition-colors">
                      <td className="p-4 pl-6 font-semibold text-body-strong">
                        <div className="flex items-center gap-2">
                          <span className="truncate max-w-[260px]" title={q.title}>{q.title}</span>
                          {q.url && (
                            <a
                              href={q.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-muted hover:text-primary transition-colors"
                              title="Practice Link"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                            </a>
                          )}
                        </div>
                        {q.notes && (
                          <div className="text-[10px] text-muted font-normal max-w-sm truncate mt-0.5">
                            {q.notes}
                          </div>
                        )}
                      </td>
                      <td className="p-4 text-body font-semibold">
                        {q.patternId?.name || "General"}
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex px-2 py-0.5 rounded-pill font-bold ${
                          q.difficulty === "Easy" ? "bg-success/15 text-success" :
                          q.difficulty === "Medium" ? "bg-accent-amber/15 text-accent-amber" :
                          "bg-error/15 text-error"
                        }`}>
                          {q.difficulty}
                        </span>
                      </td>
                      <td className="p-4 text-muted font-semibold uppercase tracking-wide">
                        {q.platform}
                      </td>
                      <td className="p-4">
                        <span className={`font-semibold ${
                          formatDate(q.nextRevisionAt) === "Due Now" ? "text-primary font-bold" : "text-body"
                        }`}>
                          {formatDate(q.nextRevisionAt)}
                        </span>
                        <span className="text-[10px] text-muted block mt-0.5 font-medium">({q.revisionCount} revisions)</span>
                      </td>
                      <td className="p-4 text-right pr-6">
                        <button
                          onClick={() => handleDeleteQuestion(q._id, q.title)}
                          className="p-1.5 rounded text-muted hover:text-error hover:bg-error/15 border border-transparent hover:border-error/20 transition-all cursor-pointer"
                          title="Delete question"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="p-16 text-center text-muted">
                      <div className="flex flex-col items-center gap-3">
                        <svg className="w-8 h-8 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        <span className="text-sm font-semibold">No Questions Logged</span>
                        <p className="text-xs leading-relaxed max-w-[320px]">No questions match your filter options. Solved some new problems? Log them using the button above.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

      </main>
    </div>
  );
}
