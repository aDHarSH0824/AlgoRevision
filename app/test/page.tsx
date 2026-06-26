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
    { title: "Longest Substring Without Repeating Characters", difficulty: "Medium", platform: "LeetCode", url: "https://leetcode.com/problems/longest-substring-without-repeating-characters/" },
    { title: "Minimum Size Subarray Sum", difficulty: "Medium", platform: "LeetCode", url: "https://leetcode.com/problems/minimum-size-subarray-sum/" },
    { title: "Minimum Window Substring", difficulty: "Hard", platform: "LeetCode", url: "https://leetcode.com/problems/minimum-window-substring/" },
    { title: "Find All Anagrams in a String", difficulty: "Medium", platform: "LeetCode", url: "https://leetcode.com/problems/find-all-anagrams-in-a-string/" },
    { title: "Permutation in String", difficulty: "Medium", platform: "LeetCode", url: "https://leetcode.com/problems/permutation-in-string/" },
    { title: "Max Consecutive Ones III", difficulty: "Medium", platform: "LeetCode", url: "https://leetcode.com/problems/max-consecutive-ones-iii/" }
  ],
  "two pointers": [
    { title: "Valid Palindrome", difficulty: "Easy", platform: "LeetCode", url: "https://leetcode.com/problems/valid-palindrome/" },
    { title: "Two Sum II - Input Array Is Sorted", difficulty: "Medium", platform: "LeetCode", url: "https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/" },
    { title: "3Sum", difficulty: "Medium", platform: "LeetCode", url: "https://leetcode.com/problems/3sum/" },
    { title: "Container With Most Water", difficulty: "Medium", platform: "LeetCode", url: "https://leetcode.com/problems/container-with-most-water/" },
    { title: "Trapping Rain Water", difficulty: "Hard", platform: "LeetCode", url: "https://leetcode.com/problems/trapping-rain-water/" },
    { title: "Remove Duplicates from Sorted Array", difficulty: "Easy", platform: "LeetCode", url: "https://leetcode.com/problems/remove-duplicates-from-sorted-array/" }
  ],
  "fast & slow pointers": [
    { title: "Linked List Cycle", difficulty: "Easy", platform: "LeetCode", url: "https://leetcode.com/problems/linked-list-cycle/" },
    { title: "Linked List Cycle II", difficulty: "Medium", platform: "LeetCode", url: "https://leetcode.com/problems/linked-list-cycle-ii/" },
    { title: "Happy Number", difficulty: "Easy", platform: "LeetCode", url: "https://leetcode.com/problems/happy-number/" },
    { title: "Middle of the Linked List", difficulty: "Easy", platform: "LeetCode", url: "https://leetcode.com/problems/middle-of-the-linked-list/" },
    { title: "Palindrome Linked List", difficulty: "Easy", platform: "LeetCode", url: "https://leetcode.com/problems/palindrome-linked-list/" }
  ],
  "merge intervals": [
    { title: "Merge Intervals", difficulty: "Medium", platform: "LeetCode", url: "https://leetcode.com/problems/merge-intervals/" },
    { title: "Insert Interval", difficulty: "Medium", platform: "LeetCode", url: "https://leetcode.com/problems/insert-interval/" },
    { title: "Non-overlapping Intervals", difficulty: "Medium", platform: "LeetCode", url: "https://leetcode.com/problems/non-overlapping-intervals/" },
    { title: "Meeting Rooms", difficulty: "Easy", platform: "LintCode", url: "https://www.lintcode.com/problem/920/" },
    { title: "Meeting Rooms II", difficulty: "Medium", platform: "LintCode", url: "https://www.lintcode.com/problem/919/" }
  ],
  "in-place reversal of a linked list": [
    { title: "Reverse Linked List", difficulty: "Easy", platform: "LeetCode", url: "https://leetcode.com/problems/reverse-linked-list/" },
    { title: "Reverse Linked List II", difficulty: "Medium", platform: "LeetCode", url: "https://leetcode.com/problems/reverse-linked-list-ii/" },
    { title: "Reverse Nodes in k-Group", difficulty: "Hard", platform: "LeetCode", url: "https://leetcode.com/problems/reverse-nodes-in-k-group/" }
  ],
  "tree dfs": [
    { title: "Maximum Depth of Binary Tree", difficulty: "Easy", platform: "LeetCode", url: "https://leetcode.com/problems/maximum-depth-of-binary-tree/" },
    { title: "Path Sum", difficulty: "Easy", platform: "LeetCode", url: "https://leetcode.com/problems/path-sum/" },
    { title: "Path Sum II", difficulty: "Medium", platform: "LeetCode", url: "https://leetcode.com/problems/path-sum-ii/" },
    { title: "Binary Tree Maximum Path Sum", difficulty: "Hard", platform: "LeetCode", url: "https://leetcode.com/problems/binary-tree-maximum-path-sum/" },
    { title: "Symmetric Tree", difficulty: "Easy", platform: "LeetCode", url: "https://leetcode.com/problems/symmetric-tree/" }
  ],
  "tree bfs": [
    { title: "Binary Tree Level Order Traversal", difficulty: "Medium", platform: "LeetCode", url: "https://leetcode.com/problems/binary-tree-level-order-traversal/" },
    { title: "Binary Tree Zigzag Level Order Traversal", difficulty: "Medium", platform: "LeetCode", url: "https://leetcode.com/problems/binary-tree-zigzag-level-order-traversal/" },
    { title: "Binary Tree Right Side View", difficulty: "Medium", platform: "LeetCode", url: "https://leetcode.com/problems/binary-tree-right-side-view/" },
    { title: "Populating Next Right Pointers in Each Node", difficulty: "Medium", platform: "LeetCode", url: "https://leetcode.com/problems/populating-next-right-pointers-in-each-node/" }
  ],
  "two heaps": [
    { title: "Find Median from Data Stream", difficulty: "Hard", platform: "LeetCode", url: "https://leetcode.com/problems/find-median-from-data-stream/" },
    { title: "Sliding Window Median", difficulty: "Hard", platform: "LeetCode", url: "https://leetcode.com/problems/sliding-window-median/" },
    { title: "IPO", difficulty: "Hard", platform: "LeetCode", url: "https://leetcode.com/problems/ipo/" }
  ],
  "top k elements": [
    { title: "Kth Largest Element in an Array", difficulty: "Medium", platform: "LeetCode", url: "https://leetcode.com/problems/kth-largest-element-in-an-array/" },
    { title: "Top K Frequent Elements", difficulty: "Medium", platform: "LeetCode", url: "https://leetcode.com/problems/top-k-frequent-elements/" },
    { title: "K Closest Points to Origin", difficulty: "Medium", platform: "LeetCode", url: "https://leetcode.com/problems/k-closest-points-to-origin/" },
    { title: "Kth Largest Element in a Stream", difficulty: "Easy", platform: "LeetCode", url: "https://leetcode.com/problems/kth-largest-element-in-a-stream/" }
  ],
  "k-way merge": [
    { title: "Merge k Sorted Lists", difficulty: "Hard", platform: "LeetCode", url: "https://leetcode.com/problems/merge-k-sorted-lists/" },
    { title: "Find K Pairs with Smallest Sums", difficulty: "Medium", platform: "LeetCode", url: "https://leetcode.com/problems/find-k-pairs-with-smallest-sums/" },
    { title: "Kth Smallest Element in a Sorted Matrix", difficulty: "Medium", platform: "LeetCode", url: "https://leetcode.com/problems/kth-smallest-element-in-a-sorted-matrix/" }
  ],
  "topological sort": [
    { title: "Course Schedule", difficulty: "Medium", platform: "LeetCode", url: "https://leetcode.com/problems/course-schedule/" },
    { title: "Course Schedule II", difficulty: "Medium", platform: "LeetCode", url: "https://leetcode.com/problems/course-schedule-ii/" },
    { title: "Minimum Height Trees", difficulty: "Medium", platform: "LeetCode", url: "https://leetcode.com/problems/minimum-height-trees/" },
    { title: "Alien Dictionary", difficulty: "Hard", platform: "LintCode", url: "https://www.lintcode.com/problem/892/" }
  ],
  "modified binary search": [
    { title: "Binary Search", difficulty: "Easy", platform: "LeetCode", url: "https://leetcode.com/problems/binary-search/" },
    { title: "Search in Rotated Sorted Array", difficulty: "Medium", platform: "LeetCode", url: "https://leetcode.com/problems/search-in-rotated-sorted-array/" },
    { title: "Find First and Last Position of Element in Sorted Array", difficulty: "Medium", platform: "LeetCode", url: "https://leetcode.com/problems/find-first-and-last-position-of-element-in-sorted-array/" },
    { title: "Search a 2D Matrix", difficulty: "Medium", platform: "LeetCode", url: "https://leetcode.com/problems/search-a-2d-matrix/" }
  ],
  "dynamic programming": [
    { title: "Climbing Stairs", difficulty: "Easy", platform: "LeetCode", url: "https://leetcode.com/problems/climbing-stairs/" },
    { title: "Coin Change", difficulty: "Medium", platform: "LeetCode", url: "https://leetcode.com/problems/coin-change/" },
    { title: "Longest Increasing Subsequence", difficulty: "Medium", platform: "LeetCode", url: "https://leetcode.com/problems/longest-increasing-subsequence/" },
    { title: "House Robber", difficulty: "Medium", platform: "LeetCode", url: "https://leetcode.com/problems/house-robber/" },
    { title: "0-1 Knapsack Problem", difficulty: "Medium", platform: "GeeksforGeeks", url: "https://www.geeksforgeeks.org/0-1-knapsack-problem-dp-10/" }
  ],
  "backtracking": [
    { title: "Subsets", difficulty: "Medium", platform: "LeetCode", url: "https://leetcode.com/problems/subsets/" },
    { title: "Permutations", difficulty: "Medium", platform: "LeetCode", url: "https://leetcode.com/problems/permutations/" },
    { title: "Combination Sum", difficulty: "Medium", platform: "LeetCode", url: "https://leetcode.com/problems/combination-sum/" },
    { title: "N-Queens", difficulty: "Hard", platform: "LeetCode", url: "https://leetcode.com/problems/n-queens/" },
    { title: "Word Search", difficulty: "Medium", platform: "LeetCode", url: "https://leetcode.com/problems/word-search/" }
  ]
};

const GENERAL_FALLBACK_QUESTIONS = [
  { title: "Two Sum", difficulty: "Easy" as const, platform: "LeetCode", url: "https://leetcode.com/problems/two-sum/" },
  { title: "Reverse String", difficulty: "Easy" as const, platform: "LeetCode", url: "https://leetcode.com/problems/reverse-string/" },
  { title: "Merge Sorted Array", difficulty: "Easy" as const, platform: "LeetCode", url: "https://leetcode.com/problems/merge-sorted-array/" },
  { title: "Fibonacci Number", difficulty: "Easy" as const, platform: "LeetCode", url: "https://leetcode.com/problems/fibonacci-number/" },
  { title: "Valid Parentheses", difficulty: "Easy" as const, platform: "LeetCode", url: "https://leetcode.com/problems/valid-parentheses/" },
  { title: "Merge Two Sorted Lists", difficulty: "Easy" as const, platform: "LeetCode", url: "https://leetcode.com/problems/merge-two-sorted-lists/" },
  { title: "Maximum Subarray", difficulty: "Medium" as const, platform: "LeetCode", url: "https://leetcode.com/problems/maximum-subarray/" },
  { title: "Search Insert Position", difficulty: "Easy" as const, platform: "LeetCode", url: "https://leetcode.com/problems/search-insert-position/" }
];

const getFallbackQuestions = (patternName: string): Array<{ title: string; difficulty: "Easy" | "Medium" | "Hard"; platform: string; url: string }> => {
  const normPattern = patternName.toLowerCase()
    .replace(/\b2\b/g, "two")
    .replace(/\b1\b/g, "one")
    .replace(/\b3\b/g, "three")
    .replace(/[^a-z0-9]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  for (const k of Object.keys(DEFAULT_PATTERN_QUESTIONS)) {
    const normKey = k.toLowerCase().replace(/[^a-z0-9]/g, " ").replace(/\s+/g, " ").trim();
    if (normPattern.includes(normKey) || normKey.includes(normPattern)) {
      return DEFAULT_PATTERN_QUESTIONS[k];
    }
  }
  return GENERAL_FALLBACK_QUESTIONS;
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
  const [questionSource, setQuestionSource] = useState<"mix" | "solved" | "new">("mix");
  const [testLength, setTestLength] = useState<number>(5);
  const [allowedDifficulties, setAllowedDifficulties] = useState<string[]>(["Easy", "Medium", "Hard"]);
  const [testHistory, setTestHistory] = useState<any[]>([]);

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

  const fetchHistory = async () => {
    try {
      const res = await api.revisions.getTestHistory();
      if (res.status === "success" && res.data?.history) {
        setTestHistory(res.data.history);
      }
    } catch (err) {
      console.error("Failed to fetch test history:", err);
    }
  };

  useEffect(() => {
    fetchPatterns();
    fetchHistory();
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

      let solvedPool: Array<{ title: string; difficulty: "Easy" | "Medium" | "Hard"; platform: string; url: string }> = [];
      let externalPool: Array<{ title: string; difficulty: "Easy" | "Medium" | "Hard"; platform: string; url: string }> = [];

      responses.forEach((res, index) => {
        const patternName = patterns.find((p) => p.id === selectedPatternIds[index])?.name || "";
        
        // Populate user's solved questions
        if (res.status === "success" && res.data?.questions) {
          const userQuestions = res.data.questions.map((q: any) => {
            const hasRealUrl = q.url && q.url.trim() !== "" && q.url !== "https://leetcode.com/" && q.url !== "https://leetcode.com" && q.url !== "https://geeksforgeeks.org/" && q.url !== "https://geeksforgeeks.org" && q.url !== "#";
            
            // If the user's solved question has no URL or a generic placeholder, construct a clean LeetCode URL from the title
            const resolvedUrl = hasRealUrl
              ? q.url
              : `https://leetcode.com/problems/${q.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")}/`;

            return {
              title: q.title,
              difficulty: (q.difficulty || "Easy") as "Easy" | "Medium" | "Hard",
              platform: q.platform || "LeetCode",
              url: resolvedUrl,
            };
          });
          solvedPool = [...solvedPool, ...userQuestions];
        }

        // Populate external resource questions for this pattern
        const fallbackSet = getFallbackQuestions(patternName);
        externalPool = [...externalPool, ...fallbackSet];
      });

      // Remove duplicates by title in solvedPool
      const uniqueSolved: typeof solvedPool = [];
      const seenSolved = new Set<string>();
      solvedPool.forEach((q) => {
        const cleanTitle = q.title.toLowerCase().trim();
        if (!seenSolved.has(cleanTitle)) {
          seenSolved.add(cleanTitle);
          uniqueSolved.push(q);
        }
      });

      // Remove duplicates by title in externalPool
      const uniqueExternal: typeof externalPool = [];
      const seenExternal = new Set<string>();
      externalPool.forEach((q) => {
        const cleanTitle = q.title.toLowerCase().trim();
        if (!seenExternal.has(cleanTitle)) {
          seenExternal.add(cleanTitle);
          uniqueExternal.push(q);
        }
      });

      // Filter pools by allowed difficulties
      const filteredSolved = uniqueSolved.filter((q) => allowedDifficulties.includes(q.difficulty));
      const filteredExternal = uniqueExternal.filter((q) => allowedDifficulties.includes(q.difficulty));

      // Determine question counts based on the chosen customization option:
      let targetSolved = 0;
      if (questionSource === "mix") {
        targetSolved = Math.ceil(testLength * 0.6);
      } else if (questionSource === "solved") {
        targetSolved = testLength;
      } else if (questionSource === "new") {
        targetSolved = 0;
      }

      const numSolvedToTake = Math.min(filteredSolved.length, targetSolved);
      const numExternalToTake = testLength - numSolvedToTake;

      const shuffledSolved = [...filteredSolved].sort(() => 0.5 - Math.random());
      const shuffledExternal = [...filteredExternal].sort(() => 0.5 - Math.random());

      const selectedSolved = shuffledSolved.slice(0, numSolvedToTake);
      const selectedExternal = shuffledExternal.slice(0, numExternalToTake);

      // Combine both lists and shuffle again
      const combined = [...selectedSolved, ...selectedExternal].sort(() => 0.5 - Math.random());
      
      const selected = combined.map((q) => ({
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

  const handleSubmitTest = async () => {
    const finalScore = testQuestions.filter((q) => q.completed).length;
    setScore(finalScore);
    setFinalTime(timeElapsed);
    setShowResults(true);

    try {
      const selectedPatterns = selectedPatternIds
        .map((id) => patterns.find((p) => p.id === id)?.name)
        .filter(Boolean) as string[];

      await api.revisions.saveTest({
        patterns: selectedPatterns,
        questions: testQuestions.map((q) => ({
          title: q.title,
          difficulty: q.difficulty,
          platform: q.platform,
          url: q.url,
          completed: q.completed,
        })),
        score: finalScore,
        totalQuestions: testQuestions.length,
        timeTaken: timeElapsed,
      });

      // Refresh the test history list
      fetchHistory();
    } catch (err) {
      console.error("Failed to save mock test history:", err);
    }
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
          <>
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

            <div className="border-t border-hairline-soft pt-6 flex flex-col gap-4">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-muted mb-2">Step 2: Choose Question Source</h2>
                <p className="text-xs text-body">Select where you want your practice questions to come from.</p>
              </div>
              
              <div className="grid md:grid-cols-3 gap-4">
                <label className={`p-4 border rounded-md cursor-pointer transition-all flex items-start gap-3 select-none ${
                  questionSource === "mix"
                    ? "bg-primary/5 border-primary"
                    : "bg-canvas border-hairline hover:bg-surface-soft"
                }`}>
                  <input
                    type="radio"
                    name="questionSource"
                    checked={questionSource === "mix"}
                    onChange={() => setQuestionSource("mix")}
                    className="w-4 h-4 text-primary focus:ring-primary cursor-pointer mt-0.5"
                  />
                  <div className="text-left">
                    <span className="text-sm font-semibold text-body-strong block">Mixed (50/50 Split)</span>
                    <span className="text-[10px] text-muted block mt-0.5 leading-normal">Half solved questions and half new ones</span>
                  </div>
                </label>

                <label className={`p-4 border rounded-md cursor-pointer transition-all flex items-start gap-3 select-none ${
                  questionSource === "solved"
                    ? "bg-primary/5 border-primary"
                    : "bg-canvas border-hairline hover:bg-surface-soft"
                }`}>
                  <input
                    type="radio"
                    name="questionSource"
                    checked={questionSource === "solved"}
                    onChange={() => setQuestionSource("solved")}
                    className="w-4 h-4 text-primary focus:ring-primary cursor-pointer mt-0.5"
                  />
                  <div className="text-left">
                    <span className="text-sm font-semibold text-body-strong block">Only Solved Problems</span>
                    <span className="text-[10px] text-muted block mt-0.5 leading-normal">Pulls only questions you've logged previously</span>
                  </div>
                </label>

                <label className={`p-4 border rounded-md cursor-pointer transition-all flex items-start gap-3 select-none ${
                  questionSource === "new"
                    ? "bg-primary/5 border-primary"
                    : "bg-canvas border-hairline hover:bg-surface-soft"
                }`}>
                  <input
                    type="radio"
                    name="questionSource"
                    checked={questionSource === "new"}
                    onChange={() => setQuestionSource("new")}
                    className="w-4 h-4 text-primary focus:ring-primary cursor-pointer mt-0.5"
                  />
                  <div className="text-left">
                    <span className="text-sm font-semibold text-body-strong block">Only New Questions</span>
                    <span className="text-[10px] text-muted block mt-0.5 leading-normal">Pulls only fresh questions from other resources</span>
                  </div>
                </label>
              </div>
            </div>

            <div className="border-t border-hairline-soft pt-6 grid sm:grid-cols-2 gap-8">
              {/* Length Selector */}
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-muted mb-2">Step 3: Set Test Length</h2>
                <p className="text-xs text-body mb-4">Choose how many questions to generate for this test.</p>
                
                <div className="flex gap-2">
                  {[5, 10, 15, 20].map((len) => (
                    <button
                      key={len}
                      type="button"
                      onClick={() => setTestLength(len)}
                      className={`flex-grow py-2 border rounded text-xs font-semibold transition-all cursor-pointer ${
                        testLength === len
                          ? "bg-primary border-primary text-on-primary shadow-sm font-bold"
                          : "bg-canvas border-hairline hover:bg-surface-soft text-muted hover:text-ink"
                      }`}
                    >
                      {len} Qs
                    </button>
                  ))}
                </div>
              </div>

              {/* Difficulty Selection */}
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-muted mb-2">Step 4: Select Difficulties</h2>
                <p className="text-xs text-body mb-4">Allow questions matching these difficulty ratings.</p>
                
                <div className="flex gap-4">
                  {["Easy", "Medium", "Hard"].map((diff) => {
                    const isSelected = allowedDifficulties.includes(diff);
                    const handleToggleDiff = () => {
                      setAllowedDifficulties((prev) => {
                        if (isSelected) {
                          if (prev.length === 1) return prev;
                          return prev.filter((d) => d !== diff);
                        } else {
                          return [...prev, diff];
                        }
                      });
                    };

                    return (
                      <label
                        key={diff}
                        className={`flex-grow flex items-center justify-center gap-2 py-2 border rounded text-xs font-semibold cursor-pointer transition-all select-none ${
                          isSelected
                            ? "bg-primary/5 border-primary text-body-strong font-bold"
                            : "bg-canvas border-hairline hover:bg-surface-soft text-muted"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={handleToggleDiff}
                          className="w-3.5 h-3.5 rounded border-hairline text-primary focus:ring-primary cursor-pointer"
                        />
                        {diff}
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="border-t border-hairline-soft pt-4 flex justify-end">
              <button
                onClick={handleGenerateTest}
                disabled={patterns.length === 0 || selectedPatternIds.length === 0}
                className="px-6 py-2.5 bg-primary hover:bg-primary-active text-on-primary disabled:bg-primary-disabled text-sm font-semibold rounded-md shadow-sm transition-all duration-150 cursor-pointer"
              >
                Generate {testLength}-Question Test
              </button>
            </div>
          </section>

          {/* Mock Test History Timeline */}
          {!testActive && testHistory.length > 0 && (
            <section className="bg-surface-card border border-hairline rounded-lg p-6 flex flex-col gap-5 text-left">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-muted">Mock Test History</h2>
                <p className="text-xs text-body mt-0.5">Timeline of your past revision tests and scores.</p>
              </div>

              <div className="flex flex-col gap-4">
                {testHistory.slice(0, 8).map((test: any) => (
                  <div key={test._id} className="p-4 bg-canvas border border-hairline-soft rounded-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex flex-col gap-1.5 text-left">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-semibold text-body-strong">
                          {test.patterns.join(", ")}
                        </span>
                        <span className="text-[9px] text-muted font-bold block bg-surface-soft border border-hairline px-2 py-0.5 rounded">
                          {test.totalQuestions} Questions
                        </span>
                      </div>
                      <span className="text-[10px] text-muted font-medium">
                        Completed on {new Date(test.createdAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-left sm:text-right">
                        <span className="text-[9px] text-muted font-bold block uppercase tracking-wider">Score</span>
                        <span className={`text-base font-bold block mt-0.5 ${
                          test.score === test.totalQuestions ? "text-success" :
                          test.score >= test.totalQuestions * 0.6 ? "text-primary" : "text-ink"
                        }`}>
                          {test.score} / {test.totalQuestions}
                        </span>
                      </div>

                      <div className="text-left sm:text-right">
                        <span className="text-[9px] text-muted font-bold block uppercase tracking-wider">Time</span>
                        <span className="text-sm font-mono font-bold text-body-strong block mt-0.5">
                          {formatTime(test.timeTaken)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
          </>
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
