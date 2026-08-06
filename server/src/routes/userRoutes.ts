import { Router } from 'express';
import { getDashboardStats, updateProfile, getAllBookings, getBookingById } from '../controllers/userController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

// All user routes are protected
router.use(protect);

router.get('/dashboard', getDashboardStats);
router.put('/profile', updateProfile);
router.get('/bookings', getAllBookings);
router.get('/bookings/:id', getBookingById);

export default router;
