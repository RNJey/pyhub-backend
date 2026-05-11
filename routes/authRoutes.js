import express from 'express';
const router = express.Router();
import * as authController from '../controllers/authController.js'; 
import { protect } from '../middleware/authMiddleware.js'; // Pastikan kamu punya middleware ini

// Route Publik
router.post('/register', authController.register);
router.post('/login', authController.login);

// Route Privat (Membutuhkan Token)
router.get('/me', protect, authController.getMe);

export default router;