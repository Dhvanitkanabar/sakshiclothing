import Product from '../models/Product.model.js';
import Order from '../models/Order.model.js';
import User from '../models/User.model.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const globalSearch = asyncHandler(async (req, res) => {
  const { q } = req.query;
  if (!q) {
    return res.status(200).json(new ApiResponse(200, { products: [], orders: [], users: [] }, 'Empty search query'));
  }

  const searchRegex = new RegExp(q, 'i');

  const [products, orders, users] = await Promise.all([
    Product.find({ name: searchRegex }).select('name slug status').limit(5).lean(),
    Order.find({ orderNumber: searchRegex }).select('orderNumber orderStatus totals.grandTotal').limit(5).lean(),
    User.find({ $or: [{ fullName: searchRegex }, { email: searchRegex }], role: 'user' }).select('fullName email').limit(5).lean()
  ]);

  return res.status(200).json(new ApiResponse(200, { products, orders, users }, 'Global search results'));
});
