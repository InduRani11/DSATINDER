# Implementation Plan - AlgoRank (DSA Competitive Programming Platform)

AlgoRank is a full-stack competitive programming and DSA practice platform featuring problem solving, code execution, points system, coding streak tracking, global & college leaderboards, contests, and achievement badges.

## User Review Required

> [!IMPORTANT]
> **Single Admin / Zero Admin UI Enforcement**: In accordance with rule #1 and #2, there will be NO admin UI, admin registration, or admin dashboard. All database content (colleges, problems, test cases, contests) will be initialized via Prisma seeds (`prisma/seed.ts`).

> [!NOTE]
> **Database & Execution System**: We will setup Prisma ORM with SQLite for instant local execution out of the box (with easy PostgreSQL support via `DATABASE_URL`). For code execution, we will build a dedicated, safe execution runner service supporting JavaScript, Python, C, C++, and Java with test case evaluation and fallback sandbox execution.

---

## Proposed Architecture & Directory Structure

```
d:\dsa learn/
├── package.json                   # Root workspace / scripts
├── server/                        # Express TypeScript Backend
│   ├── prisma/
│   │   ├── schema.prisma          # Database schema (User, College, Problem, Submission, UserProblem, Contest, Badge, etc.)
│   │   └── seed.ts                # Seed script with 10+ colleges, 100+ DSA problems, test cases, badges
│   ├── src/
│   │   ├── controllers/           # Auth, Problem, Submission, Leaderboard, Profile, Contest controllers
│   │   ├── middleware/            # Auth guard, error handling, validation
│   │   ├── services/              # Code execution service, streak engine, badge engine
│   │   ├── routes/                # API routes (/api/auth, /api/problems, /api/submissions, etc.)
│   │   ├── utils/                 # JWT, password hash helpers
│   │   └── server.ts              # Express application entry point
│   ├── tsconfig.json
│   └── package.json
└── client/                        # React + Vite TypeScript Frontend
    ├── src/
    │   ├── components/            # Navbar, ProblemCard, CodeEditor, SubmissionsList, LeaderboardTable, BadgeCard, Charts
    │   ├── pages/                 # Home, Login, Register, Dashboard, Problems, ProblemDetail, Leaderboard, Contests, ContestDetail, Profile
    │   ├── context/               # AuthContext, ThemeContext
    │   ├── services/              # Axios API client & endpoints
    │   ├── types/                 # TypeScript interfaces for User, Problem, Submission, Leaderboard, etc.
    │   ├── utils/                 # Formatting, badge criteria helpers
    │   ├── App.tsx                # Routes & layout wrapper
    │   └── index.css              # Tailwind CSS styles & modern glassmorphic UI design tokens
    ├── package.json
    ├── tailwind.config.js
    └── vite.config.ts
```

---

## Proposed Changes

### Database & Backend Services (`server/`)

#### [NEW] [schema.prisma](file:///d:/dsa%20learn/server/prisma/schema.prisma)
- Define `User`, `College`, `Problem`, `TestCase`, `Submission`, `UserProblem`, `Contest`, `ContestProblem`, `ContestParticipant`, `Badge`, `UserBadge`, and `DailyActivity` models matching spec.

#### [NEW] [seed.ts](file:///d:/dsa%20learn/server/prisma/seed.ts)
- Seed 10+ colleges (e.g. COER University, IIT Delhi, NIT Jaipur, BITS Pilani, IIT Bombay, IIIT Hyderabad, DTU, MIT, Stanford, Harvard).
- Seed 100+ comprehensive DSA problems across 13 topics (Arrays, Strings, Linked List, Stack, Queue, Recursion, Searching, Sorting, Hashing, Trees, Graphs, Greedy, Dynamic Programming, Bit Manipulation).
- Seed realistic starter code for C++, Java, Python, JavaScript, and C.
- Seed sample & hidden test cases per problem.
- Seed platform badges (First Solve, 7 Day Streak, 50 Problems, DP Master, College Topper, etc.).

#### [NEW] [execution.service.ts](file:///d:/dsa%20learn/server/src/services/execution.service.ts)
- Safe execution engine evaluating user code against problem test cases.
- Supports JavaScript (isolated vm execution), Python, C, C++, and Java runner with execution timeouts and memory limit checks.

#### [NEW] API Controllers & Routes
- `auth.controller.ts`: Register (with college selection), Login, `me` endpoint.
- `problem.controller.ts`: GET `/api/problems` (with pagination, topic, difficulty, solved state, search, sorting), GET `/api/problems/:slug`.
- `submission.controller.ts`: POST `/api/submissions` (handles execution, first-solve logic, points calculation, duplicate-solve guard, streak update, badge trigger), GET `/api/submissions`.
- `leaderboard.controller.ts`: GET `/api/leaderboard/global`, GET `/api/leaderboard/college`.
- `profile.controller.ts`: GET `/api/profile`, PUT `/api/profile`, GET `/api/dashboard`.
- `contest.controller.ts`: GET `/api/contests`, GET `/api/contests/:id`, POST `/api/contests/:id/register`.

---

### Frontend Application (`client/`)

#### [NEW] [App.tsx](file:///d:/dsa%20learn/client/src/App.tsx)
- Configure React Router for student routes (`/`, `/login`, `/register`, `/dashboard`, `/problems`, `/problems/:slug`, `/leaderboard`, `/contests`, `/contests/:id`, `/profile`).

#### [NEW] [Navbar.tsx](file:///d:/dsa%20learn/client/src/components/Navbar.tsx)
- Navigation items: Home, Problems, Contests, Leaderboard, My Progress (Dashboard), Profile.
- Displays user streak 🔥, points, college badge, avatar, and logout. No admin menu items.

#### [NEW] Problem Solving View (`ProblemDetail.tsx` & `CodeEditor.tsx`)
- Left pane: Problem description, constraints, input/output format, examples, tags, points badge.
- Right pane: Monaco Editor with language selector (C++, Java, Python, JavaScript, C), theme toggle, starter code templates, "Run Code" and "Submit Code" buttons.
- Bottom pane: Test case execution status (Accepted, Wrong Answer, Compilation Error, TLE), test results table, sample test runner output.

#### [NEW] Leaderboard View (`Leaderboard.tsx`)
- Dual tab layout: **GLOBAL** | **MY COLLEGE**.
- Displays rank, student username, college name, problems solved count, total points.
- Highlight current student's row + sticky banner showing "Your Global Rank: #27" or "Your College Rank: #7".

#### [NEW] Student Dashboard (`Dashboard.tsx`)
- Welcome header, quick statistics cards (Total Points, Global Rank, College Rank, Problems Solved, Streak).
- Difficulty progress charts (Easy/Medium/Hard breakdown via Recharts).
- Topic mastery progress bars.
- Recent submissions history.
- "Continue Solving" recommended problem list.

#### [NEW] Profile & Badges (`Profile.tsx`)
- User stats, college info, unlocked badges grid (🏆 First Solve, 🔥 Streak Master, 🧠 DP Master, etc.), problem breakdown.

---

## Verification Plan

### Automated Tests & Verification
1. **Backend Seed Verification**: Run `npm run seed` and verify database population of colleges, 100+ problems, test cases, and badges.
2. **Authentication Flow**: Verify student registration with mandatory college choice, login, JWT issuance, and protected route access.
3. **Code Execution & Submission**: Run tests for code execution in Python/JavaScript/C++/Java against test cases; verify correct status output (Accepted/Wrong Answer/Compile Error).
4. **Points & Duplicate Solve Guard**: Submit duplicate correct solutions for a problem and confirm points are awarded ONLY on the first solve.
5. **Leaderboard Verification**: Verify global and college ranking calculations order (Points DESC -> Solved DESC -> Time ASC) and student rank highlighting.
6. **Streak & Badges Logic**: Verify streak increments upon daily solve and badge auto-unlock triggers.

### Manual Verification
- Visual inspection of dark glassmorphic responsive UI using standard browser review.
- Test end-to-end user flow: Register -> Select College -> Dashboard -> Pick Problem -> Write Code in Monaco -> Run Code -> Submit -> View Leaderboard & Profile updates.
