import express from 'express';
import { registerUser, loginUser, logoutUser, getUserProfile, updateUserProfile, uploadProfileImage, removeProfileImage } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.post('/profile/upload-image', protect, upload.single('profileImage'), uploadProfileImage);
router.delete('/profile/remove-image', protect, removeProfileImage);

export default router;