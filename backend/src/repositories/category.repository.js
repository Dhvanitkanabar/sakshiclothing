import Category from '../models/Category.model.js';

class CategoryRepository {
  async create(data) {
    return await Category.create(data);
  }

  async findById(id) {
    return await Category.findById(id).populate('parentCategory', 'name slug');
  }

  async findBySlug(slug) {
    return await Category.findOne({ slug }).populate('parentCategory', 'name slug');
  }

  async updateById(id, data) {
    return await Category.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  }

  async deleteById(id) {
    // Check if it has children
    const hasChildren = await Category.exists({ parentCategory: id });
    if (hasChildren) {
      throw new Error('Cannot delete category with subcategories. Reassign or delete them first.');
    }
    return await Category.findByIdAndDelete(id);
  }

  async softDelete(id) {
    return await Category.findByIdAndUpdate(id, { isActive: false }, { new: true });
  }

  async restore(id) {
    return await Category.findByIdAndUpdate(id, { isActive: true }, { new: true });
  }

  async findAll(query = {}, options = {}) {
    const { sort = 'displayOrder' } = options;
    return await Category.find(query)
      .sort(sort)
      .populate('parentCategory', 'name slug');
  }

  async findTree() {
    // Simple tree approach: return all active, UI handles nesting, or do it here
    const categories = await Category.find({ isActive: true }).sort('displayOrder').lean();
    
    const categoryMap = {};
    const tree = [];

    categories.forEach(cat => {
      categoryMap[cat._id.toString()] = { ...cat, children: [] };
    });

    categories.forEach(cat => {
      if (cat.parentCategory) {
        const parent = categoryMap[cat.parentCategory.toString()];
        if (parent) {
          parent.children.push(categoryMap[cat._id.toString()]);
        }
      } else {
        tree.push(categoryMap[cat._id.toString()]);
      }
    });

    return tree;
  }
}

export default new CategoryRepository();
