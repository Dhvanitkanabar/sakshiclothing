import LoyaltyTransaction from '../models/LoyaltyTransaction.model.js';
import User from '../models/User.model.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getCustomerLoyaltyHistory = asyncHandler(async (req, res) => {
  const transactions = await LoyaltyTransaction.find({ user: req.user._id }).sort({ createdAt: -1 });
  const points = req.user.loyaltyPoints || 0;
  return res.status(200).json(new ApiResponse(200, { points, transactions }, 'Loyalty history fetched'));
});

export const getAdminLoyaltyTransactions = asyncHandler(async (req, res) => {
  const transactions = await LoyaltyTransaction.find()
    .populate('user', 'fullName email')
    .sort({ createdAt: -1 });
  return res.status(200).json(new ApiResponse(200, transactions, 'All loyalty transactions fetched'));
});

export const adjustPoints = asyncHandler(async (req, res) => {
  const { userId, points, description } = req.body;
  if (!points || points === 0) throw new ApiError(400, 'Points cannot be zero');

  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, 'User not found');

  user.loyaltyPoints = (user.loyaltyPoints || 0) + points;
  if (user.loyaltyPoints < 0) user.loyaltyPoints = 0; // Prevent negative
  await user.save();

  const transaction = await LoyaltyTransaction.create({
    user: userId,
    points,
    type: 'adjustment',
    description: description || 'Admin adjustment'
  });

  return res.status(200).json(new ApiResponse(200, transaction, 'Points adjusted successfully'));
});
