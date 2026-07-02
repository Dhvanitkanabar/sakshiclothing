import { Router } from 'express';
import AuthController from '../controllers/auth.controller.js';
import { authenticate, authenticateRefresh } from '../middlewares/authentication.js';
import { validateRequest } from '../middlewares/validateRequest.js';
import { 
  registerSchema, 
  loginSchema, 
  changePasswordSchema, 
  resetPasswordSchema 
} from '../validators/auth.validator.js';
import rateLimit from 'express-rate-limit';

const router = Router();

// Rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per windowMs
  message: { success: false, message: 'Too many attempts, please try again after 15 minutes' }
});

// Public Routes
router.post('/register', validateRequest(registerSchema), AuthController.register);
router.post('/login', authLimiter, validateRequest(loginSchema), AuthController.login);
router.post('/forgot-password', authLimiter, validateRequest(resetPasswordSchema), AuthController.forgotPassword);
router.post('/reset-password', AuthController.resetPassword);

// Token Refresh
router.post('/refresh-token', authenticateRefresh, AuthController.refreshToken);

// Protected Routes
router.use(authenticate); // Apply to all below
router.post('/logout', AuthController.logout);
router.post('/change-password', validateRequest(changePasswordSchema), AuthController.changePassword);
router.get('/me', AuthController.getProfile);

export default router;
