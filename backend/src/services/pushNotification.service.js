import User from '../models/User.model.js';
import logger from '../utils/logger.js';

class PushNotificationService {
  /**
   * Register or update a device push token for a user
   */
  async registerToken(userId, token, platform = 'android') {
    if (!token) return false;

    try {
      const user = await User.findById(userId);
      if (!user) return false;

      if (!user.deviceTokens) {
        user.deviceTokens = [];
      }

      // Check if token already registered
      const existingIdx = user.deviceTokens.findIndex(dt => dt.token === token);
      if (existingIdx >= 0) {
        user.deviceTokens[existingIdx].platform = platform;
        user.deviceTokens[existingIdx].updatedAt = new Date();
      } else {
        user.deviceTokens.push({
          token,
          platform,
          updatedAt: new Date()
        });
      }

      await user.save({ validateModifiedOnly: true });
      logger.info(`[PushNotification] Successfully registered ${platform} token for user ${userId}`);
      return true;
    } catch (err) {
      logger.error(`[PushNotification] Error registering token: ${err.message}`);
      return false;
    }
  }

  /**
   * Send a push notification to all devices registered to a specific user
   */
  async sendToUser(userId, payload) {
    if (!userId) return false;

    try {
      const user = await User.findById(userId).select('deviceTokens fullName email');
      if (!user || !user.deviceTokens || user.deviceTokens.length === 0) {
        logger.info(`[PushNotification] No registered device tokens for user ${userId} - skipping push.`);
        return false;
      }

      const { title, body, data = {} } = payload;
      logger.info(`[PushNotification] Dispatching push to ${user.deviceTokens.length} devices for ${user.email}: "${title}"`);

      // If Firebase service account is configured, call FCM HTTP v1 API
      if (process.env.FIREBASE_SERVER_KEY || process.env.FIREBASE_PROJECT_ID) {
        // Send via FCM API
        for (const dev of user.deviceTokens) {
          try {
            await this.sendFcmMessage(dev.token, { title, body, data });
          } catch (sendErr) {
            logger.warn(`[PushNotification] Delivery failed for token ${dev.token.slice(0, 10)}...: ${sendErr.message}`);
          }
        }
      } else {
        // Safe operational fallback when Firebase credentials are in setup phase
        logger.info(`[PushNotification] [Dev Mode] Simulated push notification delivered: ${JSON.stringify({ title, body, data, tokensCount: user.deviceTokens.length })}`);
      }

      return true;
    } catch (err) {
      logger.error(`[PushNotification] sendToUser error: ${err.message}`);
      return false;
    }
  }

  /**
   * Low-level FCM HTTP v1 / legacy dispatcher
   */
  async sendFcmMessage(token, { title, body, data }) {
    // If Firebase server key is present in env, dispatch standard FCM request
    if (process.env.FIREBASE_SERVER_KEY) {
      const response = await fetch('https://fcm.googleapis.com/fcm/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `key=${process.env.FIREBASE_SERVER_KEY}`
        },
        body: JSON.stringify({
          to: token,
          notification: {
            title,
            body,
            sound: 'default'
          },
          data: {
            ...data,
            click_action: 'FLUTTER_NOTIFICATION_CLICK'
          }
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`FCM error status ${response.status}: ${errorText}`);
      }
      return true;
    }
    return false;
  }
}

const pushNotificationService = new PushNotificationService();
export default pushNotificationService;
