import Notification from '../models/Notification.model.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getAdminNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ recipient: null })
    .sort({ createdAt: -1 })
    .limit(20);
  return res.status(200).json(new ApiResponse(200, notifications, 'Admin notifications fetched'));
});

export const markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findByIdAndUpdate(req.params.id, { isRead: true }, { new: true });
  return res.status(200).json(new ApiResponse(200, notification, 'Notification marked as read'));
});

export const createAdminNotification = asyncHandler(async (req, res) => {
  const { title, message, type, link, recipient } = req.body;
  const notification = await Notification.create({ title, message, type, link, recipient: recipient || null });
  return res.status(201).json(new ApiResponse(201, notification, 'Notification created'));
});

export const getCustomerNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ recipient: req.user._id })
    .sort({ createdAt: -1 })
    .limit(20);
  return res.status(200).json(new ApiResponse(200, notifications, 'Customer notifications fetched'));
});

export const deleteNotification = asyncHandler(async (req, res) => {
  await Notification.findOneAndDelete({ _id: req.params.id, recipient: req.user._id });
  return res.status(200).json(new ApiResponse(200, null, 'Notification deleted'));
});
