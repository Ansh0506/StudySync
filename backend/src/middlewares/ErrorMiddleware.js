// Handle requests to routes that don't exist
export const notFoundHandler = (req, res, next) => {
    const error = new Error(`Route Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error); // Passes the error to the errorHandler below
};

// Global error catcher
export const errorHandler = (err, req, res, next) => {
    // If the status code is still 200, change it to 500 (Server Error)
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    
    res.status(statusCode).json({
        message: err.message,
        // Only show the stack trace in development mode for security
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
};