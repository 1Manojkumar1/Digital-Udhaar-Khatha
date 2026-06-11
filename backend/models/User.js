/**
 * User Model
 *
 * Represents a shopkeeper / business owner who uses the Digital Udhar
 * Khatha (credit ledger) application. Each user has a unique email and
 * shop name, and stores their preferred currency for displaying balances.
 *
 * Passwords are stored as-is in the schema; hashing is handled by the
 * auth controller before saving.
 */

import mongoose from 'mongoose';

/**
 * Mongoose schema for the User collection.
 *
 * Fields:
 *   - name      : Display name of the shopkeeper (required).
 *   - email     : Login email, unique, trimmed, and lowercased to prevent
 *                 duplicate accounts caused by casing differences.
 *   - password  : Hashed password (required). Never returned by queries
 *                 that use .select('-password').
 *   - phone     : Contact phone number (required).
 *   - shopName  : Name of the business / shop (required).
 *   - currency  : ISO currency code used for monetary displays. Defaults to
 *                 INR (Indian Rupee) which matches the app's primary market.
 *
 * The `timestamps` option auto-manages `createdAt` and `updatedAt` fields.
 */
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
    },
    shopName: {
      type: String,
      required: [true, 'Shop name is required'],
    },
    currency: {
      type: String,
      default: 'INR',
    },
  },
  {
    timestamps: true,
  }
);

// Compile and export the model. The model name 'User' maps to the 'users'
// collection in MongoDB (Mongoose pluralizes automatically).
const User = mongoose.model('User', userSchema);
export default User;
