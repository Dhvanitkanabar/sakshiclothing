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
    return await Order.find({ customer: userId })
      .sort({ createdAt: -1 })
      .populate('products.product', 'name thumbnail images');
  }

  async findAll(filter = {}, sort = { createdAt: -1 }) {
    return await Order.find(filter)
      .sort(sort)
      .populate('customer', 'fullName email')
      .populate('products.product', 'name thumbnail images');
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
