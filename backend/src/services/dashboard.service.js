import Order from '../models/Order.model.js';
import User from '../models/User.model.js';
import Product from '../models/Product.model.js';
import Category from '../models/Category.model.js';
import Brand from '../models/Brand.model.js';

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
      revenueWeekly,
      lowStockProducts,
      outOfStockProducts,
      totalCategories,
      totalBrands
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
      Product.countDocuments(),
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
      ]),
      Product.aggregate([
        { $unwind: '$variants' },
        { $match: { 'variants.stock': { $gt: 0, $lte: 10 } } },
        { $group: { _id: '$_id' } },
        { $count: 'count' }
      ]).then(r => r[0]?.count || 0),
      Product.aggregate([
        { $unwind: '$variants' },
        { $match: { 'variants.stock': 0 } },
        { $group: { _id: '$_id' } },
        { $count: 'count' }
      ]).then(r => r[0]?.count || 0),
      Category.countDocuments(),
      Brand.countDocuments()
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
        totalProducts,
        lowStockProducts,
        outOfStockProducts,
        totalCategories,
        totalBrands
      },
      recentOrders,
      revenueWeekly
    };
  }
}

export default new DashboardService();
