import express from 'express';
import { getVisaCategories, createVisaCategory, updateVisaCategory, deleteVisaCategory } from '../controllers/visaCategoryController';
import { protect } from '../middleware/authMiddleware';
import { adminProtect } from '../middleware/adminMiddleware';

const router = express.Router();

router.get('/', getVisaCategories);
router.post('/', protect, adminProtect, createVisaCategory);
router.put('/:id', protect, adminProtect, updateVisaCategory);
router.delete('/:id', protect, adminProtect, deleteVisaCategory);

export default router;
