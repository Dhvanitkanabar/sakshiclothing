import { verifyToken } from '../utils/tokenHelper.js';
import AuthRepository from '../repositories/auth.repository.js';
import ApiError from '../utils/ApiError.js';
import { HTTP_STATUS } from '../constants/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const authenticate = asyncHandler(async (req, res, next) => {
  const token = req.cookies.accessToken;

  if (!token) {
    throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Access denied. No token provided.');
  }

  const decoded = verifyToken(token, false);
  if (!decoded) {
    throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Invalid or expired access token.');
  }

  const user = await AuthRepository.findUserById(decoded.id);
  if (!user) {
    throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'User no longer exists.');
  }

  if (user.isBlocked) {
    throw new ApiError(HTTP_STATUS.FORBIDDEN, 'Your account has been blocked.');
  }

  if (!user.isActive) {
    throw new ApiError(HTTP_STATUS.FORBIDDEN, 'Your account is inactive.');
  }

  req.user = user;
  next();
});

// Specifically for refresh token endpoint
export const authenticateRefresh = asyncHandler(async (req, res, next) => {
  const token = req.cookies.refreshToken;

  if (!token) {
    throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'No refresh token provided.');
  }

  const decoded = verifyToken(token, true);
  if (!decoded) {
    throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Invalid or expired refresh token.');
  }

  const user = await AuthRepository.findUserById(decoded.id);
  if (!user) {
    throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'User no longer exists.');
  }

  req.user = user;
  next();
});
