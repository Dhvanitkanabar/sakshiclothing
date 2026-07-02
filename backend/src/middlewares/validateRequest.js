import ApiError from '../utils/ApiError.js';
import { HTTP_STATUS } from '../constants/index.js';

export const validateRequest = (schema) => {
  return (req, res, next) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      // Zod error format
      const errors = error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }));
      
      const apiError = new ApiError(HTTP_STATUS.BAD_REQUEST, 'Validation Error', errors);
      next(apiError);
    }
  };
};
