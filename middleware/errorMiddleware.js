
/**
 * Centralized error handling middleware for the Express application.
 * It catches errors passed via `next(error)` and sends a standardized
 * 500 Internal Server Error response. This prevents stack traces from
 * leaking to the client in production.
 *
 * @param {Error} err - The error object.
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 * @param {function} next - The Express next middleware function.
 */
function errorMiddleware(err, req, res, next) {
    console.error("An unexpected error occurred:", err.stack);

    // If headers have already been sent, delegate to the default handler
    if (res.headersSent) {
        return next(err);
    }
    
    res.status(500).json({
        error: 'An internal server error occurred. Please try again later.'
    });
}

module.exports = errorMiddleware;
