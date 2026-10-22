import { Router } from 'express';
import { getContests, getContestById, registerForContest, createContest, deleteContest } from '../controllers/contest.controller';
import { optionalAuthenticateToken, authenticateToken } from '../middleware/auth';

const router = Router();

router.get('/', optionalAuthenticateToken as any, getContests as any);
router.get('/:id', optionalAuthenticateToken as any, getContestById as any);
router.post('/:id/register', authenticateToken as any, registerForContest as any);

// Admin contest management
router.post('/', createContest as any);
router.delete('/:id', deleteContest as any);

export default router;
