/**
 * Global Error Handler Middleware
 *
 * Catches all errors passed via next(error) from route handlers.
 * Uses the status code already set on the response (by the route handler)
 * or defaults to 500 if no status was set (i.e. res.statusCode is still 200).
 *
 * In production, the stack trace is stripped from the response to avoid
 * leaking internal implementation details to clients.
 */

const errorMiddleware = (err, req, res, next) => {
  console.error('Error details:', err);

  // If the route handler didn't set a status code, default to 500.
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);

  res.json({
    success: false,
    error: err.message || 'Internal Server Error',
    // Only expose stack traces in development for debugging.
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

export default errorMiddleware;
