import { Router } from 'express';
import ProductController from '../controllers/product.controller.js';
import { authenticate } from '../middlewares/authentication.js';
import { authorize } from '../middlewares/authorize.js';
import { validateRequest } from '../middlewares/validateRequest.js';
import { createProductSchema, updateProductSchema } from '../validators/product.validator.js';
import { ROLES } from '../constants/index.js';

const router = Router();

// -----------------------------------------
// PUBLIC ROUTES
// -----------------------------------------
router.get('/featured', ProductController.getFeatured);
router.get('/trending', ProductController.getTrending);
router.get('/new-arrivals', ProductController.getNewArrivals);
router.get('/slug/:slug', ProductController.getProductBySlug);
router.get('/:id', ProductController.getProductById);
router.get('/', ProductController.getProducts);

// -----------------------------------------
// PROTECTED ADMIN ROUTES
// -----------------------------------------
router.use(authenticate);
router.use(authorize(ROLES.ADMIN));

router.post('/', validateRequest(createProductSchema), ProductController.createProduct);
router.put('/:id', validateRequest(updateProductSchema), ProductController.updateProduct);
router.patch('/:id/status', ProductController.updateStatus);
router.patch('/:id/restore', ProductController.restoreProduct);
router.post('/:id/duplicate', ProductController.duplicateProduct);
router.delete('/:id', ProductController.deleteProduct);

export default router;
