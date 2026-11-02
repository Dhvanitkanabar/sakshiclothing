import Order from '../models/Order.model.js';
import User from '../models/User.model.js';
import Product from '../models/Product.model.js';
import Category from '../models/Category.model.js';


class DashboardService {
  async getStats() {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);

    const validOrderBase = {
      orderStatus: { $ne: 'payment_pending' },
      $or: [
        { paymentStatus: 'completed' },
        { 'payment.method': 'cod' }
      ]
    };

    const [
      totalOrders,
      pendingOrders,
      processingOrders,
      shippedOrders,
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
      totalCategories
    ] = await Promise.all([
      Order.countDocuments(validOrderBase),
      Order.countDocuments({ ...validOrderBase, orderStatus: { $in: ['pending', 'pending_approval'] } }),
      Order.countDocuments({ ...validOrderBase, orderStatus: { $in: ['processing', 'confirmed'] } }),
      Order.countDocuments({ ...validOrderBase, orderStatus: 'shipped' }),
      Order.countDocuments({ ...validOrderBase, orderStatus: 'delivered' }),
      Order.countDocuments({ orderStatus: { $in: ['cancelled', 'rejected'] } }),
      Order.aggregate([
        { $match: { ...validOrderBase, createdAt: { $gte: todayStart }, orderStatus: { $nin: ['cancelled', 'rejected'] } } },
        { $group: { _id: null, total: { $sum: '$totals.grandTotal' } } }
      ]).then(r => r[0]?.total || 0),
      Order.aggregate([
        { $match: { ...validOrderBase, orderStatus: { $nin: ['cancelled', 'rejected'] } } },
        { $group: { _id: null, total: { $sum: '$totals.grandTotal' } } }
      ]).then(r => r[0]?.total || 0),
      User.countDocuments({ role: 'user' }),
      Product.countDocuments(),
      Order.find(validOrderBase)
        .sort({ createdAt: -1 })
        .limit(10)
        .populate('customer', 'fullName email')
        .lean(),
      Order.aggregate([
        { $match: { ...validOrderBase, createdAt: { $gte: weekAgo }, orderStatus: { $nin: ['cancelled', 'rejected'] } } },
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
      Category.countDocuments()
    ]);

    const averageOrderValue = totalOrders > 0 ? Math.round(revenueTotal / totalOrders) : 0;

    return {
      stats: {
        totalOrders,
        pendingOrders,
        processingOrders,
        shippedOrders,
        deliveredOrders,
        cancelledOrders,
        revenueToday,
        revenueTotal,
        averageOrderValue,
        totalCustomers,
        totalProducts,
        lowStockProducts,
        outOfStockProducts,
        totalCategories
      },
      recentOrders,
      revenueWeekly
    };
  }
}

export default new DashboardService();
