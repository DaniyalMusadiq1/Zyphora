import { body } from 'express-validator';

export const registerValidator = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please enter a valid email'),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
    .withMessage('Password must contain uppercase, lowercase, number and special character'),
  body('username')
    .optional()
    .trim()
    .matches(/^[a-zA-Z0-9_-]{3,24}$/)
    .withMessage('Username must be 3-24 characters (letters, numbers, -, _)'),
  body('referral_code')
    .optional()
    .trim(),
  body('device_id')
    .optional()
    .trim(),
];

export const loginValidator = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please enter a valid email'),
  body('password')
    .notEmpty().withMessage('Password is required'),
  body('device_id')
    .optional()
    .trim(),
];
