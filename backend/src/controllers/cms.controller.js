import Banner from '../models/Banner.model.js';
import StoreSettings from '../models/StoreSettings.model.js';
import Product from '../models/Product.model.js';
import Category from '../models/Category.model.js';
import ApiResponse from '../utils/ApiResponse.js';
import { HTTP_STATUS, PRODUCT_STATUS } from '../constants/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';

class CmsController {
  // --- Homepage Aggregation for Customer Frontend ---
  getHomepageData = asyncHandler(async (req, res) => {
    // 1. Fetch Banners
    const heroBanners = await Banner.find({ homepageSection: 'hero', isActive: true }).sort('displayOrder');
    
    // 2. Fetch Store Settings (Announcements, Footer, etc)
    const storeSettings = await StoreSettings.findOne() || {};

    // 3. Fetch Featured Products
    const featuredProducts = await Product.find({ isFeatured: true, status: PRODUCT_STATUS.PUBLISHED }).limit(8);

    // 4. Fetch Trending Products
    const trendingProducts = await Product.find({ isTrending: true, status: PRODUCT_STATUS.PUBLISHED }).limit(8);

    // 5. Fetch New Arrivals
    const newArrivals = await Product.find({ isNewArrival: true, status: PRODUCT_STATUS.PUBLISHED }).sort('-createdAt').limit(6);

    // 6. Fetch Categories (Top level)
    const topCategories = await Category.find({ parentCategory: null, isActive: true }).sort('displayOrder');

    return res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, 'Homepage data retrieved', {
      heroBanners,
      announcements: storeSettings.announcementBar || [],
      footer: storeSettings.socialLinks || {},
      featuredProducts,
      trendingProducts,
      newArrivals,
      categories: topCategories
    }));
  });

  // --- Banner Management ---
  createBanner = asyncHandler(async (req, res) => {
    const banner = await Banner.create(req.body);
    return res.status(HTTP_STATUS.CREATED).json(new ApiResponse(HTTP_STATUS.CREATED, 'Banner created', banner));
  });

  updateBanner = asyncHandler(async (req, res) => {
    const banner = await Banner.findByIdAndUpdate(req.params.id, req.body, { new: true });
    return res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, 'Banner updated', banner));
  });

  deleteBanner = asyncHandler(async (req, res) => {
    await Banner.findByIdAndDelete(req.params.id);
    return res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, 'Banner deleted'));
  });

  getBanners = asyncHandler(async (req, res) => {
    const banners = await Banner.find().sort('displayOrder');
    return res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, 'Banners retrieved', banners));
  });

  // --- Announcement Bar Management ---
  updateAnnouncements = asyncHandler(async (req, res) => {
    const { announcementBar } = req.body;
    let settings = await StoreSettings.findOne();
    if (!settings) {
      settings = await StoreSettings.create({ email: 'admin@sakshiclothing.com', phone: '0000000000' }); // defaults
    }
    settings.announcementBar = announcementBar;
    await settings.save();
    return res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, 'Announcements updated', settings.announcementBar));
  });

  getAnnouncements = asyncHandler(async (req, res) => {
    const settings = await StoreSettings.findOne();
    return res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, 'Announcements retrieved', settings?.announcementBar || []));
  });
}

export default new CmsController();
