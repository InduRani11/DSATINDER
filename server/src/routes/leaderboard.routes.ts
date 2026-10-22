import { Router } from 'express';
import { getGlobalLeaderboard, getCollegeLeaderboard } from '../controllers/leaderboard.controller';
import { optionalAuthenticateToken, authenticateToken } from '../middleware/auth';

const router = Router();

router.get('/global', optionalAuthenticateToken as any, getGlobalLeaderboard as any);
router.get('/college', authenticateToken as any, getCollegeLeaderboard as any);

export default router;
