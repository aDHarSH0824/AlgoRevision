"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "../components/Header";
import { api } from "../services/api";

interface WeakPattern {
  id: string;
  name: string;
  score: number;
  totalRevisions: number;
}

interface PatternDistribution {
  id: string;
  name: string;
  count: number;
  easy: number;
  medium: number;
  hard: number;
}

interface DashboardStats {
  totalSolved: number;
  upcomingCount: number;
  weakPatterns: WeakPattern[];
  distribution: PatternDistribution[];
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [heatmapData, setHeatmapData] = useState<{ [dateStr: string]: number }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");
      
      const [statsRes, heatmapRes] = await Promise.all([
        api.revisions.getStats(),
        api.revisions.getHeatmap()
      ]);

      if (statsRes.status === "success" && statsRes.data) {
        setStats(statsRes.data);
      }
      
      if (heatmapRes.status === "success" && heatmapRes.data?.heatmap) {
        const heatmapMap: { [dateStr: string]: number } = {};
        heatmapRes.data.heatmap.forEach((item: any) => {
          heatmapMap[item._id] = item.count;
        });
        setHeatmapData(heatmapMap);
      }
    } catch (err: any) {
      console.error("Failed to load dashboard data:", err);
      setError("Failed to load dashboard statistics. Make sure the backend server is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getHeatmapGrid = () => {
    const grid = [];
    const today = new Date();
    const totalDays = 365;
    const startDate = new Date();
    startDate.setDate(today.getDate() - totalDays);

    const currentDate = new Date(startDate);
    while (currentDate <= today) {
      const dateStr = currentDate.toISOString().split("T")[0];
      const count = heatmapData[dateStr] || 0;
      
      grid.push({
        dateStr,
        count,
        dayOfWeek: currentDate.getDay(),
        dateNum: currentDate.getDate(),
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return grid;
  };

  const getHeatmapColorClass = (count: number) => {
    if (count === 0) return "bg-surface-soft border border-hairline-soft";
    if (count <= 2) return "bg-primary/20 text-on-primary";
    if (count <= 4) return "bg-primary/55 text-on-primary";
    if (count <= 6) return "bg-primary/80 text-on-primary";
    return "bg-primary text-on-primary";
  };

  const heatmapGrid = getHeatmapGrid();

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-canvas text-ink">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-muted">
            <div className="w-8 h-8 rounded-full border-4 border-hairline border-t-primary animate-spin"></div>
            <span className="text-sm font-semibold tracking-wide uppercase">Assembling Dashboard...</span>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-canvas text-ink">
      <Header />

      <main className="flex-grow max-w-6xl w-full mx-auto px-6 py-10 flex flex-col gap-10">
        {/* Error warning callout */}
        {error && (
          <div className="p-4 rounded-md bg-error/10 border border-error text-error text-sm font-medium flex items-center gap-3">
            <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div>{error}</div>
            <button onClick={fetchData} className="ml-auto underline font-semibold text-xs hover:text-ink">Retry</button>
          </div>
        )}

        {/* Welcome Section / CTA Header */}
        <section className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="font-serif text-3xl font-normal tracking-tight">Your algorithm revision center</h1>
            <p className="text-body text-sm mt-1">Review active recall metrics and test your skills.</p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <Link
              href="/revision"
              className="px-5 py-2.5 bg-primary hover:bg-primary-active text-on-primary text-sm font-semibold rounded-md shadow-sm transition-all duration-150 flex items-center gap-2 cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Start Revision Session
            </Link>
            
            <Link
              href="/questions"
              className="px-4 py-2.5 bg-canvas border border-hairline hover:bg-surface-soft text-ink text-sm font-semibold rounded-md transition-all duration-150 cursor-pointer"
            >
              Add Question
            </Link>
          </div>
        </section>

        {/* Overview Stats Block */}
        <section className="grid sm:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="bg-surface-card border border-hairline rounded-lg p-6">
            <div className="text-muted text-xs font-semibold uppercase tracking-wider mb-2">Total Solved</div>
            <div className="text-4xl font-serif font-normal text-ink">{stats?.totalSolved || 0}</div>
            <div className="text-body text-xs mt-2 font-medium">Coding questions solved & categorized</div>
          </div>

          {/* Card 2 */}
          <div className={`border rounded-lg p-6 ${stats?.upcomingCount && stats.upcomingCount > 0 ? "bg-primary/10 border-primary" : "bg-surface-card border-hairline"}`}>
            <div className="text-muted text-xs font-semibold uppercase tracking-wider mb-2">Due for Revision</div>
            <div className="text-4xl font-serif font-normal text-ink">{stats?.upcomingCount || 0}</div>
            <div className="text-body text-xs mt-2 font-medium">Questions scheduled for active recall today</div>
          </div>

          {/* Card 3 */}
          <div className="bg-surface-card border border-hairline rounded-lg p-6">
            <div className="text-muted text-xs font-semibold uppercase tracking-wider mb-2">Weakest Category</div>
            <div className="text-2xl font-serif font-normal text-ink truncate mt-1">
              {stats?.weakPatterns && stats.weakPatterns.length > 0 ? stats.weakPatterns[0].name : "None logged"}
            </div>
            <div className="text-body text-xs mt-2 font-medium">
              {stats?.weakPatterns && stats.weakPatterns.length > 0 
                ? `Avg Recall Score: ${stats.weakPatterns[0].score.toFixed(1)}/2.0`
                : "Complete sessions to build analytics"}
            </div>
          </div>
        </section>

        {/* Github-style Revision Heatmap */}
        <section className="bg-surface-card border border-hairline rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-serif text-lg font-normal">Active Recall Heatmap</h2>
            <div className="flex gap-2 items-center text-[10px] uppercase tracking-wider text-muted font-bold">
              <span>Less</span>
              <div className="w-2.5 h-2.5 rounded-sm bg-surface-soft border border-hairline-soft"></div>
              <div className="w-2.5 h-2.5 rounded-sm bg-primary/20"></div>
              <div className="w-2.5 h-2.5 rounded-sm bg-primary/55"></div>
              <div className="w-2.5 h-2.5 rounded-sm bg-primary/80"></div>
              <div className="w-2.5 h-2.5 rounded-sm bg-primary"></div>
              <span>More</span>
            </div>
          </div>

          <div className="overflow-x-auto w-full pb-2">
            <div className="grid grid-flow-col grid-rows-7 gap-1.5 min-w-[700px]">
              {heatmapGrid.map((day, idx) => (
                <div
                  key={idx}
                  title={`${day.dateStr}: ${day.count} revision${day.count !== 1 ? "s" : ""}`}
                  className={`w-3.5 h-3.5 rounded-sm transition-all duration-150 ${getHeatmapColorClass(day.count)}`}
                />
              ))}
            </div>
          </div>
          <div className="text-muted text-[10px] mt-2 italic">Hover squares to inspect recall history count. Showing activity for past 365 days.</div>
        </section>

        {/* Split Layout: Topic split vs Virtual Test Maker Promo */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Weakest Patterns list */}
          <div className="bg-surface-card border border-hairline rounded-lg p-6 flex flex-col justify-between">
            <div>
              <h2 className="font-serif text-lg font-normal mb-1">Topic Difficulty Split</h2>
              <p className="text-muted text-xs mb-4">Breakdown of average revision scores and recall counts per study pattern.</p>
              
              <div className="flex flex-col gap-3">
                {stats?.weakPatterns && stats.weakPatterns.length > 0 ? (
                  stats.weakPatterns.map((pat, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs font-semibold py-1.5 border-b border-hairline-soft last:border-0">
                      <div className="text-body-strong flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${
                          idx === 0 ? "bg-error" : idx === 1 ? "bg-accent-amber" : "bg-accent-teal"
                        }`}></span>
                        {pat.name}
                      </div>
                      <div className="text-muted text-right">
                        Score: {pat.score.toFixed(1)}/2.0 <span className="text-[10px] text-muted-soft">({pat.totalRevisions} revs)</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-muted text-xs text-center py-6">
                    No metrics history yet. Add some solved questions to build analytics.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Virtual Test Maker Promo Card */}
          <div className="bg-surface-card border border-hairline rounded-lg p-6 flex flex-col justify-between">
            <div>
              <h2 className="font-serif text-lg font-normal mb-1">Virtual Mock Test Maker</h2>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary mb-3">
                New Feature
              </span>
              <p className="text-body text-xs leading-relaxed mb-6">
                Ready to assess your skills? Generate custom mock tests with 5 random problems from selected patterns. Test yourself under a live timer, access direct practice links, and log completed status. Questions can be sourced from your solved queue or public practice pools.
              </p>
            </div>

            <div className="pt-4 border-t border-hairline-soft flex justify-end">
              <Link
                href="/test"
                className="px-4 py-2 bg-primary hover:bg-primary-active text-on-primary text-xs font-semibold rounded-md transition-all duration-150 cursor-pointer"
              >
                Go to Test Maker →
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
