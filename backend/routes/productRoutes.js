import express from 'express';
import { getProducts, getProductById, createProduct, updateProduct, deleteProduct, getProductsBySeller, getLabEquipment } from '../controllers/productController.js';
import { protect } from '../middleware/auth.js';
import { isApprovedSeller } from '../middleware/seller.js';
import upload from '../middleware/upload.js';

const router = express.Router();

router.get('/', getProducts);
router.get('/lab-equipment', getLabEquipment);
router.get('/seller/:sellerId', getProductsBySeller);
router.get('/:id', getProductById);
router.post('/', protect, isApprovedSeller, upload.array('images', 5), createProduct);
router.put('/:id', protect, isApprovedSeller, upload.array('images', 5), updateProduct);
router.delete('/:id', protect, isApprovedSeller, deleteProduct);

export default router;