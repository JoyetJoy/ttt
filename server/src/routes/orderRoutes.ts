import express from 'express';
import { createOrder, getAdminOrders, getAdminOrderById, updateAdminOrderStatus } from '../controllers/orderController';
import { protect } from '../middleware/authMiddleware';
import { adminProtect } from '../middleware/adminMiddleware';

const router = express.Router();

// Public route for creating an order/booking
router.post('/', createOrder); // Auth optional

// Admin route to view all orders/bookings
router.get('/admin', protect, adminProtect, getAdminOrders);
router.get('/admin/:id', protect, adminProtect, getAdminOrderById);
router.put('/admin/:id', protect, adminProtect, updateAdminOrderStatus);

export default router;
