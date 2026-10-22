import { Router } from 'express';
import { runCodeSample, submitSolution, getSubmissions } from '../controllers/submission.controller';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.post('/run', authenticateToken as any, runCodeSample as any);
router.post('/', authenticateToken as any, submitSolution as any);
router.get('/', authenticateToken as any, getSubmissions as any);

export default router;
