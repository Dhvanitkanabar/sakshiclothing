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

export const getLoyaltyPoints = asyncHandler(async (req, res) => {
  if (!req.user) {
    return res.status(200).json(new ApiResponse(200, { points: 0, transactions: [] }, 'Guest loyalty'));
  }
  const user = await User.findById(req.user._id).select('loyaltyPoints createdAt fullName');
  const points = user?.loyaltyPoints || 0;
  const transactions = points > 0 ? [
    {
      _id: `tx_${user._id}`,
      type: 'earned',
      points: points,
      description: 'Account Welcome Reward & Couture Tier Points',
      createdAt: user?.createdAt || new Date()
    }
  ] : [];
  return res.status(200).json(new ApiResponse(200, { points, transactions }, 'Loyalty points retrieved'));
});

export const deleteMyAccount = asyncHandler(async (req, res) => {
  if (!req.user || !req.user._id) {
    throw new ApiError(401, 'Authentication required to delete account');
  }

  const userId = req.user._id;
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, 'User account not found');
  }

  // 1. Purge personal non-financial records
  await Cart.deleteMany({ user: userId });
  await Address.deleteMany({ user: userId });

  // 2. Anonymize user record under DPDP Act 2023 & statutory retention obligations
  // (Order documents retained for 8 years under Indian law, but personal identifiers expunged)
  user.fullName = 'Deleted Patron';
  user.email = `deleted_${userId.toString().slice(-8)}@anonymized.sakshiclothing.store`;
  user.phone = undefined;
  user.avatar = undefined;
  user.wishlist = [];
  user.addresses = [];
  user.loyaltyPoints = 0;
  user.isActive = false;
  user.isDeleted = true;
  user.deletedAt = new Date();
  user.deviceTokens = [];
  user.refreshToken = undefined;

  // 3. Delete from Clerk if Clerk user ID is present
  if (user.clerkUserId && process.env.CLERK_SECRET_KEY) {
    try {
      const { createClerkClient } = await import('@clerk/backend');
      const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
      await clerk.users.deleteUser(user.clerkUserId);
    } catch (clerkErr) {
      console.warn(`[Account Deletion] Clerk deletion warning for ${user.clerkUserId}:`, clerkErr.message);
    }
    user.clerkUserId = undefined;
  }

  await user.save({ validateModifiedOnly: true });

  // 4. Clear auth cookie
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  });

  return res.status(200).json(new ApiResponse(200, { isDeleted: true }, 'Account and personal data successfully deleted and anonymized'));
});
