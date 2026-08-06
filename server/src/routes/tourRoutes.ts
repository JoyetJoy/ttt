import express from 'express';
import { getTours, getTourById, createTour, updateTour, deleteTour, getAttributeTerms } from '../controllers/tourController';
import { protect } from '../middleware/authMiddleware';
import { adminProtect } from '../middleware/adminMiddleware';

const router = express.Router();

// Public routes
router.get('/', getTours);
router.get('/attribute-terms', getAttributeTerms);
router.get('/:id', getTourById);

// Admin routes
router.post('/', protect, adminProtect, createTour);
router.put('/:id', protect, adminProtect, updateTour);
router.delete('/:id', protect, adminProtect, deleteTour);

export default router;
