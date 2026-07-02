import express from 'express';
import uploadController from '../controllers/upload.controller.js';
import upload from '../middlewares/upload.middleware.js';
import { authenticate } from '../middlewares/authentication.js';
import { authorize } from '../middlewares/authorize.js';
import { ROLES } from '../constants/index.js';

const router = express.Router();

// Apply auth to all upload routes
router.use(authenticate);
router.use(authorize(ROLES.ADMIN, 'superadmin'));

// Route for single image upload
router.post('/image', upload.single('image'), uploadController.uploadSingle);

// Route for multiple images upload (max 10)
router.post('/images', upload.array('images', 10), uploadController.uploadMultiple);

// Route for deleting an image
router.delete('/:publicId', uploadController.deleteUpload);

export default router;
