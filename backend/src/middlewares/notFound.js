import ApiError from '../utils/ApiError.js';

/**
 * Catches all requests directed to non-existent API routes and throws a 404 ApiError.
 */
const notFound = (req, res, next) => {
  const error = new ApiError(404, `Route not found - ${req.originalUrl}`);
  next(error);
};

export default notFound;
