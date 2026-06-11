import cronParser from 'cron-parser';
import Customer from '../models/Customer.js';
import Transaction from '../models/Transaction.js';
import Reminder from '../models/Reminder.js';

const DAYS_OF_WEEK_MAP = { sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6 };

const computeNextDate = (reminder, fromDate = new Date()) => {
  const pattern = reminder.recurrencePattern || 'none';
  if (pattern === 'none') return null;

  const interval = reminder.recurrenceInterval || 1;
  const unit = reminder.recurrenceIntervalUnit || 'days';
  const msMap = { seconds: 1000, minutes: 60000, hours: 3600000, days: 86400000 };

  const next = new Date(fromDate);

  // For sub-day units, use simple ms-based addition regardless of pattern
  if (unit !== 'days') {
    next.setTime(next.getTime() + interval * msMap[unit]);
    return next;
  }

  // Day-based pattern logic
  switch (pattern) {
    case 'daily': {
      next.setDate(next.getDate() + interval);
      return next;
    }
    case 'weekly': {
      const days = reminder.recurrenceDaysOfWeek;
      if (days && days.length > 0) {
        const currentDay = next.getDay();
        const dayNumbers = days.map(d => DAYS_OF_WEEK_MAP[d]).sort((a, b) => a - b);
        const nextDay = dayNumbers.find(d => d > currentDay);
        if (nextDay !== undefined) {
          const diff = nextDay - currentDay;
          next.setDate(next.getDate() + diff);
        } else {
          const diff = (7 - currentDay) + dayNumbers[0];
          next.setDate(next.getDate() + diff);
        }
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
      next.setDate(Math.min(day, new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate()));
      return next;
    }
    case 'custom': {
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

const checkConditions = async (reminder) => {
  const customer = await Customer.findById(reminder.customer);
  if (!customer) return { allowed: false, reason: 'Customer not found' };

  if (customer.netBalance < (reminder.minBalance || 1)) {
    return { allowed: false, reason: 'balance_cleared' };
  }

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

const shouldCompleteReminder = async (reminder) => {
  const customer = await Customer.findById(reminder.customer);
  if (!customer) return true;

  if (customer.netBalance <= 0) return true;

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
