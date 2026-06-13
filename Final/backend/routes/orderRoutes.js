import express from 'express';
import { createOrder, getMyOrders, getSellerOrders, updateOrderStatus } from '../controllers/orderController.js';
import { protect } from '../middleware/auth.js';
import { isApprovedSeller } from '../middleware/seller.js';

const router = express.Router();

router.post('/', protect, createOrder);
router.get('/my-orders', protect, getMyOrders);
router.get('/seller-orders', protect, isApprovedSeller, getSellerOrders);
router.put('/:id/status', protect, updateOrderStatus);

export default router;