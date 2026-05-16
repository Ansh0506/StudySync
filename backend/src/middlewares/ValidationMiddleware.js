import { body, validationResult } from 'express-validator';

// Helper function to handle the validation results
const checkValidation = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // Return a 400 Bad Request with the array of errors
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

// Rules for Registration
export const validateRegister = [
    body('name')
        .notEmpty().withMessage('Name is required')
        .trim().escape(),
    body('email')
        .isEmail().withMessage('Please provide a valid email address')
        .normalizeEmail(),
    body('password')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    checkValidation
];

// Rules for Login
export const validateLogin = [
    body('email')
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please provide a valid email address'),
    body('password')
        .notEmpty().withMessage('Password is required'),
    checkValidation
];