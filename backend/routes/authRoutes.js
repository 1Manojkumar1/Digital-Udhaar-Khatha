import express from 'express';
import { body, validationResult } from 'express-validator';
import rateLimit from 'express-rate-limit';
import authService from '../services/authService.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

// Rate limiter for auth routes: 10 attempts per 15 minutes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, error: 'Too many login attempts. Please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: errors.array().map(e => e.msg).join('. '),
    });
  }
  next();
};

// Register new shopkeeper
router.post('/register',
  authLimiter,
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').trim().isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('phone').trim().notEmpty().withMessage('Phone number is required'),
  body('shopName').trim().notEmpty().withMessage('Shop name is required'),
  validate,
  async (req, res, next) => {
    try {
      const { name, email, password, phone, shopName, currency } = req.body;
      const userData = await authService.registerUser({ name, email, password, phone, shopName, currency });
      res.status(201).json({ success: true, data: userData });
    } catch (error) {
      res.status(400);
      next(error);
    }
  }
);

// Login shopkeeper
router.post('/login',
  authLimiter,
  body('email').trim().isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
  validate,
  async (req, res, next) => {
    try {
      const { email, password } = req.body;
      const userData = await authService.loginUser({ email, password });
      res.status(200).json({ success: true, data: userData });
    } catch (error) {
      res.status(400);
      next(error);
    }
  }
);

// Get current shopkeeper profile
router.get('/profile', authMiddleware, async (req, res, next) => {
  try {
    res.status(200).json({ success: true, data: req.user });
  } catch (error) {
    next(error);
  }
});

export default router;
