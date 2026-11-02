import ApiError from '../utils/ApiError.js';
import logger from '../utils/logger.js';

/**
 * Catches all errors occurring throughout the Express application, formats them,
 * and sends a consistent JSON response.
 */
const errorHandler = (err, req, res, next) => {
  let error = err;

  // Handle MongoDB Duplicate Key (E11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    const value = err.keyValue ? err.keyValue[field] : '';
    error = new ApiError(409, `A record with ${field} "${value}" already exists. Please choose a different ${field}.`);
  } else if (err.name === 'CastError') {
    error = new ApiError(400, `Invalid ID format for ${err.path}: ${err.value}`);
  } else if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors || {}).map((e) => e.message);
    error = new ApiError(400, `Validation Failed: ${messages.join(', ')}`, messages);
  } else if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || 500;
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
