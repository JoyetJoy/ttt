import express from 'express';
import { getTourAttributes, createTourAttribute, updateTourAttribute, deleteTourAttribute } from '../controllers/tourAttributeController';

const router = express.Router();

// GET all tour attributes (with terms)
router.get('/', getTourAttributes);

// POST create a new attribute (with terms)
router.post('/', createTourAttribute);

// PUT update an attribute (with terms)
router.put('/:id', updateTourAttribute);

// DELETE an attribute
router.delete('/:id', deleteTourAttribute);

export default router;
