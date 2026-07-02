import CategoryRepository from '../repositories/category.repository.js';
import ApiError from '../utils/ApiError.js';
import { HTTP_STATUS } from '../constants/index.js';

class CategoryService {
  async createCategory(data) {
    if (!data.slug && data.name) {
      data.slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    }

    const existing = await CategoryRepository.findBySlug(data.slug);
    if (existing) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Category with this slug already exists');
    }

    return await CategoryRepository.create(data);
  }

  async updateCategory(id, data) {
    const category = await CategoryRepository.findById(id);
    if (!category) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Category not found');
    }

    return await CategoryRepository.updateById(id, data);
  }

  async getCategoryById(id) {
    const category = await CategoryRepository.findById(id);
    if (!category) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Category not found');
    }
    return category;
  }

  async getAllCategories(role = 'user') {
    const query = role === 'admin' ? {} : { isActive: true };
    return await CategoryRepository.findAll(query);
  }

  async getCategoryTree() {
    return await CategoryRepository.findTree();
  }

  async deleteCategory(id) {
    try {
      return await CategoryRepository.deleteById(id);
    } catch (err) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, err.message);
    }
  }

  async softDeleteCategory(id) {
    return await CategoryRepository.softDelete(id);
  }

  async restoreCategory(id) {
    return await CategoryRepository.restore(id);
  }
}

export default new CategoryService();
