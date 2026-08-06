import express from 'express';
import { getAttributes, createAttribute, updateAttribute, deleteAttribute } from '../controllers/activityAttributeController';
import { protect } from '../middleware/authMiddleware';
import { adminProtect } from '../middleware/adminMiddleware';

const router = express.Router();

router.get('/', getAttributes);
router.post('/', protect, adminProtect, createAttribute);
router.put('/:id', protect, adminProtect, updateAttribute);
router.delete('/:id', protect, adminProtect, deleteAttribute);

export default router;
