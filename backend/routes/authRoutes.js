/**
 * Authentication Routes
 * ---------------------
 * Handles user registration, login, and profile retrieval for shopkeepers.
 * All routes use express-validator for input sanitization and validation,
 * and a shared rate limiter to prevent brute-force attacks on auth endpoints.
 *
 * Endpoints:
 *   POST /api/auth/register  – Create a new shopkeeper account
 *   POST /api/auth/login     – Authenticate and receive user data
 *   GET  /api/auth/profile   – Retrieve the authenticated user's profile
 */

import express from 'express';
import { body, validationResult } from 'express-validator';
import rateLimit from 'express-rate-limit';
import authService from '../services/authService.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

/**
 * Rate limiter applied to auth routes.
 * Limits each IP to 10 requests per 15-minute window to mitigate brute-force
 * login/registration attempts. Returns a clear JSON error on limit breach.
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes in milliseconds
  max: 10,                   // max 10 requests per window
  message: { success: false, error: 'Too many login attempts. Please try again after 15 minutes.' },
  standardHeaders: true,     // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false,      // Disable the older `X-RateLimit-*` headers
});

/**
 * Shared validation middleware.
 * Checks the result of express-validator chains attached to a route.
 * Returns 400 with a joined list of all validation error messages on failure.
 */
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

// ─── POST /register ──────────────────────────────────────────────────────────
// Registers a new shopkeeper. Accepts name, email, password, phone, shopName,
// and an optional currency. The authService hashes the password and persists
// the user, then returns the created user data (without the password hash).
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

// ─── POST /login ─────────────────────────────────────────────────────────────
// Authenticates a shopkeeper with email + password. The authService verifies
// credentials, generates a JWT, and returns the token alongside user metadata.
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

// ─── GET /profile ────────────────────────────────────────────────────────────
// Returns the currently authenticated shopkeeper's profile.
// The authMiddleware decodes the JWT and attaches req.user before this
// handler runs. No DB lookup needed here — the middleware already resolved it.
router.get('/profile', authMiddleware, async (req, res, next) => {
  try {
    res.status(200).json({ success: true, data: req.user });
  } catch (error) {
    next(error);
  }
});

export default router;
