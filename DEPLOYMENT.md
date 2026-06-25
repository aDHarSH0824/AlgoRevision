# DSA Revision Hub - Production Deployment & Operations Guide

This guide provides step-by-step instructions for building, deploying, optimizing, and scaling the DSA Revision Hub application in production environments.

---

## 1. System Architecture

The application implements a production-grade decoupled MERN Stack structure:
```
                  +--------------------------------+
                  |      User's Web Browser        |
                  +---------------+----------------+
                                  |
                                  | HTTP / WebSockets (Port 3000 -> Client Engine)
                                  v
                  +---------------+----------------+
                  |       Next.js Web App          |
                  +---------------+----------------+
                                  |
                                  | Fetch API Gateway (Port 5000 -> Backend Engine)
                                  v
                  +---------------+----------------+
                  |    Express.js Node API         |
                  +-------+---------------+--------+
                          |               |
             Mongoose TCP |               | HTTPS (Google OAuth & Gemini AI API)
                          v               v
           +--------------+---+    +------+---------+
           |  MongoDB Server  |    | External APIs  |
           +------------------+    +----------------+
```

---

## 2. Environment Configuration

Create a `.env` file in the `backend/` directory for local manually-run builds, or pass them directly as environment variables to container processes.

### Backend Configurations (`backend/.env` Schema)
| Variable Name | Description | Example / Default Value |
| :--- | :--- | :--- |
| `PORT` | Running TCP port of the API server | `5000` |
| `MONGODB_URI` | Full connection string to MongoDB | `mongodb://127.0.0.1:27017/algorevision` |
| `JWT_SECRET` | Strong cryptographic string to sign user auth tokens | `a_highly_secure_random_production_secret_392` |
| `JWT_EXPIRES_IN` | Duration validity of active JWT tokens | `7d` |
| `GOOGLE_CLIENT_ID` | OAuth Client ID for sign-in integration (Optional) | `1028392-googleclientid.apps.googleusercontent.com` |
| `GEMINI_API_KEY` | Google AI Studio Key for predictions & coaches (Optional) | `AIzaSyYourGeminiApiKeyHere` |
| `NODE_ENV` | Application environment node state | `production` |

### Frontend Configurations (Root environment context)
| Variable Name | Description | Example / Default Value |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | Publicly reachable address of the backend api gateway | `http://localhost:5000/api` |

---

## 3. Production Deployment with Docker Compose

Using Docker Compose is the recommended way to stand up the entire architecture in seconds.

### Quick Start
1. Ensure `Docker` and `Docker Compose` are installed.
2. In the repository root directory, run:
   ```bash
   docker compose up -d --build
   ```
3. Docker Compose will automatically spin up:
   - MongoDB container on port `27017` with persistent volume mount.
   - Node.js API container on port `5000`.
   - Next.js Standalone Client container on port `3000`.
4. Open [http://localhost:3000](http://localhost:3000) to access the application dashboard.
5. Inspect container logs:
   ```bash
   docker compose logs -f
   ```

---

## 4. Manual Manual Setup (Non-Docker)

### Backend Deployment
1. Move into backend: `cd backend`
2. Install production dependencies only: `npm ci --omit=dev`
3. Compile TypeScript files: `npm run build`
4. Run server: `npm start` (Runs `node dist/server.js`)

### Frontend Deployment
1. Move to root workspace folder.
2. Install dependencies: `npm ci`
3. Configure `next.config.ts` (Ensure `output: "standalone"` is enabled).
4. Run production compilation: `npm run build`
5. Start the standalone server:
   ```bash
   node .next/standalone/server.js
   ```

---

## 5. MongoDB Production Optimizations

To handle large question datasets and multiple concurrent users seamlessly:

### Database Indexing Strategy
We have already indexed critical query paths. Ensure they are present in the MongoDB instance:
* **Questions query paths**: Compound index on `{ userId: 1, nextRevisionAt: 1 }` to optimize fetching daily recall decks.
* **Category aggregation path**: Index on `{ userId: 1, patternId: 1 }` to optimize pattern-wise splits.
* **User query path**: Unique index on `{ email: 1 }` for rapid authentication verification.

Verify indexes by opening the Mongo Shell and running:
```javascript
use algorevision;
db.questions.getIndexes();
```

### Connection Pool Sizing
In production, adjust the connection pool in `backend/src/config/db.ts` to prevent bottlenecking or running out of sockets:
```typescript
mongoose.connect(process.env.MONGODB_URI, {
  maxPoolSize: 50,       // Maintain up to 50 socket connections
  minPoolSize: 10,       // Keep at least 10 idle connections warm
  socketTimeoutMS: 45000 // Close inactive sockets after 45s
});
```

---

## 6. Security Considerations

1. **SSL/TLS Termination**: Always place the app behind a reverse proxy (e.g., Nginx, Cloudflare) to terminate SSL certificate connections (HTTPS/WSS) before passing traffic to port 3000/5000.
2. **API Rate Limiting**: The backend has built-in Express rate limiters. Ensure that you config reverse proxy headers (e.g. `X-Forwarded-For` in Nginx) so that rate limiters block malicious client IPs instead of the proxy itself.
3. **CORS Strict Settings**: Change `cors()` parameters in `app.ts` from wildcard to allow only the specific domain where the frontend is deployed.

---

## 7. Scalability & Growth Considerations

When scaling to tens of thousands of active users:
* **Redis Caching**: Cache common recommendations and user statistics (solved counts, heatmap values) in Redis with a TTL of 1 hour, reducing MongoDB CPU consumption.
* **Read Replicas**: Configure a MongoDB Replica Set. Point read-heavy operations (e.g., dashboard statistics, revision histories) to secondary replica nodes, keeping primary instances free for mutation write queries.
* **Stateless API horizontal scaling**: Since the Express backend uses stateless JWT authentication, you can spin up multiple backend containers behind an Nginx load balancer to distribute computing power.
