import { Router } from 'express';
import BrandController from '../controllers/brand.controller.js';
import { authenticate } from '../middlewares/authentication.js';
import { authorize } from '../middlewares/authorize.js';
import { validateRequest } from '../middlewares/validateRequest.js';
import { createBrandSchema, updateBrandSchema } from '../validators/brand.validator.js';
import { ROLES } from '../constants/index.js';

const router = Router();

// PUBLIC ROUTES
router.get('/featured', BrandController.getFeaturedBrands);
router.get('/', BrandController.getAllBrands);
router.get('/:id', BrandController.getBrandById);

// PROTECTED ADMIN ROUTES
router.use(authenticate);
router.use(authorize(ROLES.ADMIN));

router.post('/', validateRequest(createBrandSchema), BrandController.createBrand);
router.put('/:id', validateRequest(updateBrandSchema), BrandController.updateBrand);
router.patch('/:id/feature', BrandController.toggleFeatured);
router.delete('/:id', BrandController.deleteBrand);

export default router;
