# DSA Revision Hub 🚀

**Live Demo:** [https://dsa-revision-hub.web.app/](https://dsa-revision-hub.web.app/)

DSA Revision Hub is a high-performance Spaced Repetition System (SRS) and revision tracking system designed to help developers master Data Structures and Algorithms patterns (e.g., Two Pointers, Sliding Window, Fast & Slow Pointers). 

By logging solved questions and monitoring recall schedules, the platform helps ensure that key algorithms and problem-solving techniques remain fresh in memory.

---

## 🌟 Key Features

1. **Space Repetition Deck:** Calculates next review schedules dynamically using spaced repetition intervals to help retain memory of solved problems.
2. **Category & Pattern Tracker:** Tracks solved counts and detailed difficulty/platform metrics grouped by DSA patterns.
3. **Virtual Test Maker:**
   * Generate customized mock tests based on specific DSA patterns.
   * **Test Configurations:** Select custom test lengths (5, 10, 15, or 20 questions) and filter by difficulty levels (Easy, Medium, Hard).
   * **Custom Question Source:** Choose between mixed questions, only solved questions, or entirely new questions from external DSA resources (LeetCode, GeeksforGeeks, etc.).
   * **Interactive Test Interface:** Real-time timer tracking, live test progress controls, and direct links to active questions.
   * **Mock Test History & Analytics:** Complete historical timeline tracking of score results, elapsed time, and selected patterns persisted in MongoDB.

---

## 🛠️ System Architecture

The application is built on a modern decoupled stack:

* **Frontend:** Built with React, Next.js (App Router), TypeScript, and styled using custom premium CSS variables (yielding clean dark modes and micro-animations). Hosted on Firebase Hosting.
* **Backend:** Built using Node.js, Express, TypeScript, and Mongoose (MongoDB). Hosted on Render.

---

## 🚀 Getting Started

### Prerequisites
* [Node.js](https://nodejs.org) (v18 or higher)
* [MongoDB](https://www.mongodb.com/) (running locally or a MongoDB Atlas URI)

### Local Development Setup

#### 1. Backend Server Setup
Navigate to the `backend/` directory, configure your environment variables, and start the development server:

```bash
cd backend
npm install
```

Create a `.env` file inside the `backend/` directory:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/algorevision
JWT_SECRET=your_development_jwt_secret_key
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

Start the API server in development mode:
```bash
npm run dev
```
The API server will run at [http://localhost:5000](http://localhost:5000). You can access the API Swagger docs at `http://localhost:5000/api-docs/`.

#### 2. Frontend Client Setup
From the repository root directory, install the frontend dependencies and run the Next.js development server:

```bash
npm install
npm run dev
```

The Next.js client development server will run at [http://localhost:3000](http://localhost:3000).

---

## 📦 Deployment

### Frontend (Firebase Hosting)
The frontend client is configured to output static files (`out/`) that are hosted on Firebase Hosting:
```bash
# Build the Next.js static output
npm run build

# Deploy to Firebase Hosting
firebase deploy --only hosting
```

### Backend (Render / Containers)
The backend container is automatically redeployed on Render when new commits are pushed to the `main` branch:
```bash
git add .
git commit -m "your commit message"
git push origin main
```
For manual deployment instructions, or details on connection pooling, indexes, and database settings, check the [DEPLOYMENT.md](file:///home/harsh/Documents/algorevision/DEPLOYMENT.md) guide.

---

## 📄 License
This project is licensed under the MIT License.
