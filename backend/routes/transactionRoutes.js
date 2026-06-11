import express from 'express';
import multer from 'multer';
import path from 'path';
import transactionService from '../services/transactionService.js';
import Transaction from '../models/Transaction.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

// Setup Multer Storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

// File filter (allow images only)
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const ext = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mime = allowedTypes.test(file.mimetype);

  if (ext && mime) {
    return cb(null, true);
  }
  cb(new Error('Only images (JPEG/JPG/PNG/GIF) are allowed!'));
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
  fileFilter,
});

// Get transactions for a customer (with pagination)
router.get('/customer/:customerId', authMiddleware, async (req, res, next) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(200, Math.max(1, parseInt(limit, 10) || 50));
    const skip = (pageNum - 1) * limitNum;

    const query = {
      customer: req.params.customerId,
      user: req.user._id,
    };

    const [transactions, total] = await Promise.all([
      Transaction.find(query).sort({ date: -1 }).skip(skip).limit(limitNum),
      Transaction.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      count: transactions.length,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      data: transactions,
    });
  } catch (error) {
    next(error);
  }
});

// Create transaction (supports receipt image upload)
router.post('/', authMiddleware, upload.single('receipt'), async (req, res, next) => {
  try {
    const { customerId, amount, type, description, date } = req.body;
    
    if (!customerId || !amount || !type) {
      return res.status(400).json({ success: false, error: 'Please provide customerId, amount, and type (give/take)' });
    }

    const receiptImage = req.file ? `/uploads/${req.file.filename}` : undefined;

    const transaction = await transactionService.addTransaction({
      customerId,
      userId: req.user._id,
      amount: Number(amount),
      type,
      description,
      date: date ? new Date(date) : undefined,
      receiptImage,
    });

    res.status(201).json({ success: true, data: transaction });
  } catch (error) {
    res.status(400);
    next(error);
  }
});

// Update transaction details
router.put('/:id', authMiddleware, upload.single('receipt'), async (req, res, next) => {
  try {
    const { amount, type, description, date } = req.body;
    const updateData = {};

    if (amount !== undefined) updateData.amount = Number(amount);
    if (type !== undefined) updateData.type = type;
    if (description !== undefined) updateData.description = description;
    if (date !== undefined) updateData.date = new Date(date);
    if (req.file) updateData.receiptImage = `/uploads/${req.file.filename}`;

    const transaction = await transactionService.updateTransaction(
      req.params.id,
      req.user._id,
      updateData
    );

    res.status(200).json({ success: true, data: transaction });
  } catch (error) {
    res.status(400);
    next(error);
  }
});

// Delete transaction
router.delete('/:id', authMiddleware, async (req, res, next) => {
  try {
    const result = await transactionService.deleteTransaction(req.params.id, req.user._id);
    res.status(200).json({ success: true, message: 'Transaction deleted and customer balance adjusted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;
