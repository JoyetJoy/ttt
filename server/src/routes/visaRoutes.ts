import express from 'express';
import { getVisas, getVisaById, createVisa, updateVisa, deleteVisa } from '../controllers/visaController';
import { protect } from '../middleware/authMiddleware';
import { adminProtect } from '../middleware/adminMiddleware';

const router = express.Router();

// Public routes
router.get('/', getVisas);
router.get('/:id', getVisaById);

// Admin routes
router.post('/', protect, adminProtect, createVisa);
router.put('/:id', protect, adminProtect, updateVisa);
router.delete('/:id', protect, adminProtect, deleteVisa);

export default router;
