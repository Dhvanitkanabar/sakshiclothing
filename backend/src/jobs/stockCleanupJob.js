/**
 * Sakshi Clothing — Abandoned Checkout Stock Cleanup Job
 * Releases reserved inventory for orders in 'payment_pending' state older than 30 minutes
 * Prevents phantom stock lockups when customers close their payment gateway modal or drop off.
 */

import Order from '../models/Order.model.js';
import Product from '../models/Product.model.js';
import { ORDER_STATUS, PAYMENT_STATUS } from '../constants/index.js';
import logger from '../utils/logger.js';

/**
 * Scans for abandoned orders and reverts reserved product inventory
 * @param {number} expiryMinutes - Threshold in minutes before an unpaid order is considered abandoned (default: 30)
 * @returns {Promise<{ releasedOrders: number, restoredItems: number }>}
 */
export const cleanupAbandonedStock = async (expiryMinutes = 30) => {
  const cutoffTime = new Date(Date.now() - expiryMinutes * 60 * 1000);

  const abandonedOrders = await Order.find({
    orderStatus: { $in: ['payment_pending', ORDER_STATUS.PAYMENT_PENDING, 'pending_payment'] },
    paymentStatus: { $in: [PAYMENT_STATUS.PENDING, 'pending'] },
    createdAt: { $lt: cutoffTime }
  });

  if (!abandonedOrders || abandonedOrders.length === 0) {
    return { releasedOrders: 0, restoredItems: 0 };
  }

  let totalRestoredItems = 0;

  for (const order of abandonedOrders) {
    try {
      if (order.products && order.products.length > 0) {
        const bulkUpdates = order.products.map((item) => ({
          updateOne: {
            filter: { _id: item.product, 'variants._id': item.variantId },
            update: {
              $inc: {
                'variants.$.stock': item.quantity,
                'inventory.totalStock': item.quantity
              }
            }
          }
        }));

        if (bulkUpdates.length > 0) {
          await Product.bulkWrite(bulkUpdates);
          totalRestoredItems += order.products.reduce((acc, it) => acc + (it.quantity || 1), 0);
        }
      }

      order.orderStatus = ORDER_STATUS.CANCELLED || 'cancelled';
      order.paymentStatus = PAYMENT_STATUS.FAILED || 'failed';
      order.rejectionReason = `Automated stock release: Payment expired after ${expiryMinutes} minutes of inactivity.`;
      
      if (!order.timeline) order.timeline = [];
      order.timeline.push({
        status: 'cancelled',
        note: `Order auto-cancelled and inventory released after ${expiryMinutes}m checkout timeout.`,
        date: new Date()
      });

      await order.save();
      logger.info(`[Stock Cleanup] Released stock for abandoned order ${order.orderNumber} (ID: ${order._id})`);
    } catch (orderErr) {
      logger.error(`[Stock Cleanup Error] Failed to process order ${order._id}: ${orderErr.message}`);
    }
  }

  logger.info(`[Stock Cleanup Complete] Processed ${abandonedOrders.length} abandoned orders, restored ${totalRestoredItems} inventory units.`);
  return { releasedOrders: abandonedOrders.length, restoredItems: totalRestoredItems };
};

/**
 * Starts recurring background cron interval for stock cleanup
 * @param {number} intervalMs - Execution interval in milliseconds (default: 15 minutes)
 */
export const startStockCleanupCron = (intervalMs = 15 * 60 * 1000) => {
  logger.info(`[Stock Cleanup Daemon] Initialized recurring stock cleanup interval (${intervalMs / 1000 / 60} minutes)`);
  
  // Run on startup
  cleanupAbandonedStock(30).catch((err) => {
    logger.warn(`[Stock Cleanup Daemon Initial Run]: ${err.message}`);
  });

  return setInterval(() => {
    cleanupAbandonedStock(30).catch((err) => {
      logger.error(`[Stock Cleanup Daemon Error]: ${err.message}`);
    });
  }, intervalMs);
};

export default { cleanupAbandonedStock, startStockCleanupCron };
