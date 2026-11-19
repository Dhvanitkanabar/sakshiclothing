import AuthService from '../services/auth.service.js';
import ApiResponse from '../utils/ApiResponse.js';
import { HTTP_STATUS, API_MESSAGES } from '../constants/index.js';
import { asyncHandler } from '../utils/asyncHandler.js'; // Will create this

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
};

const accessCookieOptions = {
  ...cookieOptions,
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
};

const refreshCookieOptions = {
  ...cookieOptions,
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
};

class AuthController {
  register = asyncHandler(async (req, res) => {
    return res.status(HTTP_STATUS.BAD_REQUEST).json(
      new ApiResponse(
        HTTP_STATUS.BAD_REQUEST,
        null,
        'Customer registration is managed exclusively via Clerk. Please use the /auth portal on the storefront.'
      )
    );
  });

  login = asyncHandler(async (req, res) => {
    return res.status(HTTP_STATUS.BAD_REQUEST).json(
      new ApiResponse(
        HTTP_STATUS.BAD_REQUEST,
        null,
        'Customer authentication is managed exclusively via Clerk. For administrator access, use /api/v1/auth/admin-login.'
      )
    );
  });

  adminLogin = asyncHandler(async (req, res) => {
    const rawEmail = (req.body.email || '').trim();
    const rawPassword = (req.body.password || '').trim();

    if (!rawEmail || !rawPassword) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        new ApiResponse(HTTP_STATUS.BAD_REQUEST, null, 'Email and password are required')
      );
    }

    const email = rawEmail.toLowerCase();
    const { default: User } = await import('../models/User.model.js');
    const { generateTokens } = await import('../utils/tokenHelper.js');

    // Query user by email with admin or superadmin role
    let user = await User.findOne({
      email,
      role: { $in: ['admin', 'superadmin'] }
    }).select('+password');

    // Bootstrap initial admin if configured in env and no admin user exists
    if (!user && process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
      if (email === process.env.ADMIN_EMAIL.toLowerCase() && rawPassword === process.env.ADMIN_PASSWORD) {
        user = await User.create({
          email,
          fullName: 'System Administrator',
          role: 'superadmin',
          password: rawPassword,
          isActive: true,
          isBlocked: false
        });
        user = await User.findById(user._id).select('+password');
      }
    }

    if (!user || !user.password) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json(
        new ApiResponse(HTTP_STATUS.UNAUTHORIZED, null, 'Invalid admin credentials')
      );
    }

    const isMatch = await user.comparePassword(rawPassword);
    if (!isMatch) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json(
        new ApiResponse(HTTP_STATUS.UNAUTHORIZED, null, 'Invalid admin credentials')
      );
    }

    if (user.isBlocked) {
      return res.status(HTTP_STATUS.FORBIDDEN).json(
        new ApiResponse(HTTP_STATUS.FORBIDDEN, null, 'Your account has been blocked')
      );
    }

    if (!user.isActive) {
      return res.status(HTTP_STATUS.FORBIDDEN).json(
        new ApiResponse(HTTP_STATUS.FORBIDDEN, null, 'Your account is inactive')
      );
    }

    user.lastLogin = new Date();
    await user.save();

    const { accessToken, refreshToken } = generateTokens(user._id);

    // Set cookies
    res.cookie('accessToken', accessToken, accessCookieOptions);
    res.cookie('refreshToken', refreshToken, refreshCookieOptions);

    const userObj = user.toObject();
    delete userObj.password;
    delete userObj.refreshToken;

    return res.status(HTTP_STATUS.OK).json(
      new ApiResponse(HTTP_STATUS.OK, { user: userObj, accessToken }, 'Admin login successful')
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
      new ApiResponse(HTTP_STATUS.OK, { user: req.user }, 'Profile retrieved successfully')
    );
  });

  updateProfile = asyncHandler(async (req, res) => {
    const { phone, fullName } = req.body;
    const { default: User } = await import('../models/User.model.js');
    const updateData = {};
    if (phone !== undefined) updateData.phone = phone;
    if (fullName !== undefined) updateData.fullName = fullName;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updateData },
      { new: true, select: '-password -refreshToken' }
    );
    return res.status(HTTP_STATUS.OK).json(
      new ApiResponse(HTTP_STATUS.OK, { user }, 'Profile updated successfully')
    );
  });

  checkEmailExists = asyncHandler(async (req, res) => {
    const { email } = req.body;
    if (!email) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        new ApiResponse(HTTP_STATUS.BAD_REQUEST, null, 'Email is required')
      );
    }
    
    // We import User model directly or use a service
    // Let's use the User model since AuthService doesn't seem to have checkEmail method explicitly exposed
    const { default: User } = await import('../models/User.model.js');
    const user = await User.findOne({ email: email.toLowerCase() });
    
    return res.status(HTTP_STATUS.OK).json(
      new ApiResponse(HTTP_STATUS.OK, { exists: !!user }, 'Email check completed')
    );
  });
}

export default new AuthController();
