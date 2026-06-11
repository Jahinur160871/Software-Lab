import express from 'express';
import { getProducts, getProductById, createProduct, updateProduct, deleteProduct, getProductsBySeller } from '../controllers/productController.js';
import { protect } from '../middleware/auth.js';
import upload from '../middleware/upload.js';
import Category from '../models/Category.js';

const router = express.Router();

// Helper middleware to check if user can create product
const canCreateProduct = async (req, res, next) => {
  try {
    const { category } = req.body;
    
    // If no category, check later
    if (!category) {
      return next();
    }
    
    // Check if product is in Used Materials category
    const categoryDoc = await Category.findById(category);
    const isUsedItem = categoryDoc && categoryDoc.slug === 'used-materials';
    
    // For used items, anyone logged in can post
    if (isUsedItem) {
      return next();
    }
    
    // For other categories, user must be approved seller
    if (!req.user.isSeller || !req.user.sellerApproved) {
      return res.status(403).json({ message: 'Not authorized as approved seller' });
    }
    
    next();
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Helper middleware for update/delete - only seller can modify their own products
const canModifyProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    if (product.sellerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    next();
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

router.get('/', getProducts);
router.get('/seller/:sellerId', getProductsBySeller);
router.get('/:id', getProductById);
router.post('/', protect, upload.array('images', 5), canCreateProduct, createProduct);
router.put('/:id', protect, upload.array('images', 5), canModifyProduct, updateProduct);
router.delete('/:id', protect, canModifyProduct, deleteProduct);

export default router;