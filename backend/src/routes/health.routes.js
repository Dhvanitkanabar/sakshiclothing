import { Router } from 'express';
import { checkHealth } from '../controllers/health.controller.js';

const router = Router();

// Map route to controller function
router.route('/health').get(checkHealth);

export default router;
