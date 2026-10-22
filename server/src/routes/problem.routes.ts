import { Router } from 'express';
import { getProblems, getProblemBySlug } from '../controllers/problem.controller';
import { optionalAuthenticateToken } from '../middleware/auth';

const router = Router();

router.get('/', optionalAuthenticateToken as any, getProblems as any);
router.get('/:slug', optionalAuthenticateToken as any, getProblemBySlug as any);

export default router;
