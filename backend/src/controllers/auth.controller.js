import AuthService from '../services/auth.service.js';
import ApiResponse from '../utils/ApiResponse.js';
import { HTTP_STATUS, API_MESSAGES } from '../constants/index.js';
import { asyncHandler } from '../utils/asyncHandler.js'; // Will create this

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
};

const accessCookieOptions = {
  ...cookieOptions,
  maxAge: 15 * 60 * 1000 // 15 minutes
};

const refreshCookieOptions = {
  ...cookieOptions,
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
};

class AuthController {
  register = asyncHandler(async (req, res) => {
    const user = await AuthService.register(req.body);
    return res.status(HTTP_STATUS.CREATED).json(
      new ApiResponse(HTTP_STATUS.CREATED, 'User registered successfully', { user })
    );
  });

  login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const { user, accessToken, refreshToken } = await AuthService.login(email, password);

    // Set cookies
    res.cookie('accessToken', accessToken, accessCookieOptions);
    res.cookie('refreshToken', refreshToken, refreshCookieOptions);

    return res.status(HTTP_STATUS.OK).json(
      new ApiResponse(HTTP_STATUS.OK, 'Login successful', { user })
    );
  });

  logout = asyncHandler(async (req, res) => {
    if (req.user) {
      await AuthService.logout(req.user._id);
    }

    res.clearCookie('accessToken', cookieOptions);
    res.clearCookie('refreshToken', cookieOptions);

    return res.status(HTTP_STATUS.OK).json(
      new ApiResponse(HTTP_STATUS.OK, 'Logged out successfully')
    );
  });

  refreshToken = asyncHandler(async (req, res) => {
    // The authenticate middleware (when given a specific flag) will pass the user ID from the refresh token
    const oldRefreshToken = req.cookies.refreshToken;
    
    // Verify happens in service/middleware
    const tokenObj = { id: req.user._id, raw: oldRefreshToken };
    
    const { accessToken, refreshToken } = await AuthService.refreshToken(tokenObj);

    res.cookie('accessToken', accessToken, accessCookieOptions);
    res.cookie('refreshToken', refreshToken, refreshCookieOptions);

    return res.status(HTTP_STATUS.OK).json(
      new ApiResponse(HTTP_STATUS.OK, 'Tokens refreshed successfully')
    );
  });

  forgotPassword = asyncHandler(async (req, res) => {
    // Placeholder as per instructions (not fully requested to implement email logic)
    return res.status(HTTP_STATUS.OK).json(
      new ApiResponse(HTTP_STATUS.OK, 'Password reset link sent to email')
    );
  });

  resetPassword = asyncHandler(async (req, res) => {
    // Placeholder
    return res.status(HTTP_STATUS.OK).json(
      new ApiResponse(HTTP_STATUS.OK, 'Password reset successful')
    );
  });

  changePassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    await AuthService.changePassword(req.user._id, oldPassword, newPassword);

    return res.status(HTTP_STATUS.OK).json(
      new ApiResponse(HTTP_STATUS.OK, 'Password changed successfully')
    );
  });

  getProfile = asyncHandler(async (req, res) => {
    return res.status(HTTP_STATUS.OK).json(
      new ApiResponse(HTTP_STATUS.OK, 'Profile retrieved successfully', { user: req.user })
    );
  });
}

export default new AuthController();
