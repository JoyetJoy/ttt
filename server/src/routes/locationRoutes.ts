import { Router } from 'express';
import { getCountries, getStates, getCities, createLocation, updateLocation, deleteLocation } from '../controllers/locationController';

const router = Router();

router.get('/countries', getCountries);
router.get('/states/:countryId', getStates);
router.get('/cities/:stateId', getCities);
router.post('/', createLocation);
router.put('/:id', updateLocation);
router.delete('/:id', deleteLocation);

export default router;
