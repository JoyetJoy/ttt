import { Router } from 'express';
import {
  getDestinationAttributes,
  createDestinationAttribute,
  updateDestinationAttribute,
  deleteDestinationAttribute
} from '../controllers/destinationAttributeController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

router.get('/', getDestinationAttributes);
router.post('/', protect, createDestinationAttribute);
router.put('/:id', protect, updateDestinationAttribute);
router.delete('/:id', protect, deleteDestinationAttribute);

export default router;
