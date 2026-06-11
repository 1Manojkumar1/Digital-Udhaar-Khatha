/**
 * Customer Routes
 *
 * CRUD operations for the shopkeeper's customer directory.
 * All routes require authentication via JWT.
 *
 * Endpoints:
 *   GET    /               - List customers with search & pagination
 *   GET    /:id            - Get a single customer by ID
 *   POST   /               - Create a new customer
 *   PUT    /:id            - Update customer details
 *   DELETE /:id            - Delete customer and all related data
 */

import express from 'express';
import Customer from '../models/Customer.js';
import Transaction from '../models/Transaction.js';
import Reminder from '../models/Reminder.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

// ─── GET / ─────────────────────────────────────────────────────────────
// Returns a paginated list of customers belonging to the authenticated user.
// Supports optional search by name or phone (case-insensitive regex).
router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    let query = { user: req.user._id };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    const [customers, total] = await Promise.all([
      Customer.find(query).sort({ name: 1 }).skip(skip).limit(limitNum),
      Customer.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      count: customers.length,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      data: customers,
    });
  } catch (error) {
    next(error);
  }
});

// ─── GET /:id ──────────────────────────────────────────────────────────
// Returns a single customer record. Ensures the customer belongs to the
// authenticated user (prevents unauthorized access to other shopkeepers' data).
router.get('/:id', authMiddleware, async (req, res, next) => {
  try {
    const customer = await Customer.findOne({ _id: req.params.id, user: req.user._id });
    if (!customer) {
      return res.status(404).json({ success: false, error: 'Customer not found' });
    }
    res.status(200).json({ success: true, data: customer });
  } catch (error) {
    next(error);
  }
});

// ─── POST / ────────────────────────────────────────────────────────────
// Creates a new customer with optional reminder configuration.
// Checks for duplicate phone numbers within the same shopkeeper's account.
router.post('/', authMiddleware, async (req, res, next) => {
  try {
    const { name, phone, email, address, reminderIntervalValue, reminderIntervalUnit, reminderIntervalDays, reminderPattern, reminderMaxCount, reminderMinBalance, reminderMinDaysSinceTransaction, reminderMinDaysSinceLastReminder, repeatIntervalValue, repeatIntervalUnit } = req.body;

    // Legacy field handling – if unit is days and value provided, keep compatibility
    const intervalDays = reminderIntervalUnit === 'days' && reminderIntervalValue !== undefined
      ? Number(reminderIntervalValue)
      : reminderIntervalDays !== undefined
        ? Number(reminderIntervalDays)
        : undefined;

    // Check if customer already exists for this shopkeeper
    const customerExists = await Customer.findOne({ user: req.user._id, phone });
    if (customerExists) {
      return res.status(400).json({ success: false, error: 'Customer with this phone number already exists' });
    }

    const customer = await Customer.create({
      user: req.user._id,
      name,
      phone,
      email,
      address,
      // New flexible fields
      reminderIntervalValue: reminderIntervalValue !== undefined ? Number(reminderIntervalValue) : undefined,
      reminderIntervalUnit: reminderIntervalUnit || undefined,
      // Legacy field for backward compatibility
      reminderIntervalDays: intervalDays,
      reminderPattern: reminderPattern || 'daily',
      reminderMaxCount: reminderMaxCount || null,
      reminderMinBalance: reminderMinBalance !== undefined ? reminderMinBalance : 1,
      reminderMinDaysSinceTransaction: reminderMinDaysSinceTransaction || 0,
      reminderMinDaysSinceLastReminder: reminderMinDaysSinceLastReminder || 0,
      repeatIntervalValue: repeatIntervalValue !== undefined ? Number(repeatIntervalValue) : 1,
      repeatIntervalUnit: repeatIntervalUnit || 'days',
    });

    res.status(201).json({ success: true, data: customer });
  } catch (error) {
    res.status(400);
    next(error);
  }
});

// ─── PUT /:id ──────────────────────────────────────────────────────────
// Updates customer profile and reminder settings. Only provided fields
// are modified (partial update pattern). Phone uniqueness is re-checked.
router.put('/:id', authMiddleware, async (req, res, next) => {
  try {
    const { name, phone, email, address, reminderIntervalDays, reminderIntervalValue, reminderIntervalUnit, reminderPattern, reminderMaxCount, reminderMinBalance, reminderMinDaysSinceTransaction, reminderMinDaysSinceLastReminder, repeatIntervalValue, repeatIntervalUnit } = req.body;
    
    const customer = await Customer.findOne({ _id: req.params.id, user: req.user._id });
    if (!customer) {
      return res.status(404).json({ success: false, error: 'Customer not found' });
    }

    if (name !== undefined) customer.name = name;
    if (phone !== undefined) {
      const existingCustomer = await Customer.findOne({ user: req.user._id, phone, _id: { $ne: req.params.id } });
      if (existingCustomer) {
        return res.status(400).json({ success: false, error: 'Phone number already in use by another customer' });
      }
      customer.phone = phone;
    }
    if (email !== undefined) customer.email = email;
    if (address !== undefined) customer.address = address;
    if (reminderIntervalValue !== undefined) {
      customer.reminderIntervalValue = Number(reminderIntervalValue);
    }
    if (reminderIntervalUnit) {
      customer.reminderIntervalUnit = reminderIntervalUnit;
    }
    if (reminderIntervalDays !== undefined) {
      customer.reminderIntervalDays = Number(reminderIntervalDays);
    } else if (reminderIntervalUnit === 'days' && reminderIntervalValue !== undefined) {
      customer.reminderIntervalDays = Number(reminderIntervalValue);
    }
    // Intelligent reminder defaults
    if (reminderPattern !== undefined) customer.reminderPattern = reminderPattern;
    if (reminderMaxCount !== undefined) customer.reminderMaxCount = reminderMaxCount;
    if (reminderMinBalance !== undefined) customer.reminderMinBalance = reminderMinBalance;
    if (reminderMinDaysSinceTransaction !== undefined) customer.reminderMinDaysSinceTransaction = reminderMinDaysSinceTransaction;
    if (reminderMinDaysSinceLastReminder !== undefined) customer.reminderMinDaysSinceLastReminder = reminderMinDaysSinceLastReminder;
    if (repeatIntervalValue !== undefined) customer.repeatIntervalValue = Number(repeatIntervalValue);
    if (repeatIntervalUnit !== undefined) customer.repeatIntervalUnit = repeatIntervalUnit;

    await customer.save();
    res.status(200).json({ success: true, data: customer });
  } catch (error) {
    res.status(400);
    next(error);
  }
});

// ─── DELETE /:id ───────────────────────────────────────────────────────
// Removes a customer and cascades the deletion to their transactions and
// reminders. This is a hard delete — data cannot be recovered.
router.delete('/:id', authMiddleware, async (req, res, next) => {
  try {
    const customer = await Customer.findOne({ _id: req.params.id, user: req.user._id });
    if (!customer) {
      return res.status(404).json({ success: false, error: 'Customer not found' });
    }

    // Delete customer transactions and reminders
    await Transaction.deleteMany({ customer: req.params.id, user: req.user._id });
    await Reminder.deleteMany({ customer: req.params.id, user: req.user._id });
    // Delete customer
    await Customer.deleteOne({ _id: req.params.id });

    res.status(200).json({ success: true, message: 'Customer and all associated transactions deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;
