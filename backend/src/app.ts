import express from "express";
import cors from "cors";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";
import authRoutes from "./routes/authRoutes";
import patternRoutes from "./routes/patternRoutes";
import questionRoutes from "./routes/questionRoutes";
import revisionRoutes from "./routes/revisionRoutes";
import aiRoutes from "./routes/aiRoutes";
import errorMiddleware from "./middlewares/errorMiddleware";
import { apiLimiter } from "./middlewares/rateLimiter";
import logger from "./utils/logger";

const app = express();

// Enable CORS and parser middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Morgan middleware mapping logs to Winston http channel
const morganFormat = process.env.NODE_ENV === "production" ? "combined" : "dev";
app.use(
  morgan(morganFormat, {
    stream: { write: (message) => logger.http(message.trim()) },
  })
);

// Apply API limit rates
app.use("/api", apiLimiter);

// Swagger Documentation Configuration
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "DSA Revision Hub API",
      version: "1.0.0",
      description: "Complete production-grade REST APIs for DSA Revision Hub",
    },
    servers: [
      {
        url: "/api",
        description: "API Gateway Server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./src/routes/*.ts", "./dist/routes/*.js"],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Bind API route paths
app.use("/api/auth", authRoutes);
app.use("/api/patterns", patternRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/revisions", revisionRoutes);
app.use("/api/ai", aiRoutes);

// Health probe endpoint
app.get("/", (req, res) => {
  res.status(200).json({ message: "DSA Revision Hub API is running. Go to /api-docs for Swagger specifications." });
});

// Bind fallback error catcher (must be bound last)
app.use(errorMiddleware);

export default app;
