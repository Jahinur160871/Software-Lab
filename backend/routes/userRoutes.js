import express from 'express';
import { becomeSeller, getSellerStatus, getMyProducts } from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/become-seller', protect, becomeSeller);
router.get('/seller-status', protect, getSellerStatus);
router.get('/my-products', protect, getMyProducts);

export default router;