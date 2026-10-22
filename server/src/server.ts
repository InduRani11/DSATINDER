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

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

import { getColleges } from './controllers/auth.controller';

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
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// Global Error Handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled Error:', err);
  res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

app.listen(PORT, () => {
  console.log(`🚀 AlgoRank API Server running on http://localhost:${PORT}`);
});
