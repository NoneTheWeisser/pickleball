/**
 * Wraps async route handlers so unhandled promise rejections
 * are caught and passed to Express error middleware.
 */
export function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}

export default asyncHandler
