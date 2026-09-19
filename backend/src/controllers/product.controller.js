import ProductService from '../services/product.service.js';
import ProductRepository from '../repositories/product.repository.js';
import Product from '../models/Product.model.js';
import ApiResponse from '../utils/ApiResponse.js';
import { HTTP_STATUS } from '../constants/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';

class ProductController {
  // -----------------------------------------
  // CUSTOMER APIs
  // -----------------------------------------
  
  getProducts = asyncHandler(async (req, res) => {
    const { page, limit, sort, search, category, brand, minPrice, maxPrice, ...otherFilters } = req.query;
    
    const filters = { search, category, brand, minPrice, maxPrice, ...otherFilters };
    const options = { 
      page: parseInt(page, 10) || 1, 
      limit: parseInt(limit, 10) || 12, 
      sort: sort || '-createdAt',
      role: req.user?.role || 'user' // If no token, treated as user
    };

    const result = await ProductService.getAllProducts(filters, options);
    return res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, result, 'Products retrieved successfully'));
  });

  getProductById = asyncHandler(async (req, res) => {
    const product = await ProductService.getProductById(req.params.id);
    return res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, product, 'Product retrieved successfully'));
  });

  getProductBySlug = asyncHandler(async (req, res) => {
    const product = await ProductService.getProductBySlug(req.params.slug);
    return res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, product, 'Product retrieved successfully'));
  });

  getFeatured = asyncHandler(async (req, res) => {
    const products = await ProductRepository.findFeatured();
    return res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, products, 'Featured products retrieved'));
  });

  getTrending = asyncHandler(async (req, res) => {
    const products = await ProductRepository.findTrending();
    return res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, products, 'Trending products retrieved'));
  });

  getNewArrivals = asyncHandler(async (req, res) => {
    const products = await ProductRepository.findNewArrivals();
    return res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, products, 'New arrivals retrieved'));
  });

  // -----------------------------------------
  // ADMIN APIs
  // -----------------------------------------

  createProduct = asyncHandler(async (req, res) => {
    const allowedFields = [
      'name', 'slug', 'description', 'shortDescription', 'category', 'subCategory', 'brand',
      'pricing', 'inventory', 'variants', 'tags', 'images', 'isFeatured',
      'isTrending', 'isNewArrival', 'status', 'seo'
    ];
    const data = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        if ((field === 'subCategory' || field === 'brand' || field === 'category') && req.body[field] === '') {
          data[field] = null;
        } else {
          data[field] = req.body[field];
        }
      }
    }
    
    const product = await ProductService.createProduct(data, req.user._id);
    return res.status(HTTP_STATUS.CREATED).json(new ApiResponse(HTTP_STATUS.CREATED, product, 'Product created successfully'));
  });

  updateProduct = asyncHandler(async (req, res) => {
    const allowedFields = [
      'name', 'slug', 'description', 'shortDescription', 'category', 'subCategory', 'brand',
      'pricing', 'inventory', 'variants', 'tags', 'images', 'isFeatured',
      'isTrending', 'isNewArrival', 'status', 'seo'
    ];
    const data = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        if ((field === 'subCategory' || field === 'brand' || field === 'category') && req.body[field] === '') {
          data[field] = null;
        } else {
          data[field] = req.body[field];
        }
      }
    }

    const product = await ProductService.updateProduct(req.params.id, data, req.user._id);
    return res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, product, 'Product updated successfully'));
  });

  deleteProduct = asyncHandler(async (req, res) => {
    await ProductService.softDeleteProduct(req.params.id);
    return res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, null, 'Product deleted successfully'));
  });

  restoreProduct = asyncHandler(async (req, res) => {
    const product = await ProductService.restoreProduct(req.params.id);
    return res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, product, 'Product restored successfully'));
  });

  updateStatus = asyncHandler(async (req, res) => {
    const product = await ProductService.updateStatus(req.params.id, req.body.status);
    return res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, product, 'Product status updated'));
  });

  duplicateProduct = asyncHandler(async (req, res) => {
    const product = await ProductService.duplicateProduct(req.params.id, req.user._id);
    return res.status(HTTP_STATUS.CREATED).json(new ApiResponse(HTTP_STATUS.CREATED, product, 'Product duplicated successfully'));
  });

  getLowStockInventory = asyncHandler(async (req, res) => {
    // Assuming you have Product model imported or available via Repository
    const products = await Product.aggregate([
      {
        $addFields: {
          variants: {
            $cond: {
              if: { $gt: [{ $size: { $ifNull: ["$variants", []] } }, 0] },
              then: "$variants",
              else: [{ stock: "$inventory.totalStock", size: "N/A", color: "N/A", _id: "$_id" }]
            }
          }
        }
      },
      { $unwind: '$variants' },
      { $match: { 'variants.stock': { $lte: 10 } } },
      { $sort: { 'variants.stock': 1 } }
    ]);
    return res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, products, 'Low stock inventory retrieved'));
  });

  bulkDelete = asyncHandler(async (req, res) => {
    const { ids } = req.body;
    await Product.updateMany({ _id: { $in: ids } }, { status: 'deleted' });
    return res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, null, 'Products deleted successfully'));
  });

  bulkPublish = asyncHandler(async (req, res) => {
    const { ids } = req.body;
    await Product.updateMany({ _id: { $in: ids } }, { status: 'published' });
    return res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, null, 'Products published successfully'));
  });

  bulkUnpublish = asyncHandler(async (req, res) => {
    const { ids } = req.body;
    await Product.updateMany({ _id: { $in: ids } }, { status: 'draft' });
    return res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, null, 'Products unpublished successfully'));
  });

  bulkUpdateCategory = asyncHandler(async (req, res) => {
    const { ids, categoryId } = req.body;
    await Product.updateMany({ _id: { $in: ids } }, { category: categoryId });
    return res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, null, 'Products category updated successfully'));
  });
}

export default new ProductController();
