# 🚀 DSATinder (AlgoRank) - Competitive Programming & DSA Platform

A modern, full-stack Data Structures & Algorithms competitive programming and practice platform featuring problem solving, real-time code execution, difficulty points, coding streaks, global and college leaderboards, and timed contests.

---

## ✨ Features

- **110+ DSA Problems**: Curated across 14 topics (Arrays, Strings, Linked Lists, Trees, Dynamic Programming, Graphs, Hashing, etc.) with multiple difficulty tiers.
- **In-Browser Code Editor**: Powered by Monaco Editor with syntax highlighting, custom test inputs, and starter templates for **JavaScript, Python, C++, Java, and C**.
- **Real-Time Code Execution**: Executes user code against sample and hidden test cases, returning detailed status (Accepted, Wrong Answer, TLE, etc.).
- **College & Global Leaderboards**: Live standings where student solves directly contribute points to their institution (COER, IITs, NITs, BITS, DTU, etc.).
- **Daily Streak & Achievement Engine**: Automatic tracking of active daily solving streaks with badges and milestones.
- **Contest Arena with Admin Creation**:
  - Timed contests with start/end schedules and problem sets.
  - Interactive Admin Contest Creator to publish rounds directly from the web interface or CLI.
  - Dynamic live contest leaderboards with penalty time tracking.

---

## 🛠️ Tech Stack

### Frontend (`/client`)
- **React 19** + **TypeScript** + **Vite**
- **Tailwind CSS** with glassmorphism design tokens
- **Monaco Editor** (`@monaco-editor/react`)
- **Lucide Icons**, **Recharts**
- **Canvas Confetti** for solve celebrations

### Backend (`/server`)
- **Node.js** + **Express** + **TypeScript**
- **Prisma ORM** with **SQLite** (seamlessly switchable to PostgreSQL via `DATABASE_URL`)
- **JWT** Authentication + **Bcrypt** Password Hashing
- **Execution Sandbox Runner** with timeouts and memory monitoring

---

## 🚀 Quick Start (Local Development)

### 1. Clone the repository
```bash
git clone https://github.com/InduRani11/DSATINDER.git
cd DSATINDER
```

### 2. Setup the Backend
```bash
cd server
npm install
cp .env.example .env
npm run db:push
npm run seed
npm run dev
```
Backend API will start on `http://localhost:5000`.

### 3. Setup the Frontend
```bash
cd ../client
npm install
npm run dev
```
Frontend will be live on `http://localhost:5173`.

---

## 🌐 Deploying Live

### Frontend (Vercel / Netlify)
1. Push this repository to GitHub.
2. In Vercel or Netlify, import the repository and set:
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Environment Variable**: `VITE_API_URL` pointing to your deployed backend.

### Backend (Render / Railway)
1. In Render.com or Railway, create a new Web Service pointing to the `server` folder.
2. Build command: `npm install && npm run build && npx prisma db push`
3. Start command: `npm start`
4. Set environment variables (`DATABASE_URL`, `JWT_SECRET`, `PORT`, `ADMIN_SECRET`).

---

## 👤 Author
- **Indu Rani** - [GitHub @InduRani11](https://github.com/InduRani11)
