import { Router } from 'express';
import {
  getTransportLocations,
  createTransportLocation,
  updateTransportLocation,
  deleteTransportLocation
} from '../../controllers/admin/transportLocationController';

const router = Router();

router.route('/')
  .get(getTransportLocations)
  .post(createTransportLocation);

router.route('/:id')
  .put(updateTransportLocation)
  .delete(deleteTransportLocation);

export default router;
