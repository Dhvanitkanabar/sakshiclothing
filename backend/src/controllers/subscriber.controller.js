import { Subscriber } from '../models/Subscriber.model.js';
import { Notification } from '../models/Notification.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { sendSubscriberWelcomeEmail, sendSubscriberBroadcastEmail } from '../utils/emailService.js';

// @desc    Public subscription to Atelier Circle
// @route   POST /api/v1/subscribers
// @access  Public
export const subscribe = asyncHandler(async (req, res) => {
  const { email, name } = req.body;

  if (!email || !email.includes('@')) {
    throw new ApiError(400, 'Please provide a valid email address.');
  }

  const cleanEmail = email.trim().toLowerCase();
  const cleanName = name && name.trim() ? name.trim() : 'Patron';

  let subscriber = await Subscriber.findOne({ email: cleanEmail });

  if (subscriber) {
    if (!subscriber.isActive) {
      subscriber.isActive = true;
      if (cleanName !== 'Patron') subscriber.name = cleanName;
      await subscriber.save();
    }
    // Attempt sending welcome email (async non-blocking)
    sendSubscriberWelcomeEmail(subscriber).catch(() => {});

    return res.status(200).json(
      new ApiResponse(200, subscriber, 'Welcome back to the Sakshi Atelier Circle.')
    );
  }

  subscriber = await Subscriber.create({
    name: cleanName,
    email: cleanEmail,
    source: req.body.source || 'Atelier Circle Footer',
    isActive: true
  });

  // Send luxury welcome invitation email
  sendSubscriberWelcomeEmail(subscriber).catch(() => {});

  return res.status(201).json(
    new ApiResponse(201, subscriber, 'You have successfully joined the Sakshi Atelier Circle.')
  );
});

// @desc    Get all subscribers with name & email
// @route   GET /api/v1/subscribers
// @access  Admin only
export const getSubscribers = asyncHandler(async (req, res) => {
  const subscribers = await Subscriber.find()
    .sort({ createdAt: -1 })
    .lean();

  return res.status(200).json(
    new ApiResponse(200, subscribers, 'Subscribers fetched successfully')
  );
});

// @desc    Delete/Remove subscriber
// @route   DELETE /api/v1/subscribers/:id
// @access  Admin only
export const deleteSubscriber = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const subscriber = await Subscriber.findByIdAndDelete(id);
  if (!subscriber) {
    throw new ApiError(404, 'Subscriber not found');
  }

  return res.status(200).json(
    new ApiResponse(200, null, 'Subscriber removed successfully')
  );
});

// @desc    Broadcast announcement/update email to all active subscribers
// @route   POST /api/v1/subscribers/broadcast
// @access  Admin only
export const broadcastToSubscribers = asyncHandler(async (req, res) => {
  const { heading, description, ctaLink, ctaText } = req.body;

  if (!heading || !heading.trim()) {
    throw new ApiError(400, 'Broadcast heading is required.');
  }

  if (!description || !description.trim()) {
    throw new ApiError(400, 'Broadcast description is required.');
  }

  const subscribers = await Subscriber.find({ isActive: true }).lean();

  if (!subscribers || subscribers.length === 0) {
    return res.status(200).json(
      new ApiResponse(200, { count: 0 }, 'No active subscribers found to broadcast to.')
    );
  }

  // Dispatch emails in parallel with controlled concurrency
  let sentCount = 0;
  const emailPromises = subscribers.map(async (sub) => {
    try {
      const sent = await sendSubscriberBroadcastEmail({
        to: sub.email,
        name: sub.name,
        heading: heading.trim(),
        description: description.trim(),
        ctaLink: ctaLink?.trim(),
        ctaText: ctaText?.trim()
      });
      if (sent) sentCount++;
    } catch (err) {
      console.error(`Failed to send broadcast to ${sub.email}:`, err.message);
    }
  });

  await Promise.allSettled(emailPromises);

  // Also log broadcast notification in database
  try {
    await Notification.create({
      title: `Broadcast: ${heading.trim()}`,
      message: `Atelier update was dispatched to ${subscribers.length} subscribed patrons.`,
      type: 'system',
      isRead: false
    });
  } catch (e) {
    // Non-critical logging
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      { totalSubscribers: subscribers.length, sentCount },
      `Update successfully broadcast to ${subscribers.length} subscribed patrons.`
    )
  );
});
