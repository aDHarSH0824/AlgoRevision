"use client";

import { useEffect, useState } from "react";
import Header from "../components/Header";
import { api } from "../services/api";

interface Pattern {
  id: string;
  name: string;
  description?: string;
  solvedCount: number;
  easyCount: number;
  mediumCount: number;
  hardCount: number;
  createdAt: string;
}

export default function Patterns() {
  const [patterns, setPatterns] = useState<Pattern[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

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
      setError("Failed to fetch patterns. Make sure the backend server is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatterns();
  }, []);

  const handleCreatePattern = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setSubmitting(true);
      setError("");
      const res = await api.patterns.create({ name, description });
      if (res.status === "success") {
        setName("");
        setDescription("");
        setShowAddForm(false);
        fetchPatterns(); // reload list
      }
    } catch (err: any) {
      setError(err.message || "Failed to create pattern. Name might be duplicate.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePattern = async (id: string, name: string) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${name}"?\nWarning: This will permanently delete all coding questions associated with this pattern.`
    );
    if (!confirmed) return;

    try {
      setError("");
      const res = await api.patterns.delete(id);
      if (res.status === "success") {
        fetchPatterns();
      }
    } catch (err: any) {
      setError(err.message || "Failed to delete pattern.");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-canvas text-ink">
      <Header />

      <main className="flex-grow max-w-6xl w-full mx-auto px-6 py-10 flex flex-col gap-8">
        
        {/* Title and Controls Header */}
        <section className="flex justify-between items-center">
          <div>
            <h1 className="font-serif text-3xl font-normal tracking-tight">Algorithmic Patterns</h1>
            <p className="text-body text-sm mt-1">Organize your DSA coding index by structure and split metrics.</p>
          </div>
          
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2 bg-primary hover:bg-primary-active text-on-primary text-xs font-semibold rounded-md transition-all duration-150 cursor-pointer"
          >
            {showAddForm ? "Cancel" : "Add Pattern"}
          </button>
        </section>

        {error && (
          <div className="p-4 rounded-md bg-error/10 border border-error text-error text-sm font-medium">
            {error}
          </div>
        )}

        {/* Add Pattern Form Drawer/Card */}
        {showAddForm && (
          <section className="bg-surface-card border border-hairline rounded-lg p-6 max-w-xl">
            <h2 className="font-serif text-lg font-normal mb-4">Create New Category</h2>
            <form onSubmit={handleCreatePattern} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="pattern-name" className="text-xs font-semibold text-body">
                  Pattern Name
                </label>
                <input
                  id="pattern-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Sliding Window, Two Pointers"
                  className="w-full h-10 px-3 border border-hairline bg-canvas rounded-md text-sm text-ink focus:outline-none focus:border-primary transition-all duration-150"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="pattern-desc" className="text-xs font-semibold text-body">
                  Description
                </label>
                <textarea
                  id="pattern-desc"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Summarize the core visual cues or visual structure of this pattern..."
                  className="w-full p-3 border border-hairline bg-canvas rounded-md text-sm text-ink focus:outline-none focus:border-primary transition-all duration-150 resize-y"
                />
              </div>

              <div className="flex gap-3 justify-end mt-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-3 py-1.5 text-xs font-semibold border border-hairline text-muted hover:text-ink rounded-md transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-1.5 bg-primary hover:bg-primary-active text-on-primary text-xs font-semibold rounded-md disabled:bg-primary-disabled cursor-pointer transition-colors"
                >
                  {submitting ? "Saving..." : "Create Category"}
                </button>
              </div>
            </form>
          </section>
        )}

        {/* Patterns List Grid */}
        <section className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full py-20 text-center text-muted text-sm font-semibold uppercase tracking-wider">
              Syncing patterns data...
            </div>
          ) : patterns.length > 0 ? (
            patterns.map((pat) => (
              <div
                key={pat.id}
                className="bg-surface-card border border-hairline rounded-lg p-6 flex flex-col justify-between hover:shadow-sm transition-all duration-150"
              >
                <div>
                  <div className="flex justify-between items-start gap-4 mb-2">
                    <h3 className="font-serif text-lg font-normal text-ink leading-tight">{pat.name}</h3>
                    <button
                      onClick={() => handleDeletePattern(pat.id, pat.name)}
                      className="p-1 rounded text-muted hover:text-error hover:bg-error/15 border border-transparent hover:border-error/20 transition-all"
                      title="Delete pattern and questions"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                  
                  <p className="text-body text-xs leading-relaxed mb-6 line-clamp-3">
                    {pat.description || "No description provided yet. Click edit or update the category to write notes."}
                  </p>
                </div>

                <div className="border-t border-hairline-soft pt-4 flex flex-col gap-3">
                  <div className="flex justify-between items-center text-[10px] font-bold text-muted uppercase tracking-wider">
                    <span>Solved Questions</span>
                    <span className="text-ink text-xs">{pat.solvedCount}</span>
                  </div>

                  <div className="flex gap-1.5">
                    <div className="flex-1 bg-success/10 text-success text-[10px] font-bold py-1 px-1.5 rounded text-center">
                      {pat.easyCount} Easy
                    </div>
                    <div className="flex-1 bg-accent-amber/10 text-accent-amber text-[10px] font-bold py-1 px-1.5 rounded text-center">
                      {pat.mediumCount} Med
                    </div>
                    <div className="flex-1 bg-error/10 text-error text-[10px] font-bold py-1 px-1.5 rounded text-center">
                      {pat.hardCount} Hard
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-16 border border-dashed border-hairline rounded text-center flex flex-col items-center gap-4 text-muted bg-surface-soft p-8">
              <svg className="w-10 h-10 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              <div className="text-sm font-semibold">No Patterns Found</div>
              <p className="text-xs max-w-[320px] leading-relaxed">You haven't added any DSA categories yet. Create a category to start organizing your study plans.</p>
              <button
                onClick={() => setShowAddForm(true)}
                className="mt-2 text-xs font-semibold px-4 py-2 bg-primary hover:bg-primary-active text-on-primary rounded-md cursor-pointer"
              >
                Create First Pattern
              </button>
            </div>
          )}
        </section>

      </main>
    </div>
  );
}
