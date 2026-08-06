import express from 'express';
import { getTransports, getTransportById, getVehicleTypes, getTransportLocations } from '../controllers/transportController';

const router = express.Router();

// Public routes
router.get('/', getTransports);
router.get('/vehicle-types', getVehicleTypes);
router.get('/locations', getTransportLocations);
router.get('/:id', getTransportById);

export default router;
