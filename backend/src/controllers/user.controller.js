import User from '../models/User.model.js';
import Order from '../models/Order.model.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';

export const getAllCustomers = asyncHandler(async (req, res) => {
  const { search, page = 1, limit = 10 } = req.query;
  const filter = { role: 'user' };
  
  if (search) {
    filter.$or = [
      { fullName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }

  const skip = (page - 1) * limit;
  const total = await User.countDocuments(filter);
  const customers = await User.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit))
    .select('-password');

  return res.status(200).json(new ApiResponse(200, { customers, total }, 'Customers fetched successfully'));
});

export const blockCustomer = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { isBlocked: true }, { new: true }).select('-password');
  if (!user) throw new ApiError(404, 'User not found');
  return res.status(200).json(new ApiResponse(200, user, 'Customer blocked'));
});

export const unblockCustomer = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { isBlocked: false }, { new: true }).select('-password');
  if (!user) throw new ApiError(404, 'User not found');
  return res.status(200).json(new ApiResponse(200, user, 'Customer unblocked'));
});

export const deactivateCustomer = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true }).select('-password');
  if (!user) throw new ApiError(404, 'User not found');
  return res.status(200).json(new ApiResponse(200, user, 'Customer deactivated'));
});

export const getCustomerDetails = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
    .populate('wishlist')
    .populate({
      path: 'cart',
      populate: { path: 'items.product' }
    })
    .select('-password');
  if (!user) throw new ApiError(404, 'User not found');

  const orderHistory = await Order.find({ customer: req.params.id }).sort({ createdAt: -1 });

  return res.status(200).json(new ApiResponse(200, { user, orderHistory }, 'Customer details fetched'));
});
