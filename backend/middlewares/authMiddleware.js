/**
 * Authentication Middleware
 *
 * Intercepts incoming requests and verifies the JWT token from the
 * Authorization header. If valid, attaches the full user object
 * (minus password) to req.user so downstream handlers can access it.
 *
 * In development mode (NODE_ENV !== 'production'), if token verification
 * fails the middleware falls back to auto-authenticating as the first
 * user in the database. This speeds up local testing but is disabled
 * in production for security.
 */

import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const authMiddleware = async (req, res, next) => {
  let token;

  // Check for the standard "Bearer <token>" authorization header.
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Extract the token portion after "Bearer "
      token = req.headers.authorization.split(' ')[1];

      if (!token) {
        throw new Error('No token provided');
      }

      // Verify the token signature and extract the payload (contains user id)
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Fetch the user from DB, excluding the password hash
      req.user = await User.findById(decoded.id).select('-password');
      
      if (!req.user) {
        throw new Error('User not found');
      }

      return next();
    } catch (error) {
      console.error(`Token authentication failed: ${error.message}`);
      
      // In production, reject the request immediately.
      if (process.env.NODE_ENV === 'production') {
        return res.status(401).json({ success: false, error: 'Not authorized, invalid token' });
      }

      // ── Dev Fallback ────────────────────────────────────────────────
      // Auto-login as the first user so developers don't need to
      // re-authenticate after every server restart.
      try {
        const fallbackUser = await User.findOne().select('-password');
        if (fallbackUser) {
          req.user = fallbackUser;
          console.log(`[DEV] Auto-authenticated as user: ${fallbackUser.email}`);
          return next();
        }
      } catch (dbError) {
        console.error('Error fetching fallback user:', dbError.message);
      }
    }
  }

  // No valid token found and no fallback available — reject the request.
  if (!req.user) {
    return res.status(401).json({ success: false, error: 'Not authorized, no token provided' });
  }
};

export default authMiddleware;
