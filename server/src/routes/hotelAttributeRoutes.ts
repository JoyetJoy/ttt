import { Router } from 'express';
import {
  getHotelAttributes,
  createHotelAttribute,
  updateHotelAttribute,
  deleteHotelAttribute
} from '../controllers/hotelAttributeController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

router.get('/', getHotelAttributes);
router.post('/', protect, createHotelAttribute);
router.put('/:id', protect, updateHotelAttribute);
router.delete('/:id', protect, deleteHotelAttribute);

export default router;
