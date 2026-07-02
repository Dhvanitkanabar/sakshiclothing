import AuthRepository from '../repositories/auth.repository.js';
import ApiError from '../utils/ApiError.js';
import { generateTokens } from '../utils/tokenHelper.js';
import { HTTP_STATUS } from '../constants/index.js';

class AuthService {
  async register(userData) {
    const existingUser = await AuthRepository.findUserByEmail(userData.email);
    if (existingUser) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Email is already registered');
    }

    const user = await AuthRepository.createUser(userData);
    
    // Convert to object and remove password
    const userObj = user.toObject();
    delete userObj.password;
    
    return userObj;
  }

  async login(email, password) {
    const user = await AuthRepository.findUserByEmail(email, true);
    
    if (!user) {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Invalid credentials');
    }

    if (user.isBlocked) {
      throw new ApiError(HTTP_STATUS.FORBIDDEN, 'Your account has been blocked');
    }

    if (!user.isActive) {
      throw new ApiError(HTTP_STATUS.FORBIDDEN, 'Your account is inactive');
    }

    const isPasswordMatch = await user.comparePassword(password);
    
    if (!isPasswordMatch) {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Invalid credentials');
    }

    const { accessToken, refreshToken } = generateTokens(user._id);

    // Save refresh token in DB
    await AuthRepository.updateRefreshToken(user._id, refreshToken);

    const userObj = user.toObject();
    delete userObj.password;
    delete userObj.refreshToken;

    return { user: userObj, accessToken, refreshToken };
  }

  async logout(userId) {
    await AuthRepository.removeRefreshToken(userId);
  }

  async refreshToken(token) {
    // Verified via middleware already, but we need to find user
    const user = await AuthRepository.findUserById(token.id).select('+refreshToken');
    
    if (!user || user.refreshToken !== token.raw) {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Invalid refresh token');
    }

    const { accessToken, refreshToken } = generateTokens(user._id);
    await AuthRepository.updateRefreshToken(user._id, refreshToken);

    return { accessToken, refreshToken };
  }

  async changePassword(userId, oldPassword, newPassword) {
    const user = await AuthRepository.findUserById(userId).select('+password');
    
    const isMatch = await user.comparePassword(oldPassword);
    if (!isMatch) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Incorrect old password');
    }

    user.password = newPassword;
    await user.save(); // Triggers hash
  }
}

export default new AuthService();
