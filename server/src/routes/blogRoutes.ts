import express from 'express';
import { getBlogs, getBlogById } from '../controllers/blogController';

const router = express.Router();

// Public routes
router.get('/', getBlogs);
router.get('/:id', getBlogById);

export default router;
