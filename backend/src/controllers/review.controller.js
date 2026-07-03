import Review from '../models/Review.model.js';
import Product from '../models/Product.model.js';
import Order from '../models/Order.model.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const addReview = asyncHandler(async (req, res) => {
  const { productId, rating, title, comment } = req.body;
  const customerId = req.user._id;

  const existingReview = await Review.findOne({ product: productId, customer: customerId });
  if (existingReview) throw new ApiError(400, 'You have already reviewed this product');

  // Check if they purchased the product
  const hasPurchased = await Order.exists({
    customer: customerId,
    'orderItems.product': productId,
    orderStatus: 'delivered'
  });

  const review = await Review.create({
    product: productId,
    customer: customerId,
    rating,
    title,
    comment,
    isVerifiedPurchase: !!hasPurchased,
    isApproved: true // Auto approve or set to false for manual moderation
  });

  // Update product average rating
  const allReviews = await Review.find({ product: productId, isApproved: true });
  const avgRating = allReviews.reduce((acc, r) => acc + r.rating, 0) / allReviews.length;
  
  await Product.findByIdAndUpdate(productId, {
    ratings: avgRating,
    numOfReviews: allReviews.length
  });

  return res.status(201).json(new ApiResponse(201, review, 'Review submitted successfully'));
});

export const getProductReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ product: req.params.productId, isApproved: true })
    .populate('customer', 'fullName avatar')
    .sort({ createdAt: -1 });
  return res.status(200).json(new ApiResponse(200, reviews, 'Reviews fetched successfully'));
});

export const getAdminReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find()
    .populate('customer', 'fullName email')
    .populate('product', 'name')
    .sort({ createdAt: -1 });
  return res.status(200).json(new ApiResponse(200, reviews, 'All reviews fetched'));
});

export const updateReviewStatus = asyncHandler(async (req, res) => {
  const { isApproved } = req.body;
  const review = await Review.findByIdAndUpdate(req.params.id, { isApproved }, { new: true });
  
  if (!review) throw new ApiError(404, 'Review not found');

  // Recalculate rating
  const allReviews = await Review.find({ product: review.product, isApproved: true });
  const avgRating = allReviews.length > 0 ? (allReviews.reduce((acc, r) => acc + r.rating, 0) / allReviews.length) : 0;
  
  await Product.findByIdAndUpdate(review.product, {
    ratings: avgRating,
    numOfReviews: allReviews.length
  });

  return res.status(200).json(new ApiResponse(200, review, 'Review status updated'));
});
