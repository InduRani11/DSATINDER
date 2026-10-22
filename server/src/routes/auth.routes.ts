import { Router } from 'express';
import { register, login, getMe, getColleges } from '../controllers/auth.controller';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticateToken as any, getMe as any);
router.get('/colleges', getColleges);

export default router;
