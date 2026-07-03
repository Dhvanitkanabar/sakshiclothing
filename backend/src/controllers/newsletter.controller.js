import Newsletter from '../models/Newsletter.model.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { parseAsync } from 'json2csv';

export const subscribe = asyncHandler(async (req, res) => {
  const { email } = req.body;
  
  if (!email) throw new ApiError(400, 'Email is required');

  let subscriber = await Newsletter.findOne({ email: email.toLowerCase() });
  
  if (subscriber) {
    if (subscriber.isActive) {
      throw new ApiError(400, 'Email is already subscribed');
    }
    // Resubscribe
    subscriber.isActive = true;
    subscriber.subscribedAt = Date.now();
    await subscriber.save();
  } else {
    subscriber = await Newsletter.create({ email });
  }

  return res.status(200).json(new ApiResponse(200, null, 'Successfully subscribed to newsletter'));
});

export const unsubscribe = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) throw new ApiError(400, 'Email is required');

  const subscriber = await Newsletter.findOne({ email: email.toLowerCase() });
  if (subscriber) {
    subscriber.isActive = false;
    await subscriber.save();
  }

  return res.status(200).json(new ApiResponse(200, null, 'Successfully unsubscribed'));
});

export const getAdminSubscribers = asyncHandler(async (req, res) => {
  const subscribers = await Newsletter.find().sort({ createdAt: -1 });
  return res.status(200).json(new ApiResponse(200, subscribers, 'Subscribers fetched'));
});

export const exportSubscribersCsv = asyncHandler(async (req, res) => {
  const subscribers = await Newsletter.find().lean();
  
  const fields = ['email', 'isActive', 'subscribedAt'];
  const csv = await parseAsync(subscribers, { fields });
  
  res.header('Content-Type', 'text/csv');
  res.attachment('newsletter-subscribers.csv');
  return res.send(csv);
});
