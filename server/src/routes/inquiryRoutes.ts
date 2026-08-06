import express from 'express';
import { submitInquiry } from '../controllers/inquiryController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

// Optional auth middleware, it sets req.user if token is present, but doesn't block if missing
// Wait, authMiddleware blocks if no token is present. So we'll just not use authMiddleware here.
// Instead, if we want to extract user, we can do it in a custom middleware or just let the client send author_id.
// The client can send a token and we can decode it manually if needed, or we just trust the client for now.
router.post('/', submitInquiry);

export default router;
