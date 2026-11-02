import { Subscriber } from '../models/Subscriber.model.js';
import { Notification } from '../models/Notification.model.js';
import StoreSettings from '../models/StoreSettings.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import {
  sendSubscriberWelcomeEmail,
  sendSubscriberBroadcastEmail,
  getTransporter,
  sendTestEmail
} from '../utils/emailService.js';

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
    sendSubscriberWelcomeEmail(subscriber).catch((err) => {
      console.warn('[Welcome Email Notice] Could not send welcome email:', err.message);
    });

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
  sendSubscriberWelcomeEmail(subscriber).catch((err) => {
    console.warn('[Welcome Email Notice] Could not send welcome email:', err.message);
  });

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

// @desc    Get current SMTP Gateway configuration status
// @route   GET /api/v1/subscribers/smtp
// @access  Admin only
export const getSmtpConfig = asyncHandler(async (req, res) => {
  let settings = await StoreSettings.findOne().lean();

  const envUser = process.env.SMTP_USER || process.env.EMAIL_USER;
  const envPass = process.env.SMTP_PASSWORD || process.env.EMAIL_PASSWORD;

  const user = settings?.smtp?.user || envUser || 'sakshiclothing2025@gmail.com';
  const hasPassword = Boolean(settings?.smtp?.password || envPass);
  const provider = settings?.smtp?.provider || 'gmail';
  const host = settings?.smtp?.host || 'smtp.gmail.com';
  const port = settings?.smtp?.port || 465;
  const fromName = settings?.smtp?.fromName || 'Sakshi Clothing Atelier';
  const fromEmail = settings?.smtp?.fromEmail || user;
  const isConfigured = Boolean(hasPassword && user);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        isConfigured,
        provider,
        host,
        port,
        user,
        fromEmail,
        fromName,
        hasPassword,
        maskedPassword: hasPassword ? '••••••••••••••••' : ''
      },
      'SMTP configuration retrieved successfully.'
    )
  );
});

// @desc    Save SMTP Gateway configuration
// @route   POST /api/v1/subscribers/smtp
// @access  Admin only
export const saveSmtpConfig = asyncHandler(async (req, res) => {
  const { provider, host, port, user, password, fromEmail, fromName } = req.body;

  if (!user || !user.includes('@')) {
    throw new ApiError(400, 'A valid sender email address is required (e.g. sakshiclothing2025@gmail.com).');
  }

  let settings = await StoreSettings.findOne();
  if (!settings) {
    settings = new StoreSettings({
      storeName: 'Sakshi Clothing',
      email: user.trim(),
      phone: '+91 9316533660'
    });
  }

  const finalPassword = password && password.trim() ? password.trim().replace(/\s+/g, '') : settings?.smtp?.password;

  if (!finalPassword) {
    throw new ApiError(
      400,
      'A 16-character Google App Password (or SMTP Password) is required to enable live email dispatch.'
    );
  }

  const candidateConfig = {
    provider: provider || 'gmail',
    host: host || 'smtp.gmail.com',
    port: Number(port) || 465,
    user: user.trim(),
    password: finalPassword,
    fromEmail: fromEmail?.trim() || user.trim(),
    fromName: fromName?.trim() || 'Sakshi Clothing Atelier'
  };

  // Verify credentials with transporter.verify()
  const transporter = await getTransporter(candidateConfig);
  if (!transporter) {
    throw new ApiError(400, 'Could not initialize email transporter with provided settings.');
  }

  try {
    await transporter.verify();
  } catch (verifyErr) {
    console.error('[SMTP Verify Error]:', verifyErr);
    throw new ApiError(
      400,
      `SMTP Verification failed: ${verifyErr.message}. For Gmail, ensure 2-Step Verification is ON and generate a 16-character App Password at myaccount.google.com/apppasswords.`
    );
  }

  // Save to StoreSettings
  settings.smtp = {
    ...candidateConfig,
    isActive: true
  };
  await settings.save();

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        isConfigured: true,
        user: candidateConfig.user,
        fromEmail: candidateConfig.fromEmail,
        fromName: candidateConfig.fromName
      },
      'SMTP credentials verified and activated successfully! Real emails will now be delivered.'
    )
  );
});

// @desc    Send a live test email to verify credentials
// @route   POST /api/v1/subscribers/test-email
// @access  Admin only
export const testSmtpConnection = asyncHandler(async (req, res) => {
  const { toEmail, password, user, provider, host, port, fromEmail, fromName } = req.body;

  let settings = await StoreSettings.findOne().lean();
  const effectiveUser = user?.trim() || settings?.smtp?.user || process.env.SMTP_USER || 'sakshiclothing2025@gmail.com';
  const effectivePassword = password?.trim()?.replace(/\s+/g, '') || settings?.smtp?.password || process.env.SMTP_PASSWORD;
  const targetRecipient = toEmail?.trim() || effectiveUser;

  if (!effectivePassword) {
    throw new ApiError(
      400,
      'No SMTP password found. Please enter your Gmail 16-character App Password first.'
    );
  }

  const testConfig = {
    provider: provider || settings?.smtp?.provider || 'gmail',
    host: host || settings?.smtp?.host || 'smtp.gmail.com',
    port: port || settings?.smtp?.port || 465,
    user: effectiveUser,
    password: effectivePassword,
    fromEmail: fromEmail?.trim() || settings?.smtp?.fromEmail || effectiveUser,
    fromName: fromName?.trim() || settings?.smtp?.fromName || 'Sakshi Clothing Atelier'
  };

  try {
    await sendTestEmail({ toEmail: targetRecipient, config: testConfig });
  } catch (err) {
    console.error('[Test Email Error]:', err);
    throw new ApiError(
      400,
      `Failed to send test email: ${err.message}. Please check your credentials.`
    );
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      { recipient: targetRecipient },
      `Test email sent successfully to ${targetRecipient}! Please check your inbox (and Spam folder).`
    )
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

  // 1. Verify SMTP Gateway is configured & operational
  const transporter = await getTransporter();
  if (!transporter) {
    throw new ApiError(
      400,
      'Live Email Gateway is NOT configured. Real emails cannot be delivered. Please configure your Gmail 16-character App Password in the Email Gateway Settings before broadcasting.'
    );
  }

  try {
    await transporter.verify();
  } catch (verifyErr) {
    console.error('[Broadcast SMTP Verification Error]:', verifyErr);
    throw new ApiError(
      400,
      `SMTP Authentication Error: ${verifyErr.message}. Please check your Gmail App Password in Email Gateway Settings.`
    );
  }

  // 2. Fetch active subscribers
  const subscribers = await Subscriber.find({ isActive: true }).lean();

  if (!subscribers || subscribers.length === 0) {
    return res.status(200).json(
      new ApiResponse(200, { totalSubscribers: 0, sentCount: 0 }, 'No active subscribers found to broadcast to.')
    );
  }

  // 3. Dispatch real emails sequentially or with controlled batching to avoid Gmail rate limits
  let sentCount = 0;
  let failedCount = 0;
  const failureErrors = [];

  for (const sub of subscribers) {
    try {
      await sendSubscriberBroadcastEmail({
        to: sub.email,
        name: sub.name,
        heading: heading.trim(),
        description: description.trim(),
        ctaLink: ctaLink?.trim(),
        ctaText: ctaText?.trim()
      });
      sentCount++;
    } catch (err) {
      failedCount++;
      failureErrors.push(`${sub.email}: ${err.message}`);
      console.error(`[Broadcast Error] Failed to send to ${sub.email}:`, err.message);
    }
  }

  if (sentCount === 0 && subscribers.length > 0) {
    throw new ApiError(
      500,
      `Delivery failed for all subscribers. Reason: ${failureErrors[0] || 'Unknown error'}. Please verify your SMTP settings.`
    );
  }

  // 4. Log broadcast notification in database
  try {
    await Notification.create({
      title: `Broadcast: ${heading.trim()}`,
      message: `Atelier update was delivered to ${sentCount} subscribed patrons (Total active: ${subscribers.length}).`,
      type: 'system',
      isRead: false
    });
  } catch (e) {
    // Non-critical logging
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      { totalSubscribers: subscribers.length, sentCount, failedCount, failureErrors },
      `Update successfully dispatched to ${sentCount} out of ${subscribers.length} subscribed patrons.`
    )
  );
});

