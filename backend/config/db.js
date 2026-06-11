import mongoose from 'mongoose';

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
