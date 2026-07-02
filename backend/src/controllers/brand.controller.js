import BrandService from '../services/brand.service.js';
import ApiResponse from '../utils/ApiResponse.js';
import { HTTP_STATUS } from '../constants/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';

class BrandController {
  createBrand = asyncHandler(async (req, res) => {
    const brand = await BrandService.createBrand(req.body);
    return res.status(HTTP_STATUS.CREATED).json(new ApiResponse(HTTP_STATUS.CREATED, 'Brand created', brand));
  });

  updateBrand = asyncHandler(async (req, res) => {
    const brand = await BrandService.updateBrand(req.params.id, req.body);
    return res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, 'Brand updated', brand));
  });

  getBrandById = asyncHandler(async (req, res) => {
    const brand = await BrandService.getBrandById(req.params.id);
    return res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, 'Brand retrieved', brand));
  });

  getAllBrands = asyncHandler(async (req, res) => {
    const role = req.user?.role || 'user';
    const brands = await BrandService.getAllBrands(role);
    return res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, 'Brands retrieved', brands));
  });

  getFeaturedBrands = asyncHandler(async (req, res) => {
    const brands = await BrandService.getFeaturedBrands();
    return res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, 'Featured brands retrieved', brands));
  });

  deleteBrand = asyncHandler(async (req, res) => {
    await BrandService.deleteBrand(req.params.id);
    return res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, 'Brand deleted'));
  });

  toggleFeatured = asyncHandler(async (req, res) => {
    const brand = await BrandService.toggleFeatured(req.params.id);
    return res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, 'Brand feature toggled', brand));
  });
}

export default new BrandController();
