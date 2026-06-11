import express from 'express';
import Reminder from '../models/Reminder.js';
import Customer from '../models/Customer.js';
import User from '../models/User.js';
import notificationService from '../services/notificationService.js';
import email from '../config/email.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

// Get reminder stats (today sent count)
router.get('/stats', authMiddleware, async (req, res, next) => {
  try {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [todayCount, monthCount] = await Promise.all([
      Reminder.countDocuments({
        user: req.user._id,
        status: 'sent',
        updatedAt: { $gte: startOfToday },
      }),
      Reminder.countDocuments({
        user: req.user._id,
        status: 'sent',
        updatedAt: { $gte: startOfMonth },
      }),
    ]);

    res.status(200).json({
      success: true,
      data: { todayMessages: todayCount, monthlyMessages: monthCount },
    });
  } catch (error) {
    next(error);
  }
});

// Get reminders for a customer
router.get('/customer/:customerId', authMiddleware, async (req, res, next) => {
  try {
    const reminders = await Reminder.find({
      customer: req.params.customerId,
      user: req.user._id,
    })
      .populate('customer', 'name phone netBalance')
      .sort({ scheduledDate: 1 });

    res.status(200).json({ success: true, count: reminders.length, data: reminders });
  } catch (error) {
    next(error);
  }
});

// Get all reminders for the logged-in user (dashboard)
router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const { status, page = 1, limit = 50 } = req.query;
    const query = { user: req.user._id };
    if (status) query.status = status;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 50));
    const skip = (pageNum - 1) * limitNum;

    const [reminders, total] = await Promise.all([
      Reminder.find(query)
        .populate('customer', 'name phone netBalance')
        .sort({ scheduledDate: -1 })
        .skip(skip)
        .limit(limitNum),
      Reminder.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      count: reminders.length,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      data: reminders,
    });
  } catch (error) {
    next(error);
  }
});

// Schedule a new reminder (manual)
router.post('/', authMiddleware, async (req, res, next) => {
  try {
    const { customerId, scheduledDate, message, recurrencePattern, recurrenceInterval, recurrenceIntervalUnit, recurrenceDaysOfWeek, recurrenceDayOfMonth, recurrenceCron, maxRecurrenceCount, minBalance, minDaysSinceTransaction, minDaysSinceLastReminder } = req.body;

    if (!customerId || !scheduledDate || !message) {
      return res.status(400).json({ success: false, error: 'Please provide customerId, scheduledDate, and message' });
    }

    const reminder = await Reminder.create({
      customer: customerId,
      user: req.user._id,
      scheduledDate: new Date(scheduledDate),
      message,
      status: 'pending',
      recurrencePattern: recurrencePattern || 'none',
      recurrenceInterval: recurrenceInterval || 1,
      recurrenceIntervalUnit: recurrenceIntervalUnit || 'days',
      recurrenceDaysOfWeek: recurrenceDaysOfWeek || [],
      recurrenceDayOfMonth: recurrenceDayOfMonth || undefined,
      recurrenceCron: recurrenceCron || undefined,
      maxRecurrenceCount: maxRecurrenceCount || null,
      minBalance: minBalance !== undefined ? minBalance : 1,
      minDaysSinceTransaction: minDaysSinceTransaction || 0,
      minDaysSinceLastReminder: minDaysSinceLastReminder || 0,
    });

    res.status(201).json({ success: true, data: reminder });
  } catch (error) {
    res.status(400);
    next(error);
  }
});

// Send a reminder immediately
router.post('/:id/send-now', authMiddleware, async (req, res, next) => {
  try {
    const reminder = await Reminder.findOne({ _id: req.params.id, user: req.user._id });
    if (!reminder) {
      return res.status(404).json({ success: false, error: 'Reminder not found' });
    }

    await notificationService.sendNotification(reminder);

    reminder.status = 'sent';
    reminder.recurrenceSentCount = (reminder.recurrenceSentCount || 0) + 1;
    await reminder.save();

    const populated = await Reminder.findById(reminder._id).populate('customer', 'name phone netBalance');

    res.status(200).json({ success: true, message: 'Reminder sent successfully', data: populated });
  } catch (error) {
    try {
      const reminder = await Reminder.findOne({ _id: req.params.id, user: req.user._id });
      if (reminder) {
        reminder.status = 'failed';
        await reminder.save();
      }
    } catch (_) {}
    next(error);
  }
});

// Batch schedule reminders — uses each customer's individual interval settings
router.post('/batch', authMiddleware, async (req, res, next) => {
  try {
    const { message } = req.body;
    const msMap = { seconds: 1000, minutes: 60000, hours: 3600000, days: 86400000 };
    const user = await User.findById(req.user._id);
    const currency = user?.currency || 'INR';
    const shopName = user?.shopName || 'our store';
    const capitalizedShopName = shopName.replace(/\b\w/g, c => c.toUpperCase());

    const customers = await Customer.find({
      user: req.user._id,
      netBalance: { $gt: 0 },
    });

    let created = 0;
    for (const customer of customers) {
      const existing = await Reminder.findOne({
        customer: customer._id,
        user: req.user._id,
        status: 'pending',
      });
      if (existing) continue;

      // Use customer's own "start after" delay for initial scheduled date
      const delayValue = customer.reminderIntervalValue ?? 1;
      const delayUnit = customer.reminderIntervalUnit || 'days';
      const scheduledDate = new Date(Date.now() + delayValue * (msMap[delayUnit] || 86400000));

      // Use customer's own "repeat every" for recurrence
      const repeatValue = customer.repeatIntervalValue ?? 1;
      const repeatUnit = customer.repeatIntervalUnit || 'days';

      const defaultMessage = `Dear ${customer.name}, you have an outstanding balance of ${currency} ${customer.netBalance} at ${capitalizedShopName}. Please clear your dues. Thank you!`;

      await Reminder.create({
        customer: customer._id,
        user: req.user._id,
        scheduledDate,
        message: message || defaultMessage,
        status: 'pending',
        recurrencePattern: 'daily',
        recurrenceInterval: repeatValue,
        recurrenceIntervalUnit: repeatUnit,
        minBalance: customer.reminderMinBalance !== undefined ? customer.reminderMinBalance : 1,
      });
      created++;
    }

    res.status(201).json({
      success: true,
      message: `Scheduled reminders for ${created} customer(s) using their individual intervals`,
      count: created,
    });
  } catch (error) {
    res.status(400);
    next(error);
  }
});

// Delete/Cancel a scheduled reminder — recreates automatically if customer still owes
router.delete('/:id', authMiddleware, async (req, res, next) => {
  try {
    const reminder = await Reminder.findOne({ _id: req.params.id, user: req.user._id });
    if (!reminder) {
      return res.status(404).json({ success: false, error: 'Reminder not found' });
    }

    const customerId = reminder.customer;
    await Reminder.deleteOne({ _id: req.params.id });

    // Check if customer still has outstanding balance and recreate
    const customer = await Customer.findOne({ _id: customerId, user: req.user._id });
    if (customer && customer.netBalance > 0) {
      const user = await User.findById(req.user._id);
      const msMap = { seconds: 1000, minutes: 60000, hours: 3600000, days: 86400000 };
      const currency = user?.currency || 'INR';

      const delayValue = customer.reminderIntervalValue ?? 1;
      const delayUnit = customer.reminderIntervalUnit || 'days';
      const scheduledDate = new Date(Date.now() + delayValue * (msMap[delayUnit] || 86400000));

      const repeatValue = customer.repeatIntervalValue ?? 1;
      const repeatUnit = customer.repeatIntervalUnit || 'days';

      await Reminder.create({
        customer: customer._id,
        user: req.user._id,
        scheduledDate,
        message: `Dear ${customer.name}, you have an outstanding balance of ${currency} ${customer.netBalance} at ${(user?.shopName || 'our store').replace(/\b\w/g, c => c.toUpperCase())}. Please clear your dues. Thank you!`,
        status: 'pending',
        recurrencePattern: 'daily',
        recurrenceInterval: repeatValue,
        recurrenceIntervalUnit: repeatUnit,
        minBalance: customer.reminderMinBalance !== undefined ? customer.reminderMinBalance : 1,
      });
      console.log(`[Reminder] Recreated reminder for ${customer.name} after deletion — balance still active.`);
    }

    res.status(200).json({ success: true, message: 'Reminder cancelled and recreated if balance still outstanding' });
  } catch (error) {
    next(error);
  }
});

// Send a test email reminder to a customer
router.post('/send-test', authMiddleware, async (req, res, next) => {
  try {
    const { customerId } = req.body;
    if (!customerId) {
      return res.status(400).json({ success: false, error: 'customerId is required' });
    }

    const customer = await Customer.findOne({ _id: customerId, user: req.user._id });
    if (!customer) {
      return res.status(404).json({ success: false, error: 'Customer not found' });
    }

    if (!customer.email) {
      return res.status(400).json({ success: false, error: `${customer.name} has no email address. Add one in their profile.` });
    }

    const shopName = req.user.shopName || 'Udhar Khatha';
    const currency = req.user.currency || 'INR';
    const capitalizedShopName = shopName.replace(/\b\w/g, c => c.toUpperCase());
    const text = `Dear ${customer.name},\n\nThis is a preview email sent from ${capitalizedShopName}.\n\nContact: ${req.user.phone}\n\nThank you for using our services.`;
    const html = email.makeHtml({ customerName: customer.name, shopName: capitalizedShopName, balance: customer.netBalance, currency, phone: req.user.phone });
    const subject = `Payment Reminder from ${capitalizedShopName}`;

    const result = await email.sendEmail(customer.email, subject, text, html, { fromName: capitalizedShopName, replyTo: req.user.email });

    res.status(200).json({
      success: true,
      message: 'Preview email sent',
      data: { customer: customer.name, email: customer.email, result },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
