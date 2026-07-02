import ApiResponse from '../utils/ApiResponse.js';

/**
 * Controller to handle Server Health Check requests.
 * @route GET /api/health
 * @desc Checks if backend server is online and running
 * @access Public
 */
export const checkHealth = (req, res, next) => {
  try {
    // Return standard success response matching requested format
    res.status(200).json({
      success: true,
      message: 'Server Running Successfully'
    });
  } catch (error) {
    next(error);
  }
};
