import { z } from "zod";

export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
  }),
});

export const patternSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Pattern name is required").max(100),
    description: z.string().optional(),
  }),
});

export const questionSchema = z.object({
  body: z.object({
    title: z.string().min(1, "Question title is required"),
    difficulty: z.enum(["Easy", "Medium", "Hard"]),
    platform: z.enum(["LeetCode", "HackerRank", "GeeksforGeeks", "Codeforces", "Custom"]),
    url: z.string().url("Invalid URL").optional().or(z.literal("")),
    notes: z.string().optional(),
    patternId: z.string().min(1, "Pattern ID is required"),
  }),
});

export const revisionSubmitSchema = z.object({
  body: z.object({
    rating: z.enum(["Forgot", "Hard Recall", "Easy Recall"]),
  }),
});

export const revisionGenerateSchema = z.object({
  body: z.object({
    count: z.number().int().min(1).max(50).default(5),
    patternIds: z.array(z.string()).optional(),
    difficulties: z.array(z.enum(["Easy", "Medium", "Hard"])).optional(),
  }),
});

export const aiPredictSchema = z.object({
  body: z.object({
    title: z.string().min(1, "Question title is required"),
    notes: z.string().optional().or(z.literal("")),
  }),
});

export const aiCoachSchema = z.object({
  body: z.object({
    message: z.string().min(1, "Message is required"),
    context: z.string().optional(),
  }),
});
