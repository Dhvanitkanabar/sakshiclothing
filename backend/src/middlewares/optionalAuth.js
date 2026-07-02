import { verifyToken } from '../utils/tokenHelper.js';
import AuthRepository from '../repositories/auth.repository.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const optionalAuthenticate = asyncHandler(async (req, res, next) => {
  const token = req.cookies.accessToken;

  if (token) {
    const decoded = verifyToken(token, false);
    if (decoded) {
      const user = await AuthRepository.findUserById(decoded.id);
      if (user && user.isActive && !user.isBlocked) {
        req.user = user;
      }
    }
  }

  next();
});
