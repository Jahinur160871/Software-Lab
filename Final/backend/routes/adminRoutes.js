import express from 'express';
import { getPendingSellers, approveSeller, getAllUsers, deleteUser, getStats, getAllOrders } from '../controllers/adminController.js';
import { protect } from '../middleware/auth.js';
import { isAdmin } from '../middleware/admin.js';

const router = express.Router();

router.use(protect, isAdmin);
router.get('/pending-sellers', getPendingSellers);
router.put('/approve-seller/:userId', approveSeller);
router.get('/users', getAllUsers);
router.delete('/user/:userId', deleteUser);
router.get('/stats', getStats);
router.get('/all-orders', getAllOrders);

export default router;