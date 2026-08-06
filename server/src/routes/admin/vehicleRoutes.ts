import { Router } from 'express';
import {
  getVehicleTypes,
  createVehicleType,
  updateVehicleType,
  deleteVehicleType,
  getVehicles,
  createVehicle
} from '../../controllers/admin/vehicleController';

const router = Router();

router.route('/types')
  .get(getVehicleTypes)
  .post(createVehicleType);

router.route('/types/:id')
  .put(updateVehicleType)
  .delete(deleteVehicleType);

router.route('/list')
  .get(getVehicles)
  .post(createVehicle);

export default router;
