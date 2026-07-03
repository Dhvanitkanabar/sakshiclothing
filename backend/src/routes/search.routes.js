import { Router } from 'express';
import { globalSearch } from '../controllers/search.controller.js';
import { verifyJWT, authorizeRoles } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/admin', verifyJWT, authorizeRoles('admin', 'superadmin'), globalSearch);

export default router;
