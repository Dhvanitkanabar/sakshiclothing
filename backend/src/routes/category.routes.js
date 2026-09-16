import { Router } from 'express';
import CategoryController from '../controllers/category.controller.js';
import { authenticate, optionalAuth } from '../middlewares/authentication.js';
import { authorize } from '../middlewares/authorize.js';
import { validateRequest } from '../middlewares/validateRequest.js';
import { createCategorySchema, updateCategorySchema } from '../validators/category.validator.js';
import { ROLES } from '../constants/index.js';

const router = Router();

// PUBLIC ROUTES
router.get('/tree', optionalAuth, CategoryController.getCategoryTree);
router.get('/', optionalAuth, CategoryController.getAllCategories);
router.get('/:id', optionalAuth, CategoryController.getCategoryById);

// PROTECTED ADMIN ROUTES
router.use(authenticate);
router.use(authorize(ROLES.ADMIN));

router.post('/', validateRequest(createCategorySchema), CategoryController.createCategory);
router.put('/:id', validateRequest(updateCategorySchema), CategoryController.updateCategory);
router.patch('/:id/status', CategoryController.softDeleteCategory); // disable
router.patch('/:id/restore', CategoryController.restoreCategory); // enable
router.delete('/:id', CategoryController.deleteCategory);

export default router;
