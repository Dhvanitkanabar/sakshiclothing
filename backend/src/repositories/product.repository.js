import Product from '../models/Product.model.js';
import { PRODUCT_STATUS } from '../constants/index.js';

class ProductRepository {
  async create(data) {
    return await Product.create(data);
  }

  async findById(id) {
    return await Product.findById(id).populate('category', 'name slug').populate('brand', 'name');
  }

  async findBySlug(slug) {
    return await Product.findOne({ slug, status: { $ne: PRODUCT_STATUS.DELETED } })
      .populate('category', 'name slug')
      .populate('brand', 'name');
  }

  async updateById(id, data) {
    return await Product.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  }

  async softDelete(id) {
    return await Product.findByIdAndUpdate(id, { status: PRODUCT_STATUS.DELETED }, { new: true });
  }

  async restore(id) {
    return await Product.findByIdAndUpdate(id, { status: PRODUCT_STATUS.DRAFT }, { new: true });
  }

  async findAll(query, options = {}) {
    const { page = 1, limit = 10, sort = '-createdAt' } = options;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      Product.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('category', 'name')
        .populate('brand', 'name'),
      Product.countDocuments(query)
    ]);

    return {
      data,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit)
    };
  }

  async findFeatured() {
    return await Product.find({ isFeatured: true, status: PRODUCT_STATUS.PUBLISHED }).limit(10);
  }

  async findTrending() {
    return await Product.find({ isTrending: true, status: PRODUCT_STATUS.PUBLISHED }).limit(10);
  }

  async findNewArrivals() {
    return await Product.find({ isNewArrival: true, status: PRODUCT_STATUS.PUBLISHED }).sort('-createdAt').limit(10);
  }
}

export default new ProductRepository();
