/**
 * Reminder Model
 *
 * Represents a scheduled payment reminder for a specific customer.
 * Reminders are processed by a cron job that runs every minute — it picks
 * up reminders where scheduledDate <= now and status is "pending".
 *
 * After each send, the cron job either:
 *   - Marks the reminder as "completed" (if max count reached or balance cleared)
 *   - Reschedules it to the next recurrence date
 *
 * Conditions like minBalance, minDaysSinceTransaction, and
 * minDaysSinceLastReminder are checked before each send to avoid
 * spamming customers unnecessarily.
 */

import mongoose from 'mongoose';

const reminderSchema = new mongoose.Schema(
  {
    // ── References ─────────────────────────────────────────────────────
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    // ── Scheduling ─────────────────────────────────────────────────────
    // When this reminder should next be sent.
    scheduledDate: {
      type: Date,
      required: [true, 'Scheduled date is required'],
    },
    // The email body text sent to the customer.
    message: {
      type: String,
      required: [true, 'Reminder message is required'],
      trim: true,
    },

    // ── Status ─────────────────────────────────────────────────────────
    // pending → waiting to be sent
    // sent    → email was dispatched
    // failed  → email sending failed
    // completed → finished (balance cleared or max count reached)
    status: {
      type: String,
      enum: ['pending', 'sent', 'failed', 'completed'],
      default: 'pending',
      index: true,
    },

    // ── Recurrence Settings ────────────────────────────────────────────
    // Pattern determines how the next date is calculated.
    recurrencePattern: {
      type: String,
      enum: ['none', 'daily', 'weekly', 'biweekly', 'monthly', 'custom'],
      default: 'none',
    },
    // How many units between each recurrence (e.g. every 2 days).
    recurrenceInterval: {
      type: Number,
      default: 1,
    },
    recurrenceIntervalUnit: {
      type: String,
      enum: ['minutes', 'hours', 'days'],
      default: 'days',
    },
    // For "weekly" pattern — which days of the week to send on.
    recurrenceDaysOfWeek: [{
      type: String,
      enum: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'],
    }],
    // For "monthly" pattern — which day of the month.
    recurrenceDayOfMonth: {
      type: Number,
      min: 1,
      max: 31,
    },
    // For "custom" pattern — a cron expression string.
    recurrenceCron: {
      type: String,
    },

    // ── Limits & Conditions ────────────────────────────────────────────
    // How many times this reminder has been sent so far.
    recurrenceSentCount: {
      type: Number,
      default: 0,
    },
    // Max times to send before auto-completing (null = unlimited).
    maxRecurrenceCount: {
      type: Number,
      default: null,
    },
    // Only send if customer owes at least this amount.
    minBalance: {
      type: Number,
      default: 1,
    },
    // Only send if this many days have passed since the last transaction.
    minDaysSinceTransaction: {
      type: Number,
      default: 0,
    },
    // Only send if this many days have passed since the last reminder.
    minDaysSinceLastReminder: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Migrate legacy "seconds" unit to "minutes" before validation.
reminderSchema.pre('validate', function () {
  if (this.recurrenceIntervalUnit === 'seconds') this.recurrenceIntervalUnit = 'minutes';
});

const Reminder = mongoose.model('Reminder', reminderSchema);
export default Reminder;
