import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const authMiddleware = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      if (!token) {
        throw new Error('No token provided');
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.id).select('-password');
      
      if (!req.user) {
        throw new Error('User not found');
      }

      return next();
    } catch (error) {
      console.error(`Token authentication failed: ${error.message}`);
      
      if (process.env.NODE_ENV === 'production') {
        return res.status(401).json({ success: false, error: 'Not authorized, invalid token' });
      }

      // Dev fallback: auto-authenticate as first user
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

  if (!req.user) {
    return res.status(401).json({ success: false, error: 'Not authorized, no token provided' });
  }
};

export default authMiddleware;
