import ApiError from '../utils/ApiError.js';
import { HTTP_STATUS } from '../constants/index.js';

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      throw new ApiError(
        HTTP_STATUS.FORBIDDEN, 
        'You do not have permission to perform this action'
      );
    }
    next();
  };
};
