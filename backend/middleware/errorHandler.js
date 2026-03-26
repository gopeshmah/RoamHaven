// Global Error Handler Middleware
// This must be the LAST middleware in app.js — Express recognizes it by the 4 arguments (err, req, res, next)

const errorHandler = (err, req, res, next) => {
  // Default values for unexpected errors
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  // In development, send full error details for debugging
  if (process.env.NODE_ENV === "development") {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      stack: err.stack,
      error: err,
    });
  }

  // In production, hide internal error details from clients
  if (err.isOperational) {
    // Operational errors — safe to send message to client
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }

  // Programming or unknown errors — don't leak details
  console.error("💥 UNEXPECTED ERROR:", err);
  return res.status(500).json({
    status: "error",
    message: "Something went wrong on the server.",
  });
};

module.exports = errorHandler;
