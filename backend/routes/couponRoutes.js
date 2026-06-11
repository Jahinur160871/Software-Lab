import express from 'express';
import { createCoupon, getActiveCoupons, validateCoupon, getSellerCoupons, deleteCoupon } from '../controllers/couponController.js';
import { protect } from '../middleware/auth.js';
import { isApprovedSeller } from '../middleware/seller.js';

const router = express.Router();

router.get('/active', getActiveCoupons);
router.post('/validate', protect, validateCoupon);
router.post('/create', protect, isApprovedSeller, createCoupon);
router.get('/seller-coupons', protect, isApprovedSeller, getSellerCoupons);
router.delete('/:id', protect, deleteCoupon);

export default router;