import dashboardService from '../services/dashboard.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getDashboardStats = asyncHandler(async (req, res) => {
  const data = await dashboardService.getStats();
  return res.status(200).json(new ApiResponse(200, data, 'Dashboard stats fetched'));
});
