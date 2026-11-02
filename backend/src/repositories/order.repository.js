import Order from '../models/Order.model.js';

class OrderRepository {
  async create(data) {
    const order = new Order(data);
    return await order.save();
  }

  async findById(id, userId = null) {
    const query = { _id: id };
    if (userId) query.customer = userId;
    return await Order.findOne(query).populate('products.product', 'name thumbnail images');
  }

  async findByUser(userId) {
    return await Order.find({
      customer: userId,
      orderStatus: { $ne: 'payment_pending' },
      $or: [
        { paymentStatus: 'completed' },
        { 'payment.method': 'cod' }
      ]
    })
      .sort({ createdAt: -1 })
      .populate('products.product', 'name thumbnail images');
  }

  async findAll(filter = {}, sort = { createdAt: -1 }, skip = 0, limit = 10) {
    // Exclude unpaid online payment drafts and pending gateway intents
    const placedOrderFilter = {
      orderStatus: { $ne: 'payment_pending' },
      $or: [
        { paymentStatus: 'completed' },
        { 'payment.method': 'cod' }
      ],
      ...filter
    };

    const total = await Order.countDocuments(placedOrderFilter);
    const orders = await Order.find(placedOrderFilter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate('customer', 'fullName email phone')
      .populate({
        path: 'products.product',
        select: 'name thumbnail images category basePrice',
        populate: { path: 'category', select: 'name slug' }
      });
    return { orders, total };
  }

  async updateStatus(id, orderStatus, timelineEvent) {
    return await Order.findByIdAndUpdate(
      id,
      {
        $set: { orderStatus },
        $push: { timeline: timelineEvent }
      },
      { new: true }
    );
  }

  async generateOrderNumber() {
    return await Order.generateOrderNumber();
  }
  async updateTracking(id, tracking) {
    return await Order.findByIdAndUpdate(
      id,
      { $set: { tracking } },
      { new: true }
    );
  }
}

export default new OrderRepository();
