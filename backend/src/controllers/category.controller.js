import CategoryService from '../services/category.service.js';
import ApiResponse from '../utils/ApiResponse.js';
import { HTTP_STATUS } from '../constants/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';

class CategoryController {
  createCategory = asyncHandler(async (req, res) => {
    const category = await CategoryService.createCategory(req.body);
    return res.status(HTTP_STATUS.CREATED).json(new ApiResponse(HTTP_STATUS.CREATED, 'Category created', category));
  });

  updateCategory = asyncHandler(async (req, res) => {
    const category = await CategoryService.updateCategory(req.params.id, req.body);
    return res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, 'Category updated', category));
  });

  getCategoryById = asyncHandler(async (req, res) => {
    const category = await CategoryService.getCategoryById(req.params.id);
    return res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, 'Category retrieved', category));
  });

  getAllCategories = asyncHandler(async (req, res) => {
    const role = req.user?.role || 'user';
    const categories = await CategoryService.getAllCategories(role);
    return res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, 'Categories retrieved', categories));
  });

  getCategoryTree = asyncHandler(async (req, res) => {
    const tree = await CategoryService.getCategoryTree();
    return res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, 'Category tree retrieved', tree));
  });

  deleteCategory = asyncHandler(async (req, res) => {
    await CategoryService.deleteCategory(req.params.id);
    return res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, 'Category permanently deleted'));
  });

  softDeleteCategory = asyncHandler(async (req, res) => {
    await CategoryService.softDeleteCategory(req.params.id);
    return res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, 'Category disabled'));
  });

  restoreCategory = asyncHandler(async (req, res) => {
    await CategoryService.restoreCategory(req.params.id);
    return res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, 'Category restored'));
  });
}

export default new CategoryController();
