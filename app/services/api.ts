const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

class APIError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "APIError";
    this.status = status;
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
  
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const text = await response.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch (err) {
    data = { message: text || "Invalid JSON response from server" };
  }

  if (!response.ok) {
    throw new APIError(data.message || data.error || `HTTP error! Status: ${response.status}`, response.status);
  }

  return data;
}

export const api = {
  // Authentication
  auth: {
    register: (body: any) => request<any>("/auth/register", { method: "POST", body: JSON.stringify(body) }),
    login: (body: any) => request<any>("/auth/login", { method: "POST", body: JSON.stringify(body) }),
    googleLogin: (token: string) => request<any>("/auth/google", { method: "POST", body: JSON.stringify({ token }) }),
    getMe: () => request<any>("/auth/me", { method: "GET" }),
  },

  // Patterns
  patterns: {
    list: () => request<any>("/patterns", { method: "GET" }),
    create: (body: { name: string; description?: string }) => request<any>("/patterns", { method: "POST", body: JSON.stringify(body) }),
    update: (id: string, body: { name: string; description?: string }) => request<any>(`/patterns/${id}`, { method: "PUT", body: JSON.stringify(body) }),
    delete: (id: string) => request<any>(`/patterns/${id}`, { method: "DELETE" }),
  },

  // Questions
  questions: {
    list: (params: { patternId?: string; difficulty?: string; search?: string; limit?: number; skip?: number } = {}) => {
      const query = new URLSearchParams();
      if (params.patternId) query.set("patternId", params.patternId);
      if (params.difficulty) query.set("difficulty", params.difficulty);
      if (params.search) query.set("search", params.search);
      if (params.limit) query.set("limit", String(params.limit));
      if (params.skip) query.set("skip", String(params.skip));
      
      const queryString = query.toString() ? `?${query.toString()}` : "";
      return request<any>(`/questions${queryString}`, { method: "GET" });
    },
    create: (body: { title: string; difficulty: string; platform: string; url?: string; notes?: string; patternId: string }) => 
      request<any>("/questions", { method: "POST", body: JSON.stringify(body) }),
    update: (id: string, body: { title?: string; difficulty?: string; platform?: string; url?: string; notes?: string; patternId?: string }) => 
      request<any>(`/questions/${id}`, { method: "PUT", body: JSON.stringify(body) }),
    delete: (id: string) => request<any>(`/questions/${id}`, { method: "DELETE" }),
  },

  // Revisions
  revisions: {
    generate: (body: { count?: number; patternIds?: string[]; difficulties?: string[] }) => 
      request<any>("/revisions/generate", { method: "POST", body: JSON.stringify(body) }),
    submit: (questionId: string, rating: "Forgot" | "Hard Recall" | "Easy Recall") => 
      request<any>(`/revisions/submit/${questionId}`, { method: "POST", body: JSON.stringify({ rating }) }),
    getHeatmap: () => request<any>("/revisions/heatmap", { method: "GET" }),
    getStats: () => request<any>("/revisions/stats", { method: "GET" }),
  },

  // AI Integration
  ai: {
    predictPattern: (title: string, notes?: string) => 
      request<any>("/ai/predict-pattern", { method: "POST", body: JSON.stringify({ title, notes }) }),
    getRecommendations: () => request<any>("/ai/recommendations", { method: "GET" }),
    generateWeeklyPlan: () => request<any>("/ai/generate-weekly-plan", { method: "POST" }),
    getWeeklyPlan: () => request<any>("/ai/weekly-plan", { method: "GET" }),
    coachChat: (message: string, context?: string) => 
      request<any>("/ai/coach-chat", { method: "POST", body: JSON.stringify({ message, context }) }),
  }
};
