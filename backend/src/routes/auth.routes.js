import { Router } from 'express';
import { register, login, refreshToken, logout,
         forgotPassword, resetPassword } from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { validateRequest } from '../middleware/validate.middleware.js';
import { registerValidator, loginValidator } from '../validators/auth.validator.js';

const router = Router();

router.post('/register',       registerValidator, validateRequest, register);
router.post('/login',          loginValidator,    validateRequest, login);
router.post('/refresh-token',  refreshToken);
router.post('/forgot-password', forgotPassword);
router.patch('/reset-password/:token', resetPassword);
router.post('/logout', protect, logout);

export default router;
