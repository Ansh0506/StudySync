// Converts unmatched routes into a normal error object for the global handler.
export const notFoundHandler = (req, res, next) => {
    const error = new Error(`Route Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error);
};

// Sends a consistent error response and hides stack traces in production.
export const errorHandler = (err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    
    res.status(statusCode).json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
};
