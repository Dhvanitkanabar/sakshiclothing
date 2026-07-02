import { Router } from 'express';
import {
  addAddress,
  getAddresses,
  updateAddress,
  deleteAddress,
  setDefaultAddress
} from '../controllers/address.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(verifyJWT);

router.route('/').post(addAddress).get(getAddresses);
router.route('/:id').put(updateAddress).delete(deleteAddress);
router.route('/:id/default').patch(setDefaultAddress);

export default router;
