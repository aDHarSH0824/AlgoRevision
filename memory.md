# DSA Revision Hub - Project Memory Log

This file documents the current state, architecture, and task logs of the DSA Revision Hub project to maintain context and ease developer recall.

---

## 1. Project Overview & Architecture
The project is built as a Decoupled MERN stack application with React/Next.js frontend and Node/Express backend.

### Folder Structure Map
* `/` (Root Folder): Next.js 16 Client App Router configuration
  * `/app`: Frontend page views, layout contexts, and API integration services
    * `page.tsx`: Core landing page with JWT & Mock Google OAuth login forms
    * `layout.tsx`: Configures Cormorant Garamond / Inter typography and auth contexts
    * `/components/Header.tsx`: Navigation bar with role-based routing controls
    * `/context/AuthContext.tsx`: Manages login/registration states and route protection guards
    * `/services/api.ts`: Fetch-based API client mapping routes to port `5000`
    * `/dashboard/page.tsx`: Student metrics center with github-style heatmap and AI weekly study schedules
    * `/patterns/page.tsx`: CRUD interface to create and manage topic categories
    * `/questions/page.tsx`: Solved coding questions log with automatic AI category prediction
    * `/revision/page.tsx`: Flashcard revision player with SuperMemo-2 Spaced Repetition ratings
    * `/coach/page.tsx`: Interactive AI algorithm trace coach
* `/backend`: Node.js Express API Server
  * `/src/config/db.ts`: Handles Mongoose MongoDB connection pooling
  * `/src/models`: Database collection schemas (`User.ts`, `Pattern.ts`, `Question.ts`, `RevisionHistory.ts`, `RevisionSchedule.ts`)
  * `/src/repositories`: Repository Pattern implementations (`UserRepository`, `PatternRepository`, `QuestionRepository`, `RevisionRepository`, `RevisionScheduleRepository`)
  * `/src/controllers`: Controller layer processing endpoint requests (`AuthController`, `PatternController`, `QuestionController`, `RevisionController`, `AIController`)
  * `/src/routes`: Express Router registries mapped to `/api/*`
  * `/src/middlewares`: Security, validation, and error interceptors (`authMiddleware`, `validate`, `errorMiddleware`, `rateLimiter`)
  * `/src/services`: Utility business logic wrappers (`SpacedRepetitionService`, `AuthService`, `AIService`)

---

## 2. Completed Milestones

### Backend API Setup
- [x] Repository pattern setup with Express routing and Mongoose schema models
- [x] Spaced Repetition engine implementing SuperMemo-2 algorithm modifiers
- [x] Swagger documentation auto-generator mapped at `/api-docs`
- [x] Database indexes on `{ userId, nextRevisionAt }` and `{ userId, patternId }`
- [x] JWT verification and password hashing service

### Frontend Client Setup
- [x] Landing page with clean warm-canvas styling and mock/real credential authentication
- [x] Dashboard compiling solved stats, upcoming tasks, and Aggregated Heatmaps
- [x] CRUD management grids for Algorithmic Patterns and solved Coding Problems
- [x] Active Recall revision game deck with ratings inputs updating future intervals

### Operations & Infrastructure
- [x] Multi-stage `Dockerfile` and `.dockerignore` for Backend service
- [x] Standalone multi-stage `Dockerfile` and `.dockerignore` for Frontend service
- [x] Root-level `docker-compose.yml` defining interconnected container networks
- [x] GitHub Actions CI/CD pipeline validating build checks on commit

---

## 3. Tasks in Progress / Active Backlog
- [x] Refine AI API Service configuration to support dynamic and active model parameters (`gemini-1.5-flash`)
- [x] Redesign Spaced Repetition Player UI to soften success colors and enhance flashcard visibility
- [x] Shift UI theme from Claude design (warm cream + serifs) to LeetCode + GitHub design (light/dark modes + sans-serif typography)
- [x] Fix empty state visual text column-wrapping issues (`max-w-xs` to `max-w-[320px]`)
- [x] Remove AI Coach links, features, mobile route, and views (`/app/coach/page.tsx`)
- [x] Implement Virtual Test Maker at `/test` with live timer, pattern filtering, and automatic dynamic question fallbacks
- [x] Remove all AI elements from UI (dashboard, logging modal, landing page)
- [x] Create reachable footer documentation, privacy, and terms pages
- [x] Scale up landing page typography and convert home headers to sans-serif
- [x] Compile and verify project build validity



