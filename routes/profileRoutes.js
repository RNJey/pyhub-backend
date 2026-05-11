import express from 'express';
import { getProfileById, updateProfile } from '../controllers/profileController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Route untuk mendapatkan data profil & update progres
router.get('/:id', protect, getProfileById);
router.put('/:id', protect, updateProfile);

export default router;