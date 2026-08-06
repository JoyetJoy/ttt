import { Router } from 'express';
import { getThemeSettings, updateThemeSettings } from '../controllers/settingsController';
import { protect } from '../middleware/authMiddleware';
import { adminProtect } from '../middleware/adminMiddleware';

const router = Router();

router.get('/theme', getThemeSettings);
router.post('/theme', protect, adminProtect, updateThemeSettings);

export default router;
