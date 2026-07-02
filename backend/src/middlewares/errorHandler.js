import ApiError from '../utils/ApiError.js';
import logger from '../utils/logger.js';

/**
 * Catches all errors occurring throughout the Express application, formats them,
 * and sends a consistent JSON response.
 */
const errorHandler = (err, req, res, next) => {
  let error = err;

  // If the error is not a custom ApiError instance, wrap it
  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || (error.name === 'ValidationError' ? 400 : 500);
    const message = error.message || 'Internal Server Error';
    error = new ApiError(statusCode, message, error.errors || [], err.stack);
  }

  // Define response payload structure
  const response = {
    success: false,
    message: error.message,
    errors: error.errors,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack }) // Only show stack trace in dev mode
  };

  // Log error using winston
  logger.error(`[Error Handler] ${error.statusCode} - ${error.message}`, { stack: error.stack });

  // Respond to the client
  res.status(error.statusCode).json(response);
};

export default errorHandler;
