/**
 * Database Connection Module
 *
 * Provides a single async function to connect to MongoDB using Mongoose.
 * Called once at server startup. If the connection fails the process exits
 * immediately because the application cannot function without a database.
 */

import mongoose from 'mongoose';

/**
 * Connects to the MongoDB instance defined by the DB_URL environment variable.
 *
 * Uses mongoose.connect() which returns a connection promise. On success the
 * connection host is logged for debugging. On failure the error is logged and
 * process.exit(1) is called to stop the server — a failed DB connection is
 * fatal and unrecoverable at runtime.
 *
 * @returns {Promise<mongoose.Connection>} The active Mongoose connection object.
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.DB_URL);
    console.log(`Database connected successfully: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error('Error connecting to Database:', error);
    process.exit(1);
  }
};

export default connectDB;
