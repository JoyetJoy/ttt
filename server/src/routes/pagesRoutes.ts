import { Router } from 'express';
import { getPageBySlug, getActivePages } from '../controllers/pageController';

const router = Router();

// Public routes — no auth required
router.get('/', getActivePages);
router.get('/slug/:slug', getPageBySlug);

export default router;
