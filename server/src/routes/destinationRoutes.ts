import express from 'express';
import { getDestinations, getDestinationById } from '../controllers/destinationController';

const router = express.Router();

// Public routes
router.get('/', getDestinations);
router.get('/:id', getDestinationById);

export default router;
