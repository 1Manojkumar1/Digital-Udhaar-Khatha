/**
 * Customer Model
 *
 * Represents a person who owes money to (or has paid) a shopkeeper.
 * Each customer belongs to exactly one user (shopkeeper) and stores their
 * contact info, address, and current outstanding balance.
 *
 * The netBalance field is auto-managed by the transaction service — it
 * increases on "give" transactions and decreases on "take" transactions.
 *
 * Reminder configuration fields let each shopkeeper customize when and how
 * often reminders are sent to individual customers (delay before first
 * reminder, repeat interval, min balance threshold, etc.).
 */

import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema(
  {
    // ── Ownership ──────────────────────────────────────────────────────
    // Links this customer to the shopkeeper who created them.
    // Indexed for fast lookup of "all customers for user X".
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    // ── Basic Info ─────────────────────────────────────────────────────
    name: {
      type: String,
      required: [true, 'Customer name is required'],
    },
    phone: {
      type: String,
      required: [true, 'Customer phone number is required'],
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    address: {
      type: String,
    },

    // ── Balance ────────────────────────────────────────────────────────
    // netBalance = total given − total received.
    // Positive means the customer owes money; zero or negative means settled.
    netBalance: {
      type: Number,
      default: 0,
    },

    // ── Reminder Timing ────────────────────────────────────────────────
    // How long to wait before the first reminder fires.
    // Legacy field kept for backward compatibility with old clients.
    reminderIntervalDays: {
      type: Number,
      default: 7,
    },
    // Flexible interval value (pairs with reminderIntervalUnit).
    reminderIntervalValue: {
      type: Number,
      default: 7,
    },
    // Time unit for the interval: minutes, hours, or days.
    reminderIntervalUnit: {
      type: String,
      enum: ['minutes', 'hours', 'days'],
      default: 'days',
    },

    // ── Reminder Pattern ───────────────────────────────────────────────
    // Determines the recurrence schedule for automated reminders.
    reminderPattern: {
      type: String,
      enum: ['none', 'daily', 'weekly', 'biweekly', 'monthly', 'custom'],
      default: 'daily',
    },
    // Delivery channels (currently only email is implemented).
    reminderChannels: {
      type: [String],
      default: ['email'],
    },
    // Max number of reminders to send (null = unlimited).
    reminderMaxCount: {
      type: Number,
      default: null,
    },
    // Minimum outstanding balance required to trigger a reminder.
    reminderMinBalance: {
      type: Number,
      default: 1,
    },
    // Minimum days since the last transaction before sending a reminder.
    reminderMinDaysSinceTransaction: {
      type: Number,
      default: 0,
    },
    // Minimum days since the last reminder was sent.
    reminderMinDaysSinceLastReminder: {
      type: Number,
      default: 0,
    },

    // ── Repeat Interval ────────────────────────────────────────────────
    // How often the reminder repeats after the first one fires.
    // e.g. repeatIntervalValue=2, repeatIntervalUnit='days' means every 2 days.
    repeatIntervalValue: {
      type: Number,
      default: 1,
    },
    repeatIntervalUnit: {
      type: String,
      enum: ['minutes', 'hours', 'days'],
      default: 'days',
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt automatically
  }
);

// ── Pre-save Hook ──────────────────────────────────────────────────────
// Migrates legacy "seconds" values to "minutes" so old data stays valid
// without a separate migration script.
customerSchema.pre('validate', function () {
  if (this.reminderIntervalUnit === 'seconds') this.reminderIntervalUnit = 'minutes';
  if (this.repeatIntervalUnit === 'seconds') this.repeatIntervalUnit = 'minutes';
});

// ── Unique Constraint ──────────────────────────────────────────────────
// Prevents duplicate phone numbers for the same shopkeeper. Two different
// shopkeepers can have a customer with the same phone number.
customerSchema.index({ user: 1, phone: 1 }, { unique: true });

const Customer = mongoose.model('Customer', customerSchema);
export default Customer;
