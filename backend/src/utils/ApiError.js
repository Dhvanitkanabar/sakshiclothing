/**
 * Custom Error class to handle API failures with consistent formatting.
 * Extends the built-in JavaScript Error object to include HTTP status codes.
 */
class ApiError extends Error {
  constructor(
    statusCode,
    message = 'Something went wrong',
    errors = [],
    stack = ''
  ) {
    super(message);
    this.statusCode = statusCode;
    this.data = null; // API standard responses format
    this.message = message;
    this.success = false; // Indicates error state
    this.errors = errors; // Detailed list of errors (e.g. validator messages)

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export default ApiError;
