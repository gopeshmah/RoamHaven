// Custom Error class for operational errors
// Usage: throw new AppError("Home not found", 404);
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true; // Distinguishes from programming bugs

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
