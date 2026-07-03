import Coupon from '../models/Coupon.model.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const createCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.create(req.body);
  return res.status(201).json(new ApiResponse(201, coupon, 'Coupon created successfully'));
});

export const getCoupons = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find().sort({ createdAt: -1 });
  return res.status(200).json(new ApiResponse(200, coupons, 'Coupons fetched successfully'));
});

export const updateCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!coupon) throw new ApiError(404, 'Coupon not found');
  return res.status(200).json(new ApiResponse(200, coupon, 'Coupon updated successfully'));
});

export const deleteCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findByIdAndDelete(req.params.id);
  if (!coupon) throw new ApiError(404, 'Coupon not found');
  return res.status(200).json(new ApiResponse(200, null, 'Coupon deleted successfully'));
});

export const validateCoupon = asyncHandler(async (req, res) => {
  const { code, orderAmount } = req.body;
  const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });
  
  if (!coupon) throw new ApiError(404, 'Invalid or expired coupon');
  
  if (coupon.expiryDate < new Date()) {
    coupon.isActive = false;
    await coupon.save();
    throw new ApiError(400, 'Coupon has expired');
  }

  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
    throw new ApiError(400, 'Coupon usage limit reached');
  }

  if (coupon.minimumOrderAmount && orderAmount < coupon.minimumOrderAmount) {
    throw new ApiError(400, `Minimum order amount of ₹${coupon.minimumOrderAmount} required`);
  }

  let discount = 0;
  if (coupon.discountType === 'flat') {
    discount = coupon.discountValue;
  } else if (coupon.discountType === 'percentage') {
    discount = (orderAmount * coupon.discountValue) / 100;
    if (coupon.maximumDiscount && discount > coupon.maximumDiscount) {
      discount = coupon.maximumDiscount;
    }
  }

  return res.status(200).json(new ApiResponse(200, { coupon, discount }, 'Coupon is valid'));
});
