/**
 * AuthService
 * ----------
 * Handles user registration and login for the Digital Udhar Khatha application.
 * Responsible for:
 *   - Creating new shopkeeper accounts with securely hashed passwords
 *   - Authenticating existing users via email/password
 *   - Generating JWT tokens for session management
 *
 * All passwords are hashed using bcrypt before storage. Tokens are signed with
 * the server's JWT_SECRET environment variable and expire after 30 days.
 */

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Registers a new user (shopkeeper) in the system.
 *
 * @param {Object} params - Registration details
 * @param {string} params.name     - Full name of the shopkeeper
 * @param {string} params.email    - Unique email address (used for login)
 * @param {string} params.password - Plain-text password (will be hashed)
 * @param {string} params.phone    - Contact phone number
 * @param {string} params.shopName - Name of the shop/business
 * @param {string} params.currency - Preferred currency code (e.g. 'INR', 'USD')
 * @returns {Object} User object (excluding password) with a signed JWT token
 * @throws {Error} If a user with the same email already exists
 */
const registerUser = async ({ name, email, password, phone, shopName, currency }) => {
  // Check for duplicate email — each email must be unique across all accounts
  const userExists = await User.findOne({ email });
  if (userExists) {
    throw new Error('User already exists');
  }

  // Hash the password using bcrypt with a salt rounds of 10.
  // 10 rounds is a standard balance between security and performance.
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Persist the new user to the database
  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    phone,
    shopName,
    currency,
  });

  // Return user profile data (password hash is never exposed to the client)
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    shopName: user.shopName,
    currency: user.currency,
    token: generateToken(user._id),
  };
};

/**
 * Authenticates an existing user by verifying email and password.
 *
 * @param {Object} params
 * @param {string} params.email    - Email address of the account
 * @param {string} params.password - Plain-text password to verify
 * @returns {Object} User profile with a signed JWT token
 * @throws {Error} If email or password is incorrect
 */
const loginUser = async ({ email, password }) => {
  // Look up the user by email
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error('Invalid email or password');
  }

  // Compare the provided password against the stored bcrypt hash
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error('Invalid email or password');
  }

  // Return authenticated user profile with token
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    shopName: user.shopName,
    currency: user.currency,
    token: generateToken(user._id),
  };
};

/**
 * Generates a signed JWT token for the authenticated user.
 * The token embeds the user's MongoDB _id and expires after 30 days.
 *
 * @param {string} id - The user's MongoDB _id
 * @returns {string} Signed JWT token string
 * @throws {Error} If JWT_SECRET environment variable is not configured
 */
const generateToken = (id) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured');
  }
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

export default {
  registerUser,
  loginUser,
};
