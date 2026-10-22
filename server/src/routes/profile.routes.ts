import { Router } from 'express';
import { getProfile, updateProfile, getDashboardData } from '../controllers/profile.controller';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.get('/', authenticateToken as any, getProfile as any);
router.put('/', authenticateToken as any, updateProfile as any);
router.get('/dashboard', authenticateToken as any, getDashboardData as any);

export default router;
