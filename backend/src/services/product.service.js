import ProductRepository from '../repositories/product.repository.js';
import CategoryRepository from '../repositories/category.repository.js';
import ApiError from '../utils/ApiError.js';
import { HTTP_STATUS, PRODUCT_STATUS } from '../constants/index.js';

class ProductService {
  async createProduct(data, userId) {
    // Basic slug generation if not provided
    if (!data.slug && data.name) {
      data.slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    }

    // Ensure slug is unique
    const existing = await ProductRepository.findBySlug(data.slug);
    if (existing) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Product with this slug already exists');
    }

    if (data.subCategory) {
      const sub = await CategoryRepository.findById(data.subCategory);
      if (!sub) {
        throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Subcategory not found');
      }
      if (sub.parentCategory?._id?.toString() !== data.category && sub.parentCategory?.toString() !== data.category) {
        throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Subcategory does not belong to the selected Category');
      }
    }

    data.createdBy = userId;
    return await ProductRepository.create(data);
  }

  async updateProduct(id, data, userId) {
    const product = await ProductRepository.findById(id);
    if (!product) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Product not found');
    }

    if (data.subCategory) {
      const sub = await CategoryRepository.findById(data.subCategory);
      if (!sub) {
        throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Subcategory not found');
      }
      const actualCategory = data.category || product.category?.toString();
      if (sub.parentCategory?._id?.toString() !== actualCategory && sub.parentCategory?.toString() !== actualCategory) {
        throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Subcategory does not belong to the selected Category');
      }
    }

    data.updatedBy = userId;
    return await ProductRepository.updateById(id, data);
  }

  async getProductById(id) {
    const product = await ProductRepository.findById(id);
    if (!product || product.status === PRODUCT_STATUS.DELETED) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Product not found');
    }
    return product;
  }

  async getProductBySlug(slug) {
    const product = await ProductRepository.findBySlug(slug);
    if (!product) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Product not found');
    }
    return product;
  }

  async softDeleteProduct(id) {
    const product = await ProductRepository.findById(id);
    if (!product) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Product not found');
    }
    return await ProductRepository.softDelete(id);
  }

  async restoreProduct(id) {
    return await ProductRepository.restore(id);
  }

  async updateStatus(id, status) {
    if (!Object.values(PRODUCT_STATUS).includes(status)) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Invalid status');
    }
    return await ProductRepository.updateById(id, { status });
  }

  async duplicateProduct(id, userId) {
    const product = await ProductRepository.findById(id);
    if (!product) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Product not found');
    }

    const productData = product.toObject();
    delete productData._id;
    delete productData.createdAt;
    delete productData.updatedAt;
    
    productData.name = `${productData.name} (Copy)`;
    productData.slug = `${productData.slug}-copy-${Date.now()}`;
    productData.status = PRODUCT_STATUS.DRAFT;
    productData.createdBy = userId;
    productData.updatedBy = userId;

    return await ProductRepository.create(productData);
  }

  async getAllProducts(filters, options) {
    const query = { status: { $ne: PRODUCT_STATUS.DELETED } };

    // Resolve category filter: can be an ObjectId, a slug, or a name
    if (filters.category) {
      const mongoose = (await import('mongoose')).default;
      const Category = (await import('../models/Category.model.js')).default;
      let categoryIds = [];

      if (mongoose.Types.ObjectId.isValid(filters.category)) {
        categoryIds.push(new mongoose.Types.ObjectId(filters.category));
        const subs = await Category.find({ parentCategory: filters.category }).select('_id');
        subs.forEach(s => categoryIds.push(s._id));
      } else {
        const matchedCats = await Category.find({
          $or: [
            { slug: filters.category.toLowerCase() },
            { name: { $regex: new RegExp(`^${filters.category}$`, 'i') } }
          ]
        }).select('_id');

        for (const cat of matchedCats) {
          categoryIds.push(cat._id);
          const subs = await Category.find({ parentCategory: cat._id }).select('_id');
          subs.forEach(s => categoryIds.push(s._id));
        }
      }

      if (categoryIds.length > 0) {
        query.category = { $in: categoryIds };
      } else {
        query.category = null;
      }
    }

    if (filters.brand) query.brand = filters.brand;
    if (filters.status) query.status = filters.status;
    if (filters.isFeatured) query.isFeatured = filters.isFeatured === 'true';
    if (filters.isTrending) query.isTrending = filters.isTrending === 'true';
    if (filters.isNewArrival) query.isNewArrival = filters.isNewArrival === 'true';
    
    if (filters.search) {
      query.$text = { $search: filters.search };
    }

    if (filters.minPrice || filters.maxPrice) {
      query['pricing.basePrice'] = {};
      if (filters.minPrice) query['pricing.basePrice'].$gte = Number(filters.minPrice);
      if (filters.maxPrice) query['pricing.basePrice'].$lte = Number(filters.maxPrice);
    }

    // Only return PUBLISHED for non-admins
    if (options.role !== 'admin' && options.role !== 'superadmin') {
      query.status = PRODUCT_STATUS.PUBLISHED;
    }

    return await ProductRepository.findAll(query, options);
  }
}

export default new ProductService();
