import express from 'express';
import multer from 'multer';
import { getActivities, getActivityById, createActivity, updateActivity, deleteActivity } from '../controllers/activityController';
import { protect } from '../middleware/authMiddleware';
import { adminProtect } from '../middleware/adminMiddleware';

const router = express.Router();
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fieldSize: 25 * 1024 * 1024 } // 25MB limit for large rich text fields
});

// Public routes
router.get('/', getActivities);
router.get('/:id', getActivityById);

// Admin routes
router.post('/', protect, adminProtect, upload.fields([
  { name: 'feature_img', maxCount: 1 },
  { name: 'youtube_image', maxCount: 1 },
  { name: 'icon', maxCount: 1 },
  { name: 'gallery_images', maxCount: 10 }
]), createActivity);

router.put('/:id', protect, adminProtect, upload.fields([
  { name: 'feature_img', maxCount: 1 },
  { name: 'youtube_image', maxCount: 1 },
  { name: 'icon', maxCount: 1 },
  { name: 'gallery_images', maxCount: 10 }
]), updateActivity);

router.delete('/:id', protect, adminProtect, deleteActivity);

export default router;
