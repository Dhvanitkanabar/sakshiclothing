import { Router } from 'express';
import {
  getAllCustomers,
  blockCustomer,
  unblockCustomer,
  deactivateCustomer,
  getCustomerDetails,
  deleteMyAccount
} from '../controllers/user.controller.js';
import { verifyJWT, authorizeRoles } from '../middlewares/auth.middleware.js';

const router = Router();

// Patron Self-Serve Account Deletion (App Store Guideline 5.1.1(v) & Google Play Data Safety)
router.delete('/me/account', verifyJWT, deleteMyAccount);
router.delete('/delete-account', verifyJWT, deleteMyAccount);

// Admin Routes for Customer Management
router.get('/admin/all', verifyJWT, authorizeRoles('admin', 'superadmin'), getAllCustomers);
router.get('/admin/:id/details', verifyJWT, authorizeRoles('admin', 'superadmin'), getCustomerDetails);
router.get('/admin/:id', verifyJWT, authorizeRoles('admin', 'superadmin'), getCustomerDetails);
router.patch('/admin/:id/block', verifyJWT, authorizeRoles('admin', 'superadmin'), blockCustomer);
router.patch('/admin/:id/unblock', verifyJWT, authorizeRoles('admin', 'superadmin'), unblockCustomer);
router.patch('/admin/:id/deactivate', verifyJWT, authorizeRoles('admin', 'superadmin'), deactivateCustomer);

export default router;
