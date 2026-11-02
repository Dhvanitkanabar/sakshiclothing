import CategoryService from '../services/category.service.js';
import ApiResponse from '../utils/ApiResponse.js';
import { HTTP_STATUS } from '../constants/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';

class CategoryController {
  createCategory = asyncHandler(async (req, res) => {
    const allowedFields = ['name', 'slug', 'description', 'parent', 'parentCategory', 'image', 'isActive', 'displayOrder'];
    const data = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        if (field === 'parent' || field === 'parentCategory') {
          const val = req.body[field];
          data.parentCategory = (val && typeof val === 'string' && val.trim() !== '' && val !== 'null') ? val.trim() : null;
        } else {
          data[field] = req.body[field];
        }
      }
    }
    const category = await CategoryService.createCategory(data);
    return res.status(HTTP_STATUS.CREATED).json(new ApiResponse(HTTP_STATUS.CREATED, category, 'Category created successfully'));
  });

  updateCategory = asyncHandler(async (req, res) => {
    const allowedFields = ['name', 'slug', 'description', 'parent', 'parentCategory', 'image', 'isActive', 'displayOrder'];
    const data = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        if (field === 'parent' || field === 'parentCategory') {
          const val = req.body[field];
          data.parentCategory = (val && typeof val === 'string' && val.trim() !== '' && val !== 'null') ? val.trim() : null;
        } else {
          data[field] = req.body[field];
        }
      }
    }
    const category = await CategoryService.updateCategory(req.params.id, data);
    return res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, category, 'Category updated successfully'));
  });

  getCategoryById = asyncHandler(async (req, res) => {
    const category = await CategoryService.getCategoryById(req.params.id);
    return res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, category, 'Category retrieved'));
  });

  getAllCategories = asyncHandler(async (req, res) => {
    const role = req.user?.role || 'user';
    const categories = await CategoryService.getAllCategories(role);
    return res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, categories, 'Categories retrieved'));
  });

  getCategoryTree = asyncHandler(async (req, res) => {
    const tree = await CategoryService.getCategoryTree();
    return res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, tree, 'Category tree retrieved'));
  });

  deleteCategory = asyncHandler(async (req, res) => {
    await CategoryService.deleteCategory(req.params.id);
    return res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, null, 'Category permanently deleted'));
  });

  softDeleteCategory = asyncHandler(async (req, res) => {
    await CategoryService.softDeleteCategory(req.params.id);
    return res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, null, 'Category disabled'));
  });

  restoreCategory = asyncHandler(async (req, res) => {
    await CategoryService.restoreCategory(req.params.id);
    return res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, null, 'Category restored'));
  });

  seedDefaults = asyncHandler(async (req, res) => {
    const seeded = await CategoryService.seedDefaultCategories();
    return res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, seeded, 'Standard categories and subcategories created successfully'));
  });
}

export default new CategoryController();

