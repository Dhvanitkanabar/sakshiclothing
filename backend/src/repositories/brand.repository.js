import Brand from '../models/Brand.model.js';

class BrandRepository {
  async create(data) {
    return await Brand.create(data);
  }

  async findById(id) {
    return await Brand.findById(id);
  }

  async findBySlug(slug) {
    return await Brand.findOne({ slug });
  }

  async updateById(id, data) {
    return await Brand.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  }

  async deleteById(id) {
    return await Brand.findByIdAndDelete(id);
  }

  async findAll(query = {}, options = {}) {
    return await Brand.find(query).sort('name');
  }

  async findFeatured() {
    return await Brand.find({ isActive: true, isFeatured: true }).sort('name');
  }
}

export default new BrandRepository();
