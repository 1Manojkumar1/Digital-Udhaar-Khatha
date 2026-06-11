import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';

import connectDB from './config/db.js';
import initReminderJob from './jobs/reminderJob.js';
import errorMiddleware from './middlewares/errorMiddleware.js';

import authRoutes from './routes/authRoutes.js';
import customerRoutes from './routes/customerRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js';
import reminderRoutes from './routes/reminderRoutes.js';
import statementRoutes from './routes/statementRoutes.js';


const app = express();

// Create uploads folder if it doesn't exist
const uploadsDir = './uploads';
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
  console.log('Created /uploads directory for transaction receipts.');
}

// Global Middlewares
const allowedOrigins = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : '*';
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));
app.use(express.json());

// Serve uploaded receipts static files
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Health check / root route
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Digital Udhaar Khatha API is running' });
});

// Register API Routes
app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/reminders', reminderRoutes);
app.use('/api/statements', statementRoutes);

// Catch-all 404 Route
app.use((req, res, next) => {
  res.status(404);
  next(new Error(`API Route not found: ${req.originalUrl}`));
});

// Global Error Handler Middleware
app.use(errorMiddleware);

// Boot server and connect DB
const startServer = async () => {
  try {
    await connectDB();
    
    // Start background job scheduler
    initReminderJob();

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}...`);
    });
  } catch (error) {
    console.error('Server startup failed:', error);
    process.exit(1);
  }
};

startServer();