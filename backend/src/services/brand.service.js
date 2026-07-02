import BrandRepository from '../repositories/brand.repository.js';
import ApiError from '../utils/ApiError.js';
import { HTTP_STATUS } from '../constants/index.js';

class BrandService {
  async createBrand(data) {
    if (!data.slug && data.name) {
      data.slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    }

    const existing = await BrandRepository.findBySlug(data.slug);
    if (existing) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Brand with this slug already exists');
    }

    return await BrandRepository.create(data);
  }

  async updateBrand(id, data) {
    const brand = await BrandRepository.findById(id);
    if (!brand) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Brand not found');
    }
    return await BrandRepository.updateById(id, data);
  }

  async getBrandById(id) {
    const brand = await BrandRepository.findById(id);
    if (!brand) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Brand not found');
    }
    return brand;
  }

  async getAllBrands(role = 'user') {
    const query = role === 'admin' ? {} : { isActive: true };
    return await BrandRepository.findAll(query);
  }

  async getFeaturedBrands() {
    return await BrandRepository.findFeatured();
  }

  async deleteBrand(id) {
    const brand = await BrandRepository.findById(id);
    if (!brand) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Brand not found');
    }
    return await BrandRepository.deleteById(id);
  }

  async toggleFeatured(id) {
    const brand = await BrandRepository.findById(id);
    if (!brand) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Brand not found');
    }
    return await BrandRepository.updateById(id, { isFeatured: !brand.isFeatured });
  }
}

export default new BrandService();
