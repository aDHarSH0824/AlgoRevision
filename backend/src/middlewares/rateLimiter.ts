import rateLimit from "express-rate-limit";

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // Limit each IP to 50 requests per windowMs for auth (register/login)
  message: {
    status: "error",
    statusCode: 429,
    message: "Too many authentication requests from this IP, please try again after 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 150, // Limit each IP to 150 requests per minute
  message: {
    status: "error",
    statusCode: 429,
    message: "Too many API requests. Rate limit exceeded, please try again in a minute.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
