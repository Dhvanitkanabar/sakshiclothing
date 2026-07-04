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

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: User authentication and account management
 */

// Rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per windowMs
  message: { success: false, message: 'Too many attempts, please try again after 15 minutes' }
});

// Public Routes

/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - email
 *               - password
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 6
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Validation error or user exists
 */
router.post('/register', validateRequest(registerSchema), AuthController.register);

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', authLimiter, validateRequest(loginSchema), AuthController.login);

/**
 * @swagger
 * /api/v1/auth/forgot-password:
 *   post:
 *     summary: Request password reset link
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Reset email sent
 */
router.post('/forgot-password', authLimiter, validateRequest(resetPasswordSchema), AuthController.forgotPassword);
router.post('/reset-password', AuthController.resetPassword);

// Token Refresh
router.post('/refresh-token', authenticateRefresh, AuthController.refreshToken);

// Protected Routes
router.post('/logout', authenticate, AuthController.logout);
router.post('/change-password', authenticate, validateRequest(changePasswordSchema), AuthController.changePassword);
router.get('/me', authenticate, AuthController.getProfile);
router.get('/profile', authenticate, AuthController.getProfile);

export default router;
