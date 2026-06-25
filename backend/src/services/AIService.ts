import axios from "axios";
import logger from "../utils/logger";

interface Recommendation {
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  platform: string;
  url: string;
}

const COMMON_PATTERNS_QUESTIONS: Record<string, Recommendation[]> = {
  "Arrays & Hashing": [
    { title: "Contains Duplicate", difficulty: "Easy", platform: "LeetCode", url: "https://leetcode.com/problems/contains-duplicate/" },
    { title: "Two Sum", difficulty: "Easy", platform: "LeetCode", url: "https://leetcode.com/problems/two-sum/" },
    { title: "Group Anagrams", difficulty: "Medium", platform: "LeetCode", url: "https://leetcode.com/problems/group-anagrams/" },
    { title: "Top K Frequent Elements", difficulty: "Medium", platform: "LeetCode", url: "https://leetcode.com/problems/top-k-frequent-elements/" }
  ],
  "Two Pointers": [
    { title: "Valid Palindrome", difficulty: "Easy", platform: "LeetCode", url: "https://leetcode.com/problems/valid-palindrome/" },
    { title: "3Sum", difficulty: "Medium", platform: "LeetCode", url: "https://leetcode.com/problems/3sum/" },
    { title: "Container With Most Water", difficulty: "Medium", platform: "LeetCode", url: "https://leetcode.com/problems/container-with-most-water/" },
    { title: "Trapping Rain Water", difficulty: "Hard", platform: "LeetCode", url: "https://leetcode.com/problems/trapping-rain-water/" }
  ],
  "Sliding Window": [
    { title: "Best Time to Buy and Sell Stock", difficulty: "Easy", platform: "LeetCode", url: "https://leetcode.com/problems/best-time-to-buy-and-sell-stock/" },
    { title: "Longest Substring Without Repeating Characters", difficulty: "Medium", platform: "LeetCode", url: "https://leetcode.com/problems/longest-substring-without-repeating-characters/" },
    { title: "Longest Repeating Character Replacement", difficulty: "Medium", platform: "LeetCode", url: "https://leetcode.com/problems/longest-repeating-character-replacement/" },
    { title: "Minimum Window Substring", difficulty: "Hard", platform: "LeetCode", url: "https://leetcode.com/problems/minimum-window-substring/" }
  ],
  "Stack": [
    { title: "Valid Parentheses", difficulty: "Easy", platform: "LeetCode", url: "https://leetcode.com/problems/valid-parentheses/" },
    { title: "Min Stack", difficulty: "Medium", platform: "LeetCode", url: "https://leetcode.com/problems/min-stack/" },
    { title: "Evaluate Reverse Polish Notation", difficulty: "Medium", platform: "LeetCode", url: "https://leetcode.com/problems/evaluate-reverse-polish-notation/" },
    { title: "Largest Rectangle in Histogram", difficulty: "Hard", platform: "LeetCode", url: "https://leetcode.com/problems/largest-rectangle-in-histogram/" }
  ],
  "Binary Search": [
    { title: "Binary Search", difficulty: "Easy", platform: "LeetCode", url: "https://leetcode.com/problems/binary-search/" },
    { title: "Search a 2D Matrix", difficulty: "Medium", platform: "LeetCode", url: "https://leetcode.com/problems/search-a-2d-matrix/" },
    { title: "Find Minimum in Rotated Sorted Array", difficulty: "Medium", platform: "LeetCode", url: "https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/" },
    { title: "Median of Two Sorted Arrays", difficulty: "Hard", platform: "LeetCode", url: "https://leetcode.com/problems/median-of-two-sorted-arrays/" }
  ],
  "Trees": [
    { title: "Invert Binary Tree", difficulty: "Easy", platform: "LeetCode", url: "https://leetcode.com/problems/invert-binary-tree/" },
    { title: "Maximum Depth of Binary Tree", difficulty: "Easy", platform: "LeetCode", url: "https://leetcode.com/problems/maximum-depth-of-binary-tree/" },
    { title: "Binary Tree Level Order Traversal", difficulty: "Medium", platform: "LeetCode", url: "https://leetcode.com/problems/binary-tree-level-order-traversal/" },
    { title: "Serialize and Deserialize Binary Tree", difficulty: "Hard", platform: "LeetCode", url: "https://leetcode.com/problems/serialize-and-deserialize-binary-tree/" }
  ],
  "Graphs": [
    { title: "Number of Islands", difficulty: "Medium", platform: "LeetCode", url: "https://leetcode.com/problems/number-of-islands/" },
    { title: "Clone Graph", difficulty: "Medium", platform: "LeetCode", url: "https://leetcode.com/problems/clone-graph/" },
    { title: "Course Schedule", difficulty: "Medium", platform: "LeetCode", url: "https://leetcode.com/problems/course-schedule/" },
    { title: "Alien Dictionary", difficulty: "Hard", platform: "LeetCode", url: "https://leetcode.com/problems/alien-dictionary/" }
  ],
  "Dynamic Programming": [
    { title: "Climbing Stairs", difficulty: "Easy", platform: "LeetCode", url: "https://leetcode.com/problems/climbing-stairs/" },
    { title: "House Robber", difficulty: "Medium", platform: "LeetCode", url: "https://leetcode.com/problems/house-robber/" },
    { title: "Longest Common Subsequence", difficulty: "Medium", platform: "LeetCode", url: "https://leetcode.com/problems/longest-common-subsequence/" },
    { title: "Edit Distance", difficulty: "Hard", platform: "LeetCode", url: "https://leetcode.com/problems/edit-distance/" }
  ]
};

export class AIService {
  private getApiKey(): string | null {
    return process.env.GEMINI_API_KEY || null;
  }

  private async callGemini(prompt: string, fallbackResponse: string): Promise<string> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      logger.info("Gemini API Key missing, using heuristic fallback.");
      return fallbackResponse;
    }

    try {
      const model = process.env.GEMINI_MODEL || "gemini-1.5-flash";
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const response = await axios.post(url, {
        contents: [{ parts: [{ text: prompt }] }]
      });

      const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        return text.trim();
      }
      return fallbackResponse;
    } catch (error) {
      logger.error(`Error calling Gemini API: ${(error as Error).message}`);
      return fallbackResponse;
    }
  }

  /**
   * Predict standard pattern from title and notes
   */
  async predictPattern(title: string, notes: string): Promise<string> {
    const content = `Title: ${title}\nNotes: ${notes}`;
    const prompt = `Analyze the following DSA question and categorize it into one of these standard patterns:
- Arrays & Hashing
- Two Pointers
- Sliding Window
- Stack
- Binary Search
- Trees
- Graphs
- Heap / Priority Queue
- Backtracking
- Dynamic Programming
- Greedy
- Intervals

Question Details:
${content}

Return ONLY the name of the pattern as a plain text string. Do not include quotes or any explanation.`;

    // Local heuristic categorization
    let fallback = "Arrays & Hashing";
    const textToSearch = `${title} ${notes}`.toLowerCase();

    if (textToSearch.includes("window") || textToSearch.includes("substring without repeating")) {
      fallback = "Sliding Window";
    } else if (textToSearch.includes("pointer") || textToSearch.includes("palindrom") || textToSearch.includes("3sum") || textToSearch.includes("two sum ii")) {
      fallback = "Two Pointers";
    } else if (textToSearch.includes("tree") || textToSearch.includes("bst") || textToSearch.includes("node") || textToSearch.includes("preorder") || textToSearch.includes("inorder")) {
      fallback = "Trees";
    } else if (textToSearch.includes("graph") || textToSearch.includes("bfs") || textToSearch.includes("dfs") || textToSearch.includes("island") || textToSearch.includes("course schedule")) {
      fallback = "Graphs";
    } else if (textToSearch.includes("binary search") || textToSearch.includes("sorted array") || textToSearch.includes("rotated")) {
      fallback = "Binary Search";
    } else if (textToSearch.includes("stack") || textToSearch.includes("parenthes") || textToSearch.includes("histogram")) {
      fallback = "Stack";
    } else if (textToSearch.includes("memo") || textToSearch.includes("dp") || textToSearch.includes("knapsack") || textToSearch.includes("subsequence") || textToSearch.includes("climb")) {
      fallback = "Dynamic Programming";
    } else if (textToSearch.includes("heap") || textToSearch.includes("priority queue") || textToSearch.includes("kth largest")) {
      fallback = "Heap / Priority Queue";
    } else if (textToSearch.includes("interval") || textToSearch.includes("overlap") || textToSearch.includes("merge")) {
      fallback = "Intervals";
    }

    return this.callGemini(prompt, fallback);
  }

  /**
   * Recommend new questions based on patterns user already studied
   */
  async recommendQuestions(
    studiedPatterns: { name: string; solvedCount: number }[],
    solvedQuestionTitles: string[]
  ): Promise<Recommendation[]> {
    if (studiedPatterns.length === 0) {
      // Return default questions
      return [
        COMMON_PATTERNS_QUESTIONS["Arrays & Hashing"][0],
        COMMON_PATTERNS_QUESTIONS["Two Pointers"][0],
        COMMON_PATTERNS_QUESTIONS["Sliding Window"][0]
      ];
    }

    // Identify patterns solved
    const solvedSet = new Set(solvedQuestionTitles.map((t) => t.toLowerCase().trim()));
    const recommendations: Recommendation[] = [];

    // Find questions in studied patterns that haven't been solved
    for (const pattern of studiedPatterns) {
      const candidates = COMMON_PATTERNS_QUESTIONS[pattern.name] || [];
      for (const candidate of candidates) {
        if (!solvedSet.has(candidate.title.toLowerCase().trim())) {
          recommendations.push(candidate);
          if (recommendations.length >= 3) break;
        }
      }
      if (recommendations.length >= 3) break;
    }

    // Fill up if empty
    while (recommendations.length < 3) {
      const keys = Object.keys(COMMON_PATTERNS_QUESTIONS);
      const randomKey = keys[Math.floor(Math.random() * keys.length)];
      const item = COMMON_PATTERNS_QUESTIONS[randomKey][Math.floor(Math.random() * COMMON_PATTERNS_QUESTIONS[randomKey].length)];
      if (!recommendations.some(r => r.title === item.title) && !solvedSet.has(item.title.toLowerCase().trim())) {
        recommendations.push(item);
      }
    }

    return recommendations;
  }

  /**
   * Generate a weekly plan
   */
  async generateWeeklyPlan(
    weakPatterns: { name: string; score: number }[],
    upcomingRevisionsCount: number
  ): Promise<string> {
    const weakList = weakPatterns.map((p) => `${p.name} (Avg Rating Score: ${p.score.toFixed(1)}/2.0)`).join(", ");
    const prompt = `Generate a customized weekly revision schedule (Monday to Sunday) for a software engineering student.
    
    Student Analytics:
    - Weak Patterns to Prioritize: ${weakList}
    - Total Pending Revisions Scheduled: ${upcomingRevisionsCount}
    
    Return a structured Markdown weekly plan containing advice for each day, focusing on how they can strengthen their weak topics and tackle their upcoming reviews. Make it concise and actionable.`;

    const fallback = `### Weekly Revision Plan

- **Monday (Focus: Weak Areas)**
  * Practice 1 problem from your weakest pattern: **${weakPatterns[0]?.name || "Sliding Window"}**.
  * Complete pending revision cards.
- **Tuesday (Dynamic Spaced Repetition)**
  * Review all scheduled SRS questions.
  * Pay extra attention to questions marked "Forgot" on previous reviews.
- **Wednesday (Mid-week Focus)**
  * Take a 5-question mock revision set containing Medium/Hard difficulties.
- **Thursday (Focus: Weak Areas)**
  * Target pattern **${weakPatterns[1]?.name || "Two Pointers"}** with a structured review of its core visual steps.
- **Friday (Review and Log)**
  * Read through solved notes. Add optimization complexity reviews (Time/Space).
- **Saturday (Revision Simulation)**
  * Generate a 10-question random revision set. Keep it timing-focused.
- **Sunday (Rest & AI Coach Review)**
  * Read algorithmic notes and chat with the AI Coach on tricky trade-offs.`;

    return this.callGemini(prompt, fallback);
  }

  /**
   * Chat with the AI Revision Coach
   */
  async chatWithCoach(message: string, context: string): Promise<string> {
    const prompt = `You are a helpful and expert AI DSA Revision Coach. Your goal is to guide students to understand complex data structures, algorithms, and spaced repetition optimization.

Context about the student:
${context}

Student Message:
${message}

Provide a helpful, precise response. Focus on giving algorithmic advice, tips on memory recall, or optimizing specific problem approaches. Use markdown formatting for code blocks or formulas. Keep it encouraging yet technical.`;

    let fallback = "";
    const msg = message.toLowerCase();

    if (msg.includes("sliding window")) {
      fallback = `### AI Coach - Sliding Window Explanation
      
Sliding Window is a powerful pattern used to optimize nested loops from $O(N^2)$ to $O(N)$ time complexity, typically on arrays or strings.

Here is the general pointer template:
\`\`\`javascript
let left = 0;
let maxLength = 0;
const charMap = {}; // or Map

for (let right = 0; right < array.length; right++) {
    // 1. Expand the window by adding the right element
    const rightChar = array[right];
    charMap[rightChar] = (charMap[rightChar] || 0) + 1;
    
    // 2. Shrink the window if constraint is violated
    while (isConstraintViolated(charMap)) {
        const leftChar = array[left];
        charMap[leftChar]--;
        left++;
    }
    
    // 3. Record the maximum valid window size
    maxLength = Math.max(maxLength, right - left + 1);
}
\`\`\`

Would you like to walk through a specific problem like **Longest Substring Without Repeating Characters** or **Minimum Window Substring**?`;
    } else if (msg.includes("dynamic programming") || msg.includes("dp") || msg.includes("memoization")) {
      fallback = `### AI Coach - Dynamic Programming Guide

Dynamic programming solves complex problems by breaking them down into simpler subproblems. The core is **overlapping subproblems** and **optimal substructure**.

We have two primary implementation styles:
1. **Memoization (Top-Down)**: Solve recursively and cache results to prevent redundant calls.
   * *Formula*: \`memo[i] = solve(i - 1) + solve(i - 2)\`
2. **Tabulation (Bottom-Up)**: Solve iteratively using an array, building from base cases up to the target.
   * *Formula*: \`dp[i] = dp[i - 1] + dp[i - 2]\`

For example, to solve **Climbing Stairs** in $O(N)$ time and $O(1)$ space:
\`\`\`javascript
function climbStairs(n) {
    if (n <= 2) return n;
    let first = 1;
    let second = 2;
    for (let i = 3; i <= n; i++) {
        let third = first + second;
        first = second;
        second = third;
    }
    return second;
}
\`\`\`

Let me know if you want to analyze visual subproblem trees for **House Robber** or **Longest Common Subsequence**!`;
    } else if (msg.includes("binary search")) {
      fallback = `### AI Coach - Binary Search Optimization

Binary search locates targets in sorted ranges in $O(\\log N)$ time by dividing search spaces in half.

Ensure you avoid integer overflows when calculating midpoints:
\`\`\`javascript
// Instead of (left + right) / 2
let mid = left + Math.floor((right - left) / 2);
\`\`\`

Here is the standard iterative template:
\`\`\`javascript
let left = 0;
let right = array.length - 1;

while (left <= right) {
    let mid = left + Math.floor((right - left) / 2);
    if (array[mid] === target) {
        return mid;
    } else if (array[mid] < target) {
        left = mid + 1; // Search right half
    } else {
        right = mid - 1; // Search left half
    }
}
return -1; // Not found
\`\`\`

Are you practicing standard binary searches or specialized variants like **Rotated Sorted Arrays** or **Median of Two Sorted Arrays**?`;
    } else if (msg.includes("graph") || msg.includes("dfs") || msg.includes("bfs") || msg.includes("island")) {
      fallback = `### AI Coach - Graph Traversals (BFS & DFS)

Graphs are modeled using adjacency lists or grids. The two standard traversal algorithms are:

1. **DFS (Depth-First Search)**: Uses recursion (call stack) to explore branches fully before backtracking.
2. **BFS (Breadth-First Search)**: Uses a queue to visit neighbors layer-by-layer (shortest paths).

For example, counting grid connections (like **Number of Islands**):
\`\`\`javascript
function dfs(grid, r, c) {
    if (r < 0 || c < 0 || r >= grid.length || c >= grid[0].length || grid[r][c] === '0') {
        return;
    }
    grid[r][c] = '0'; // Mark visited
    dfs(grid, r + 1, c);
    dfs(grid, r - 1, c);
    dfs(grid, r, c + 1);
    dfs(grid, r, c - 1);
}
\`\`\`

Would you like to trace recursion stacks for DFS or queue states for BFS?`;
    } else if (msg.includes("spaced repetition") || msg.includes("sm-2") || msg.includes("interval")) {
      fallback = `### AI Coach - Spaced Repetition Mechanics

The spaced repetition system adapts the SuperMemo-2 (SM-2) cognitive decay algorithm to maintain memory retention:
* **Forgot**: Reschedules review for tomorrow (interval = 1) and resets revision counts.
* **Hard Recall**: Reduces Ease Factor slightly and schedules reviews slightly sooner.
* **Easy Recall**: Increases Ease Factor and expands interval gaps by \`interval * EaseFactor\`.

Reviewing cards at the exact threshold where you begin to forget maximizes long-term memory trace strength. Can I help you analyze a specific scheduling query?`;
    } else {
      fallback = `### Hello! I am your AI DSA Revision Coach.

I have processed your query: "*${message}*"

To assist you best, here are some key areas we can trace together:
* **Visual templates** for pointers (Sliding Window, Two Pointers).
* **Recursion trace logs** for binary trees or backtracks.
* **Complex DP state transitions** (memoization tables).
* **Memory scheduling** algorithms (SM-2 intervals).

Tell me what data structure, algorithm, or Leetcode question you'd like to dive into!`;
    }

    return this.callGemini(prompt, fallback);
  }
}

export default AIService;
