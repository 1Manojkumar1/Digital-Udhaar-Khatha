/**
 * Reminder Service
 *
 * Handles the business logic for scheduling, evaluating, and completing
 * payment reminders. Used by both the cron job (reminderJob.js) and the
 * manual reminder routes.
 *
 * Key responsibilities:
 *   - computeNextDate: calculate when a reminder should next fire based
 *     on its recurrence pattern (daily, weekly, monthly, custom cron, etc.)
 *   - checkConditions: verify that a reminder should actually be sent
 *     (balance still outstanding, enough time since last tx/reminder)
 *   - shouldCompleteReminder: determine if a reminder has reached its
 *     end-of-life (max count hit, or balance fully cleared)
 */

import cronParser from 'cron-parser';
import Customer from '../models/Customer.js';
import Transaction from '../models/Transaction.js';
import Reminder from '../models/Reminder.js';

// Maps day abbreviations to JavaScript's getDay() numbers (0 = Sunday).
const DAYS_OF_WEEK_MAP = { sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6 };

/**
 * Calculates the next scheduled date for a recurring reminder.
 *
 * For sub-day units (minutes, hours), it simply adds the interval in ms.
 * For day-based patterns it applies calendar-aware logic:
 *   - daily: adds N days
 *   - weekly: finds the next matching day of the week, respecting multi-week intervals
 *   - biweekly: adds N × 14 days
 *   - monthly: jumps to the same day next month (handles month-end clamping)
 *   - custom: parses a cron expression via cron-parser
 *
 * @param {Object} reminder  - The reminder document
 * @param {Date}   fromDate  - Base date to compute from (default: now)
 * @returns {Date|null} Next date, or null if no recurrence
 */
const computeNextDate = (reminder, fromDate = new Date()) => {
  const pattern = reminder.recurrencePattern || 'none';
  if (pattern === 'none') return null;

  const interval = reminder.recurrenceInterval || 1;
  const unit = reminder.recurrenceIntervalUnit || 'days';
  const msMap = { seconds: 1000, minutes: 60000, hours: 3600000, days: 86400000 };

  const next = new Date(fromDate);

  // For sub-day intervals, use simple millisecond addition.
  if (unit !== 'days') {
    next.setTime(next.getTime() + interval * msMap[unit]);
    return next;
  }

  // Day-based recurrence patterns
  switch (pattern) {
    case 'daily': {
      next.setDate(next.getDate() + interval);
      return next;
    }
    case 'weekly': {
      const days = reminder.recurrenceDaysOfWeek;
      if (days && days.length > 0) {
        // Find the next matching day of the week
        const currentDay = next.getDay();
        const dayNumbers = days.map(d => DAYS_OF_WEEK_MAP[d]).sort((a, b) => a - b);
        const nextDay = dayNumbers.find(d => d > currentDay);
        if (nextDay !== undefined) {
          next.setDate(next.getDate() + (nextDay - currentDay));
        } else {
          // Wrap to next week
          next.setDate(next.getDate() + (7 - currentDay) + dayNumbers[0]);
        }
        // Apply multi-week interval
        if (interval > 1) {
          next.setDate(next.getDate() + (interval - 1) * 7);
        }
      } else {
        next.setDate(next.getDate() + interval * 7);
      }
      return next;
    }
    case 'biweekly': {
      next.setDate(next.getDate() + interval * 14);
      return next;
    }
    case 'monthly': {
      const day = reminder.recurrenceDayOfMonth || fromDate.getDate();
      next.setMonth(next.getMonth() + interval);
      // Clamp to the last day of the target month (handles months with fewer days)
      next.setDate(Math.min(day, new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate()));
      return next;
    }
    case 'custom': {
      // Parse a standard cron expression (e.g. "0 9 * * 1,3,5")
      if (!reminder.recurrenceCron) return null;
      try {
        const interval_ = cronParser.parseExpression(reminder.recurrenceCron, { currentDate: fromDate });
        return interval_.next().toDate();
      } catch {
        return null;
      }
    }
    default:
      return null;
  }
};

/**
 * Checks whether a reminder is allowed to be sent right now.
 *
 * Evaluates three conditions:
 *   1. Customer's netBalance must meet the reminder's minBalance threshold
 *   2. Enough days must have passed since the customer's last transaction
 *   3. Enough days must have passed since the last reminder was sent
 *
 * @param {Object} reminder - The reminder document
 * @returns {Object} { allowed: boolean, customer?: Customer, reason?: string }
 */
const checkConditions = async (reminder) => {
  const customer = await Customer.findById(reminder.customer);
  if (!customer) return { allowed: false, reason: 'Customer not found' };

  // Balance check — skip if customer has already paid off their debt
  if (customer.netBalance < (reminder.minBalance || 1)) {
    return { allowed: false, reason: 'balance_cleared' };
  }

  // Check minimum days since last transaction
  if (reminder.minDaysSinceTransaction > 0) {
    const lastTx = await Transaction.findOne({ customer: customer._id })
      .sort({ date: -1 })
      .select('date');
    if (lastTx) {
      const daysSince = (Date.now() - new Date(lastTx.date).getTime()) / (1000 * 60 * 60 * 24);
      if (daysSince < reminder.minDaysSinceTransaction) {
        return { allowed: false, reason: 'min_days_since_tx' };
      }
    }
  }

  // Check minimum days since last reminder was sent
  if (reminder.minDaysSinceLastReminder > 0) {
    const lastSent = await Reminder.findOne({
      customer: customer._id,
      status: { $in: ['sent', 'completed'] },
    }).sort({ updatedAt: -1 }).select('updatedAt');
    if (lastSent) {
      const daysSince = (Date.now() - new Date(lastSent.updatedAt).getTime()) / (1000 * 60 * 60 * 24);
      if (daysSince < reminder.minDaysSinceLastReminder) {
        return { allowed: false, reason: 'min_days_since_last' };
      }
    }
  }

  return { allowed: true, customer };
};

/**
 * Determines whether a reminder should be marked as completed.
 *
 * A reminder completes when:
 *   - The customer's balance is zero or negative (debt cleared), OR
 *   - The reminder has been sent the maximum number of times
 *
 * @param {Object} reminder - The reminder document
 * @returns {boolean} True if the reminder should stop recurring
 */
const shouldCompleteReminder = async (reminder) => {
  const customer = await Customer.findById(reminder.customer);
  if (!customer) return true;

  // Balance cleared — no need to keep reminding
  if (customer.netBalance <= 0) return true;

  // Max send count reached
  if (reminder.maxRecurrenceCount !== null && reminder.recurrenceSentCount >= reminder.maxRecurrenceCount) {
    return true;
  }

  return false;
};

export default {
  computeNextDate,
  checkConditions,
  shouldCompleteReminder,
};
