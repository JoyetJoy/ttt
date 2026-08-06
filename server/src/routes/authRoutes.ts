import { Router } from 'express';
import { register, login, getMe, checkPhone, loginPhone, registerPhone } from '../controllers/authController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.post('/check-phone', checkPhone);
router.post('/login-phone', loginPhone);
router.post('/register-phone', registerPhone);

export default router;
