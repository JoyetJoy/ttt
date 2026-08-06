import express from 'express';
import { getHotels, getHotelById, createHotel, updateHotel, deleteHotel } from '../controllers/hotelController';
import { protect } from '../middleware/authMiddleware';
import { adminProtect } from '../middleware/adminMiddleware';

const router = express.Router();

// Public routes
router.get('/', getHotels);
router.get('/:id', getHotelById);

// Admin routes
router.post('/', protect, adminProtect, createHotel);
router.put('/:id', protect, adminProtect, updateHotel);
router.delete('/:id', protect, adminProtect, deleteHotel);

export default router;
