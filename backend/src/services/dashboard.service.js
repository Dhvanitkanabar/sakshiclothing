import Order from '../models/Order.model.js';
import User from '../models/User.model.js';
import Product from '../models/Product.model.js';

class DashboardService {
  async getStats() {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);

    const [
      totalOrders,
      pendingOrders,
      deliveredOrders,
      cancelledOrders,
      revenueToday,
      revenueTotal,
      totalCustomers,
      totalProducts,
      recentOrders,
      revenueWeekly
    ] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ orderStatus: 'pending' }),
      Order.countDocuments({ orderStatus: 'delivered' }),
      Order.countDocuments({ orderStatus: 'cancelled' }),
      Order.aggregate([
        { $match: { createdAt: { $gte: todayStart }, orderStatus: { $ne: 'cancelled' } } },
        { $group: { _id: null, total: { $sum: '$totals.grandTotal' } } }
      ]).then(r => r[0]?.total || 0),
      Order.aggregate([
        { $match: { orderStatus: { $ne: 'cancelled' } } },
        { $group: { _id: null, total: { $sum: '$totals.grandTotal' } } }
      ]).then(r => r[0]?.total || 0),
      User.countDocuments({ role: 'user' }),
      Product.countDocuments({ status: 'published' }),
      Order.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .populate('customer', 'fullName email')
        .lean(),
      Order.aggregate([
        { $match: { createdAt: { $gte: weekAgo }, orderStatus: { $ne: 'cancelled' } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            revenue: { $sum: '$totals.grandTotal' },
            orders: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ])
    ]);

    return {
      stats: {
        totalOrders,
        pendingOrders,
        deliveredOrders,
        cancelledOrders,
        revenueToday,
        revenueTotal,
        totalCustomers,
        totalProducts
      },
      recentOrders,
      revenueWeekly
    };
  }
}

export default new DashboardService();
