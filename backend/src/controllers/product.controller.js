import ProductService from '../services/product.service.js';
import ProductRepository from '../repositories/product.repository.js';
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
    return res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, 'Products retrieved successfully', result));
  });

  getProductById = asyncHandler(async (req, res) => {
    const product = await ProductService.getProductById(req.params.id);
    return res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, 'Product retrieved successfully', product));
  });

  getProductBySlug = asyncHandler(async (req, res) => {
    const product = await ProductService.getProductBySlug(req.params.slug);
    return res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, 'Product retrieved successfully', product));
  });

  getFeatured = asyncHandler(async (req, res) => {
    const products = await ProductRepository.findFeatured();
    return res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, 'Featured products retrieved', products));
  });

  getTrending = asyncHandler(async (req, res) => {
    const products = await ProductRepository.findTrending();
    return res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, 'Trending products retrieved', products));
  });

  getNewArrivals = asyncHandler(async (req, res) => {
    const products = await ProductRepository.findNewArrivals();
    return res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, 'New arrivals retrieved', products));
  });

  // -----------------------------------------
  // ADMIN APIs
  // -----------------------------------------

  createProduct = asyncHandler(async (req, res) => {
    const product = await ProductService.createProduct(req.body, req.user._id);
    return res.status(HTTP_STATUS.CREATED).json(new ApiResponse(HTTP_STATUS.CREATED, 'Product created successfully', product));
  });

  updateProduct = asyncHandler(async (req, res) => {
    const product = await ProductService.updateProduct(req.params.id, req.body, req.user._id);
    return res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, 'Product updated successfully', product));
  });

  deleteProduct = asyncHandler(async (req, res) => {
    await ProductService.softDeleteProduct(req.params.id);
    return res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, 'Product deleted successfully'));
  });

  restoreProduct = asyncHandler(async (req, res) => {
    const product = await ProductService.restoreProduct(req.params.id);
    return res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, 'Product restored successfully', product));
  });

  updateStatus = asyncHandler(async (req, res) => {
    const product = await ProductService.updateStatus(req.params.id, req.body.status);
    return res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, 'Product status updated', product));
  });

  duplicateProduct = asyncHandler(async (req, res) => {
    const product = await ProductService.duplicateProduct(req.params.id, req.user._id);
    return res.status(HTTP_STATUS.CREATED).json(new ApiResponse(HTTP_STATUS.CREATED, 'Product duplicated successfully', product));
  });
}

export default new ProductController();
