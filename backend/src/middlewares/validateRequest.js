import ApiError from '../utils/ApiError.js';
import { HTTP_STATUS } from '../constants/index.js';

export const validateRequest = (schema) => {
  return (req, res, next) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      // Zod error format uses .issues
      if (error.issues && Array.isArray(error.issues)) {
        const errors = error.issues.map(err => ({
          field: err.path ? err.path.join('.') : 'unknown',
          message: err.message
        }));
        console.error('Validation failed for body:', req.body, 'Errors:', errors);
        const apiError = new ApiError(HTTP_STATUS.BAD_REQUEST, 'Validation Error', errors);
        return next(apiError);
      }
      
      // Not a Zod validation error
      next(new ApiError(HTTP_STATUS.BAD_REQUEST, error.message || 'Invalid request data'));
    }
  };
};
