import { Router } from 'express';
import express from 'express';
import { Webhook } from 'svix';
import User from '../models/User.model.js';

const router = Router();

// Clerk Webhook endpoint
// Note: We need raw body to verify Svix signature, so we use express.raw
router.post(
  '/clerk',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    const SIGNING_SECRET = process.env.CLERK_WEBHOOK_SECRET;

    if (!SIGNING_SECRET) {
      console.error('Error: Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env');
      return res.status(500).send('Webhook secret missing');
    }

    const wh = new Webhook(SIGNING_SECRET);

    // Get headers
    const svix_id = req.headers['svix-id'];
    const svix_timestamp = req.headers['svix-timestamp'];
    const svix_signature = req.headers['svix-signature'];

    if (!svix_id || !svix_timestamp || !svix_signature) {
      return res.status(400).send('Error: Missing svix headers');
    }

    let evt;

    try {
      // Verify signature
      evt = wh.verify(req.rawBody || req.body, {
        'svix-id': svix_id,
        'svix-timestamp': svix_timestamp,
        'svix-signature': svix_signature,
      });
    } catch (err) {
      console.error('Error: Could not verify webhook:', err.message);
      return res.status(400).send('Error: Verification error');
    }

    const { id } = evt.data;
    const eventType = evt.type;

    try {
      if (eventType === 'user.created' || eventType === 'user.updated') {
        const { email_addresses, first_name, last_name, image_url } = evt.data;
        const primaryEmail = email_addresses.find((email) => email.id === evt.data.primary_email_address_id) || email_addresses[0];

        const userData = {
          clerkUserId: id,
          email: primaryEmail.email_address,
          fullName: `${first_name || ''} ${last_name || ''}`.trim() || 'User',
          avatar: { url: image_url },
        };

        // Determine role based on INITIAL_SUPERADMIN_EMAILS environment variable
        const superadminEmails = (process.env.INITIAL_SUPERADMIN_EMAILS || '').split(',').map(e => e.trim());
        if (superadminEmails.includes(userData.email)) {
          userData.role = 'superadmin';
        }

        await User.findOneAndUpdate(
          { clerkUserId: id },
          { $set: userData },
          { upsert: true, new: true }
        );
      } else if (eventType === 'user.deleted') {
        await User.findOneAndDelete({ clerkUserId: id });
      }

      return res.status(200).json({ success: true, message: 'Webhook received' });
    } catch (error) {
      console.error('Error processing Clerk webhook:', error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
);

export default router;
