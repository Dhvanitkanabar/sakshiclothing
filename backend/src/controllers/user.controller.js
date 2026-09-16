import User from '../models/User.model.js';
import Order from '../models/Order.model.js';
import Cart from '../models/Cart.model.js';
import Address from '../models/Address.model.js';
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
  const userId = req.params.id;
  
  const user = await User.findById(userId).select('-password -refreshToken');
  if (!user) throw new ApiError(404, 'User not found');

  let cart = null;
  try {
    cart = await Cart.findOne({ user: userId }).populate({
      path: 'items.product',
      select: 'name thumbnail pricing variants'
    });
  } catch (err) {
    console.warn('Cart lookup notice:', err.message);
  }

  let addresses = [];
  try {
    const addressQuery = user.clerkUserId 
      ? { $or: [{ user: userId }, { user: user.clerkUserId }] }
      : { user: userId };
    addresses = await Address.find(addressQuery).sort({ isDefault: -1 });
  } catch (err) {
    console.warn('Address lookup notice:', err.message);
  }

  let orderHistory = [];
  try {
    orderHistory = await Order.find({ customer: userId }).sort({ createdAt: -1 });
  } catch (err) {
    console.warn('Order history lookup notice:', err.message);
  }

  let wishlist = [];
  try {
    const userWithWishlist = await User.findById(userId).populate('wishlist', 'name thumbnail pricing');
    wishlist = userWithWishlist?.wishlist || [];
  } catch (err) {
    console.warn('Wishlist lookup notice:', err.message);
  }

  return res.status(200).json(new ApiResponse(200, {
    user: {
      ...user.toObject(),
      addresses,
      cart: cart || { items: [] },
      wishlist
    },
    orderHistory
  }, 'Customer details fetched'));
});
