import Banner from '../models/Banner.model.js';
import StoreSettings from '../models/StoreSettings.model.js';
import Product from '../models/Product.model.js';
import Category from '../models/Category.model.js';
import Review from '../models/Review.model.js';
import ApiResponse from '../utils/ApiResponse.js';
import { HTTP_STATUS, PRODUCT_STATUS } from '../constants/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';

class CmsController {
  // --- Homepage Aggregation for Customer Frontend ---
  getHomepageData = asyncHandler(async (req, res) => {
    // 1. Fetch Banners
    const heroBanners = await Banner.find({ homepageSection: 'hero', isActive: true }).sort('displayOrder');
    const spotlightBanners = await Banner.find({ homepageSection: 'spotlight', isActive: true }).sort('displayOrder');
    const lookbookBanners = await Banner.find({ homepageSection: 'lookbook', isActive: true }).sort('displayOrder');
    
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

    // 7. Fetch Jewellery Spotlight Products
    const jewelleryCategories = await Category.find({ name: { $regex: /jewel/i } }).select('_id');
    const jewelleryCatIds = jewelleryCategories.map(c => c._id);
    const jewelleryProducts = await Product.find({
      $or: [
        { category: { $in: jewelleryCatIds } },
        { tags: { $in: ['jewellery', 'jewelry', 'choker', 'necklace', 'earrings', 'bangles', 'kundan', 'polki'] } }
      ],
      status: PRODUCT_STATUS.PUBLISHED
    }).limit(6);

    // 8. Fetch Real Approved Customer Reviews
    const reviews = await Review.find({ isApproved: true, rating: { $gte: 4 } })
      .populate('customer', 'fullName')
      .populate('product', 'name images thumbnail')
      .sort('-createdAt')
      .limit(6);

    return res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, {
      heroBanners,
      spotlightBanners,
      lookbookBanners,
      announcements: storeSettings.announcementBar || [],
      footer: storeSettings.socialLinks || {},
      featuredProducts,
      trendingProducts,
      newArrivals,
      jewelleryProducts,
      reviews,
      categories: topCategories
    }, 'Homepage data retrieved'));
  });

  // --- Banner Management ---
  createBanner = asyncHandler(async (req, res) => {
    const banner = await Banner.create(req.body);
    return res.status(HTTP_STATUS.CREATED).json(new ApiResponse(HTTP_STATUS.CREATED, banner, 'Banner created'));
  });

  updateBanner = asyncHandler(async (req, res) => {
    const banner = await Banner.findByIdAndUpdate(req.params.id, req.body, { new: true });
    return res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, banner, 'Banner updated'));
  });

  deleteBanner = asyncHandler(async (req, res) => {
    await Banner.findByIdAndDelete(req.params.id);
    return res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, null, 'Banner deleted'));
  });

  getBanners = asyncHandler(async (req, res) => {
    const banners = await Banner.find().sort('displayOrder');
    return res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, banners, 'Banners retrieved'));
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
    return res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, settings.announcementBar, 'Announcements updated'));
  });

  getAnnouncements = asyncHandler(async (req, res) => {
    const settings = await StoreSettings.findOne();
    return res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, settings?.announcementBar || [], 'Announcements retrieved'));
  });

  getAppVersion = asyncHandler(async (req, res) => {
    const minVersion = process.env.APP_MIN_VERSION || '1.0.0';
    const latestVersion = process.env.APP_LATEST_VERSION || '1.0.0';
    const forceUpdate = process.env.APP_FORCE_UPDATE === 'true';

    return res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, {
      minVersion,
      latestVersion,
      forceUpdate,
      title: 'Sakshi Couture App Update Available',
      message: 'A newer release of Sakshi Clothing is ready with heightened performance, smoother gestures, and fresh collections.',
      releaseNotes: 'Refined native animations, enhanced secure checkout flow, and catalog optimizations.',
      playStoreUrl: 'https://play.google.com/store/apps/details?id=store.sakshiclothing.customer',
      appStoreUrl: 'https://apps.apple.com/app/sakshi-clothing/id1234567890'
    }, 'App version metadata retrieved'));
  });
}

export default new CmsController();
