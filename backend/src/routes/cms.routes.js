import { Router } from 'express';
import CmsController from '../controllers/cms.controller.js';
import { authenticate } from '../middlewares/authentication.js';
import { authorize } from '../middlewares/authorize.js';
import { validateRequest } from '../middlewares/validateRequest.js';
import { bannerSchema, updateBannerSchema, announcementSchema } from '../validators/cms.validator.js';
import { ROLES } from '../constants/index.js';

const router = Router();

// PUBLIC ROUTES
router.get('/homepage', CmsController.getHomepageData);

// PROTECTED ADMIN ROUTES
router.use(authenticate);
router.use(authorize(ROLES.ADMIN));

router.get('/banners', CmsController.getBanners);
router.post('/banners', validateRequest(bannerSchema), CmsController.createBanner);
router.put('/banners/:id', validateRequest(updateBannerSchema), CmsController.updateBanner);
router.delete('/banners/:id', CmsController.deleteBanner);

router.get('/announcements', CmsController.getAnnouncements);
router.put('/announcements', validateRequest(announcementSchema), CmsController.updateAnnouncements);

export default router;
