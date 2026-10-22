import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

import authRoutes from './routes/auth.routes';
import problemRoutes from './routes/problem.routes';
import submissionRoutes from './routes/submission.routes';
import leaderboardRoutes from './routes/leaderboard.routes';
import profileRoutes from './routes/profile.routes';
import contestRoutes from './routes/contest.routes';

// Load environment variables with fallback paths
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../server/.env') });
dotenv.config();

if (!process.env.DATABASE_URL) {
  const dbPath = path.resolve(__dirname, '../prisma/dev.db');
  process.env.DATABASE_URL = `file:${dbPath}`;
}

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

import { getColleges, DEFAULT_COLLEGES } from './controllers/auth.controller';
import bcrypt from 'bcryptjs';
import prisma from './utils/prisma';

async function seedDemoDataIfEmpty() {
  try {
    for (const col of DEFAULT_COLLEGES) {
      await prisma.college.upsert({
        where: { code: col.code },
        update: {},
        create: col
      }).catch(() => {});
    }

    const demoEmail = 'student@coer.ac.in';
    const existing = await prisma.user.findFirst({
      where: { OR: [{ email: demoEmail }, { username: 'indurani' }] }
    });

    if (!existing) {
      const hash = await bcrypt.hash('password123', 10);
      await prisma.user.create({
        data: {
          name: 'Indu Rani',
          username: 'indurani',
          email: demoEmail,
          password: hash,
          collegeId: 'de90ed94-a376-4b13-8e4f-41f228384573',
          totalPoints: 120,
          solvedCount: 5,
          currentStreak: 3,
          longestStreak: 7
        }
      });
      console.log('🌱 Demo user ready (indurani / password123)');
    }
  } catch (err: any) {
    console.warn('Seed verification warning:', err?.message);
  }
}

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString(), platform: 'AlgoRank API' });
});

// Colleges endpoint alias for registration and filters
app.get('/api/colleges', getColleges);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/problems', problemRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/contests', contestRoutes);

// Serve frontend build from client/dist in production
const clientDistPath = path.resolve(__dirname, '../../client/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api')) {
      return res.sendFile(path.join(clientDistPath, 'index.html'));
    }
    next();
  });
}

// Global Error Handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled Error:', err);
  res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

app.listen(PORT, async () => {
  console.log(`🚀 AlgoRank API Server running on http://localhost:${PORT}`);
  await seedDemoDataIfEmpty();
});
